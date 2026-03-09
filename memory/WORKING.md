# WORKING.md — Tarefa Atual

Lido por TODOS os agentes ANTES de qualquer ação.
Atualizado DEPOIS de cada ação.

---

**Status:** Sprint "Projetos v3 — UI/UX + Pills de Tipo + Subprojetos" — COMPLETO. Build limpo. Zero erros TypeScript.

## Projeto Atual
HUBIA — Feature Projetos refinada com sistema de cores definitivo por tipo (pills `rounded-full`), remoção do white box wrapper na listagem, redesign dos cards (título maior, tag proeminente, barra paleta correta), subprojetos via metadata, tabs com ícones em toda a página de detalhe, e padronização do `SlidingTabs` em Pedidos e Projetos.

---

## Última sessão (2026-03-08 — Sprint Projetos v3.1 — UI/UX)

### 1. Resumo em uma frase
Projetos agora tem cards flutuando sobre o fundo base (sem white box), pills de tipo arredondadas com cores definitivas da paleta Hubia, título do projeto em 22px bold, barra de progresso com limão/verde/laranja, subprojetos por metadata, tabs com ícones, e filtros Pedidos + Projetos padronizados com SlidingTabs.

### 2. Arquivos modificados (sprint v3.1)

| Arquivo | O que foi feito |
|--------|-----------------|
| `src/app/(dashboard)/projetos/projetos-client.tsx` | Remoção do white box wrapper; cards redesenhados (22px título, pill rounded-full, barra cor paleta); sistema de cores `pillBg`/`pillText` por tipo; modal com fundo por tipo; views rápidas com SlidingTabs + ícones. |
| `src/app/(dashboard)/projetos/[id]/projeto-detail-client.tsx` | `pillBg`/`pillText` em todo TIPO_CONFIG; tag de tipo como `rounded-full` no header e sidebar; tabs com ícones semânticos (LayoutGrid, AlignLeft, Boxes, ListChecks, etc.); tab Subprojetos nova; KPIs em 28px. |
| `src/app/(dashboard)/pedidos/pedidos-client.tsx` | Filtros de squad substituídos por SlidingTabs padrão (Todos/Audiovisual/Dev) com ícones. |
| `src/components/ui/sliding-tabs.tsx` | Tipo `icon` alterado de `LucideIcon` para `React.ElementType` — aceita qualquer ícone. |
| `memory/WORKING.md` | Este arquivo. |
| `memory/MEMORY.md` | Atualizado com regras de pills, padrão de cards Projetos, subprojetos. |

### 3. O que está funcionando e aprovado

- ✅ **White box removida da listagem de Projetos** — cards flutuam sobre `#EEEFE9` diretamente
- ✅ **Tag de tipo pill `rounded-full`** com cor definitiva por tipo (15 tipos com cores únicas da paleta Hubia)
- ✅ **Título do projeto em 22px bold** — hierarquia visual forte nos cards
- ✅ **Barra de progresso com paleta correta:** `#D7FF00` (≥75%), `#A8C800` (40-74%), `#FB8C00` (<40%)
- ✅ **Subprojetos:** tab "Subprojetos" na página interna, criação/remoção/status/progresso por metadata
- ✅ **Tabs internas com ícones semânticos** (Visão Geral=LayoutGrid, Contexto=AlignLeft, Módulos=Boxes, etc.)
- ✅ **KPI cards com número 28px** — leitura imediata
- ✅ **Pedidos filtros** padronizados com SlidingTabs (Todos=Layers, Audiovisual=Palette, Dev=Code2)
- ✅ **SlidingTabs** atualizado para aceitar `React.ElementType` em vez de `LucideIcon`
- ✅ **Modal de criação** de projeto com fundos `pillBg` por tipo e bordas no selecionado

### 4. Nota importante — Modal de criação e tipos
O modal de criação de projeto mostra os tipos com as cores corretas (`pillBg` + ícone + label).
Porém, como os projetos no banco foram criados com `tipo = "outro"` (antes do sistema de tipos estar completamente definido), os cards exibem "Outro" com cor neutra.
**Para ver as pills coloridas:** criar novos projetos via o modal já atualizado. Os projetos mockados existentes precisam ter o tipo atualizado no banco via seed ou edição.
O sistema de tipos está correto e definitivo — é questão de dados, não de código.

### 5. O que está incompleto ou pendente

- [ ] Atualizar seed para criar projetos com tipos corretos (não "outro") e ver pills coloridas
- [ ] HubiaDatePicker: extrair de `pedidos-client.tsx` para `components/ui/hubia-date-picker.tsx`
- [ ] Aplicar layout padrão (título + tab-navbar) nas demais páginas que ainda usam padrão antigo
- [ ] Calendário: visualização semanal além da mensal
- [ ] Relatório — dashboard de métricas
- [ ] Conhecimento — biblioteca de documentos
- [ ] Memória — sistema de contexto de plataforma
- [ ] Verificar e corrigir bug de org_id nas demais páginas (Conhecimento, Memória, Relatório, Calendário)

### 6. Próxima ação exata

→ Atualizar seed com tipos corretos nos projetos mockados (para ver as pills coloridas funcionando)
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
