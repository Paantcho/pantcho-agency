# CHANGELOG

## v3.1.0 — Processo de construção e orquestração
- **Memória macro:** `memory/README.md` (protocolo), `memory/STATUS.md` (resumo consolidado), ciclo de consolidação em RULES.md §1.1
- **Orquestrador:** visão completa do projeto (mapa de rotas/fluxos), `BRIEFING-TEMPLATE.md`, `MAPA-PROJETO-TEMPLATE.md`, BrainRouter para "não existe agente → Criador de Agentes"
- **Agentes sênior+:** Desenvolvimento lê mapa do projeto e faz handoffs; RULES.md §4.1 comunicação entre agentes
- **Criador de Agentes:** pesquisa na web, registra na memória (CLAUDE, CONNECTORS, RULES, AGENTS, VERSIONING), integra na cadeia
- **AGENTS.md:** squads previstos (marketing, finanças, CRM, etc.) e roteamento para Criador de Agentes
- **Directives:** `hub-construcao-orquestracao.md`, `diretriz-anthropic-skills-agents.md` (referência Skill Creator e anthropics/skills)
- CLAUDE.md, MEMORY.md e pantcho-agency-hub-OS atualizados para nova estrutura

## v3.0.0 — Reorganização para Pantcho Agency
- Migração de `dev-squad` isolado → `pantcho-agency` com múltiplos squads
- Criação do `audiovisual-squad` com 6 agentes e 9 skills
- Adição de `memory/LESSONS.md` (Self-Improvement Loop)
- Integração dos princípios de Workflow Orchestration (Plan Node Default, Subagent Strategy, Autonomous Bug Fixing)
- Princípio "Verification Before Done" adicionado ao ciclo de QA
- Estrutura de `memory/creators/` para documentação forense de creators

## v2.1.0 — Melhorias baseadas em system prompts reais
- Ciclo Plan-Execute-Reflect obrigatório (Cursor/Devin)
- Nova skill: PRD adaptativa por tipo de projeto
- Upgrade skill Frontend: design thinking, anti-AI-slop, estética
- Regra "Resolve Before Returning"
- PRD obrigatório antes de qualquer projeto novo

## v2.0.0 — Reorganização da Arquitetura
- Migração de agentes individuais → departamentos com skills sob demanda
- Subagents temporários
- Front matter em todas as skills
- Regra de 40% de contexto
- Protocolo obrigatório de memória
- RULES.md separado

## v1.0.0 — Estrutura Inicial
- 7 agentes individuais com SOUL.md
- 5 skills
- 4 comandos
- Sistema de memória (WORKING.md + MEMORY.md)
