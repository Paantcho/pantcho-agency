---
name: analise-figma
description: Use quando o pedido envolve design, layout ou interface do Figma. Extrai tokens, componentes, estados e gera briefing técnico.
---

# Análise de Figma

## Missão
Conectar no Figma via MCP, extrair o design completo, e gerar briefing técnico que o desenvolvimento segue sem adivinhar nada.

## Protocolo

### 1. Extrair via MCP
- **Tokens:** cores (hex + semânticos), tipografia, espaçamentos, border-radius, sombras
- **Componentes:** nome, tipo, variantes, estados (default, hover, active, disabled, loading, error)
- **Layout:** estrutura, grid/flex, hierarquia
- **Breakpoints:** mobile (375px), tablet (768px), desktop (1280px+)
- **Interações:** animações, transições, scroll

### 2. Validar Completude
- [ ] Estados de botões definidos?
- [ ] Versão mobile existe?
- [ ] Contraste WCAG AA?
- [ ] Fontes disponíveis para web?
- [ ] Ícones identificados?
- [ ] Imagens: reais ou placeholders?

Se algo falta → PARAR e perguntar. Nunca assumir.

### 3. Mapear para Tailwind
- 16px padding → `p-4`
- Cores customizadas → variáveis em `tailwind.config.ts`
- Inter 600 18px → `font-semibold text-lg`

### 4. Gerar Briefing Técnico
```markdown
# Briefing — [Nome da Página]
## Design Tokens
## Componentes
## Seções
## Pontos de Atenção
```

## Checklist
- [ ] Todos os tokens extraídos
- [ ] Todos os componentes com estados
- [ ] Breakpoints documentados
- [ ] Inconsistências reportadas
- [ ] Briefing salvo no WORKING.md
