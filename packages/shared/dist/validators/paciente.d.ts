import { z } from 'zod';
export declare const createPacienteSchema: z.ZodObject<{
    nome: z.ZodString;
    data_nascimento: z.ZodOptional<z.ZodString>;
    sexo: z.ZodOptional<z.ZodEnum<["M", "F", "Outro"]>>;
    telefone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    cpf: z.ZodEffects<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>, string | undefined, string | undefined>;
    queixa_principal: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    consentimento_lgpd: z.ZodLiteral<true>;
    consentimento_lgpd_versao: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    nome: string;
    consentimento_lgpd: true;
    consentimento_lgpd_versao: string;
    email?: string | undefined;
    telefone?: string | undefined;
    data_nascimento?: string | undefined;
    sexo?: "M" | "F" | "Outro" | undefined;
    cpf?: string | undefined;
    queixa_principal?: string | undefined;
    tags?: string[] | undefined;
}, {
    nome: string;
    consentimento_lgpd: true;
    email?: string | undefined;
    telefone?: string | undefined;
    data_nascimento?: string | undefined;
    sexo?: "M" | "F" | "Outro" | undefined;
    cpf?: string | undefined;
    queixa_principal?: string | undefined;
    tags?: string[] | undefined;
    consentimento_lgpd_versao?: string | undefined;
}>;
export type CreatePacienteInput = z.infer<typeof createPacienteSchema>;
export declare const updatePacienteSchema: z.ZodObject<{
    nome: z.ZodOptional<z.ZodString>;
    data_nascimento: z.ZodOptional<z.ZodString>;
    sexo: z.ZodOptional<z.ZodEnum<["M", "F", "Outro"]>>;
    telefone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    cpf: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    status: z.ZodOptional<z.ZodEnum<["ativo", "inativo", "manutencao"]>>;
    nutricionista_responsavel_id: z.ZodOptional<z.ZodString>;
    observacoes: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    foto_url: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    nome?: string | undefined;
    email?: string | undefined;
    telefone?: string | undefined;
    data_nascimento?: string | undefined;
    sexo?: "M" | "F" | "Outro" | undefined;
    status?: "ativo" | "inativo" | "manutencao" | undefined;
    cpf?: string | undefined;
    tags?: string[] | undefined;
    nutricionista_responsavel_id?: string | undefined;
    observacoes?: string | undefined;
    foto_url?: string | null | undefined;
}, {
    nome?: string | undefined;
    email?: string | undefined;
    telefone?: string | undefined;
    data_nascimento?: string | undefined;
    sexo?: "M" | "F" | "Outro" | undefined;
    status?: "ativo" | "inativo" | "manutencao" | undefined;
    cpf?: string | undefined;
    tags?: string[] | undefined;
    nutricionista_responsavel_id?: string | undefined;
    observacoes?: string | undefined;
    foto_url?: string | null | undefined;
}>;
export type UpdatePacienteInput = z.infer<typeof updatePacienteSchema>;
export declare const listPacientesSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["ativo", "inativo", "manutencao"]>>;
    sort: z.ZodDefault<z.ZodEnum<["nome", "data_nascimento", "created_at", "status"]>>;
    order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    sort: "nome" | "created_at" | "data_nascimento" | "status";
    page: number;
    limit: number;
    order: "asc" | "desc";
    status?: "ativo" | "inativo" | "manutencao" | undefined;
    search?: string | undefined;
}, {
    status?: "ativo" | "inativo" | "manutencao" | undefined;
    sort?: "nome" | "created_at" | "data_nascimento" | "status" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    order?: "asc" | "desc" | undefined;
}>;
export type ListPacientesInput = z.infer<typeof listPacientesSchema>;
//# sourceMappingURL=paciente.d.ts.map