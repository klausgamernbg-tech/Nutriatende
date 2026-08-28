-- ============================================================
-- Nutri Atende — Initial Schema Migration
-- Creates all tables, enums, indexes, RLS policies, and functions
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE perfil_usuario AS ENUM (
  'nutricionista', 'estagiario', 'recepcionista', 'admin'
);

CREATE TYPE status_paciente AS ENUM (
  'ativo', 'inativo', 'manutencao'
);

CREATE TYPE sexo_paciente AS ENUM (
  'M', 'F', 'Outro'
);

CREATE TYPE tipo_consulta AS ENUM (
  'primeira', 'retorno', 'avaliacao'
);

CREATE TYPE status_consulta AS ENUM (
  'agendada', 'confirmada', 'realizada', 'cancelada', 'nao_compareceu'
);

CREATE TYPE status_pagamento AS ENUM (
  'pago', 'pendente', 'parcial', 'isento'
);

CREATE TYPE status_plano_alimentar AS ENUM (
  'rascunho', 'ativo', 'finalizado', 'cancelado'
);

CREATE TYPE origem_diario AS ENUM (
  'manual', 'app', 'integracao'
);

CREATE TYPE metodo_avaliacao AS ENUM (
  'manual', 'bioimpedancia', 'dobras_cutaneas', 'dexa'
);

CREATE TYPE tipo_transacao AS ENUM (
  'sessao', 'pacote', 'promocao'
);

CREATE TYPE status_transacao AS ENUM (
  'pendente', 'pago', 'parcial', 'cancelado'
);

CREATE TYPE tipo_dispositivo AS ENUM (
  'balanza', 'monitor_atividade', 'glicometro', 'cgm'
);

CREATE TYPE remetente_mensagem AS ENUM (
  'paciente', 'nutricionista', 'sistema'
);

CREATE TYPE plano_clinica AS ENUM (
  'basico', 'profissional', 'clinica'
);

CREATE TYPE tipo_relatorio AS ENUM (
  'paciente_individual', 'gerencial', 'financeiro'
);

CREATE TYPE frequencia_relatorio AS ENUM (
  'sob_demanda', 'semanal', 'mensal', 'trimestral'
);

-- ============================================================
-- HELPER FUNCTIONS (no table dependencies)
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================
-- TABLES
-- ============================================================

-- 1. CLINICA
CREATE TABLE clinica (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  endereco JSONB,
  configuracoes JSONB DEFAULT '{}'::jsonb,
  plano plano_clinica DEFAULT 'basico',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER clinica_updated_at
  BEFORE UPDATE ON clinica
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. USUARIO_SISTEMA
CREATE TABLE usuario_sistema (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  clinica_id UUID NOT NULL REFERENCES clinica(id) ON DELETE RESTRICT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  perfil perfil_usuario NOT NULL,
  permissoes JSONB DEFAULT '{}'::jsonb,
  avatar_url TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER usuario_sistema_updated_at
  BEFORE UPDATE ON usuario_sistema
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_usuario_sistema_clinica ON usuario_sistema(clinica_id);
CREATE UNIQUE INDEX idx_usuario_sistema_email ON usuario_sistema(email);

-- ============================================================
-- HELPER FUNCTION (depends on usuario_sistema)
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_clinica_id()
RETURNS UUID AS $$
  SELECT clinica_id FROM usuario_sistema WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3. PACIENTE
CREATE TABLE paciente (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinica(id) ON DELETE RESTRICT,
  nutricionista_responsavel_id UUID REFERENCES usuario_sistema(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  data_nascimento DATE,
  sexo sexo_paciente,
  telefone TEXT,
  email TEXT,
  cpf TEXT,
  foto_url TEXT,
  status status_paciente DEFAULT 'ativo',
  consentimento_lgpd BOOLEAN DEFAULT false,
  data_consentimento_lgpd TIMESTAMPTZ,
  consentimento_lgpd_versao TEXT,
  observacoes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER paciente_updated_at
  BEFORE UPDATE ON paciente
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_paciente_clinica ON paciente(clinica_id);
CREATE INDEX idx_paciente_nutricionista ON paciente(nutricionista_responsavel_id);
CREATE INDEX idx_paciente_status ON paciente(status);
CREATE INDEX idx_paciente_nome_trgm ON paciente USING gin(nome gin_trgm_ops);
CREATE INDEX idx_paciente_email ON paciente(email) WHERE email IS NOT NULL;
CREATE INDEX idx_paciente_cpf ON paciente(cpf) WHERE cpf IS NOT NULL;

-- 4. CONSULTA
CREATE TABLE consulta (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES paciente(id) ON DELETE RESTRICT,
  nutricionista_id UUID NOT NULL REFERENCES usuario_sistema(id) ON DELETE RESTRICT,
  clinica_id UUID NOT NULL REFERENCES clinica(id) ON DELETE RESTRICT,
  data_hora TIMESTAMPTZ NOT NULL,
  duracao_minutos INTEGER DEFAULT 60,
  tipo tipo_consulta NOT NULL,
  status status_consulta DEFAULT 'agendada',
  valor DECIMAL(10,2),
  status_pagamento status_pagamento DEFAULT 'pendente',
  valor_pago DECIMAL(10,2) DEFAULT 0,
  observacoes TEXT,
  lembrete_enviado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER consulta_updated_at
  BEFORE UPDATE ON consulta
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_consulta_paciente ON consulta(paciente_id, data_hora);
CREATE INDEX idx_consulta_nutricionista ON consulta(nutricionista_id, data_hora, status);
CREATE INDEX idx_consulta_clinica_data ON consulta(clinica_id, data_hora);
CREATE INDEX idx_consulta_status ON consulta(status);

-- 5. ANAMNESE (1:1 with consulta)
CREATE TABLE anamnese (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consulta_id UUID NOT NULL UNIQUE REFERENCES consulta(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES paciente(id) ON DELETE RESTRICT,
  queixa_principal TEXT,
  motivo_consulta TEXT,
  alimentacao_atual TEXT,
  rotina_diaria TEXT,
  restricoes_alimentares TEXT,
  alergias_intolerancias TEXT,
  historico_familiar TEXT,
  medicacoes_em_uso TEXT,
  atividade_fisica TEXT,
  sono TEXT,
  estresse TEXT,
  observacoes_livres TEXT,
  preenchido_publicamente BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER anamnese_updated_at
  BEFORE UPDATE ON anamnese
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_anamnese_paciente ON anamnese(paciente_id);

-- 6. MEDIDAS
CREATE TABLE medidas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consulta_id UUID NOT NULL REFERENCES consulta(id) ON DELETE RESTRICT,
  paciente_id UUID NOT NULL REFERENCES paciente(id) ON DELETE RESTRICT,
  data_avaliacao TIMESTAMPTZ NOT NULL,
  peso DECIMAL(5,2),
  altura DECIMAL(4,3),
  imc DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN peso IS NOT NULL AND altura IS NOT NULL AND altura > 0
      THEN ROUND(peso / (altura * altura), 2)
      ELSE NULL
    END
  ) STORED,
  circunferencia_cintura DECIMAL(5,2),
  circunferencia_quadril DECIMAL(5,2),
  circunferencia_braco DECIMAL(5,2),
  circunferencia_coxa DECIMAL(5,2),
  percentual_gordura DECIMAL(5,2),
  massa_magra DECIMAL(5,2),
  massa_gordura DECIMAL(5,2),
  agua_corporal DECIMAL(5,2),
  taxa_metabolica_basal DECIMAL(7,2),
  metodo_avaliacao metodo_avaliacao DEFAULT 'manual',
  detalhes_metodo JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER medidas_updated_at
  BEFORE UPDATE ON medidas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_medidas_paciente ON medidas(paciente_id, data_avaliacao DESC);
CREATE INDEX idx_medidas_consulta ON medidas(consulta_id);

-- 7. PLANO ALIMENTAR
CREATE TABLE plano_alimentar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES paciente(id) ON DELETE RESTRICT,
  consulta_id UUID REFERENCES consulta(id) ON DELETE SET NULL,
  nutricionista_id UUID NOT NULL REFERENCES usuario_sistema(id) ON DELETE RESTRICT,
  titulo TEXT,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  calorias_meta INTEGER,
  proteinas_meta DECIMAL(5,2),
  carboidratos_meta DECIMAL(5,2),
  gorduras_meta DECIMAL(5,2),
  fibras_meta DECIMAL(5,2),
  status status_plano_alimentar DEFAULT 'rascunho',
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER plano_alimentar_updated_at
  BEFORE UPDATE ON plano_alimentar
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_plano_alimentar_paciente ON plano_alimentar(paciente_id, status);
CREATE INDEX idx_plano_alimentar_nutricionista ON plano_alimentar(nutricionista_id);

-- 8. PLANO ALIMENTAR ITEM
CREATE TABLE plano_alimentar_item (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plano_alimentar_id UUID NOT NULL REFERENCES plano_alimentar(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL,
  refeicao TEXT NOT NULL,
  horario_sugerido TIME,
  alimento TEXT NOT NULL,
  quantidade TEXT,
  unidade TEXT,
  calorias DECIMAL(7,2),
  proteinas DECIMAL(5,2),
  carboidratos DECIMAL(5,2),
  gorduras DECIMAL(5,2),
  substituicoes JSONB,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_plano_item_plano ON plano_alimentar_item(plano_alimentar_id, ordem);

-- 9. DIARIO ALIMENTAR
CREATE TABLE diario_alimentar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES paciente(id) ON DELETE RESTRICT,
  data DATE NOT NULL,
  refeicao TEXT NOT NULL,
  alimento TEXT NOT NULL,
  quantidade TEXT,
  calorias DECIMAL(7,2),
  proteinas DECIMAL(5,2),
  carboidratos DECIMAL(5,2),
  gorduras DECIMAL(5,2),
  micronutrientes JSONB,
  origem origem_diario DEFAULT 'manual',
  foto_url TEXT,
  observacoes TEXT,
  sync_id UUID,
  versao INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER diario_alimentar_updated_at
  BEFORE UPDATE ON diario_alimentar
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_diario_paciente_data ON diario_alimentar(paciente_id, data DESC);
CREATE INDEX idx_diario_paciente_data_refeicao ON diario_alimentar(paciente_id, data, refeicao);
CREATE INDEX idx_diario_sync ON diario_alimentar(sync_id) WHERE sync_id IS NOT NULL;

-- 10. PROTOCOLO
CREATE TABLE protocolo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID REFERENCES clinica(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  campos_especificos JSONB NOT NULL DEFAULT '{}'::jsonb,
  template_plano JSONB,
  alertas JSONB DEFAULT '[]'::jsonb,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER protocolo_updated_at
  BEFORE UPDATE ON protocolo
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_protocolo_clinica ON protocolo(clinica_id) WHERE clinica_id IS NOT NULL;
CREATE INDEX idx_protocolo_nome ON protocolo(nome);

-- 11. PACIENTEPROTOCOLO
CREATE TABLE paciente_protocolo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES paciente(id) ON DELETE RESTRICT,
  protocolo_id UUID NOT NULL REFERENCES protocolo(id) ON DELETE RESTRICT,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  dados_especificos JSONB,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_paciente_protocolo_paciente ON paciente_protocolo(paciente_id, ativo);
CREATE INDEX idx_paciente_protocolo_protocolo ON paciente_protocolo(protocolo_id);

-- 12. MENSAGEM
CREATE TABLE mensagem (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES paciente(id) ON DELETE RESTRICT,
  nutricionista_id UUID NOT NULL REFERENCES usuario_sistema(id) ON DELETE RESTRICT,
  remetente_tipo remetente_mensagem NOT NULL,
  conteudo TEXT NOT NULL,
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mensagem_paciente ON mensagem(paciente_id, created_at DESC);
CREATE INDEX idx_mensagem_nutricionista ON mensagem(nutricionista_id, created_at DESC);

-- 13. TRANSACAO FINANCEIRA
CREATE TABLE transacao_financeira (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES paciente(id) ON DELETE RESTRICT,
  consulta_id UUID REFERENCES consulta(id) ON DELETE SET NULL,
  nutricionista_id UUID NOT NULL REFERENCES usuario_sistema(id) ON DELETE RESTRICT,
  clinica_id UUID NOT NULL REFERENCES clinica(id) ON DELETE RESTRICT,
  tipo tipo_transacao NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  valor_pago DECIMAL(10,2) DEFAULT 0,
  status status_transacao DEFAULT 'pendente',
  descricao TEXT,
  data_vencimento DATE,
  data_pagamento DATE,
  metodo_pagamento TEXT,
  recibo_numero INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER transacao_financeira_updated_at
  BEFORE UPDATE ON transacao_financeira
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_transacao_paciente ON transacao_financeira(paciente_id, created_at DESC);
CREATE INDEX idx_transacao_clinica ON transacao_financeira(clinica_id, status);
CREATE INDEX idx_transacao_nutricionista ON transacao_financeira(nutricionista_id, created_at DESC);

-- 14. PACOTE CONSULTA
CREATE TABLE pacote_consulta (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES paciente(id) ON DELETE RESTRICT,
  total_sessoes INTEGER NOT NULL,
  sessoes_utilizadas INTEGER DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL,
  data_compra DATE NOT NULL,
  data_validade DATE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_pacote_paciente ON pacote_consulta(paciente_id, ativo);

-- 15. DISPOSITIVO INTEGRACAO
CREATE TABLE dispositivo_integracao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES paciente(id) ON DELETE RESTRICT,
  tipo tipo_dispositivo NOT NULL,
  fabricante TEXT,
  modelo TEXT,
  token_acesso TEXT,
  refresh_token TEXT,
  ultimo_sync TIMESTAMPTZ,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_dispositivo_paciente ON dispositivo_integracao(paciente_id, ativo);

-- 16. DIARIO ATIVIDADE
CREATE TABLE diario_atividade (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES paciente(id) ON DELETE RESTRICT,
  data DATE NOT NULL,
  passos INTEGER,
  calorias_queimadas DECIMAL(7,2),
  minutos_ativos INTEGER,
  distancia_km DECIMAL(5,2),
  sono_minutos INTEGER,
  qualidade_sono DECIMAL(3,1),
  origem TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(paciente_id, data, origem)
);

CREATE INDEX idx_atividade_paciente ON diario_atividade(paciente_id, data DESC);

-- 17. DIARIO GLICEMIA
CREATE TABLE diario_glicemia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES paciente(id) ON DELETE RESTRICT,
  data_hora TIMESTAMPTZ NOT NULL,
  glicemia DECIMAL(5,1) NOT NULL,
  tipo TEXT,
  origem TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_glicemia_paciente ON diario_glicemia(paciente_id, data_hora DESC);

-- 18. AUDIT LOG
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinica(id) ON DELETE RESTRICT,
  usuario_id UUID REFERENCES usuario_sistema(id) ON DELETE SET NULL,
  acao TEXT NOT NULL,
  entidade TEXT NOT NULL,
  entidade_id UUID,
  dados_antes JSONB,
  dados_depois JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_clinica ON audit_log(clinica_id, created_at DESC);
CREATE INDEX idx_audit_entidade ON audit_log(entidade, entidade_id);
CREATE INDEX idx_audit_usuario ON audit_log(usuario_id, created_at DESC);

-- 19. RELATORIO CONFIG
CREATE TABLE relatorio_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinica(id) ON DELETE RESTRICT,
  usuario_id UUID NOT NULL REFERENCES usuario_sistema(id) ON DELETE RESTRICT,
  nome TEXT NOT NULL,
  tipo tipo_relatorio NOT NULL,
  configuracoes JSONB DEFAULT '{}'::jsonb,
  frequencia frequencia_relatorio DEFAULT 'sob_demanda',
  destinatarios TEXT[],
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER relatorio_config_updated_at
  BEFORE UPDATE ON relatorio_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_relatorio_clinica ON relatorio_config(clinica_id, ativo);

-- NOTIFICACAO
CREATE TABLE notificacao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuario_sistema(id) ON DELETE CASCADE,
  paciente_id UUID REFERENCES paciente(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT false,
  dados JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notificacao_usuario ON notificacao(usuario_id, lida, created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE clinica ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE paciente ENABLE ROW LEVEL SECURITY;
ALTER TABLE consulta ENABLE ROW LEVEL SECURITY;
ALTER TABLE anamnese ENABLE ROW LEVEL SECURITY;
ALTER TABLE medidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE plano_alimentar ENABLE ROW LEVEL SECURITY;
ALTER TABLE plano_alimentar_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE diario_alimentar ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocolo ENABLE ROW LEVEL SECURITY;
ALTER TABLE paciente_protocolo ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagem ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacao_financeira ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacote_consulta ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispositivo_integracao ENABLE ROW LEVEL SECURITY;
ALTER TABLE diario_atividade ENABLE ROW LEVEL SECURITY;
ALTER TABLE diario_glicemia ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorio_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacao ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- CLINICA
CREATE POLICY "usuarios_veem_sua_clinica" ON clinica
  FOR SELECT USING (id = get_user_clinica_id());

CREATE POLICY "admin_edita_clinica" ON clinica
  FOR UPDATE USING (
    id = get_user_clinica_id()
    AND EXISTS (
      SELECT 1 FROM usuario_sistema
      WHERE id = auth.uid() AND perfil = 'admin' AND clinica_id = id
    )
  );

-- USUARIO_SISTEMA
CREATE POLICY "usuarios_veem_mesma_clinica" ON usuario_sistema
  FOR SELECT USING (clinica_id = get_user_clinica_id());

CREATE POLICY "admin_gerencia_usuarios" ON usuario_sistema
  FOR ALL USING (
    clinica_id = get_user_clinica_id()
    AND EXISTS (
      SELECT 1 FROM usuario_sistema
      WHERE id = auth.uid() AND perfil = 'admin' AND clinica_id = get_user_clinica_id()
    )
  );

-- PACIENTE
CREATE POLICY "nutricionistas_veem_pacientes_clinica" ON paciente
  FOR SELECT USING (
    clinica_id = get_user_clinica_id()
    AND (
      EXISTS (
        SELECT 1 FROM usuario_sistema
        WHERE id = auth.uid()
        AND perfil IN ('nutricionista', 'recepcionista', 'admin')
        AND clinica_id = paciente.clinica_id
      )
      OR nutricionista_responsavel_id = auth.uid()
    )
  );

CREATE POLICY "usuarios_criam_pacientes" ON paciente
  FOR INSERT WITH CHECK (clinica_id = get_user_clinica_id());

CREATE POLICY "usuarios_editam_pacientes" ON paciente
  FOR UPDATE USING (
    clinica_id = get_user_clinica_id()
    AND EXISTS (
      SELECT 1 FROM usuario_sistema
      WHERE id = auth.uid()
      AND clinica_id = paciente.clinica_id
      AND (
        perfil IN ('nutricionista', 'recepcionista', 'admin')
        OR nutricionista_responsavel_id = auth.uid()
      )
    )
  );

-- CONSULTA
CREATE POLICY "usuarios_veem_consultas_clinica" ON consulta
  FOR SELECT USING (clinica_id = get_user_clinica_id());

CREATE POLICY "usuarios_criam_consultas" ON consulta
  FOR INSERT WITH CHECK (clinica_id = get_user_clinica_id());

CREATE POLICY "usuarios_editam_consultas" ON consulta
  FOR UPDATE USING (clinica_id = get_user_clinica_id());

-- ANAMNESE
CREATE POLICY "usuarios_veem_anamneses" ON anamnese
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = anamnese.paciente_id
      AND paciente.clinica_id = get_user_clinica_id()
    )
  );

CREATE POLICY "usuarios_criam_anamneses" ON anamnese
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = anamnese.paciente_id
      AND paciente.clinica_id = get_user_clinica_id()
    )
  );

CREATE POLICY "usuarios_editam_anamneses" ON anamnese
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = anamnese.paciente_id
      AND paciente.clinica_id = get_user_clinica_id()
    )
  );

-- MEDIDAS
CREATE POLICY "usuarios_veem_medidas" ON medidas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = medidas.paciente_id
      AND paciente.clinica_id = get_user_clinica_id()
    )
  );

CREATE POLICY "usuarios_criam_medidas" ON medidas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = medidas.paciente_id
      AND paciente.clinica_id = get_user_clinica_id()
    )
  );

-- PLANO ALIMENTAR
CREATE POLICY "usuarios_veem_planos" ON plano_alimentar
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = plano_alimentar.paciente_id
      AND paciente.clinica_id = get_user_clinica_id()
    )
  );

CREATE POLICY "usuarios_criam_planos" ON plano_alimentar
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = plano_alimentar.paciente_id
      AND paciente.clinica_id = get_user_clinica_id()
    )
  );

CREATE POLICY "usuarios_editam_planos" ON plano_alimentar
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = plano_alimentar.paciente_id
      AND paciente.clinica_id = get_user_clinica_id()
    )
  );

-- PLANO ALIMENTAR ITEM
CREATE POLICY "usuarios_veem_itens_plano" ON plano_alimentar_item
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM plano_alimentar pa
      JOIN paciente p ON p.id = pa.paciente_id
      WHERE pa.id = plano_alimentar_item.plano_alimentar_id
      AND p.clinica_id = get_user_clinica_id()
    )
  );

CREATE POLICY "usuarios_gerenciam_itens_plano" ON plano_alimentar_item
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM plano_alimentar pa
      JOIN paciente p ON p.id = pa.paciente_id
      WHERE pa.id = plano_alimentar_item.plano_alimentar_id
      AND p.clinica_id = get_user_clinica_id()
    )
  );

-- DIARIO ALIMENTAR
CREATE POLICY "usuarios_veem_diario" ON diario_alimentar
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = diario_alimentar.paciente_id
      AND paciente.clinica_id = get_user_clinica_id()
    )
  );

CREATE POLICY "usuarios_criam_diario" ON diario_alimentar
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = diario_alimentar.paciente_id
      AND paciente.clinica_id = get_user_clinica_id()
    )
  );

CREATE POLICY "usuarios_editam_diario" ON diario_alimentar
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = diario_alimentar.paciente_id
      AND paciente.clinica_id = get_user_clinica_id()
    )
  );

-- PROTOCOLO
CREATE POLICY "usuarios_veem_protocolos" ON protocolo
  FOR SELECT USING (
    clinica_id IS NULL
    OR clinica_id = get_user_clinica_id()
  );

CREATE POLICY "admin_gerencia_protocolos" ON protocolo
  FOR ALL USING (
    clinica_id = get_user_clinica_id()
    AND EXISTS (
      SELECT 1 FROM usuario_sistema
      WHERE id = auth.uid() AND perfil = 'admin' AND clinica_id = get_user_clinica_id()
    )
  );

-- PACIENTEPROTOCOLO
CREATE POLICY "usuarios_veem_paciente_protocolo" ON paciente_protocolo
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = paciente_protocolo.paciente_id
      AND paciente.clinica_id = get_user_clinica_id()
    )
  );

CREATE POLICY "usuarios_gerenciam_paciente_protocolo" ON paciente_protocolo
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = paciente_protocolo.paciente_id
      AND paciente.clinica_id = get_user_clinica_id()
    )
  );

-- MENSAGEM
CREATE POLICY "usuarios_veem_mensagens" ON mensagem
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = mensagem.paciente_id
      AND paciente.clinica_id = get_user_clinica_id()
    )
  );

CREATE POLICY "usuarios_enviam_mensagens" ON mensagem
  FOR INSERT WITH CHECK (
    nutricionista_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = mensagem.paciente_id
      AND paciente.clinica_id = get_user_clinica_id()
    )
  );

-- TRANSACAO FINANCEIRA
CREATE POLICY "usuarios_veem_transacoes" ON transacao_financeira
  FOR SELECT USING (clinica_id = get_user_clinica_id());

CREATE POLICY "usuarios_criam_transacoes" ON transacao_financeira
  FOR INSERT WITH CHECK (clinica_id = get_user_clinica_id());

CREATE POLICY "usuarios_editam_transacoes" ON transacao_financeira
  FOR UPDATE USING (clinica_id = get_user_clinica_id());

-- PACOTE CONSULTA
CREATE POLICY "usuarios_veem_pacotes" ON pacote_consulta
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = pacote_consulta.paciente_id
      AND paciente.clinica_id = get_user_clinica_id()
    )
  );

CREATE POLICY "usuarios_criam_pacotes" ON pacote_consulta
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = pacote_consulta.paciente_id
      AND paciente.clinica_id = get_user_clinica_id()
    )
  );

-- DISPOSITIVO INTEGRACAO
CREATE POLICY "usuarios_veem_dispositivos" ON dispositivo_integracao
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = dispositivo_integracao.paciente_id
      AND paciente.clinica_id = get_user_clinica_id()
    )
  );

-- DIARIO ATIVIDADE
CREATE POLICY "usuarios_veem_atividade" ON diario_atividade
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = diario_atividade.paciente_id
      AND paciente.clinica_id = get_user_clinica_id()
    )
  );

CREATE POLICY "usuarios_criam_atividade" ON diario_atividade
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = diario_atividade.paciente_id
      AND paciente.clinica_id = get_user_clinica_id()
    )
  );

-- DIARIO GLICEMIA
CREATE POLICY "usuarios_veem_glicemia" ON diario_glicemia
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = diario_glicemia.paciente_id
      AND paciente.clinica_id = get_user_clinica_id()
    )
  );

CREATE POLICY "usuarios_criam_glicemia" ON diario_glicemia
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = diario_glicemia.paciente_id
      AND paciente.clinica_id = get_user_clinica_id()
    )
  );

-- AUDIT LOG
CREATE POLICY "admins_veem_audit_log" ON audit_log
  FOR SELECT USING (
    clinica_id = get_user_clinica_id()
    AND EXISTS (
      SELECT 1 FROM usuario_sistema
      WHERE id = auth.uid() AND perfil = 'admin' AND clinica_id = get_user_clinica_id()
    )
  );

-- RELATORIO CONFIG
CREATE POLICY "usuarios_veem_relatorios" ON relatorio_config
  FOR SELECT USING (clinica_id = get_user_clinica_id());

CREATE POLICY "usuarios_gerenciam_relatorios" ON relatorio_config
  FOR ALL USING (clinica_id = get_user_clinica_id());

-- NOTIFICACAO
CREATE POLICY "usuarios_veem_notificacoes" ON notificacao
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "usuarios_marcam_notificacoes" ON notificacao
  FOR UPDATE USING (usuario_id = auth.uid());

-- PUBLIC API (for anamnese public form)
CREATE POLICY "public_anamnese_form" ON anamnese
  FOR SELECT USING (true);

CREATE POLICY "public_anamnese_submit" ON anamnese
  FOR INSERT WITH CHECK (preenchido_publicamente = true);

-- ============================================================
-- SEED: System-wide protocols
-- ============================================================

INSERT INTO protocolo (nome, descricao, campos_especificos, template_plano, alertas) VALUES
(
  'Diabetes Tipo 2',
  'Protocolo de atendimento nutricional para pacientes com Diabetes Mellitus tipo 2',
  '{"glicemia_jejum": {"tipo": "number", "unidade": "mg/dL", "normal_min": 70, "normal_max": 100, "alerta_min": 54, "alerta_max": 200}, "glicemia_pos_prandial": {"tipo": "number", "unidade": "mg/dL", "normal_min": 70, "normal_max": 140, "alerta_max": 200}, "hba1c": {"tipo": "number", "unidade": "%", "normal_min": 4.0, "normal_max": 5.7, "alerta_max": 7.0}, "medicacoes": {"tipo": "text", "obrigatorio": true}, "frequencia_glicemia_capilar": {"tipo": "select", "opcoes": ["jejum", "pre_prandial", "pos_prandial", "4h", "personalizado"]}}',
  '{"restricoes": ["açúcar refinado", "doces em excesso", "pão branco"], "diretrizes": ["Distribuição de carboidratos em 5-6 refeições", "Índice glicêmico baixo", "Fibras ≥ 25g/dia"], "macros_sugeridos": {"proteinas": 25, "carboidratos": 45, "gorduras": 30}}',
  '[{"condicao": "glicemia_jejum > 200", "mensagem": "Glicemia muito elevada. Considerar encaminhamento ao endocrinologista.", "severidade": "alta"}, {"condicao": "hba1c > 9.0", "mensagem": "Controle glicêmico inadequado. Revisar conduta farmacológica.", "severidade": "alta"}]'
),
(
  'Hipertensão Arterial',
  'Protocolo para pacientes com HAS',
  '{"pressao_sistolica": {"tipo": "number", "unidade": "mmHg", "normal_max": 130, "alerta_max": 160}, "pressao_diastolica": {"tipo": "number", "unidade": "mmHg", "normal_max": 85, "alerta_max": 100}, "medicacoes": {"tipo": "text", "obrigatorio": true}}',
  '{"restricoes": ["sódio > 2000mg/dia", "alimentos ultraprocessados"], "diretrizes": ["Dieta DASH", "Redução de sódio", "Potássio adequado"], "macros_sugeridos": {"proteinas": 20, "carboidratos": 50, "gorduras": 30}}',
  '[{"condicao": "pressao_sistolica > 160", "mensagem": "PA muito elevada. Reavaliar conduta.", "severidade": "alta"}]'
),
(
  'SOP (Síndrome dos Ovários Policísticos)',
  'Protocolo nutricional para SOP',
  '{"ciclo_menstrual": {"tipo": "text"}, "resistencia_insulina": {"tipo": "select", "opcoes": ["sim", "nao", "investigando"]}, "medicacoes": {"tipo": "text"}}',
  '{"restricoes": ["glicemia alta", "inflamação"], "diretrizes": ["Glicemia estável", "Anti-inflamatório", "Peso saudável"], "macros_sugeridos": {"proteinas": 30, "carboidratos": 40, "gorduras": 30}}',
  '[]'
),
(
  'Dislipidemia',
  'Protocolo para alterações lipídicas',
  '{"colesterol_total": {"tipo": "number", "unidade": "mg/dL", "alerta_max": 240}, "ldl": {"tipo": "number", "unidade": "mg/dL", "alerta_max": 160}, "hdl": {"tipo": "number", "unidade": "mg/dL", "alerta_min": 40}, "triglicerideos": {"tipo": "number", "unidade": "mg/dL", "alerta_max": 200}}',
  '{"restricoes": ["gorduras saturadas > 7% calorias", "trans"], "diretrizes": ["Gorduras insaturadas", "Fibras solúveis ≥ 10g/dia", "Fitosteróis"], "macros_sugeridos": {"proteinas": 20, "carboidratos": 50, "gorduras": 30}}',
  '[{"condicao": "ldl > 160", "mensagem": "LDL elevado. Reavaliar prescrição alimentar e medicação.", "severidade": "alta"}]'
),
(
  'Obstetrícia',
  'Protocolo para gestantes e lactantes',
  '{"semanas_gestacao": {"tipo": "number", "unidade": "semanas"}, "peso_pre_gestacional": {"tipo": "number", "unidade": "kg"}, "gestacao_gemelar": {"tipo": "select", "opcoes": ["sim", "nao"]}, "suplementacao": {"tipo": "text"}}',
  '{"restricoes": ["alimentos crus", "mercurio alto", "excesso cafeína"], "diretrizes": ["Ácido fólico", "Ferro", "Cálcio", "DHA"], "macros_sugeridos": {"proteinas": 25, "carboidratos": 50, "gorduras": 25}}',
  '[{"condicao": "ganho_peso < 0.5kg/mes no 2o trimestre", "mensagem": "Ganho ponderal insuficiente. Avaliar estado nutricional.", "severidade": "media"}]'
),
(
  'Nutrição Esportiva',
  'Protocolo para atletas e praticantes de atividade física regular',
  '{"modalidade": {"tipo": "text"}, "frequencia_treino": {"tipo": "text"}, "horario_treino": {"tipo": "text"}, "objetivo": {"tipo": "select", "opcoes": ["performance", "ganho_massa", "emagrecimento", "manutencao"]}}',
  '{"restricoes": [], "diretrizes": ["Periodização nutricional", "Timing de macronutrientes", "Hidratação"], "macros_sugeridos": {"proteinas": 35, "carboidratos": 45, "gorduras": 20}}',
  '[]'
);

-- ============================================================
-- FUNCTIONS FOR COMMON QUERIES
-- ============================================================

CREATE OR REPLACE FUNCTION get_paciente_evolution(
  p_paciente_id UUID,
  p_data_inicio DATE DEFAULT NULL,
  p_data_fim DATE DEFAULT NULL
)
RETURNS TABLE (
  data_avaliacao TIMESTAMPTZ,
  peso DECIMAL(5,2),
  imc DECIMAL(5,2),
  circunferencia_cintura DECIMAL(5,2),
  circunferencia_quadril DECIMAL(5,2),
  percentual_gordura DECIMAL(5,2),
  massa_magra DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT m.data_avaliacao, m.peso, m.imc, m.circunferencia_cintura,
         m.circunferencia_quadril, m.percentual_gordura, m.massa_magra
  FROM medidas m
  WHERE m.paciente_id = p_paciente_id
    AND (p_data_inicio IS NULL OR m.data_avaliacao >= p_data_inicio)
    AND (p_data_fim IS NULL OR m.data_avaliacao <= p_data_fim)
  ORDER BY m.data_avaliacao ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION calculate_adherence(
  p_paciente_id UUID,
  p_data_inicio DATE,
  p_data_fim DATE
)
RETURNS TABLE (
  dias_com_registro BIGINT,
  dias_totais BIGINT,
  percentual NUMERIC(5,1)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT da.data) AS dias_com_registro,
    (p_data_fim - p_data_inicio + 1)::BIGINT AS dias_totais,
    ROUND(
      (COUNT(DISTINCT da.data)::NUMERIC / (p_data_fim - p_data_inicio + 1)::NUMERIC) * 100,
      1
    ) AS percentual
  FROM diario_alimentar da
  WHERE da.paciente_id = p_paciente_id
    AND da.data BETWEEN p_data_inicio AND p_data_fim;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
