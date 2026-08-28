-- Fix RLS for usuario_sistema: allow users to read their own record directly
-- The old policy had a circular dependency through get_user_clinica_id()

-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "usuarios_veem_mesma_clinica" ON usuario_sistema;

-- New policy: users can always read their own record + clinic members
CREATE POLICY "usuarios_veem_proprio_registro" ON usuario_sistema
  FOR SELECT USING (
    id = auth.uid()
    OR clinica_id = get_user_clinica_id()
  );
