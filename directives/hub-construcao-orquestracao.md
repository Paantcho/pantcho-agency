# Hub — Processo de Construção e Orquestração

Documento mestre do **processo de construção** do Pantcho Agency Hub: como o Orquestrador e os agentes trabalham com visão completa do projeto, memória consolidada e criação de novos agentes quando necessário.

---

## 1. Visão completa do projeto

- Todo **projeto ativo** tem um **mapa** com:
  - Todas as funcionalidades
  - **Todas as rotas** (páginas, entrada em cada página, ações principais, para onde cada ação leva)
  - Fluxos críticos (ex.: login → dashboard → config)
  - Próximos passos e ordem de entrega

- **Onde fica o mapa:** em `memory/WORKING.md` (seção dedicada) ou em arquivo referenciado (ex.: `directives/[projeto]-mapa.md`). Sempre referenciado no WORKING e, quando relevante, em STATUS.

- **Template do mapa:** `agents/orquestrador/MAPA-PROJETO-TEMPLATE.md`

- **Quem mantém:** Orquestrador exige e mantém; qualquer agente que atue no projeto pode criar ou atualizar o mapa na primeira vez.

---

## 2. Orquestrador

- **Local:** `agents/orquestrador/SOUL.md`
- **Função:** CEO. Classifica, contextualiza, delega e valida. Nunca faz trabalho operacional.
- **Protocolo:** Ler WORKING, MEMORY, STATUS → BrainRouter → Se não existir agente para o tipo de trabalho → delegar ao **Criador de Agentes** → Delegar com briefing completo (BRIEFING-TEMPLATE) incluindo mapa do projeto → Acompanhar checkpoints → Validar entrega → **Ciclo de consolidação** (atualizar WORKING + MEMORY + STATUS).

- **Templates:**  
  - `agents/orquestrador/BRIEFING-TEMPLATE.md` — briefing de delegação  
  - `agents/orquestrador/MAPA-PROJETO-TEMPLATE.md` — mapa de rotas e fluxos

---

## 3. Agentes profissionais (sênior+)

- Todos os agentes profissionais têm **nível sênior+**: entendem o projeto como um todo, leem o mapa quando a tarefa for ligada a um projeto ativo, conversam entre si via memória (handoffs, "Entregue para X", "Falta: …"), e mantêm previsibilidade (próximos passos visíveis).

- **Comunicação entre agentes:** regra em RULES.md (seção 4.1): ao terminar bloco que outro usa → atualizar WORKING com "Entregue para [X]"; ao detectar lacuna → registrar "Falta:" ou "Preciso de decisão".

---

## 4. Criador de Agentes

- **Local:** `dev-squad/agents/criador-de-agentes/SOUL.md`
- **Quando acionado:** Orquestrador detecta que o pedido exige um tipo de profissional que **não existe** em AGENTS.md (ex.: motion design system, CRM, marketing) e delega ao Criador com briefing "criar agente para [X]".

- **Fluxo do Criador:**  
  1. Ler MEMORY, AGENTS, RULES  
  2. Entender qual capacidade está faltando  
  3. **Pesquisar na web** (perfil do profissional, responsabilidades, boas práticas)  
  4. Criar SOUL + SKILL(s) seguindo templates e diretriz Anthropic (`directives/diretriz-anthropic-skills-agents.md`)  
  5. Registrar em AGENTS.md e, se aplicável, no mapa do projeto (em que etapa da cadeia o agente entra)  
  6. **Registrar na memória** onde o novo agente acha contexto do Hub: CLAUDE.md, CONNECTORS.md, RULES.md, AGENTS.md, VERSIONING.md  
  7. Atualizar MEMORY.md

---

## 5. Memória e consolidação

- **Arquivos:** WORKING.md (tarefa ativa), MEMORY.md (decisões macro), STATUS.md (resumo consolidado), LESSONS.md (erros e lições). Detalhes: `memory/README.md`.

- **Ciclo de consolidação:** a cada fim de ciclo (entrega de etapa, fim de sessão ou quando o Orquestrador determinar): ler WORKING e contexto → condensar → atualizar MEMORY e STATUS → deixar WORKING enxuto. Assim todos têm visão atualizada e não há buracos de comunicação. Regra em RULES.md (seção 1.1).

---

## 6. Squads atuais e previstos

- **Ativos:** Dev Squad (qualquer tipo de app: web, mobile, landing, sistema interno; + Criador de Agentes), Audiovisual Squad.
- **Previstos (estrutura deve suportar, não implementados ainda):** Marketing, Finanças, CRM, Social media, outros. Quando um pedido exigir profissional inexistente, Orquestrador roteia para o Criador de Agentes. Ver AGENTS.md.

---

## 7. Checklist de implementação

- [x] memory/README.md — protocolo de memória e consolidação  
- [x] memory/STATUS.md — resumo consolidado  
- [x] agents/orquestrador — SOUL, BRIEFING-TEMPLATE, MAPA-PROJETO-TEMPLATE  
- [x] RULES.md — ciclo de consolidação + comunicação entre agentes  
- [x] dev-squad/agents — Desenvolvimento e Criador de Agentes (SOULs atualizados)  
- [x] AGENTS.md — squads previstos e roteamento para Criador de Agentes  
- [x] directives/diretriz-anthropic-skills-agents.md — referência Anthropic (Skill Creator, anthropics/skills)  
- [x] directives/hub-construcao-orquestracao.md — este documento
