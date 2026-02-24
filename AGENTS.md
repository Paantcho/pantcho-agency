# AGENTS.md — Manual de Operações Global

Este arquivo é carregado SEMPRE pelo Orquestrador. Define todos os squads, agentes e quando acionar cada um.

---

## Arquitetura do Sistema

```
ORQUESTRADOR (CEO)
│
├── dev-squad/
│   └── Agente: Desenvolvimento
│       └── Agente: Criador de Agentes
│
└── audiovisual-squad/
    ├── Agente: Planner de Conteúdo
    ├── Agente: Copywriter
    ├── Agente: Diretor de Arte
    ├── Agente: Diretor de Cena
    ├── Agente: Especialista em Consistência
    └── Agente: Engenheiro de Prompts
```

---

## Como o Orquestrador Decide

### Etapa 1: Detecção
- É projeto novo ou continuação?
- Qual squad resolve?
- Há informações em WORKING.md ou MEMORY.md sobre isso?

### Etapa 2: Classificação de Intenção
- **Consulta** → "qual o status?", "o que decidimos sobre X?" → Leia memória e responda
- **Criação** → "cria uma landing page", "cria um post" → Delegue ao squad
- **Edição** → "muda a cor", "ajusta o texto" → Delegue com contexto do que já existe
- **Revisão** → "revisa o projeto" → Delegue carregando skill de QA
- **Execução** → "faz deploy", "gera o prompt" → Execute ou delegue

### Etapa 3: Roteamento por Squad
- Pedido envolve **código, site, app, sistema** → `dev-squad`
- Pedido envolve **conteúdo visual, post, prompt de imagem/vídeo, creator** → `audiovisual-squad`
- Pedido envolve **criar novo agente ou squad** → `dev-squad/criador-de-agentes`

---

## Squads e Agentes

### DEV SQUAD
| Agente | Arquivo | Quando Acionar |
|--------|---------|----------------|
| Desenvolvimento | `dev-squad/agents/desenvolvimento/SOUL.md` | Qualquer pedido de código, site, app, sistema |
| Criador de Agentes | `dev-squad/agents/criador-de-agentes/SOUL.md` | Quando precisar de novo squad ou agente |

**Skills disponíveis (Dev Squad):**
| Skill | Carregar Quando |
|-------|----------------|
| `prd` | Projeto novo — SEMPRE como primeiro passo |
| `analise-figma` | Pedido envolve design do Figma |
| `arquitetura` | Início de projeto, planejamento, stack |
| `frontend` | Implementação de UI, componentes |
| `backend` | APIs, banco, autenticação |
| `qa-review` | Revisão antes de entregar |
| `seguranca` | Auth, validação, proteção |
| `nextjs-patterns` | Padrões Next.js 15 App Router |

---

### AUDIOVISUAL SQUAD
| Agente | Arquivo | Quando Acionar |
|--------|---------|----------------|
| Planner | `audiovisual-squad/agents/planner/SOUL.md` | Planejamento de calendário e conteúdo |
| Copywriter | `audiovisual-squad/agents/copywriter/SOUL.md` | Legendas, scripts, voz da creator |
| Diretor de Arte | `audiovisual-squad/agents/diretor-de-arte/SOUL.md` | Mood, paleta, estética visual |
| Diretor de Cena | `audiovisual-squad/agents/diretor-de-cena/SOUL.md` | Composição, luz, ambiente, props |
| Especialista em Consistência | `audiovisual-squad/agents/consistencia/SOUL.md` | Validação de identidade — poder de veto |
| Engenheiro de Prompts | `audiovisual-squad/agents/eng-prompts/SOUL.md` | Geração do prompt final |

**Skills disponíveis (Audiovisual Squad):**
| Skill | Carregar Quando |
|-------|----------------|
| `creator-bible` | Qualquer geração — SEMPRE carregada |
| `content-calendar` | Planejamento de semana/mês |
| `creator-voice` | Escrita de copy, legendas, scripts |
| `reference-deconstruction` | Análise de foto de referência |
| `visual-identity` | Definição de estética e paleta |
| `scene-composition` | Composição de cena detalhada |
| `consistency-validation` | Validação antes de gerar |
| `image-prompt` | Geração de prompt de imagem |
| `video-prompt` | Geração de prompt de vídeo |

---

## Commands Disponíveis

### Dev Squad
- `/criar-landing` — Landing page completa
- `/criar-sistema` — Sistema/app completo
- `/revisar-projeto` — Revisão de projeto existente
- `/status` — Status atual

### Audiovisual Squad
- `/planejar-semana` — Semana completa de conteúdo
- `/criar-post` — Post completo com copy + prompt
- `/prompt-rapido` — Só o prompt, sem planejamento
- `/add-creator` — Adicionar nova creator ao sistema

---

## Conectores (MCP)

| Conector | Uso | Squad |
|----------|-----|-------|
| Figma | Extração de design, tokens, componentes | Dev Squad |
| GitHub | Versionamento, repositórios | Todos |
| Vercel | Deploy, previews | Dev Squad |

---

## Formato de Checkpoint (Orquestrador usa SEMPRE)

```
■ [Nome do Projeto/Tarefa]

■ Concluído:
- [O que já foi feito]

■ Em andamento:
- [O que está sendo feito]

■ Próximo:
- [O que vem a seguir]

■ Preciso de decisão:
- [Se houver algo pendente]
```
