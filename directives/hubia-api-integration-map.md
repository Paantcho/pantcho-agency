# HUBIA — Mapa de Integração Banco/APIs

> Documento gerado automaticamente pelo Dev Squad · Fase 0b
> Data: 2026-03-08

---

## 1. Entidades e Fluxo de Dados

### Pedido (`pedidos`)
| Ação | Dispara | Registra |
|------|---------|----------|
| Criar pedido (manual) | `dispatchTrigger("pedido.criado")` | `ActivityLog` + `isAlert=true` |
| Criar pedido (webhook/Telegram) | `POST /api/webhooks/pedido` | idem |
| Alterar status | `dispatchTrigger("pedido.status_alterado")` | `ActivityLog` + `isAlert=true` |
| Vincular creator | `logActivity("pedido.creator_vinculado")` | `ActivityLog` |
| Vincular projeto | `logActivity("pedido.projeto_vinculado")` | `ActivityLog` |

**Campos cross-entity**: `creatorId` → `creators`, `projetoId` → `projetos`

---

### Creator (`creators`)
| Ação | Dispara | Registra |
|------|---------|----------|
| Criar creator | `dispatchTrigger("creator.criada")` | `ActivityLog` + `isAlert=true` |
| Salvar imagem de avatar | Upload para Supabase Storage → grava `avatarUrl` na row | — |
| Salvar imagem de capa | Upload para Supabase Storage → grava `coverUrl` na row | — |
| Desativar creator | `logActivity("creator.desativada")` | `ActivityLog` |

**Storage**: bucket `creators-media`, path `{organizationId}/{creatorId}/avatar.{ext}`

---

### Projeto (`projetos`)
| Ação | Dispara | Registra |
|------|---------|----------|
| Criar projeto | `dispatchTrigger("projeto.criado")` | `ActivityLog` + `isAlert=true` |
| Mudar status | `logActivity("projeto.status_alterado")` | `ActivityLog` |

**Relacionamentos**: `pedidos.projetoId` → faz `Projeto.pedidosCount` atualizar via `_count`

---

### KnowledgeEntry (`knowledge_entries`)
| Ação | Dispara | Registra |
|------|---------|----------|
| Criar entrada (texto/link) | `logActivity("conhecimento.entrada_criada")` | `ActivityLog` |
| Upload de arquivo | Upload para Supabase Storage → grava `fileUrl` | — |
| Processamento IA | `dispatchTrigger("conhecimento.ai_processado")` → `aiProcessed=true`, `aiMetadata` populado | `ActivityLog` + `isAlert=true` |

**Storage**: bucket `knowledge-files`, path `{organizationId}/{entryId}/{filename}`

---

### ActivityLog + Gatilhos
- Toda ação crítica chama `logActivity()` ou `dispatchTrigger()`
- `isAlert=true` → deve aparecer no badge de notificações (TODO: componente de sino)
- `alertReadBy` → array de userId que já leram o alerta

---

## 2. Rotas de API

| Rota | Método | Descrição | Auth |
|------|--------|-----------|------|
| `/api/webhooks/pedido` | POST | Recebe pedidos externos (Telegram, API) | `X-Webhook-Secret` header |
| `/api/ai/process-knowledge` | POST | Processa KnowledgeEntry com LLM | Supabase session |
| `/auth/callback` | GET | Callback OAuth Supabase | — |

### `/api/ai/process-knowledge` (a criar)
```ts
// Payload
{ entradaId: string, organizationId: string }

// Processo
1. Busca KnowledgeEntry.content no banco
2. Chama LLM escolhido (OpenAI / Gemini / Claude — via AIProvider ativo)
3. Salva summary, tags sugeridas e aiMetadata na entry
4. Define aiProcessed = true
5. Dispara trigger "conhecimento.ai_processado"
```

---

## 3. Supabase Storage — Buckets necessários

| Bucket | Uso | Quem configura |
|--------|-----|----------------|
| `creators-media` | Avatares e capas das creators | Admin Supabase ⚠️ PENDENTE |
| `knowledge-files` | PDFs, imagens e MD do Conhecimento | Admin Supabase ⚠️ PENDENTE |
| `org-assets` | Logo e assets de branding | Admin Supabase ⚠️ PENDENTE |

**Policy sugerida para todos os buckets:**
```sql
-- Leitura pública das imagens de creator (avatar)
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

---

## 4. Provedores de IA (via `ai_providers`)

A rota `/api/ai/process-knowledge` busca o provedor ativo `isDefault=true` da org.

| Campo | Tipo | Uso |
|-------|------|-----|
| `type` | `openai \| gemini \| anthropic \| custom` | Escolha do SDK |
| `apiKey` | string criptografado | Enviado como `Authorization: Bearer` |
| `baseUrl` | string | Override de endpoint (custom providers) |

**Integração pendente** (ver checklist):
- OpenAI: `npm install openai`
- Google Gemini: `npm install @google/generative-ai`
- Anthropic: `npm install @anthropic-ai/sdk`

---

## 5. Telegram (sourceType: "telegram")

**Como funciona:**
1. Bot do Telegram recebe mensagem do usuário
2. Bot faz `POST /api/webhooks/pedido` com o payload da mensagem
3. Hubia cria Pedido com `sourceType="telegram"` e `sourcePayload={message, chatId, ...}`
4. Gatilho dispara e registra no ActivityLog

**Pendente:**
- Criar bot no @BotFather
- Configurar webhook no Telegram apontando para a URL do Vercel
- Adicionar `WEBHOOK_SECRET` no .env e no Vercel

---

## 6. Sincronização via EntityVersion

O model `EntityVersion` registra snapshot histórico das entidades.

**Quando usar**: ao atualizar Creator, Agente ou Projeto com dados importantes, criar manualmente:
```ts
await prisma.entityVersion.create({
  data: {
    organizationId,
    entityType: "creator",
    entityId: creator.id,
    version: latestVersion + 1,
    data: creatorSnapshot,
    changedBy: userId,
  }
})
```
