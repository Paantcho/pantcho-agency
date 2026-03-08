# WORKING.md — Tarefa Atual

Lido por TODOS os agentes ANTES de qualquer ação.
Atualizado DEPOIS de cada ação.

---

**Status:** Fase 1 em andamento — animações de sistema implementadas (sidebar pill, transição de página, tabs deslizantes, tab-content direcional); próximo: metadata Natasha, KPIs reais, Pedidos/Projetos.

## Projeto Atual
HUBIA — Implementação Fase 1 (PRD v4.0, seções 4–8)

---

## Última sessão (WORKING atualizado ao fechar)

### 1. Resumo em uma frase
Implementação completa do sistema de animações e motion da plataforma: sidebar pill deslizante, transição de página Shared Axis vertical, tabs com pill deslizante horizontal, animação direcional de conteúdo de tabs (Shared Axis horizontal), animações de ícone da sidebar via CSS keyframes, hover states dos itens de menu; pixel-perfect revisado nas tabs Look Library e Tom de Voz.

### 2. Arquivos criados ou modificados nesta sessão

| Arquivo | O que foi feito |
|--------|-----------------|
| `.cursor/rules/motion-interactions.mdc` | Regra permanente de motion criada/expandida: Framer Motion obrigatório para React, sidebar pill, tabs pill, transições de página, cards stagger, accordions, modais 3 camadas, toasts, animações de ícone por item, proibições adicionais de motion. |
| `hubia-app/src/app/globals.css` | Adicionados 12 `@keyframes` para animações de ícone da sidebar (icon-pulse, icon-bounce-y, icon-wiggle, icon-spark, icon-flip, icon-nod, icon-spin-slow, icon-grow, icon-nudge, icon-pulse-double, icon-rotate-sm, icon-spin-partial). Background `html, body { background: #EEEFE9 }`. Classes `.sidebar-item` e `.sidebar-item-icon` para hover states. Classe `.hubia-main-transition` removida. |
| `hubia-app/src/components/layout/sidebar.tsx` | Pill deslizante: `<div>` absoluta com `top: pillTop, height: pillHeight` + `transition: top 300ms cubic-bezier(0.2,0,0.0,1)`. Refs por item via `useRef`. Ícones trocados para os corretos (`CalendarDays`, `FolderOpen`, `BarChart2`). `iconClass` por item. Hover state: texto #A9AAA5 → #0E0F10 em 150ms. `AnimatedLink` com `data-active`. |
| `hubia-app/src/components/ui/animated-link.tsx` | Refatorado com `React.forwardRef` para expor o `<a>` DOM — necessário para cálculo de `offsetTop`/`offsetHeight` dos refs da sidebar. |
| `hubia-app/src/components/layout/app-shell.tsx` | Transição de página Shared Axis vertical via Framer Motion `AnimatePresence mode="wait"` com `key={pathname}`. `PageTransition` component com `motion.div`: entrada `opacity 0→1, y 12→0` em 280ms, saída `opacity 1→0, y 0→-8` em 200ms. `background: #EEEFE9` e `isolation: isolate` no wrapper para evitar ghosting. `willChange: "transform, opacity"`. |
| `hubia-app/src/components/ui/sliding-tabs.tsx` | **NOVO.** Tabs horizontais com pill deslizante. `containerRef` + `btnRefs` + `useEffect` calcula `pillLeft` e `pillWidth` via `getBoundingClientRect`. Pill: `background: #D7FF00`, `border-radius: 14px`, transição `left/width 300ms cubic-bezier(0.2,0,0.0,1)`. Container: `background: #FFFFFF`, `border-radius: 20px`. Texto inativo: `#A9AAA5`, ativo: `#0E0F10`. |
| `hubia-app/src/components/ui/tab-content.tsx` | **NOVO.** Wrapper de conteúdo de tab com animação direcional Shared Axis horizontal. `AnimatePresence mode="wait"` + `motion.div` com `custom={direction}`. Entrada: `x: dir*24, opacity 0 → 0, 0` em 220ms ease-dec. Saída: `x: dir*-16, opacity → 0` em 160ms ease-acc. |
| `hubia-app/src/app/(dashboard)/config/layout.tsx` | Tabs de config (Equipe/Branding/Provedores) refatoradas para `SlidingTabs` + `TabContent` direcional. Pill #EEEFE9 com bg branco. |
| `hubia-app/src/app/(dashboard)/creators/[id]/tabs/creator-looks-tab.tsx` | Revisão pixel-perfect: filtros brancos com borda cinza (`bg: #FFFFFF, border: #D9D9D4`), ativo Limão. Cards `aspectRatio: 3/4`, `borderRadius: 16px`. Animação estrela no hover. |
| `hubia-app/src/app/(dashboard)/creators/[id]/tabs/creator-voice-tab.tsx` | Revisão pixel-perfect: "Tom Geral" full-width; grid de 3 colunas para Instagram/Privacy/Tiktok; grid 3 colunas para Vocabulário/Emojis/Legendas. |
| `memory/WORKING.md` | Este arquivo atualizado. |

### 3. O que está funcionando e aprovado

- Sidebar pill desliza suavemente entre itens (CSS transition `cubic-bezier(0.2,0,0.0,1)`).
- Ícones da sidebar animam no hover (wiggle, spark, pulse, bounce, etc.) via CSS keyframes.
- Hover state de itens inativos: texto escurece, sem fundo extra.
- Transição de página: conteúdo sobe/desce com fade — sidebar NÃO pisca.
- Tabs das páginas de detalhe e config: pill desliza horizontalmente.
- Conteúdo de tab anima diagonalmente (direcional) ao trocar aba.
- `AnimatedLink` com `forwardRef` — refs funcionam para cálculo de posição.
- Look Library e Tom de Voz: pixel-perfect corrigidos.

### 4. O que está incompleto ou pendente

- **Pill das tabs:** ainda usa CSS transition (não spring) — o ajuste de spring foi solicitado mas revertido a pedido do usuário.
- **Pill da sidebar:** idem, CSS transition — spring não aplicado.
- **KPIs do Overview:** valores hardcoded.
- **Veículo Fixo:** placeholder de imagem.
- **Natasha Freitas:** seed sem metadata estruturado.

### 5. Próxima ação exata

1. Confirmar com o usuário se quer spring na pill (sidebar + tabs) ou manter CSS.
2. Adicionar metadata estruturado para a Natasha Freitas.
3. Conectar KPIs do Overview ao banco.
4. Demais páginas: Pedidos, Projetos.

### 6. Decisões técnicas importantes tomadas nesta sessão

- **Framer Motion para transições de página:** `AnimatePresence mode="wait"` só no conteúdo principal — sidebar fica fora.
- **Ghosting prevenido:** `background: #EEEFE9` + `isolation: isolate` no `motion.div` de transição de página.
- **Sliding pill com refs DOM:** `useRef` + `offsetTop/offsetHeight` para sidebar, `getBoundingClientRect` para tabs (necessário pois tabs ficam em container relativo).
- **`forwardRef` no AnimatedLink:** expõe o `<a>` DOM para o array de refs da sidebar.
- **Tab content direcional:** comparar índice da tab clicada vs. anterior para calcular `direction` (+1 ou -1).
- **Spring revertido a pedido do usuário:** spring era mais fluido mas causou problema visual. Mantido CSS transition por ora.

---

## Histórico de entregas

### Schema & Config
- [x] Schema Prisma: 19 models validado
- [x] Config Prisma 7: `prisma.config.ts` com dotenv + DIRECT_URL
- [x] Prisma client singleton com `@prisma/adapter-pg`

### Database
- [x] `prisma db push` — 19 tabelas criadas no Supabase
- [x] `prisma generate` — client gerado
- [x] Seed: 1 org, 4 planos, 1 branding, 4 feature flags, Creator Ninaah com metadata

### Auth & Middleware
- [x] Supabase client browser + server
- [x] Middleware Next.js: refresh + proteção de rotas
- [x] Auth callback route
- [x] Login: email+senha, magic link, Google OAuth

### RLS
- [x] `rls-policies.sql` pronto e executado

### Design System
- [x] `globals.css` com tokens Hubia completos
- [x] Tailwind 4 `@theme inline` com paleta completa
- [x] Urbanist via `next/font/google`
- [x] `.hubia-icon-button` hover/active corrigidos

### Layout Shell
- [x] Sidebar: 12 itens, 3 seções, pill deslizante, ícones animados, hover states
- [x] AppShell com transição de página Shared Axis vertical
- [x] Dashboard, auth layout

### Config Pages
- [x] Config/Equipe — banco (server actions, alterar role)
- [x] Config/Branding — banco (cor primária)
- [x] Config/Provedores — banco (CRUD, encrypt keys)
- [x] Config tabs: SlidingTabs + TabContent direcional

### Motion System
- [x] `motion-interactions.mdc` — regra permanente completa
- [x] Sidebar pill deslizante (CSS ease-emp)
- [x] Transição de página Shared Axis vertical (Framer Motion)
- [x] `SlidingTabs` — componente reutilizável para tabs com pill
- [x] `TabContent` — componente reutilizável para conteúdo direcional
- [x] Animações de ícone CSS keyframes (12 keyframes)
- [x] Hover state dos itens do menu

### Build
- [x] `npm run build` — compilação limpa

### Fase 1 entregues
- [x] Tag `hubia-app/v0.1.0` + push main
- [x] ThemeProvider dinâmico (cores do tenant)
- [x] Seletor de organização na sidebar
- [x] Creators list — banco + cards pixel-perfect
- [x] Dashboard com dados reais (KPIs, atividade)
- [x] HubiaModal: portal + overlay fullscreen blur + botão X
- [x] Creators: lista, visão geral, aparência, ambientes — pixel-perfect ao Figma
- [x] `metadata` estruturado no Creator (city, state, age, platforms)
- [x] Regra suprema de fidelidade ao Figma (`.cursor/rules/figma-fidelity-supreme.mdc`)
- [x] Sistema de animações completo (sidebar, página, tabs)

---

## Próximos Passos
- [ ] Decidir: spring ou CSS transition na pill (sidebar + tabs)
- [ ] Revisar Creator detail tabs (Figma nodes 8:2143, 8:2544) — Look Library, Tom de voz
- [ ] Adicionar metadata da Natasha Freitas
- [ ] Conectar KPIs do Overview ao banco
- [ ] Upload de logo/favicon (Supabase Storage)
- [ ] Demais páginas: Pedidos, Projetos — rotas, ações, Figma, marcar pontos de API/agentes

---

## Decisões Técnicas Acumuladas
- Prisma 7: `prisma.config.ts`, `@prisma/adapter-pg`, `db push` (sem migrate dev)
- UUIDs via `gen_random_uuid()` do PostgreSQL
- snake_case nas tabelas (`@@map`), camelCase no Prisma
- Seed via `npx tsx prisma/seed.ts` (DIRECT_URL porta 5432)
- Middleware: allowlist de rotas públicas (inversão da proteção)
- Cards fullbleed: `position: absolute; inset: 0` + `overflow-hidden` no container
- Dados do creator: `metadata` JSON para campos estruturados (city, state, age, platforms)
- Fidelidade ao Figma: hex direto > tokens Tailwind quando necessário
- Botão X modal: hover `rgba(62,63,64,0.85)` — nunca `--state-hover` em contexto escuro/branco
- Sidebar pill: UMA `<div>` absoluta move via `top + height`, CSS transition ease-emp
- Transição de página: `AnimatePresence mode="wait"` só no conteúdo — sidebar fora do wrapper
- Ghosting prevenido: `background: #EEEFE9` + `isolation: isolate` no `motion.div`
- `AnimatedLink` com `forwardRef` — expõe DOM para cálculo de refs
- Tabs com pill: `SlidingTabs` (reutilizável), posição via `getBoundingClientRect`
- Tab content direcional: `TabContent` com `direction` (+1/-1) e Shared Axis horizontal
