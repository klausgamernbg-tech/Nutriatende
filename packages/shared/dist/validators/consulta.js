// ============================================================
// Nutri Atende — Consulta Validators (Zod)
// ============================================================
import { z } from 'zod';
// ============================================================
// Create Consulta
// ============================================================
export const createConsultaSchema = z.object({
    paciente_id: z.string().uuid('ID do paciente inválido'),
    data_hora: z.string().datetime('Data/hora inválida'),
    duracao_minutos: z
        .number()
        .int()
        .min(15, 'Duração mínima de 15 minutos')
        .max(240, 'Duração máxima de 4 horas')
        .default(60),
    tipo: z.enum(['primeira', 'retorno', 'avaliacao']),
    valor: z.number().min(0, 'Valor não pode ser negativo').optional(),
    observacoes: z.string().max(2000).optional(),
});
// ============================================================
// Update Consulta
// ============================================================
export const updateConsultaSchema = z.object({
    data_hora: z.string().datetime().optional(),
    duracao_minutos: z.number().int().min(15).max(240).optional(),
    tipo: z.enum(['primeira', 'retorno', 'avaliacao']).optional(),
    valor: z.number().min(0).optional(),
    status_pagamento: z.enum(['pago', 'pendente', 'parcial', 'isento']).optional(),
    valor_pago: z.number().min(0).optional(),
    observacoes: z.string().max(2000).optional(),
});
// ============================================================
// Update Status
// ============================================================
export const updateConsultaStatusSchema = z.object({
    status: z.enum([
        'agendada',
        'confirmada',
        'realizada',
        'cancelada',
        'nao_compareceu',
    ]),
    motivo_cancelamento: z.string().max(500).optional(),
});
// ============================================================
// Query params
// ============================================================
export const listConsultasSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    paciente_id: z.string().uuid().optional(),
    nutricionista_id: z.string().uuid().optional(),
    status: z
        .enum(['agendada', 'confirmada', 'realizada', 'cancelada', 'nao_compareceu'])
        .optional(),
    data_inicio: z.string().date().optional(),
    data_fim: z.string().date().optional(),
    sort: z.enum(['data_hora', 'created_at', 'status']).default('data_hora'),
    order: z.enum(['asc', 'desc']).default('asc'),
});
//# sourceMappingURL=consulta.js.map