# PLANO DE INTEGRAÇÃO HUBIA — Para Execução no Cursor

> **INSTRUÇÕES AO CURSOR:** Este é um plano estruturado de execução. Antes de cada bloco, **leia os arquivos indicados** e verifique o estado atual. Se algo já existir e estiver correto, pule para o próximo item. Se existir parcialmente, complete. Se não existir, implemente. Sempre siga o ciclo: **VERIFICAR → PLANEJAR → EXECUTAR → VALIDAR**.

---

## CONTEXTO DO PROJETO

**Hubia** é uma plataforma SaaS multi-tenant da Pantcho Agency.
- **Stack:** Next.js 15, TypeScript, Tailwind, Shadcn/UI, Supabase, Prisma, Vercel
- **App em:** `hubia-app/`
- **Idioma:** Português brasileiro em todos os outputs
- **Schema Prisma:** `hubia-app/prisma/schema.prisma`
- **Design:** 100% flat, Urbanist, Limão #D7FF00, Ink #0E0F10

### Documentos obrigatórios (ler ANTES de agir):
- `CLAUDE.md` — regras globais
- `AGENTS.md` — arquitetura de squads e agentes
- `RULES.md` — regras invioláveis
- `memory/WORKING.md` — tarefa ativa
- `memory/MEMORY.md` — decisões e preferências do usuário
- `directives/hub-construcao-orquestracao.md` — orquestração
- `directives/hubia-plano-creators-proximas-paginas.md` — plano Creators

---

## BLOCO 1 — SISTEMA DRAFT/PUBLICADO (UNIVERSAL)

### Objetivo
Toda entidade criável (Creator, Pedido, Projeto, KnowledgeEntry) deve ter um sistema consistente de **rascunho vs publicado**. Rascunhos ficam salvos no banco mas **NÃO entram nas rotas de consumo** (agentes, selects de vinculação, relatórios).

### 1.1 Verificar estado atual do Schema Prisma

**Ler:** `hubia-app/prisma/schema.prisma`

Verificar o que já existe:
- `PedidoStatus` → já tem `rascunho` ✓
- `AgentStatus` → já tem `rascunho` ✓
- `ProjetoStatus` → **NÃO tem** `rascunho` → **ADICIONAR**
- `Creator` → usa `metadata.isDraft` (workaround) → **MIGRAR para campo dedicado ou adicionar enum**
- `KnowledgeEntry` → **NÃO tem** draft → **ADICIONAR**

### 1.2 Alterações no Schema

```prisma
// ProjetoStatus — adicionar rascunho
enum ProjetoStatus {
  rascunho    // ← NOVO
  ativo
  pausado
  concluido
  cancelado
}

// Creator — adicionar campo status dedicado (ou usar publishedAt)
// Opção recomendada: adicionar campo `isDraft Boolean @default(false)`
// no model Creator, substituindo o uso de metadata.isDraft
model Creator {
  // ... campos existentes ...
  isDraft    Boolean  @default(false) @map("is_draft")  // ← NOVO
}

// KnowledgeEntry — adicionar campo isDraft
model KnowledgeEntry {
  // ... campos existentes ...
  isDraft    Boolean  @default(false) @map("is_draft")  // ← NOVO
}
```

### 1.3 Migrar código que usa metadata.isDraft

**Ler:** `hubia-app/src/app/(dashboard)/creators/actions.ts`

Verificar:
- `createCreator()` → muda de `metadata.isDraft` para `isDraft: true` no campo dedicado
- `finalizeDraft()` → muda para `update({ isDraft: false, isActive: true })`
- `getDraftCreators()` → muda where de filtro por metadata para `where: { isDraft: true }`
- `createCreatorWithAutoFill()` → mesmo ajuste
- `getCreators()` → tipo `CreatorRow` não precisa mais de `isDraft` no metadata

### 1.4 Regra global de consumo (CRÍTICO)

**Em todas as server actions e API routes que listam dados para uso em:**
- Selects de vinculação (ex: escolher creator num pedido)
- Feeds de agentes
- Relatórios/dashboards
- Qualquer rota que não seja a própria página de listagem da entidade

**Adicionar filtro:** `where: { isDraft: false }` (ou `status: { not: 'rascunho' }` conforme a entidade).

A página de listagem da própria entidade (ex: `/creators`) DEVE mostrar rascunhos, mas com badge visual "Rascunho" diferenciado.

### 1.5 Rodar migration

```bash
cd hubia-app
npx prisma migrate dev --name add-draft-system
npx prisma generate
```

### 1.6 Validar

- Build limpo: `npm run build` sem erros TypeScript
- Verificar que o seed continua funcionando: `npx prisma db seed`

---

## BLOCO 2 — CREATOR: ZIP UPLOAD + AUTO-FILL INTELIGENTE

### Objetivo
Ao criar uma nova Creator, o usuário pode fazer drag-and-drop de um arquivo .zip. O sistema extrai os documentos, lê o conteúdo, e a IA preenche automaticamente os campos do formulário. O que faltar, o usuário completa depois. O creator fica como **rascunho** até ser publicado.

### 2.1 Verificar estado atual

**Ler:**
- `hubia-app/src/app/api/creators/process-zip/route.ts` — **JÁ EXISTE**
- `hubia-app/src/app/(dashboard)/creators/novo/creator-form-client.tsx` — **JÁ EXISTE**
- `hubia-app/src/app/(dashboard)/creators/nova-creator-modal.tsx` — verificar se também tem ZIP

O que já funciona:
- Drag-and-drop de ZIP ✓
- Extração de arquivos de texto (.txt, .md, .json, .csv, .yaml, .xml, .html, .pdf) ✓
- Processamento com IA (Anthropic/OpenAI) ✓
- Auto-fill dos campos: name, bio, metadata, appearance, environments, looks, voice ✓
- Salvar como rascunho ✓
- Limite de 50MB ✓

### 2.2 Melhorias necessárias (verificar se já existem)

1. **Tipos de arquivo aceitos expandidos:** Verificar se o ZIP aceita também:
   - `.docx` (Word) — precisa de lib como `mammoth` para extrair texto
   - `.xlsx` (Excel) — precisa de lib como `xlsx` para extrair dados
   - `.pptx` (PowerPoint) — precisa de lib como `pptx-parser`
   - Se não aceitar, **adicionar pelo menos .docx** (mais provável do usuário ter)

2. **Feedback visual durante processamento:**
   - Verificar se há indicador de progresso no form (loading state, barra, etapas)
   - Verificar se mostra quais arquivos foram extraídos
   - Verificar se mostra quais campos foram preenchidos pela IA vs quais faltam

3. **Auto-save como rascunho:**
   - Verificar se o form salva rascunho no localStorage (key `hubia-creator-draft-page`)
   - Verificar se ao voltar à página, o rascunho é restaurado
   - Fluxo ideal: ZIP processado → campos preenchidos → usuário fecha → volta → tudo lá

4. **Imagens do ZIP:**
   - Se o ZIP contém imagens (.jpg, .png, .webp), verificar se são listadas
   - Futuro: essas imagens poderiam ser uploadadas ao Supabase Storage como referência visual

### 2.3 Fluxo completo esperado

```
Usuário arrasta ZIP → Sistema extrai arquivos
→ Arquivos de texto → enviados à IA → auto-fill dos campos
→ Imagens → listadas (futuro: upload ao Storage)
→ Campos preenchidos ficam editáveis
→ Campos vazios → usuário preenche
→ "Salvar como rascunho" → salva no banco com isDraft: true
→ "Publicar" → salva com isDraft: false, isActive: true
→ Rascunho NÃO aparece em selects de pedidos, NÃO é consumido por agentes
```

---

## BLOCO 3 — CONEXÕES COM BANCO DE DADOS

### 3.1 Preferências e Notificações do Usuário

**Ler:** `hubia-app/src/app/(dashboard)/config/` (todos os arquivos)

Verificar se:
- A página de Preferências salva no banco (user metadata do Supabase ou campo em UserProfile)
- A página de Notificações salva configurações (email, push, in-app)

Se não salvar:
- Opção A: Usar `UserProfile.metadata` (campo Json, se existir) — verificar schema
- Opção B: Adicionar campos ao schema `UserProfile`: `preferences Json @default("{}")`, `notifications Json @default("{}")`
- Server action: `updateUserPreferences(userId, data)` e `updateUserNotifications(userId, data)`

### 3.2 Domínio da Organização

**Ler:** `hubia-app/src/app/(dashboard)/organization/` (todos os arquivos)

Verificar se:
- O campo domain já existe no schema Organization → **SIM, já existe** (`domain String? @unique`)
- A página de Domínio salva no banco via server action

Se não salvar:
- Criar server action `updateOrganizationDomain(orgId, domain)`
- Validação: formato de domínio válido, unicidade
- Exibir estado: "verificado" / "pendente" (futuro: DNS check)

### 3.3 Branding — Upload de Logo/Favicon

**Ler:** `hubia-app/src/app/(dashboard)/organization/` (buscar componente de branding)

Verificar se:
- OrganizationBranding já existe no schema → **SIM**
- Upload de logo/favicon usa Supabase Storage
- Server action salva URL no branding

Se não:
- Criar rota API ou server action para upload ao Supabase Storage bucket `branding`
- Salvar URL retornada em `OrganizationBranding.logoUrl` / `faviconUrl`
- Também atualizar `Organization.logoUrl` / `faviconUrl` para consistência

### 3.4 Conhecimento — organization_id

**Ler:** `hubia-app/src/app/(dashboard)/conhecimento/actions.ts`

Verificar se:
- Todas as queries usam `organizationId` no where → se não, adicionar
- A criação de entries passa o `organizationId` correto
- O campo `createdBy` é preenchido com o user.id

---

## BLOCO 4 — ORQUESTRAÇÃO MULTI-AGENTE

### Objetivo
Os agentes devem poder: receber tarefas, executar skills, conversar entre si via memória/handoffs, e consumir apenas dados publicados.

### 4.1 Verificar estado atual

**Ler:**
- `hubia-app/src/app/api/agents/execute/route.ts`
- `hubia-app/src/app/api/agents/route.ts`
- `hubia-app/src/app/(dashboard)/agentes/actions.ts`
- `hubia-app/src/lib/agents/` (se existir — verificar toda a pasta)
- `agents/orquestrador/SOUL.md` (se existir)

### 4.2 O que precisa existir (verificar e completar)

1. **Provider resolution:** `resolveProvider(organizationId)` — verificar se:
   - Busca o AiProvider padrão da org
   - Decripta a API key
   - Retorna { type, apiKey, model, baseUrl, maxTokens }

2. **Execução de agente:** `/api/agents/execute` — verificar se:
   - Recebe `{ agentSlug, message, context? }`
   - Carrega o systemPrompt do agente
   - Carrega skills disponíveis
   - Chama o provider com o prompt montado
   - Retorna resposta

3. **Regra de consumo:** Quando um agente precisa listar creators/projetos/conhecimento:
   - Deve filtrar: `isDraft: false` (ou `status != rascunho`)
   - Deve filtrar: `organizationId` obrigatório
   - **NUNCA** retornar dados de rascunho para processamento de agente

4. **Handoffs entre agentes** (sistema de conversação):
   - Verificar se existe modelo de `AgentConversation` ou similar no schema
   - Se não existir, planejar (não implementar agora, apenas estruturar):
     ```
     Orquestrador recebe pedido → classifica tipo → delega ao squad certo
     → Agente executa → registra resultado → Orquestrador valida
     → Se precisa de outro agente → handoff com contexto
     ```
   - Registrar handoffs no `ActivityLog` (entityType: 'agent_handoff')

### 4.3 Fluxo de Orquestração (documentar se não existir)

```
PEDIDO ENTRA (manual, API, webhook)
  ↓
ORQUESTRADOR (CEO) recebe
  ↓
Classifica: tipo, urgência, squad destino
  ↓
Delega ao AGENTE correto do squad
  ↓
AGENTE executa (usando skills + dados PUBLICADOS da org)
  ↓
Resultado → salvo em PromptOutput ou ActivityLog
  ↓
Se precisa de outro agente → HANDOFF com contexto
  ↓
ORQUESTRADOR valida resultado final
  ↓
Pedido atualiza status
```

---

## BLOCO 5 — SEGURANÇA E MULTI-TENANCY

### 5.1 Verificar RLS no Supabase

**Ler:** Verificar se existem migrations SQL com RLS policies em `hubia-app/prisma/migrations/` ou `hubia-app/supabase/`

Tabelas que DEVEM ter RLS:
- `creators` — filtrar por `organization_id`
- `pedidos` — filtrar por `organization_id`
- `projetos` — filtrar por `organization_id`
- `knowledge_entries` — filtrar por `organization_id`
- `agents` — filtrar por `organization_id`
- `skills` — filtrar por `organization_id`
- `squads` — filtrar por `organization_id`
- `ai_providers` — filtrar por `organization_id` (CRÍTICO — contém API keys)
- `activity_logs` — filtrar por `organization_id`
- `prompt_outputs` — filtrar por `organization_id`

### 5.2 Verificar API keys

**Ler:** `hubia-app/src/lib/agents/provider.ts` (ou onde `resolveProvider` está)

Verificar:
- API keys são armazenadas criptografadas (`api_key_encrypted`)
- Existe função de encrypt/decrypt
- Nunca retorna a key para o client-side
- Validação server-side com Zod em toda API route

### 5.3 Verificar .env

- `.env.local` está no `.gitignore`
- Nenhuma chave exposta em código client-side
- Variáveis `NEXT_PUBLIC_*` não contêm secrets

---

## BLOCO 6 — SEED E DADOS MOCKADOS

### 6.1 Atualizar seed

**Ler:** `hubia-app/prisma/seed.ts` (ou `seed/`)

Verificar e ajustar:
- Projetos mockados usam os tipos corretos (muitos estão como "outro")
- Creators mockados têm dados completos (appearance, environments, looks, voice)
- Pedidos mockados cobrem todos os status (incluindo rascunho)
- Agentes e Skills estão corretos com os 9 agentes / 17 skills / 2 squads

### 6.2 Adicionar dados de draft

Incluir no seed:
- 1-2 creators em rascunho (isDraft: true) para testar filtro
- 1-2 pedidos em rascunho
- 1 projeto em rascunho (após adicionar ao enum)

---

## BLOCO 7 — VALIDAÇÕES FINAIS

### 7.1 Build limpo
```bash
cd hubia-app && npm run build
```
Zero erros TypeScript. Zero warnings críticos.

### 7.2 Checklist de integridade

- [ ] Todas as pages usam `organization_id` nas queries
- [ ] Nenhum dado de rascunho aparece em selects de vinculação
- [ ] Rascunhos aparecem na listagem com badge visual
- [ ] ZIP de Creator funciona (drag-drop → extrai → IA preenche → salva rascunho)
- [ ] Publicar rascunho muda isDraft para false
- [ ] Provider de IA resolve corretamente
- [ ] API keys estão criptografadas
- [ ] RLS ativo nas tabelas multi-tenant
- [ ] Seed roda sem erros
- [ ] Build passa limpo

---

## ORDEM DE EXECUÇÃO RECOMENDADA

```
1. BLOCO 1 — Schema (draft/publicado) → migration → generate
2. BLOCO 6 — Seed atualizado
3. BLOCO 3 — Conexões banco (preferências, domain, branding)
4. BLOCO 2 — Creator ZIP (melhorias)
5. BLOCO 5 — Segurança (RLS, crypto, .env)
6. BLOCO 4 — Orquestração (verificar, documentar, completar)
7. BLOCO 7 — Validação final
```

---

## VISÃO MACRO DA PLATAFORMA (para contexto do Cursor)

A Hubia é uma plataforma onde agências gerenciam **creators digitais** (personas de IA), **pedidos** de conteúdo, **projetos** com tipos adaptáveis, e **agentes de IA** organizados em squads que executam tarefas automaticamente.

O sistema funciona assim:
1. **Usuário cria Creators** (personas digitais com aparência, ambientes, looks, voz)
2. **Cria Pedidos** de conteúdo vinculados a creators e projetos
3. **Agentes de IA** processam os pedidos usando as informações dos creators
4. O **Orquestrador** coordena qual agente faz o quê
5. **Conhecimento** alimenta os agentes com contexto da organização
6. **Memória** mantém decisões e aprendizados entre sessões
7. Tudo é **multi-tenant** — cada organização vê apenas seus dados

O objetivo final é que a plataforma rode **autonomamente**: o usuário faz um pedido, e os agentes executam, revisam, e entregam — usando os dados publicados da organização.
