# WORKING.md — Tarefa Atual

Lido por TODOS os agentes ANTES de qualquer ação.
Atualizado DEPOIS de cada ação.

---

**Status:** Fase 1 — Fundação Multi-Tenant; última sessão: padronização de modais e cards Creators.

## Projeto Atual
HUBIA — Implementação Fase 1 (PRD v4.0, seções 4–8)

---

## Última sessão (WORKING atualizado ao fechar)

### 1. Resumo em uma frase
Padronização **global** de modais (overlay full-screen com blur + botão X) e correção dos cards de Creators com imagem placeholder quando não há avatar.

### 2. Arquivos criados ou modificados nesta sessão

| Arquivo | O que foi feito |
|--------|------------------|
| `hubia-app/src/components/ui/hubia-modal.tsx` | Modal passou a usar **portal** (`createPortal` em `document.body`) para overlay cobrir tela inteira (incluindo sidebar); adicionado **botão X** no canto superior direito (círculo escuro, ícone X); nova prop opcional `showCloseButton` (default `true`). |
| `hubia-app/src/app/globals.css` | Classe `.hubia-modal-overlay`: `z-index` alterado de `50` para `9999` para o modal ficar sempre acima de todo o layout. |
| `hubia-app/src/app/(dashboard)/creators/creators-list-client.tsx` | Definida constante `PLACEHOLDER_AVATAR` (URL Unsplash); quando o creator não tem `avatarUrl`, o card usa essa imagem de exemplo em vez de só iniciais, para visualização real do layout (foto, hover, tags). |
| `memory/MEMORY.md` | Nova seção **"Modal — Padrão da plataforma inteira (Hubia)"**: regra global (overlay full-screen + blur, sempre usar `HubiaModal`, X para fechar, ações no rodapé; proibido modal parcial ou alert/confirm). |

### 3. O que está funcionando e aprovado

- **Modal global:** Todos os fluxos que usam `HubiaModal` (Nova creator, Editar/Adicionar ambiente, Looks, Tom de voz, confirmação de exclusão) passam a ter overlay full-screen com blur e botão X, renderizado em portal no `body`.
- **Cards Creators:** Exibem sempre uma imagem (avatar do creator ou placeholder), com tag Ativa/Inativa, hover na foto e tags no rodapé.
- **Regra em MEMORY:** Padrão de modal documentado para toda a plataforma e para futuros agentes.

### 4. O que está incompleto ou com problema

- **Validação visual:** Ainda não foi confirmado no browser se o blur cobre 100% da tela (incluindo sidebar) em todos os modais; recomendado um check rápido na próxima sessão.
- **Placeholder:** A imagem de exemplo é URL externa (Unsplash); se houver política de imagens ou bloqueio, pode ser trocada por asset em `hubia-app/public/`.

### 5. Próxima ação exata (o que fazer primeiro na próxima sessão)

1. Abrir o app em `localhost` (ex.: `/creators`), abrir um modal (ex.: "Nova creator" ou "Editar ambiente") e **confirmar** que o fundo fica blur em **toda** a tela (incluindo a sidebar).
2. Se estiver ok, seguir com o próximo item do plano (Creators ou o que estiver em "Próximos Passos" abaixo); se o blur não cobrir a sidebar, ajustar overlay/portal no `HubiaModal` ou no CSS.

### 6. Decisões técnicas importantes tomadas hoje

- **Modal:** Renderizar em **portal** (`createPortal(..., document.body)`) para que o overlay seja filho direto do `body` e o `position: fixed; inset: 0` cubra a viewport inteira, independente do layout (sidebar, etc.).
- **z-index 9999** no overlay para garantir que o modal fique acima de qualquer elemento do shell (sidebar, header, etc.).
- **Um único componente de modal:** `HubiaModal` é o padrão da plataforma; qualquer tela de criar/editar/ver deve usá-lo (não criar modais ad hoc).
- **Cards sem avatar:** Usar URL de placeholder em vez de só iniciais, para o layout ser validável visualmente com “imagem real”.

## O que foi feito

### Schema & Config
- [x] Schema Prisma: `hubia-app/prisma/schema.prisma` (19 models, validado)
- [x] Config Prisma 7: `hubia-app/prisma/prisma.config.ts` (dotenv + DIRECT_URL)
- [x] Prisma client singleton: `hubia-app/src/lib/prisma.ts` (adapter-pg)

### Database
- [x] `prisma db push` — todas as 19 tabelas criadas no Supabase
- [x] `prisma generate` — client gerado
- [x] Seed executado: 1 org (Pantcho Agency), 4 planos, 1 branding, 4 feature flags

### Auth & Middleware
- [x] Supabase client (browser): `hubia-app/src/lib/supabase/client.ts`
- [x] Supabase client (server): `hubia-app/src/lib/supabase/server.ts`
- [x] Middleware Next.js: `hubia-app/src/middleware.ts` (refresh + proteção de rotas)
- [x] Auth callback route: `hubia-app/src/app/auth/callback/route.ts`
- [x] Login page funcional: email+senha, magic link, Google OAuth

### RLS
- [x] SQL pronto e executado: `hubia-app/prisma/rls-policies.sql`

### Design System
- [x] `globals.css` com tokens Hubia (cores, radii, tipografia)
- [x] Tailwind 4 @theme inline com paleta completa
- [x] Layout root com Urbanist (next/font/google)
- [x] Font fix: removido @import url() duplicado, --font-sans usa var(--font-urbanist)

### Layout Shell
- [x] Sidebar: `hubia-app/src/components/layout/sidebar.tsx` (12 items, 3 seções)
- [x] AppShell: `hubia-app/src/components/layout/app-shell.tsx`
- [x] Route groups: (dashboard) e (auth)
- [x] Dashboard placeholder: `hubia-app/src/app/(dashboard)/page.tsx`
- [x] Auth layout: `hubia-app/src/app/(auth)/layout.tsx` (centered, bg-ink-500)

### Config Pages (F1-E2, E3, E4)
- [x] Config layout com tabs: `src/app/(dashboard)/config/layout.tsx`
- [x] Config redirect: `src/app/(dashboard)/config/page.tsx` → /config/equipe
- [x] Equipe page: conectada ao banco (server actions, listagem/edição de role, auto-join no callback e no layout)
- [x] Branding page: CRUD OrganizationBranding (cor primária salva; logo/favicon placeholder)
- [x] Provedores IA page: CRUD AiProvider com API keys criptografadas (`hubia-app/src/lib/encrypt.ts`, ENCRYPTION_KEY em .env.local)

### Build
- [x] `npm run build` — compilação limpa, 21 rotas geradas

### Fase 1 — Entregues (Plano “Próximos passos”)
- [x] Push main + tag `hubia-app/v0.1.0`
- [x] Doc Auth: README hubia-app (Google OAuth no Supabase)
- [x] Config/Equipe → banco (server actions + Prisma, alterar role)
- [x] Config/Branding → banco (salvar cor primária)
- [x] Config/Provedores → banco (CRUD, encrypt keys)
- [x] ThemeProvider dinâmico (cores do tenant no layout dashboard)
- [x] Seletor de organização na sidebar (cookie `hubia_current_organization_id`, multi-org)
- [x] Creators list page (F1-E5): listagem do banco + placeholders `/creators/novo` e `/creators/[id]`
- [x] Dashboard com dados reais (KPIs, Em andamento, Atividade recente, Pedidos prioritários via `dashboard-data.ts`)

## Próximos Passos
- [ ] Testar `npm run dev` no browser (visual check completo)
- [ ] Configurar Google OAuth no dashboard Supabase (se ainda não feito)
- [ ] Definir `ENCRYPTION_KEY` em `.env.local` para Config → Provedores de IA
- [ ] **Creators:** Formulário “Novo creator” (`/creators/novo`) e detalhe (`/creators/[id]`) — ver `directives/hubia-plano-creators-proximas-paginas.md`. Figma = referência. Marcar API/agentes; se faltar agente, criar e registrar em MEMORY (autoalimentado).
- [ ] Upload de logo/favicon em Config/Branding (Supabase Storage)
- [ ] Demais páginas (Pedidos, Projetos): mesmo plano — rotas/ações, Figma, marcar API/agentes

## Decisões Tomadas
- Prisma 7: `prisma.config.ts` com `datasource.url` (não usa mais URL no schema)
- Prisma 7: PrismaClient precisa de `@prisma/adapter-pg` (engine client-side)
- Prisma 7: `migrate dev` requer shadow DB (Supabase não permite) — usar `db push`
- Prisma 7: config não auto-detecta no subdir — usar `--config prisma/prisma.config.ts`
- UUIDs via `gen_random_uuid()` do PostgreSQL
- Nomes de tabelas snake_case (`@@map`), campos camelCase no Prisma
- Seed usa DIRECT_URL (porta 5432, sem pooler) para evitar problemas de conexão
- Middleware: proteção invertida (public routes allowlist em vez de protected routes)
- Login: email+senha, magic link e Google OAuth via Supabase Auth
