# HUBIA — Product Requirements Document v4.0 (Unificado SaaS)

> Versão 4.0 do PRD da Hubia, unificando o PRD v3.0 original com o Adendo SaaS (multi-tenant, theming, planos e provedores de IA). Este passa a ser o **único PRD oficial** do produto, substituindo todas as versões anteriores.

**Versão:** 4.0 · Março 2026  
**Autor:** Pantcho · Diretor de Arte & Produto  
**Classificação:** CONFIDENCIAL · Uso Interno  
**Status:** Ativo · Substitui PRD v3.0 e Adendo SaaS como fonte única de verdade

---

## 0. Sumário Executivo

Hubia é o sistema operacional central da Pantcho Agency — uma plataforma web que unifica gestão de pedidos, operação de creators digitais, coordenação de agentes de IA, geração de conteúdo visual e gerenciamento de projetos de desenvolvimento em um único dashboard.[file:2]

A partir da versão 4.0, Hubia é especificada desde a base como **plataforma SaaS multi-tenant**, capaz de atender múltiplas organizações (profissionais individuais, agências e empresas B2B/white-label), mantendo a Pantcho Agency como organização seed e caso de uso primário.[file:1]

Princípios fundamentais:
- Pantcho continua sendo a única autoridade para aprovar mudanças estruturais na organização seed.  
- O PRD é o contrato de desenvolvimento: nenhuma decisão crítica fora deste documento deve ser implementada sem aprovação explícita.  
- Toda funcionalidade deve respeitar **simultaneamente** os princípios originais de produto/design do v3.0 e as regras de multi-tenancy/SaaS introduzidas aqui.[file:2][file:1]

Impactos centrais desta versão:
- Arquitetura de dados e autenticação nascem multi-tenant, evitando refatoração futura pesada.  
- Design system suporta theming por organização sem violar hierarquia visual nem contraste mínimo.  
- Operações de IA são configuráveis por tenant via camada de provedores plugáveis.  
- Sistema de planos, limites e feature flags viabiliza monetização e segmentação por plano.

---

## 1. Identidade, Missão e Escopo

### 1.1 Nome, Marca e Posicionamento

- Nome do produto: **Hubia**.  
- Tagline implícita: **Sistema operacional da agência e plataforma SaaS para operações criativas guiadas por IA**.  
- Domínio interno Pantcho: `agency.paantcho.com`.  
- Domínio público futuro (exemplo): `hubia.app` para onboarding de usuários externos.  
- Pantcho Agency é a **organização seed**, referência para todos os fluxos, telas e padrões visuais.[file:2][file:1]

### 1.2 Missão do Produto

- Ser o ponto único de controle de toda a operação da Pantcho Agency e demais organizações que usem a plataforma.  
- Conectar pedidos → agentes → creators → conteúdo em um fluxo rastreável, auditável e versionado.  
- Manter qualidade visual e operacional em nível Apple / Anthropic, independente da escala.  
- Escalar adicionando squads de agentes, skills e tenants, não pessoas.  
- Ser autossuficiente: agentes validam, Pantcho/owner aprova, sistema executa.[file:2]

### 1.3 Escopo do Sistema

Hubia gerencia:
- Conteúdo visual: prompts de imagem para creators (atual).  
- Conteúdo audiovisual: prompts de vídeo (futuro).  
- Desenvolvimento: landing pages, apps, sistemas e sites.  
- Projetos: campanhas, entregas agrupadas, qualquer iniciativa multi-pedidos.[file:2]

Requisito estrutural: o sistema deve ser extensível para novos tipos de trabalho **sem quebrar** o modelo multi-tenant nem os fluxos existentes.[code_file:5]

---

## 2. Governança de Produto

### 2.1 Autoridade

- **Pantcho** é a única autoridade de mudanças globais de produto, design e arquitetura.  
- Em cada organização (tenant), existe exatamente um `owner` com autoridade máxima local (membros, branding, provedores de IA, etc.), sem poder de alterar regras globais.[file:1][code_file:5]

### 2.2 Workflow de Mudança

- Qualquer alteração em arquivos críticos ou regras de produto cria **nova versão de PRD**, nunca sobrescreve sem versionamento.  
- Agentes sugerem; Pantcho (ou owner da organização, quando aplicável) decide; o sistema executa.  
- "Sem aprovação explícita = sem alteração" permanece regra absoluta.[file:2]

---

## 3. Princípios Invioláveis

### 3.1 Design

Os princípios de design do PRD v3.0 são mantidos e aplicados a todos os tenants:[file:2]
- Layout limpo e funcional, sem ornamentos supérfluos.  
- Hierarquia extrema via tamanho, peso e cor primária.  
- Preto como poder para cards cruciais, banners e outputs de sistema.  
- Cor primária como sinal de vida (ativo, CTA, atenção).  
- 100% flat (sem sombras).  
- Anti-AI-slop (nada de UI genérica).  
- Animações sutis e consistentes.

### 3.2 Multi-Tenancy

Princípios novos, invioláveis:[file:1][code_file:5]
1. Nenhuma query de dados sem `organization_id`.  
2. Um usuário nunca vê dados de outra organização.  
3. API keys de provedores de IA nunca ficam em plaintext no banco.  
4. Theming nunca quebra hierarquia visual nem contraste mínimo.  
5. Limites de plano são enforçados no servidor.  
6. Toda feature nova é desenhada multi-tenant desde o início.  
7. Deleção de organização é soft-delete com retenção de 30 dias antes de purge.

---

## 4. Arquitetura Multi-Tenant

### 4.1 Modelo de Isolamento

- Modelo adotado: **shared database, shared schema, tenant-discriminator column**.  
- Toda tabela de negócio possui `organization_id UUID NOT NULL` referenciando `organizations.id`.  
- Tabelas de sistema puramente globais (como `plans` e `feature_flags`) não possuem `organization_id`.[file:1]

### 4.2 Tabela `organizations`

Representa cada tenant:[file:1]
- `id` (UUID, PK).  
- `name`, `slug` (TEXT, `slug` único).  
- `logo_url`, `favicon_url` (TEXT opcionais, Supabase Storage).  
- `domain` (TEXT UNIQUE, opcional, domínio customizado).  
- `plan_id` (UUID, FK `plans`).  
- `is_active` (BOOLEAN).  
- `trial_ends_at` (TIMESTAMPTZ, opcional).  
- `settings` (JSONB, default `{}`).  
- `created_at`, `updated_at`.

Pantcho Agency é criada como organização seed com plano interno sem limites.[file:1][file:2]

### 4.3 Tabela `organization_members`

- `id` (UUID, PK).  
- `organization_id` (FK `organizations`).  
- `user_id` (FK `auth.users`, Supabase Auth).  
- `role` (ENUM `owner` | `admin` | `editor` | `viewer`).  
- `invited_by`, `invited_at`, `accepted_at`.  
- `is_active` (BOOLEAN).[file:1]

Regras de role seguem o Adendo SaaS: 1 owner por organização, admins quase tudo, editor focado em conteúdo e viewer somente leitura.[file:1]

### 4.4 Impacto nas Demais Tabelas

Todas as tabelas de negócio definidas no PRD v3.0 recebem `organization_id`:[file:1][file:2]
- `creators`, `creator_identity_markers`, `creator_appearance`, `creator_environments`, `creator_looks`, `creator_voice`.  
- `pedidos`, `prompt_outputs`, `projetos`.  
- `agents`, `skills`, `entity_versions`, `knowledge_entries`, `activity_log`.  
- Qualquer nova entidade de negócio futura **deve** incluir `organization_id`.

No ORM (Prisma), cada model afetado recebe:
- `organizationId String`.  
- `organization Organization @relation(fields: [organizationId], references: [id])`.[file:1]

### 4.5 RLS (Row Level Security)

Cada tabela com `organization_id` implementa policy padrão:

```sql
CREATE POLICY "tenant_isolation" ON [tabela]
  USING (organization_id = (
    SELECT om.organization_id 
    FROM organization_members om 
    WHERE om.user_id = auth.uid() 
      AND om.is_active = true
  ));
```

Sem sessão válida + membership ativa, não há acesso a dados.[file:1]

### 4.6 Middleware de Tenant

No Next.js, todas as API routes passam por middleware que:[file:1]
1. Valida sessão (Supabase Auth).  
2. Determina `organization_id` ativo (de seletor de organização).  
3. Injeta `organization_id` em todas as operações Prisma (filtros e writes).  
4. Bloqueia acessos cruzados entre organizações.

---

## 5. Multi-Tenancy na Experiência do Usuário

### 5.1 Autenticação e Primeiro Acesso

- Provedor: Supabase Auth com Google OAuth, magic link e email+senha.  
- Fluxo de primeiro acesso para usuários externos: signup → criação automática de organização → usuário vira `owner` → branding padrão (Hubia) → plano `free`/`trial` → redirect para `/dashboard`.[file:1]

Pantcho e equipe atual usam organização seed pré-configurada.[file:1][file:2]

### 5.2 Convites e Gestão de Equipe

Tela `/config/equipe`:
- Lista membros (avatar, nome, email, role, status, remover).  
- Botão "+ Convidar membro" → modal com email + role.  
- Convite via magic link, vincula ou cria conta.  
- Owner/admin podem gerenciar; editor/viewer apenas visualizam.[file:1]

### 5.3 Troca de Organização

- Seletor de organização no footer da sidebar (abaixo do avatar).  
- Trocar org recarrega contexto completo com novo `organization_id`.  
- Toda UI (dashboard, pedidos, creators etc.) responde ao tenant ativo.[file:1]

---

## 6. Design System e Theming por Tenant

### 6.1 Filosofia Cromática Multi-Tenant

- O design system original (escala 0–1000, cor limão como primary-500 etc.) permanece a referência base.[file:2]  
- A camada fixa (tipografia Urbanist, grid, spacing, flatness, componentes) é global e não muda por tenant.  
- A camada variável (cor primária + variações, logo, favicon) é específica por organização, respeitando saturação/brilho médios e contraste mínimo.[file:1][file:2]

### 6.2 Tabela `organization_branding`

- 1:1 com `organizations`.  
- Campos para `color_primary`, estados hover/pressed, escala 50–900, URLs de logo e favicon, `updated_at`.[file:1]

### 6.3 Geração de Escala e Contraste

- Ao definir `color_primary` (500), sistema gera escala 50–900 em HSL: 50–400 tints, 600–900 shades.  
- Garante que 400 funcione como hover, 600 como pressed, 100 como fundo suave e 700+ como texto em edge cases.  
- Validação automática de contraste contra branco e preto com aviso se ratio < 3:1.[file:1]

### 6.4 Tokens CSS e Aplicação

- Cores usadas apenas via CSS custom properties (tokens semânticos).  
- `ThemeProvider` injeta tokens da organização ativa no `<html>`.  
- Dark mode futuro é suportado trocando apenas valores de tokens, sem refator de componentes.[file:2][file:1]

### 6.5 Tela `/config/branding`

- Editor visual de logo, favicon e cor primária.  
- Preview em tempo real da sidebar, botões, badges, tabs e cards.  
- Botão "Salvar alterações" aplica o tema para toda a organização (permite somente `owner` e `admin`).[file:1]

---

## 7. Planos, Limites e Feature Flags

### 7.1 Planos (`plans`)

- Define preços, limites e features por plano (Free, Pro, Business, Enterprise etc.).  
- Campo `limits` (JSONB) com restrições como `max_creators`, `max_prompts_per_month`, `max_team_members`, `max_ai_providers` etc.[file:1]

### 7.2 Feature Flags

- `feature_flags`: catálogo global de flags (`name`, `description`, `is_global`, `plan_required`).  
- `organization_feature_overrides`: permite overrides manuais por organização (ex.: liberar feature enterprise para um cliente pro).[file:1]

### 7.3 Enforcement de Limites

- Toda ação que consome recurso limitado consulta plano + limites + uso atual.  
- Se ≥ limite, bloqueia com mensagem amigável e sugestão de upgrade.  
- Verificação sempre no backend; frontend apenas antecipa UX.[file:1]

---

## 8. Provedores de IA por Organização

### 8.1 Filosofia

- Cada organização configura seus próprios provedores de IA usando as APIs que já assina (Anthropic, OpenAI, Google, proxies etc.).  
- Vários provedores podem coexistir por tenant, com um default para operações padrão.[file:1]

### 8.2 Tabela `ai_providers`

- Tipos `anthropic`, `openai`, `google`, `custom`.  
- `api_key_encrypted` sempre criptografada com chave em env, nunca plaintext.  
- `base_url` opcional para provedores compatíveis com OpenAI API.  
- `default_model`, `is_default`, `max_tokens` para controle fino por tenant.[file:1]

### 8.3 AI Gateway

- Camada de abstração converte o formato interno da Hubia em chamadas específicas de cada provedor.  
- O Agente Engenheiro de Prompts sempre trabalha no formato interno unificado.  
- Troca de provedor ou modelo não exige refatorar os agentes.[file:1][file:2]

---

## 9. Fluxos de Trabalho Centrais

Todos os fluxos definidos no PRD v3.0 permanecem válidos, agora sempre escopados por `organization_id`:[file:2][code_file:5]
- Gestão de pedidos (criação, estados, aprovação, urgência).  
- Operação de creators digitais (identidade, aparência, ambientes, looks, voz).  
- Coordenação de squads de agentes IA e checklist forense.  
- Gestão de projetos e agrupamento de entregas.  
- Logs forenses, activity log e versionamento de arquivos críticos.

A única diferença estrutural é que tudo isso acontece **por tenant**, nunca em um espaço global compartilhado.

---

## 10. Estratégia de Dados Iniciais

- Organização seed (Pantcho Agency) vem com dados mockados completos para validar fluxos, estados e telas.  
- Demais organizações criadas via onboarding começam vazias, com foco em first value rápido por meio de templates.  
- "Reset completo" em Config limpa mock data da Pantcho para produção real.[file:2][file:1]

---

## 11. Fases de Implementação SaaS

### 11.1 Fase 1 — Fundação Multi-Tenant (Atual)

- Criar infra multi-tenant (tabelas, RLS, middleware, colunas `organization_id`).  
- Implementar telas de equipe, branding e provedores de IA.  
- Garantir que toda funcionalidade já existente opere corretamente no contexto da Pantcho Agency como tenant seed.[file:1][code_file:5]

### 11.2 Fase 2 — Abertura para Usuários Externos

- Ativar signup público, planos Free/Pro e billing (Stripe).  
- Configurar enforcement completo de limites.  
- Criar landing page pública e documentação básica para novos usuários.[file:1]

### 11.3 Fase 3 — Enterprise, White-Label e Geração Avançada

- Habilitar domínios customizados por organização e branding white-label.  
- Integrar provedores de mídia (fal.ai, Replicate etc.) para geração de imagem/vídeo.  
- Expandir gerador com aba VIDEO e Brand Kit com referências visuais.[file:1][file:2]

---

## 12. Regras Operacionais Adicionais

Além das regras originais de operação de agentes, ficam explícitas:[file:2][file:1]
- Owner é intransferível na Fase 1 (transferência é feature futura).  
- Toda nova tabela ou endpoint deve ser avaliada sob a ótica de multi-tenancy **antes** de implementação.  
- Logs nunca registram API keys nem dados sensíveis em plaintext.  
- Qualquer feature que bypassa limites de plano precisa de flag explícita e rastreável.

---

## 13. Compatibilidade e Documentos Relacionados

- Em qualquer conflito entre descrições antigas do PRD v3.0 e este documento, **v4.0 prevalece**.  
- O Adendo SaaS deixa de existir como documento separado e é totalmente incorporado nas seções 4–8, 10–12 deste PRD.  
- Documentos operacionais derivados (backlog de épicos, plano de entrega, playbooks técnicos) fazem referência a este PRD, mas **não** o substituem.

---

**HUBIA — PRD v4.0 Unificado (SaaS Ready)**  
Pantcho Agency · Março 2026  
Documento vivo. Qualquer alteração cria nova versão.
