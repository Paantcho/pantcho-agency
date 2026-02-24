---
name: qa-review
description: Use SEMPRE antes de entregar qualquer projeto ou feature. Revisa fidelidade ao design, código, segurança, acessibilidade e performance.
---

# QA & Review

## Missão
Nada sai sem revisão. Encontrar o que ninguém viu.

## Protocolo
1. **Design:** Comparar com briefing Figma — espaçamentos, cores, tipografia, estados, responsividade
2. **Código:** TypeScript sem `any`, componentes < 150 linhas, sem console.log, sem código morto
3. **Segurança:** Validação server-side, auth correta, sem dados sensíveis, .env.local não commitado
4. **Acessibilidade:** WCAG 2.1 AA, ARIA, contraste ≥ 4.5:1, navegação por teclado
5. **Performance:** Core Web Vitals, imagens otimizadas, code splitting

## Pergunta obrigatória antes de aprovar
"Um engenheiro sênior aprovaria isso?"

## Formato do Relatório
```
# QA — [Projeto]
## Status: [✅ APROVADO | ⚠️ CORREÇÕES | ❌ REPROVADO]

### 🔴 Críticos (bloqueia entrega)
### 🟡 Importantes (corrigir antes do deploy)
### 🟢 Melhorias (pode corrigir depois)
```

## Checklist
- [ ] Fidelidade ao design verificada
- [ ] Código revisado
- [ ] Segurança validada
- [ ] Acessibilidade testada
- [ ] Performance verificada
- [ ] Relatório gerado e salvo
