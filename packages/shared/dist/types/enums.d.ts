export declare const PerfilUsuario: {
    readonly NUTRICIONISTA: "nutricionista";
    readonly ESTAGIARIO: "estagiario";
    readonly RECEPCIONISTA: "recepcionista";
    readonly ADMIN: "admin";
};
export type PerfilUsuario = (typeof PerfilUsuario)[keyof typeof PerfilUsuario];
export declare const StatusPaciente: {
    readonly ATIVO: "ativo";
    readonly INATIVO: "inativo";
    readonly MANUTENCAO: "manutencao";
};
export type StatusPaciente = (typeof StatusPaciente)[keyof typeof StatusPaciente];
export declare const SexoPaciente: {
    readonly MASCULINO: "M";
    readonly FEMININO: "F";
    readonly OUTRO: "Outro";
};
export type SexoPaciente = (typeof SexoPaciente)[keyof typeof SexoPaciente];
export declare const TipoConsulta: {
    readonly PRIMEIRA: "primeira";
    readonly RETORNO: "retorno";
    readonly AVALIACAO: "avaliacao";
};
export type TipoConsulta = (typeof TipoConsulta)[keyof typeof TipoConsulta];
export declare const StatusConsulta: {
    readonly AGENDADA: "agendada";
    readonly CONFIRMADA: "confirmada";
    readonly REALIZADA: "realizada";
    readonly CANCELADA: "cancelada";
    readonly NAO_COMPARECEU: "nao_compareceu";
};
export type StatusConsulta = (typeof StatusConsulta)[keyof typeof StatusConsulta];
export declare const StatusPagamento: {
    readonly PAGO: "pago";
    readonly PENDENTE: "pendente";
    readonly PARCIAL: "parcial";
    readonly ISENTO: "isento";
};
export type StatusPagamento = (typeof StatusPagamento)[keyof typeof StatusPagamento];
export declare const StatusPlanoAlimentar: {
    readonly RASCUNHO: "rascunho";
    readonly ATIVO: "ativo";
    readonly FINALIZADO: "finalizado";
    readonly CANCELADO: "cancelado";
};
export type StatusPlanoAlimentar = (typeof StatusPlanoAlimentar)[keyof typeof StatusPlanoAlimentar];
export declare const OrigemDiario: {
    readonly MANUAL: "manual";
    readonly APP: "app";
    readonly INTEGRACAO: "integracao";
};
export type OrigemDiario = (typeof OrigemDiario)[keyof typeof OrigemDiario];
export declare const MetodoAvaliacao: {
    readonly MANUAL: "manual";
    readonly BIOIMPEDANCIA: "bioimpedancia";
    readonly DOBRAS_CUTANEAS: "dobras_cutaneas";
    readonly DEXA: "dexa";
};
export type MetodoAvaliacao = (typeof MetodoAvaliacao)[keyof typeof MetodoAvaliacao];
export declare const TipoTransacao: {
    readonly SESSAO: "sessao";
    readonly PACOTE: "pacote";
    readonly PROMOCAO: "promocao";
};
export type TipoTransacao = (typeof TipoTransacao)[keyof typeof TipoTransacao];
export declare const StatusTransacao: {
    readonly PENDENTE: "pendente";
    readonly PAGO: "pago";
    readonly PARCIAL: "parcial";
    readonly CANCELADO: "cancelado";
};
export type StatusTransacao = (typeof StatusTransacao)[keyof typeof StatusTransacao];
export declare const TipoDispositivo: {
    readonly BALANCA: "balanza";
    readonly MONITOR_ATIVIDADE: "monitor_atividade";
    readonly GLICOMETRO: "glicometro";
    readonly CGM: "cgm";
};
export type TipoDispositivo = (typeof TipoDispositivo)[keyof typeof TipoDispositivo];
export declare const RemetenteMensagem: {
    readonly PACIENTE: "paciente";
    readonly NUTRICIONISTA: "nutricionista";
    readonly SISTEMA: "sistema";
};
export type RemetenteMensagem = (typeof RemetenteMensagem)[keyof typeof RemetenteMensagem];
export declare const PlanoClinica: {
    readonly BASICO: "basico";
    readonly PROFissional: "profissional";
    readonly CLINICA: "clinica";
};
export type PlanoClinica = (typeof PlanoClinica)[keyof typeof PlanoClinica];
export declare const TipoRelatorio: {
    readonly PACIENTE_INDIVIDUAL: "paciente_individual";
    readonly GERENCIAL: "gerencial";
    readonly FINANCEIRO: "financeiro";
};
export type TipoRelatorio = (typeof TipoRelatorio)[keyof typeof TipoRelatorio];
export declare const FrequenciaRelatorio: {
    readonly SOB_DEMANDA: "sob_demanda";
    readonly SEMANAL: "semanal";
    readonly MENSAL: "mensal";
    readonly TRIMESTRAL: "trimestral";
};
export type FrequenciaRelatorio = (typeof FrequenciaRelatorio)[keyof typeof FrequenciaRelatorio];
//# sourceMappingURL=enums.d.ts.map