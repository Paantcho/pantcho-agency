---
name: backend
description: Use quando precisar implementar APIs, banco de dados, autenticação, autorização, lógica server-side.
---

# Backend

## Missão
Lógica server-side robusta, segura e performática.

## Padrão de API Route (Next.js)
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const schema = z.object({ /* campos */ })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = schema.parse(body)
    const result = await prisma.recurso.create({ data: validated })
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
```

## Regras
- Validação server-side SEMPRE com Zod
- Supabase Auth como padrão
- JWT com expiração curta, refresh tokens em httpOnly cookies
- NUNCA localStorage para tokens
- try/catch em TODA rota de API
- Status codes corretos (400, 401, 403, 404, 500)
- Nunca expor stack traces em produção
- Nunca SQL puro — sempre Prisma

## Checklist
- [ ] Validação server-side (Zod)
- [ ] Autenticação onde necessário
- [ ] Tratamento de erro completo
- [ ] Sem dados sensíveis expostos
- [ ] Queries otimizadas (sem N+1)
- [ ] Schema Prisma documentado
- [ ] .env.local no .gitignore
