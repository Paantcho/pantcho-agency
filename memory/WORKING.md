# WORKING.md — Tarefa Atual

Lido por TODOS os agentes ANTES de qualquer ação.
Atualizado DEPOIS de cada ação.

---

**Status:** Motion enforcement completo e commitado. Sistema de interação padronizado em toda a plataforma existente. Pronto para avançar para novas páginas.

## Projeto Atual
HUBIA — Implementação contínua (motion enforcement + próximas páginas)

---

## Última sessão

### 1. Resumo em uma frase
Motion enforcement total: spring nas pills (sidebar + tabs), 3 camadas obrigatórias nos modais com AnimatePresence, stagger nos cards, hover areia nos itens inativos de sidebar e tabs, animações semânticas de ícone na sidebar, `motion.button` em todos os botões da plataforma, nova regra `hubia-motion-enforcement.mdc` criada e ativada.

### 2. Arquivos criados ou modificados

| Arquivo | O que foi feito |
|--------|-----------------|
| `.cursor/rules/hubia-motion-enforcement.mdc` | **NOVO.** Lei de motion: botões, sidebar, tabs, modais 3 camadas, cards stagger, dropdowns AnimatePresence, inputs, 3 estados universais, checklist pré-entrega, 10 proibições absolutas. `alwaysApply: true`. |
| `hubia-app/src/components/layout/sidebar.tsx` | Pill: `motion.div` spring (380/28/1). Hover areia `#D5D2C9/40` nos inativos. Ícones com `iconClass` semântico por item (`icon-pulse`, `icon-spark`, `icon-nod` etc). `group` no link para disparar keyframes CSS. |
| `hubia-app/src/components/ui/sliding-tabs.tsx` | Pill: `motion.div` spring (420/30/0.8). Botões: `motion.button` com `whileHover` areia + `whileTap`. |
| `hubia-app/src/components/ui/hubia-modal.tsx` | Reescrito com `AnimatePresence` + 3 camadas (overlay blur 0→12px, container scale 0.88→1 y 20→0, botão X rotate 90°). `if (!open) return null` removido. |
| `hubia-app/src/components/ui/button.tsx` | `MotionButton` com `whileHover scale:1.03` + `whileTap scale:0.96`. `asChild` preservado para Radix Slot. |
| `hubia-app/src/app/(dashboard)/creators/creators-list-client.tsx` | `CreatorCard` → `MotionLink` com stagger (i*0.06, max 0.3s) + `whileHover y:-4` + `whileTap`. `shadow-2xl` removido. Botões `motion.button`. |
| `hubia-app/src/app/(dashboard)/creators/[id]/creator-detail-client.tsx` | Tabs: `motion.button` com hover areia + `whileTap`. Botões de ação (Reativar, primário, secundário): `motion.button`. |
| `hubia-app/src/app/(dashboard)/creators/nova-creator-modal.tsx` | Botões Salvar/Cancelar: `motion.button`. |
| `hubia-app/src/app/(dashboard)/creators/novo/creator-form-client.tsx` | Botão submit + link Cancelar: `motion.button`/`motion.div`. Link Voltar: `motion.div` com `x:-2` hover. |
| `hubia-app/src/app/(dashboard)/config/layout.tsx` | Tabs: `motion.div` wrapper com hover areia + `whileTap`. Pill: spring. |
| `hubia-app/src/app/(dashboard)/config/equipe/equipe-client.tsx` | Icon button `MoreHorizontal`: `whileHover scale:1.12 / whileTap scale:0.90`. Dropdown: `AnimatePresence` fade+scale. `shadow-lg` removido. |
| `hubia-app/src/app/(dashboard)/config/provedores/provedores-client.tsx` | Modais inline → `ProviderModal` com `AnimatePresence` + 3 camadas obrigatórias. Botões `motion.button`. |
| `hubia-app/src/app/(dashboard)/config/branding/branding-color-form.tsx` | Botão Salvar: `motion.button`. Input: `transition-[border-color,box-shadow]`. |
| `hubia-app/src/app/(dashboard)/page.tsx` | KPI cards + Pedidos Prioritários → `dashboard-motion.tsx` (Client Component). |
| `hubia-app/src/app/(dashboard)/dashboard-motion.tsx` | **NOVO.** `KpiCards` + `PedidosPrioritariosCards` com stagger + `whileHover`. |

### 3. O que está funcionando e aprovado

- ✅ Sidebar: pill spring elástica + hover areia nos inativos + ícones animam semanticamente no hover
- ✅ Tabs (todas): pill spring + hover areia + whileTap nos botões
- ✅ Modais: 3 camadas com AnimatePresence (overlay blur, container scale, botão X rotate)
- ✅ Botões: `motion.button` em toda a plataforma (primário, secundário, ghost, icon)
- ✅ Cards Creators: stagger de entrada + whileHover y:-4 + flat design (sem shadow)
- ✅ Dropdowns: AnimatePresence fade+scale
- ✅ `hubia-motion-enforcement.mdc`: regra ativa que guia toda nova criação

### 4. O que está incompleto ou pendente

- [ ] Páginas por construir: Pedidos, Projetos, Calendário, Gerador, Relatório, Conhecimento, Agentes, Memória, Arquitetura
- [ ] KPIs do Creator Overview: alguns valores hardcoded
- [ ] Metadata da Natasha Freitas: seed sem campos estruturados
- [ ] Upload de avatar/logo: ainda URL manual

### 5. Próxima ação exata

→ Escolher próxima página para construir (Pedidos é a prioridade indicada no backlog).
→ Antes de qualquer nova tela: consultar Figma (MCP), mapear rotas e ações, seguir `hubia-motion-enforcement.mdc` desde o primeiro componente.

### 6. Regra de ouro para novas páginas

**Toda nova página/componente deve passar pelo checklist de `hubia-motion-enforcement.mdc` antes de ser entregue.**
Não existe botão sem `whileHover`/`whileTap`. Não existe modal sem as 3 camadas. Não existe lista de cards sem stagger.

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

### Build
- [x] `npm run build` — compilação limpa (commit anterior)

---

## Próximas Páginas (por ordem de prioridade)
- [ ] **Pedidos** — lista, detalhe, criar, status
- [ ] **Projetos** — lista, kanban ou lista, detalhe
- [ ] **Calendário** — visualização mensal/semanal
- [ ] **Gerador** — interface de geração de prompts
- [ ] **Relatório** — dashboard de métricas
- [ ] **Conhecimento, Agentes, Memória, Arquitetura** — páginas de sistema
