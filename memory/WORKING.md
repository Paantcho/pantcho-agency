# WORKING.md — Tarefa Atual

Lido por TODOS os agentes ANTES de qualquer ação.
Atualizado DEPOIS de cada ação.

---

**Status:** Sprint "Projetos v2 + Seed v3" — COMPLETO. Build limpo. Zero erros TypeScript.

## Projeto Atual
HUBIA — Página Projetos reconstruída como hub inteligente com estrutura adaptativa por tipo. 7 tipos de projeto com abas, módulos, memória, rules e log dinâmicos. Seed v3 com 7 projetos mockados, todos com conteúdo rico em todas as abas.

---

## Última sessão (2026-03-08 — Sprint Projetos v2 + Seed v3)

### 1. Resumo em uma frase
Projetos virou hub inteligente com 15 tipos, abas adaptativas por tipo, modal de criação em 2 passos com prévia de módulos, seed v3 com 7 projetos totalmente preenchidos (SaaS, Conteúdo, Landing Page, Creator, Branding, App, Campanha), e fix do bug de org_id null que impedia a lista de aparecer.

### 2. Arquivos criados ou modificados

| Arquivo | O que foi feito |
|--------|-----------------|
| `prisma/schema.prisma` | enum `ProjetoTipo` com 15 valores adicionado; campo `tipo` no model `Projeto` |
| `prisma/seed.ts` | **v3 completo.** 7 projetos com metadata rica: contexto, PRD, arquitetura, identidade, tom de voz, aparência, conceito, tarefas, decisões, memória, rules, log |
| `src/app/(dashboard)/projetos/page.tsx` | **Fix crítico.** Substituído padrão antigo (member lookup) por `getCurrentOrganizationId()` — projetos agora aparecem sem membership ativo |
| `src/app/(dashboard)/projetos/[id]/page.tsx` | Mesmo fix — usa `getCurrentOrganizationId()` |
| `src/app/(dashboard)/projetos/actions.ts` | `ProjetoTipo` adicionado; `createProjeto` aceita tipo obrigatório; `updateProjeto`; `updateProjetoMetadata` (seção específica); `deleteProjeto` — todos com logActivity |
| `src/app/(dashboard)/projetos/projetos-client.tsx` | **REESCRITO.** Layout padrão (título + tab-navbar + white box). Filtros por grupo com pill spring. Cards com tipo, status, módulos preview, progresso. Modal 2 passos: galeria de tipos → formulário com squad automático |
| `src/app/(dashboard)/projetos/[id]/projeto-detail-client.tsx` | **REESCRITO.** Tabs adaptativas por tipo (14 tipos × N abas). Abas editáveis inline. Tarefas com toggle. Memória com entradas. Rules com remoção. Log timeline. |
| `src/lib/activity-log.ts` | Adicionado `"projeto.editado"` ao enum LogAction |
| `memory/WORKING.md` | Este arquivo |
| `memory/MEMORY.md` | Decisões e regras consolidadas |

### 3. O que está funcionando e aprovado

- ✅ Lista de Projetos: 7 projetos visíveis com tipo, status, módulos, progresso
- ✅ Filtros por grupo: Todos / Creator / Dev / Conteúdo / Visual com pill spring
- ✅ Modal criação em 2 passos: galeria de tipos → formulário
- ✅ Cards com cor do tipo, módulos preview em badges, progresso animado
- ✅ Detalhe de projeto com tabs adaptativas por tipo
- ✅ Abas editáveis inline (Contexto, PRD, Arquitetura, Design, etc.)
- ✅ Aba Tarefas: toggle de conclusão + adicionar nova
- ✅ Aba Memória: adicionar entradas com data automática
- ✅ Aba Rules: adicionar + remover restrições
- ✅ Aba Log: timeline de eventos
- ✅ Seed v3: 7 projetos com conteúdo em TODAS as abas
- ✅ Fix org_id: `getCurrentOrganizationId()` em ambas as páginas

### 4. 7 projetos mockados disponíveis

| Nome | Tipo | Status | Progresso | Abas com conteúdo |
|------|------|--------|-----------|-------------------|
| Pantcho Agency Hub | saas | ativo | 38% | Contexto, PRD, Arquitetura, Deploy, Tarefas, Memória, Rules, Log |
| Conteúdo Ninaah — Março | conteudo | ativo | 60% | Contexto, Conceito, Tarefas, Memória, Rules, Log |
| Landing Page Privacy | landing_page | ativo | 45% | Contexto, PRD, Arquitetura, Design, Deploy, Tarefas, Memória, Rules |
| Creator Ninaah Dornfeld | creator | ativo | 78% | Identidade, Aparência, Tom de Voz, Tarefas, Memória, Rules, Log |
| Branding Pantcho Agency | branding | pausado | 32% | Conceito, Tarefas, Memória, Rules, Log |
| Hubia Mobile — App Creator | app | ativo | 12% | Contexto, PRD, Arquitetura, Tarefas, Memória, Rules, Log |
| Lançamento Sofia Alves | campanha | ativo | 20% | Conceito, Tarefas, Memória, Rules, Log |

### 5. Bug corrigido

- **Bug:** `projetos/page.tsx` usava padrão antigo (lookup por `organizationMember`) → retornava `null` em dev → lista vazia
- **Fix:** Substituído por `getCurrentOrganizationId()` que tem fallback para primeira org em desenvolvimento
- **Mesma correção:** `projetos/[id]/page.tsx`

### 6. O que está incompleto ou pendente

- [ ] HubiaDatePicker: extrair de `pedidos-client.tsx` para `components/ui/hubia-date-picker.tsx` (reutilizar em outras páginas)
- [ ] Aplicar layout padrão (título + tab-navbar + white box) nas demais páginas que ainda usam padrão antigo
- [ ] Calendário: visualização semanal além da mensal
- [ ] Relatório — dashboard de métricas
- [ ] Conhecimento — biblioteca de documentos
- [ ] Memória — sistema de contexto de plataforma
- [ ] Verificar e corrigir bug de org_id nas demais páginas (Conhecimento, Memória, Relatório, Calendário)

### 7. Próxima ação exata

→ Verificar todas as demais páginas com o mesmo bug de org_id (getCurrentOrganizationId em vez de member lookup)
→ Construir Relatório com métricas reais dos dados mockados
→ Ou avançar para outra página conforme direção do usuário

---

### Schema & Config
- [x] Schema Prisma: 20+ models validados
- [x] `ProjetoTipo`: enum com 15 valores
- [x] Config Prisma 7 + singleton + adapter-pg

### Database
- [x] `prisma db push` — banco sincronizado
- [x] Seed v3: 7 projetos ricos, 11 pedidos, 2 creators, 7 logs

### Auth & Middleware
- [x] Supabase client browser + server
- [x] Middleware: refresh + proteção de rotas
- [x] Login: email+senha, magic link, Google OAuth
- [x] `getCurrentOrganizationId()` com fallback dev em todas as páginas

### RLS
- [x] `rls-policies.sql` executado

### Design System
- [x] `globals.css` com tokens Hubia completos
- [x] Tailwind 4 `@theme inline` com paleta completa
- [x] Urbanist via `next/font/google`
- [x] 12 `@keyframes` de ícone em `globals.css`

### Layout Shell
- [x] Sidebar: 12 itens, pill spring, ícones animados semanticamente, hover areia
- [x] AppShell: fundo #EEEFE9 + transição de página — sem white box global

### Config Pages
- [x] Config/Equipe, Branding, Provedores — banco + CRUD
- [x] Config tabs: SlidingTabs spring + TabContent direcional

### Motion System — COMPLETO
- [x] Lei de motion (`alwaysApply: true`)
- [x] Sidebar: pill spring + hover areia + ícones semânticos
- [x] Tabs: pill spring + hover areia + whileTap
- [x] Modais: 3 camadas com AnimatePresence + `HubiaPortal`
- [x] Botões: variantes propagadas com animate
- [x] Cards: stagger + whileHover + flat design
- [x] Dropdowns: AnimatePresence fade+scale
- [x] Transição de página: Shared Axis vertical
- [x] DnD Kanban: @dnd-kit, colunas destacadas, drop zone adaptativa

### Creators
- [x] Lista de creators com cards pixel-perfect + motion
- [x] Creator detail: 5 tabs (visão geral, aparência, ambientes, looks, voz)
- [x] Nova creator modal

### Gerador de Prompt
- [x] 3 tabs: Gerador, Histórico, Photo Cloner
- [x] Modal "Ver Completo" com HubiaModal
- [x] Server Action `gerarPrompt`

### UI Components (reutilizáveis globais)
- [x] `HubiaSelect` — dropdown customizado
- [x] `HubiaToastProvider` + `toast.*` — limão (success/info) + ink (error/warning)
- [x] `HubiaPortal` — createPortal para modais
- [x] `SlidingTabs` com variantes propagadas
- [x] `HubiaModal` — modal base com 3 camadas
- [x] `HubiaDatePicker` — calendário customizado (inline em pedidos-client, extrair pendente)

### Pedidos (COMPLETO v2)
- [x] Kanban DnD com drop zone adaptativa
- [x] Calendário mensal + Lista
- [x] Modal Novo Pedido: 2 colunas, sem scroll, criar projeto inline
- [x] Página /pedidos/[id]: cadeia de produção, prompt final, upload resultado

### Projetos (COMPLETO v2)
- [x] 15 tipos com ícone, cor, squad, módulos e documentos previstos
- [x] Lista com filtros por grupo + busca + pill spring
- [x] Modal 2 passos: galeria de tipos → formulário com squad automático
- [x] Detalhe com tabs adaptativas por tipo
- [x] Abas editáveis inline: Contexto, PRD, Arquitetura, Design, Deploy, etc.
- [x] Aba Tarefas: toggle + adicionar
- [x] Aba Memória: adicionar entradas
- [x] Aba Rules: adicionar + remover
- [x] Aba Log: timeline
- [x] `updateProjetoMetadata` server action

### Agentes (COMPLETO)
- [x] Dev Squad + Audiovisual Squad, 9 agentes, 17 skills
- [x] Página Agente e Squad com detalhe completo
- [x] Agente QA/Review criado

### Build
- [x] TypeScript: zero erros
- [x] `npm run build` — compilação limpa (verificar após mudanças)

---

## Próximas Páginas (por ordem de prioridade)
- [ ] **Fix org_id** — verificar demais páginas (Calendário, Relatório, Conhecimento, Memória)
- [ ] **Relatório** — dashboard com métricas dos dados mockados
- [ ] **Conhecimento** — biblioteca de documentos
- [ ] **Memória** — sistema de contexto da plataforma
- [ ] **Calendário semanal** — visualização adicional
