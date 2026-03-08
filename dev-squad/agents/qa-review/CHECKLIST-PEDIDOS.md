# CHECKLIST-PEDIDOS.md — Auditoria Específica da Página de Pedidos

**Gerado após sprint:** Reconstrução completa da página Pedidos (março 2026)
**Arquivo principal:** `hubia-app/src/app/(dashboard)/pedidos/pedidos-client.tsx`
**Arquivo detalhe:** `hubia-app/src/app/(dashboard)/pedidos/[id]/pedido-detail-client.tsx`

---

## Checklist de Funcionalidades

### Página principal (`/pedidos`)

#### Header
- [ ] Botão "Novo Pedido" tem exatamente 1 ícone `<Plus>` e o texto "Novo Pedido" (sem `+` duplicado)
- [ ] Toggle de views (Kanban | Calendário | Lista) tem pill animada que desliza corretamente
- [ ] Pill usa `motion.div` com `type: "spring"`, não `transition-all`
- [ ] Views mudam com AnimatePresence `mode="wait"`

#### Visão Kanban
- [ ] 5 colunas visíveis: Backlog / Em Progresso / Revisão / Aprovado / Concluído
- [ ] Cada coluna mostra contador de cards no cabeçalho
- [ ] Coluna "Backlog" tem botão "+ Novo Pedido" (com 1 ícone `<Plus>`, sem texto `+`)
- [ ] Cards aparecem com stagger (`delay: Math.min(i * 0.04, 0.2)`)
- [ ] Cards têm borda vermelha se urgência = `critica`
- [ ] Cards têm borda laranja se urgência = `alta`
- [ ] Cards mostram: badge squad (AUDIOVISUAL/DEV), número `#XXX`, título, tags
- [ ] Cards têm `whileHover={{ y: -3 }}` + `whileTap={{ scale: 0.98 }}`
- [ ] Clicar no card abre o **modal de detalhe** (não navega para nova página)
- [ ] Com dados do seed: pelo menos 3-4 cards visíveis nas colunas

#### Visão Calendário
- [ ] Grade mensal visível com 7 colunas (Dom–Sáb)
- [ ] Dia atual destacado com fundo `#D7FF00`
- [ ] Eventos do mês aparecem como pílulas coloridas por tipo
- [ ] Clicar num evento abre o modal de detalhe
- [ ] Navegação entre meses funciona (← →)

#### Visão Lista
- [ ] Cada pedido em uma linha com: badge tipo, título, creator (se houver), status badge, data
- [ ] Clicar no item abre o modal de detalhe
- [ ] Empty state visível se lista estiver vazia

### Modal de detalhe do pedido

- [ ] Overlay com `backdrop-filter: blur(12px)` + `rgba(14,15,16,0.70)`
- [ ] Container anima com `scale 0.88→1` + `y 20→0`
- [ ] Botão X anima `rotate 90°` no hover
- [ ] 4 KPI cards animados: Progresso, Tarefas, Posts/Módulos, Imagens/Telas
- [ ] Barra de progresso anima de 0% ao valor real
- [ ] Tabs dinâmicas por tipo:
  - `landing_page/app/site/sistema` → Visão Geral, Arquitetura, Tarefas, Decisões, Deploy, Timeline
  - `imagem/video` → Visão Geral, Briefing, Referências, Aprovação, Entrega
  - `creator` → Visão Geral, Planejamento, Posts, Aprovação, Publicação
- [ ] Pill de tabs desliza com spring
- [ ] Tab "Visão Geral" mostra briefing resumido + decisões recentes
- [ ] Tab de tarefas mostra lista com checkboxes (verde se concluído)
- [ ] Botão "Abrir pedido completo" navega para `/pedidos/[id]`
- [ ] Fechar modal não exibe toast "Rascunho salvo"
- [ ] Usar `HubiaPortal` (backdrop cobre toda a tela)
- [ ] Usar `AnimatePresence` (não `if (!open) return null`)

### Modal "Novo Pedido"

- [ ] Campos: Título, Descrição, Tipo, Urgência, Creator, Projeto, Data de entrega
- [ ] Selects usam `HubiaSelect` (não `<select>` nativo)
- [ ] Fechar sem submeter salva rascunho em localStorage silenciosamente
- [ ] Nenhum toast ao fechar sem submeter
- [ ] Toast de sucesso: "Pedido criado com sucesso!" (após submit)
- [ ] Após criar, abre o modal de detalhe do novo pedido

### Página de detalhe (`/pedidos/[id]`)

- [ ] Breadcrumb: "Pedidos / [título]"
- [ ] Header com KPIs (mesmos 4 do modal)
- [ ] Barra de progresso animada
- [ ] Status flow clicável (muda status ao clicar)
- [ ] Tabs por tipo (mesmo mapeamento do modal)
- [ ] Coluna lateral: Detalhes, Creator, Projeto com `HubiaSelect`
- [ ] Página não dá 404 para pedidos do seed

---

## Bugs conhecidos resolvidos neste sprint

| Bug | Status | Arquivo |
|-----|--------|---------|
| Duplo `+` no botão "Novo Pedido" | ✅ Resolvido | `pedidos-client.tsx` linha ~193 |
| Toast "Rascunho salvo" ao fechar modal | ✅ Resolvido | `pedidos-client.tsx` `handleClose()` |
| Página vazia sem dados | ✅ Resolvido | `prisma/seed.ts` — 11 pedidos, 3 projetos, 2 creators |
| Modal sem detalhe dinâmico por tipo | ✅ Resolvido | Novo `PedidoDetalheModal` com tabs por tipo |

---

## Próximos itens a verificar (fora do escopo deste sprint)

- [ ] Outras páginas: Projetos, Memória, Conhecimento, Relatório
- [ ] Sidebar: pill animada funcionando em todas as rotas
- [ ] Config/Segurança: checklist de RLS e API keys
- [ ] Autenticação: Google Login funcionando em produção
- [ ] Supabase Storage: buckets criados
