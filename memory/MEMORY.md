# MEMORY.md — Memória de Longo Prazo

Lido por TODOS os agentes ANTES de qualquer ação.
Atualizado quando há decisão importante, preferência nova, ou lição aprendida.

---

## Sobre o Usuário
- Diretor de arte / Designer
- Trabalha primariamente no Figma
- Não é desenvolvedor — precisa de explicações acessíveis
- Prioriza qualidade visual e fidelidade ao design
- Objetivo: criar aplicações e conteúdo sem depender de equipe humana
- Padrão de qualidade: nível Apple / Anthropic / ChatGPT

## Arquitetura do Sistema
- **Repositório:** `Paantcho/pantcho-agency` (GitHub, privado)
- **Estrutura:** Squads independentes sob a mesma agência
- **Squads ativos:** dev-squad, audiovisual-squad. **Squads previstos:** marketing, finanças, CRM, social media (estrutura suporta; criar via Criador de Agentes quando necessário)
- **Memória:** compartilhada em `memory/` (WORKING, MEMORY, STATUS, LESSONS). Ciclo de consolidação: ver `memory/README.md`
- **Mapa do projeto:** todo projeto ativo tem mapa de rotas/fluxos (template em `agents/orquestrador/MAPA-PROJETO-TEMPLATE.md`)
- **Regra de contexto:** máximo 40% da janela ocupada
- **Skills:** sob demanda; formato alinhado a Agent Skills (Anthropic). Diretriz: `directives/diretriz-anthropic-skills-agents.md`

## Stack Padrão (Dev Squad)
Next.js 15+ / TypeScript / Tailwind / Shadcn / Supabase / Prisma / Vercel / Figma MCP

---

## PADRÃO DE LAYOUT DE PÁGINA — OBRIGATÓRIO EM TODA PÁGINA

**Toda página interna da plataforma Hubia segue esta hierarquia:**

```
[FUNDO #EEEFE9]
  ├── Linha 1: h1 título + botão de ação primária — SOLTOS sobre o fundo, sem container
  ├── Linha 2: tab-navbar (filtros/squad/views) — SOLTO sobre o fundo, sem container
  └── Linha 3: White box — div rounded-[20px] bg-white p-5 — apenas o conteúdo principal
                  └── Kanban / Lista / Calendário / Grid de cards / etc.
```

**Regras:**
- AppShell NUNCA coloca white box global — revertido e travado
- `<h1>` e botão "Novo X" ficam FORA do white box, sobre #EEEFE9
- A tab-navbar fica FORA do white box, sobre #EEEFE9
- O white box (`rounded-[20px] bg-white p-5 min-h-[400px]`) envolve APENAS o conteúdo
- Cards dentro do white box usam `#F7F7F5` (não branco puro) para criar hierarquia sem sombra

**⚠️ EXCEÇÃO PROJETOS:** A listagem de Projetos **NÃO tem white box wrapper** — os cards flutuam diretamente sobre `#EEEFE9`. Isso é intencional e definitivo para dar mais destaque individual a cada projeto. NÃO reverter.

---

## PALETA DE STATUS — TRAVADA GLOBALMENTE

Status são fixos e compartilhados por Pedidos e Projetos. NUNCA inventar novas cores.

| Status | BG | Texto | Dot |
|---|---|---|---|
| backlog | #F0F0F0 | #666666 | #999999 |
| aguardando | #FFF3CD | #856404 | #F0AD00 |
| em_andamento | #F0FF80 | #5A6600 | #8B9B00 |
| revisao | #E8F4FD | #1565C0 | #1976D2 |
| aprovado | #E8F5E9 | #2E7D32 | #43A047 |
| concluido | #0E0F10 | #FFFFFF | #D7FF00 |
| cancelado | #FFEBEE | #C62828 | #E53935 |

**Regra crítica:** NUNCA usar #D7FF00 (limão) como cor de texto sobre fundo branco ou claro — é ilegível. O status "em_andamento" usa `#F0FF80` (limão pastel) como fundo com `#5A6600` (verde escuro) como texto.

---

## CREATOR — CAMPO CONDICIONAL

O campo "Creator" em modais e sidebars de Pedido deve aparecer APENAS quando:
- `tipo === 'imagem'`
- `tipo === 'video'`
- `tipo === 'creator'`

Quando o tipo é DEV (landing page, sistema, agente, etc.) o campo NÃO deve aparecer. Em seu lugar, exibir badge estático "DEV" em `#0E0F10` com texto `#D7FF00`.

---

## TOASTS — PALETA HUBIA (TRAVADA)

```
success / info  → fundo #D7FF00 (limão), texto #0E0F10 (ink), ícone ink
error / warning → fundo #0E0F10 (ink), texto #FFFFFF (branco), ícone colorido
```

**Nunca:** fundos cinza, branco, ou qualquer outra cor. Toasts devem ser visíveis sobre qualquer fundo da plataforma (inclusive o white box branco).

---

## DRAG AND DROP KANBAN

- Biblioteca: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- Ao iniciar drag: capturar `height` real do card via `getBoundingClientRect()` e armazenar em `draggingHeight`
- Drop zone vazia ("Soltar aqui"): height = `draggingHeight` (dinâmico — não fixo)
- Coluna ao receber: `minHeight = draggingHeight + 16` para acomodar visualmente
- Overlay de arrastar: card rotacionado levemente com sombra
- Coluna destino em hover: destaque visual com border dashed + mudança de fundo

---

## HUBIA DATE PICKER — COMPONENTE OBRIGATÓRIO

`<input type="date">` nativo é **PROIBIDO** na plataforma Hubia.
Sempre usar o componente `HubiaDatePicker` implementado em `pedidos-client.tsx`.
Quando for reutilizado em outras páginas, extrair para `components/ui/hubia-date-picker.tsx`.

---

## MODAL "NOVO PEDIDO" — PADRÃO

- Largura mínima: `max-w-[680px]`
- Layout: `grid grid-cols-2 gap-x-5 gap-y-4` — 2 colunas, sem overflow-y-scroll
- Criação inline de projeto: botão "Criar novo" abre input, cria via server action, auto-seleciona
- Creator: condicional por tipo (ver regra acima)
- Datepicker: HubiaDatePicker — nunca input nativo

---

## CADEIA DE PRODUÇÃO (pedidos/[id])

A cadeia de produção no detalhe do pedido é dinâmica por `tipo`:

**Audiovisual/Creator/Imagem/Video:**
Planner → Copywriter → Diretor de Arte → Diretor de Cena → Especialista Consistência → Eng. Prompts

**DEV (landing page, sistema, etc.):**
Arquiteto de Informação → Designer UX/UI → Desenvolvedor → Agente QA → Deploy

Cada etapa mostra: avatar/ícone do role, título, descrição, status (Concluído/Pendente).

---

## UPLOAD DE RESULTADO — PADRÃO

O componente `UploadResultado` em `/pedidos/[id]` deve:
- Aceitar drag and drop real (ondragover, ondrop)
- Aceitar múltiplos arquivos (imagens + vídeos)
- Mostrar preview dos arquivos com botão de remover
- Feedback visual ao arrastar arquivo para a área

---

## Motion e Interação (Hubia) — SISTEMA COMPLETO E ENFORCEMENT ATIVO

- **Lei de motion:** `.cursor/rules/hubia-motion-enforcement.mdc` (`alwaysApply: true`) — documento definitivo e inviolável
- **Padrões detalhados:** `.cursor/rules/motion-interactions.mdc` (`alwaysApply: true`)
- **Regra global:** Framer Motion obrigatório para todos os componentes React animados. CSS keyframes apenas em `globals.css` para ícones SVG via `group-hover`.
- **Regras de cursor ativas:** `.cursor/rules/` contém 5 arquivos todos com `alwaysApply: true`:
  - `00-hubia-master.mdc` — índice mestre, lido primeiro
  - `hubia-design-system.mdc` — tokens, tipografia, cores, componentes, proibições
  - `motion-interactions.mdc` — motion system completo
  - `figma-fidelity-supreme.mdc` — regra suprema pixel-perfect ao Figma
  - `hubia-motion-enforcement.mdc` — **LEI DE MOTION**: checklist pré-entrega, 10 proibições, padrões exatos de código

### Padrões definitivos de motion (nunca mudar sem atualizar regra)

**Botão com ícone — padrão OBRIGATÓRIO (variantes propagadas):**
```tsx
// CORRETO — o filho herda o estado hover do pai automaticamente
<motion.button
  initial="rest"
  whileHover="hovered"
  whileTap={{ scale: 0.96 }}
  animate="rest"
  variants={{
    rest: { scale: 1, backgroundColor: "#D7FF00" },
    hovered: { scale: 1.03, backgroundColor: "#DFFF33" },
  }}
  transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
>
  <motion.span
    className="flex items-center"
    variants={{ rest: { scale: 1 }, hovered: { scale: 1.2 } }}
    transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
  >
    <PlusIcon size={16} />
  </motion.span>
  Label
</motion.button>

// ERRADO — whileHover no filho NÃO dispara quando o hover é no pai
// <motion.span whileHover={{ scale: 1.2 }}> — NUNCA FAZER ISSO
```

**⚠️ REGRA CRÍTICA — `animate` vs `style` com Framer Motion:**
```tsx
// CORRETO — Framer Motion controla o valor e reage a mudanças de estado
<motion.button
  initial={false}
  animate={{ backgroundColor: isActive ? "#0E0F10" : "rgba(0,0,0,0)" }}
  whileHover={!isActive ? { backgroundColor: "rgba(213,210,201,0.35)" } : undefined}
>

// ERRADO — style é estático no mount; Framer Motion congela o background no hover
// <motion.button style={{ background: isActive ? "#0E0F10" : "transparent" }}>
// NUNCA usar style para valores que mudam com estado React + Framer Motion
```

**Botão primário/secundário/ghost (sem ícone):**
```tsx
<motion.button
  whileHover={{ scale: 1.03, backgroundColor: /* tom mais claro */ }}
  whileTap={{ scale: 0.96 }}
  transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
>
```

**Botão icon-only:**
```tsx
whileHover={{ scale: 1.12 }} / whileTap={{ scale: 0.90 }}
```

**Sidebar — pill spring:**
```
stiffness: 380, damping: 28, mass: 1
Hover areia nos inativos: rgba(213,210,201,0.4) — hex #D5D2C9
```

**Tabs — pill spring:**
```
stiffness: 420, damping: 30, mass: 0.8
Hover areia nos inativos: rgba(213,210,201,0.35)
whileTap: scale 0.97
Ícones: variantes propagadas rest/hovered no motion.button pai
```

**Modal — 3 camadas (inviolável) + HubiaPortal OBRIGATÓRIO:**
```
Camada 1: overlay rgba(14,15,16,0→0.70) + blur 0→12px, 250ms ease-dec
Camada 2: scale 0.88→1, y 20→0, opacity 0→1, 280ms ease-dec
Camada 3: botão X whileHover rotate 90° scale 1.1
AnimatePresence obrigatório — NUNCA if(!open) return null
HubiaPortal (createPortal → document.body) OBRIGATÓRIO — sem isso o backdrop-filter
não aplica full-screen (Framer Motion/CSS transforms criam stacking context)
```

**Cards — stagger obrigatório:**
```tsx
delay: Math.min(i * 0.06, 0.3)
initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}
```

**Dropdown:**
```tsx
AnimatePresence + initial={{ opacity: 0, y: -6, scale: 0.96 }}
NUNCA: {open && <div>} sem AnimatePresence
NUNCA: shadow-* (flat design)
```

### Componentes de motion reutilizáveis
- **`SlidingTabs`** (`hubia-app/src/components/ui/sliding-tabs.tsx`) — tabs com pill spring + hover areia + variantes propagadas nos ícones
- **`TabContent`** (`hubia-app/src/components/ui/tab-content.tsx`) — conteúdo com animação direcional
- **`HubiaModal`** (`hubia-app/src/components/ui/hubia-modal.tsx`) — modal com 3 camadas obrigatórias + AnimatePresence
- **`HubiaPortal`** (`hubia-app/src/components/ui/hubia-portal.tsx`) — **OBRIGATÓRIO em modais** — createPortal para `document.body`, garante backdrop-filter full-screen
- **`HubiaSelect`** (`hubia-app/src/components/ui/hubia-select.tsx`) — dropdown 100% customizado, zero `<select>` nativo
- **`HubiaToastProvider`** + `toast.*` (`hubia-app/src/components/ui/hubia-toast.tsx`) — toast Hubia com Zustand, registrado no root layout
- **`Button`** (`hubia-app/src/components/ui/button.tsx`) — MotionButton com whileHover/whileTap
- **`KpiCards` / `PedidosPrioritariosCards`** (`dashboard-motion.tsx`) — Client Components com stagger
- **`HubiaDatePicker`** (inline em `pedidos-client.tsx`, extrair para `components/ui/`) — calendário customizado, sem input nativo

## Modal — Padrão da plataforma inteira (Hubia)
- **Regra global:** Em **toda** a plataforma, qualquer modal de criar/editar/ver segue o mesmo padrão.
- **Comportamento:** Overlay **full-screen** (tela inteira), com **blur** no fundo e caixa de conteúdo centralizada. O overlay cobre sidebar e tudo (renderizado via `HubiaPortal` no `body`).
- **`HubiaPortal` obrigatório:** Sem `createPortal`, transforms CSS e Framer Motion criam stacking contexts que limitam o `backdrop-filter` a um sub-contêiner. Toda modal deve usar `HubiaPortal`.
- **Componente:** `hubia-app/src/components/ui/hubia-modal.tsx` — usar sempre; não criar modais ad-hoc.
- **Conteúdo do modal:** Título no topo; **botão X** no canto superior direito para fechar; ações no rodapé conforme o caso.
- **Nunca:** modal que ocupa só parte da tela, fundo branco sem blur, ou diálogos nativos (alert/confirm).
- **Botão X:** fundo `#0E0F10`, hover `rgba(62,63,64,0.85)`, active preto sólido + scale(0.94). **Nunca** usar `--state-hover` (amarelo) em botões escuros.

## Auto-Draft — Padrão Universal de Formulários
- **Regra:** Todo formulário de criação (novo agente, novo squad, novo pedido, etc.) deve salvar rascunho no `localStorage` ao fechar sem submeter.
- **Chave:** `hubia:[entidade]:[contexto]` — ex: `hubia:novo-agente:rascunho`, `hubia:novo-agente:squad:${squadId}`
- **Fluxo:** Ao fechar com conteúdo → salvar silenciosamente (SEM toast). Ao reabrir → restaurar. Ao submeter com sucesso → apagar rascunho.
- **Sem toast de rascunho:** o salvamento automático é silencioso — nunca exibir "Rascunho salvo" como toast. Isso é comportamento de sistema, não de interface.
- **Sem localStorage no SSR:** sempre checar `typeof window !== "undefined"` antes de acessar `localStorage`.

## Páginas Agentes — Estrutura de Rotas
```
/agentes                        → lista de squads + 4 tabs
/agentes/[slug]                 → detalhe de um agente (docs, versioning, skills)
/agentes/squad/[slug]           → detalhe de um squad (agentes, adicionar, remover)
```

## PROJETOS — ESTRUTURA ADAPTATIVA POR TIPO (TRAVADO)

### 15 tipos de projeto disponíveis
```
creator, landing_page, hotsite, microsite, app, saas, sistema, ferramenta,
conteudo, campanha, branding, mockup, documentacao, operacao, outro
```

### Grupos para filtro na lista
- **Creator & Conteúdo**: creator, conteudo, campanha
- **Web & Dev**: landing_page, hotsite, microsite, app, saas, sistema, ferramenta
- **Criação & Visual**: branding, mockup
- **Outros**: documentacao, operacao, outro

### Sistema de cores por tipo — DEFINITIVO (pillBg + pillText)

Cada tipo tem `pillBg` (fundo da tag) e `pillText` (texto legível). Tag sempre `rounded-full`.
NUNCA usar `${cor}12` ou `${cor}18` para fundo de tag — usar sempre `pillBg`/`pillText`.

| Tipo | pillBg | pillText | cor (barra/acento) |
|---|---|---|---|
| creator | `#EEEAFF` | `#4B3FC7` | `#7C6AF7` índigo |
| conteudo | `#E0F5F3` | `#00695C` | `#00897B` teal |
| campanha | `#FCE4F3` | `#AD1570` | `#E91E8C` rosa |
| landing_page / hotsite / microsite | `#E1F4FE` | `#01579B` | `#0288D1` azul |
| app / saas / sistema | `#E3EEFF` | `#0D47A1` | `#1565C0` azul navy |
| ferramenta | `#ECEFF1` | `#263238` | `#37474F` ardósia |
| branding | `#FFF0E2` | `#BF360C` | `#FF6D00` laranja |
| mockup | `#F3ECE9` | `#5D4037` | `#8D6E63` marrom |
| documentacao | `#EEF2F4` | `#37474F` | `#546E7A` azul-cinza |
| operacao | `#EEEAFF` | `#4B3FC7` | `#7C6AF7` índigo |
| outro | `#EEEFE9` | `#5E5E5F` | `#A9AAA5` neutro |

### Barra de progresso — paleta definitiva
```
>= 75% → #D7FF00 (Limão-500 — cor primária)
40-74% → #A8C800 (Limão-600)
< 40%  → #FB8C00 (Laranja — alerta)
Fundo da barra: #EEEFE9 (bg-base da app)
```

### Subprojetos — via metadata
Projetos podem ter subprojetos armazenados em `metadata.subprojetos`.
Estrutura: `{ id, nome, tipo, status, descricao?, progresso? }`.
Tab "Subprojetos" na página interna com criar/remover/status/barra de progresso.
**Não requer migração de schema** — tudo fica no campo JSON `metadata`.

### Abas universais (aparecem em TODOS os tipos — com ícones)
Visão Geral (LayoutGrid) · Contexto (AlignLeft) · Módulos (Boxes) · Tarefas (ListChecks) · Subprojetos (FolderOpen) · Itens Vinculados (Link2) · Memória (Brain) · Rules (ShieldCheck) · Log (History) · Conectores (Wifi)

### Abas específicas por tipo (com ícones semânticos)
| Tipo | Abas extras |
|------|------------|
| creator | Identidade (User) · Aparência (Palette) · Tom de Voz (Mic) · Ambientes (MapPin) · Plataformas (Monitor) · Conteúdo (FileText) · Operação (Settings) · Assets (Package) |
| saas / app | PRD (FileText) · Fluxos (GitMerge) · Arquitetura (Cpu) · Design (Palette) · Banco (Database) · Integrações (Link2) · Deploy (Rocket) |
| landing_page / hotsite / microsite | PRD (FileText) · Copy (PenTool) · Design (Palette) · Arquitetura (GitMerge) · Deploy (Rocket) · Analytics (BarChart2) |
| branding | Diagnóstico (FlaskConical) · Estratégia (Target) · Moodboard (Palette) · Marca (Tag) · Sistema Visual (Globe2) · Assets (Package) · Handoff (Zap) |
| conteudo | Estratégia (Target) · Pilares (Layers) · Calendário (CalendarDays) · Roteiros (PenTool) · Peças (Package) |
| campanha | Conceito (Lightbulb) · Público (Users) · Peças (Package) |

### Modal de criação — 2 passos (inviolável)
1. **Passo 1:** Galeria de tipos agrupada → fundo `pillBg` + ícone + label. Borda do tipo ativo com `cor`.
2. **Passo 2:** Formulário → nome, objetivo, cliente/org, prazo. Squad preenchido automaticamente.

### getCurrentOrganizationId() — OBRIGATÓRIO em páginas
Todas as páginas de rota dinâmica devem usar `getCurrentOrganizationId()` de `lib/auth-organization.ts`.
**NUNCA** usar lookup manual de `organizationMember` em page.tsx — fallback de dev não funciona.

---

## Construção de páginas Hubia (autoalimentado)
- **Plano:** `directives/hubia-plano-creators-proximas-paginas.md` — construir páginas com mapa de rotas, ações, interações, cadastros; marcar onde haverá API e onde agentes serão acionados; APIs não conectar ainda. Telas conforme Figma.
- **Onde tem API = onde entram agentes** (ex.: creator em pedidos → audiovisual-squad).

## Cards de Creator — Padrão visual (Hubia)
- **Layout:** fullbleed — foto ocupa 100% do card (`position: absolute; inset: 0`), gradiente overlay escuro, conteúdo sobre o gradiente.
- **Grid:** `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`, `aspectRatio: 3/4` — mesmo tamanho da Look Library.
- **Conteúdo do card (ordem obrigatória):**
  1. Tag Ativa/Inativa (canto superior esquerdo, pílula preta, texto Limão)
  2. Nome da creator — Urbanist Bold, Limão, `lineHeight: 1.1`, `fontSize: clamp(18px,1.8vw,24px)`
  3. Idade — linha separada, branco 75%, `fontSize: 12px`
  4. Cidade, Estado — linha separada, branco 75%, `fontSize: 12px`
  5. Tags de plataformas — pílulas escuras com backdrop-blur, texto Limão, vindas de `metadata.platforms`
- **Hover:** parallax zoom `scale-[1.12]` apenas na imagem internamente — card não se move.
- **Dados estruturados:** cidade, estado, idade e plataformas ficam em `metadata` (JSON) — nunca parsear do `bio`.

## Fidelidade ao Figma — Regra Suprema
- **Regra em `.cursor/rules/figma-fidelity-supreme.mdc`** (`alwaysApply: true`): quando o usuário anexar imagem ou indicar node Figma, implementar pixel a pixel — zero invenção, zero suposição, zero simplificação sem autorização.
- **Checklist obrigatório:** tipografia, cores (hex exato), espaçamentos, border-radius, hierarquia, estados, layout, conteúdo, interações — tudo extraído da referência antes de codificar.
- **Hex direto > tokens Tailwind** quando necessário para pixel-perfect.

## Creators Ativas (Audiovisual Squad)
- **Ninaah Dornfeld** — `audiovisual-squad/memory/creators/ninaah/`

## Referências Estudadas
- Eli Rigobelli: plugins Claude (skills, commands, agents)
- Bhanu Teja: Mission Control (SOUL.md, memória em camadas)
- Christian Barbosa: BrainRouter (detecção, classificação)
- El Pires: Framework DOE
- Tech Leads Club: skills sob demanda, 40% context, subagents
- Anthropic frontend-design: anti-AI-slop, design thinking
- System Prompts (Cursor/Devin/v0): plan-execute-reflect, resolve-before-returning

## Preferências do Usuário
- Comunicação em português BR
- Tom profissional mas acessível
- Nomes criativos para agentes (ainda não definidos)
- **Rollback sempre disponível:** usuário usa `git checkout --` para reverter sessões. Nunca commitar sem consolidar memória.
- **Não implementar sem aprovação:** animações novas (ex.: spring na pill) precisam de confirmação visual antes de commitar.
- **Agentes devem ser proativos:** o usuário não quer descobrir bugs — os agentes (QA, Orquestrador) devem identificar e reportar problemas antes da revisão humana.
- **Design próprio:** nunca usar padrões de UI "plagiados" de outros sistemas (ex.: bloco de revisão com barra colorida lateral). Tudo deve ter identidade Hubia.

## Visão de Longo Prazo
- Novos squads: marketing, financeiro, CRM, social media
- Dashboard visual de gestão (projeto futuro)
- Bot Telegram (projeto futuro)
