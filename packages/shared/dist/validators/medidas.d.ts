import { z } from 'zod';
export declare const createMedidasSchema: z.ZodObject<{
    consulta_id: z.ZodString;
    paciente_id: z.ZodString;
    peso: z.ZodOptional<z.ZodNumber>;
    altura: z.ZodOptional<z.ZodNumber>;
    circunferencia_cintura: z.ZodOptional<z.ZodNumber>;
    circunferencia_quadril: z.ZodOptional<z.ZodNumber>;
    circunferencia_braco: z.ZodOptional<z.ZodNumber>;
    circunferencia_coxa: z.ZodOptional<z.ZodNumber>;
    percentual_gordura: z.ZodOptional<z.ZodNumber>;
    massa_magra: z.ZodOptional<z.ZodNumber>;
    massa_gordura: z.ZodOptional<z.ZodNumber>;
    agua_corporal: z.ZodOptional<z.ZodNumber>;
    metodo_avaliacao: z.ZodDefault<z.ZodEnum<["manual", "bioimpedancia", "dobras_cutaneas", "dexa"]>>;
    detalhes_metodo: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    paciente_id: string;
    consulta_id: string;
    metodo_avaliacao: "manual" | "bioimpedancia" | "dobras_cutaneas" | "dexa";
    peso?: number | undefined;
    altura?: number | undefined;
    circunferencia_cintura?: number | undefined;
    circunferencia_quadril?: number | undefined;
    circunferencia_braco?: number | undefined;
    circunferencia_coxa?: number | undefined;
    percentual_gordura?: number | undefined;
    massa_magra?: number | undefined;
    massa_gordura?: number | undefined;
    agua_corporal?: number | undefined;
    detalhes_metodo?: Record<string, unknown> | undefined;
}, {
    paciente_id: string;
    consulta_id: string;
    peso?: number | undefined;
    altura?: number | undefined;
    circunferencia_cintura?: number | undefined;
    circunferencia_quadril?: number | undefined;
    circunferencia_braco?: number | undefined;
    circunferencia_coxa?: number | undefined;
    percentual_gordura?: number | undefined;
    massa_magra?: number | undefined;
    massa_gordura?: number | undefined;
    agua_corporal?: number | undefined;
    metodo_avaliacao?: "manual" | "bioimpedancia" | "dobras_cutaneas" | "dexa" | undefined;
    detalhes_metodo?: Record<string, unknown> | undefined;
}>;
export type CreateMedidasInput = z.infer<typeof createMedidasSchema>;
export declare const calculadoraComposicaoSchema: z.ZodObject<{
    metodo: z.ZodEnum<["pollock_3_masc", "pollock_3_fem", "pollock_7", "faulkner"]>;
    sexo: z.ZodEnum<["M", "F"]>;
    idade: z.ZodNumber;
    peso: z.ZodNumber;
    altura: z.ZodOptional<z.ZodNumber>;
    dobras: z.ZodObject<{
        peitoral: z.ZodOptional<z.ZodNumber>;
        abdominal: z.ZodOptional<z.ZodNumber>;
        coxa: z.ZodOptional<z.ZodNumber>;
        triceps: z.ZodOptional<z.ZodNumber>;
        suprailiaca: z.ZodOptional<z.ZodNumber>;
        subescapular: z.ZodOptional<z.ZodNumber>;
        axilar_media: z.ZodOptional<z.ZodNumber>;
        biceps: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        peitoral?: number | undefined;
        abdominal?: number | undefined;
        coxa?: number | undefined;
        triceps?: number | undefined;
        suprailiaca?: number | undefined;
        subescapular?: number | undefined;
        axilar_media?: number | undefined;
        biceps?: number | undefined;
    }, {
        peitoral?: number | undefined;
        abdominal?: number | undefined;
        coxa?: number | undefined;
        triceps?: number | undefined;
        suprailiaca?: number | undefined;
        subescapular?: number | undefined;
        axilar_media?: number | undefined;
        biceps?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    sexo: "M" | "F";
    peso: number;
    metodo: "pollock_3_masc" | "pollock_3_fem" | "pollock_7" | "faulkner";
    idade: number;
    dobras: {
        peitoral?: number | undefined;
        abdominal?: number | undefined;
        coxa?: number | undefined;
        triceps?: number | undefined;
        suprailiaca?: number | undefined;
        subescapular?: number | undefined;
        axilar_media?: number | undefined;
        biceps?: number | undefined;
    };
    altura?: number | undefined;
}, {
    sexo: "M" | "F";
    peso: number;
    metodo: "pollock_3_masc" | "pollock_3_fem" | "pollock_7" | "faulkner";
    idade: number;
    dobras: {
        peitoral?: number | undefined;
        abdominal?: number | undefined;
        coxa?: number | undefined;
        triceps?: number | undefined;
        suprailiaca?: number | undefined;
        subescapular?: number | undefined;
        axilar_media?: number | undefined;
        biceps?: number | undefined;
    };
    altura?: number | undefined;
}>;
export type CalculadoraComposicaoInput = z.infer<typeof calculadoraComposicaoSchema>;
export declare const calculadoraTMBInputSchema: z.ZodObject<{
    sexo: z.ZodEnum<["M", "F"]>;
    peso: z.ZodNumber;
    altura_cm: z.ZodNumber;
    idade: z.ZodNumber;
    nivel_atividade: z.ZodDefault<z.ZodEnum<["sedentario", "levemente_ativo", "moderadamente_ativo", "muito_ativo", "extremamente_ativo"]>>;
}, "strip", z.ZodTypeAny, {
    sexo: "M" | "F";
    peso: number;
    idade: number;
    altura_cm: number;
    nivel_atividade: "sedentario" | "levemente_ativo" | "moderadamente_ativo" | "muito_ativo" | "extremamente_ativo";
}, {
    sexo: "M" | "F";
    peso: number;
    idade: number;
    altura_cm: number;
    nivel_atividade?: "sedentario" | "levemente_ativo" | "moderadamente_ativo" | "muito_ativo" | "extremamente_ativo" | undefined;
}>;
export type CalculadoraTMBInput = z.infer<typeof calculadoraTMBInputSchema>;
export declare const distribuicaoMacrosSchema: z.ZodObject<{
    calorias_meta: z.ZodNumber;
    percentual_proteinas: z.ZodDefault<z.ZodNumber>;
    percentual_carboidratos: z.ZodDefault<z.ZodNumber>;
    percentual_gorduras: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    calorias_meta: number;
    percentual_proteinas: number;
    percentual_carboidratos: number;
    percentual_gorduras: number;
}, {
    calorias_meta: number;
    percentual_proteinas?: number | undefined;
    percentual_carboidratos?: number | undefined;
    percentual_gorduras?: number | undefined;
}>;
export type DistribuicaoMacrosInput = z.infer<typeof distribuicaoMacrosSchema>;
//# sourceMappingURL=medidas.d.ts.map