---
name: image-prompt
description: Use para gerar prompt de imagem fotorrealista da creator. Só usar após aprovação da Consistência.
---

# Image Prompt

## Missão
Traduzir o briefing visual em linguagem que os modelos de geração entendem. Prompt que resulta em fotorrealismo, não em "cara de IA".

## Estrutura do Prompt

```
[TIPO DE FOTO] of [DESCRIÇÃO COMPLETA DA CREATOR — da bible],
[AÇÃO/POSIÇÃO],
[ROUPA detalhada],
[AMBIENTE — da bible],
[LUZ e hora do dia],
[COMPOSIÇÃO: ângulo, distância],
[ESTÉTICA: qualidade técnica],
[MOOD],
photorealistic, shot on [câmera], [lente]mm,
natural skin texture, hyperrealistic details,
professional photography, --ar [proporção]
```

## Termos que Aumentam Realismo
- `photorealistic`, `hyperrealistic`
- `shot on Sony A7IV`, `shot on Canon R5`
- `85mm lens`, `50mm lens`
- `natural skin texture`, `pores visible`
- `candid photography`, `lifestyle photography`
- `natural lighting`, `golden hour`

## Termos a Evitar
- `beautiful` (vago, causa idealização)
- `perfect` (causa distorção)
- `stunning` (overprocessado)
- Qualquer descrição de altura em números

## Proporções
- Feed quadrado: `--ar 1:1`
- Feed vertical: `--ar 4:5`
- Reel/Story: `--ar 9:16`
- Horizontal: `--ar 16:9`

## Checklist
- [ ] Aparência da creator conforme APPEARANCE.md
- [ ] Ambiente conforme AMBIENTES.md
- [ ] Nenhum detalhe inventado
- [ ] Aprovado pela Consistência
- [ ] Salvar prompt aprovado na PROMPT-LIBRARY
