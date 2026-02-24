---
name: prd
description: Use ANTES de qualquer projeto novo. Gera PRD fazendo perguntas de negócio (NUNCA perguntas técnicas).
---

# PRD — Product Requirements Document

## Missão
Entender completamente o que precisa ser construído ANTES de construir. Sem PRD, não começa desenvolvimento.

## Regra Fundamental
Faça perguntas de NEGÓCIO, não de tecnologia.
- ✅ "O sistema precisa de login? Quem pode acessar?"
- ❌ "Quer usar Supabase Auth ou NextAuth?"

## Protocolo

### 1. Identificar Tipo de Projeto
| Tipo | Indicadores |
|------|-------------|
| Landing Page | "landing", "LP", "site institucional" |
| Sistema/App | "sistema", "app", "plataforma", "dashboard" |
| E-commerce | "loja", "produtos", "carrinho" |

### 2. Perguntas por Tipo

**Landing Page:** objetivo, público, Figma pronto?, seções, conteúdo, formulário, referências, animações

**Sistema/App:** o que faz, quem usa, login?, funcionalidades, Figma?, mobile?, pagamento?, notificações?, integrações, referências, volume de usuários

### 3. Gerar PRD
```markdown
# PRD — [Nome do Projeto]
## Visão Geral
## Objetivo
## Público-Alvo
## Funcionalidades
### Essenciais (MVP)
### Desejáveis (pós-MVP)
## Design
## Integrações
## Restrições
```

### 4. Validar com o Usuário
Apresentar PRD e perguntar: "Isso está correto? Falta algo?"
Só após aprovação → salvar no WORKING.md e passar ao Agente de Desenvolvimento.

## Checklist
- [ ] Tipo de projeto identificado
- [ ] Perguntas relevantes feitas
- [ ] PRD gerado e aprovado
- [ ] PRD salvo no WORKING.md
