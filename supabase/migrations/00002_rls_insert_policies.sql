-- ============================================================
-- Nutri Atende — Migration 00002
-- Adds missing INSERT RLS policies for bootstrap operations
-- ============================================================

-- CLINICA: Allow authenticated users to create their first clinic
-- This is needed for the /setup flow (first-time user)
CREATE POLICY "authenticated_users_create_clinica" ON clinica
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- USUARIO_SISTEMA: Allow authenticated users to create their own profile
-- This is needed for the /setup flow (first-time user)
CREATE POLICY "authenticated_users_create_own_profile" ON usuario_sistema
  FOR INSERT
  WITH CHECK (
    id = auth.uid()
  );


