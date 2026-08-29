-- ============================================================
-- Nutri Atende — Migration 00005
-- Optimize RLS policies: replace auth.uid() with (SELECT auth.uid())
-- to avoid per-row re-evaluation (Supabase performance recommendation)
-- ============================================================

-- ============================================================
-- HELPER FUNCTION — also wrap auth.uid() for consistency
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_clinica_id()
RETURNS UUID AS $$
  SELECT clinica_id FROM usuario_sistema WHERE id = (SELECT auth.uid());
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- CLINICA
-- ============================================================

DROP POLICY IF EXISTS "usuarios_veem_sua_clinica" ON clinica;
CREATE POLICY "usuarios_veem_sua_clinica" ON clinica
  FOR SELECT USING (id = (SELECT get_user_clinica_id()));

DROP POLICY IF EXISTS "admin_edita_clinica" ON clinica;
CREATE POLICY "admin_edita_clinica" ON clinica
  FOR UPDATE USING (
    id = (SELECT get_user_clinica_id())
    AND EXISTS (
      SELECT 1 FROM usuario_sistema
      WHERE id = (SELECT auth.uid()) AND perfil = 'admin' AND clinica_id = clinica.id
    )
  );

DROP POLICY IF EXISTS "authenticated_users_create_clinica" ON clinica;
CREATE POLICY "authenticated_users_create_clinica" ON clinica
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- ============================================================
-- USUARIO_SISTEMA
-- ============================================================

DROP POLICY IF EXISTS "usuarios_veem_proprio_registro" ON usuario_sistema;
DROP POLICY IF EXISTS "usuarios_veem_mesma_clinica" ON usuario_sistema;
CREATE POLICY "usuarios_veem_proprio_registro" ON usuario_sistema
  FOR SELECT USING (
    id = (SELECT auth.uid())
    OR clinica_id = (SELECT get_user_clinica_id())
  );

DROP POLICY IF EXISTS "admin_gerencia_usuarios" ON usuario_sistema;
CREATE POLICY "admin_gerencia_usuarios" ON usuario_sistema
  FOR ALL USING (
    clinica_id = (SELECT get_user_clinica_id())
    AND EXISTS (
      SELECT 1 FROM usuario_sistema us
      WHERE us.id = (SELECT auth.uid()) AND us.perfil = 'admin' AND us.clinica_id = usuario_sistema.clinica_id
    )
  );

DROP POLICY IF EXISTS "authenticated_users_create_own_profile" ON usuario_sistema;
CREATE POLICY "authenticated_users_create_own_profile" ON usuario_sistema
  FOR INSERT WITH CHECK (id = (SELECT auth.uid()));

-- ============================================================
-- PACIENTE
-- ============================================================

DROP POLICY IF EXISTS "nutricionistas_veem_pacientes_clinica" ON paciente;
CREATE POLICY "nutricionistas_veem_pacientes_clinica" ON paciente
  FOR SELECT USING (
    clinica_id = (SELECT get_user_clinica_id())
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
  FOR INSERT WITH CHECK (clinica_id = (SELECT get_user_clinica_id()));

DROP POLICY IF EXISTS "usuarios_editam_pacientes" ON paciente;
CREATE POLICY "usuarios_editam_pacientes" ON paciente
  FOR UPDATE USING (
    clinica_id = (SELECT get_user_clinica_id())
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

-- ============================================================
-- CONSULTA
-- ============================================================

DROP POLICY IF EXISTS "usuarios_veem_consultas_clinica" ON consulta;
CREATE POLICY "usuarios_veem_consultas_clinica" ON consulta
  FOR SELECT USING (clinica_id = (SELECT get_user_clinica_id()));

DROP POLICY IF EXISTS "usuarios_criam_consultas" ON consulta;
CREATE POLICY "usuarios_criam_consultas" ON consulta
  FOR INSERT WITH CHECK (clinica_id = (SELECT get_user_clinica_id()));

DROP POLICY IF EXISTS "usuarios_editam_consultas" ON consulta;
CREATE POLICY "usuarios_editam_consultas" ON consulta
  FOR UPDATE USING (clinica_id = (SELECT get_user_clinica_id()));

-- ============================================================
-- ANAMNESE
-- ============================================================

DROP POLICY IF EXISTS "usuarios_veem_anamneses" ON anamnese;
CREATE POLICY "usuarios_veem_anamneses" ON anamnese
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = anamnese.paciente_id
      AND paciente.clinica_id = (SELECT get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "usuarios_criam_anamneses" ON anamnese;
CREATE POLICY "usuarios_criam_anamneses" ON anamnese
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = anamnese.paciente_id
      AND paciente.clinica_id = (SELECT get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "usuarios_editam_anamneses" ON anamnese;
CREATE POLICY "usuarios_editam_anamneses" ON anamnese
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = anamnese.paciente_id
      AND paciente.clinica_id = (SELECT get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "public_anamnese_form" ON anamnese;
CREATE POLICY "public_anamnese_form" ON anamnese
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_anamnese_submit" ON anamnese;
CREATE POLICY "public_anamnese_submit" ON anamnese
  FOR INSERT WITH CHECK (preenchido_publicamente = true);

-- ============================================================
-- MEDIDAS
-- ============================================================

DROP POLICY IF EXISTS "usuarios_veem_medidas" ON medidas;
CREATE POLICY "usuarios_veem_medidas" ON medidas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = medidas.paciente_id
      AND paciente.clinica_id = (SELECT get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "usuarios_criam_medidas" ON medidas;
CREATE POLICY "usuarios_criam_medidas" ON medidas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = medidas.paciente_id
      AND paciente.clinica_id = (SELECT get_user_clinica_id())
    )
  );

-- ============================================================
-- PLANO ALIMENTAR
-- ============================================================

DROP POLICY IF EXISTS "usuarios_veem_planos" ON plano_alimentar;
CREATE POLICY "usuarios_veem_planos" ON plano_alimentar
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = plano_alimentar.paciente_id
      AND paciente.clinica_id = (SELECT get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "usuarios_criam_planos" ON plano_alimentar;
CREATE POLICY "usuarios_criam_planos" ON plano_alimentar
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = plano_alimentar.paciente_id
      AND paciente.clinica_id = (SELECT get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "usuarios_editam_planos" ON plano_alimentar;
CREATE POLICY "usuarios_editam_planos" ON plano_alimentar
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = plano_alimentar.paciente_id
      AND paciente.clinica_id = (SELECT get_user_clinica_id())
    )
  );

-- ============================================================
-- PLANO ALIMENTAR ITEM
-- ============================================================

DROP POLICY IF EXISTS "usuarios_veem_itens_plano" ON plano_alimentar_item;
CREATE POLICY "usuarios_veem_itens_plano" ON plano_alimentar_item
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM plano_alimentar pa
      JOIN paciente p ON p.id = pa.paciente_id
      WHERE pa.id = plano_alimentar_item.plano_alimentar_id
      AND p.clinica_id = (SELECT get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "usuarios_gerenciam_itens_plano" ON plano_alimentar_item;
CREATE POLICY "usuarios_gerenciam_itens_plano" ON plano_alimentar_item
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM plano_alimentar pa
      JOIN paciente p ON p.id = pa.paciente_id
      WHERE pa.id = plano_alimentar_item.plano_alimentar_id
      AND p.clinica_id = (SELECT get_user_clinica_id())
    )
  );

-- ============================================================
-- DIARIO ALIMENTAR
-- ============================================================

DROP POLICY IF EXISTS "usuarios_veem_diario" ON diario_alimentar;
CREATE POLICY "usuarios_veem_diario" ON diario_alimentar
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = diario_alimentar.paciente_id
      AND paciente.clinica_id = (SELECT get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "usuarios_criam_diario" ON diario_alimentar;
CREATE POLICY "usuarios_criam_diario" ON diario_alimentar
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = diario_alimentar.paciente_id
      AND paciente.clinica_id = (SELECT get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "usuarios_editam_diario" ON diario_alimentar;
CREATE POLICY "usuarios_editam_diario" ON diario_alimentar
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = diario_alimentar.paciente_id
      AND paciente.clinica_id = (SELECT get_user_clinica_id())
    )
  );

-- ============================================================
-- PROTOCOLO
-- ============================================================

DROP POLICY IF EXISTS "usuarios_veem_protocolos" ON protocolo;
CREATE POLICY "usuarios_veem_protocolos" ON protocolo
  FOR SELECT USING (
    clinica_id IS NULL
    OR clinica_id = (SELECT get_user_clinica_id())
  );

DROP POLICY IF EXISTS "admin_gerencia_protocolos" ON protocolo;
CREATE POLICY "admin_gerencia_protocolos" ON protocolo
  FOR ALL USING (
    clinica_id = (SELECT get_user_clinica_id())
    AND EXISTS (
      SELECT 1 FROM usuario_sistema
      WHERE id = (SELECT auth.uid()) AND perfil = 'admin' AND clinica_id = (SELECT get_user_clinica_id())
    )
  );

-- ============================================================
-- PACIENTEPROTOCOLO
-- ============================================================

DROP POLICY IF EXISTS "usuarios_veem_paciente_protocolo" ON paciente_protocolo;
CREATE POLICY "usuarios_veem_paciente_protocolo" ON paciente_protocolo
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = paciente_protocolo.paciente_id
      AND paciente.clinica_id = (SELECT get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "usuarios_gerenciam_paciente_protocolo" ON paciente_protocolo;
CREATE POLICY "usuarios_gerenciam_paciente_protocolo" ON paciente_protocolo
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = paciente_protocolo.paciente_id
      AND paciente.clinica_id = (SELECT get_user_clinica_id())
    )
  );

-- ============================================================
-- MENSAGEM
-- ============================================================

DROP POLICY IF EXISTS "usuarios_veem_mensagens" ON mensagem;
CREATE POLICY "usuarios_veem_mensagens" ON mensagem
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = mensagem.paciente_id
      AND paciente.clinica_id = (SELECT get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "usuarios_enviam_mensagens" ON mensagem;
CREATE POLICY "usuarios_enviam_mensagens" ON mensagem
  FOR INSERT WITH CHECK (
    nutricionista_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = mensagem.paciente_id
      AND paciente.clinica_id = (SELECT get_user_clinica_id())
    )
  );

-- ============================================================
-- TRANSACAO FINANCEIRA
-- ============================================================

DROP POLICY IF EXISTS "usuarios_veem_transacoes" ON transacao_financeira;
CREATE POLICY "usuarios_veem_transacoes" ON transacao_financeira
  FOR SELECT USING (clinica_id = (SELECT get_user_clinica_id()));

DROP POLICY IF EXISTS "usuarios_criam_transacoes" ON transacao_financeira;
CREATE POLICY "usuarios_criam_transacoes" ON transacao_financeira
  FOR INSERT WITH CHECK (clinica_id = (SELECT get_user_clinica_id()));

DROP POLICY IF EXISTS "usuarios_editam_transacoes" ON transacao_financeira;
CREATE POLICY "usuarios_editam_transacoes" ON transacao_financeira
  FOR UPDATE USING (clinica_id = (SELECT get_user_clinica_id()));

-- ============================================================
-- PACOTE CONSULTA
-- ============================================================

DROP POLICY IF EXISTS "usuarios_veem_pacotes" ON pacote_consulta;
CREATE POLICY "usuarios_veem_pacotes" ON pacote_consulta
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = pacote_consulta.paciente_id
      AND paciente.clinica_id = (SELECT get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "usuarios_criam_pacotes" ON pacote_consulta;
CREATE POLICY "usuarios_criam_pacotes" ON pacote_consulta
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = pacote_consulta.paciente_id
      AND paciente.clinica_id = (SELECT get_user_clinica_id())
    )
  );

-- ============================================================
-- DISPOSITIVO INTEGRACAO
-- ============================================================

DROP POLICY IF EXISTS "usuarios_veem_dispositivos" ON dispositivo_integracao;
CREATE POLICY "usuarios_veem_dispositivos" ON dispositivo_integracao
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = dispositivo_integracao.paciente_id
      AND paciente.clinica_id = (SELECT get_user_clinica_id())
    )
  );

-- ============================================================
-- DIARIO ATIVIDADE
-- ============================================================

DROP POLICY IF EXISTS "usuarios_veem_atividade" ON diario_atividade;
CREATE POLICY "usuarios_veem_atividade" ON diario_atividade
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = diario_atividade.paciente_id
      AND paciente.clinica_id = (SELECT get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "usuarios_criam_atividade" ON diario_atividade;
CREATE POLICY "usuarios_criam_atividade" ON diario_atividade
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = diario_atividade.paciente_id
      AND paciente.clinica_id = (SELECT get_user_clinica_id())
    )
  );

-- ============================================================
-- DIARIO GLICEMIA
-- ============================================================

DROP POLICY IF EXISTS "usuarios_veem_glicemia" ON diario_glicemia;
CREATE POLICY "usuarios_veem_glicemia" ON diario_glicemia
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = diario_glicemia.paciente_id
      AND paciente.clinica_id = (SELECT get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "usuarios_criam_glicemia" ON diario_glicemia;
CREATE POLICY "usuarios_criam_glicemia" ON diario_glicemia
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM paciente
      WHERE paciente.id = diario_glicemia.paciente_id
      AND paciente.clinica_id = (SELECT get_user_clinica_id())
    )
  );

-- ============================================================
-- AUDIT LOG
-- ============================================================

DROP POLICY IF EXISTS "admins_veem_audit_log" ON audit_log;
CREATE POLICY "admins_veem_audit_log" ON audit_log
  FOR SELECT USING (
    clinica_id = (SELECT get_user_clinica_id())
    AND EXISTS (
      SELECT 1 FROM usuario_sistema
      WHERE id = (SELECT auth.uid()) AND perfil = 'admin' AND clinica_id = (SELECT get_user_clinica_id())
    )
  );

-- ============================================================
-- RELATORIO CONFIG
-- ============================================================

DROP POLICY IF EXISTS "usuarios_veem_relatorios" ON relatorio_config;
CREATE POLICY "usuarios_veem_relatorios" ON relatorio_config
  FOR SELECT USING (clinica_id = (SELECT get_user_clinica_id()));

DROP POLICY IF EXISTS "usuarios_gerenciam_relatorios" ON relatorio_config;
CREATE POLICY "usuarios_gerenciam_relatorios" ON relatorio_config
  FOR ALL USING (clinica_id = (SELECT get_user_clinica_id()));

-- ============================================================
-- NOTIFICACAO
-- ============================================================

DROP POLICY IF EXISTS "usuarios_veem_notificacoes" ON notificacao;
CREATE POLICY "usuarios_veem_notificacoes" ON notificacao
  FOR SELECT USING (usuario_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "usuarios_marcam_notificacoes" ON notificacao;
CREATE POLICY "usuarios_marcam_notificacoes" ON notificacao
  FOR UPDATE USING (usuario_id = (SELECT auth.uid()));
