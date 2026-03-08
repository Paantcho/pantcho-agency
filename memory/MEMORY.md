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
- **Documento único para motion:** `.cursor/rules/motion-interactions.mdc` (`alwaysApply: true`) — Framer Motion obrigatório para React, CSS keyframes só para ícones SVG em globals.css. Sidebar pill, tabs pill, transições de página, cards stagger, accordions, modais 3 camadas, toasts, animações de ícone por item da sidebar.
- **Regras de cursor ativas:** `.cursor/rules/` contém 4 arquivos todos com `alwaysApply: true`:
  - `00-hubia-master.mdc` — índice mestre, lido primeiro
  - `hubia-design-system.mdc` — tokens, tipografia, cores, componentes, proibições
  - `motion-interactions.mdc` — motion system completo, Framer Motion, stagger, modais 3 camadas
  - `figma-fidelity-supreme.mdc` — regra suprema pixel-perfect ao Figma

## Modal — Padrão da plataforma inteira (Hubia)
- **Regra global:** Em **toda** a plataforma, qualquer modal de criar/editar/ver segue o mesmo padrão.
- **Comportamento:** Overlay **full-screen** (tela inteira), com **blur** no fundo e caixa de conteúdo centralizada. O overlay cobre sidebar e tudo (renderizado em portal no `body`).
- **Componente:** `hubia-app/src/components/ui/hubia-modal.tsx` — usar sempre este componente; não criar modais ad-hoc.
- **Conteúdo do modal:** Título no topo; **botão X** no canto superior direito para fechar; dentro da caixa: formulário, texto (copy), ou qualquer conteúdo. Ações no rodapé conforme o caso: **Salvar**, **Cancelar**, **Copiar** (ou outras), sempre no DS Hubia (Limão, bordas, sem UI de sistema).
- **Nunca:** modal que ocupa só parte da tela, fundo branco sem blur, ou diálogos nativos (alert/confirm).
- **Botão X:** fundo `#0E0F10`, hover `rgba(62,63,64,0.85)` (cinza visível), active preto sólido + scale(0.94). **Nunca** usar `--state-hover` (amarelo) em botões escuros — fica invisível.

## Construção de páginas Hubia (autoalimentado)
- **Plano:** `directives/hubia-plano-creators-proximas-paginas.md` — construir páginas (começando por Creators) com mapa de rotas, ações, interações, cadastros; marcar onde haverá API e onde agentes serão acionados; APIs não conectar ainda. Telas conforme Figma.
- **Onde tem API = onde entram agentes** (ex.: creator em pedidos → audiovisual-squad). Se faltar agente para alguma capacidade: criar via Criador de Agentes, registrar em AGENTS.md (Criador já faz) e **registrar em MEMORY** que o agente foi criado/adicionado e para que serve — sistema autoalimentado.

## Cards de Creator — Padrão visual (Hubia)
- **Layout:** fullbleed — foto ocupa 100% do card (`position: absolute; inset: 0`), gradiente overlay escuro, conteúdo sobre o gradiente.
- **Grid:** `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`, `aspectRatio: 3/4` — mesmo tamanho da Look Library.
- **Conteúdo do card (ordem obrigatória):**
  1. Tag Ativa/Inativa (canto superior esquerdo, pílula preta, texto Limão)
  2. Nome da creator — Urbanist Bold, Limão, `lineHeight: 1.1`, `fontSize: clamp(18px,1.8vw,24px)`
  3. Idade — linha separada, branco 75%, `fontSize: 12px`
  4. Cidade, Estado — linha separada, branco 75%, `fontSize: 12px`
  5. Tags de plataformas — pílulas escuras com backdrop-blur, texto Limão, vindas de `metadata.platforms`
- **Hover:** parallax zoom `scale-[1.12]` apenas na imagem internamente — card não se move.
- **Dados estruturados:** cidade, estado, idade e plataformas ficam em `metadata` (JSON) do modelo Creator — nunca parsear do `bio`.

## Fidelidade ao Figma — Regra Suprema
- **Regra em `.cursor/rules/figma-fidelity-supreme.mdc`** (`alwaysApply: true`): quando o usuário anexar imagem ou indicar node Figma, implementar pixel a pixel — zero invenção, zero suposição, zero simplificação sem autorização.
- **Checklist obrigatório:** tipografia, cores (hex exato), espaçamentos, border-radius, hierarquia, estados, layout, conteúdo, interações — tudo extraído da referência antes de codificar.
- **Hex direto > tokens Tailwind** quando necessário para pixel-perfect: usar `style={{ color: "#..." }}` sem hesitar.

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
