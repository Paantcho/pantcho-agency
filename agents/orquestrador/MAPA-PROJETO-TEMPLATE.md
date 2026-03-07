# Template: Mapa do Projeto

Todo projeto ativo deve ter um **mapa** com todas as funcionalidades, rotas (páginas e fluxos) e ações principais. O Orquestrador e todos os agentes usam esse mapa para ter visão completa e previsibilidade.

**Onde guardar:** em `memory/WORKING.md` (seção dedicada) ou em arquivo referenciado (ex.: `directives/[projeto]-mapa.md`). Sempre referenciar em WORKING e, se relevante, em STATUS.

---

## Nome do projeto

---

## Funcionalidades (lista)

- _
- _

---

## Rotas (páginas e navegação)

| Rota / Página | Entrada (quando chega) | Ações principais | Para onde leva |
|----------------|------------------------|------------------|----------------|
| `/` | App load | … | `/login` ou `/dashboard` |
| `/login` | Usuário não autenticado | Submit login | `/auth/callback` → `/dashboard` |
| _(exemplo)_ | _ | _ | _ |

---

## Fluxos críticos (passo a passo)

1. **Fluxo:** _(ex.: Login)_  
   Página A → ação → Página B → ação → Página C

2. **Fluxo:** _(ex.: Criar item)_  
   _

---

## Próximos passos (ordem de entrega)

- [ ] _
- [ ] _

---

## Dependências entre agentes/tarefas

_(Ex.: “Front-end depende de API listada em WORKING; QA só após front + back concluídos.”)_
