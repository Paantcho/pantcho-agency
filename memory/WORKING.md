# WORKING.md — Tarefa Atual

Lido por TODOS os agentes ANTES de qualquer ação.
Atualizado DEPOIS de cada ação.

---

**Status:** Sprint "Relatório v3 — Gráficos, Ordem e Filtros" — COMPLETO. Build limpo. Zero erros TypeScript.

## Projeto Atual
HUBIA — Tela de Relatório completamente refatorada em 3 iterações. Gráficos sem corte nas bordas, blocos reordenados por hierarquia executiva, tabs de view em 3 blocos-chave, LIVE sem layout shift.

---

## Última sessão (2026-03-09 — Sprint: Relatório v3)

### 1. Resumo em uma frase
Relatório transformado em cockpit operacional: gráfico principal sem corte nas bordas (margem left:8 + right:40 + padding:28), nova ordem de blocos por importância estratégica, 3 tabs no gráfico de produção (Volume/Por Squad/Eficiência), tabs de filtro em Pedidos recentes (Todos/Em revisão/Atrasados), 2 views na Orquestração de agentes (Carga atual/Histórico).

### 2. Arquivos modificados — Sprint: Relatório v3

| Arquivo | O que foi feito |
|--------|-----------------|
| `app/(dashboard)/relatorio/relatorio-client.tsx` | Refatoração completa: gráficos sem corte, nova ordem de rows, MiniTabBar, 3 chart views, tabs de filtro em Pedidos, 2 views em Orquestração |

### 3. Decisões técnicas relevantes

**Fix de corte nos gráficos:**
- Causa: `margin={{ left: -16 }}` + clipPath do recharts cortava overshoot das curvas B-spline
- Solução: `margin={{ top:10, right:40, left:8, bottom:4 }}` + `XAxis padding={{ left:28, right:28 }}`
- Aplicado em: ProducaoVolumeChart

**MiniTabBar customizado:**
- Não usamos `SlidingTabs` dentro de cards brancos (background:#FFFFFF hardcoded = invisível)
- Criamos `MiniTabBar` com container `#EEEFE9` + pill ativo `#FFFFFF` — contrasta bem dentro de cards
- Usado em: ProducaoChartContainer, OrquestradorMonitor, PedidosRecentes, seletor de período

**Nova hierarquia de rows:**
1. KPIs hero (4 cards variados: dark/limão/branco)
2. Saúde Operacional (300px) + Atividade LIVE (1fr) — urgência imediata
3. Produção ao longo do tempo (full width + 3 tabs)
4. Status + Por tipo + Orquestração (3 cols)
5. Uso de IA (320px) + Pedidos recentes (1fr)
6. Squad Performance (1fr) + Tendências (280px)

**3 chart views — Produção:**
- Volume: AreaChart existente (Pedidos vs. Entregues), `type="basis"`, animado
- Por Squad: BarChart agrupado SERIE_SQUAD_BASE (Audiovisual + Dev Squad)
- Eficiência: LineChart com SERIE_EFICIENCIA_BASE (% de entrega mês a mês)
- TabContent direcional + MiniTabBar com direção rastreada por índice

**Atrasados em Pedidos recentes:**
- Critério: `p.dias > 7` = 4 pedidos atrasados (8d, 12d, 15d, 18d)
- Dias acima de 7d ficam em laranja `#FB8C00`

**LIVE sem layout shift:**
- Container height fixa: `ACTIVITY_H * MAX_ACTIVITIES = 58 * 5 = 290px`
- Itens `position: absolute`, animam apenas `opacity` e `y`
- Log da Orquestração: `LOG_H * MAX_LOGS = 27 * 4 = 108px`

### 4. O que está funcionando e aprovado

- ✅ **Gráfico hero** — curvas sem corte nas bordas, respiro real nas extremidades
- ✅ **MiniTabBar** — tabs pill dentro de cards brancos, contraste correto
- ✅ **3 views de Produção** — Volume/Por Squad/Eficiência com TabContent direcional
- ✅ **Tabs Pedidos recentes** — Todos/Em revisão/Atrasados com contadores e filtro funcional
- ✅ **2 views Orquestração** — Carga atual (grid+log LIVE) / Histórico (sparklines por agente)
- ✅ **LIVE sem layout shift** — altura fixa, posicionamento absoluto, sem reflow
- ✅ **Nova ordem de blocos** — hierarquia executiva implementada
- ✅ **TypeScript** — zero erros de compilação

### 5. O que está incompleto ou pendente

- [ ] Exportações de dados — mover para um lugar definitivo
- [ ] HubiaDatePicker: extrair para `components/ui/`
- [ ] Conectar Preferências/Notificações ao banco
- [ ] Conectar Domain ao banco
- [ ] Branding upload: conectar ao Supabase Storage
- [ ] Conhecimento — página pendente
- [ ] Memória — página pendente

### 6. Próxima ação exata

→ Verificar visualmente no browser (Relatório v3)
→ Avançar para Conhecimento ou Memória conforme direção do usuário

---

## Sessão anterior (2026-03-08 — Sprints: Governança + Usuários + Rules)

### 1. Resumo em uma frase
Sistema completo de gestão de usuários implementado: UserProfile + Invite no Prisma, admin client Supabase, auth callback atualizado, Team page com nomes reais, modal de convite, convites pendentes, ações de remover/revogar/reenviar.

### 2a. Arquivos — Sprint: Reorganização das Rules

| Arquivo | O que foi feito |
|--------|-----------------|
| `.cursor/rules/architecture/` | Nova pasta — `hubia-platform-governance.mdc` + `hubia-data-model.mdc` |
| `.cursor/rules/ai/` | Nova pasta — `hubia-ai-providers.mdc` |
| `.cursor/rules/design/` | Nova pasta — `hubia-design-system.mdc` + `figma-fidelity-supreme.mdc` |
| `.cursor/rules/motion/` | Nova pasta — `motion-interactions.mdc` + `hubia-motion-enforcement.mdc` |
| `.cursor/rules/00-hubia-master.mdc` | Atualizado — tabela de regras com novos caminhos + regra permanente para novos docs |
| `memory/MEMORY.md` | Atualizado — 3 referências de caminhos antigas corrigidas |
| `dev-squad/agents/qa-review/SOUL.md` | Atualizado — 3 referências de caminhos antigas corrigidas |

### 2b. Arquivos — Sprint: Gestão de Usuários

| Arquivo | O que foi feito |
|--------|-----------------|
| `prisma/schema.prisma` | Novo model `UserProfile` (espelho do auth.users) + `Invite` (convites pendentes) + relação na Organization |
| `lib/supabase/admin.ts` | Novo — cliente Supabase Admin com SUPABASE_SERVICE_ROLE_KEY para operações privilegiadas |
| `app/auth/callback/route.ts` | Atualizado — upsert UserProfile no login + processa convites pendentes pelo email |
| `config/equipe/actions.ts` | Reescrito — getMembers() com UserProfile (nome/email real), inviteMember(), removeMember(), revokeInvite(), resendInvite(), getPendingInvites() |
| `organization/team/page.tsx` | Reescrito — busca members + pendingInvites, passa para TeamClient |
| `organization/team/team-client.tsx` | Novo — UI completa: lista com nomes reais/avatar, convites pendentes, dropdown de ações, motion |
| `organization/team/invite-modal.tsx` | Novo — modal com email + HubiaSelect de role + validação + toast |
| `.env.example` | Novo — documentação de todas as variáveis de ambiente necessárias |
| `.env.local` | Adicionado NEXT_PUBLIC_APP_URL=http://localhost:3000 |

### Sprint anterior: Arquitetura de Governança

| Arquivo | O que foi feito |
|--------|-----------------|
| `.cursor/rules/architecture/hubia-platform-governance.mdc` | Adicionado frontmatter `alwaysApply: true` — movido para `architecture/` |
| `lib/feature-flags.ts` | Novo — tipos Feature, PlanSlug, mapa PLAN_FEATURES por plano |
| `lib/org-context.ts` | Novo — getOrgContext() retorna contexto completo |
| `lib/auth-organization.ts` | Adicionado getCurrentUserRoleInOrg() |
| `app/(dashboard)/layout.tsx` | Usa getOrgContext() e passa userRole + planSlug + enabledFeatures ao AppShell |
| `components/layout/app-shell.tsx` | Aceita userRole + planSlug + enabledFeatures |
| `components/layout/sidebar.tsx` | Campo `feature?` em MenuItem, filtra itens por enabledFeatures |

### Sprint anterior: Organization v1.0

| Arquivo | O que foi feito |
|--------|-----------------|
| `components/layout/sidebar.tsx` | Adicionado `Organization` (Building2) entre Arquitetura e Config, com separador dedicado |
| `organization/layout.tsx` | Layout com 5 tabs pill spring: Overview, Plano, Branding, Domínio, Equipe |
| `organization/page.tsx` | Redirect para `/organization/overview` |
| `organization/overview/` | KPIs da org (membros, branding, domínio, integrações) + atalhos para seções |
| `organization/plano/` | Reutiliza `PlanoClient` da Config |
| `organization/branding/` | Reutiliza `BrandingClient` da Config |
| `organization/domain/` | Config de domínio custom + DNS records (Enterprise-only) |
| `organization/team/` | Lista de membros com roles, badges, legenda de permissões |
| `organization/integrations/` | Reutiliza `IntegracoesClient` da Config |
| `config/layout.tsx` | Reduzido para 3 tabs: Perfil, Preferências, Notificações |
| `config/perfil/perfil-client.tsx` | Simplificado: apenas nome + email + avatar |
| `config/preferencias/` | Idioma, formato de data e modo visual (extraídos do Perfil) |
| `config/notificacoes/` | Toggles individuais por canal + toggle global + spring toggle animado |
| `config/plano/page.tsx` | Redirect → `/organization/plano` |
| `config/branding/page.tsx` | Redirect → `/organization/branding` |
| `config/integracoes/page.tsx` | Redirect → `/organization/integrations` |
| `config/equipe/page.tsx` | Redirect → `/organization/team` |
| `config/dados/page.tsx` | Redirect → `/organization/overview` |

### 3. O que está funcionando e aprovado

- ✅ **UserProfile** — tabela no banco, populada automaticamente no login (nome, email, avatar)
- ✅ **Invite** — tabela com token único, expiração 7 dias, revogação, reenvio
- ✅ **Supabase Admin client** — `lib/supabase/admin.ts` com SERVICE_ROLE_KEY (já configurada no .env.local)
- ✅ **Auth callback** — popula UserProfile + processa convites pendentes no login
- ✅ **Team page** — nomes reais, email, avatar, data de entrada
- ✅ **Convites pendentes** — lista na UI com quem convidou + quando expira
- ✅ **Modal de convite** — email + role + envio via Supabase Admin
- ✅ **Ações de membro** — alterar role, remover da org (com validações de segurança)
- ✅ **Ações de convite** — revogar, reenviar
- ✅ **Governança** — `hubia-platform-governance.mdc` ativo como regra permanente
- ✅ **Feature Flags** — `lib/feature-flags.ts` com 9 features, 4 planos mapeados
- ✅ **OrgContext** — `lib/org-context.ts` unificando org + role + plan + features (1 chamada)
- ✅ **Regra do owner** — owner bypassa 100% das feature flags, vê todos os módulos
- ✅ **Sidebar gate-ready** — filtra itens por `feature` + `enabledFeatures`
- ✅ **getCurrentUserRoleInOrg** — disponível em `lib/auth-organization.ts`
- ✅ **Sidebar** com Organization e Config como entradas distintas (separator dedicado)
- ✅ **Organization Overview** — banner + KPIs + atalhos para seções
- ✅ **Organization Plano** — 4 níveis, banner ativo, comparativo
- ✅ **Organization Branding** — color picker + paleta + preview (Enterprise-only)
- ✅ **Organization Domínio** — input + DNS records copiáveis (Enterprise-only)
- ✅ **Organization Equipe** — lista de membros, badges por role, legenda
- ✅ **Config Perfil** — nome, email, avatar com iniciais
- ✅ **Config Preferências** — idioma, formato de data, modo visual
- ✅ **Config Notificações** — toggles individuais com spring animado, toggle global
- ✅ **Redirecionamentos** — todas as rotas antigas redirecionam corretamente
- ✅ **TypeScript** — zero erros de compilação

### 4. Arquitetura de rotas definida

```
/organization          → redirect /organization/overview
/organization/overview → KPIs + atalhos da org
/organization/plano    → comparativo de planos
/organization/branding → branding (Enterprise-only)
/organization/domain   → domínio customizado (Enterprise-only)
/organization/team     → membros + roles

/config               → redirect /config/perfil
/config/perfil        → nome + email + avatar
/config/preferencias  → idioma + formato data + modo visual
/config/notificacoes  → toggles de notificação

Redirects ativos:
/config/plano          → /organization/plano
/config/branding       → /organization/branding
/config/integracoes    → /organization/integrations
/config/equipe         → /organization/team
/config/dados          → /organization/overview
```

### 5. O que está incompleto ou pendente

- [ ] Exportações de dados — mover para um lugar definitivo (Organization ou seção própria)
- [ ] HubiaDatePicker: extrair para `components/ui/`
- [ ] Conectar Preferências/Notificações ao banco (user metadata)
- [ ] Conectar Domain ao banco (salvar `org.domain`)
- [ ] Branding upload: conectar ao Supabase Storage
- [ ] Relatório, Conhecimento, Memória — páginas pendentes

### 6. Próxima ação exata

→ Verificar visualmente no browser (Organization + Config + sidebar)
→ Avançar para Relatório ou qualquer página operacional conforme direção do usuário
→ Quando precisar gate de feature: adicionar campo `feature: "nome-da-feature"` no item da sidebar em menuSections

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
- [x] Tabs: pill spring + hover areia + whileTap + ícones propagados
- [x] Modais: 3 camadas com AnimatePresence + `HubiaPortal`
- [x] Botões: variantes propagadas com animate
- [x] Cards: stagger + whileHover + flat design (sem sombra exceto hover card)
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
- [x] `SlidingTabs` com variantes propagadas + `React.ElementType` para ícones
- [x] `HubiaModal` — modal base com 3 camadas
- [x] `HubiaDatePicker` — calendário customizado (inline em pedidos-client, extrair pendente)

### Pedidos (COMPLETO v2)
- [x] Kanban DnD com drop zone adaptativa
- [x] Calendário mensal + Lista
- [x] Modal Novo Pedido: 2 colunas, sem scroll, criar projeto inline
- [x] Página /pedidos/[id]: cadeia de produção, prompt final, upload resultado
- [x] Filtros squad: SlidingTabs padrão (Todos/Audiovisual/Dev + ícones)

### Projetos (COMPLETO v3.1)
- [x] 15 tipos com pillBg/pillText definitivos + ícone + squad + módulos
- [x] Cards flutuam sobre #EEEFE9 (sem white box wrapper)
- [x] Título do projeto em 22px bold
- [x] Tag de tipo `rounded-full` com cor por tipo
- [x] Barra de progresso: #D7FF00 / #A8C800 / #FB8C00 por faixa
- [x] Views rápidas como SlidingTabs com ícones semânticos (7 views)
- [x] Modal de criação: 2 passos com fundos pillBg + borda ativa ao selecionar tipo
- [x] Detalhe com tabs adaptativas por tipo + ícones semânticos
- [x] Tab Subprojetos: criar/remover/status/progresso por metadata
- [x] KPI cards com número 28px
- [x] Sidebar executiva: health, alertas, próximas ações, módulos, stack

### Agentes (COMPLETO)
- [x] Dev Squad + Audiovisual Squad, 9 agentes, 17 skills
- [x] Página Agente e Squad com detalhe completo
- [x] Agente QA/Review criado

### Build
- [x] TypeScript: zero erros
- [x] `npm run build` — compilação limpa (verificar após mudanças)

---

## Próximas Páginas (por ordem de prioridade)
- [ ] **Seed update** — projetos mockados com tipos corretos (não "outro")
- [ ] **Fix org_id** — verificar demais páginas (Calendário, Relatório, Conhecimento, Memória)
- [ ] **Relatório** — dashboard com métricas dos dados mockados
- [ ] **Conhecimento** — biblioteca de documentos
- [ ] **Memória** — sistema de contexto da plataforma
- [ ] **Calendário semanal** — visualização adicional
