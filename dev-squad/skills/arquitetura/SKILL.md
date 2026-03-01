---
name: arquitetura
description: Use no início de projeto novo ou quando precisar planejar estrutura, schema, rotas de API, ou decisão de stack.
---

# Arquitetura de Software

## Missão
Planejar antes de construir. Definir estrutura, tecnologias, schema, rotas e riscos ANTES de qualquer linha de código.

## Protocolo

1. **Entender o Escopo** — o que é, quem usa, auth?, banco?, integrações?, plataforma?
2. **Definir Stack** — padrão: Next.js 15, TypeScript, Tailwind, Shadcn, Supabase, Prisma, Vercel
3. **Estrutura de Pastas** — seguir padrão do SOUL.md do Desenvolvimento
4. **Schema do Banco** — tabelas, relações, índices, RLS
5. **Rotas e API** — endpoints, métodos, auth, validação Zod
6. **Documentar Decisões (ADRs)** — contexto, decisão, consequências
7. **Identificar Riscos** — lista com plano de mitigação
8. **Salvar no WORKING.md**

## Checklist
- [ ] Escopo claro
- [ ] Stack definida com justificativa
- [ ] Estrutura de pastas planejada
- [ ] Schema do banco (se aplicável)
- [ ] Rotas mapeadas
- [ ] Riscos identificados
- [ ] Salvo no WORKING.md
