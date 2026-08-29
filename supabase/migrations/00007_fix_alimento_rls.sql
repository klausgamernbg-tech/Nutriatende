-- ============================================================
-- Nutri Atende — Migration 00007
-- Fix alimento RLS policies: wrap auth.uid() in (SELECT ...)
-- to avoid per-row re-evaluation (Supabase performance rec)
-- ============================================================

-- Drop the old policies
DROP POLICY IF EXISTS "nutricionistas_criam_alimentos" ON alimento;
DROP POLICY IF EXISTS "criador_atualiza_alimentos" ON alimento;
DROP POLICY IF EXISTS "criador_deleta_alimentos" ON alimento;
DROP POLICY IF EXISTS "usuarios_veem_alimentos" ON alimento;

-- Recreate with optimized (SELECT auth.uid()) pattern

-- Anyone in the clinic can view foods (global + clinic-specific)
CREATE POLICY "usuarios_veem_alimentos" ON alimento
  FOR SELECT USING (
    criado_por IS NULL
    OR criado_por IN (
      SELECT id FROM usuario_sistema WHERE clinica_id = (SELECT get_user_clinica_id())
    )
  );

-- Nutricionistas can create custom foods
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

-- Only creator can update their custom foods
CREATE POLICY "criador_atualiza_alimentos" ON alimento
  FOR UPDATE USING (criado_por = (SELECT auth.uid()));

-- Only creator can delete their custom foods
CREATE POLICY "criador_deleta_alimentos" ON alimento
  FOR DELETE USING (criado_por = (SELECT auth.uid()));
