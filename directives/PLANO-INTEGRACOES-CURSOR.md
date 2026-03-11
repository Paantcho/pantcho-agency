# PLANO DE INTEGRAÇÕES — Hubia (para Cursor)

> Documento de referência para o Cursor executar integrações reais.
> Gerado em 2026-03-11 · Pantcho Agency

---

## 1. Supabase Storage — Buckets e Upload

### Estado Atual
- **Nenhum bucket criado** no Supabase — tudo pendente
- Código de upload **não existe** — avatares, capas, logos e arquivos são URLs manuais
- Schema Prisma já tem campos prontos: `avatarUrl`, `coverUrl`, `fileUrl`, `logoUrl`

### Buckets Necessários

| Bucket | Uso | Path Pattern |
|--------|-----|--------------|
| `creators-media` | Avatar e capa das creators | `{organizationId}/{creatorId}/avatar.{ext}` |
| `knowledge-files` | PDFs, imagens, MD do Conhecimento | `{organizationId}/{entryId}/{filename}` |
| `org-assets` | Logo e assets de branding da org | `{organizationId}/logo.{ext}` |

### Políticas RLS Sugeridas

```sql
-- Leitura pública (avatares de creator)
CREATE POLICY "avatars_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'creators-media');

-- Escrita apenas por membros autenticados da org
CREATE POLICY "org_member_write"
ON storage.objects FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = (
    SELECT organization_id::text FROM organization_members
    WHERE user_id = auth.uid() AND is_active = true
    LIMIT 1
  )
);
```

### O Que Implementar

1. **Criar buckets no Supabase Dashboard** (ou via migration SQL)
2. **Aplicar políticas RLS** acima em cada bucket
3. **Criar `lib/supabase/storage.ts`** — funções utilitárias:
   - `uploadCreatorAvatar(orgId, creatorId, file): Promise<string>` → retorna URL pública
   - `uploadCreatorCover(orgId, creatorId, file): Promise<string>`
   - `uploadKnowledgeFile(orgId, entryId, file): Promise<string>`
   - `uploadOrgLogo(orgId, file): Promise<string>`
   - `deleteStorageFile(bucket, path): Promise<void>`
4. **Conectar nos formulários existentes:**
   - Creator detail (avatar + capa) → `creator-detail-client.tsx`
   - Branding (logo) → `branding-client.tsx`
   - Conhecimento (upload de arquivo) → página futura
5. **Componente `<FileUpload />`** — drag & drop + preview + progress bar

### Dependências
- `@supabase/supabase-js` (já instalado)
- Nenhuma lib adicional necessária

---

## 2. Stripe — Billing e Assinaturas

### Estado Atual
- **Zero código Stripe** no projeto — nenhum SDK, webhook, ou API route
- Model `Plan` no Prisma existe com 4 tiers (Básico, Profissional, Avançado, Enterprise)
- UI de planos existe (`plano-client.tsx`) com botões "Fazer upgrade" — mas não fazem nada
- Campo `trialEndsAt` na Organization existe — sem lógica de enforcement
- Stripe listado como "Desconectado" na página de integrações
- **Roadmap:** Stripe é Fase 2 conforme PRD v4.0 (linha 305)

### Infraestrutura de Planos Existente

```
Model Plan (prisma/schema.prisma):
  - id, name, slug, description, price, interval
  - limits (JSON), features (JSON), isActive, sortOrder

4 Planos Seedados:
  1. Básico (starter)     — creators
  2. Profissional          — creators + projects + planner
  3. Avançado              — + agents + memory + architecture
  4. Enterprise            — tudo (branding, custom_domain, team_management)

Feature Flags (lib/feature-flags.ts):
  - 9 features mapeadas por plano
  - Owner bypassa tudo (ALL_FEATURES)
  - getPlanFeatures(), hasFeature(), getPlanLevel()

Org Context (lib/org-context.ts):
  - getOrgContext() retorna planSlug + planLevel + enabledFeatures
  - Sidebar já filtra itens por feature flag
```

### O Que Implementar (Quando Fase 2 Iniciar)

1. **Instalar SDK:** `npm install stripe @stripe/stripe-js`
2. **Variáveis de ambiente:**
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_ID_STARTER`
   - `STRIPE_PRICE_ID_PROFISSIONAL`
   - `STRIPE_PRICE_ID_AVANCADO`
   - `STRIPE_PRICE_ID_ENTERPRISE`
3. **Criar `lib/stripe.ts`** — cliente Stripe server-side
4. **API Routes:**
   - `POST /api/stripe/create-checkout` — cria Checkout Session
   - `POST /api/stripe/create-portal` — cria Customer Portal Session
   - `POST /api/stripe/webhooks` — recebe eventos do Stripe
5. **Webhook Events a tratar:**
   - `checkout.session.completed` → atualiza `organization.planId`
   - `customer.subscription.updated` → sync plano
   - `customer.subscription.deleted` → downgrade para starter
   - `invoice.payment_failed` → notificar org
6. **Adicionar campos no Prisma:**
   - `Organization.stripeCustomerId` (String?)
   - `Organization.stripeSubscriptionId` (String?)
   - `Plan.stripePriceId` (String?)
7. **Sync Stripe ↔ Planos:**
   - Criar Products + Prices no Stripe Dashboard que espelhem os 4 planos
   - Mapear `Plan.stripePriceId` com o price ID do Stripe
8. **UI:**
   - Botão "Fazer upgrade" em `plano-client.tsx` → chama `/api/stripe/create-checkout`
   - Botão "Gerenciar assinatura" → chama `/api/stripe/create-portal`
   - Enforcement de `trialEndsAt` — middleware ou check em `getOrgContext()`

### Dependências
- `stripe` (server-side)
- `@stripe/stripe-js` (client-side)

---

## 3. Padronização de Roles — MemberRole

### Estado Atual
- Enum `MemberRole` no Prisma: `owner | admin | editor | viewer`
- **4 roles bem definidos** — já usado em:
  - `OrganizationMember.role` (schema.prisma)
  - `getOrgContext()` → `userRole`, `isOwner`, `isAdmin`, `canManage`
  - `getCurrentUserRoleInOrg()` → `lib/auth-organization.ts`
  - Team page → exibe badges por role + legenda de permissões
  - Invite modal → seleção de role via `HubiaSelect`

### Mapa de Permissões Atual

| Ação | owner | admin | editor | viewer |
|------|-------|-------|--------|--------|
| Ver tudo (bypass feature flags) | SIM | - | - | - |
| Gerenciar org (`canManage`) | SIM | SIM | - | - |
| Convidar membros | SIM | SIM | - | - |
| Remover membros | SIM | SIM | - | - |
| Alterar roles | SIM | SIM | - | - |
| Editar conteúdo | SIM | SIM | SIM | - |
| Visualizar | SIM | SIM | SIM | SIM |

### O Que Padronizar / Implementar

1. **Criar `lib/permissions.ts`** — centralizar regras:
   ```ts
   export type Permission =
     | "org.manage"
     | "org.billing"
     | "members.invite"
     | "members.remove"
     | "members.change_role"
     | "content.create"
     | "content.edit"
     | "content.delete"
     | "content.view"
     | "agents.configure"
     | "integrations.manage";

   export function hasPermission(role: MemberRole, permission: Permission): boolean {
     // ... mapa de role → permissions
   }
   ```

2. **Aplicar guards nas Server Actions:**
   - Toda action que modifica dados deve chamar `hasPermission()` antes
   - Retornar erro 403 se role insuficiente
   - Exemplo: `removeMember()` → exige `members.remove`

3. **Proteger API Routes:**
   - Middleware ou wrapper que extrai role e valida permission
   - Zod schema para validar payload + permission check no handler

4. **UI condicionada por role:**
   - Botões de ação (editar, deletar, convidar) → só renderizar se `hasPermission()`
   - Usar `canManage` do `OrgContext` para seções administrativas
   - Editor: pode editar conteúdo mas não gerenciar org
   - Viewer: read-only total

5. **RLS no Supabase:**
   - Policies de INSERT/UPDATE/DELETE devem verificar role do membro
   - SELECT pode ser mais permissivo (viewer tem acesso de leitura)

### O Que Já Funciona
- Enum sólido com 4 roles
- `getOrgContext()` retorna `userRole`, `isOwner`, `isAdmin`, `canManage`
- Team page exibe roles corretamente
- Invite modal permite selecionar role
- Owner bypassa feature flags

### O Que Falta
- `lib/permissions.ts` com mapa granular de permissions
- Guards em Server Actions (hoje não verificam role)
- UI condicional por role (hoje só verifica `isOwner`/`canManage` em poucos lugares)
- Policies RLS no Supabase que verificam role do membro

---

## 4. Resumo de Prioridades

| # | Integração | Prioridade | Complexidade | Bloqueado por |
|---|-----------|------------|--------------|---------------|
| 1 | **Supabase Storage** | ALTA | Média | Criar buckets no Dashboard |
| 2 | **Padronização Roles** | ALTA | Baixa-Média | Nada — pode começar agora |
| 3 | **Stripe Billing** | MÉDIA (Fase 2) | Alta | Decisão de pricing + conta Stripe |

### Ordem Recomendada
1. **Roles** primeiro — baixo esforço, impacto imediato em segurança
2. **Storage** segundo — desbloqueia upload de avatares, logos, arquivos
3. **Stripe** terceiro — quando pricing estiver definido e Fase 2 iniciar

---

## 5. Referências Internas

| Documento | Caminho |
|-----------|---------|
| Schema Prisma | `hubia-app/prisma/schema.prisma` |
| Feature Flags | `hubia-app/src/lib/feature-flags.ts` |
| Org Context | `hubia-app/src/lib/org-context.ts` |
| Auth Organization | `hubia-app/src/lib/auth-organization.ts` |
| Supabase Admin | `hubia-app/src/lib/supabase/admin.ts` |
| Mapa de Integração | `directives/hubia-api-integration-map.md` |
| PRD v4.0 | `PRD-v4.md` |
| Backlog | `hubia-delivery-backlog-v1.md` |
| Plano Client | `hubia-app/src/app/(dashboard)/config/plano/plano-client.tsx` |
| Integrações Client | `hubia-app/src/app/(dashboard)/config/integracoes/integracoes-client.tsx` |
| Team Client | `hubia-app/src/app/(dashboard)/organization/team/team-client.tsx` |
| Branding Client | `hubia-app/src/app/(dashboard)/config/branding/branding-client.tsx` |
