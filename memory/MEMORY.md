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

## Motion e Interação (Hubia) — SISTEMA COMPLETO E ENFORCEMENT ATIVO

- **Lei de motion:** `.cursor/rules/hubia-motion-enforcement.mdc` (`alwaysApply: true`) — documento definitivo e inviolável
- **Padrões detalhados:** `.cursor/rules/motion-interactions.mdc` (`alwaysApply: true`)
- **Regra global:** Framer Motion obrigatório para todos os componentes React animados. CSS keyframes apenas em `globals.css` para ícones SVG via `group-hover`.
- **Regras de cursor ativas:** `.cursor/rules/` contém 5 arquivos todos com `alwaysApply: true`:
  - `00-hubia-master.mdc` — índice mestre, lido primeiro
  - `hubia-design-system.mdc` — tokens, tipografia, cores, componentes, proibições
  - `motion-interactions.mdc` — motion system completo
  - `figma-fidelity-supreme.mdc` — regra suprema pixel-perfect ao Figma
  - `hubia-motion-enforcement.mdc` — **LEI DE MOTION** (nova, mais específica): checklist pré-entrega, 10 proibições, padrões exatos de código para cada tipo de elemento

### Padrões definitivos de motion (nunca mudar sem atualizar regra)

**Botão primário/secundário/ghost:**
```tsx
<motion.button
  whileHover={{ scale: 1.03, backgroundColor: /* tom mais claro */ }}
  whileTap={{ scale: 0.96 }}
  transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
>
```

**Botão icon-only:**
```tsx
whileHover={{ scale: 1.12 }} / whileTap={{ scale: 0.90 }}
```

**Sidebar — pill spring:**
```
stiffness: 380, damping: 28, mass: 1
Hover areia nos inativos: rgba(213,210,201,0.4) — hex #D5D2C9
```

**Tabs — pill spring:**
```
stiffness: 420, damping: 30, mass: 0.8
Hover areia nos inativos: rgba(213,210,201,0.35)
whileTap: scale 0.97
```

**Modal — 3 camadas (inviolável):**
```
Camada 1: overlay rgba(14,15,16,0→0.70) + blur 0→12px, 250ms ease-dec
Camada 2: scale 0.88→1, y 20→0, opacity 0→1, 280ms ease-dec
Camada 3: botão X whileHover rotate 90° scale 1.1
AnimatePresence obrigatório — NUNCA if(!open) return null
```

**Cards — stagger obrigatório:**
```tsx
delay: Math.min(i * 0.06, 0.3)
initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}
```

**Dropdown:**
```tsx
AnimatePresence + initial={{ opacity: 0, y: -6, scale: 0.96 }}
NUNCA: {open && <div>} sem AnimatePresence
NUNCA: shadow-* (flat design)
```

### Componentes de motion reutilizáveis
- **`SlidingTabs`** (`hubia-app/src/components/ui/sliding-tabs.tsx`) — tabs com pill spring + hover areia
- **`TabContent`** (`hubia-app/src/components/ui/tab-content.tsx`) — conteúdo com animação direcional
- **`HubiaModal`** (`hubia-app/src/components/ui/hubia-modal.tsx`) — modal com 3 camadas obrigatórias + AnimatePresence
- **`Button`** (`hubia-app/src/components/ui/button.tsx`) — MotionButton com whileHover/whileTap (asChild preservado)
- **`KpiCards` / `PedidosPrioritariosCards`** (`dashboard-motion.tsx`) — Client Components com stagger

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
- **Rollback sempre disponível:** usuário usa `git checkout --` para reverter sessões. Nunca commitar sem consolidar memória.
- **Não implementar sem aprovação:** animações novas (ex.: spring na pill) precisam de confirmação visual antes de commitar.

## Visão de Longo Prazo
- Novos squads: marketing, financeiro, CRM, social media
- Dashboard visual de gestão (projeto futuro)
- Bot Telegram (projeto futuro)
