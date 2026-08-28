-- ============================================================
-- Nutri Atende — Seed Data
-- For development and testing only
-- ============================================================

-- Note: This seed assumes auth.users already has entries.
-- In development, you'll create users via Supabase Auth UI or API first.

-- Create a test clinic
INSERT INTO clinica (id, nome, cnpj, endereco, configuracoes, plano) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Nutri Atende Clínica Modelo',
  '12.345.678/0001-99',
  '{"logradouro": "Rua da Nutrição", "numero": "100", "bairro": "Centro", "cidade": "São Paulo", "uf": "SP", "cep": "01234-567"}',
  '{
    "cor_primaria": "#10B981",
    "cor_secundaria": "#059669",
    "antecedencia_minima_cancelamento_horas": 24,
    "template_pdf": {
      "cor_cabecalho": "#10B981",
      "rodape_texto": "Nutri Atende Clínica Modelo — CRN-3 12345"
    },
    "feriados": [
      {"data": "2026-01-01", "nome": "Ano Novo"},
      {"data": "2026-04-21", "nome": "Tiradentes"},
      {"data": "2026-05-01", "nome": "Dia do Trabalho"},
      {"data": "2026-09-07", "nome": "Independência"},
      {"data": "2026-10-12", "nome": "Nossa Senhora Aparecida"},
      {"data": "2026-11-02", "nome": "Finados"},
      {"data": "2026-11-15", "nome": "Proclamação da República"},
      {"data": "2026-12-25", "nome": "Natal"}
    ]
  }',
  'clinica'
);

-- Note: usuario_sistema requires auth.users entries.
-- In Supabase, you'd first sign up via auth, then create the usuario_sistema record.
-- The following are placeholder UUIDs that would match auth.users after signup.

-- For testing, you can use this SQL after creating auth users:
-- INSERT INTO usuario_sistema (id, clinica_id, nome, email, perfil, permissoes) VALUES
-- ('<auth-user-uuid>', '11111111-1111-1111-1111-111111111111', 'Dr. Carlos Nutri', 'carlos@nutriatende.com', 'nutricionista', '{}');

-- Test patients (without foreign keys to auth users for now)
INSERT INTO paciente (clinica_id, nome, data_nascimento, sexo, telefone, email, status, consentimento_lgpd, data_consentimento_lgpd, consentimento_lgpd_versao, tags) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Ana Maria Silva',
  '1990-05-15',
  'F',
  '(11) 99999-1234',
  'ana.silva@email.com',
  'ativo',
  true,
  now(),
  '1.0',
  ARRAY['emagrecimento', 'reeducação_alimentar']
),
(
  '11111111-1111-1111-1111-111111111111',
  'Pedro Henrique Santos',
  '1985-08-22',
  'M',
  '(11) 98888-5678',
  'pedro.santos@email.com',
  'ativo',
  true,
  now(),
  '1.0',
  ARRAY['ganho_massa', 'esporte']
),
(
  '11111111-1111-1111-1111-111111111111',
  'Maria José Oliveira',
  '1978-12-03',
  'F',
  '(11) 97777-9012',
  'maria.oliveira@email.com',
  'ativo',
  true,
  now(),
  '1.0',
  ARRAY['diabetes', 'hipertensao']
),
(
  '11111111-1111-1111-1111-111111111111',
  'Lucas Ferreira Costa',
  '1995-03-10',
  'M',
  '(11) 96666-3456',
  'lucas.costa@email.com',
  'manutencao',
  true,
  now(),
  '1.0',
  ARRAY['emagrecimento']
),
(
  '11111111-1111-1111-1111-111111111111',
  'Juliana Mendes Lima',
  '2000-07-28',
  'F',
  '(11) 95555-7890',
  'juliana.lima@email.com',
  'inativo',
  true,
  now(),
  '1.0',
  ARRAY['gestante']
);

-- Sample food library (TACO subset)
CREATE TEMPORARY TABLE IF NOT EXISTS taco_alimentos (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  grupo TEXT NOT NULL,
  calorias DECIMAL(7,2),
  proteinas DECIMAL(5,2),
  carboidratos DECIMAL(5,2),
  gorduras DECIMAL(5,2)
);

-- Create alimentos table if not exists (for Nível 2)
CREATE TABLE IF NOT EXISTS alimento (
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
  criado_por UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO alimento (nome, grupo, calorias_por_100g, proteinas_por_100g, carboidratos_por_100g, gorduras_por_100g, fibras_por_100g, porcao_padrao, porcao_gramas) VALUES
-- Proteínas Magras
('Peito de frango grelhado', 'proteinas_magras', 165, 31.0, 0, 3.6, 0, '1 porção', 150),
('Peixe branco grelhado', 'proteinas_magras', 120, 25.0, 0, 2.0, 0, '1 porção', 150),
('Ovo inteiro cozido', 'proteinas_magras', 155, 13.0, 1.1, 11.0, 0, '1 unidade', 50),
('Clara de ovo', 'proteinas_magras', 52, 11.0, 0.7, 0.2, 0, '3 unidades', 100),
('Peito de peru', 'proteinas_magras', 135, 30.0, 0, 1.0, 0, '2 fatias', 60),
('Cottage light', 'proteinas_magras', 72, 12.0, 3.0, 1.0, 0, '4 colheres', 100),

-- Proteínas Gordas
('Salmão grelhado', 'proteinas_gordas', 208, 20.0, 0, 13.0, 0, '1 porção', 150),
('Patinho bovino grelhado', 'proteinas_gordas', 190, 28.0, 0, 8.0, 0, '1 porção', 150),
('Lombo de porco', 'proteinas_gordas', 210, 26.0, 0, 11.0, 0, '1 porção', 150),

-- Carboidratos Complexos
('Arroz integral cozido', 'carboidratos_complexos', 124, 2.6, 25.8, 1.0, 1.8, '1 xícara', 160),
('Batata doce cozida', 'carboidratos_complexos', 90, 1.6, 20.7, 0.1, 3.0, '1 unidade média', 150),
('Mandioca cozida', 'carboidratos_complexos', 125, 1.0, 30.1, 0.2, 2.5, '3 pedaços', 100),
('Quinoa cozida', 'carboidratos_complexos', 120, 4.4, 21.3, 1.9, 2.8, '1 xícara', 185),
('Aveia em flocos', 'carboidratos_complexos', 389, 16.9, 66.3, 6.9, 10.6, '3 colheres', 40),

-- Carboidratos Simples
('Banana prata', 'carboidratos_simples', 89, 1.1, 22.8, 0.3, 2.6, '1 unidade', 120),
('Maçã', 'carboidratos_simples', 52, 0.3, 13.8, 0.2, 2.4, '1 unidade média', 150),
('Morango', 'carboidratos_simples', 32, 0.7, 7.7, 0.3, 2.0, '10 unidades', 150),

-- Verduras
('Brócolis cozido', 'verduras', 35, 2.4, 7.2, 0.4, 3.3, '1 porção', 100),
('Espinafre refogado', 'verduras', 23, 2.9, 3.6, 0.3, 2.2, '1 porção', 100),
('Couve-flor cozida', 'verduras', 25, 1.9, 5.0, 0.3, 2.0, '1 porção', 100),

-- Laticínios
('Iogurte grego natural', 'laticinios', 59, 10.0, 3.6, 0.7, 0, '1 pote', 170),
('Leite desnatado', 'laticinios', 34, 3.4, 5.0, 0.1, 0, '1 xícara', 250),
('Queijo minas light', 'laticinios', 210, 17.0, 3.0, 14.0, 0, '2 fatias', 50),

-- Gorduras Boas
('Abacate', 'gorduras_boas', 160, 2.0, 8.5, 14.7, 6.7, '1/2 unidade', 100),
('Azeite de oliva', 'gorduras_boas', 884, 0, 0, 100.0, 0, '1 colher', 15),
('Castanha do Brasil', 'gorduras_boas', 656, 14.3, 12.5, 66.0, 7.5, '3 unidades', 15),
('Amendoim', 'gorduras_boas', 567, 25.8, 16.1, 49.2, 8.5, '1 punhado', 30);
