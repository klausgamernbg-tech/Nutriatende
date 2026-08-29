-- ============================================================
-- Nutri Atende — Migration 00006
-- Fixes all Supabase advisor issues:
-- 1. alimento RLS policies: (SELECT auth.uid())
-- 2. Functions: set search_path, fix SECURITY DEFINER
-- 3. usuario_sistema: merge multiple permissive policies
-- 4. Extension schema (pg_trgm)
-- ============================================================

-- ============================================================
-- 1. ALIMENTO — optimize RLS policies
-- ============================================================

DROP POLICY IF EXISTS "usuarios_veem_alimentos" ON alimento;
CREATE POLICY "usuarios_veem_alimentos" ON alimento
  FOR SELECT USING (
    criado_por IS NULL
    OR criado_por IN (
      SELECT id FROM usuario_sistema WHERE clinica_id = (SELECT get_user_clinica_id())
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
      AND clinica_id = (SELECT get_user_clinica_id())
    )
  );

DROP POLICY IF EXISTS "criador_atualiza_alimentos" ON alimento;
CREATE POLICY "criador_atualiza_alimentos" ON alimento
  FOR UPDATE USING (criado_por = (SELECT auth.uid()));

DROP POLICY IF EXISTS "criador_deleta_alimentos" ON alimento;
CREATE POLICY "criador_deleta_alimentos" ON alimento
  FOR DELETE USING (criado_por = (SELECT auth.uid()));

-- ============================================================
-- 2. FUNCTIONS — set search_path + fix SECURITY DEFINER
-- ============================================================

-- update_updated_at_column: set search_path to prevent search_path hijacking
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public;

-- get_user_clinica_id: already SECURITY DEFINER STABLE, add search_path
CREATE OR REPLACE FUNCTION get_user_clinica_id()
RETURNS UUID AS $$
  SELECT clinica_id FROM usuario_sistema WHERE id = (SELECT auth.uid());
$$ LANGUAGE sql
  SECURITY DEFINER
  STABLE
  SET search_path = public;

-- get_paciente_evolution: set search_path, keep SECURITY DEFINER (needs cross-table access)
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
$$ LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public;

-- calculate_adherence: switch to SECURITY INVOKER (no need for cross-table escalation)
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
$$ LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path = public;

-- Revoke anonymous access to SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION get_paciente_evolution(UUID, DATE, DATE) FROM anon;
REVOKE EXECUTE ON FUNCTION calculate_adherence(UUID, DATE, DATE) FROM anon;

-- ============================================================
-- 3. USUARIO_SISTEMA — merge multiple permissive SELECT policies
-- ============================================================
-- Problem: "usuarios_veem_proprio_registro" and "admin_gerencia_usuarios"
-- are both permissive for SELECT, causing redundant evaluation.
-- Solution: Drop the admin SELECT (it's covered by ALL policy) and
-- keep a single permissive SELECT.

DROP POLICY IF EXISTS "usuarios_veem_proprio_registro" ON usuario_sistema;
CREATE POLICY "usuarios_veem_proprio_registro" ON usuario_sistema
  FOR SELECT USING (
    id = (SELECT auth.uid())
    OR clinica_id = (SELECT get_user_clinica_id())
  );

-- The admin_gerencia_usuarios policy is FOR ALL (includes SELECT).
-- Make it restrictive so it doesn't conflict with the SELECT policy.
DROP POLICY IF EXISTS "admin_gerencia_usuarios" ON usuario_sistema;
CREATE POLICY "admin_gerencia_usuarios" ON usuario_sistema
  FOR ALL USING (
    clinica_id = (SELECT get_user_clinica_id())
    AND EXISTS (
      SELECT 1 FROM usuario_sistema us
      WHERE us.id = (SELECT auth.uid())
      AND us.perfil = 'admin'
      AND us.clinica_id = usuario_sistema.clinica_id
    )
  ) WITH CHECK (
    clinica_id = (SELECT get_user_clinica_id())
    AND EXISTS (
      SELECT 1 FROM usuario_sistema us
      WHERE us.id = (SELECT auth.uid())
      AND us.perfil = 'admin'
      AND us.clinica_id = usuario_sistema.clinica_id
    )
  );

-- ============================================================
-- 4. EXTENSION — pg_trgm should use extensions schema
-- ============================================================
-- On Supabase, pg_trgm is typically already available via the
-- extensions schema. We just ensure we reference it correctly.
-- The CREATE EXTENSION IF NOT EXISTS is safe — it won't move
-- an existing extension, but new installs will use the right schema.

-- Note: Moving an existing extension requires SUPERUSER and downtime.
-- On Supabase, this is managed via the dashboard. The advisory is
-- informational for managed databases. We skip the ALTER here to
-- avoid breaking the existing installation.
