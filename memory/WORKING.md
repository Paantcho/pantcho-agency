# WORKING.md — Tarefa Atual

Lido por TODOS os agentes ANTES de qualquer ação.
Atualizado DEPOIS de cada ação.

---

**Status:** Página Agentes concluída pixel-perfect — 4 tabs, banco, seed, motion. Build limpo.

## Projeto Atual
HUBIA — Implementação contínua (motion enforcement + próximas páginas)

---

## Última sessão

### 1. Resumo em uma frase
Gerador de Prompt entregue com 3 tabs + modal; depois: selects nativos substituídos por `HubiaSelect`, sistema de toast criado do zero, ícones nas tabs e botões corrigidos com padrão de variantes propagadas do Framer Motion.

### 2. Arquivos criados ou modificados (últimas 2 sessões)

| Arquivo | O que foi feito |
|--------|-----------------|
| `hubia-app/src/app/(dashboard)/gerador/page.tsx` | **NOVO.** Server Component: busca creators e renderiza GeradorClient. |
| `hubia-app/src/app/(dashboard)/gerador/gerador-client.tsx` | **NOVO.** 3 tabs (Gerador, Histórico, Photo Cloner), modal Ver Completo, StyledSelect → HubiaSelect, botão "Novo pedido" com Plus e variantes propagadas. |
| `hubia-app/src/app/(dashboard)/gerador/actions.ts` | **NOVO.** Server Actions: `getCreatorsForGerador`, `gerarPrompt`. |
| `hubia-app/src/components/ui/hubia-select.tsx` | **NOVO.** Dropdown 100% customizado — zero `<select>` nativo. AnimatePresence, ChevronDown animado, checkmark Limão no item ativo, stagger nos itens. |
| `hubia-app/src/components/ui/hubia-toast.tsx` | **NOVO.** Sistema de toast completo com Zustand. Entrada blur+scale, saída translateX. Auto-dismiss 3500ms. Botão X com rotate 90°. API: `toast.success/error/warning/info`. |
| `hubia-app/src/app/layout.tsx` | `HubiaToastProvider` adicionado no root — toasts disponíveis em toda a aplicação. |
| `hubia-app/src/components/ui/sliding-tabs.tsx` | **Refatorado.** Variantes nomeadas `rest/hovered` no pai propagam para o `motion.span` do ícone — animação de scale garantida ao hover. |
| `hubia-app/src/components/layout/sidebar.tsx` | `BarChart3` → `icon-grow`, `BookOpen` → `icon-flip` (semântica correta). Dropdown de org: `motion.button` + `AnimatePresence`. |
| `hubia-app/src/app/(dashboard)/creators/creators-list-client.tsx` | Botão "Nova creator": variantes propagadas + Plus gira 90° no hover. |
| `hubia-app/src/app/(dashboard)/creators/[id]/creator-detail-client.tsx` | Botões primário e secundário: variantes propagadas — ícone escala junto ao hover do botão. |

### 3. O que está funcionando e aprovado

- ✅ Sidebar: pill spring + hover areia + ícones semânticos corretos + dropdown de org com AnimatePresence
- ✅ Tabs (`SlidingTabs`): pill spring + variantes propagadas nos ícones + hover areia + whileTap
- ✅ Modais: 3 camadas com AnimatePresence (overlay blur, container scale, botão X rotate)
- ✅ Botões: variantes `rest/hovered` propagam para ícones filhos — funciona em 100% dos casos
- ✅ Selects: `HubiaSelect` customizado — zero sistema operacional
- ✅ Toasts: `HubiaToastProvider` no root — `toast.success/error/warning/info` disponíveis globalmente
- ✅ Gerador de Prompt: 3 tabs + modal + Server Action + motion completo
- ✅ Build limpo (npm run build sem erros)

### 4. O que está incompleto ou pendente

- [ ] Páginas por construir: Pedidos, Projetos, Calendário, Relatório, Conhecimento, Agentes, Memória, Arquitetura
- [ ] Review geral de motion nas páginas mais antigas (Config, Dashboard) — passagem pendente
- [ ] KPIs do Creator Overview: alguns valores hardcoded
- [ ] Metadata da Natasha Freitas: seed sem campos estruturados
- [ ] Upload de avatar/logo: ainda URL manual

### 5. Próxima ação exata

→ Próxima página a construir: **Pedidos** (prioridade do backlog).
→ Antes de começar: verificar se existe node Figma para a tela. Se sim, pedir imagem ao usuário.
→ Toda nova tela: `HubiaSelect` para selects, `toast.*` para feedback, variantes propagadas em todos os botões com ícone.

### 6. Regra de ouro para novas páginas

**Toda nova página/componente deve passar pelo checklist de `hubia-motion-enforcement.mdc` antes de ser entregue.**
- Nunca `<select>` nativo — sempre `HubiaSelect`
- Nunca `alert()`/`confirm()` — sempre `toast.*`
- Nunca `motion.span whileHover` dentro de `motion.button whileHover` — sempre variantes propagadas (`initial="rest" whileHover="hovered"` no pai, `variants` no filho)

---

## Histórico de entregas

### Schema & Config
- [x] Schema Prisma: 19 models validado
- [x] Config Prisma 7 + singleton + adapter-pg

### Database
- [x] `prisma db push` — 19 tabelas no Supabase
- [x] Seed: 1 org, 1 branding, Creator Ninaah com metadata

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
- [x] Modais: 3 camadas com AnimatePresence
- [x] Botões: MotionButton em toda a plataforma
- [x] Cards: stagger + whileHover + flat design
- [x] Dropdowns: AnimatePresence fade+scale
- [x] Transição de página: Shared Axis vertical

### Creators
- [x] Lista de creators — banco + cards pixel-perfect + motion
- [x] Creator detail: 5 tabs (visão geral, aparência, ambientes, looks, voz)
- [x] Nova creator modal
- [x] Formulário novo creator

### Gerador de Prompt
- [x] 3 tabs: Gerador, Histórico, Photo Cloner
- [x] Modal "Ver Completo" com `HubiaModal`
- [x] Server Action `gerarPrompt` montando prompt a partir de `CreatorAppearance`
- [x] `HubiaSelect` em todos os campos de seleção
- [x] Motion: variantes propagadas, stagger checklist, ícone Sparkles
- [x] Build limpo

### UI Components (reutilizáveis globais)
- [x] `HubiaSelect` — dropdown customizado sem `<select>` nativo
- [x] `HubiaToastProvider` + `toast.*` — sistema de toast Hubia (Zustand)
- [x] `SlidingTabs` com variantes propagadas nos ícones

### Build
- [x] `npm run build` — compilação limpa (último commit)

### Agentes
- [x] Schema: Squad + SquadAgent + SquadStatus + db push + generate
- [x] Seed: Dev Squad + Audiovisual Squad, 9 agentes, 17 skills
- [x] Tab Squads: grid 3 colunas, cards pretos, filtros pill, stagger
- [x] Tab Skills Registry: 2 colunas flat, badge SEMPRE, botão EDITAR animado
- [x] Tab Fluxo do Orquestrador: diagrama com stagger
- [x] Tab Squads Futuros: banner dashed + grid status colorido + card Criar
- [x] Build limpo

---

## Próximas Páginas (por ordem de prioridade)
- [ ] **Pedidos** — lista, detalhe, criar, status
- [ ] **Projetos** — lista, kanban ou lista, detalhe
- [ ] **Projetos** — lista, kanban ou lista, detalhe
- [ ] **Calendário** — visualização mensal/semanal
- [ ] **Gerador** — interface de geração de prompts
- [ ] **Relatório** — dashboard de métricas
- [ ] **Conhecimento, Agentes, Memória, Arquitetura** — páginas de sistema
