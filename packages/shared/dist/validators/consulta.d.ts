import { z } from 'zod';
export declare const createConsultaSchema: z.ZodObject<{
    paciente_id: z.ZodString;
    data_hora: z.ZodString;
    duracao_minutos: z.ZodDefault<z.ZodNumber>;
    tipo: z.ZodEnum<["primeira", "retorno", "avaliacao"]>;
    valor: z.ZodOptional<z.ZodNumber>;
    observacoes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    paciente_id: string;
    data_hora: string;
    duracao_minutos: number;
    tipo: "primeira" | "retorno" | "avaliacao";
    observacoes?: string | undefined;
    valor?: number | undefined;
}, {
    paciente_id: string;
    data_hora: string;
    tipo: "primeira" | "retorno" | "avaliacao";
    observacoes?: string | undefined;
    duracao_minutos?: number | undefined;
    valor?: number | undefined;
}>;
export type CreateConsultaInput = z.infer<typeof createConsultaSchema>;
export declare const updateConsultaSchema: z.ZodObject<{
    data_hora: z.ZodOptional<z.ZodString>;
    duracao_minutos: z.ZodOptional<z.ZodNumber>;
    tipo: z.ZodOptional<z.ZodEnum<["primeira", "retorno", "avaliacao"]>>;
    valor: z.ZodOptional<z.ZodNumber>;
    status_pagamento: z.ZodOptional<z.ZodEnum<["pago", "pendente", "parcial", "isento"]>>;
    valor_pago: z.ZodOptional<z.ZodNumber>;
    observacoes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    observacoes?: string | undefined;
    data_hora?: string | undefined;
    duracao_minutos?: number | undefined;
    tipo?: "primeira" | "retorno" | "avaliacao" | undefined;
    valor?: number | undefined;
    status_pagamento?: "pago" | "pendente" | "parcial" | "isento" | undefined;
    valor_pago?: number | undefined;
}, {
    observacoes?: string | undefined;
    data_hora?: string | undefined;
    duracao_minutos?: number | undefined;
    tipo?: "primeira" | "retorno" | "avaliacao" | undefined;
    valor?: number | undefined;
    status_pagamento?: "pago" | "pendente" | "parcial" | "isento" | undefined;
    valor_pago?: number | undefined;
}>;
export type UpdateConsultaInput = z.infer<typeof updateConsultaSchema>;
export declare const updateConsultaStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["agendada", "confirmada", "realizada", "cancelada", "nao_compareceu"]>;
    motivo_cancelamento: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "agendada" | "confirmada" | "realizada" | "cancelada" | "nao_compareceu";
    motivo_cancelamento?: string | undefined;
}, {
    status: "agendada" | "confirmada" | "realizada" | "cancelada" | "nao_compareceu";
    motivo_cancelamento?: string | undefined;
}>;
export type UpdateConsultaStatusInput = z.infer<typeof updateConsultaStatusSchema>;
export declare const listConsultasSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    paciente_id: z.ZodOptional<z.ZodString>;
    nutricionista_id: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["agendada", "confirmada", "realizada", "cancelada", "nao_compareceu"]>>;
    data_inicio: z.ZodOptional<z.ZodString>;
    data_fim: z.ZodOptional<z.ZodString>;
    sort: z.ZodDefault<z.ZodEnum<["data_hora", "created_at", "status"]>>;
    order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    sort: "created_at" | "status" | "data_hora";
    page: number;
    limit: number;
    order: "asc" | "desc";
    status?: "agendada" | "confirmada" | "realizada" | "cancelada" | "nao_compareceu" | undefined;
    paciente_id?: string | undefined;
    nutricionista_id?: string | undefined;
    data_inicio?: string | undefined;
    data_fim?: string | undefined;
}, {
    status?: "agendada" | "confirmada" | "realizada" | "cancelada" | "nao_compareceu" | undefined;
    sort?: "created_at" | "status" | "data_hora" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    order?: "asc" | "desc" | undefined;
    paciente_id?: string | undefined;
    nutricionista_id?: string | undefined;
    data_inicio?: string | undefined;
    data_fim?: string | undefined;
}>;
export type ListConsultasInput = z.infer<typeof listConsultasSchema>;
//# sourceMappingURL=consulta.d.ts.map