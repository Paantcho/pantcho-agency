# STATUS.md — Resumo Consolidado do Hub

Atualizado no **ciclo de consolidação**. Fonte única para "andamento de tudo" — evita buracos de comunicação entre squads e agentes.

---

## Última consolidação

- **Data:** 2026-03-08
- **Responsável:** Dev Squad (consolidação pós-sessão Agentes)

---

## Projetos ativos

| Projeto | Squad | Estado | Próximo |
|---------|--------|--------|---------|
| Hubia SaaS | Dev Squad | Em desenvolvimento — Agentes concluído | Pedidos |

---

## Entregas recentes (sessão 2026-03-08)

### Página Agentes — COMPLETO
- 4 tabs: Squads, Skills Registry, Fluxo do Orquestrador, Squads Futuros
- Cards de agentes clicáveis → navega para página de detalhe
- Headers dos squads clicáveis → navega para página do squad
- Cards de squads futuros clicáveis → cria squad no banco na primeira visita

### Página Agente — COMPLETO (`/agentes/[slug]`)
- Layout 2 colunas: menu lateral (Documentos, Skills, Especialidades) + área de conteúdo
- Seleção de documento com `animate` Framer Motion — sem bug de congelamento
- Editor de documentos (SOUL.md, SKILL.md, RULES.md, System Prompt)
- Versionamento real com `EntityVersion` no banco
- Modal de histórico de versões com restauração

### Página Squad — COMPLETO (`/agentes/squad/[slug]`)
- Header com status, contagem de agentes, botões de ação
- Lista de agentes com remover (otimista)
- Modal "Adicionar agentes": grid de cards ticáveis com seleção múltipla + botão confirmar em batch
- Modal "Novo agente": cria e vincula ao squad automaticamente, navega para o agente criado
- Auto-draft: formulário salva rascunho no localStorage ao fechar sem submeter

### Modal "Criar novo squad" — COMPLETO
- Funcional na aba Squads Futuros
- Campos: nome, descrição, status (Ativo / Em breve / Planejado)
- Navega para a página do squad ao criar

### Correções de motion
- `animate` vs `style`: identificado e corrigido em todos os botões de seleção (status, squad)
- Menu lateral da página do agente: `animate={{ backgroundColor }}` — troca sem bug

### HubiaPortal — ADICIONADO (sessão anterior, agora mandatório)
- `src/components/ui/hubia-portal.tsx`
- Resolve bug de `backdrop-filter` limitado a sub-contêiner
- Obrigatório em todos os modais da plataforma

---

## Decisões pendentes

- Integrar agentes com API real (OpenAI / Anthropic) — quando features de UI estiverem completas
- Upload de avatar/logo — ainda URL manual

---

## Squads e disponibilidade

| Squad | Status | Observação |
|-------|--------|------------|
| Dev Squad | Ativo | Implementando Hubia |
| Audiovisual Squad | Ativo | Creator Ninaah ativa |
| Marketing Squad | Em breve | Estrutura criada no banco; UI pronta |
| CRM Squad | Planejado | Estrutura criada no banco; UI pronta |
| Social Media Squad | Planejado | Estrutura criada no banco; UI pronta |

---

## Componentes UI globais disponíveis

| Componente | Arquivo | Uso |
|-----------|---------|-----|
| `HubiaSelect` | `components/ui/hubia-select.tsx` | Substitui `<select>` nativo em toda plataforma |
| `HubiaToastProvider` + `toast.*` | `components/ui/hubia-toast.tsx` | Notificações globais (registrado no root layout) |
| `HubiaPortal` | `components/ui/hubia-portal.tsx` | **Obrigatório em modais** — backdrop blur full-screen |
| `HubiaModal` | `components/ui/hubia-modal.tsx` | Modal base 3 camadas |
| `SlidingTabs` | `components/ui/sliding-tabs.tsx` | Tabs com pill spring + variantes propagadas |
| `TabContent` | `components/ui/tab-content.tsx` | Conteúdo com animação direcional |
