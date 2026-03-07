# HUBIA — Delivery Plan & Backlog Inicial v1.0

> Documento operacional derivado do **HUBIA — PRD v4.0 Unificado SaaS**. Não redefine o produto; traduz o PRD em épicos, blocos de trabalho e prioridades para implementação.

**Versão:** 1.0 · Março 2026  
**Relacionamento:** Derivado do PRD v4.0 · Não substitui o PRD  
**Uso:** Planejamento de entrega (Jira, Linear, Notion, etc.)

---

## 0. Contexto

O PRD v4.0 define o **o quê** e o **por quê** do produto Hubia, incluindo visão, arquitetura multi-tenant, theming, planos, provedores de IA e fases macro SaaS.[code_file:21]

Este documento define **como** esse escopo se desdobra em:
- Fases de entrega.  
- Épicos de produto/engenharia.  
- Itens sugeridos de backlog (histórias/tarefas) para o time de desenvolvimento.

Backlog detalhado deve ser transportado e refinado em uma ferramenta de gestão (Jira, Linear, etc.), mantendo este doc como referência de alto nível.

---

## 1. Fases de Implementação (Resumo)

As fases seguem a seção 11 do PRD v4.0:[code_file:21]

- **Fase 1 — Fundação Multi-Tenant:** tornar a Hubia multi-tenant sem quebrar a experiência atual da Pantcho Agency.  
- **Fase 2 — Abertura para Usuários Externos:** ativar signup público, planos iniciais e billing.  
- **Fase 3 — Enterprise & White-Label & Geração Avançada:** consolidar camada enterprise, domínios customizados e mídia avançada.

---

## 2. Convenções de Backlog

Sugestão de convenções para épicos e histórias:
- Prefixos de épico: `F1-`, `F2-`, `F3-` para fases; `INF`, `DX`, `SEC` para temas transversais.  
- Cada épico referencia explicitamente seções do PRD v4.0 (ex.: "Ver PRD v4.0, seção 4. Arquitetura Multi-Tenant").  
- Histórias técnicas herdadas (ex.: migração de tabelas) são sempre ligadas a um épico de negócio para manter rastreabilidade.

---

## 3. Fase 1 — Fundação Multi-Tenant

Objetivo: entregar uma Hubia multi-tenant funcional, com Pantcho Agency como tenant seed, preservando todos os fluxos atuais.[code_file:21]

### 3.1 Épico F1-E1 — Infra Multi-Tenant e Auth

**Referências PRD:** Seções 4 e 5 (Arquitetura Multi-Tenant, Multi-Tenancy na Experiência do Usuário).[code_file:21]

Possíveis histórias/tarefas:
- Criar tabelas `organizations` e `organization_members` com constraints e índices.  
- Adicionar coluna `organization_id` em todas as tabelas de negócio definidas no PRD.  
- Atualizar models do Prisma para refletir `organizationId` e relações.  
- Implementar RLS no Supabase em todas as tabelas com `organization_id`.  
- Implementar middleware de tenant no Next.js, anotando `organizationId` em todas as requisições autenticadas.  
- Ajustar sessões Supabase Auth para suportar múltiplas organizações por usuário.  
- Criar seletor de organização no footer da sidebar e integrar com middleware.

### 3.2 Épico F1-E2 — Tela de Equipe e Convites

**Referências PRD:** Seção 5.2 (Convites e Gestão de Equipe).[code_file:21]

Possíveis histórias:
- Criar página `/config/equipe` com lista de membros, estados e roles.  
- Implementar fluxo de convite (email + role) com magic link.  
- Tratar aceitação de convite para novos usuários e usuários existentes.  
- Garantir que permissões (owner/admin/editor/viewer) reflitam corretamente no frontend.

### 3.3 Épico F1-E3 — Theming por Tenant (Branding)

**Referências PRD:** Seção 6 (Design System e Theming por Tenant).[code_file:21]

Possíveis histórias:
- Criar tabela `organization_branding` e relações.  
- Implementar geração de escala de cor 50–900 a partir da cor primária.  
- Implementar `ThemeProvider` e injeção de tokens CSS por tenant.  
- Criar página `/config/branding` com color picker, upload de logo/favicon e preview.  
- Implementar validação de contraste com aviso não bloqueante.

### 3.4 Épico F1-E4 — Provedores de IA Configuráveis

**Referências PRD:** Seção 8 (Provedores de IA por Organização).[code_file:21]

Possíveis histórias:
- Criar tabela `ai_providers` e enum de tipos de provedor.  
- Implementar criptografia de `api_key_encrypted` com chave em env.  
- Implementar UI de cadastro/edição de provedores por organização.  
- Implementar AI Gateway com adapters para Anthropic, OpenAI e Google.  
- Integrar agentes existentes para usar AI Gateway em vez de chamadas diretas.

### 3.5 Épico F1-E5 — Migração e Garantia de Integridade

**Referências PRD:** Seções 9 e 10 (Fluxos Centrais, Estratégia de Dados).[code_file:21]

Possíveis histórias:
- Migrar dados existentes da Pantcho Agency para incluir `organization_id`.  
- Adaptar queries e mutations existentes para sempre filtrar por `organizationId`.  
- Criar smoke tests focados em multi-tenant (tentar acessar dados de outro tenant, etc.).  
- Validar todos os fluxos principais (pedidos, creators, projetos, agentes) dentro do tenant seed.

---

## 4. Fase 2 — Abertura para Usuários Externos

Objetivo: permitir signup público, planos iniciais e cobrança.[code_file:21]

### 4.1 Épico F2-E1 — Signup e Onboarding Público

**Referências PRD:** Seção 5.1 (Autenticação e Primeiro Acesso).[code_file:21]

Possíveis histórias:
- Implementar formulário de signup público com Supabase Auth.  
- Criar fluxo de criação automática de organização para novos usuários.  
- Definir plano inicial (Free/Trial) padrão.  
- Criar onboarding de 3 passos (ex.: perfil, primeiro creator, primeiro pedido).

### 4.2 Épico F2-E2 — Planos, Limites e Billing

**Referências PRD:** Seção 7 (Planos, Limites e Feature Flags).[code_file:21]

Possíveis histórias:
- Implementar tabela `plans` com limites e features.  
- Implementar leitura de limites e enforcement no backend para ações principais.  
- Integrar com Stripe (produtos, preços, webhooks) para cobrança mensal/anual.  
- Implementar tela de plano/upgrade em `/config/plano`.

### 4.3 Épico F2-E3 — Landing Page e Documentação

Possíveis histórias:
- Criar landing page pública explicando a Hubia, planos e diferenciais.  
- Criar docs base (FAQ, getting started) para novos tenants.  
- Integrar tracking mínimo (analytics) para entender funil de entrada.

---

## 5. Fase 3 — Enterprise, White-Label e Geração Avançada

Objetivo: habilitar cenários enterprise com branding extremo e geração de mídia avançada.[code_file:21]

### 5.1 Épico F3-E1 — White-Label e Domínios Customizados

**Referências PRD:** Seções 6 e 11.3 (Theming, Fase 3).[code_file:21]

Possíveis histórias:
- Permitir configuração de domínio customizado por organização (`organizations.domain`).  
- Ajustar roteamento para servir app em domínio do cliente.  
- Permitir esconder marca Hubia em contextos enterprise (white-label).  
- Revisar emails transacionais para suportar branding do cliente.

### 5.2 Épico F3-E2 — Provedores de Mídia e Geração Avançada

**Referências PRD:** Seção 11.3 (Geração Avançada).[code_file:21]

Possíveis histórias:
- Integrar com provedores de mídia (fal.ai, Replicate etc.).  
- Estender AI Gateway para suportar operações de imagem/vídeo.  
- Criar aba VIDEO no Gerador com fluxo análogo ao de imagem.  
- Implementar Brand Kit (referências visuais por tenant) consumido pelos agentes.

### 5.3 Épico F3-E3 — Harden Enterprise

Possíveis histórias:
- Revisar limites, SLA e métricas para planos Enterprise.  
- Implementar logs de auditoria melhorados (quem fez o quê, quando, em que tenant).  
- Implementar export de dados (quando permitido por plano) e políticas de retenção.

---

## 6. Temas Transversais (Sempre Abertos)

Alguns temas correm em paralelo às fases:

- **SEC — Segurança e Compliance:** endurecer RLS, revisar permissões, criptografia, logs, backups.  
- **DX — Developer Experience:** automatizar setup local, seeds por tenant, testes end-to-end multi-tenant.  
- **OBS — Observabilidade:** métricas por tenant (uso de prompts, custos de IA, erros, latência).

Cada item desses pode originar épicos próprios (ex.: `SEC-E1`, `DX-E1`) que referenciam as seções relevantes do PRD v4.0 e deste documento.[code_file:21]

---

## 7. Como Usar Este Documento

- Use o **PRD v4.0** como referência de requisitos, regras e arquitetura.  
- Use este documento como mapa de épicos/blocos para criar issues reais na ferramenta de gestão.  
- Atualize este arquivo quando épicos forem concluídos, replanejados ou cancelados, mantendo o histórico junto do PRD.
