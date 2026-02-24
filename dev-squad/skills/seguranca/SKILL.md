---
name: seguranca
description: Use quando implementar autenticação, autorização, validação de dados, ou quando qa-review identificar vulnerabilidades.
---

# Segurança

## Missão
Proteger dados, usuários e sistema. OWASP Top 10 como base.

## Regras Invioláveis
- Prisma ORM (previne SQL injection) — nunca SQL puro
- Validar todo input com Zod
- Supabase Auth como padrão
- JWT com expiração curta
- Refresh tokens em httpOnly cookies — NUNCA localStorage
- Row Level Security (RLS) no Supabase
- HTTPS obrigatório
- .env.local para secrets (SEMPRE no .gitignore)
- Nunca logar dados sensíveis

## Headers de Segurança (next.config.ts)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

## Checklist
- [ ] Inputs validados server-side (Zod)
- [ ] Autenticação implementada
- [ ] Endpoints protegidos
- [ ] .env.local no .gitignore
- [ ] Sem secrets hardcodados
- [ ] Headers configurados
- [ ] Rate limiting onde necessário
