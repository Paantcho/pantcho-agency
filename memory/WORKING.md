# WORKING.md — Tarefa Atual

Lido por TODOS os agentes ANTES de qualquer ação.
Atualizado DEPOIS de cada ação.

---

**Status:** Sprint "Pedidos v2 + Refinamentos Visuais" — COMPLETO. Build limpo. Zero erros TypeScript.

## Projeto Atual
HUBIA — Sprint de refinamento profundo da plataforma. Página Pedidos refeita do zero com layout correto (título solto, tab-navbar com pill, white box apenas no conteúdo), DnD real no Kanban, modal Novo Pedido sem scroll em 2 colunas, toasts Hubia com cores limpas, upload de resultado com drag and drop, página `/pedidos/[id]` com cadeia de produção, prompt final e contexto automático fiel à ref do usuário. Página `/projetos/[id]` completamente reconstruída com tabs dinâmicas por squad.

---

## Última sessão (2026-03-08 — Sprint Pedidos v2 + Refinamentos)

### 1. Resumo em uma frase
Pedidos totalmente refatorados: layout correto com white box só no conteúdo, DnD funcional e adaptativo, modal sem scroll em 2 colunas com "criar projeto" inline, cores de status travadas e legíveis em qualquer fundo, toasts limão/ink, upload com drag real, cadeia de produção e prompt final na página de detalhe.

### 2. Arquivos criados ou modificados

| Arquivo | O que foi feito |
|--------|-----------------|
| `src/components/layout/app-shell.tsx` | Revertido ao original — zero white box global. Cada página gerencia seu próprio container |
| `src/components/ui/hubia-toast.tsx` | **REESCRITO.** Paleta Hubia: success/info = fundo limão (#D7FF00) + texto ink; error/warning = fundo ink (#0E0F10) + texto branco |
| `src/app/(dashboard)/pedidos/pedidos-client.tsx` | **COMPLETAMENTE REESCRITO (v3).** Layout correto: título + botão soltos, tab-navbar squad com pill spring, white box só no conteúdo. DnD com @dnd-kit: colunas destacadas ao arrastar, drop zone adaptativa ao tamanho do card, overlay com rotate. Modal Novo Pedido 2 colunas sem scroll. Criar projeto inline. HubiaDatePicker próprio. Creator condicional por tipo. Filtros squad + busca + urgência. Kanban cards em #F7F7F5 sobre white box |
| `src/app/(dashboard)/pedidos/[id]/pedido-detail-client.tsx` | **COMPLETAMENTE REESCRITO.** Cadeia de produção dinâmica por tipo (Planner→Copywriter→Diretor de Arte→Diretor de Cena→Consistência→Eng.Prompts para audiovisual; Arquiteto→Designer→Dev→QA→Deploy para dev). Prompt Final em card #0E0F10 com botão copiar. Contexto Automático na lateral. Upload de resultado com drag and drop real + múltiplos arquivos + preview. Notas editáveis. Briefing editável inline. Creator só aparece para tipos audiovisual. |
| `src/app/(dashboard)/projetos/[id]/projeto-detail-client.tsx` | **COMPLETAMENTE REESCRITO.** Tabs dinâmicas por squad (Dev: 7 tabs; Audiovisual: 6 tabs). KPIs animados com progresso. Stack tech em badges. Decisões. Link para Figma |

### 3. O que está funcionando e aprovado (confirmado pelo usuário)

- ✅ Layout: título + "Novo Pedido" soltos sobre #EEEFE9, tab-navbar abaixo, white box apenas no conteúdo
- ✅ Tab-navbar squad: Todos / AUDIOVISUAL / DEV com pill spring
- ✅ Toggle views: Kanban / Calendário / Lista com pill spring preta + texto limão
- ✅ Filtros: busca animada + dropdown urgência
- ✅ Kanban DnD: arrastar entre colunas, colunas destacadas, drop zone adaptativa ao tamanho do card
- ✅ Kanban cards em #F7F7F5 sobre white box — hierarquia visual sem sombra
- ✅ Modal Novo Pedido: 2 colunas, sem scroll, datepicker nunca cortado, creator condicional, criar projeto inline
- ✅ HubiaDatePicker: calendário customizado, sem input nativo
- ✅ Página /pedidos/[id]: cadeia de produção, prompt final, contexto automático, upload resultado
- ✅ Upload resultado: drag and drop real, múltiplos arquivos, preview
- ✅ Toasts: limão (success/info) e ink (error/warning) — sem conflito com qualquer fundo
- ✅ Paleta de status travada: cada status tem bg/text/dot calculados para legibilidade absoluta
- ✅ "Em Progresso" legível: fundo #F0FF80, texto #5A6600 (nunca limão sobre branco)
- ✅ Página /projetos/[id]: tabs por squad, KPIs, stack, decisões
- ✅ Efeito "Movido para Backlog" no toast ao fazer DnD

### 4. Regras derivadas desta sessão (consolidar no MEMORY.md)

- **White box:** AppShell nunca tem white box global. Cada página coloca `rounded-[20px] bg-white p-5` APENAS ao redor do conteúdo principal.
- **Título e controles:** ficam FORA do white box, sobre o fundo #EEEFE9
- **Paleta de status:** TRAVADA em STATUS_PALETTE — nunca usar limão como cor de texto sobre branco
- **Creator condicional:** aparece APENAS para tipos imagem/video/creator — nunca para DEV
- **Toasts:** success/info = #D7FF00 (limão), error/warning = #0E0F10 (ink)
- **DnD:** drop zone herda altura do card arrastado via getBoundingClientRect()

### 5. O que está incompleto ou pendente

- [ ] Auth: usuário precisa ter membership para salvar novos pedidos via form (dev workaround via getCurrentOrganizationId)
- [ ] Revisão geral de outras páginas com o mesmo padrão de layout (título solto + tab-navbar + white box)
- [ ] Calendário: opção de visualização semanal além da mensal
- [ ] Revisão em revisão: múltiplos revisores (redator, diretor de arte, planejador) — fluxo de aprovação
- [ ] Memória, Conhecimento, Relatório — construção completa
- [ ] API keys: Supabase Storage, Telegram, AI providers (ver `memory/CHECKLIST-FINAL.md`)

### 6. Próxima ação exata

→ Aplicar o padrão "título + tab-navbar + white box" em todas as páginas que ainda usam o layout antigo (Projetos, Creators, Gerador, etc.).
→ Construir páginas restantes: Memória, Conhecimento, Relatório.

---

### Schema & Config
- [x] Schema Prisma: 19+ models validados
- [x] Config Prisma 7 + singleton + adapter-pg

### Database
- [x] `prisma db push` — 19+ tabelas no Supabase
- [x] Seed: 1 org, 1 branding, Creator Ninaah com metadata, Dev Squad + Audiovisual Squad, 9 agentes, 17 skills
- [x] Seed v2: 11 pedidos distribuídos em todos os status, 3 projetos com metadata rica, 2 creators

### Auth & Middleware
- [x] Supabase client browser + server
- [x] Middleware: refresh + proteção de rotas
- [x] Login: email+senha, magic link, Google OAuth

### RLS
- [x] `rls-policies.sql` executado

### Design System
- [x] `globals.css` com tokens Hubia completos
- [x] Tailwind 4 `@theme inline` com paleta completa
- [x] Urbanist via `next/font/google`
- [x] 12 `@keyframes` de ícone em `globals.css`

### Layout Shell
- [x] Sidebar: 12 itens, pill spring, ícones animados semanticamente, hover areia
- [x] AppShell com transição de página Shared Axis vertical

### Config Pages
- [x] Config/Equipe, Branding, Provedores — banco + CRUD
- [x] Config tabs: SlidingTabs spring + TabContent direcional

### Motion System — COMPLETO
- [x] `hubia-motion-enforcement.mdc` — lei de motion (`alwaysApply: true`)
- [x] `motion-interactions.mdc` — padrões detalhados (`alwaysApply: true`)
- [x] Sidebar: pill spring + hover areia + ícones semânticos
- [x] Tabs: pill spring + hover areia + whileTap
- [x] Modais: 3 camadas com AnimatePresence + `HubiaPortal`
- [x] Botões: `animate` com variants ou `animate={{ backgroundColor }}`
- [x] Cards: stagger + whileHover + flat design
- [x] Dropdowns: AnimatePresence fade+scale
- [x] Transição de página: Shared Axis vertical
- [x] DnD Kanban: @dnd-kit, colunas destacadas, drop zone adaptativa

### Creators
- [x] Lista de creators — banco + cards pixel-perfect + motion
- [x] Creator detail: 5 tabs (visão geral, aparência, ambientes, looks, voz)
- [x] Nova creator modal
- [x] Formulário novo creator

### Gerador de Prompt
- [x] 3 tabs: Gerador, Histórico, Photo Cloner
- [x] Modal "Ver Completo" com `HubiaModal`
- [x] Server Action `gerarPrompt`
- [x] `HubiaSelect` em todos os campos de seleção
- [x] Motion: variantes propagadas, stagger checklist, ícone Sparkles

### UI Components (reutilizáveis globais)
- [x] `HubiaSelect` — dropdown customizado sem `<select>` nativo
- [x] `HubiaToastProvider` + `toast.*` — toast Hubia com Zustand: limão (success/info) + ink (error/warning)
- [x] `HubiaPortal` — createPortal para modais com backdrop blur full-screen
- [x] `SlidingTabs` com variantes propagadas nos ícones
- [x] `HubiaModal` — modal base com 3 camadas
- [x] `HubiaDatePicker` — calendário customizado, sem `<input type="date">` nativo

### Pedidos (COMPLETO v2)
- [x] Lista Kanban com DnD (@dnd-kit) — arrastar entre colunas com feedback visual
- [x] Calendário mensal com eventos coloridos por tipo
- [x] Lista tabular com todos os metadados
- [x] Modal Novo Pedido: 2 colunas, sem scroll, criar projeto inline, creator condicional
- [x] Modal Detalhe: 4 KPIs, tabs dinâmicas por tipo, status flow clicável
- [x] Página /pedidos/[id]: cadeia de produção, prompt final, contexto automático, upload resultado
- [x] Briefing editável inline (JSON)
- [x] Upload de resultado: drag and drop real, múltiplos arquivos, preview

### Projetos (COMPLETO v1)
- [x] Lista com cards, KPIs, filtros
- [x] Modal Novo Projeto
- [x] Página /projetos/[id]: tabs por squad, KPIs animados, stack, decisões, link Figma

### Agentes (COMPLETO)
- [x] Schema: Squad + SquadAgent + SquadStatus + EntityVersion
- [x] Seed: Dev Squad + Audiovisual Squad, 9 agentes, 17 skills
- [x] Tab Squads: grid 3 colunas, cards, filtros pill, stagger, headers clicáveis → página do squad
- [x] Tab Skills Registry: 2 colunas, badge SEMPRE, botão EDITAR com inline editing
- [x] Tab Fluxo do Orquestrador: diagrama com stagger + dots coloridos por squad
- [x] Tab Squads Futuros: banner + grid + cards futuros clicáveis + botão "Criar novo squad" funcional
- [x] Página Agente (`/agentes/[slug]`): 2 colunas, docs, versioning, histórico de versões
- [x] Página Squad (`/agentes/squad/[slug]`): agentes, adicionar multi-select, remover, criar novo
- [x] Auto-draft: rascunhos salvos no localStorage
- [x] Agente QA/Review criado: `dev-squad/agents/qa-review/SOUL.md`

### Build
- [x] `npm run build` — compilação limpa

---

## Próximas Páginas (por ordem de prioridade)
- [ ] **Aplicar layout padrão** (título + tab-navbar + white box) em Projetos, Creators, Gerador
- [ ] **Calendário** — visualização semanal além da mensal
- [ ] **Relatório** — dashboard de métricas
- [ ] **Conhecimento** — base de conhecimento
- [ ] **Memória** — memória dos agentes
- [ ] **Arquitetura** — diagrama de arquitetura
