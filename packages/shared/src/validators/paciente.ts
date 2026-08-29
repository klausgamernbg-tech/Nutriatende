// ============================================================
// Nutri Atende — Paciente Validators (Zod)
// ============================================================

import { z } from 'zod';

// ============================================================
// Helpers
// ============================================================

const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  return remainder === parseInt(digits[10]);
}

const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/;

// ============================================================
// Create Paciente
// ============================================================

export const createPacienteSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(200, 'Nome muito longo'),
  data_nascimento: z.string().date('Data de nascimento inválida').optional(),
  sexo: z.enum(['M', 'F', 'Outro']).optional(),
  telefone: z
    .string()
    .max(20)
    .optional()
    .or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  cpf: z
    .string()
    .max(20)
    .optional()
    .or(z.literal('')),
  queixa_principal: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  consentimento_lgpd: z.literal(true, {
    errorMap: () => ({ message: 'Consentimento LGPD é obrigatório' }),
  }),
  consentimento_lgpd_versao: z.string().default('1.0'),
});

export type CreatePacienteInput = z.infer<typeof createPacienteSchema>;

// ============================================================
// Update Paciente
// ============================================================

export const updatePacienteSchema = z.object({
  nome: z.string().min(2).max(200).optional(),
  data_nascimento: z.string().date().optional(),
  sexo: z.enum(['M', 'F', 'Outro']).optional(),
  telefone: z.string().regex(phoneRegex).optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  cpf: z.string().regex(cpfRegex).optional().or(z.literal('')),
  status: z.enum(['ativo', 'inativo', 'manutencao']).optional(),
  nutricionista_responsavel_id: z.string().uuid().optional(),
  observacoes: z.string().max(5000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  foto_url: z.string().url().optional().nullable(),
});

export type UpdatePacienteInput = z.infer<typeof updatePacienteSchema>;

// ============================================================
// Query params for listing
// ============================================================

export const listPacientesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(200).optional(),
  status: z.enum(['ativo', 'inativo', 'manutencao']).optional(),
  sort: z.enum(['nome', 'data_nascimento', 'created_at', 'status']).default('nome'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export type ListPacientesInput = z.infer<typeof listPacientesSchema>;
