-- ============================================================
-- Migration 00010: Make consulta_id nullable in medidas table
-- ============================================================
-- Allows registering patient measurements without linking to a specific consultation.
-- This is needed for standalone measurements (e.g., from the /pacientes/[id]/medidas/nova page).

-- Make consulta_id nullable
ALTER TABLE medidas ALTER COLUMN consulta_id DROP NOT NULL;

-- Update the foreign key to use ON DELETE SET NULL instead of RESTRICT
-- (so if a consultation is deleted, the measurement isn't blocked)
ALTER TABLE medidas DROP CONSTRAINT IF EXISTS medidas_consulta_id_fkey;
ALTER TABLE medidas
  ADD CONSTRAINT medidas_consulta_id_fkey
  FOREIGN KEY (consulta_id) REFERENCES consulta(id) ON DELETE SET NULL;

-- Verification comment
COMMENT ON COLUMN medidas.consulta_id IS 'Optional link to a consultation. NULL for standalone measurements.';
