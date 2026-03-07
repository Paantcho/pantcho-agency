# WORKING.md — Tarefa Atual

Lido por TODOS os agentes ANTES de qualquer ação.
Atualizado DEPOIS de cada ação.

---

**Status:** Fase 1 — Fundação Multi-Tenant em andamento

## Projeto Atual
HUBIA — Implementação Fase 1 (PRD v4.0, seções 4–8)

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
- [x] Equipe page: `src/app/(dashboard)/config/equipe/page.tsx` (mock members, role badges)
- [x] Branding page: `src/app/(dashboard)/config/branding/page.tsx` (cor, logo, tipografia)
- [x] Provedores IA page: `src/app/(dashboard)/config/provedores/page.tsx` (cards dark, API keys mascaradas)

### Build
- [x] `npm run build` — compilação limpa, 10 rotas geradas

## Próximos Passos
- [ ] Testar `npm run dev` no browser (visual check)
- [ ] Conectar login ao Supabase Auth (setup Google OAuth no dashboard Supabase)
- [ ] Conectar Config/Equipe ao banco (server actions com Prisma)
- [ ] Conectar Config/Branding ao banco (CRUD OrganizationBranding)
- [ ] Conectar Config/Provedores ao banco (CRUD AiProvider, encrypt API keys)
- [ ] ThemeProvider dinâmico (aplicar cores do tenant)
- [ ] Seletor de organização na sidebar footer
- [ ] Creators list page (F1-E5)
- [ ] Dashboard com dados reais

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
