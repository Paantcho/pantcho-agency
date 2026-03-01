# Pantcho Agency Hub — Agent OS v1.0

> Especificação mestre em `.md` para o hub multi‑agente "Pantcho Agency" — cobrindo Dev Squad, Audiovisual Squad, orquestração, memória e fluxos de trabalho, alinhado com o repositório `Paantcho/pantcho-agency`.

---

## 1. Visão Geral do Hub

### 1.1 Objetivo

O Pantcho Agency Hub é o sistema operacional da agência, responsável por coordenar múltiplos squads de agentes (desenvolvimento, audiovisual e futuros) para executar qualquer tipo de serviço pedido pelo usuário, desde criar uma influencer virtual completa até desenvolver plataformas e sites em produção.[file:100][file:1] 

### 1.2 Squads Atuais

- **Dev Squad** — desenvolvimento de software (Next.js 15, TypeScript, Tailwind, Supabase, Prisma, Vercel). 
- **Audiovisual Squad** — criação de conteúdo visual (foto/vídeo) e narrativa para creators, com foco inicial na influencer Ninaah Dornfeld. 
- Ambos compartilham as mesmas regras globais (`RULES.md`), manual de operação (`AGENTS.md`) e sistema de memória (`memory/`).[file:100][code_file:31]

### 1.3 Conceito de Operação

1. O usuário faz um pedido em linguagem natural dentro do Agency Hub (ex.: "Criar pack Piscina Março para Ninaah" ou "Criar landing page Privacy").[file:100]  
2. O **Orquestrador** lê a memória, classifica o tipo de pedido (criação, edição, revisão, execução) e decide qual squad (ou quais) são responsáveis.  
3. Cada squad aciona seus agentes e skills sob demanda, seguindo protocolos claros.  
4. Os resultados e decisões são gravados na memória compartilhada, alimentando o sistema para projetos futuros.[file:100][file:1]

---

## 2. Arquitetura de Diretórios do Repositório

```text
pantcho-agency/
├── AGENTS.md            # Manual global de squads e agentes
├── RULES.md             # Regras invioláveis
├── CONNECTORS.md        # Integrações externas (Figma, GitHub, Vercel, etc.)
├── CHANGELOG.md         # Histórico de mudanças
├── README.md            # Visão geral do repositório
│
├── dev-squad/           # Squad de Desenvolvimento
│   ├── README.md
│   ├── agents/
│   │   ├── orquestrador/SOUL.md
│   │   ├── desenvolvimento/SOUL.md
│   │   └── criador-de-agentes/SOUL.md
│   ├── commands/
│   │   ├── criar-landing.md
│   │   ├── criar-sistema.md
│   │   ├── revisar-projeto.md
│   │   └── status.md
│   └── skills/
│       ├── prd/SKILL.md
│       ├── analise-figma/SKILL.md
│       ├── arquitetura/SKILL.md
│       ├── frontend/SKILL.md
│       ├── backend/SKILL.md
│       ├── qa-review/SKILL.md
│       ├── seguranca/SKILL.md
│       └── nextjs-patterns/SKILL.md
│
├── audiovisual-squad/   # Squad Audiovisual / Creators
│   ├── README.md
│   ├── agents/
│   │   ├── planner/SOUL.md
│   │   ├── copywriter/SOUL.md
│   │   ├── diretor-de-arte/SOUL.md
│   │   ├── diretor-de-cena/SOUL.md
│   │   ├── consistencia/SOUL.md
│   │   └── eng-prompts/SOUL.md
│   ├── commands/
│   │   ├── add-creator.md
│   │   ├── criar-post.md
│   │   ├── planejar-semana.md
│   │   └── prompt-rapido.md
│   ├── skills/
│   │   ├── creator-bible/SKILL.md
│   │   ├── content-calendar/SKILL.md
│   │   ├── creator-voice/SKILL.md
│   │   ├── reference-deconstruction/SKILL.md
│   │   ├── visual-identity/SKILL.md
│   │   ├── scene-composition/SKILL.md
│   │   ├── consistency-validation/SKILL.md
│   │   ├── image-prompt/SKILL.md
│   │   ├── video-prompt/SKILL.md
│   │   └── photo-quality/SKILL.md
│   └── memory/
│       └── creators/
│           └── ninaah/
│               ├── APPEARANCE.md
│               ├── OVERVIEW.md
│               └── AMBIENTES.md
│
├── directives/          # Diretrizes e PRDs
│   └── agency-hub-PRD.md  # (a ser gerado a partir do PRD de 700 linhas)
│
└── memory/
    ├── WORKING.md       # Estado atual, tarefas, próximos passos
    ├── MEMORY.md        # Memória de longo prazo e decisões
    └── LESSONS.md       # Aprendizados para prevenção de erros
```

Essa estrutura reflete o repositório atual, com a adição sugerida de um `directives/agency-hub-PRD.md` explícito para guardar o PRD longo do sistema.[file:100]

---

## 3. Regras Globais e Orquestração

### 3.1 RULES.md — Regras Invioláveis

`RULES.md` já define boa parte do comportamento global:[file:1]

- **Protocolo de Memória**: ler `WORKING.md`, `MEMORY.md` e `LESSONS.md` antes de qualquer ação; atualizar depois de cada ação.  
- **Plan–Execute–Reflect** obrigatório com plano em Markdown, execução com marcação de tarefas e reflexão crítica antes de entregar.  
- **Contexto ≤ 40%**: carregar apenas skills necessárias, usar subagents para tarefas pesadas, soltar contexto ao finalizar.  
- **Resolve Before Returning**: não devolver trabalho incompleto, a menos que dependa de decisão do usuário.

Essas regras já são compatíveis com os padrões modernos de orquestração multi‑agente e de AGENTS.md da comunidade (Agent Rules, agents.md, etc.).[web:17][web:89][web:96]

### 3.2 AGENTS.md — Manual Global

`AGENTS.md` define duas linhas de roteamento principais:[file:1]

- **Dev Squad** — tudo que envolver código, sistemas, plataformas, APIs.  
- **Audiovisual Squad** — tudo que envolver creator, post, pack de imagens/vídeos, prompts de geração e pauta de conteúdo.  
- Criação de novos squads/agentes passa por `dev-squad/agents/criador-de-agentes/SOUL.md` (Agent Factory).

O Orquestrador (no Dev Squad) segue três etapas: detecção, classificação de intenção (consulta, criação, edição, revisão, execução) e roteamento por squad, com formato de checkpoint padrão para comunicação com o usuário.[file:1][file:100]

---

## 4. Dev Squad — Especificação de Alto Nível

### 4.1 Missão

Transformar PRDs, designs de Figma e requisitos de negócio em software de produção (landing pages, sistemas, plataformas), usando a stack Next.js 15 + Supabase + Prisma + Vercel como padrão, podendo adaptar para outras stacks quando necessário e registrando decisões em memória.[file:1][file:100]

### 4.2 Agentes

- **Orquestrador** — CEO técnico do Dev Squad; recebe pedidos do Orquestrador global, carrega RULES/MEMORY/LESSONS, decide quais skills e subagents serão usados.[file:1]  
- **Desenvolvimento** — time de engenharia completo (arquitetura, frontend, backend, QA, segurança).  
- **Criador de Agentes** — responsável por novos squads e agentes, definindo SOULs e SKILLs a partir de templates.

### 4.3 Skills

- `prd` — gera PRD de produto/sistema antes de qualquer codificação.  
- `analise-figma` — extrai tokens, componentes, estados e briefing técnico do Figma.  
- `arquitetura` — define stack, estrutura de pastas, schema e rotas.  
- `frontend` — implementação de UI com anti‑AI‑slop, responsivo e acessível.  
- `backend` — APIs, banco, autenticação, lógica server‑side.  
- `qa-review` — revisão completa antes de deploy.  
- `seguranca` — OWASP, RLS, auth, dados sensíveis.  
- `nextjs-patterns` — padrões específicos do App Router.

### 4.4 Fluxos Padrão

**/criar-landing**
1. `prd` — PRD específico para landing (objetivo, público, seções, conteúdo).  
2. `analise-figma` — se houver design.  
3. `arquitetura` — estrutura mínima para projeto Next.js (rotas, componentes).  
4. `frontend` — implementação pixel‑perfect.  
5. `qa-review` + `seguranca` — revisar e aprovar.  
6. Atualizar memória e WORKING com status do projeto.[file:1][file:100]

**/criar-sistema** segue o mesmo fluxo, adicionando `backend` e padrões de autenticação/banco.

---

## 5. Audiovisual Squad — Especificação de Alto Nível

### 5.1 Missão

Produzir conteúdo visual (fotos e vídeos) e narrativa completa para creators digitais, garantindo consistência absoluta de identidade (forense), ambientes e storytelling ao longo do tempo.[file:100]

### 5.2 Agentes

- **Planner de Conteúdo** — responsável por calendário mensal/semanal, narrativa e distribuição de formatos/cenários.  
- **Copywriter** — voz da creator (legendas, scripts, textos de apoio).  
- **Diretor de Arte** — mood, paleta, estética visual, look library e composição visual de feeds.  
- **Diretor de Cena** — composição técnica do quadro (lente, luz, posição, elementos de cena).  
- **Especialista em Consistência** — guardião da bible forense; poder de veto para qualquer quebra de identidade.  
- **Engenheiro de Prompts** — consolida tudo em prompts finais para geração de imagens/vídeos.[file:100]

### 5.3 Skills Centrais

- `creator-bible` — bible central, carregada sempre.  
- `content-calendar` — planejamento de semana/mês (telas de calendário e kanban da UI refletem essa skill).[file:100]  
- `creator-voice` — tom, persona textual, restrições de voz.  
- `reference-deconstruction` — análise de referências de imagem/vídeo.  
- `visual-identity` — guiagem de cor, tipografia visual, framing.  
- `scene-composition` — ficha técnica da cena.  
- `consistency-validation` — checklist forense (marca de nascença, olhos, silhueta, etc.).  
- `image-prompt` / `video-prompt` — geração de prompt para IA de imagem/vídeo.  
- `photo-quality` — ajustes de qualidade (pele, olhos, artefatos).[file:100]

### 5.4 Fluxo Padrão de Cena (Pack / Post)

A UI e o HTML de protótipo representam o fluxo:

1. **Planner** usa `content-calendar` para decidir o slot na semana/mês (ex.: "Pack Piscina Março" no dia 5).[file:100][image:98]  
2. **Copywriter** ativa `creator-voice` para rascunhar direção textual (legenda, CTA, contexto da cena).  
3. **Diretor de Arte** carrega `creator-bible`, `visual-identity` e referências para definir mood, paleta e composição visual desejada.[image:97][file:100]  
4. **Diretor de Cena** usa `scene-composition` para especificar câmera, lente, horário, posição, elementos fixos (árvore, carro etc.).  
5. **Especialista em Consistência** executa `consistency-validation` com base em APPEARANCE e checklists (proibições, tolerâncias).  
6. **Engenheiro de Prompts** finalmente monta o `image-prompt` ou `video-prompt`, incluindo parâmetros técnicos e lista de negativos, e salva na memória do pedido.[file:100]

---

## 6. Creator Bible — Exemplo com Ninaah Dornfeld

### 6.1 Estrutura de Memória da Creator

Para cada creator, é mantida uma pasta em `audiovisual-squad/memory/creators/[nome]/` com arquivos:

- `OVERVIEW.md` — visão geral, marcadores de identidade, veículo fixo, métricas (prompts, aprovação, ambientes, pedidos ativos).[image:97][file:100]  
- `APPEARANCE.md` — tabela forense de rosto/corpo + checklist de validação + lista de "blindagens" (proibições absolutas).[image:99][file:100]  
- `AMBIENTES.md` — ambientes recorrentes (ex.: piscina, rua, interior, carro), cada um com elementos fixos e variáveis.[file:100]

### 6.2 Uso pelas Skills

- Todas as skills do Audiovisual Squad leem a pasta da creator ativa via `creator-bible` antes de agir.  
- `consistency-validation` consulta `APPEARANCE.md` para validar marca de nascença, cor de olhos, proporção de silhueta, proibições (ex.: "nunca mudar cor dos olhos").[image:99][file:100]  
- `scene-composition` e `image-prompt` combinam dados da bible com o contexto do pedido (pack, mood, horário, ambiente) para gerar prompts detalhados e consistentes.

---

## 7. Sistema de Memória Global

### 7.1 Arquivos

- `memory/WORKING.md` — estado atual do sistema, projetos ativos, histórico recente, próximos passos e decisões pendentes.[file:100]  
- `memory/MEMORY.md` — fatos estáveis (sobre o usuário, arquitetura do sistema, stack padrão, creators ativas, referências estudadas).  
- `memory/LESSONS.md` — catálogo de erros e correções, formando um loop de auto‑melhoria.

### 7.2 Padrões de Memória

Os agentes seguem um fluxo de memória alinhado com boas práticas de **memory engineering** em sistemas multi‑agente:[web:58][web:61][web:62]

1. **Leitura inicial** — carregar WORKING, MEMORY e LESSONS.  
2. **Execução** — usar apenas o necessário em contexto; delegar subagents para tarefas pesadas.  
3. **Escrita** — registrar o que foi feito (WORKING), decisões estáveis (MEMORY) e causas/mitigações de erros (LESSONS).  
4. **Reuso** — futuros pedidos reutilizam essas informações, reduzindo ambiguidade e repetição.

---

## 8. Commands de Alto Nível

### 8.1 Dev Squad

- `/criar-landing` — cria landing page completa com base em PRD + Figma.  
- `/criar-sistema` — cria sistema/app completo com backend.  
- `/revisar-projeto` — roda `qa-review` + `seguranca`.  
- `/status` — sumariza WORKING, projetos em andamento e próximos passos.

### 8.2 Audiovisual Squad

- `/planejar-semana` — gera plano semanal de conteúdo para uma creator (calendário e kanban).[file:100]  
- `/criar-post` — gera um post completo (copy + prompt de imagem/vídeo).  
- `/prompt-rapido` — gera apenas o prompt visual/textual, sem planejamento extenso.  
- `/add-creator` — onboarding de nova creator (cria pasta em memory, APPEARANCE inicial, AMBIENTES padrão, etc.).

---

## 9. Próximos Passos de Refinamento

1. **Extrair o PRD de 700 linhas** do protótipo HTML para `directives/agency-hub-PRD.md`, servindo como documento de produto completo.[file:100]  
2. **Preencher/ajustar** os arquivos `APPEARANCE.md`, `OVERVIEW.md` e `AMBIENTES.md` da Ninaah para refletir exatamente o que está nas telas de UI.  
3. Expandir `CONNECTORS.md` com detalhes técnicos (auth, scopes, limites) para Figma, GitHub, Vercel e futuro Telegram Bot.  
4. Criar playbooks adicionais para novos squads (marketing, CRM, social, etc.), seguindo o mesmo padrão de Dev e Audiovisual Squads.

---

Este documento deve ser colocado na raiz do repositório como `Pantcho-Agency-Hub-OS.md` ou dentro de `directives/` como `AGENT-OS-SPEC.md`, servindo como referência mestre para qualquer agente que precise entender a arquitetura completa do hub.
