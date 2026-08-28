-- ============================================================
-- Nutri Atende — Migration 00004
-- Add alimento table for food library (Nível 2)
-- ============================================================

-- 1. ALIMENTO TABLE
CREATE TABLE alimento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  grupo TEXT NOT NULL,
  calorias_por_100g DECIMAL(7,2),
  proteinas_por_100g DECIMAL(5,2),
  carboidratos_por_100g DECIMAL(5,2),
  gorduras_por_100g DECIMAL(5,2),
  fibras_por_100g DECIMAL(5,2),
  porcao_padrao TEXT,
  porcao_gramas DECIMAL(7,2),
  fonte TEXT DEFAULT 'TACO',
  criado_por UUID REFERENCES usuario_sistema(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER alimento_updated_at
  BEFORE UPDATE ON alimento
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_alimento_grupo ON alimento(grupo);
CREATE INDEX idx_alimento_nome_trgm ON alimento USING gin(nome gin_trgm_ops);
CREATE INDEX idx_alimento_fonte ON alimento(fonte);

-- RLS
ALTER TABLE alimento ENABLE ROW LEVEL SECURITY;

-- Anyone in the clinic can view foods (global + clinic-specific)
CREATE POLICY "usuarios_veem_alimentos" ON alimento
  FOR SELECT USING (
    criado_por IS NULL
    OR criado_por IN (
      SELECT id FROM usuario_sistema WHERE clinica_id = get_user_clinica_id()
    )
  );

-- Nutricionistas can create custom foods
CREATE POLICY "nutricionistas_criam_alimentos" ON alimento
  FOR INSERT WITH CHECK (
    criado_por = auth.uid()
    AND EXISTS (
      SELECT 1 FROM usuario_sistema
      WHERE id = auth.uid()
      AND perfil IN ('nutricionista', 'admin')
      AND clinica_id = get_user_clinica_id()
    )
  );

-- Only creator can update their custom foods
CREATE POLICY "criador_atualiza_alimentos" ON alimento
  FOR UPDATE USING (criado_por = auth.uid());

-- Only creator can delete their custom foods
CREATE POLICY "criador_deleta_alimentos" ON alimento
  FOR DELETE USING (criado_por = auth.uid());

-- Insert TACO base foods (subset)
INSERT INTO alimento (nome, grupo, calorias_por_100g, proteinas_por_100g, carboidratos_por_100g, gorduras_por_100g, fibras_por_100g, porcao_padrao, porcao_gramas, fonte) VALUES
-- Proteínas Magras
('Peito de frango grelhado', 'proteinas_magras', 165, 31.0, 0, 3.6, 0, '1 porção', 150, 'TACO'),
('Peixe branco grelhado', 'proteinas_magras', 120, 25.0, 0, 2.0, 0, '1 porção', 150, 'TACO'),
('Ovo inteiro cozido', 'proteinas_magras', 155, 13.0, 1.1, 11.0, 0, '1 unidade', 50, 'TACO'),
('Clara de ovo', 'proteinas_magras', 52, 11.0, 0.7, 0.2, 0, '3 unidades', 100, 'TACO'),
('Peito de peru', 'proteinas_magras', 135, 30.0, 0, 1.0, 0, '2 fatias', 60, 'TACO'),
('Cottage light', 'proteinas_magras', 72, 12.0, 3.0, 1.0, 0, '4 colheres', 100, 'TACO'),

-- Proteínas Gordas
('Salmão grelhado', 'proteinas_gordas', 208, 20.0, 0, 13.0, 0, '1 porção', 150, 'TACO'),
('Patinho bovino grelhado', 'proteinas_gordas', 190, 28.0, 0, 8.0, 0, '1 porção', 150, 'TACO'),
('Lombo de porco', 'proteinas_gordas', 210, 26.0, 0, 11.0, 0, '1 porção', 150, 'TACO'),

-- Carboidratos Complexos
('Arroz integral cozido', 'carboidratos_complexos', 124, 2.6, 25.8, 1.0, 1.8, '1 xícara', 160, 'TACO'),
('Batata doce cozida', 'carboidratos_complexos', 90, 1.6, 20.7, 0.1, 3.0, '1 unidade média', 150, 'TACO'),
('Mandioca cozida', 'carboidratos_complexos', 125, 1.0, 30.1, 0.2, 2.5, '3 pedaços', 100, 'TACO'),
('Quinoa cozida', 'carboidratos_complexos', 120, 4.4, 21.3, 1.9, 2.8, '1 xícara', 185, 'TACO'),
('Aveia em flocos', 'carboidratos_complexos', 389, 16.9, 66.3, 6.9, 10.6, '3 colheres', 40, 'TACO'),

-- Carboidratos Simples
('Banana prata', 'carboidratos_simples', 89, 1.1, 22.8, 0.3, 2.6, '1 unidade', 120, 'TACO'),
('Maçã', 'carboidratos_simples', 52, 0.3, 13.8, 0.2, 2.4, '1 unidade média', 150, 'TACO'),
('Morango', 'carboidratos_simples', 32, 0.7, 7.7, 0.3, 2.0, '10 unidades', 150, 'TACO'),

-- Verduras
('Brócolis cozido', 'verduras', 35, 2.4, 7.2, 0.4, 3.3, '1 porção', 100, 'TACO'),
('Espinafre refogado', 'verduras', 23, 2.9, 3.6, 0.3, 2.2, '1 porção', 100, 'TACO'),
('Couve-flor cozida', 'verduras', 25, 1.9, 5.0, 0.3, 2.0, '1 porção', 100, 'TACO'),

-- Laticínios
('Iogurte grego natural', 'laticinios', 59, 10.0, 3.6, 0.7, 0, '1 pote', 170, 'TACO'),
('Leite desnatado', 'laticinios', 34, 3.4, 5.0, 0.1, 0, '1 xícara', 250, 'TACO'),
('Queijo minas light', 'laticinios', 210, 17.0, 3.0, 14.0, 0, '2 fatias', 50, 'TACO'),

-- Gorduras Boas
('Abacate', 'gorduras_boas', 160, 2.0, 8.5, 14.7, 6.7, '1/2 unidade', 100, 'TACO'),
('Azeite de oliva', 'gorduras_boas', 884, 0, 0, 100.0, 0, '1 colher', 15, 'TACO'),
('Castanha do Brasil', 'gorduras_boas', 656, 14.3, 12.5, 66.0, 7.5, '3 unidades', 15, 'TACO'),
('Amendoim', 'gorduras_boas', 567, 25.8, 16.1, 49.2, 8.5, '1 punhado', 30, 'TACO');