# WORKING.md — Tarefa Atual

Lido por TODOS os agentes ANTES de qualquer ação.
Atualizado DEPOIS de cada ação.

---

**Status:** Fase 1 em andamento — telas de Creators pixel-perfect aprovadas; próximo: Look library, Tom de voz, KPIs reais.

## Projeto Atual
HUBIA — Implementação Fase 1 (PRD v4.0, seções 4–8)

---

## Última sessão (WORKING atualizado ao fechar)

### 1. Resumo em uma frase
Revisão pixel-perfect completa das telas de Creators: cards da lista (fullbleed + parallax zoom + dados estruturados do banco), detalhe (tabs com ícones, hero card, KPIs, Aparência forense, Ambientes categorizados), botão X do modal corrigido, metadata estruturado no Creator, e regra suprema de fidelidade ao Figma criada em `.cursor/rules/`.

### 2. Arquivos criados ou modificados nesta sessão

| Arquivo | O que foi feito |
|--------|-----------------|
| `hubia-app/src/app/(dashboard)/creators/creators-list-client.tsx` | Cards fullbleed: foto ocupa 100% do card, gradiente overlay, nome Limão line-height 1.1, idade e cidade/estado em linhas separadas, tags de plataformas vindas do `metadata.platforms` do banco (não hardcoded). Grid `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` — mesmo tamanho dos cards da Look Library. Parallax zoom `scale-[1.12]`. |
| `hubia-app/src/app/(dashboard)/creators/actions.ts` | `CreatorRow` e `CreatorDetail` agora expõem `metadata` (city, state, age, birthdate, platforms). `getCreators` e `getCreatorById` retornam metadata estruturado. |
| `hubia-app/prisma/seed.ts` | Seed da Ninaah atualizado com `metadata: { city: "Pomerode", state: "SC", age: 22, birthdate: "16/05/2004", platforms: ["instagram", "privacy", "tiktok"] }`. |
| `hubia-app/src/app/(dashboard)/creators/[id]/creator-detail-client.tsx` | Tabs restauradas: fundo branco surface, ícones de volta (User, Palette, MapPin, Shirt, Mic), tab ativa pill Limão. Breadcrumb e botões com tipografia fiel ao Figma. |
| `hubia-app/src/app/(dashboard)/creators/[id]/tabs/creator-overview-tab.tsx` | Hero card ink-500: avatar 88px quadrado-arredondado, nome 28px Limão, bio branco opaco. 6 KPIs: label tiny cinza, valor 32px Limão. Marcadores com ícones e Veículo Fixo em cards brancos. |
| `hubia-app/src/app/(dashboard)/creators/[id]/tabs/creator-appearance-tab.tsx` | Banner forense rosa claro com borda. Tabelas 3 colunas (Elemento / Definição Fixa / Tolerância) com header cinza e rows separados. Checklist fundo verde, Blindagem fundo rosa — grid 2x2. |
| `hubia-app/src/app/(dashboard)/creators/[id]/tabs/creator-environments-tab.tsx` | Banner ink-500 com ícone casa. Cards brancos com tags coloridas: FIXOS (verde), FLEXÍVEIS (laranja), PROIBIDO (rosa). |
| `hubia-app/src/app/globals.css` | `.hubia-icon-button:hover` corrigido: era `--state-hover` (amarelo invisível no branco) → agora `rgba(62,63,64,0.85)` (cinza escuro visível). |
| `.cursor/rules/figma-fidelity-supreme.mdc` | Regra suprema criada: `alwaysApply: true`. Define checklist de 10 pontos para analisar referências visuais, proibição de invenção/suposição, checklist de entrega. |
| `memory/WORKING.md` | Este arquivo atualizado. |

### 3. O que está funcionando e aprovado

- Cards da lista: fullbleed, gradiente, parallax zoom, nome/idade/cidade/tags — dados reais do banco.
- Tabs do detalhe: fundo branco, ícones, pill ativa Limão.
- Hero card e KPIs: layout exato do Figma.
- Aparência: tabelas forenses, checklist verde, blindagem vermelha.
- Ambientes: banner escuro, cards brancos categorizados por FIXOS/FLEXÍVEIS/PROIBIDO.
- Botão X do modal: hover visível (cinza escuro), active (preto sólido).
- TypeScript: sem erros. Lints: zero.
- Regra suprema de fidelidade ao Figma ativa em `.cursor/rules/`.

### 4. O que está incompleto ou pendente

- **Look library tab:** visual não revisado ainda — ajustar conforme imagem 5 do Figma.
- **Tom de voz tab:** visual não revisado ainda.
- **KPIs do Overview:** valores hardcoded (39, 64%, 122, etc.) — em produção virão de queries reais.
- **Veículo Fixo:** placeholder de imagem — em produção usar Supabase Storage.
- **Natasha Freitas:** seed não tem metadata estruturado ainda (só a Ninaah foi atualizada).

### 5. Próxima ação exata (o que fazer primeiro na próxima sessão)

1. Revisar Look library tab conforme imagem 5 do Figma (node `8-2143`).
2. Revisar Tom de voz tab conforme imagem 6 do Figma (node `8-2544`).
3. Adicionar metadata estruturado para a Natasha Freitas via admin ou seed.
4. Conectar KPIs do Overview ao banco (contar looks, ambientes, pedidos reais).

### 6. Decisões técnicas importantes tomadas nesta sessão

- **Dados estruturados no creator:** cidade, estado, idade e plataformas ficam em `metadata` (campo JSON no modelo Creator) — não no `bio` texto livre.
- **Fidelidade por hex direto:** quando token Tailwind não cobre o valor exato, usar `style={{ color: "#..." }}` — fidelidade ao Figma tem prioridade.
- **Grid da lista = grid da Look Library:** `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`, aspectRatio `3/4`.
- **Botão X do modal:** fundo ink-500 (preto), hover cinza escuro `rgba(62,63,64,0.85)`, active preto sólido — nunca usar `--state-hover` (amarelo) em elementos escuros sobre fundo branco.

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
- [x] Sidebar: 12 itens, 3 seções
- [x] AppShell
- [x] Dashboard, auth layout

### Config Pages
- [x] Config/Equipe — banco (server actions, alterar role)
- [x] Config/Branding — banco (cor primária)
- [x] Config/Provedores — banco (CRUD, encrypt keys)

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

---

## Próximos Passos
- [ ] Revisar Look library tab (Figma node 8-2143)
- [ ] Revisar Tom de voz tab (Figma node 8-2544)
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
