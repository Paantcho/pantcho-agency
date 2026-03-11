# PLANO DE IMPLEMENTAÇÃO — Motor de Execução de Agentes

**Data:** 10 de março de 2026
**Objetivo:** Conectar a arquitetura de agentes documentada ao código real, transformando o Hubia em um hub operacional autônomo.

---

## DIAGNÓSTICO: O QUE JÁ EXISTE

### ✅ Código Funcionando
- **Auth completa** (Supabase + Magic Link + Google OAuth)
- **Multi-tenancy** (organization_id em tudo, RLS, middleware)
- **Dashboard** com KPIs (dados hardcoded, mas estrutura pronta)
- **Creators CRUD completo** (5 tabs: Overview, Appearance, Environments, Looks, Voice)
- **Config: Branding** (cores customizáveis por org)
- **Config: Provedores de IA** (CRUD com chaves criptografadas AES-256-GCM — **isso é chave**)
- **Config: Equipe** (listagem de membros)
- **Sistema de animações** completo (Framer Motion, SlidingTabs, PageTransition)
- **Sidebar** com org switcher

### ✅ Banco de Dados (Schema Prisma) — Já Tem Tabelas Para
- `AiProvider` (type: anthropic/openai/google/custom, apiKeyEncrypted, baseUrl, defaultModel)
- `Agent` (name, slug, systemPrompt, status, config JSON)
- `Skill` (name, slug, description, config JSON)
- `AgentSkill` (many-to-many)
- `Pedido` (titulo, descricao, tipo, status, urgencia, briefing, createdBy)
- `PromptOutput` (prompt, result, mediaUrl, status, metadata, providerId)
- `Projeto` (nome, descricao, status, metadata, createdBy)
- `KnowledgeEntry` (title, content, category, tags, createdBy)
- `ActivityLog` (action, entityType, entityId, metadata)
- `EntityVersion` (versionamento de entidades)

### ✅ Documentação de Agentes
- 9 agentes documentados com SOUL.md detalhados
- Skills mapeadas com protocolos claros
- Sistema de memória definido (WORKING, MEMORY, STATUS, LESSONS)
- Regras invioláveis (RULES.md)
- Processo de criação dinâmica de agentes

### ❌ O Que Falta (Motor de Execução)
- SDK de IA (Anthropic/OpenAI) não instalado
- Nenhuma chamada à API de IA no código
- Páginas placeholder: Agentes, Pedidos, Projetos, Calendário, Gerador, Conhecimento, Memória
- Fila de jobs / execução assíncrona
- Streaming de progresso
- Integração Telegram
- Upload de arquivos (Supabase Storage)

---

## PLANO DE IMPLEMENTAÇÃO

### ETAPA 1 — Alicerce: SDK + Serviço de Execução
**Prioridade:** CRÍTICA — sem isso nada funciona
**Estimativa:** Primeira entrega

**O que será feito:**

1. **Instalar dependências**
   - `@anthropic-ai/sdk` (Claude API)
   - `ai` + `@ai-sdk/anthropic` (Vercel AI SDK — para streaming)
   - `zod` (validação server-side)

2. **Criar serviço de execução de agentes** (`src/lib/agents/`)
   ```
   src/lib/agents/
   ├── engine.ts          — Motor principal: recebe agent config → monta system prompt → chama LLM
   ├── provider.ts        — Abstração de providers (lê AiProvider do banco, decripta key, instancia SDK)
   ├── prompt-builder.ts  — Lê SOUL.md + skills → monta system prompt completo
   ├── memory.ts          — Lê/escreve memória (WORKING, MEMORY, etc.) — inicialmente .md, depois banco
   └── types.ts           — Tipos TypeScript para todo o sistema
   ```

3. **Criar API route de execução** (`src/app/api/agents/execute/route.ts`)
   - POST: recebe `{ agentSlug, message, context? }`
   - Busca agent config no banco
   - Busca provider padrão (ou específico)
   - Decripta API key
   - Monta system prompt (SOUL + skills + memória)
   - Chama LLM via streaming
   - Retorna resposta via SSE (Server-Sent Events)

4. **Criar API route de chat** (`src/app/api/chat/route.ts`)
   - Endpoint para conversas contínuas com agentes
   - Mantém histórico de mensagens
   - Suporta streaming

**O que você precisa trazer:**
- Chave da API da Anthropic (para colocar em Provedores de IA na plataforma)

**Resultado:** Será possível enviar uma mensagem para qualquer agente cadastrado e receber resposta via streaming.

---

### ETAPA 2 — Página de Agentes (UI)
**Prioridade:** ALTA — é a interface principal do hub

**O que será feito:**

1. **Página `/agentes`** — Lista de todos os agentes
   - Cards com nome, squad, status (ativo/inativo/rascunho)
   - Filtro por squad
   - Indicador visual de qual agente está executando

2. **Página `/agentes/[slug]`** — Detalhe do agente
   - Tabs: Chat, Config, Skills, Histórico
   - **Tab Chat:** Interface de conversa com o agente (streaming em tempo real)
   - **Tab Config:** System prompt, modelo, provider, parâmetros
   - **Tab Skills:** Skills associadas com toggle ativo/inativo
   - **Tab Histórico:** Execuções anteriores

3. **Seed dos agentes no banco**
   - Popular tabela `Agent` com os 9 agentes documentados (SOUL.md → systemPrompt)
   - Popular tabela `Skill` com skills existentes
   - Criar relações `AgentSkill`

**Resultado:** Você abre `/agentes`, vê todos os agentes, clica no Orquestrador, manda uma mensagem, e ele responde com contexto completo.

---

### ETAPA 3 — Orquestrador como Motor Central
**Prioridade:** ALTA — é o que transforma chat individual em sistema inteligente

**O que será feito:**

1. **BrainRouter no código**
   - Recebe mensagem do usuário
   - Classifica intenção (consulta, criação, edição, revisão, execução)
   - Identifica projeto/escopo
   - Mapeia para squad/agente(s) responsável(is)
   - Se agente não existe → sinaliza necessidade de criação

2. **Sistema de delegação**
   - Orquestrador gera briefing estruturado
   - Dispara chamada para agente(s) responsável(is)
   - Coleta respostas
   - Consolida e retorna ao usuário

3. **Entrada unificada** (`/api/hub/message`)
   - Um único endpoint que recebe qualquer pedido
   - Sempre passa pelo Orquestrador primeiro
   - Orquestrador decide quem executa

**Resultado:** Você manda "Cria um dashboard para acompanhar o Monday" → Orquestrador classifica → delega para Dev Squad → agentes planejam → retorna plano de ação.

---

### ETAPA 4 — Pedidos e Projetos (UI + Lógica)
**Prioridade:** ALTA — é como o trabalho entra no sistema

**O que será feito:**

1. **Página `/pedidos`** — Gestão de pedidos
   - Listagem com filtros (status, tipo, urgência)
   - Novo pedido (formulário com briefing, tipo, urgência, creator associada)
   - Detalhe do pedido (status, histórico de ações, outputs)
   - Pedido dispara execução automática via Orquestrador

2. **Página `/projetos`** — Gestão de projetos
   - Listagem de projetos ativos
   - Cada projeto agrupa pedidos relacionados
   - Mapa de rotas/fluxos/funcionalidades (conforme MAPA-PROJETO-TEMPLATE)
   - Timeline de entregas

3. **Fluxo de criação de projeto via Orquestrador**
   - Upload de referência / briefing textual
   - Orquestrador identifica agentes necessários
   - Cria projeto + pedidos iniciais automaticamente
   - Retorna plano com perguntas pendentes (se houver)

**Resultado:** Você cria um pedido "Gerar 3 fotos da Nina na praia" → sistema cria pedido → Orquestrador aciona Audiovisual Squad → cadeia de agentes executa.

---

### ETAPA 5 — Base de Conhecimento
**Prioridade:** MÉDIA — é o que faz o sistema ficar mais inteligente com o tempo

**O que será feito:**

1. **Página `/conhecimento`** — Base de conhecimento
   - Adicionar URLs, textos, arquivos
   - Sistema lê, processa e extrai lições
   - Categorização automática (design, código, motion, creators, etc.)
   - Tags e busca

2. **Ingestão automática**
   - Cole um link → sistema busca conteúdo → LLM extrai pontos relevantes → salva no banco
   - Upload de PDF/arquivo → mesmo fluxo
   - Classificação em categorias por agente (ex: link sobre Tailwind → Dev Squad)

3. **Integração com agentes**
   - Agentes consultam a base de conhecimento antes de executar
   - Busca por relevância (inicialmente por categoria/tags; futuro: embeddings)

**Resultado:** Você joga um link sobre "melhores práticas de agentes IA" → sistema lê → extrai 5 lições → agentes passam a considerar essas lições.

---

### ETAPA 6 — Memória Persistente no Banco
**Prioridade:** MÉDIA — migração de .md para banco multi-tenant

**O que será feito:**

1. **Migrar memória para banco**
   - Nova tabela `Memory` (type: working/long_term/lesson/status, content, projectId?, agentId?)
   - API de leitura/escrita de memória
   - Agentes leem/escrevem via serviço (não mais .md diretamente)

2. **Página `/memoria`** — Visualização da memória
   - Ver o que o sistema "sabe"
   - Filtrar por tipo (decisões, lições, estado atual)
   - Editar/corrigir memórias manualmente

3. **Ciclo de consolidação automático**
   - Após cada execução de agente → consolidar memória
   - Manter WORKING enxuto
   - Gravar decisões estáveis em long_term

**Resultado:** Memória funciona multi-tenant, persiste entre sessões, e você pode ver/editar o que o sistema aprendeu.

---

### ETAPA 7 — Calendário e Gerador (Creators)
**Prioridade:** MÉDIA — funcionalidade core para Creators

**O que será feito:**

1. **Página `/calendario`** — Calendário editorial
   - Visão mensal/semanal
   - Arrastar e soltar conteúdo
   - Vinculado a creators e pedidos
   - Planner de Conteúdo alimenta automaticamente

2. **Página `/gerador`** — Gerador de prompts/conteúdo
   - Selecionar creator
   - Tipo de conteúdo (foto, vídeo, post, story)
   - Cadeia completa: Planner → Copywriter → Diretor de Arte → Diretor de Cena → Consistência → Eng. Prompts
   - Resultado: prompt pronto para geração + copy + briefing técnico

3. **Integração com APIs de geração (futuro)**
   - Slot preparado para conectar fal.ai, Replicate, RunwayML, etc.
   - PromptOutput salva resultado + mídia gerada

**Resultado:** Você seleciona a Nina, pede "3 fotos na praia", e recebe prompts prontos para gerar + copy para cada post + calendário sugerido.

---

### ETAPA 8 — Integrações Externas
**Prioridade:** BAIXA (pós-core) — expande canais de entrada/saída

**O que será feito:**

1. **Telegram Bot**
   - Receber mensagens → enviar para `/api/hub/message`
   - Retornar respostas do Orquestrador
   - Aprovações inline (botões de aprovar/rejeitar)
   - Notificações de status de pedidos

2. **Webhook Monday.com** (quando aplicável)
   - Receber eventos do Monday
   - Criar pedidos automaticamente
   - Sincronizar status

3. **Vercel Deploy**
   - Deploy automático via Vercel CLI/API
   - Preview URLs para projetos web
   - Link de teste direto no pedido

**Resultado:** Você manda "Gera 3 da Nina na praia" no Telegram → sistema processa → te manda pra aprovar → você aprova → executa.

---

## ARQUITETURA TÉCNICA PROPOSTA

```
┌─────────────────────────────────────────────────────────┐
│                    HUBIA APP (Next.js)                    │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  ENTRADA (qualquer canal)                           │ │
│  │  • Web UI (chat, formulários)                       │ │
│  │  • API (/api/hub/message)                           │ │
│  │  • Telegram Bot (futuro)                            │ │
│  │  • Webhook (futuro)                                 │ │
│  └──────────────────────┬──────────────────────────────┘ │
│                         ▼                                 │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  ORQUESTRADOR (engine.ts)                           │ │
│  │  • BrainRouter: classifica → mapeia agente          │ │
│  │  • Briefing: monta contexto completo                │ │
│  │  • Delegação: dispara agente(s)                     │ │
│  │  • Validação: confere resultado                     │ │
│  │  • Consolidação: atualiza memória                   │ │
│  └──────────────────────┬──────────────────────────────┘ │
│                         ▼                                 │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  AGENTES (Agent configs do banco)                   │ │
│  │                                                     │ │
│  │  prompt-builder.ts:                                 │ │
│  │    SOUL.md (systemPrompt) + Skills + Memória        │ │
│  │    → System prompt completo                         │ │
│  │                                                     │ │
│  │  provider.ts:                                       │ │
│  │    AiProvider do banco → decripta key → SDK         │ │
│  │    Anthropic / OpenAI / Google / Custom              │ │
│  │                                                     │ │
│  │  engine.ts:                                         │ │
│  │    System prompt + mensagem → LLM → resposta        │ │
│  │    (streaming via SSE)                              │ │
│  └──────────────────────┬──────────────────────────────┘ │
│                         ▼                                 │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  MEMÓRIA (memory.ts)                                │ │
│  │  • Leitura: antes de cada execução                  │ │
│  │  • Escrita: após cada execução                      │ │
│  │  • Consolidação: ciclo automático                   │ │
│  │  • Fase 1: arquivos .md                             │ │
│  │  • Fase 2: banco de dados (multi-tenant)            │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  BANCO DE DADOS (Supabase + Prisma)                 │ │
│  │  • Agent, Skill, AgentSkill                         │ │
│  │  • Pedido, PromptOutput, Projeto                    │ │
│  │  • KnowledgeEntry                                   │ │
│  │  • ActivityLog                                      │ │
│  │  • Tudo com organization_id                         │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## ESTRUTURA DE ARQUIVOS A CRIAR

```
src/lib/agents/
├── engine.ts            — Motor de execução (chama LLM, streaming)
├── orchestrator.ts      — BrainRouter + delegação + consolidação
├── provider.ts          — Instancia SDK correto a partir do banco
├── prompt-builder.ts    — SOUL + Skills + Memória → system prompt
├── memory.ts            — Leitura/escrita de memória
├── types.ts             — Tipos do sistema de agentes
└── constants.ts         — Agent slugs, skill mappings

src/app/api/
├── agents/
│   ├── execute/route.ts — Executa agente específico (streaming)
│   └── route.ts         — CRUD de agentes
├── hub/
│   └── message/route.ts — Entrada unificada (Orquestrador)
├── chat/
│   └── route.ts         — Chat contínuo com agente
├── knowledge/
│   └── route.ts         — CRUD de conhecimento
└── pedidos/
    └── route.ts         — CRUD de pedidos

prisma/
└── seed-agents.ts       — Seed dos 9 agentes + skills no banco
```

---

## PRÉ-REQUISITOS (O QUE VOCÊ PRECISA TRAZER)

| Item | Para quê | Onde colocar |
|------|----------|-------------|
| **Chave API Anthropic** | Fazer os agentes funcionarem com Claude | Config > Provedores de IA (já tem a tela!) |
| **(Opcional) Chave OpenAI** | Provider alternativo | Config > Provedores de IA |
| **(Opcional) Chave Google AI** | Provider alternativo | Config > Provedores de IA |

**Nota:** As chaves são criptografadas com AES-256-GCM antes de ir pro banco. A tela já existe e funciona. Você só precisa adicionar a chave quando o motor estiver pronto.

---

## ORDEM DE EXECUÇÃO SUGERIDA

```
ETAPA 1 → SDK + Motor de Execução     [FUNDAÇÃO — sem isso nada funciona]
ETAPA 2 → Página de Agentes (UI)      [INTERFACE — ver e conversar com agentes]
ETAPA 3 → Orquestrador no código      [INTELIGÊNCIA — sistema pensa sozinho]
ETAPA 4 → Pedidos e Projetos          [FLUXO — trabalho entra e sai do sistema]
ETAPA 5 → Base de Conhecimento        [APRENDIZADO — sistema fica mais inteligente]
ETAPA 6 → Memória no banco            [PERSISTÊNCIA — memória multi-tenant]
ETAPA 7 → Calendário e Gerador        [CREATORS — fluxo audiovisual completo]
ETAPA 8 → Integrações externas        [EXPANSÃO — Telegram, Monday, Vercel]
```

---

## O QUE JÁ ESTÁ PLANEJADO E VAI FUNCIONAR

Com base na análise completa, confirmo que:

| Aspecto | Status |
|---------|--------|
| Schema do banco suporta agentes, skills, pedidos, projetos, conhecimento | ✅ Pronto |
| Multi-tenancy em todas as tabelas | ✅ Pronto |
| Encriptação de API keys | ✅ Pronto |
| Tela de configuração de providers | ✅ Pronto |
| SOUL.md dos agentes detalhados e reutilizáveis como system prompts | ✅ Pronto |
| Skills documentadas e modulares | ✅ Pronto |
| Sistema de memória (conceito) | ✅ Pronto |
| Processo de criação dinâmica de agentes | ✅ Pronto |
| Cadeia audiovisual completa (6 agentes) | ✅ Documentada |
| Design system e motion system | ✅ Implementado |

**Nada do que foi planejado conflita com a implementação.** A arquitetura documentada encaixa perfeitamente no schema do banco e na estrutura do app. O que falta é a cola: o código que conecta documentação → banco → API de IA → resposta.

---

## PRIMEIRA ENTREGA CONCRETA

Após aprovação, a Etapa 1 entrega:

1. SDKs instalados e configurados
2. `src/lib/agents/engine.ts` — motor que executa qualquer agente
3. `src/lib/agents/provider.ts` — lê provider do banco, decripta, instancia SDK
4. `src/lib/agents/prompt-builder.ts` — monta system prompt a partir do banco
5. `src/lib/agents/memory.ts` — lê memória dos .md como contexto
6. `/api/agents/execute` — endpoint que recebe agente + mensagem e retorna streaming
7. `/api/chat` — endpoint para conversas contínuas
8. Seed dos 9 agentes no banco

**Teste:** Você vai poder abrir o app, ir em Agentes (ou via API), mandar uma mensagem pro Orquestrador, e ele vai responder com o contexto completo dos SOUL.md, memória, e regras.
