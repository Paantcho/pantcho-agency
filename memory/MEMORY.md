# MEMORY.md — Memória de Longo Prazo

Lido por TODOS os agentes ANTES de qualquer ação.
Atualizado quando há decisão importante, preferência nova, ou lição aprendida.

---

## Sobre o Usuário
- Diretor de arte / Designer
- Trabalha primariamente no Figma
- Não é desenvolvedor — precisa de explicações acessíveis
- Prioriza qualidade visual e fidelidade ao design
- Objetivo: criar aplicações e conteúdo sem depender de equipe humana
- Padrão de qualidade: nível Apple / Anthropic / ChatGPT

## Arquitetura do Sistema
- **Repositório:** `Paantcho/pantcho-agency` (GitHub, privado)
- **Estrutura:** Squads independentes sob a mesma agência
- **Squads ativos:** dev-squad, audiovisual-squad. **Squads previstos:** marketing, finanças, CRM, social media (estrutura suporta; criar via Criador de Agentes quando necessário)
- **Memória:** compartilhada em `memory/` (WORKING, MEMORY, STATUS, LESSONS). Ciclo de consolidação: ver `memory/README.md`
- **Mapa do projeto:** todo projeto ativo tem mapa de rotas/fluxos (template em `agents/orquestrador/MAPA-PROJETO-TEMPLATE.md`)
- **Regra de contexto:** máximo 40% da janela ocupada
- **Skills:** sob demanda; formato alinhado a Agent Skills (Anthropic). Diretriz: `directives/diretriz-anthropic-skills-agents.md`

## Stack Padrão (Dev Squad)
Next.js 15+ / TypeScript / Tailwind / Shadcn / Supabase / Prisma / Vercel / Figma MCP

## Motion e Interação (Hubia)
- **Documento único para motion:** `directives/HUBIA-Motion-Guide.html` — apenas animações, easings, durações, hover/focus, modais, transições. Componentes e elementos visuais vêm do Design System (outro documento). Todos os agentes devem consultar o Motion Guide ao trabalhar com motion ou interação.
- **Agente responsável:** Motion & Interação (dev-squad) — especialista que deixa a interface fluida, gostosa e elegante nesse aspecto.

## Modal — Padrão da plataforma inteira (Hubia)
- **Regra global:** Em **toda** a plataforma, qualquer modal de criar/editar/ver segue o mesmo padrão.
- **Comportamento:** Overlay **full-screen** (tela inteira), com **blur** no fundo e caixa de conteúdo centralizada. O overlay cobre sidebar e tudo (renderizado em portal no `body`).
- **Componente:** `hubia-app/src/components/ui/hubia-modal.tsx` — usar sempre este componente; não criar modais ad-hoc.
- **Conteúdo do modal:** Título no topo; **botão X** no canto superior direito para fechar; dentro da caixa: formulário, texto (copy), ou qualquer conteúdo. Ações no rodapé conforme o caso: **Salvar**, **Cancelar**, **Copiar** (ou outras), sempre no DS Hubia (Limão, bordas, sem UI de sistema).
- **Nunca:** modal que ocupa só parte da tela, fundo branco sem blur, ou diálogos nativos (alert/confirm).

## Construção de páginas Hubia (autoalimentado)
- **Plano:** `directives/hubia-plano-creators-proximas-paginas.md` — construir páginas (começando por Creators) com mapa de rotas, ações, interações, cadastros; marcar onde haverá API e onde agentes serão acionados; APIs não conectar ainda. Telas conforme Figma.
- **Onde tem API = onde entram agentes** (ex.: creator em pedidos → audiovisual-squad). Se faltar agente para alguma capacidade: criar via Criador de Agentes, registrar em AGENTS.md (Criador já faz) e **registrar em MEMORY** que o agente foi criado/adicionado e para que serve — sistema autoalimentado.

## Creators Ativas (Audiovisual Squad)
- **Ninaah Dornfeld** — `audiovisual-squad/memory/creators/ninaah/`

## Referências Estudadas
- Eli Rigobelli: plugins Claude (skills, commands, agents)
- Bhanu Teja: Mission Control (SOUL.md, memória em camadas)
- Christian Barbosa: BrainRouter (detecção, classificação)
- El Pires: Framework DOE
- Tech Leads Club: skills sob demanda, 40% context, subagents
- Anthropic frontend-design: anti-AI-slop, design thinking
- System Prompts (Cursor/Devin/v0): plan-execute-reflect, resolve-before-returning

## Preferências do Usuário
- Comunicação em português BR
- Tom profissional mas acessível
- Nomes criativos para agentes (ainda não definidos)

## Visão de Longo Prazo
- Novos squads: marketing, financeiro, CRM, social media
- Dashboard visual de gestão (projeto futuro)
- Bot Telegram (projeto futuro)
