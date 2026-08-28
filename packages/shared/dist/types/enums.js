// ============================================================
// Nutri Atende — Enum Types
// Match Supabase database enum types exactly
// ============================================================
export const PerfilUsuario = {
    NUTRICIONISTA: 'nutricionista',
    ESTAGIARIO: 'estagiario',
    RECEPCIONISTA: 'recepcionista',
    ADMIN: 'admin',
};
export const StatusPaciente = {
    ATIVO: 'ativo',
    INATIVO: 'inativo',
    MANUTENCAO: 'manutencao',
};
export const SexoPaciente = {
    MASCULINO: 'M',
    FEMININO: 'F',
    OUTRO: 'Outro',
};
export const TipoConsulta = {
    PRIMEIRA: 'primeira',
    RETORNO: 'retorno',
    AVALIACAO: 'avaliacao',
};
export const StatusConsulta = {
    AGENDADA: 'agendada',
    CONFIRMADA: 'confirmada',
    REALIZADA: 'realizada',
    CANCELADA: 'cancelada',
    NAO_COMPARECEU: 'nao_compareceu',
};
export const StatusPagamento = {
    PAGO: 'pago',
    PENDENTE: 'pendente',
    PARCIAL: 'parcial',
    ISENTO: 'isento',
};
export const StatusPlanoAlimentar = {
    RASCUNHO: 'rascunho',
    ATIVO: 'ativo',
    FINALIZADO: 'finalizado',
    CANCELADO: 'cancelado',
};
export const OrigemDiario = {
    MANUAL: 'manual',
    APP: 'app',
    INTEGRACAO: 'integracao',
};
export const MetodoAvaliacao = {
    MANUAL: 'manual',
    BIOIMPEDANCIA: 'bioimpedancia',
    DOBRAS_CUTANEAS: 'dobras_cutaneas',
    DEXA: 'dexa',
};
export const TipoTransacao = {
    SESSAO: 'sessao',
    PACOTE: 'pacote',
    PROMOCAO: 'promocao',
};
export const StatusTransacao = {
    PENDENTE: 'pendente',
    PAGO: 'pago',
    PARCIAL: 'parcial',
    CANCELADO: 'cancelado',
};
export const TipoDispositivo = {
    BALANCA: 'balanza',
    MONITOR_ATIVIDADE: 'monitor_atividade',
    GLICOMETRO: 'glicometro',
    CGM: 'cgm',
};
export const RemetenteMensagem = {
    PACIENTE: 'paciente',
    NUTRICIONISTA: 'nutricionista',
    SISTEMA: 'sistema',
};
export const PlanoClinica = {
    BASICO: 'basico',
    PROFissional: 'profissional',
    CLINICA: 'clinica',
};
export const TipoRelatorio = {
    PACIENTE_INDIVIDUAL: 'paciente_individual',
    GERENCIAL: 'gerencial',
    FINANCEIRO: 'financeiro',
};
export const FrequenciaRelatorio = {
    SOB_DEMANDA: 'sob_demanda',
    SEMANAL: 'semanal',
    MENSAL: 'mensal',
    TRIMESTRAL: 'trimestral',
};
//# sourceMappingURL=enums.js.map