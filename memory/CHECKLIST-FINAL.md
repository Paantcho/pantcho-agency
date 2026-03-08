# ✅ CHECKLIST FINAL — O que falta fazer (quando você acordar)

> Criado em: 2026-03-08  
> Tudo abaixo depende de credenciais, contas externas ou decisões suas.  
> A estrutura da plataforma está 100% pronta e aguardando esses itens.

---

## 🔑 1. API Keys de IA (Provedores)

Acesse **Config → Provedores IA** e cadastre as chaves:

| Provedor | Onde obter a chave | Observação |
|----------|--------------------|------------|
| OpenAI | https://platform.openai.com/api-keys | Para GPT-4, embeddings |
| Google Gemini | https://aistudio.google.com/app/apikey | Para Gemini 1.5 Pro |
| Anthropic Claude | https://console.anthropic.com/ | Para Claude 3.5 Sonnet |

Após cadastrar, o Conhecimento consegue **processar entradas com IA** automaticamente.

---

## 🪣 2. Supabase Storage — Criar buckets

No painel do Supabase (https://app.supabase.com), vá em **Storage** e crie:

| Bucket | Visibilidade | Uso |
|--------|-------------|-----|
| `creators-media` | Público | Avatares e capas das creators |
| `knowledge-files` | Privado (RLS) | PDFs, imagens, arquivos do Conhecimento |
| `org-assets` | Público | Logo e branding da organização |

Depois aplique as policies que estão documentadas em:
`directives/hubia-api-integration-map.md` — seção 3

---

## 🤖 3. Bot do Telegram

Para receber pedidos via Telegram:

1. Fale com `@BotFather` no Telegram → `/newbot`
2. Copie o token do bot
3. Adicione no `.env.local`:
   ```
   TELEGRAM_BOT_TOKEN=seu_token_aqui
   ```
4. Configure o webhook do Telegram apontando para:
   ```
   https://seu-domínio.vercel.app/api/webhooks/pedido
   ```
5. Adicione `WEBHOOK_SECRET` no `.env.local` e nas variáveis do Vercel:
   ```
   WEBHOOK_SECRET=uma_chave_aleatoria_segura
   ```

---

## 🔒 4. Variáveis de ambiente no Vercel

Acesse o painel do Vercel → Settings → Environment Variables e adicione:

```
WEBHOOK_SECRET=...         # Secret para autenticar webhooks externos
OPENAI_API_KEY=...         # Se usar OpenAI direto (além do AiProvider)
```

---

## 📦 5. Dependências de SDK de IA (quando for usar)

```bash
# OpenAI
npm install openai

# Google Gemini
npm install @google/generative-ai

# Anthropic
npm install @anthropic-ai/sdk
```

A rota `/api/ai/process-knowledge` está documentada no mapa de integração.  
O código da rota ainda precisa ser criado — a estrutura e o fluxo estão prontos.

---

## 🎨 6. Fase 9 — Review final (baixa prioridade)

Quando tiver tempo, fazer um pass completo de motion/design de:
- [ ] Login → verificar animações de entrada
- [ ] Sidebar → verificar pill spring e ícones semânticos
- [ ] Todos os modais → verificar 3 camadas + HubiaPortal
- [ ] Todos os botões → verificar whileHover + whileTap
- [ ] Todos os cards → verificar stagger de entrada

---

## 📌 Resumo: o que está funcionando agora

| Página | Status | Dados reais |
|--------|--------|-------------|
| Login | ✅ | Auth Supabase |
| Dashboard | ✅ | KPIs do banco |
| Pedidos (lista + detalhe) | ✅ | Banco + trigger |
| Calendário | ✅ | Pedidos com dueAt |
| Projetos (lista + detalhe) | ✅ | Banco + trigger |
| Relatório | ✅ | Agregações reais |
| Conhecimento | ✅ | CRUD + banco (IA mock) |
| Creators | ✅ | Banco completo |
| Agentes | ✅ | Banco completo |
| Memória | ✅ | EntityVersion |
| Arquitetura | ✅ | Squads ao vivo + RUCs |
| Config (Equipe / Branding / Provedores / Segurança) | ✅ | Banco |
| Webhook Telegram/API | ✅ | Estrutura pronta |
| Gatilhos / ActivityLog | ✅ | Banco |
| Mapa de integração | ✅ | Documentado |
