# WORKING.md — Tarefa Atual

Lido por TODOS os agentes ANTES de qualquer ação.
Atualizado DEPOIS de cada ação.

---

**Status:** Página Agentes + Squad Detail entregues com motion completo. Build limpo. Memória consolidada.

## Projeto Atual
HUBIA — Implementação contínua de páginas (Agentes concluído, próximo: Pedidos)

---

## Última sessão (2026-03-08)

### 1. Resumo em uma frase
Página Agentes refinada com correções de motion (animate vs style), página de detalhe do agente (`/agentes/[slug]`), página de detalhe do squad (`/agentes/squad/[slug]`) com seleção múltipla de agentes, criação inline e auto-draft de rascunho; botão "Criar novo squad" funcional.

### 2. Arquivos criados ou modificados

| Arquivo | O que foi feito |
|--------|-----------------|
| `src/app/(dashboard)/agentes/agentes-client.tsx` | Modal Novo Agente com auto-draft no localStorage; modal "Criar novo squad" funcional; `TabSquads` com links nos headers; `TabSquadsFuturos` com cards clicáveis; `NovoSquadModal` novo; `AddAgentModal` refatorado para seleção múltipla; botões de status/squad corrigidos com `animate` em vez de `style` |
| `src/app/(dashboard)/agentes/actions.ts` | Adicionadas: `getSquadBySlug`, `getAllAgents`, `addAgentToSquad`, `removeAgentFromSquad`, `createSquad`, `SquadDetail` interface |
| `src/app/(dashboard)/agentes/[slug]/page.tsx` | **NOVO.** Server Component da página de detalhe do agente |
| `src/app/(dashboard)/agentes/[slug]/agent-detail-client.tsx` | **NOVO.** Página de detalhe: 2 colunas, menu de documentos com `animate` (sem bug de seleção), versioning com `EntityVersion`, histórico de versões, editor de documentos |
| `src/app/(dashboard)/agentes/squad/[slug]/page.tsx` | **NOVO.** Server Component da página de detalhe do squad; auto-cria squads futuros no banco na primeira visita |
| `src/app/(dashboard)/agentes/squad/[slug]/squad-detail-client.tsx` | **NOVO.** Página de detalhe do squad: lista de agentes, `AddAgentModal` com seleção múltipla + grid de cards ticáveis + botão confirmar, `NovoAgenteModal` com auto-draft |
| `src/components/ui/hubia-portal.tsx` | **NOVO (sessão anterior).** `createPortal` para modais no `document.body` — corrige `backdrop-filter` em qualquer contexto |

### 3. O que está funcionando e aprovado

- ✅ Sidebar: pill spring + hover areia + ícones semânticos + dropdown de org
- ✅ Tabs (`SlidingTabs`): pill spring + variantes propagadas + hover areia + whileTap
- ✅ Modais: 3 camadas com `HubiaPortal` (backdrop blur full-screen em 100% dos casos)
- ✅ Botões: `animate={{ backgroundColor }}` em vez de `style` — nunca congela com Framer Motion
- ✅ `HubiaSelect`, `HubiaToastProvider`, `HubiaPortal` — componentes globais
- ✅ Gerador de Prompt: 3 tabs + modal + Server Action + motion completo
- ✅ Página Agentes: 4 tabs completos, banco, seed, motion
- ✅ Página Agente (detalhe): 2 colunas, docs, versioning, histórico
- ✅ Página Squad (detalhe): agentes, adicionar (multi-select), remover, criar novo
- ✅ Auto-draft: formulários salvam rascunho no localStorage ao fechar sem publicar
- ✅ Build limpo (`npm run build` sem erros)

### 4. O que está incompleto ou pendente

- [ ] Páginas por construir: **Pedidos**, Projetos, Calendário, Relatório, Conhecimento, Memória, Arquitetura
- [ ] Review geral de motion nas páginas mais antigas (Config, Dashboard)
- [ ] KPIs do Creator Overview: alguns valores hardcoded
- [ ] Upload de avatar/logo: ainda URL manual

### 5. Próxima ação exata

→ Próxima página a construir: **Pedidos** (prioridade do backlog).
→ Antes de começar: verificar se existe node Figma para a tela.
→ Toda nova tela: `HubiaSelect`, `HubiaPortal` em modais, `toast.*`, variantes propagadas, `animate` nunca `style` para valores dinâmicos.

### 6. Regras críticas aprendidas nesta sessão

- **`animate` vs `style` com Framer Motion:** Nunca use `style={{ background: isActive ? ... }}` para valores que mudam. O Framer Motion congela o valor no primeiro render do hover. **Sempre** use `animate={{ backgroundColor: isSel ? "#X" : "#Y" }}` com `initial={false}`.
- **`HubiaPortal` obrigatório em modais:** Qualquer modal que precise de `backdrop-filter: blur()` full-screen DEVE usar `HubiaPortal` (createPortal para `document.body`). Framer Motion e outros wrappers criam stacking context que quebram o blur.
- **Auto-draft universal:** Todo formulário de criação que o usuário pode fechar acidentalmente deve salvar rascunho no `localStorage` com chave única. Restaurar ao reabrir. Limpar ao submeter com sucesso.

---

## Histórico de entregas

### Schema & Config
- [x] Schema Prisma: 19+ models validados
- [x] Config Prisma 7 + singleton + adapter-pg

### Database
- [x] `prisma db push` — 19+ tabelas no Supabase
- [x] Seed: 1 org, 1 branding, Creator Ninaah com metadata, Dev Squad + Audiovisual Squad, 9 agentes, 17 skills

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
- [x] `HubiaToastProvider` + `toast.*` — sistema de toast Hubia (Zustand)
- [x] `HubiaPortal` — createPortal para modais com backdrop blur full-screen
- [x] `SlidingTabs` com variantes propagadas nos ícones
- [x] `HubiaModal` — modal base com 3 camadas

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

### Build
- [x] `npm run build` — compilação limpa

---

## Próximas Páginas (por ordem de prioridade)
- [ ] **Pedidos** — lista, detalhe, criar, status
- [ ] **Projetos** — lista, kanban ou lista, detalhe
- [ ] **Calendário** — visualização mensal/semanal
- [ ] **Relatório** — dashboard de métricas
- [ ] **Conhecimento** — base de conhecimento
- [ ] **Memória** — memória dos agentes
- [ ] **Arquitetura** — diagrama de arquitetura
