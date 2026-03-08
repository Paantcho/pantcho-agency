# LESSONS.md — Lições Aprendidas

Atualizado após QUALQUER correção do usuário.
Lido no início de sessões relevantes.

---

## Como Usar
Quando o usuário corrigir algo:
1. Identificar o padrão do erro
2. Escrever uma regra que previne a repetição
3. Adicionar aqui com data

---

## Lições

### Prisma 7 — Mudanças Críticas (2026-03-07)
1. **URL fora do schema:** `datasource` no `schema.prisma` não aceita mais `url`/`directUrl`. Usar `prisma.config.ts` com `datasource: { url }`.
2. **Engine client-side:** `PrismaClient()` sem argumentos falha. Requer `adapter` (ex: `@prisma/adapter-pg`) ou `accelerateUrl`.
3. **Config path:** Prisma não auto-detecta `prisma.config.ts` dentro de `prisma/`. Passar `--config prisma/prisma.config.ts` nos comandos CLI.
4. **`.env.local` não é lido:** Prisma lê `.env` por padrão. Usar `dotenv.config()` explícito no `prisma.config.ts` apontando para `.env.local`.
5. **Shadow database:** `migrate dev` precisa de shadow DB. Supabase hosted não permite. Usar `db push` em vez de `migrate dev`.
6. **Seed com adapter:** O seed precisa do mesmo adapter-pg pattern. Usar `DIRECT_URL` (porta 5432) para operações DDL e seed.

---

### Framer Motion — `style` vs `animate` para valores dinâmicos (2026-03-08)

**Erro:** Usar `style={{ background: isActive ? "#0E0F10" : "transparent" }}` em `motion.button` que também tem `whileHover`.

**Sintoma:** O background troca corretamente no primeiro render, mas depois que o usuário faz hover uma vez, o Framer Motion congela o valor do `background` no estado do hover — ao mudar `isActive`, a cor não atualiza mais.

**Causa:** O Framer Motion controla internamente os valores animáveis. Quando você define via `style`, o FM registra o valor inicial, mas ao fazer hover ele assume controle do `background`. Após o hover, o FM não reconhece mais a prop `style` como fonte de verdade.

**Solução correta:**
```tsx
// CORRETO — FM controla o background via animate
<motion.button
  initial={false}
  animate={{
    backgroundColor: isActive ? "#0E0F10" : "rgba(0,0,0,0)",
    color: isActive ? "#FFFFFF" : "#5E5E5F",
  }}
  whileHover={!isActive ? { backgroundColor: "rgba(213,210,201,0.35)" } : undefined}
  transition={{ duration: 0.15 }}
>

// ERRADO — FM congela o background após o primeiro hover
<motion.button
  style={{ background: isActive ? "#0E0F10" : "transparent" }}
  whileHover={{ backgroundColor: "rgba(213,210,201,0.35)" }}
>
```

**Regra:** Nunca use `style` para propriedades animáveis (background, color, opacity, transform) em `motion.*` que também tem `whileHover` ou `whileTap`. **Sempre use `animate`.**

---

### Modal `backdrop-filter` limitado ao sub-contêiner — HubiaPortal obrigatório (2026-03-08)

**Erro:** Modal com `backdropFilter: "blur(12px)"` aplicado via Framer Motion no overlay não aplica blur full-screen — fica limitado a uma área menor dentro da página.

**Sintoma:** O blur aparece apenas dentro do contêiner pai do modal, não cobrindo a sidebar e o resto da UI.

**Causa:** CSS `backdrop-filter` não funciona corretamente quando algum ancestral tem `transform`, `filter`, `will-change`, ou `overflow: hidden`. O Framer Motion aplica `transform` em elementos animados — isso cria um stacking context que limita o `backdrop-filter` ao bounding box desse ancestral.

**Solução correta:**
```tsx
import { createPortal } from "react-dom";

// HubiaPortal renderiza direto no document.body — fora de qualquer stacking context
export function HubiaPortal({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

// Todo modal DEVE ser envolto em HubiaPortal
<HubiaPortal>
  <AnimatePresence>
    {open && (
      <motion.div className="fixed inset-0 z-[9999]" /* overlay */ >
        <motion.div /* container do modal */ >
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
</HubiaPortal>
```

**Regra:** Todo modal, drawer ou overlay com `backdrop-filter` DEVE usar `HubiaPortal`. Sem exceções.

---

### Seleção múltipla em modais — UX correta (2026-03-08)

**Erro:** Modal de "Adicionar agente" adicionava um agente e fechava imediatamente ao clicar.

**Sintoma reportado pelo usuário:** "Eu clico num deles e ele já adiciona e sai daquele negócio. Acho que tem que mostrar vários bloquinhos, eu vou clicando, marcando, e depois eu confirmo."

**Solução correta para seleção múltipla:**
- Grid de cards ticáveis: clicar marca/desmarca com check badge animado
- Contador no rodapé: "X agentes selecionados"
- Botão confirmar: só ativa quando há seleção; executa todas as adições em batch
- `Promise.all` para adicionar múltiplos agentes de uma vez

**Regra:** Qualquer fluxo onde o usuário precisa selecionar múltiplos itens de uma lista NUNCA deve executar a ação ao clicar em cada item. Sempre: selecionar → confirmar.

---

### Auto-draft — Formulários não devem perder dados (2026-03-08)

**Contexto:** Usuário pediu: "se porventura estiver fazendo algo e sair sem querer, ele vai salvar como Rascunho".

**Padrão obrigatório para formulários de criação:**
```tsx
const DRAFT_KEY = "hubia:[entidade]:[contexto]";

// Ao fechar sem submeter (handleClose)
if (name.trim()) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify({ name, description, ... }));
  // mostrar banner de confirmação, depois fechar
} else {
  localStorage.removeItem(DRAFT_KEY);
  onClose();
}

// Ao abrir (restore)
const saved = localStorage.getItem(DRAFT_KEY);
if (saved) { /* restaurar campos */ }

// Ao submeter com sucesso
localStorage.removeItem(DRAFT_KEY);
```

**Regra:** Todo formulário de criação de entidade (agente, squad, pedido, creator, etc.) deve implementar auto-draft.

---

### Navegação de squads — Cards devem ser clicáveis (2026-03-08)

**Contexto:** Usuário pediu para poder clicar nos cards de squad e ir para uma página de detalhe.

**Padrão estabelecido:**
- Cards de squad na aba "Squads Futuros" → `router.push('/agentes/squad/${slug}')`
- Headers dos squads na aba "Squads" (nome + ícone) → `router.push('/agentes/squad/${slug}')`
- Squads futuros não existentes no banco → criados automaticamente na primeira visita com status correto

**Rota dinâmica do squad:** `/agentes/squad/[slug]`
- Server Component faz `getSquadBySlug` + `getAllAgents`
- Se squad não existe mas está nos `FUTURE_SQUADS`, cria automaticamente via `createSquad`
