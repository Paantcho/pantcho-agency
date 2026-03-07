# memory/ — Memória Compartilhada do Hub

Todos os squads e agentes leem e atualizam esta pasta. É a **fonte única de verdade** para estado atual, decisões e lições.

---

## Arquivos

| Arquivo | Função |
|---------|--------|
| **WORKING.md** | Tarefa ativa, estado do projeto, próximos passos. Contexto de curto prazo. |
| **MEMORY.md** | Decisões de longo prazo, stack, preferências, arquitetura. Memória **macro** estável. |
| **STATUS.md** | Resumo consolidado: andamento de todos os projetos e squads. Atualizado no ciclo de consolidação. |
| **LESSONS.md** | Erros e correções. Loop de auto‑melhoria. |

---

## Memória macro

- **MEMORY.md** = memória macro de longo prazo (decisões, preferências, referências).
- **STATUS.md** = snapshot consolidado do andamento (projetos ativos, concluídos, próximos passos). Evita buracos de comunicação entre agentes.

---

## Ciclo de consolidação (OBRIGATÓRIO)

**Quando:**  
- Ao fechar um ciclo de trabalho (entrega de etapa, fim de sessão, ou a cada N tarefas concluídas).  
- O Orquestrador pode acionar consolidação explícita (ex.: comando `/consolidar-memoria` ou ao validar entrega).

**Quem:** Orquestrador (ou agente que encerra a cadeia).

**Passos:**

1. **Ler** `WORKING.md` e contexto atual da tarefa/projeto.
2. **Condensar** em resumo: o que foi feito, decisões tomadas, próximos passos, bloqueios.
3. **Atualizar** `MEMORY.md` com decisões estáveis (arquitetura, stack, preferências).
4. **Atualizar** `STATUS.md` com andamento de todos os projetos e squads.
5. **Deixar** `WORKING.md` enxuto para a próxima tarefa (próximos passos claros, sem ruído).

Assim todos os agentes têm visão atualizada do andamento e ninguém fica sem contexto.

---

## Protocolo de leitura (todos os agentes)

Antes de qualquer ação:

1. Ler `memory/WORKING.md`
2. Ler `memory/MEMORY.md`
3. Ler `memory/LESSONS.md`
4. Se tarefa ligada a projeto ativo: ler mapa do projeto (em WORKING ou referenciado em MEMORY/STATUS)

---

## Protocolo de escrita (todos os agentes)

Depois de qualquer ação:

1. Atualizar `memory/WORKING.md` com status e próximos passos
2. Se decisão estável: gravar em `memory/MEMORY.md`
3. Se erro/lição: gravar em `memory/LESSONS.md`

Nunca confie apenas no contexto da conversa; informação vital deve estar em arquivo Markdown.
