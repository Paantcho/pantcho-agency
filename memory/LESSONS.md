# LESSONS.md — Lições Aprendidas

Atualizado após QUALQUER correção do usuário.
Lido no início de sessões relevantes.

---

## Como Usar
Quando o usuário corrigir algo:
1. Identificar o padrão do erro
2. Escrever uma regra que previne a repetição
3. Adicionar aqui com data

---

## Lições

### Prisma 7 — Mudanças Críticas (2026-03-07)
1. **URL fora do schema:** `datasource` no `schema.prisma` não aceita mais `url`/`directUrl`. Usar `prisma.config.ts` com `datasource: { url }`.
2. **Engine client-side:** `PrismaClient()` sem argumentos falha. Requer `adapter` (ex: `@prisma/adapter-pg`) ou `accelerateUrl`.
3. **Config path:** Prisma não auto-detecta `prisma.config.ts` dentro de `prisma/`. Passar `--config prisma/prisma.config.ts` nos comandos CLI.
4. **`.env.local` não é lido:** Prisma lê `.env` por padrão. Usar `dotenv.config()` explícito no `prisma.config.ts` apontando para `.env.local`.
5. **Shadow database:** `migrate dev` precisa de shadow DB. Supabase hosted não permite. Usar `db push` em vez de `migrate dev`.
6. **Seed com adapter:** O seed precisa do mesmo adapter-pg pattern. Usar `DIRECT_URL` (porta 5432) para operações DDL e seed.
