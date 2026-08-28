# Nutri Atende — Documento de Arquitetura Técnica

> **Versão:** 1.0  
> **Data:** Agosto 2026  
> **Status:** Aprovado para Desenvolvimento

---

## Índice

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Arquitetura de Alto Nível](#3-arquitetura-de-alto-nível)
4. [Modelo de Dados](#4-modelo-de-dados)
5. [Nível 1 — Atendimento Básico](#5-nível-1--atendimento-básico)
6. [Nível 2 — Acompanhamento e Organização](#6-nível-2--acompanhamento-e-organização)
7. [Nível 3 — Avaliação Nutricional Avançada](#7-nível-3--avaliação-nutricional-avançada)
8. [Nível 4 — Automação e Experiência do Paciente](#8-nível-4--automação-e-experiência-do-paciente)
9. [Nível 5 — Gestão da Clínica e Analytics](#9-nível-5--gestão-da-clínica-e-analytics)
10. [Fluxos de Trabalho](#10-fluxos-de-trabalho)
11. [Plano de Implementação Incremental](#11-plano-de-implementação-incremental)
12. [Segurança e LGPD](#12-segurança-e-lgpd)
13. [Decision Log e Pontos de Atenção](#13-decision-log-e-pontos-de-atenção)

---

## 1. Visão Geral do Sistema

O **Nutri Atende** é um sistema modular de gestão de atendimento nutricional projetado para crescer junto com o profissional. Cada nível de maturidade resolve um problema real que surge em um momento específico do crescimento da clínica.

### Matriz de Maturidade

| Nível | Público-Alvo | # Pacientes | Problema Resolvido |
|-------|-------------|-------------|-------------------|
| 1 | Nutricionista autônomo iniciante | 1–30 | Cadastro caótico, agenda em papel, sem plano formal |
| 2 | Nutricionista em crescimento | 30–80 | Perda de histórico, sem acompanhamento, cobrança informal |
| 3 | Nutricionista especializado | 50–150 | Falta de dados objetivos, sem protocolos clínicos |
| 4 | Clínica com app próprio | 100–300 | Paciente desengajado, dados manuais, sem automação |
| 5 | Clínica multi-profissional | 200–500+ | Sem visão gerencial, sem compliance, sem métricas |

### Princípios de Design

1. **Modularidade:** Cada nível é um módulo independente ativável/desativável
2. **Evolução sem ruptura:** Schema do Nível 1 suporta naturalmente dados dos Níveis 2–5
3. **API-first:** Toda funcionalidade exposta via API RESTful (mesmos endpoints para web e app)
4. **Multiplataforma:** Web responsivo + app nativo (planejado desde Nível 1)
5. **LGPD-native:** Consentimento, criptografia, exportação e exclusão desde o design
6. **Performance:** Suporte a 500+ pacientes ativos por nutricionista

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| **Frontend Web** | Next.js 14+ (App Router) + React 18 + TypeScript | SSR/SSG, API routes, ecossistema React, responsividade nativa |
| **UI Components** | shadcn/ui + Tailwind CSS 3 | Componentes acessíveis, customizáveis, sem dependência de lib externa |
| **Backend API** | Supabase (PostgreSQL + Auth + Realtime + Storage + Edge Functions) | Auth integrado, RLS nativo, Realtime para chat, Storage para fotos/PDFs |
| **Serviço de Processamento** | Node.js + Fastify + TypeScript | PDF generation (Playwright), webhooks, jobs pesados, integrações externas |
| **Banco de Dados** | PostgreSQL 15+ (via Supabase) | JSONB para campos flexíveis, RLS para multi-tenant, pg_trgm para busca |
| **Cache** | Supabase built-in + Next.js ISR | Cache de queries frequentes, stale-while-revalidate |
| **App Mobile** | React Native + Expo (SDK 51+) | Código compartilhado com web, WatermelonDB para offline, EAS para builds |
| **Offline-first** | WatermelonDB (SQLite) + CRDTs para sync | Sync diferencial, resolução de conflitos, performance nativa |
| **PDF Generation** | Playwright (headless Chromium) via Fastify service | Templates HTML→PDF com design completo, suporte a logos e formatação |
| **Notificações Push** | Expo Notifications (APNs + FCM) | Push nativo para iOS e Android via Expo |
| **Email/WhatsApp** | Resend (email) + Evolution API (WhatsApp) | Email transacional confiável, WhatsApp Business API self-hosted |
| **Filas/Background Jobs** | Inngest | Jobs declarativos, retry automático, cron |
| **Monitoramento** | Sentry (erros) + Vercel Analytics (web) | Tracking de erros, performance, web vitals |
| **Infra** | Vercel (Next.js) + Supabase (DB/Auth) + Railway (Fastify service) | Deploy simplificado, escalável, custo previsível |

### Decisões de Arquitetura

⚠️ **Decisão P0: API routes do Next.js vs Fastify separado**

Para Níveis 1–3, as API routes do Next.js são suficientes. O Fastify é necessário a partir do Nível 4 para:
- Geração de PDF em background (Playwright requer Chromium headless)
- Webhooks de integrações (balanças, CGM)
- Jobs agendados pesados (relatórios recorrentes)
- Endpoint de upload para sync do app offline

### Estrutura de Pastas

```
nutri-atende/
├── apps/
│   ├── web/                    # Next.js (frontend + API routes)
│   │   ├── app/                # App Router pages
│   │   ├── components/         # React components
│   │   ├── lib/                # Utilities, Supabase client
│   │   ├── api/                # API route handlers (light)
│   │   └── styles/             # Tailwind config
│   ├── mobile/                 # React Native + Expo
│   │   ├── app/                # Expo Router screens
│   │   ├── components/         # React Native components
│   │   ├── lib/                # Sync, WatermelonDB schema
│   │   └── services/           # API client, push notifications
│   └── processing/             # Fastify service (PDF, webhooks, jobs)
│       ├── src/
│       │   ├── routes/         # Fastify route handlers
│       │   ├── services/       # Business logic
│       │   ├── jobs/           # Inngest functions
│       │   └── templates/      # HTML templates for PDF
│       └── package.json
├── packages/
│   ├── shared/                 # Shared types, constants, utils
│   │   ├── types/              # TypeScript interfaces
│   │   ├── constants/          # Enums, config values
│   │   └── validators/         # Zod schemas (shared validation)
│   └── database/               # Supabase migrations, seed
│       ├── migrations/
│       └── seed/
├── supabase/
│   ├── config.toml
│   ├── functions/              # Edge Functions (webhooks, scheduled)
│   └── seed.sql
├── turbo.json                  # Turborepo config
├── pnpm-workspace.yaml
└── package.json
```

---

## 3. Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTES                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Web (Next.js)│  │ Mobile (RN)  │  │  Link Público │  │
│  │  Nutricionista│  │ Paciente     │  │  Anamnese     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│                    Vercel Edge                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Next.js App (SSR + API Routes + Middleware)     │   │
│  │  - Pages/Components (Web)                        │   │
│  │  - API Routes (CRUD leve)                        │   │
│  │  - Middleware (auth, rate limiting)               │   │
│  └──────────────────────┬───────────────────────────┘   │
└─────────────────────────┼───────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌──────────────┐ ┌────────────────┐ ┌──────────────────┐
│  Supabase    │ │ Fastify        │ │  Inngest         │
│  - Auth      │ │ (Railway)      │ │  (Background)    │
│  - PostgreSQL│ │ - PDF Gen      │ │  - Cron jobs     │
│  - Realtime  │ │ - Webhooks     │ │  - Scheduled     │
│  - Storage   │ │ - Integrations │ │  - Notifications │
│  - RLS       │ │ - Heavy jobs   │ │                  │
└──────────────┘ └────────────────┘ └──────────────────┘
          │               │               │
          ▼               ▼               ▼
┌─────────────────────────────────────────────────────────┐
│              EXTERNAS                                    │
│  Resend (email) │ Evolution API (WhatsApp) │ Sentry     │
│  Withings/Garmin APIs │ Apple Health/Google Fit         │
└─────────────────────────────────────────────────────────┘
```

### Arquitetura Multi-Tenant

O sistema é **multi-tenant via `clinica_id`** em todas as tabelas de dados. O Supabase Row Level Security (RLS) garante isolamento:

```sql
-- Exemplo de política RLS
CREATE POLICY "usuarios_veem_dados_sua_clinica" ON paciente
  FOR SELECT
  USING (
    clinica_id = (
      SELECT clinica_id FROM usuario_sistema
      WHERE id = auth.uid()
    )
  );
```

**Decisão:** Um nutricionista autônomo (Nível 1) tem sua própria "clínica" com um único usuário. A estrutura escala naturalmente para multiusuário.

---

## 4. Modelo de Dados

### Diagrama de Relacionamento (Notação Textual)

```
clinica (1) ──── (N) usuario_sistema
    │                    │
    │                    │ (1 nutricionista responsável)
    │                    ▼
    ├── (N) ──── paciente
    │               │
    │               ├── (N) ──── consulta
    │               │              │
    │               │              ├── (1) ──── anamnese [1:1]
    │               │              ├── (N) ──── medidas
    │               │              ├── (N) ──── plano_alimentar
    │               │              │               └── (N) ──── plano_alimentar_item
    │               │              ├── (N) ──── transacao_financeira
    │               │              └── (N) ──── paciente_protocolo
    │               │
    │               ├── (N) ──── diario_alimentar
    │               ├── (N) ──── mensagem
    │               ├── (N) ──── dispositivo_integracao
    │               ├── (N) ──── diario_atividade
    │               ├── (N) ──── diario_glicemia
    │               └── (N) ──── notificacao
    │
    ├── (N) ──── protocolo
    ├── (N) ──── transacao_financeira
    ├── (N) ──── audit_log
    └── (N) ──── relatorio_config
```

### Schema Completo das Entidades

#### 4.1 `clinica`

| Campo | Tipo | Constraints | Descrição |
|-------|------|------------|-----------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Identificador único |
| nome | TEXT | NOT NULL | Nome da clínica |
| cnpj | TEXT | UNIQUE | CNPJ (nullable para autônomos) |
| endereco | JSONB | | {logradouro, numero, complemento, bairro, cidade, uf, cep} |
| configuracoes | JSONB | DEFAULT '{}' | Logo URL, cores, horário_funcionamento, antecedencia_minima_cancelamento, template_pdf |
| plano | ENUM | DEFAULT 'basico' | basico, profissional, clinica |
| created_at | TIMESTAMPTZ | DEFAULT now() | |
| updated_at | TIMESTAMPTZ | | Trigger auto-update |

#### 4.2 `usuario_sistema`

| Campo | Tipo | Constraints | Descrição |
|-------|------|------------|-----------|
| id | UUID | PK → auth.users.id | Referencia Supabase Auth |
| clinica_id | UUID | FK → clinica, NOT NULL | |
| nome | TEXT | NOT NULL | Nome completo |
| email | TEXT | NOT NULL | Email (login) |
| telefone | TEXT | | |
| perfil | ENUM | NOT NULL | nutricionista, estagiario, recepcionista, admin |
| permissoes | JSONB | DEFAULT '{}' | Permissões granulares por módulo |
| avatar_url | TEXT | | |
| ativo | BOOLEAN | DEFAULT true | |
| created_at | TIMESTAMPTZ | DEFAULT now() | |
| updated_at | TIMESTAMPTZ | | |

#### 4.3 `paciente`

| Campo | Tipo | Constraints | Descrição |
|-------|------|------------|-----------|
| id | UUID | PK | |
| clinica_id | UUID | FK → clinica, NOT NULL | |
| nutricionista_responsavel_id | UUID | FK → usuario_sistema | |
| nome | TEXT | NOT NULL | |
| data_nascimento | DATE | | |
| sexo | ENUM | | M, F, Outro |
| telefone | TEXT | | |
| email | TEXT | | |
| cpf | TEXT | | 🔒 Criptografado (pgcrypto) |
| foto_url | TEXT | | |
| status | ENUM | DEFAULT 'ativo' | ativo, inativo, manutencao |
| consentimento_lgpd | BOOLEAN | DEFAULT false | 🔒 Obrigatório antes de salvar dados |
| data_consentimento_lgpd | TIMESTAMPTZ | | Timestamp do consentimento |
| consentimento_lgpd_versao | TEXT | | Versão do termo aceito |
| observacoes | TEXT | | |
| tags | TEXT[] | | Tags de categorização |
| created_at | TIMESTAMPTZ | DEFAULT now() | |
| updated_at | TIMESTAMPTZ | | |

**Constraints:**
- UNIQUE(clinica_id, email) WHERE email IS NOT NULL
- UNIQUE(clinica_id, cpf) WHERE cpf IS NOT NULL

#### 4.4 `consulta`

| Campo | Tipo | Constraints | Descrição |
|-------|------|------------|-----------|
| id | UUID | PK | |
| paciente_id | UUID | FK → paciente, NOT NULL | |
| nutricionista_id | UUID | FK → usuario_sistema, NOT NULL | |
| clinica_id | UUID | FK → clinica, NOT NULL | |
| data_hora | TIMESTAMPTZ | NOT NULL | |
| duracao_minutos | INTEGER | DEFAULT 60 | |
| tipo | ENUM | NOT NULL | primeira, retorno, avaliacao |
| status | ENUM | DEFAULT 'agendada' | agendada, confirmada, realizada, cancelada, nao_compareceu |
| valor | DECIMAL(10,2) | | |
| status_pagamento | ENUM | DEFAULT 'pendente' | pago, pendente, parcial, isento |
| valor_pago | DECIMAL(10,2) | DEFAULT 0 | |
| observacoes | TEXT | | |
| lembrete_enviado | BOOLEAN | DEFAULT false | |
| created_at | TIMESTAMPTZ | DEFAULT now() | |
| updated_at | TIMESTAMPTZ | | |

**Index:** INDEX(paciente_id, data_hora), INDEX(nutricionista_id, data_hora, status)

#### 4.5 `anamnese`

| Campo | Tipo | Constraints | Descrição |
|-------|------|------------|-----------|
| id | UUID | PK | |
| consulta_id | UUID | FK → consulta, UNIQUE, NOT NULL | 1:1 com consulta |
| paciente_id | UUID | FK → paciente, NOT NULL | Denormalizado para queries |
| queixa_principal | TEXT | | |
| motivo_consulta | TEXT | | |
| alimentacao_atual | TEXT | | |
| rotina_diaria | TEXT | | |
| restricoes_alimentares | TEXT | | |
| alergias_intolerancias | TEXT | | |
| historico_familiar | TEXT | | |
| medicacoes_em_uso | TEXT | | |
| atividade_fisica | TEXT | | |
| sono | TEXT | | |
| estresse | TEXT | | |
| observacoes_livres | TEXT | | |
| preenchido_publicamente | BOOLEAN | DEFAULT false | Preenchido via link público (Nível 1) |
| created_at | TIMESTAMPTZ | DEFAULT now() | |
| updated_at | TIMESTAMPTZ | | |

#### 4.6 `medidas`

| Campo | Tipo | Constraints | Descrição |
|-------|------|------------|-----------|
| id | UUID | PK | |
| consulta_id | UUID | FK → consulta, NOT NULL | |
| paciente_id | UUID | FK → paciente, NOT NULL | Denormalizado |
| data_avaliacao | TIMESTAMPTZ | NOT NULL | |
| peso | DECIMAL(5,2) | | kg |
| altura | DECIMAL(4,3) | | metros (ex: 1.750) |
| imc | DECIMAL(5,2) | GENERATED ALWAYS AS | peso / (altura * altura) STORED |
| circunferencia_cintura | DECIMAL(5,2) | | cm |
| circunferencia_quadril | DECIMAL(5,2) | | cm |
| circunferencia_braco | DECIMAL(5,2) | | cm |
| circunferencia_coxa | DECIMAL(5,2) | | cm |
| percentual_gordura | DECIMAL(5,2) | | % (Nível 3) |
| massa_magra | DECIMAL(5,2) | | kg (Nível 3) |
| massa_gordura | DECIMAL(5,2) | | kg (Nível 3) |
| agua_corporal | DECIMAL(5,2) | | % (Nível 3) |
| taxa_metabolica_basal | DECIMAL(7,2) | | kcal/dia (Nível 3) |
| metodo_avaliacao | ENUM | DEFAULT 'manual' | manual, bioimpedancia, dobras_cutaneas, dexa |
| detalhes_metodo | JSONB | | Dados específicos do método (Nível 3) |
| created_at | TIMESTAMPTZ | DEFAULT now() | |
| updated_at | TIMESTAMPTZ | | |

> **Nota sobre IMC:** Usamos GENERATED ALWAYS AS para cálculo automático no banco.

#### 4.7 `plano_alimentar`

| Campo | Tipo | Constraints | Descrição |
|-------|------|------------|-----------|
| id | UUID | PK | |
| paciente_id | UUID | FK → paciente, NOT NULL | |
| consulta_id | UUID | FK → consulta | |
| nutricionista_id | UUID | FK → usuario_sistema, NOT NULL | |
| titulo | TEXT | | Ex: "Plano de Emagrecimento - Fase 1" |
| data_inicio | DATE | NOT NULL | |
| data_fim | DATE | | NULL = vigente até novo plano |
| calorias_meta | INTEGER | | |
| proteinas_meta | DECIMAL(5,2) | | gramas/dia |
| carboidratos_meta | DECIMAL(5,2) | | gramas/dia |
| gorduras_meta | DECIMAL(5,2) | | gramas/dia |
| fibras_meta | DECIMAL(5,2) | | gramas/dia |
| status | ENUM | DEFAULT 'rascunho' | rascunho, ativo, finalizado, cancelado |
| observacoes | TEXT | | |
| created_at | TIMESTAMPTZ | DEFAULT now() | |
| updated_at | TIMESTAMPTZ | | |

#### 4.8 `plano_alimentar_item`

| Campo | Tipo | Constraints | Descrição |
|-------|------|------------|-----------|
| id | UUID | PK | |
| plano_alimentar_id | UUID | FK → plano_alimentar, NOT NULL, ON DELETE CASCADE | |
| ordem | INTEGER | NOT NULL | Ordem dentro da refeição |
| refeicao | TEXT | NOT NULL | "Café da manhã", "Almoço", etc. |
| horario_sugerido | TIME | | |
| alimento | TEXT | NOT NULL | |
| quantidade | TEXT | | "100g", "1 xícara", "2 unidades" |
| unidade | TEXT | | g, ml, unidade, xicara, colher |
| calorias | DECIMAL(7,2) | | kcal |
| proteinas | DECIMAL(5,2) | | g |
| carboidratos | DECIMAL(5,2) | | g |
| gorduras | DECIMAL(5,2) | | g |
| substituicoes | JSONB | | [{alimento, quantidade, calorias, proteinas, car

---

## 5. Nível 1 — Atendimento Básico

> **Dependências:** Nenhuma (é o primeiro nível)  
> **Duração estimada:** 4–6 semanas  
> **Escopo:** Cadastro de paciente, agendamento, registro de consulta, plano alimentar em PDF

### 5.1 Funcionalidades

#### 5.1.1 Cadastro do Paciente

**Tela:** Formulário de cadastro com validação em tempo real

**Campos:**
- Nome (obrigatório, min 2 caracteres)
- Data de nascimento (obrigatório, calcula idade automaticamente)
- Sexo (obrigatório: M, F, Outro)
- Telefone (formato brasileiro, validação de DDD)
- Email (validação de formato, verificação de duplicidade por clínica)
- CPF (opcional, validação de dígitos verificadores, criptografado)
- Queixa principal (texto livre)
- Tags sugeridas: emagrecimento, ganho de massa, reeducação alimentar, gestante, esporte, patologia
- Consentimento LGPD (checkbox obrigatório com link para termo)

**Regras de Negócio:**
- Duplicidade verificada por (email + clinica_id) OU (cpf + clinica_id)
- Se duplicado, sugere visualizar cadastro existente
- Nutricionista responsável é o usuário logado (auto-atribuição)

**Wireframe descrito:**
```
┌─────────────────────────────────────────┐
│  📋 Cadastro de Paciente                │
├─────────────────────────────────────────┤
│                                         │
│  Nome *         [___________________]   │
│  Data Nasc. *   [__/__/____]           │
│  Sexo *         (○ M  ○ F  ○ Outro)    │
│  Telefone       [(__) _____-____]       │
│  Email          [___________________]   │
│  CPF            [___.___.___-__]        │
│                                         │
│  ── Queixa Principal ──                 │
│  Tags: [emagrecimento] [ganho massa]    │
│        [reeducação] [gestante]          │
│  Descrição: [_________________________] │
│              [_________________________] │
│                                         │
│  ☑ Li e aceito os termos de             │
│    consentimento (LGPD) [ver termo →]   │
│                                         │
│  [Cancelar]              [Cadastrar →]  │
└─────────────────────────────────────────┘
```

#### 5.1.2 Agendamento

**Tela:** Calendário visual tipo Google Calendar

**Funcionalidades:**
- Visualização diária/semanal/mensal
- Criação de consulta com: paciente (busca), data/hora, duração, tipo (primeira/retorno)
- Bloqueio de horários: feriados (nacionais + configuráveis), férias do nutricionista, horário de almoço
- Configuração de horários disponíveis por nutricionista (ex: seg-sex 8h-12h, 14h-18h)
- Regra de antecedência mínima para cancelamento (configurável, padrão 24h)
- Envio de lembrete automático por email/WhatsApp na janela configurável (padrão: 24h antes)

**Wireframe descrito:**
```
┌──────────────────────────────────────────────────────┐
│  📅 Agenda — Agosto 2026                    [Hoje]  │
│  ← Semana anterior    Semana atual    Semana →      │
├──────┬──────┬──────┬──────┬──────┬──────┬──────┤
│  Seg │  Ter │  Qua │  Qui │  Sex │  Sáb │  Dom │
├──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ 08:00│      │ 08:00│      │ 08:00│      │      │
│ 🟢Ana│      │ 🔵Car│      │ 🟢Ana│      │      │
│ 09:00│ 09:00│      │ 09:00│      │      │      │
│ 🔵Mar│ 🟡Jos│      │ 🔵Ped│      │      │      │
│      │      │      │      │      │      │      │
│ 🟢 = Agendada  🔵 = Confirmada  🟡 = Pendente    │
└──────┴──────┴──────┴──────┴──────┴──────┴──────┘
```

**Lembrete por WhatsApp:**
- Integração com Evolution API (self-hosted) ou Z-API
- Template: "Olá {nome}! Lembrete: sua consulta com {nutricionista} está marcada para {data} às {hora}. Confirme sua presença!"
- Botão de confirmação via link (GET /api/confirmar?id={consulta_id})

#### 5.1.3 Registro da Consulta

**Tela:** Pós-consulta com abas

**Aba 1 — Anamnese:**
- Formulário estruturado com os campos da entidade anamnese
- Campos: queixa principal, alimentação atual, rotina diária, restrições alimentares, alergias, histórico familiar, medicações, atividade física, sono, estresse
- Textarea para observações livres

**Aba 2 — Medidas:**
- Formulário de entrada: peso (kg), altura (m)
- IMC calculado automaticamente e exibido com classificação

**Classificação do IMC (OMS):**
| Faixa | Classificação |
|-------|--------------|
| < 18.5 | Abaixo do peso |
| 18.5–24.9 | Peso normal |
| 25.0–29.9 | Sobrepeso |
| 30.0–34.9 | Obesidade grau I |
| 35.0–39.9 | Obesidade grau II |
| ≥ 40.0 | Obesidade grau III |

**Aba 3 — Plano Alimentar:**
- Editor de plano com refeições e alimentos
- Entrada: meta calórica → distribuição automática por refeição
- Cálculo de macros

#### 5.1.4 Geração de PDF

**Template:** HTML/CSS convertido para PDF via Playwright

**Conteúdo do PDF:**
1. Cabeçalho com logo e identidade visual da clínica
2. Dados do paciente (nome, idade)
3. Data e tipo de consulta
4. Resumo de medidas (peso, altura, IMC)
5. Plano alimentar completo (tabela por refeição)
6. Observações e orientações
7. Rodapé com dados da clínica e assinatura do nutricionista

**Envio automático:**
- Após salvar o plano, botão "Enviar por Email" e "Enviar por WhatsApp"
- Email via Resend: template HTML responsivo + PDF em anexo
- WhatsApp via Evolution API: resumo em texto + PDF como documento

### 5.2 Endpoints API — Nível 1

#### Autenticação
```
POST /api/auth/signup          → Cadastro de nutricionista
POST /api/auth/login           → Login (email + senha)
POST /api/auth/logout          → Logout
POST /api/auth/reset-password  → Redefinição de senha
GET  /api/auth/me              → Dados do usuário logado
```

#### Pacientes
```
GET    /api/pacientes                 → Listar pacientes (paginado, busca)
GET    /api/pacientes/:id             → Detalhes do paciente
POST   /api/pacientes                 → Cadastrar paciente
PUT    /api/pacientes/:id             → Atualizar paciente
DELETE /api/pacientes/:id             → Inativar paciente (soft delete)
GET    /api/pacientes/:id/historico   → Histórico de medidas e consultas
GET    /api/pacientes/check-dup       → Verificar duplicidade
```

**GET /api/pacientes → Listar**
```json
// Query params: ?page=1&limit=20&search=ana&status=ativo&sort=nome
// Response:
{
  "data": [
    {
      "id": "uuid",
      "nome": "Ana Silva",
      "data_nascimento": "1990-05-15",
      "idade": 36,
      "sexo": "F",
      "telefone": "(11) 99999-1234",
      "email": "ana@email.com",
      "status": "ativo",
      "ultima_consulta": "2026-08-20T10:00:00Z",
      "proximo_retorno": "2026-09-20T10:00:00Z",
      "peso_atual": 72.5,
      "imc_atual": 26.8
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 45, "pages": 3 }
}
```

**POST /api/pacientes → Cadastrar**
```json
// Request:
{
  "nome": "Ana Silva",
  "data_nascimento": "1990-05-15",
  "sexo": "F",
  "telefone": "(11) 99999-1234",
  "email": "ana@email.com",
  "cpf": "123.456.789-00",
  "queixa_principal": "Emagrecimento",
  "tags": ["emagrecimento"],
  "consentimento_lgpd": true,
  "consentimento_lgpd_versao": "1.0"
}
// Response: 201 Created → { data: { id: "uuid", ... } }
```

#### Consultas
```
GET    /api/consultas                  → Listar consultas (filtros)
GET    /api/consultas/:id              → Detalhes da consulta
POST   /api/consultas                  → Criar consulta (agendar)
PUT    /api/consultas/:id              → Atualizar consulta
PUT    /api/consultas/:id/status       → Alterar status
GET    /api/consultas/calendario       → Dados para calendário
POST   /api/consultas/:id/confirmar    → Paciente confirma (link público)
```

**POST /api/consultas → Criar**
```json
// Request:
{
  "paciente_id": "uuid",
  "data_hora": "2026-09-20T10:00:00-03:00",
  "duracao_minutos": 60,
  "tipo": "retorno",
  "valor": 200.00
}
// Response: 201 Created → { data: { id: "uuid", status: "agendada", ... } }
```

#### Anamnese
```
GET    /api/anamneses/:consulta_id    → Buscar anamnese
POST   /api/anamneses                  → Criar/salvar anamnese
PUT    /api/anamneses/:id              → Atualizar anamnese
GET    /api/anamneses/publico/:token   → Formulário público
POST   /api/anamneses/publico          → Submissão pública
```

#### Medidas
```
GET    /api/medidas/:paciente_id       → Histórico de medida

---

## 6. Nível 2 — Acompanhamento e Organização

> **Dependências:** Nível 1  
> **Duração estimada:** 4–6 semanas  
> **Escopo:** Prontuário evolutivo, plano alimentar dinâmico, lembretes avançados, gestão financeira

### 6.1 Funcionalidades

#### 6.1.1 Prontuário Evolutivo

**Funcionalidades:**
- Timeline cronológica de consultas com: data, tipo, medidas (peso, IMC, circunferências), anotações
- Comparação entre consultas: variação absoluta e percentual
- Gráfico de evolução de peso e IMC ao longo do tempo (Recharts)
- Gráfico de evolução de circunferências
- Notas livres com sistema de tags (ex: #sono_ruim, #ansiedade, #aderencia_boa)
- Percentual de aderência ao plano alimentar

**Wireframe descrito:**
```
┌────────────────────────────────────────────────────────┐
│  📊 Prontuário — Ana Silva (36 anos)                   │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌─ Evolução de Peso ──────────────────────────────┐  │
│  │  75─┤         ╭──╮                              │  │
│  │  73─┤    ╭───╯  ╰──╮                           │  │
│  │  71─┤───╯           ╰──╮                       │  │
│  │  69─┤                  ╰───                    │  │
│  │     └────┬────┬────┬────┬────                  │  │
│  │        Jun  Jul  Ago  Set  Out                  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─ Timeline ───────────────────────────────────────┐  │
│  │  ● 20/09/2026 — Retorno                         │  │
│  │    Peso: 71.2kg (-1.3kg) | IMC: 26.1 (-0.5)    │  │
│  │    Tags: #aderencia_boa #sono_melhorou           │  │
│  │                                                   │  │
│  │  ● 20/08/2026 — Retorno                         │  │
│  │    Peso: 72.5kg (-2.0kg) | IMC: 26.6 (-0.7)    │  │
│  │    Tags: #aderencia_media #ansiedade             │  │
│  │                                                   │  │
│  │  ● 20/07/2026 — Primeira Consulta               │  │
│  │    Peso: 74.5kg | IMC: 27.3                     │  │
│  │    Queixa: Emagrecimento                         │  │
│  └─────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

#### 6.1.2 Plano Alimentar Dinâmico

**Funcionalidades:**
- Distribuição automática de calorias por refeição (proporção configurável, padrão: café 20%, lanche 10%, almoço 30%, lanche 15%, jantar 20%, ceia 5%)
- Algoritmo de substituição automática dentro de grupos alimentares
- Grupos alimentares: proteínas magras, proteínas gordas, carboidratos simples, carboidratos complexos, verduras, frutas, laticínios, gorduras boas, gorduras ruins
- Biblioteca de alimentos TACO (~600 alimentos)
- Versão em tabela HTML responsiva para o paciente
- Histórico de versões do plano

**Algoritmo de Substituição:**
```
function encontrarSubstituto(alimentoOriginal, grupoAlimentar):
  candidatos = buscarPorGrupo(grupoAlimentar)
    .filter(a => a.id != alimentoOriginal.id)
    .filter(a => abs(a.caloriasPor100g - alimentoOriginal.caloriasPor100g) / alimentoOriginal.caloriasPor100g <= 0.10)
    .sort((a, b) => abs(a.proteinas - alimentoOriginal.proteinas) - abs(b.proteinas - alimentoOriginal.proteinas))
  
  return candidatos[0] // melhor match
```

#### 6.1.3 Lembretes e Follow-up

**Funcionalidades:**
- Check-in semanal automático (Inngest cron: segunda às 10h)
- Alerta ao nutricionista quando paciente não registra há X dias (padrão: 14)
- Templates de mensagem editáveis com variáveis dinâmicas

**Variáveis disponíveis:** `{nome_paciente}`, `{data_consulta}`, `{proxima_consulta}`, `{peso_atual}`, `{link_app}`

**Implementação via Inngest:**
```typescript
inngest.createFunction(
  { id: "checkin-semanal" },
  { cron: "0 10 * * 1" }, // toda segunda às 10h
  async ({ event, step }) => {
    const pacientes = await step.run("buscar-pacientes-ativos", async () => {
      return db.paciente.findMany({
        where: { status: "ativo", clinica_id: event.data.clinica_id }
      });
    });
    
    for (const paciente of pacientes) {
      const ultimoRegistro = await step.run(`verificar-${paciente.id}`, async () => {
        return db.diarioAlimentar.findFirst({
          where: { paciente_id: paciente.id },
          orderBy: { data: "desc" }
        });
      });
      
      if (ultimoRegistro && daysSince(ultimoRegistro.data) > 14) {
        await step.run(`alertar-${paciente.id}`, async () => {
          await notificarNutricionista(paciente, "Paciente sem registro há 14+ dias");
        });
      }
    }
  }
);
```

#### 6.1.4 Gestão Financeira Básica

**Funcionalidades:**
- Controle de sessões: cada consulta gera transação financeira automaticamente
- Status de pagamento: pago, pendente, parcial, isento
- Recibos em PDF com numeração sequencial por clínica
- Pacotes de consultas: compra de N sessões com crédito decrementado
- Relatório mensal de faturamento

### 6.2 Endpoints API — Nível 2 (adições)

#### Prontuário
```
GET    /api/prontuarios/:paciente_id                → Dados completos
GET    /api/prontuarios/:paciente_id/timeline       → Timeline
GET    /api/prontuarios/:paciente_id/comparacao     → Comparação entre consultas
GET    /api/prontuarios/:paciente_id/graficos       → Dados para gráficos
GET    /api/prontuarios/:paciente_id/aderencia      → Percentual de aderência
```

**GET /api/prontuarios/:paciente_id/aderencia**
```json
{
  "data": {
    "periodo": { "inicio": "2026-08-01", "fim": "2026-08-31" },
    "dias_com_registro": 22,
    "dias_totais": 31,
    "percentual_aderencia": 71.0,
    "calorias_media_diaria": 1750,
    "calorias_meta": 1800,
    "desvio_calorico": -2.8,
    "proteinas_media": 128,
    "carboidratos_media": 195,
    "gorduras_media": 48
  }
}
```

#### Biblioteca de Alimentos
```
GET    /api/alimentos                    → Buscar alimentos (TACO + custom)
GET    /api/alimentos/:id                → Detalhes nutricionais
GET    /api/alimentos/grupos             → Grupos alimentares
POST   /api/alimentos                    → Adicionar alimento custom
GET    /api/alimentos/substituicoes/:id  → Substitutos sugeridos
```

#### Lembretes
```
GET    /api/lembretes/configuracao       → Configuração atual
PUT    /api/lembretes/configuracao       → Atualizar
GET    /api/lembretes/templates          → Templates
PUT    /api/lembretes/templates/:id      → Atualizar template
GET    /api/lembretes/historico          → Histórico de envios
```

#### Financeiro
```
GET    /api/financeiro/transacoes                → Listar transações
POST   /api/financeiro/transacoes                → Criar transação
PUT    /api/financeiro/transacoes/:id/pagamento  → Registrar pagamento
GET    /api/financeiro/pacotes                   → Pacotes do paciente
POST   /api/financeiro/pacotes                   → Criar pacote
PUT    /api/financeiro/pacotes/:id/decrementar   → Decrementar crédito
GET    /api/financeiro/recibos/:id               → Gerar recibo PDF
GET    /api/financeiro/relatorio-mensal          → Relatório do mês
```

### 6.3 Fórmulas Adicionais

**Distribuição de calorias por refeição (padrão):**
```
Café da manhã:  20% das calorias → arredondar para múltiplo de 5
Lanche manhã:   10%
Almoço:         30%
Lanche tarde:   15%
Jantar:         20%
Ceia:            5%

Validação: soma == calorias_meta (±5 kcal tolerância)
```

**Percentual de aderência:**
```
aderencia = (dias_com_registro / dias_no_periodo) × 100

Classificação:
  ≥ 80%: Ótima
  60-79%: Boa
  40-59%: Regular
  < 40%: Baixa → alerta ao nutricionista
```

### 6.4 Critérios de Aceite — Nível 2

| # | Critério | Prioridade |
|---|---------|-----------|
| N2-01 | Timeline mostra consultas com medidas e variações | P0 |
| N2-02 | Gráficos de peso e IMC são renderizados corretamente | P0 |
| N2-03 | Comparação entre consultas mostra variações absolutas e % | P0 |
| N2-04 | Plano alimentar distribui calorias por refeição | P0 |
| N2-05 | Substituição de alimentos respeita grupo e macros | P1 |
| N2-06 | Biblioteca TACO tem ≥500 alimentos | P0 |
| N2-07 | Check-in semanal é enviado automaticame

---

## 7. Nível 3 — Avaliação Nutricional Avançada

> **Dependências:** Nível 2  
> **Duração estimada:** 6–8 semanas  
> **Escopo:** Composição corporal, análise de consumo, protocolos clínicos

### 7.1 Funcionalidades

#### 7.1.1 Composição Corporal

**Métodos suportados:**

| Método | Fórmula | Campos de Entrada |
|--------|---------|-------------------|
| **Pollock 3 dobras** (homens) | D = 1.1043 - 0.0009929×(Σ3) + 0.0000023×(Σ3)² - 0.0001392×(idade) | Peitoral, Abdominal, Coxa |
| **Pollock 3 dobras** (mulheres) | D = 1.0994921 - 0.0009929×(Σ3) + 0.0000023×(Σ3)² - 0.0001392×(idade) | Tríceps, Suprailíaca, Coxa |
| **Pollock 7 dobras** | D = 1.112 - 0.00043499×(Σ7) + 0.00000055×(Σ7)² - 0.00028826×(idade) | Peitoral, Axilar média, Tríceps, Subescapular, Abdominal, Suprailíaca, Coxa |
| **Faulkner** | D = 1.2294 - 0.00056×(Σ4) + 0.0000021×(Σ4)² - 0.00023×(idade) | Tríceps, Bíceps, Subescapular, Suprailíaca |
| **Bioimpedância direta** | Valores medidos pelo aparelho (sem cálculo) | % gordura, massa magra, água corporal |

> D = densidade corporal → converte para % gordura via Siri

**Conversão Densidade → % Gordura (Siri):**
```
% gordura = (495 / D) - 450
```

**Massa Magra e Massa Gordura:**
```
massa_gordura = peso × (% gordura / 100)
massa_magra = peso - massa_gordura
```

**Taxa Metabólica Basal (Harris-Benedict revisada):**
```
Homens:  TMB = 88.362 + (13.397 × peso_kg) + (4.799 × altura_cm) - (5.677 × idade)
Mulheres: TMB = 447.593 + (9.247 × peso_kg) + (3.098 × altura_cm) - (4.330 × idade)
```

**Gasto Energético Total (TDEE):**
```
Sedentário (pouco ou nenhum exercício):        TMB × 1.2
Levemente ativo (1-3 dias/semana):             TMB × 1.375
Moderadamente ativo (3-5 dias/semana):         TMB × 1.55
Muito ativo (6-7 dias/semana):                 TMB × 1.725
Extremamente ativo (atleta):                   TMB × 1.9
```

**Gráficos:**
- Evolução de % gordura, massa magra, água corporal ao longo do tempo
- Composição corporal atual (gráfico de pizza/barras empilhadas)
- Comparação com faixas de referência por idade e sexo

#### 7.1.2 Análise de Consumo

**Cálculo de consumo médio:**
```
consumo_medio_calorias = SUM(calorias_diario) / COUNT(dias_com_registro)
consumo_medio_proteinas = SUM(proteinas_diario) / COUNT(dias_com_registro)

delta_calorico = consumo_medio_calorias - calorias_meta
percentual_desvio = (delta_calorico / calorias_meta) × 100

Classificação de desvio:
  |percentual_desvio| ≤ 5%:  Dentro do esperado
  5% < |percentual_desvio| ≤ 15%: Desvio leve
  15% < |percentual_desvio| ≤ 30%: Desvio moderado → alerta
  |percentual_desvio| > 30%: Desvio significativo → alerta urgente
```

**Detecção de padrões:**
```typescript
function detectarPadroes(paciente_id: string, dias: number = 10): Padrao[] {
  const registros = await buscarRegistros(paciente_id, { ultimosDias: dias });
  const padroes: Padrao[] = [];
  
  for (const nutriente of ['ferro', 'calcio', 'zinco', 'vitamina_d']) {
    const dias_baixos = registros.filter(
      r => r.micronutrientes[nutriente] < RECOMENDACAO[nutriente] * 0.7
    );
    if (dias_baixos.length >= dias * 0.7) {
      padroes.push({
        tipo: "consumo_baixo",
        nutriente,
        frequencia: dias_baixos.length,
        periodo: dias,
        mensagem: `Baixo consumo de ${nutriente} em ${dias_baixos.length} dos últimos ${dias} dias`
      });
    }
  }
  
  return padroes;
}
```

#### 7.1.3 Protocolos Clínicos

**Estrutura configurável (JSON, não hardcode):**

Cada protocolo define:
1. **Campos específicos:** Quais dados coletar além da anamnese padrão
2. **Template de plano:** Template de plano alimentar base para a condição
3. **Alertas:** Regras de contraindicação
4. **Metas terapêuticas:** Parâmetros alvo

**Exemplo — Diabetes Tipo 2:**
```json
{
  "nome": "Diabetes Tipo 2",
  "campos_especificos": {
    "glicemia_jejum": {"tipo": "number", "unidade": "mg/dL", "normal": [70, 100], "alerta": [126, Infinity]},
    "glicemia_pos_prandial_2h": {"tipo": "number", "unidade": "mg/dL", "normal": [70, 140], "alerta": [200, Infinity]},
    "hba1c": {"tipo": "number", "unidade": "%", "normal": [4.0, 5.7], "alerta": [7.0, Infinity]},
    "medicacoes": {"tipo": "text", "obrigatorio": true},
    "frequencia_glicemia_capilar": {"tipo": "select", "opcoes": ["jejum", "pre_prandial", "pos_prandial", "4h", "personalizado"]}
  },
  "template_plano": {
    "restricoes": ["açúcar refinado", "doces em excesso", "pão branco"],
    "diretrizes": ["Distribuição de carboidratos em 5-6 refeições", "Índice glicêmico baixo", "Fibras ≥ 25g/dia"],
    "macros_sugeridos": {"proteinas": 25, "carboidratos": 45, "gorduras": 30}
  },
  "alertas": [
    {"condicao": "glicemia_jejum > 200", "mensagem": "⚠️ Glicemia muito elevada. Considerar encaminhamento ao endocrinologista.", "severidade": "alta"},
    {"condicao": "hba1c > 9.0", "mensagem": "⚠️ Controle glicêmico inadequado. Revisar conduta farmacológica.", "severidade": "alta"},
    {"condicao": "imc > 35 AND diabetes == true", "mensagem": "Considere encaminhamento para avaliação bariátrica.", "severidade": "media"}
  ]
}
```

### 7.2 Endpoints API — Nível 3 (adições)

#### Composição Corporal
```
GET    /api/composicao-corporal/:paciente_id         → Histórico completo
GET    /api/composicao-corporal/:paciente_id/ultima  → Última avaliação
POST   /api/composicao-corporal                      → Registrar avaliação
GET    /api/composicao-corporal/:paciente_id/graficos → Dados para gráficos
POST   /api/composicao-corporal/calculadora          → Calcular a partir de dobras
```

**POST /api/composicao-corporal/calculadora**
```json
// Request:
{
  "metodo": "pollock_3_dobras",
  "sexo": "F",
  "idade": 36,
  "peso": 72.5,
  "dobras": { "triceps": 22.5, "suprailiaca": 18.0, "coxa": 25.0 }
}
// Response:
{
  "data": {
    "densidade": 1.0452,
    "percentual_gordura": 21.3,
    "massa_gordura": 15.44,
    "massa_magra": 57.06,
    "classificacao": "adequado",
    "formula_utilizada": "Pollock 3 dobras (feminino)"
  }
}
```

#### Análise de Consumo
```
GET    /api/analise-consumo/:paciente_id               → Resumo de consumo
GET    /api/analise-consumo/:paciente_id/comparacao    → Real vs. prescrito
GET    /api/analise-consumo/:paciente_id/padroes       → Padrões detectados
GET    /api/analise-consumo/:paciente_id/alertas       → Alertas ativos
```

#### Protocolos
```
GET    /api/protocolos                          → Listar protocolos disponíveis
GET    /api/protocolos/:id                      → Detalhes do protocolo
POST   /api/protocolos                          → Criar protocolo custom
PUT    /api/protocolos/:id                      → Atualizar protocolo
POST   /api/protocolos/:id/aplicar/:paciente_id → Associar ao paciente
GET    /api/pacientes/:id/protocolos            → Protocolos ativos do paciente
PUT    /api/pacientes/:id/protocolos/:protocolo_id → Atualizar dados específicos
GET    /api/pacientes/:id/alertas               → Alertas de contraindicação
```

### 7.3 Critérios de Aceite — Nível 3

| # | Critério | Prioridade |
|---|---------|-----------|
| N3-01 | Cálculo de % gordura por Pollock 3 e 7 dobras está correto | P0 |
| N3-02 | Cálculo de % gordura por Faulkner está correto | P1 |
| N3-03 | Dados de bioimpedância são registrados sem cálculo automático | P0 |
| N3-04 | Gráficos de composição corporal exibem evolução correta | P0 |
| N3-05 | Análise de consumo calcula médias corretas | P0 |
| N3-06 | Comparação real vs. prescrito mostra deltas corretos | P0 |
| N3-07 | Detecção de padrões identifica desvios consistentes | P1 |
| N3-08 | Protocolos são configuráveis via JSON (não hardcode) | P0 |
| N3-09 | Alertas de contraindicação disparam corretamente | P0 |
| N3-10 | Template de plano por protocolo é aplicado ao criar plano | P1 |
| N3-11 | TMB e TDEE são calculados corretamente | P0 |

---

## 8. Nível 4 — Automação e Experiência do Paciente

> **Dependências:** Nível 2 (mínimo), Nível 3 (para dados de composição corporal no app)  
> **Duração estimada:** 8–12 semanas  
> **Escopo:** App mobile, automações, integrações com dispositivos

### 8.1 App do Paciente — React Native + Expo

#### 8.1.1 Telas Principais

**Home (Dashboard do Paciente):**
```
┌──────────────────────────────┐
│  Nutri Atende 🥗             │
│  Olá, Ana!                   │
├──────────────────────────────┤
│  📊 Resumo da Semana         │
│  ├ Peso atual: 71.2 kg      │
│  ├ Meta: 68 kg              │
│  ├ Registros: 5/7 dias      │
│  └ Calorias médias: 1750    │
├──────────────────────────────┤
│  📅 Próxima consulta:        │
│  20/09 às 10:00              │
├──────────────────────────────┤
│  🍽️ Registrar Refeição       │
│  ┌──────────────────────┐    │
│  │ 🔍 Buscar alimento...│    │
│  └──────────────────────┘    │
├──────────────────────────────┤
│  📋 Meu Plano Alimentar      │
│  └ Ver plano atual →         │
├──────────────────────────────┤
│  💬 Mensagens (1 nova)       │
└──────────────────────────────┘
```

**Diário Alimentar (offline-first):**
- Busca por alimentos com autocomplete (local + sync com tabela TACO)
- Entry rápida: alimento, quantidade, refeição
- Foto do prato (câmera)
- Sugestões baseadas no horário
- Status visual: ✅ registrado, ⚠️ pendente, ❌ não registrado

**Plano Alimentar:**
- Tabela visual do plano atual
- Substituições sugeridas pelo nutricionista
- Download para consulta offline

**Medidas:**
- Registro de peso e circunferências
- Validação de plausibilidade (peso: 20-300kg, IMC: 10-70)
- Gráfico pessoal de evolução

**Chat:**
- Mensagens assíncronas com nutricionista
- Notificações push para ambas as partes
- Histórico de conversas

#### 8.1.2 Arquitetura Offline-First

```
┌─────────────────────────────────────────────┐
│  React Native App                           │
│  ┌─────────────────────────────────────┐    │
│  │  WatermelonDB (SQLite)              │    │
│  │  - diario_alimentar (cache local)   │    │
│  │  - plano_alimentar (read-only)      │    │
│  │  - medidas (cache local)            │    │
│  │  - alimentos (tabela TACO local)    │    │
│  └──────────────┬──────────────────────┘    │
│                 │                            │
│  ┌──────────────▼──────────────────────┐    │
│  │  Sync Engine (CRDTs)                │    │
│  │  - Last-Write-Wins para conflitos   │    │
│  │  - Vector clocks para ordenação     │    │
│  │  - Sync diferencial (apenas delta)  │    │
│  └──────────────┬──────────────────────┘    │
│                 │                            │
└─────────────────┼────────────────────────────┘
                  │ (quando online)
                  ▼
┌─────────────────────────────────────────────┐
│  Supabase (Realtime + API)                  │
│  - Push de dados locais                     │
│  - Pull de dados remotos                    │
│  - Realtime para chat e notificações        │
└─────────────────────────────────────────────┘
```

**WatermelonDB Schema:**
```typescript
export const diarioAlimentarSchema = {
  name: 'diario_alimentar',
  columns: [
    { name: 'sync_id', type: 'string' },
    { name: 'paciente_id', type: 'string' },
    { name: 'data', type: 'string' },
    { name: 'refeicao', type: 'string' },
    { name: 'alimento', type: 'string' },
    { name: 'quantidade', type: 'string' },
    { name: 'calorias', type: 'number' },
    { name: 'proteinas', type: 'number' },
    { name: 'carboidratos', type: 'number' },
    { name: 'gorduras', type: 'number' },
    { name: 'origem', type: 'string' },
    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' },
    { name: 'synced', type: 'boolean' },  // false = pendente de sync
  ]
}
```

**Estratégia de sincronização:**
1. Dados locais são salvos imediatamente no WatermelonDB
2. Flag `synced = false` indica dados pendentes
3. Ao reconectar, Engine envia apenas dados com `synced = false`
4. Resolução de conflitos: Last-Write-Wins (com `updated_at`)
5. Dados do servidor são a fonte de verdade após sync

### 8.2 Automações

**Regras configuráveis (trigger → action):**

| Trigger | Action | Configurável? |
|---------|--------|--------------|
| Horário definido pelo paciente | Push: "Hora de registrar sua refeição!" | Sim (horário) |
| Paciente não registra há X dias | Alerta ao nutricionista | Sim (dias, padrão 7) |
| Paciente registra sintoma novo | Push ao nutricionista em tempo real | Não (sempre ativo) |
| Relatório semanal (domingo) | Resumo enviado ao nutricionista | Sim (ativar/desativar) |
| Paciente atinge meta de peso | Parabéns push + alerta ao nutricionista | Sim |
| Consulta agendada em 24h | Lembrete ao paciente | Sim (antecedência) |

**Implementação com Inngest:**
```typescript
export const lembreteDiario = inngest.createFunction(
  { id: "lembrete-diario" },
  { cron: "*/30 * * * *" }, // a cada 30 minutos
  async ({ step }) => {
    const agora = new Date();
    const horaAtual = `${agora.getHours()}:${String(agora.getMinutes()).padStart(2, '0')}`;
    
    const pacientes = await step.run("buscar-pacientes", async () => {
      return db.paciente.findMany({
        where: { status: "ativo" },
        include: { configuracoes_notificacao: true }
      });
    });
    
    for (const p of pacientes) {
      if (p.configuracoes_notificacao?.horario_lembrete === horaAtual) {
        await step.run(`enviar-${p.id}`, async () => {
          await sendPushNotification(p.push_token, {
            title: "🥗 Hora de registrar!",
            body: `Olá ${p.nome.split(' ')[0]}! Não esqueça de registrar sua refeição.`,
            data: { screen: "diario" }
          });
        });
      }
    }
  }
);
```

### 8.3 Integrações com Dispositivos

**Webhook Receivers (Fastify service):**
```
POST /webhooks/withings         → Dados de peso e composição
POST /webhooks/apple-health     → Dados de atividade (via relay)
POST /webhooks/dexcom           → Glicemia contínua
POST /webhooks/freestyle-libre  → Glicemia contínua
```

**Mapeamento de dados externos → entidades internas:**

| Dispositivo | Campo Externo | Entidade Interna | Campo |
|-------------|--------------|-------------------|-------|
| Withings (balança) | weight | medidas | peso |
| Withings (balança) | fat_ratio | medidas | percentual_gordura |
| Withings (balança) | fat_mass | medidas | massa_gordura |
| Apple Health | step_count | diario_atividade | passos |
| Apple Health | active_energy_burned | diario_atividade | calorias_queimadas |
| Dexcom | glucose_value | diario_glicemia | glicemia |
| FreeStyle Libre | glucose_value | diario_glicemia | glicemia |

**Entidades adicionais (Nível 4):**
```sql
CREATE TABLE diario_atividade (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES paciente(id) NOT NULL,
  data DATE NOT NULL,
  passos INTEGER,
  calorias_queimadas DECIMAL(7,2),
  minutos_ativos INTEGER,
  distancia_km DECIMAL(5,2),
  sono_minutos INTEGER,
  qualidade_sono DECIMAL(3,1), -- 1-10
  origem TEXT NOT NULL, -- apple_health, google_fit, manual
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(paciente_id, data, origem)
);

CREATE TABLE diario_glicemia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES paciente(id) NOT NULL,
  data_hora TIMESTAMPTZ NOT NULL,
  glicemia DECIMAL(5,1) NOT NULL, -- mg/dL
  tipo TEXT, -- jejum, pre_prandial, pos_prandial, cgm
  origem TEXT NOT NULL, -- dexcom, freestyle_libre, glicometro, manual
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 8.4 Endpoints API — Nível 4 (adições)

#### App Endpoints
```
GET    /api/mobile/diario-alimentar/dia/:data  → Registros do dia
POST   /api/mobile/diario-alimentar            → Criar registro
PUT    /api/mobile/diario-alimentar/:id        → Atualizar
GET    /api/mobile/plano-alimentar/ativo       → Plano atual
GET    /api/mobile/medidas/ultima              → Última avaliação
POST   /api/mobile/medidas                     → Registrar medidas
GET    /api/mobile/mensagens                   → Chat
POST   /api/mobile/mensagens                   → Enviar mens

---

## 9. Nível 5 — Gestão da Clínica e Analytics

> **Dependências:** Níveis 1–4  
> **Duração estimada:** 6–8 semanas  
> **Escopo:** Dashboard gerencial, relatórios, multiusuário, auditoria

### 9.1 Funcionalidades

#### 9.1.1 Dashboard Clínico

**Visão geral:**
```
┌──────────────────────────────────────────────────────────┐
│  📊 Dashboard Clínico — Nutri Atende Clínica            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Pacientes│ │ Consultas│ │ Faturamento│ │ Aderência │   │
│  │ Ativos:  │ │ Hoje: 8  │ │ Mês: R$8.500│ │ Média: 72%│   │
│  │ 127      │ │ Semana: 34│ │ Pendente:  │ │           │   │
│  │          │ │          │ │ R$2.100    │ │           │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                          │
│  ┌─ Pacientes em Risco ──────────────────────────────┐  │
│  │ 🔴 Maria S. — Sem retorno há 75 dias              │  │
│  │ 🔴 Pedro A. — Ganho de 3kg em plano emagrecimento │  │
│  │ 🟡 Ana B. — Aderência caiu de 80% para 45%        │  │
│  │ 🟡 José C. — Consulta atrasada há 15 dias          │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Indicadores:**
- Taxa de retorno: consultas retorno / (primeira + retorno) × 100
- Tempo médio entre consultas: AVG(data_retorno - data_anterior)
- Aderência média: AVG(aderencia_pacientes)
- NPS: (promotores - detratores) / total × 100

**Alertas de risco (configuráveis):**
- Sem retorno há mais de 60 dias
- Ganho de peso > 2kg em plano de emagrecimento
- Queda de aderência > 30% comparado ao período anterior
- Paciente inativo há mais de 90 dias

#### 9.1.2 Relatórios

**Relatório Individual por Paciente:**
- Timeline completa com gráficos
- Todas as medidas e composição corporal
- Histórico de planos alimentares
- Análise de consumo e aderência
- Exportação em PDF

**Relatório Gerencial:**
- Consultas por mês/gráfico
- Faturamento por período
- Taxa de retenção de pacientes
- Taxa de no-show
- Produtividade por nutricionista
- Exportação em CSV/XLSX

**Relatório Financeiro:**
- Receita por período
- Pagamentos pendentes
- Pacotes ativos e créditos restantes
- Receita por nutricionista

#### 9.1.3 Multiusuário

**Matriz de Permissões:**

| Recurso | Nutricionista | Estagiário | Recepcionista | Admin |
|---------|:---:|:---:|:---:|:---:|
| Ver todos os pacientes da clínica | ✅ | ❌ (apenas atribuídos) | ✅ | ✅ |
| Cadastrar paciente | ✅ | ✅ | ✅ | ✅ |
| Editar dados do paciente | ✅ | ✅ | ✅ | ✅ |
| Excluir paciente | ❌ | ❌ | ❌ | ✅ |
| Criar/editar planos alimentares | ✅ | ✅ | ❌ | ❌ |
| Registrar medidas | ✅ | ✅ | ❌ | ❌ |
| Acessar prontuário completo | ✅ | ✅ | ❌ | ✅ |
| Ver dados financeiros | ✅ (próprios) | ❌ | ✅ | ✅ |
| Configurar clínica | ❌ | ❌ | ❌ | ✅ |
| Gerenciar usuários | ❌ | ❌ | ❌ | ✅ |
| Ver relatórios gerenciais | ✅ (próprios) | ❌ | ❌ | ✅ |
| Exportar dados | ✅ | ❌ | ❌ | ✅ |
| Ver audit log | ❌ | ❌ | ❌ | ✅ |

**Assinatura Digital:**
- Planos alimentares e laudos podem ser assinados digitalmente
- Integração com certificado ICP-Brasil (via API externa) ou assinatura eletrônica simples (aceite com timestamp)
- ⚠️ Para nutrição, geralmente não é obrigatório como para medicina

#### 9.1.4 Log de Auditoria

**O que é auditado:**
- CREATE, UPDATE, DELETE em todas as entidades de dados
- Login/logout
- Exportação de dados
- Acesso a dados sensíveis (CPF, prontuário)
- Alterações em configurações da clínica
- Alterações em permissões de usuários

### 9.2 Endpoints API — Nível 5 (adições)

#### Dashboard
```
GET    /api/dashboard/resumo              → KPIs gerais
GET    /api/dashboard/pacientes-risco     → Pacientes com alertas
GET    /api/dashboard/consultas-periodo   → Consultas por período
GET    /api/dashboard/faturamento-periodo → Faturamento por período
GET    /api/dashboard/produtividade       → Consultas por nutricionista
```

**GET /api/dashboard/resumo**
```json
{
  "data": {
    "pacientes_ativos": 127,
    "pacientes_inativos": 23,
    "pacientes_manutencao": 15,
    "consultas_hoje": 8,
    "consultas_semana": 34,
    "consultas_mes": 142,
    "faturamento_mes": 8500.00,
    "faturamento_pendente": 2100.00,
    "aderencia_media": 72.0,
    "taxa_retorno": 68.5,
    "tempo_medio_consultas_dias": 28.3,
    "taxa_noshow": 8.2
  }
}
```

#### Relatórios
```
GET    /api/relatorios/paciente/:id              → Relatório individual
GET    /api/relatorios/gerencial                 → Relatório gerencial
GET    /api/relatorios/financeiro                → Relatório financeiro
GET    /api/relatorios/exportar/csv/:tipo        → Exportar CSV
GET    /api/relatorios/exportar/xlsx/:tipo       → Exportar XLSX
POST   /api/relatorios/configuracoes             → Criar relatório recorrente
GET    /api/relatorios/configuracoes             → Listar configs
PUT    /api/relatorios/configuracoes/:id         → Atualizar config
```

#### Usuários
```
GET    /api/usuarios                    → Listar usuários da clínica
POST   /api/usuarios                    → Convidar usuário
PUT    /api/usuarios/:id                → Atualizar usuário
PUT    /api/usuarios/:id/permissoes     → Atualizar permissões
DELETE /api/usuarios/:id                → Desativar usuário
POST   /api/usuarios/:id/redefinir-senha → Enviar email de redefinição
```

#### Clínica
```
GET    /api/clinica/configuracoes       → Configurações completas
PUT    /api/clinica/configuracoes       → Atualizar configurações
PUT    /api/clinica/logo                → Upload do logo
```

#### Auditoria
```
GET    /api/audit-log                   → Listar logs (filtros)
GET    /api/audit-log/:id               → Detalhes do log
GET    /api/audit-log/exportar          → Exportar logs
```

### 9.3 Queries de Analytics

**Taxa de retorno:**
```sql
SELECT 
  COUNT(CASE WHEN tipo = 'retorno' THEN 1 END)::FLOAT / 
  NULLIF(COUNT(*), 0) * 100 AS taxa_retorno
FROM consulta
WHERE clinica_id = $1
  AND data_hora BETWEEN $2 AND $3
  AND status = 'realizada';
```

**Tempo médio entre consultas:**
```sql
WITH consultas_ordenadas AS (
  SELECT 
    paciente_id, 
    data_hora,
    LAG(data_hora) OVER (PARTITION BY paciente_id ORDER BY data_hora) AS data_anterior
  FROM consulta
  WHERE clinica_id = $1 AND status = 'realizada'
)
SELECT AVG(EXTRACT(EPOCH FROM (data_hora - data_anterior)) / 86400) AS tempo_medio_dias
FROM consultas_ordenadas
WHERE data_anterior IS NOT NULL;
```

**Pacientes em risco (sem retorno >60 dias):**
```sql
SELECT p.id, p.nome, MAX(c.data_hora) AS ultima_consulta,
  EXTRACT(EPOCH FROM (NOW() - MAX(c.data_hora))) / 86400 AS dias_sem_retorno
FROM paciente p
LEFT JOIN consulta c ON c.paciente_id = p.id AND c.status = 'realizada'
WHERE p.clinica_id = $1 AND p.status = 'ativo'
GROUP BY p.id, p.nome
HAVING MAX(c.data_hora) < NOW() - INTERVAL '60 days'
   OR MAX(c.data_hora) IS NULL
ORDER BY dias_sem_retorno DESC;
```

### 9.4 Critérios de Aceite — Nível 5

| # | Critério | Prioridade |
|---|---------|-----------|
| N5-01 | Dashboard exibe KPIs corretos e atualizados | P0 |
| N5-02 | Alertas de risco identificam pacientes corretamente | P0 |
| N5-03 | Filtros funcionam em todas as views do dashboard | P0 |
| N5-04 | Relatório individual contém todos os dados do paciente | P0 |
| N5-05 | Exportação CSV/XLSX funciona corretamente | P1 |
| N5-06 | Permissões são respeitadas (testar com cada perfil) | P0 |
| N5-07 | Assinatura digital pode ser aplicada a planos e laudos | P2 |
| N5-08 | Audit log registra todas as ações listadas | P0 |
| N5-09 | Relatórios recorrentes são enviados automaticamente | P1 |
| N5-10 | Multiusuário funciona com atribuição de pacientes | P0 |

---

## 10. Fluxos de Trabalho

### 10.1 Fluxo Completo: Captação → Alta

#### Etapa 1: Captação
| Item | Detalhe |
|------|---------|
| **Ator** | Paciente |
| **Entrada** | Link público fornecido pelo nutricionista |
| **Saída** | Anamnese preenchida salva no banco |
| **Sistema** | Next.js (página pública), Supabase |
| **Integrações** | Nenhuma |
| **Pontos de falha** | Paciente não preenche completamente; dados inválidos; link expirado |

**Endpoint:** `GET /api/anamneses/publico/:token` → `POST /api/anamneses/publico`

#### Etapa 2: Primeira Consulta
| Item | Detalhe |
|------|---------|
| **Ator** | Nutricionista |
| **Entrada** | Anamnese do paciente, medidas iniciais |
| **Saída** | Consulta registrada, anamnese completa, medidas salvas, plano alimentar criado |
| **Sistema** | Next.js (dashboard), Supabase |
| **Integrações** | Nenhuma |
| **Pontos de falha** | Nutricionista esquece de revisar anamnese; medidas com erros de digitação |

**Fluxo:**
1. Nutricionista abre prontuário do paciente
2. Visualiza anamnese preenchida online
3. Registra medidas (peso, altura, circunferências)
4. Monta plano alimentar
5. Salva tudo

#### Etapa 3: Entrega
| Item | Detalhe |
|------|---------|
| **Ator** | Sistema (automático) + Nutricionista (confirmação) |
| **Entrada** | Plano alimentar salvo |
| **Saída** | PDF gerado, enviado por email/WhatsApp, link para app |
| **Sistema** | Fastify (PDF), Resend (email), Evolution API (WhatsApp) |
| **Integrações** | Resend, Evolution API |
| **Pontos de falha** | Falha na geração de PDF; email não entregue; WhatsApp com erro |

**Fluxo:**
1. Ao ativar plano, sistema gera PDF via Playwright
2. Nutricionista clica "Enviar por Email" e/ou "WhatsApp"
3. Sistema envia com link para download do app

#### Etapa 4: Acompanhamento
| Item | Detalhe |
|------|---------|
| **Ator** | Paciente (registro) + Nutricionista (acompanhamento) |
| **Entrada** | Diário alimentar preenchido, registros de peso |
| **Saída** | Dashboard atualizado com dados de aderência |
| **Sistema** | App mobile (offline-first), Next.js (dashboard) |
| **Integrações** | Push notifications |
| **Pontos de falha** | Paciente para de registrar; dados offline não sincronizam; push não chega |

**Fluxo:**
1. Paciente registra refeições no app (offline-first)
2. Dados sincronizam quando há conexão
3. Nutricionista vê atualizações no dashboard
4. Sistema envia lembretes automáticos se paciente está inativo

#### Etapa 5: Retorno
| Item | Detalhe |
|------|---------|
| **Ator** | Nutricionista + Paciente |
| **Entrada** | Dados acumulados de aderência, medidas novas, queixas |
| **Saída** | Consulta realizada, plano atualizado, comparativo gerado |
| **Sistema** | Next.js (prontuário evolutivo), Fastify (PDF) |
| **Integrações** | Nenhuma |
| **Pontos de falha** | Paciente não comparece; dados incompletos |

**Fluxo:**
1. Sistema mostra comparativo: medidas anteriores vs. atuais
2. Nutricionista revisa aderência e consumo
3. Ajusta plano alimentar
4. Gera novo PDF com versão atualizada

#### Etapa 6: Alta ou Manutenção
| Item | Detalhe |
|------|---------|
| **Ator** | Nutricionista |
| **Entrada** | Evolução satisfatória, meta atingida |
| **Saída** | Paciente em modo manutenção, check-ins periódicos |
| **Sistema** | Inngest (automações), Supabase |
| **Integrações** | Email, push notifications |
| **Pontos de falha** | Paciente abandona completamente; recaída não detectada |

**Fluxo:**
1. Nutricionista muda status do paciente para "manutenção"
2. Consultas passam a ser trimestrais (configurável)
3. Sistema envia check-ins mensais automáticos
4. Dashboard marca paciente como "manutenção" com cor diferente

---

## 11. Plano de Implementação Incremental

### Fase 1: Nível 1 — MVP (4–6 semanas)

**Escopo:**
- Setup do monorepo (Turborepo + pnpm)
- Configuração do Supabase (Auth, schema, RLS)
- Frontend web: cadastro de paciente, calendário de consultas, registro de consulta
- Anamnese (formulário + link público)
- Medidas com IMC calculado
- Plano alimentar básico (editor simples)
- Geração de PDF (Playwright + template)
- Envio de email com PDF

**Dependências técnicas:**
- Conta Supabase configurada
- Projeto Vercel configurado
- Playwright instalado no serviço Fastify
- Conta Resend para email transacional

**Riscos principais:**
- Calendário com interação rica pode consumir mais tempo que o previsto
- Geração de PDF com layout perfeito pode ser iterativa
- RLS policies podem ser complexas para queries multi-tabela

**Critério de pronto:**
- ✅ Nutricionista consegue cadastrar, agendar, consultar e gerar PDF do plano
- ✅ Layout responsivo funciona em desktop e tablet
- ✅ Auth funciona (login, logout, signup)
- ✅ Dados isolados por clínica via RLS

### Fase 2: Nível 2 — Acompanhamento (4–6 semanas)

**Escopo:**
- Prontuário evolutivo (timeline + gráficos)
- Comparação entre consultas
- Plano alimentar dinâmico (distribuição de macros)
- Biblioteca de alimentos TACO (~600 alimentos)
- Sistema de substituições
- Lembretes automáticos (check-in semanal)
- Alertas de inatividade
- Gestão financeira básica (transações, recibos, pacotes)
- Relatório mensal de faturamento

**Dependências técnicas:**
- Dados suficientes do Nível 1 para testar evolução
- Integração WhatsApp funcionando (Evolution API)
- Inngest configurado para jobs agendados

**Riscos principais:**
- Biblioteca TACO pode ter dados incompletos ou inconsistentes
- Gráficos de evolução precisam de dados históricos para serem úteis
- Integração WhatsApp pode ter limitações de envio

**Critério de pronto:**
- ✅ Timeline mostra evolução completa do paciente
- ✅ Gráficos de peso e IMC são renderizados
- ✅ Substituições de alimentos funcionam corretamente
- ✅ Lembretes automáticos são enviados
- ✅ Financeiro gera transações e recibos

### Fase 3: Nível 3 — Avaliação Avançada (6–8 semanas)

**Escopo:**
- Entrada de bioimpedância e dobras cutâneas
- Cálculos de composição corporal (Pollock 3/7, Faulkner, Siri)
- TMB e TDEE (Harris-Benedict)
- Gráficos de composição corporal
- Análise de consumo (médias, comparação real vs. prescrito)
- Detecção de padrões
- Sistema de protocolos clínicos (configurável via JSON)
- Alertas de contraindicação

**Dependências técnicas:**
- Fórmulas validadas com dados reais
- Protocolos testados com nutricionistas reais
- Dados históricos suficientes para análise de padrões

**Riscos principais:**
- Fórmulas de composição corporal podem diverger entre fontes
- Detecção de padrões pode gerar falsos positivos
- Protocolos configuráveis podem ser complexos de usar

**Critério de pronto:**
- ✅ Cálculos de composição corporal conferem com planilhas de referência
- ✅ Análise de consumo mostra dados corretos
- ✅ Protocolos são criados e aplicados sem hardcode
- ✅ Alertas disparam nas condições corretas

### Fase 4: Nível 4 — App e Automação (8–12 semanas)

**Escopo:**
- App React Native + Expo (iOS + Android)
- Diário alimentar offline-first com WatermelonDB
- Busca de alimentos offline
- Sync engine com resolução de conflitos
- Push notifications (lembretes diários)
- Chat assíncrono (paciente ↔ nutricionista)
- Relatório semanal automático
- Integração Withings (webhook)
- Integração Apple Health / Google Fit
- Integração CGM (Dexcom, FreeStyle Libre)

**Dependências técnicas:**
- Conta Expo + EAS para builds
- Conta Apple Developer + Google Play Console
- Serviço de push notifications configurado
- Webhooks de integrações testados

**Riscos principais:**
- Offline-first é arquiteturalmente complexo
- Sync engine pode ter bugs de conflito difíceis de detectar
- Apps nativos têm ciclo de review (Apple pode rejeitar)
- Integrações com dispositivos médicos podem ter requisitos de compliance

**Critério de pronto:**
- ✅ App compila e roda em iOS e Android
- ✅ Diário alimentar funciona offline e sincroniza
- ✅ Push notifications chegam no horário correto
- ✅ Chat funciona entre paciente e nutricionista
- ✅ Integração Withings registra peso automaticamente

### Fase 5: Nível 5 — Gestão (6–8 semanas)

**Escopo:**
- Dashboard gerencial com KPIs
- Alertas de risco
- Relatórios (individual, gerencial, financeiro)
- Exportação CSV/XLSX
- Relatórios recorrentes por email
- Multiusuário com perfis e permissões
- Assinatura digital em planos e laudos
- Audit log completo
- Configurações avançadas da clínica

**Dependências técnicas:**
- Dados de todos os níveis anteriores
- Definição final de permissões por perfil
- Definição de quais ações são auditadas

**Riscos principais:**
- Performance de queries analíticas com muitos dados
- Exportação de grandes volumes pode timeout
- Assinatura digital ICP-Brasil pode ter custo e complexidade elevados

**Critério de pronto:**
- ✅ Dashboard exibe KPIs corretos e atualizados
- ✅ Relatórios exportam corretamente
- ✅ Permissões são respeitadas para cada perfil
- ✅ Audit log registra todas as ações

---

## 12. Segurança e LGPD

### 12.1 Criptografia

| Camada | Método | Detalhes |
|--------|--------|----------|
| **Trânsito** | TLS 1.3 | Todas as comunicações HTTP → HTTPS |
| **Repouso (PostgreSQL)** | pgcrypto | CPF, tokens de integração criptografados com AES-256 |
| **Repouso (Storage)** | Supabase Storage | Arquivos (fotos, PDFs) criptografados at rest |
| **Backup** | Supabase | Backups criptografados |

### 12.2 Consentimento LGPD

**Obrigatório antes de salvar qualquer dado de paciente:**
1. Termo de consentimento exibido ao nutricionista (quem cadastra)
2. Versão do termo registrada (`consentimento_lgpd_versao`)
3. Timestamp do consentimento (`data_consentimento_lgpd`)
4. Paciente pode revogar consentimento → dados são anonimizados

**Fluxo de exclusão/anonimização:**
```
1. Paciente solicita exclusão (ou nutricionista decide)
2. Status muda para "inativo"
3. Dados pessoais (nome, email, telefone, CPF) são anonimizados:
   - nome → "Paciente [hash]"
   - email → hash@anonimizado.local
   - telefone → removido
   - cpf → removido
4. Dados clínicos são mantidos para histórico (se necessário)
5. Fotos são deletadas do Storage
6. Audit log registra a ação
```

### 12.3 Autenticação e Autorização

- **Auth:** Supabase Auth (email/senha + magic link)
- **JWT:** Tokens de curta duração (15 min) + refresh tokens
- **RLS:** Row Level Security em todas as tabelas
- **Rate Limiting:** Middleware no Next.js (100 req/min por usuário)

### 12.4 Auditoria

- Todas as operações CRUD registradas em `audit_log`
- Logs retidos por 5 anos
- Acesso ao audit log restrito ao perfil admin
- Exportação de logs disponível para auditoria externa

### 12.5 Backup e Recovery

- Supabase: backups diários automáticos + point-in-time recovery
- Retenção de 30 dias
- Teste de restore mensal recomendado

### 12.6 🔒 Pontos de Atenção de Segurança

1. **CPF criptografado:** Usar pgcrypto com chave gerenciada pelo Supabase Vault
2. **Tokens de integração:** Nunca em logs; criptografados em banco; rotação periódica
3. **Link público de anamnese:** Tokens de uso único com expiração (24h)
4. **Upload de fotos:** Validação de tipo MIME, limite de tamanho (5MB), scan de malware
5. **API mobile:** Device fingerprinting para detectar acessos suspeitos
6. **Chat:** Mensagens criptografadas em trânsito; conteúdo não exposto em logs

---

## 13. Decision Log e Pontos de Atenção

### ⚠️ Decisões Pendentes de Produto

| # | Decisão | Impacto | Recomendação |
|---|---------|---------|-------------|
| P0 | **App PWA vs. React Native?** — PWA é mais simples mas não tem push nativo, câmera limitada | Alto | React Native (já decidido) |
| P1 | **Assinatura ICP-Brasil ou eletrônica simples?** — ICP é mais robusto mas tem custo e complexidade | Médio | Começar com assinatura eletrônica simples |
| P2 | **WhatsApp via Evolution API (self-hosted) ou Z-API (cloud)?** | Médio | Evolution API self-hosted no Railway |
| P3 | **Plano gratuito ou trial?** — Modelo de pricing impacta arquitetura de billing | Alto | Trial de 14 dias + plano gratuito limitado (5 pacientes) |
| P4 | **Perfil público de anamnese deve exigir cadastro?** | Baixo | Não exigir; nutricionista vincula depois |
| P5 | **Diário alimentar com validação de porção por IA?** — Foto → estimativa de calorias | Médio | Nível 4+; modelo treinado para estimar porção |

### 🔒 Pontos de Segurança

| # | Ponto | Nível | Ação |
|---|-------|-------|------|
| S1 | CPF em texto plano no banco | 1 | Criptografar com pgcrypto desde o início |
| S2 | Token de anamnese pública | 1 | Tokens de uso único com expiração |
| S3 | Upload de arquivos (fotos) | 4 | Validação MIME, limite 5MB, scan |
| S4 | Dados de dispositivos médicos (CGM) | 4 | Tokens criptografados, acesso restrito |
| S5 | Logs de auditoria | 5 | Retenção 5 anos, acesso restrito a admin |
| S6 | Exportação de dados (LGPD) | 1 | Endpoint de exportação em JSON/CSV desde o início |

### Arquitetura Decisões Registradas

| Decisão | Justificativa |
|---------|--------------|
| Supabase ao invés de backend custom | Auth, RLS, Realtime, Storage integrados; menor superfície de código |
| Fastify separado para PDF e jobs | Playwright precisa de Chromium headless; não roda bem no Vercel |
| WatermelonDB para offline | Melhor suporte a sync differential; schema declarativo; performance nativa |
| Monorepo com Turborepo | Código compartilhado (types, validators); build paralelo; deploy acoplado |
| RLS em todas as tabelas | Multi-tenant seguro desde o início; política de segurança no banco |
| Inngest para jobs | Declarativo, retry automático, fácil de testar; melhor que Bull+Redis |

---

*Documento gerado em Agosto 2026. Sujeito a revisão após validação com stakeholders.*
