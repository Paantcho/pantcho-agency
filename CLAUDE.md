# CLAUDE.md — Briefing Permanente do Dev Squad

## Sobre o Projeto
Hubia é uma plataforma SaaS multi-tenant da Pantcho Agency.
Stack: Next.js 15, TypeScript, Tailwind, Shadcn/UI, Supabase, Prisma, Vercel.
App em: hubia-app/ nesta pasta.
Idioma: Português brasileiro em todos os outputs.

## Documentos Obrigatórios (ler SEMPRE antes de agir)
- AGENTS.md — arquitetura de squads e agentes
- RULES.md — regras invioláveis de execução
- memory/WORKING.md — tarefa ativa e estado do projeto
- memory/MEMORY.md — decisões e preferências do usuário
- memory/README.md — protocolo de memória e ciclo de consolidação
- directives/hub-construcao-orquestracao.md — processo de construção e orquestração
- PRD-v4.md — requisitos completos do produto (se existir)
- BACKLOG-delivery-v1.md — épicos e plano de entrega (se existir)
- directives/hubia-plano-creators-proximas-paginas.md — plano Creators e próximas páginas (rotas, ações, onde API/agentes entram; autoalimentado)

## Figma
- Chave do arquivo: LuXTz9U7A7dNgdOO5Vt50S
- MCP disponível: figma-developer-mcp (claude.ai Figma)
- Sempre usar get_design_context com clientLanguages: html,css e clientFrameworks: react,next.js
- **Nodes gerais:** 11:5848 (color system), 11:4292 (Limão palette), 9:79
- **Creators (6 telas):** 7:422, 7:758, 7:1156, 8:1721, 8:2143, 8:2544 — ver URLs em directives/hubia-plano-creators-proximas-paginas.md

## Regras de Design (INVIOLÁVEIS)
- 100% flat — zero  elementos UI
- Tipografia exclusiva: Urbanist (Bold, SemiBold, Regular)
- Cor primária: Limão-500 #D7FF00 / Ink-500 #0E0F10
- Modais: dark blur overlay (rgba 70% + backdrop-filter blur 12px)
- Sidebar: flat, sem submenus aninhados — navegação interna por tabs
- **Componentes e elementos visuais:** seguir o documento de Design System (ex.: Design System V5.html). O guia de motion NÃO substitui esse documento.
- **Motion, animações e interações:** usar **apenas** `directives/HUBIA-Motion-Guide.html`. Esse documento é exclusivo para: animações, easings, durações, hover/focus, como modais abrem e fecham, transições, microinterações. **Todos** os agentes devem consultá-lo ao trabalhar com motion ou interação. O profissional responsável por deixar a interface fluida, gostosa e elegante nesse aspecto é o agente **Motion & Interação** (Dev Squad).
- Animações: sutis e fluidas, Material Design 3 motion principles.

## Multi-Tenancy (OBRIGATÓRIO)
- organization_id em todas as queries — sem exceção
- RLS no Supabase em todas as tabelas
- API keys sempre criptografadas, nunca plaintext
- Três camadas: agência interna / usuários individuais / enterprise white-label

## Segurança
- NUNCA expor chaves de API em código
- .env.local SEMPRE no .gitignore
- Validação server-side com Zod em toda API route

## Ciclo de Trabalho
PLAN → EXECUTE → REFLECT
Nunca entregar sem revisar. Pergunta antes de agir se houver dúvida.
