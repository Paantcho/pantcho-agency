# Hubia — Plano: Creators e Próximas Páginas

Documento de referência para construção das páginas com visão de rotas, ações, interações e pontos onde APIs/agentes serão acionados. **Autoalimentado:** quando faltar um agente, criar (via Criador de Agentes), registrar em memória e seguir.

---

## Princípios

1. **Construir pensando em:** todas as rotas, possibilidades, ações, interações, cadastros (input/output), e **onde haverá conexão com API** (esses pontos = onde vários agentes serão acionados).
2. **APIs ainda não conectadas:** apenas identificar e documentar onde cada rota/action vai precisar de API; implementar conexão depois.
3. **Onde tem API = onde entram agentes:** ex.: reconhecer quem entra, operação de creators (audiovisual), geração de conteúdo, etc. Se faltar agente para alguma capacidade, criar (Criador de Agentes) e registrar em MEMORY que foi criado/adicionado.
4. **Fonte das telas:** Figma — todas as telas criadas lá; implementar de acordo.

---

## Creators — Mapa (rotas, ações, API/agentes)

### Figma — Telas Creators (uma por uma)

| # | Node ID | URL (modo dev) |
|---|---------|----------------|
| 1 | 7-422 | https://www.figma.com/design/LuXTz9U7A7dNgdOO5Vt50S/Prvc-agents?node-id=7-422&m=dev |
| 2 | 7-758 | https://www.figma.com/design/LuXTz9U7A7dNgdOO5Vt50S/Prvc-agents?node-id=7-758&m=dev |
| 3 | 7-1156 | https://www.figma.com/design/LuXTz9U7A7dNgdOO5Vt50S/Prvc-agents?node-id=7-1156&m=dev |
| 4 | 8-1721 | https://www.figma.com/design/LuXTz9U7A7dNgdOO5Vt50S/Prvc-agents?node-id=8-1721&m=dev |
| 5 | 8-2143 | https://www.figma.com/design/LuXTz9U7A7dNgdOO5Vt50S/Prvc-agents?node-id=8-2143&m=dev |
| 6 | 8-2544 | https://www.figma.com/design/LuXTz9U7A7dNgdOO5Vt50S/Prvc-agents?node-id=8-2544&m=dev |

Arquivo: `LuXTz9U7A7dNgdOO5Vt50S` (Prvc-agents). Usar esses nodes com get_design_context (clientLanguages: html,css — clientFrameworks: react,next.js) ao implementar cada tela.

### Rotas existentes

| Rota | Estado | Descrição |
|------|--------|-----------|
| `/creators` | ✅ Listagem do banco | Lista creators da org; botão "Novo creator"; cards com link para `/creators/[id]` |
| `/creators/novo` | 🔲 Placeholder | Formulário de criação (nome, slug, bio, avatar, isActive) → POST/Server Action |
| `/creators/[id]` | 🔲 Placeholder | Detalhe do creator: dados base + abas/seções para Appearance, Environments, Looks, Voice (conforme schema) |

### Ações e interações (a implementar)

- **Lista (/creators):** filtrar por ativo/inativo; ordenar; clique no card → detalhe; botão "Novo creator" → `/creators/novo`.
- **Novo (/creators/novo):** formulário (nome, slug, bio, avatarUrl, isActive); validação; submit → Server Action createCreator; redirect para `/creators/[id]` ou `/creators`.
- **Detalhe (/creators/[id]):** leitura do creator + relações (Appearance, Environments, Looks, Voice). Edição inline ou em abas. Ações: editar, desativar/ativar, (futuro) deletar.

### Onde haverá API / agentes (não conectar ainda — só marcar)

- **Creator como “quem entra” em pedidos/conteúdo:** ao associar creator a um pedido ou à geração de conteúdo, agentes do **Audiovisual Squad** (identidade, aparência, ambientes, voz) serão acionados. Rotas/features que usem creator para gerar prompt ou validar consistência → ponto de integração com agentes.
- **Upload de avatar/thumbnails:** Supabase Storage; não é “API de agente”, mas é integração externa.
- **Futuro:** geração de prompts a partir de Creator (Appearance, Voice) → API interna ou job que aciona Engenheiro de Prompts / Consistência.

Quando implementar essas integrações: acionar os agentes já existentes (audiovisual-squad); se faltar algum, criar via Criador de Agentes e registrar em MEMORY.

---

## Próximas páginas (após Creators)

Seguir mesma lógica: mapa de rotas → ações/interações → cadastros (input/output) → marcar onde haverá API/agentes. Telas conforme Figma. Ordem sugerida após Creators:

- Pedidos (listagem, novo, detalhe, status)
- Projetos (se aplicável)
- Outras telas do Figma na ordem definida no mapa do projeto

---

## Autoalimentação

- Sempre que for identificado que **falta um agente** para alguma capacidade (ex.: novo tipo de validação, novo provedor, novo fluxo): Orquestrador delega ao **Criador de Agentes**; após criação, **registrar em `memory/MEMORY.md`** (e em AGENTS.md já é feito pelo Criador) que o agente foi criado, onde está e para que serve. Assim o sistema se autoalimenta e os próximos ciclos já conhecem o novo agente.
