-- ============================================================
-- Nutri Atende — Migration 00009
-- Move functions to private schema to eliminate Supabase
-- SECURITY DEFINER + RPC exposure warnings.
--
-- Problem: Supabase auto-grants EXECUTE on ALL public schema
-- functions to anon/authenticated roles. REVOKE doesn't persist
-- because PostgREST re-grants on deployment.
--
-- Solution: Move non-RPC functions to `private` schema which
-- PostgREST does not expose.
--
-- Affected functions:
--   1. get_user_clinica_id() → private (used in RLS policies)
--   2. update_updated_at_column() → private (used in triggers)
--
-- This requires recreating ALL RLS policies and triggers that
-- reference these functions.
-- ============================================================

-- ============================================================
-- 0. CREATE PRIVATE SCHEMA
-- ============================================================
CREATE SCHEMA IF NOT EXISTS private;

-- ============================================================
-- 1. CREATE FUNCTIONS IN PRIVATE SCHEMA
-- ============================================================

CREATE OR REPLACE FUNCTION private.get_user_clinica_id()
RETURNS UUID AS $$
  SELECT clinica_id FROM usuario_sistema WHERE id = (SELECT auth.uid());
$$ LANGUAGE sql
  SECURITY DEFINER
  STABLE
  SET search_path = public, private;

CREATE OR REPLACE FUNCTION private.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, private;

-- ============================================================
-- 2. RECREATE ALL RLS POLICIES (replace get_user_clinica_id → private.get_user_clinica_id)
-- ============================================================

-- CLINICA
DROP POLICY IF EXISTS "usuarios_veem_sua_clinica" ON clinica;
CREATE POLICY "usuarios_veem_sua_clinica" ON clinica
  FOR SELECT USING (id = (SELECT private.get_user_clinica_id()));

DROP POLICY IF EXISTS "admin_edita_clinica" ON clinica;
CREATE POLICY "admin_edita_clinica" ON clinica
  FOR UPDATE USING (
    id = (SELECT private.get_user_clinica_id())
    AND EXISTS (
      SELECT 1 FROM usuario_sistema
      WHERE id = (SELECT auth.uid()) AND perfil = 'admin' AND clinica_id = clinica.id
    )
  );

DROP POLICY IF EXISTS "authenticated_users_create_clinica" ON clinica;
CREATE POLICY "authenticated_users_create_clinica" ON clinica
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- USUARIO_SISTEMA
DROP POLICY IF EXISTS "usuarios_veem_proprio_registro" ON usuario_sistema;
CREATE POLICY "usuarios_veem_proprio_registro" ON usuario_sistema
  FOR SELECT USING (
    id = (SELECT auth.uid())
    OR clinica_id = (SELECT private.get_user_clinica_id())
  );

DROP POLICY IF EXISTS "admin_gerencia_usuarios" ON usuario_sistema;
CREATE POLICY "admin_gerencia_usuarios" ON usuario_sistema
  FOR ALL USING (
    clinica_id = (SELECT private.get_user_clinica_id())
    AND EXISTS (
      SELECT 1 FROM usuario_sistema us
      WHERE us.id = (SELECT auth.uid()) AND us.perfil = 'admin' AND us.clinica_id = usuario_sistema.clinica_id
    )
  ) WITH CHECK (
    clinica_id = (SELECT private.get_user_clinica_id())
    AND EXISTS (
      SELECT 1 FROM usuario_sistema us
      WHERE us.id = (SELECT auth.uid()) AND us.perfil = 'admin' AND us.clinica_id = usuario_sistema.clinica_id
    )
  );

DROP POLICY IF EXISTS "authenticated_users_create_own_profile" ON usuario_sistema;
CREATE POLICY "authenticated_users_create_own_profile" ON usuario_sistema
  FOR INSERT WITH CHECK (id = (SELECT auth.uid()));

-- PACIENTE
DROP POLICY IF EXISTS "nutricionistas_veem_pacientes_clinica" ON paciente;
CREATE POLICY "nutricionistas_veem_pacientes_clinica" ON paciente
  FOR SELECT USING (
    clinica_id = (SELECT private.get_user_clinica_id())
    AND (
      EXISTS (
        SELECT 1 FROM usuario_sistema
        WHERE id = (SELECT auth.uid())
        AND perfil IN ('nutricionista', 'recepcionista', 'admin')
        AND clinica_id = paciente.clinica_id
      )
      OR nutricionista_responsavel_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "usuarios_criam_pacientes" ON paciente;
CREATE POLICY "usuarios_criam_pacientes" ON paciente
  FOR INSERT WITH CHECK (clinica_id = (SELECT private.get_user_clinica_id()));

DROP POLICY IF EXISTS "usuarios_editam_pacientes" ON paciente;
CREATE POLICY "usuarios_editam_pacientes" ON paciente
  FOR UPDATE USING (
    clinica_id = (SELECT private.get_user_clinica_id())
    AND EXISTS (
      SELECT 1 FROM usuario_sistema
      WHERE id = (SELECT auth.uid())
      AND clinica_id = paciente.clinica_id
      AND (
        perfil IN ('nutricionista', 'recepcionista', 'admin')
        OR nutricionista_responsavel_id = (SELECT auth.uid())
      )
    )
  );

-- CONSULTA
DROP POLICY IF EXISTS "usuarios_veem_consultas_clinica" ON consulta;
CREATE POLICY "usuarios_veem_consultas_clinica" ON consulta
  FOR SELECT USING (clinica_id = (SELECT private.get_user_clinica_id()));

DROP POLICY IF EXISTS "usuarios_criam_consultas" ON consulta;
CREATE POLICY "usuarios_criam_consultas" ON consulta
  FOR INSERT WITH CHECK (clinica_id = (SELECT private.get_user_clinica_id()));

DROP POLICY IF EXISTS "usuarios_editam_consultas" ON consulta;
CREATE POLICY "usuarios_editam_consultas" ON consulta
  FOR UPDATE USING (clinica_id = (SELECT private.get_user_clinica_id()));

-- ANAMNESE
DROP POLICY IF EXISTS "usuarios_veem_anamneses" ON anamnese;
CREATE POLICY "usuarios_veem_anamneses" ON anamnese
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = anamnese.paciente_id
      AND paciente.clinica_id = (SELECT private.get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "usuarios_criam_anamneses" ON anamnese;
CREATE POLICY "usuarios_criam_anamneses" ON anamnese
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = anamnese.paciente_id
      AND paciente.clinica_id = (SELECT private.get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "usuarios_editam_anamneses" ON anamnese;
CREATE POLICY "usuarios_editam_anamneses" ON anamnese
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = anamnese.paciente_id
      AND paciente.clinica_id = (SELECT private.get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "public_anamnese_form" ON anamnese;
CREATE POLICY "public_anamnese_form" ON anamnese
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_anamnese_submit" ON anamnese;
CREATE POLICY "public_anamnese_submit" ON anamnese
  FOR INSERT WITH CHECK (preenchido_publicamente = true);

-- MEDIDAS
DROP POLICY IF EXISTS "usuarios_veem_medidas" ON medidas;
CREATE POLICY "usuarios_veem_medidas" ON medidas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = medidas.paciente_id
      AND paciente.clinica_id = (SELECT private.get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "usuarios_criam_medidas" ON medidas;
CREATE POLICY "usuarios_criam_medidas" ON medidas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = medidas.paciente_id
      AND paciente.clinica_id = (SELECT private.get_user_clinica_id())
    )
  );

-- PLANO ALIMENTAR
DROP POLICY IF EXISTS "usuarios_veem_planos" ON plano_alimentar;
CREATE POLICY "usuarios_veem_planos" ON plano_alimentar
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = plano_alimentar.paciente_id
      AND paciente.clinica_id = (SELECT private.get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "usuarios_criam_planos" ON plano_alimentar;
CREATE POLICY "usuarios_criam_planos" ON plano_alimentar
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = plano_alimentar.paciente_id
      AND paciente.clinica_id = (SELECT private.get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "usuarios_editam_planos" ON plano_alimentar;
CREATE POLICY "usuarios_editam_planos" ON plano_alimentar
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = plano_alimentar.paciente_id
      AND paciente.clinica_id = (SELECT private.get_user_clinica_id())
    )
  );

-- PLANO ALIMENTAR ITEM
DROP POLICY IF EXISTS "usuarios_veem_itens_plano" ON plano_alimentar_item;
CREATE POLICY "usuarios_veem_itens_plano" ON plano_alimentar_item
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM plano_alimentar pa
      JOIN paciente p ON p.id = pa.paciente_id
      WHERE pa.id = plano_alimentar_item.plano_alimentar_id
      AND p.clinica_id = (SELECT private.get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "usuarios_gerenciam_itens_plano" ON plano_alimentar_item;
CREATE POLICY "usuarios_gerenciam_itens_plano" ON plano_alimentar_item
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM plano_alimentar pa
      JOIN paciente p ON p.id = pa.paciente_id
      WHERE pa.id = plano_alimentar_item.plano_alimentar_id
      AND p.clinica_id = (SELECT private.get_user_clinica_id())
    )
  );

-- DIARIO ALIMENTAR
DROP POLICY IF EXISTS "usuarios_veem_diario" ON diario_alimentar;
CREATE POLICY "usuarios_veem_diario" ON diario_alimentar
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = diario_alimentar.paciente_id
      AND paciente.clinica_id = (SELECT private.get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "usuarios_criam_diario" ON diario_alimentar;
CREATE POLICY "usuarios_criam_diario" ON diario_alimentar
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = diario_alimentar.paciente_id
      AND paciente.clinica_id = (SELECT private.get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "usuarios_editam_diario" ON diario_alimentar;
CREATE POLICY "usuarios_editam_diario" ON diario_alimentar
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = diario_alimentar.paciente_id
      AND paciente.clinica_id = (SELECT private.get_user_clinica_id())
    )
  );

-- PROTOCOLO
DROP POLICY IF EXISTS "usuarios_veem_protocolos" ON protocolo;
CREATE POLICY "usuarios_veem_protocolos" ON protocolo
  FOR SELECT USING (
    clinica_id IS NULL
    OR clinica_id = (SELECT private.get_user_clinica_id())
  );

DROP POLICY IF EXISTS "admin_gerencia_protocolos" ON protocolo;
CREATE POLICY "admin_gerencia_protocolos" ON protocolo
  FOR ALL USING (
    clinica_id = (SELECT private.get_user_clinica_id())
    AND EXISTS (
      SELECT 1 FROM usuario_sistema
      WHERE id = (SELECT auth.uid()) AND perfil = 'admin' AND clinica_id = (SELECT private.get_user_clinica_id())
    )
  );

-- PACIENTEPROTOCOLO
DROP POLICY IF EXISTS "usuarios_veem_paciente_protocolo" ON paciente_protocolo;
CREATE POLICY "usuarios_veem_paciente_protocolo" ON paciente_protocolo
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = paciente_protocolo.paciente_id
      AND paciente.clinica_id = (SELECT private.get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "usuarios_gerenciam_paciente_protocolo" ON paciente_protocolo;
CREATE POLICY "usuarios_gerenciam_paciente_protocolo" ON paciente_protocolo
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = paciente_protocolo.paciente_id
      AND paciente.clinica_id = (SELECT private.get_user_clinica_id())
    )
  );

-- MENSAGEM
DROP POLICY IF EXISTS "usuarios_veem_mensagens" ON mensagem;
CREATE POLICY "usuarios_veem_mensagens" ON mensagem
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = mensagem.paciente_id
      AND paciente.clinica_id = (SELECT private.get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "usuarios_enviam_mensagens" ON mensagem;
CREATE POLICY "usuarios_enviam_mensagens" ON mensagem
  FOR INSERT WITH CHECK (
    nutricionista_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = mensagem.paciente_id
      AND paciente.clinica_id = (SELECT private.get_user_clinica_id())
    )
  );

-- TRANSACAO FINANCEIRA
DROP POLICY IF EXISTS "usuarios_veem_transacoes" ON transacao_financeira;
CREATE POLICY "usuarios_veem_transacoes" ON transacao_financeira
  FOR SELECT USING (clinica_id = (SELECT private.get_user_clinica_id()));

DROP POLICY IF EXISTS "usuarios_criam_transacoes" ON transacao_financeira;
CREATE POLICY "usuarios_criam_transacoes" ON transacao_financeira
  FOR INSERT WITH CHECK (clinica_id = (SELECT private.get_user_clinica_id()));

DROP POLICY IF EXISTS "usuarios_editam_transacoes" ON transacao_financeira;
CREATE POLICY "usuarios_editam_transacoes" ON transacao_financeira
  FOR UPDATE USING (clinica_id = (SELECT private.get_user_clinica_id()));

-- PACOTE CONSULTA
DROP POLICY IF EXISTS "usuarios_veem_pacotes" ON pacote_consulta;
CREATE POLICY "usuarios_veem_pacotes" ON pacote_consulta
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = pacote_consulta.paciente_id
      AND paciente.clinica_id = (SELECT private.get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "usuarios_criam_pacotes" ON pacote_consulta;
CREATE POLICY "usuarios_criam_pacotes" ON pacote_consulta
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = pacote_consulta.paciente_id
      AND paciente.clinica_id = (SELECT private.get_user_clinica_id())
    )
  );

-- DISPOSITIVO INTEGRACAO
DROP POLICY IF EXISTS "usuarios_veem_dispositivos" ON dispositivo_integracao;
CREATE POLICY "usuarios_veem_dispositivos" ON dispositivo_integracao
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = dispositivo_integracao.paciente_id
      AND paciente.clinica_id = (SELECT private.get_user_clinica_id())
    )
  );

-- DIARIO ATIVIDADE
DROP POLICY IF EXISTS "usuarios_veem_atividade" ON diario_atividade;
CREATE POLICY "usuarios_veem_atividade" ON diario_atividade
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = diario_atividade.paciente_id
      AND paciente.clinica_id = (SELECT private.get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "usuarios_criam_atividade" ON diario_atividade;
CREATE POLICY "usuarios_criam_atividade" ON diario_atividade
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = diario_atividade.paciente_id
      AND paciente.clinica_id = (SELECT private.get_user_clinica_id())
    )
  );

-- DIARIO GLICEMIA
DROP POLICY IF EXISTS "usuarios_veem_glicemia" ON diario_glicemia;
CREATE POLICY "usuarios_veem_glicemia" ON diario_glicemia
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = diario_glicemia.paciente_id
      AND paciente.clinica_id = (SELECT private.get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "usuarios_criam_glicemia" ON diario_glicemia;
CREATE POLICY "usuarios_criam_glicemia" ON diario_glicemia
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = diario_glicemia.paciente_id
      AND paciente.clinica_id = (SELECT private.get_user_clinica_id())
    )
  );

-- AUDIT LOG
DROP POLICY IF EXISTS "admins_veem_audit_log" ON audit_log;
CREATE POLICY "admins_veem_audit_log" ON audit_log
  FOR SELECT USING (
    clinica_id = (SELECT private.get_user_clinica_id())
    AND EXISTS (
      SELECT 1 FROM usuario_sistema
      WHERE id = (SELECT auth.uid()) AND perfil = 'admin' AND clinica_id = (SELECT private.get_user_clinica_id())
    )
  );

-- RELATORIO CONFIG
DROP POLICY IF EXISTS "usuarios_veem_relatorios" ON relatorio_config;
CREATE POLICY "usuarios_veem_relatorios" ON relatorio_config
  FOR SELECT USING (clinica_id = (SELECT private.get_user_clinica_id()));

DROP POLICY IF EXISTS "usuarios_gerenciam_relatorios" ON relatorio_config;
CREATE POLICY "usuarios_gerenciam_relatorios" ON relatorio_config
  FOR ALL USING (clinica_id = (SELECT private.get_user_clinica_id()));

-- NOTIFICACAO
DROP POLICY IF EXISTS "usuarios_veem_notificacoes" ON notificacao;
CREATE POLICY "usuarios_veem_notificacoes" ON notificacao
  FOR SELECT USING (usuario_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "usuarios_marcam_notificacoes" ON notificacao;
CREATE POLICY "usuarios_marcam_notificacoes" ON notificacao
  FOR UPDATE USING (usuario_id = (SELECT auth.uid()));

-- ALIMENTO (from migration 00007)
DROP POLICY IF EXISTS "usuarios_veem_alimentos" ON alimento;
CREATE POLICY "usuarios_veem_alimentos" ON alimento
  FOR SELECT USING (
    criado_por IS NULL
    OR criado_por IN (
      SELECT id FROM usuario_sistema WHERE clinica_id = (SELECT private.get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "nutricionistas_criam_alimentos" ON alimento;
CREATE POLICY "nutricionistas_criam_alimentos" ON alimento
  FOR INSERT WITH CHECK (
    criado_por = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM usuario_sistema
      WHERE id = (SELECT auth.uid())
      AND perfil IN ('nutricionista', 'admin')
      AND clinica_id = (SELECT private.get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "criador_atualiza_alimentos" ON alimento;
CREATE POLICY "criador_atualiza_alimentos" ON alimento
  FOR UPDATE USING (criado_por = (SELECT auth.uid()));

DROP POLICY IF EXISTS "criador_deleta_alimentos" ON alimento;
CREATE POLICY "criador_deleta_alimentos" ON alimento
  FOR DELETE USING (criado_por = (SELECT auth.uid()));

-- ============================================================
-- 3. RECREATE ALL TRIGGERS (replace update_updated_at_column → private.update_updated_at_column)
-- ============================================================

-- Clinica
DROP TRIGGER IF EXISTS clinica_updated_at ON clinica;
CREATE TRIGGER clinica_updated_at
  BEFORE UPDATE ON clinica
  FOR EACH ROW EXECUTE FUNCTION private.update_updated_at_column();

-- Usuario Sistema
DROP TRIGGER IF EXISTS usuario_sistema_updated_at ON usuario_sistema;
CREATE TRIGGER usuario_sistema_updated_at
  BEFORE UPDATE ON usuario_sistema
  FOR EACH ROW EXECUTE FUNCTION private.update_updated_at_column();

-- Paciente
DROP TRIGGER IF EXISTS paciente_updated_at ON paciente;
CREATE TRIGGER paciente_updated_at
  BEFORE UPDATE ON paciente
  FOR EACH ROW EXECUTE FUNCTION private.update_updated_at_column();

-- Consulta
DROP TRIGGER IF EXISTS consulta_updated_at ON consulta;
CREATE TRIGGER consulta_updated_at
  BEFORE UPDATE ON consulta
  FOR EACH ROW EXECUTE FUNCTION private.update_updated_at_column();

-- Anamnese
DROP TRIGGER IF EXISTS anamnese_updated_at ON anamnese;
CREATE TRIGGER anamnese_updated_at
  BEFORE UPDATE ON anamnese
  FOR EACH ROW EXECUTE FUNCTION private.update_updated_at_column();

-- Medidas
DROP TRIGGER IF EXISTS medidas_updated_at ON medidas;
CREATE TRIGGER medidas_updated_at
  BEFORE UPDATE ON medidas
  FOR EACH ROW EXECUTE FUNCTION private.update_updated_at_column();

-- Plano Alimentar
DROP TRIGGER IF EXISTS plano_alimentar_updated_at ON plano_alimentar;
CREATE TRIGGER plano_alimentar_updated_at
  BEFORE UPDATE ON plano_alimentar
  FOR EACH ROW EXECUTE FUNCTION private.update_updated_at_column();

-- Diario Alimentar
DROP TRIGGER IF EXISTS diario_alimentar_updated_at ON diario_alimentar;
CREATE TRIGGER diario_alimentar_updated_at
  BEFORE UPDATE ON diario_alimentar
  FOR EACH ROW EXECUTE FUNCTION private.update_updated_at_column();

-- Protocolo
DROP TRIGGER IF EXISTS protocolo_updated_at ON protocolo;
CREATE TRIGGER protocolo_updated_at
  BEFORE UPDATE ON protocolo
  FOR EACH ROW EXECUTE FUNCTION private.update_updated_at_column();

-- Transacao Financeira
DROP TRIGGER IF EXISTS transacao_financeira_updated_at ON transacao_financeira;
CREATE TRIGGER transacao_financeira_updated_at
  BEFORE UPDATE ON transacao_financeira
  FOR EACH ROW EXECUTE FUNCTION private.update_updated_at_column();

-- Relatorio Config
DROP TRIGGER IF EXISTS relatorio_config_updated_at ON relatorio_config;
CREATE TRIGGER relatorio_config_updated_at
  BEFORE UPDATE ON relatorio_config
  FOR EACH ROW EXECUTE FUNCTION private.update_updated_at_column();

-- Alimento
DROP TRIGGER IF EXISTS alimento_updated_at ON alimento;
CREATE TRIGGER alimento_updated_at
  BEFORE UPDATE ON alimento
  FOR EACH ROW EXECUTE FUNCTION private.update_updated_at_column();

-- ============================================================
-- 4. DROP OLD FUNCTIONS FROM PUBLIC SCHEMA
-- ============================================================
DROP FUNCTION IF EXISTS public.get_user_clinica_id();
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- ============================================================
-- 5. GRANT USAGE ON PRIVATE SCHEMA to service_role (for admin client access)
-- ============================================================
GRANT USAGE ON SCHEMA private TO service_role;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT USAGE ON SCHEMA private TO anon;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA private TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA private TO authenticated;
-- Do NOT grant EXECUTE to anon — private functions should not be publicly callable
