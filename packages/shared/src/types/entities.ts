// ============================================================
// Nutri Atende — Entity Types
// TypeScript interfaces matching database schema
// ============================================================

import type {
  PerfilUsuario,
  StatusPaciente,
  SexoPaciente,
  TipoConsulta,
  StatusConsulta,
  StatusPagamento,
  StatusPlanoAlimentar,
  OrigemDiario,
  MetodoAvaliacao,
  TipoTransacao,
  StatusTransacao,
  TipoDispositivo,
  RemetenteMensagem,
  PlanoClinica,
  TipoRelatorio,
  FrequenciaRelatorio,
} from './enums';

// ============================================================
// Base types
// ============================================================

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Clinica
// ============================================================

export interface ClinicaEndereco {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
}

export interface ClinicaConfiguracoes {
  logo_url?: string;
  cor_primaria?: string;
  cor_secundaria?: string;
  horario_funcionamento?: {
    [dia: string]: { inicio: string; fim: string }[];
  };
  antecedencia_minima_cancelamento_horas?: number;
  template_pdf?: {
    logo_url?: string;
    cor_cabecalho?: string;
    rodape_texto?: string;
  };
  feriados?: Array<{
    data: string;
    nome: string;
  }>;
}

export interface Clinica extends BaseEntity {
  nome: string;
  cnpj: string | null;
  endereco: ClinicaEndereco | null;
  configuracoes: ClinicaConfiguracoes;
  plano: PlanoClinica;
}

// ============================================================
// UsuarioSistema
// ============================================================

export interface UsuarioPermissoes {
  pacientes?: {
    visualizar?: boolean;
    criar?: boolean;
    editar?: boolean;
    excluir?: boolean;
  };
  consultas?: {
    visualizar?: boolean;
    criar?: boolean;
    editar?: boolean;
    cancelar?: boolean;
  };
  planos_alimentares?: {
    visualizar?: boolean;
    criar?: boolean;
    editar?: boolean;
  };
  medidas?: {
    visualizar?: boolean;
    registrar?: boolean;
  };
  financeiro?: {
    visualizar?: boolean;
    criar?: boolean;
  };
  relatorios?: {
    visualizar?: boolean;
    exportar?: boolean;
  };
  configuracoes?: {
    visualizar?: boolean;
    editar?: boolean;
  };
  usuarios?: {
    visualizar?: boolean;
    criar?: boolean;
    editar?: boolean;
    excluir?: boolean;
  };
  audit_log?: {
    visualizar?: boolean;
    exportar?: boolean;
  };
}

export interface UsuarioSistema extends BaseEntity {
  id: string; // references auth.users
  clinica_id: string;
  nome: string;
  email: string;
  telefone: string | null;
  perfil: PerfilUsuario;
  permissoes: UsuarioPermissoes;
  avatar_url: string | null;
  ativo: boolean;
}

// ============================================================
// Paciente
// ============================================================

export interface Paciente extends BaseEntity {
  clinica_id: string;
  nutricionista_responsavel_id: string | null;
  nome: string;
  data_nascimento: string | null;
  sexo: SexoPaciente | null;
  telefone: string | null;
  email: string | null;
  cpf: string | null;
  foto_url: string | null;
  status: StatusPaciente;
  consentimento_lgpd: boolean;
  data_consentimento_lgpd: string | null;
  consentimento_lgpd_versao: string | null;
  observacoes: string | null;
  tags: string[] | null;
}

// Derived fields (not in DB, computed)
export interface PacienteComDerivados extends Paciente {
  idade?: number;
  ultima_consulta?: string | null;
  proximo_retorno?: string | null;
  peso_atual?: number | null;
  imc_atual?: number | null;
  nutricionista_nome?: string | null;
}

// ============================================================
// Consulta
// ============================================================

export interface Consulta extends BaseEntity {
  paciente_id: string;
  nutricionista_id: string;
  clinica_id: string;
  data_hora: string;
  duracao_minutos: number;
  tipo: TipoConsulta;
  status: StatusConsulta;
  valor: number | null;
  status_pagamento: StatusPagamento;
  valor_pago: number;
  observacoes: string | null;
  lembrete_enviado: boolean;
}

export interface ConsultaComRelacoes extends Consulta {
  paciente?: Paciente;
  nutricionista?: Pick<UsuarioSistema, 'id' | 'nome' | 'email'>;
}

// ============================================================
// Anamnese
// ============================================================

export interface Anamnese extends BaseEntity {
  consulta_id: string;
  paciente_id: string;
  queixa_principal: string | null;
  motivo_consulta: string | null;
  alimentacao_atual: string | null;
  rotina_diaria: string | null;
  restricoes_alimentares: string | null;
  alergias_intolerancias: string | null;
  historico_familiar: string | null;
  medicacoes_em_uso: string | null;
  atividade_fisica: string | null;
  sono: string | null;
  estresse: string | null;
  observacoes_livres: string | null;
  preenchido_publicamente: boolean;
}

// ============================================================
// Medidas
// ============================================================

export interface Medidas extends BaseEntity {
  consulta_id: string;
  paciente_id: string;
  data_avaliacao: string;
  peso: number | null;
  altura: number | null;
  imc: number | null; // generated column
  circunferencia_cintura: number | null;
  circunferencia_quadril: number | null;
  circunferencia_braco: number | null;
  circunferencia_coxa: number | null;
  // Nível 3 fields
  percentual_gordura: number | null;
  massa_magra: number | null;
  massa_gordura: number | null;
  agua_corporal: number | null;
  taxa_metabolica_basal: number | null;
  metodo_avaliacao: MetodoAvaliacao;
  detalhes_metodo: Record<string, unknown> | null;
}

export function classificarIMC(imc: number): string {
  if (imc < 18.5) return 'Abaixo do peso';
  if (imc < 25.0) return 'Peso normal';
  if (imc < 30.0) return 'Sobrepeso';
  if (imc < 35.0) return 'Obesidade grau I';
  if (imc < 40.0) return 'Obesidade grau II';
  return 'Obesidade grau III';
}

// ============================================================
// Plano Alimentar
// ============================================================

export interface PlanoAlimentar extends BaseEntity {
  paciente_id: string;
  consulta_id: string | null;
  nutricionista_id: string;
  titulo: string | null;
  data_inicio: string;
  data_fim: string | null;
  calorias_meta: number | null;
  proteinas_meta: number | null;
  carboidratos_meta: number | null;
  gorduras_meta: number | null;
  fibras_meta: number | null;
  status: StatusPlanoAlimentar;
  observacoes: string | null;
}

export interface PlanoAlimentarItem {
  id: string;
  plano_alimentar_id: string;
  ordem: number;
  refeicao: string;
  horario_sugerido: string | null;
  alimento: string;
  quantidade: string | null;
  unidade: string | null;
  calorias: number | null;
  proteinas: number | null;
  carboidratos: number | null;
  gorduras: number | null;
  substituicoes: Array<{
    alimento: string;
    quantidade: string;
    calorias: number;
    proteinas: number;
    carboidratos: number;
    gorduras: number;
  }> | null;
  observacoes: string | null;
}

export interface PlanoAlimentarCompleto extends PlanoAlimentar {
  itens?: PlanoAlimentarItem[];
}

// ============================================================
// Diario Alimentar
// ============================================================

export interface DiarioAlimentar extends BaseEntity {
  paciente_id: string;
  data: string;
  refeicao: string;
  alimento: string;
  quantidade: string | null;
  calorias: number | null;
  proteinas: number | null;
  carboidratos: number | null;
  gorduras: number | null;
  micronutrientes: Record<string, number> | null;
  origem: OrigemDiario;
  foto_url: string | null;
  observacoes: string | null;
  sync_id: string | null;
  versao: number;
}

// ============================================================
// Protocolo
// ============================================================

export interface ProtocoloCampo {
  tipo: 'number' | 'text' | 'select' | 'date';
  unidade?: string;
  normal_min?: number;
  normal_max?: number;
  alerta_min?: number;
  alerta_max?: number;
  obrigatorio?: boolean;
  opcoes?: string[];
}

export interface ProtocoloAlerta {
  condicao: string;
  mensagem: string;
  severidade: 'baixa' | 'media' | 'alta';
}

export interface Protocolo extends BaseEntity {
  clinica_id: string | null;
  nome: string;
  descricao: string | null;
  campos_especificos: Record<string, ProtocoloCampo>;
  template_plano: Record<string, unknown> | null;
  alertas: ProtocoloAlerta[];
  ativo: boolean;
}

export interface PacienteProtocolo {
  id: string;
  paciente_id: string;
  protocolo_id: string;
  data_inicio: string;
  data_fim: string | null;
  dados_especificos: Record<string, unknown> | null;
  ativo: boolean;
  created_at: string;
}

// ============================================================
// Financeiro (Nível 2)
// ============================================================

export interface TransacaoFinanceira extends BaseEntity {
  paciente_id: string;
  consulta_id: string | null;
  nutricionista_id: string;
  clinica_id: string;
  tipo: TipoTransacao;
  valor: number;
  valor_pago: number;
  status: StatusTransacao;
  descricao: string | null;
  data_vencimento: string | null;
  data_pagamento: string | null;
  metodo_pagamento: string | null;
  recibo_numero: number | null;
}

export interface PacoteConsulta {
  id: string;
  paciente_id: string;
  total_sessoes: number;
  sessoes_utilizadas: number;
  valor_total: number;
  data_compra: string;
  data_validade: string | null;
  ativo: boolean;
  created_at: string;
}

// ============================================================
// Mensagem (Nível 4)
// ============================================================

export interface Mensagem {
  id: string;
  paciente_id: string;
  nutricionista_id: string;
  remetente_tipo: RemetenteMensagem;
  conteudo: string;
  lida: boolean;
  created_at: string;
}

// ============================================================
// Dispositivo Integração (Nível 4)
// ============================================================

export interface DispositivoIntegracao {
  id: string;
  paciente_id: string;
  tipo: TipoDispositivo;
  fabricante: string | null;
  modelo: string | null;
  ultimo_sync: string | null;
  ativo: boolean;
  created_at: string;
}

// ============================================================
// Diario Atividade (Nível 4)
// ============================================================

export interface DiarioAtividade {
  id: string;
  paciente_id: string;
  data: string;
  passos: number | null;
  calorias_queimadas: number | null;
  minutos_ativos: number | null;
  distancia_km: number | null;
  sono_minutos: number | null;
  qualidade_sono: number | null;
  origem: string;
  created_at: string;
}

// ============================================================
// Diario Glicemia (Nível 4)
// ============================================================

export interface DiarioGlicemia {
  id: string;
  paciente_id: string;
  data_hora: string;
  glicemia: number;
  tipo: string | null;
  origem: string;
  created_at: string;
}

// ============================================================
// Audit Log (Nível 5)
// ============================================================

export interface AuditLog {
  id: string;
  clinica_id: string;
  usuario_id: string | null;
  acao: string;
  entidade: string;
  entidade_id: string | null;
  dados_antes: Record<string, unknown> | null;
  dados_depois: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// ============================================================
// Relatorio Config (Nível 5)
// ============================================================

export interface RelatorioConfig {
  id: string;
  clinica_id: string;
  usuario_id: string;
  nome: string;
  tipo: TipoRelatorio;
  configuracoes: Record<string, unknown>;
  frequencia: FrequenciaRelatorio;
  destinatarios: string[];
  ativo: boolean;
  created_at: string;
  updated_at: string;
}
