# AGENTS.md — Mapa de Operações e Roteamento

Lido pelo Orquestrador e por líderes de Squad para compreender a topologia do Hub, os departamentos disponíveis e o fluxo de delegação.

---

## 1. Topologia do Pantcho Agency Hub

```text
ORQUESTRADOR GLOBAL (CEO) 
📍 Local: agents/orquestrador/SOUL.md
│
├── DEV SQUAD (Engenharia & Sistemas)
│   📍 Local: dev-squad/
│   ├── Agente: Desenvolvimento (Full-stack, QA, Segurança) — qualquer tipo de app: web, mobile (Android/Apple), landing, sistema interno, etc.
│   ├── Agente: Motion & Interação — apenas motion, animações e interações (hover, focus, modais, transições); consulta directives/HUBIA-Motion-Guide.html; deixa a interface fluida e elegante
│   └── Agente: Criador de Agentes (Fábrica de novos squads/agentes quando não existir especialista)
│
├── AUDIOVISUAL SQUAD (Creators & Estúdio)
│   📍 Local: audiovisual-squad/
│   ├── Agente: Planner de Conteúdo
│   ├── Agente: Copywriter
│   ├── Agente: Diretor de Arte
│   ├── Agente: Diretor de Cena
│   ├── Agente: Especialista em Consistência (Validação Forense)
│   └── Agente: Engenheiro de Prompts
│
└── SQUADS PREVISTOS (não implementados ainda — estrutura deve suportar)
    Marketing · Audiovisual (expandido) · Finanças · CRM · Social media · Outros
```

Quando um pedido exige um tipo de profissional que **não existe** em nenhum squad (ex.: motion design system, CRM, analista financeiro), o Orquestrador delega ao **Criador de Agentes** (Dev Squad), que pesquisa, cria o agente e as skills e integra na cadeia.
