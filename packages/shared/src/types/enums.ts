// ============================================================
// Nutri Atende — Enum Types
// Match Supabase database enum types exactly
// ============================================================

export const PerfilUsuario = {
  NUTRICIONISTA: 'nutricionista',
  ESTAGIARIO: 'estagiario',
  RECEPCIONISTA: 'recepcionista',
  ADMIN: 'admin',
} as const;

export type PerfilUsuario = (typeof PerfilUsuario)[keyof typeof PerfilUsuario];

export const StatusPaciente = {
  ATIVO: 'ativo',
  INATIVO: 'inativo',
  MANUTENCAO: 'manutencao',
} as const;

export type StatusPaciente = (typeof StatusPaciente)[keyof typeof StatusPaciente];

export const SexoPaciente = {
  MASCULINO: 'M',
  FEMININO: 'F',
  OUTRO: 'Outro',
} as const;

export type SexoPaciente = (typeof SexoPaciente)[keyof typeof SexoPaciente];

export const TipoConsulta = {
  PRIMEIRA: 'primeira',
  RETORNO: 'retorno',
  AVALIACAO: 'avaliacao',
} as const;

export type TipoConsulta = (typeof TipoConsulta)[keyof typeof TipoConsulta];

export const StatusConsulta = {
  AGENDADA: 'agendada',
  CONFIRMADA: 'confirmada',
  REALIZADA: 'realizada',
  CANCELADA: 'cancelada',
  NAO_COMPARECEU: 'nao_compareceu',
} as const;

export type StatusConsulta = (typeof StatusConsulta)[keyof typeof StatusConsulta];

export const StatusPagamento = {
  PAGO: 'pago',
  PENDENTE: 'pendente',
  PARCIAL: 'parcial',
  ISENTO: 'isento',
} as const;

export type StatusPagamento = (typeof StatusPagamento)[keyof typeof StatusPagamento];

export const StatusPlanoAlimentar = {
  RASCUNHO: 'rascunho',
  ATIVO: 'ativo',
  FINALIZADO: 'finalizado',
  CANCELADO: 'cancelado',
} as const;

export type StatusPlanoAlimentar =
  (typeof StatusPlanoAlimentar)[keyof typeof StatusPlanoAlimentar];

export const OrigemDiario = {
  MANUAL: 'manual',
  APP: 'app',
  INTEGRACAO: 'integracao',
} as const;

export type OrigemDiario = (typeof OrigemDiario)[keyof typeof OrigemDiario];

export const MetodoAvaliacao = {
  MANUAL: 'manual',
  BIOIMPEDANCIA: 'bioimpedancia',
  DOBRAS_CUTANEAS: 'dobras_cutaneas',
  DEXA: 'dexa',
} as const;

export type MetodoAvaliacao =
  (typeof MetodoAvaliacao)[keyof typeof MetodoAvaliacao];

export const TipoTransacao = {
  SESSAO: 'sessao',
  PACOTE: 'pacote',
  PROMOCAO: 'promocao',
} as const;

export type TipoTransacao = (typeof TipoTransacao)[keyof typeof TipoTransacao];

export const StatusTransacao = {
  PENDENTE: 'pendente',
  PAGO: 'pago',
  PARCIAL: 'parcial',
  CANCELADO: 'cancelado',
} as const;

export type StatusTransacao =
  (typeof StatusTransacao)[keyof typeof StatusTransacao];

export const TipoDispositivo = {
  BALANCA: 'balanza',
  MONITOR_ATIVIDADE: 'monitor_atividade',
  GLICOMETRO: 'glicometro',
  CGM: 'cgm',
} as const;

export type TipoDispositivo =
  (typeof TipoDispositivo)[keyof typeof TipoDispositivo];

export const RemetenteMensagem = {
  PACIENTE: 'paciente',
  NUTRICIONISTA: 'nutricionista',
  SISTEMA: 'sistema',
} as const;

export type RemetenteMensagem =
  (typeof RemetenteMensagem)[keyof typeof RemetenteMensagem];

export const PlanoClinica = {
  BASICO: 'basico',
  PROFissional: 'profissional',
  CLINICA: 'clinica',
} as const;

export type PlanoClinica = (typeof PlanoClinica)[keyof typeof PlanoClinica];

export const TipoRelatorio = {
  PACIENTE_INDIVIDUAL: 'paciente_individual',
  GERENCIAL: 'gerencial',
  FINANCEIRO: 'financeiro',
} as const;

export type TipoRelatorio =
  (typeof TipoRelatorio)[keyof typeof TipoRelatorio];

export const FrequenciaRelatorio = {
  SOB_DEMANDA: 'sob_demanda',
  SEMANAL: 'semanal',
  MENSAL: 'mensal',
  TRIMESTRAL: 'trimestral',
} as const;

export type FrequenciaRelatorio =
  (typeof FrequenciaRelatorio)[keyof typeof FrequenciaRelatorio];
