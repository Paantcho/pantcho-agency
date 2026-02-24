---
name: nextjs-patterns
description: Use quando implementar features com Next.js 15 App Router. Padrões de rotas, data fetching, metadata, Server Components, Server Actions.
---

# Padrões Next.js 15+

## Regras
- App Router SEMPRE (NUNCA Pages Router)
- Rotas em `src/app/`
- Route Groups: `(marketing)`, `(dashboard)`, `(auth)`
- Server Components por padrão
- `"use client"` APENAS para: hooks, event handlers, browser APIs

## Data Fetching
- Server Components para fetch (sem useEffect para dados)
- Server Actions para mutations (`"use server"`)
- Revalidação: `revalidatePath()` ou `revalidateTag()`

## Metadata
```typescript
// Estática
export const metadata: Metadata = { title: '', description: '', openGraph: {} }

// Dinâmica
export async function generateMetadata({ params }): Promise<Metadata> { ... }
```

## Server Actions
```typescript
"use server"
import { z } from "zod"
const schema = z.object({ ... })
export async function action(formData: FormData) {
  const validated = schema.parse(Object.fromEntries(formData))
  revalidatePath("/rota")
}
```

## Checklist
- [ ] App Router (não Pages)
- [ ] Server Components por padrão
- [ ] Client Components só quando necessário
- [ ] Metadata em todas as páginas
- [ ] next/image e next/font
- [ ] Loading e error states
- [ ] TypeScript strict sem erros
