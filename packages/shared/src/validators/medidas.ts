// ============================================================
// Nutri Atende — Medidas Validators (Zod)
// ============================================================

import { z } from 'zod';

// ============================================================
// Create Medidas
// ============================================================

export const createMedidasSchema = z.object({
  consulta_id: z.string().uuid('ID da consulta inválido').optional(),
  paciente_id: z.string().uuid('ID do paciente inválido'),
  peso: z
    .number()
    .min(20, 'Peso mínimo de 20kg')
    .max(300, 'Peso máximo de 300kg')
    .optional(),
  altura: z
    .number()
    .min(0.5, 'Altura mínima de 0.5m')
    .max(2.5, 'Altura máxima de 2.5m')
    .optional(),
  circunferencia_cintura: z.number().min(30).max(200).optional(),
  circunferencia_quadril: z.number().min(30).max(200).optional(),
  circunferencia_braco: z.number().min(10).max(80).optional(),
  circunferencia_coxa: z.number().min(20).max(100).optional(),
  // Nível 3 fields
  percentual_gordura: z.number().min(0).max(70).optional(),
  massa_magra: z.number().min(0).max(200).optional(),
  massa_gordura: z.number().min(0).max(150).optional(),
  agua_corporal: z.number().min(0).max(80).optional(),
  metodo_avaliacao: z
    .enum(['manual', 'bioimpedancia', 'dobras_cutaneas', 'dexa'])
    .default('manual'),
  detalhes_metodo: z.record(z.unknown()).optional(),
});

export type CreateMedidasInput = z.infer<typeof createMedidasSchema>;

// ============================================================
// Calculate Body Composition (Nível 3)
// ============================================================

export const calculadoraComposicaoSchema = z.object({
  metodo: z.enum(['pollock_3_masc', 'pollock_3_fem', 'pollock_7', 'faulkner']),
  sexo: z.enum(['M', 'F']),
  idade: z.number().int().min(10).max(120),
  peso: z.number().min(20).max(300),
  altura: z.number().min(0.5).max(2.5).optional(),
  dobras: z.object({
    peitoral: z.number().min(0).max(100).optional(),
    abdominal: z.number().min(0).max(100).optional(),
    coxa: z.number().min(0).max(100).optional(),
    triceps: z.number().min(0).max(100).optional(),
    suprailiaca: z.number().min(0).max(100).optional(),
    subescapular: z.number().min(0).max(100).optional(),
    axilar_media: z.number().min(0).max(100).optional(),
    biceps: z.number().min(0).max(100).optional(),
  }),
});

export type CalculadoraComposicaoInput = z.infer<typeof calculadoraComposicaoSchema>;

// ============================================================
// Calculate TMB
// ============================================================

export const calculadoraTMBInputSchema = z.object({
  sexo: z.enum(['M', 'F']),
  peso: z.number().min(20).max(300),
  altura_cm: z.number().min(50).max(250),
  idade: z.number().int().min(10).max(120),
  nivel_atividade: z
    .enum([
      'sedentario',
      'levemente_ativo',
      'moderadamente_ativo',
      'muito_ativo',
      'extremamente_ativo',
    ])
    .default('sedentario'),
});

export type CalculadoraTMBInput = z.infer<typeof calculadoraTMBInputSchema>;

// ============================================================
// Macros distribution
// ============================================================

export const distribuicaoMacrosSchema = z.object({
  calorias_meta: z.number().int().min(500).max(10000),
  percentual_proteinas: z.number().min(5).max(60).default(30),
  percentual_carboidratos: z.number().min(5).max(70).default(45),
  percentual_gorduras: z.number().min(5).max(60).default(25),
});

export type DistribuicaoMacrosInput = z.infer<typeof distribuicaoMacrosSchema>;
