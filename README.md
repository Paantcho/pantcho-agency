# Pantcho Agency

Sistema multi-agente organizado por squads com skills sob demanda, subagents temporários e memória compartilhada.

## Visão

Uma agência completa de agentes IA onde cada squad é um departamento especializado. O Orquestrador é o cérebro central — recebe qualquer pedido, identifica o squad correto, e coordena a execução com qualidade enterprise.

## Squads Ativos

| Squad | Função | Status |
|-------|--------|--------|
| `dev-squad` | Desenvolvimento web, mobile, desktop | ✅ Ativo |
| `audiovisual-squad` | Criação de conteúdo visual para creators | ✅ Ativo |

## Squads Planejados

| Squad | Função |
|-------|--------|
| `marketing-squad` | Copywriting, SEO, estratégia de conteúdo |
| `finance-squad` | Financeiro, relatórios, controle |
| `crm-squad` | Relacionamento, atendimento, follow-up |

## Como Funciona

1. Pedido chega ao **Orquestrador**
2. Orquestrador lê `AGENTS.md` → identifica o squad
3. Orquestrador lê `memory/WORKING.md` → entende o contexto atual
4. Delega ao squad com briefing completo
5. Squad carrega as skills necessárias (só as necessárias)
6. Squad executa → retorna resultado
7. Orquestrador atualiza memória → entrega ao usuário

## Princípios

- **Memória é arquivo** — ler antes de agir, escrever depois de agir
- **Skills sob demanda** — carregar só o que precisa (≤40% contexto)
- **Subagents para trabalho pesado** — contexto isolado, retorna só resumo
- **Nunca assumir** — se falta info, perguntar
- **Qualidade enterprise** — nível Apple/Anthropic em tudo

## Estrutura

```
pantcho-agency/
├── RULES.md              ← Regras invioláveis (todos leem)
├── AGENTS.md             ← Mapa de todos os squads e agentes
├── CONNECTORS.md         ← Conexões externas (Figma, GitHub, Vercel)
├── CHANGELOG.md          ← Histórico de versões
│
├── dev-squad/            ← Departamento de desenvolvimento
├── audiovisual-squad/    ← Departamento audiovisual
│
├── memory/               ← Memória compartilhada entre todos os squads
│   ├── WORKING.md        ← Tarefa atual
│   ├── MEMORY.md         ← Decisões de longo prazo
│   └── LESSONS.md        ← Lições aprendidas
│
└── directives/
    └── visao-estrategica.md
```

## Stack Padrão (Dev Squad)

Next.js 15 · TypeScript · Tailwind · Shadcn/UI · Supabase · Prisma · Vercel · Figma MCP

## Referências

Eli Rigobelli · Bhanu Teja · Christian Barbosa · El Pires · Tech Leads Club · Anthropic
