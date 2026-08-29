-- ============================================================
-- Nutri Atende — Migration 00008
-- Fix Supabase advisor SECURITY DEFINER warnings
-- ============================================================
--
-- Analysis:
--   1. get_user_clinica_id()     → KEEP SECURITY DEFINER (used in RLS policies, would cause infinite recursion as INVOKER)
--                                  → Revoke EXECUTE from anon + authenticated (not meant to be called via RPC)
--   2. get_paciente_evolution()   → Switch to SECURITY INVOKER (not used in RLS, safe to run as caller)
--                                  → Revoke EXECUTE from anon
--   3. update_updated_at_column() → KEEP SECURITY DEFINER (trigger function, fine)
--                                  → Revoke EXECUTE from anon + authenticated (not meant to be called via RPC)
-- ============================================================

-- ============================================================
-- 1. get_user_clinica_id — revoke RPC access (keep SECURITY DEFINER for RLS)
-- ============================================================
-- This function is called inside RLS policies like:
--   clinica_id = (SELECT get_user_clinica_id())
-- If changed to SECURITY INVOKER, the function would query usuario_sistema
-- which has its own RLS → infinite recursion. MUST stay SECURITY DEFINER.
-- But it should NOT be callable via /rest/v1/rpc/ by anon or authenticated.

REVOKE EXECUTE ON FUNCTION get_user_clinica_id() FROM anon;
REVOKE EXECUTE ON FUNCTION get_user_clinica_id() FROM authenticated;
REVOKE EXECUTE ON FUNCTION get_user_clinica_id() FROM service_role;

-- ============================================================
-- 2. get_paciente_evolution — switch to SECURITY INVOKER
-- ============================================================
-- This function is NOT used in RLS policies.
-- It queries the `medidas` table directly.
-- As SECURITY INVOKER, the caller's RLS policies on `medidas` apply correctly.
-- This is more secure and eliminates the RPC exposure warning.

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
  SECURITY INVOKER
  SET search_path = public;

-- Also revoke from anon for good measure
REVOKE EXECUTE ON FUNCTION get_paciente_evolution(UUID, DATE, DATE) FROM anon;

-- ============================================================
-- 3. update_updated_at_column — revoke RPC access (keep SECURITY DEFINER for triggers)
-- ============================================================
-- This is a trigger function. SECURITY DEFINER is fine for triggers.
-- But it should NOT be callable via /rest/v1/rpc/.

REVOKE EXECUTE ON FUNCTION update_updated_at_column() FROM anon;
REVOKE EXECUTE ON FUNCTION update_updated_at_column() FROM authenticated;
REVOKE EXECUTE ON FUNCTION update_updated_at_column() FROM service_role;
