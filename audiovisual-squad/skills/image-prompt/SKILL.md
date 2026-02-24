---
name: image-prompt
description: Use para gerar prompt de imagem fotorrealista da creator. Só usar após aprovação da Consistência. Entrega JSON + texto por ferramenta.
---

# Image Prompt

## Missão
Traduzir o briefing visual em linguagem que os modelos entendem. Sempre entregar duas saídas: JSON (fonte da verdade) + texto corrido por ferramenta.

---

## SAÍDA 1 — JSON (Fonte da Verdade)

Sempre gerar primeiro. Salvar na PROMPT-LIBRARY após aprovação.

```json
{
  "id": "[data]-[ambiente]-[tipo]",
  "creator": "ninaah",
  "subject": {
    "description": "young Brazilian woman, 1.63m, athletic-elegant build",
    "hair": "long dark brown hair reaching lower back, natural slight waves",
    "eyes": "light gray-green eyes",
    "skin": "natural light tan, realistic pores, no filter look",
    "markers": ["small mole upper right shoulder", "discrete belly button piercing"],
    "expression": "[expressão da cena]"
  },
  "scene": {
    "location": "[local da bible]",
    "time_of_day": "[período]",
    "lighting": "[tipo de luz]",
    "action": "[o que ela está fazendo]",
    "outfit": "[roupa completa]",
    "props": ["[prop 1]", "[prop 2]"]
  },
  "camera": {
    "body": "[Sony A7IV | Canon R5]",
    "lens_mm": "[85 | 50 | 35]",
    "aperture": "[f/1.8 | f/2.8]",
    "angle": "[eye level | low angle | high angle]",
    "framing": "[close-up | medium shot | wide shot]",
    "dof": "[shallow bokeh | moderate | deep]"
  },
  "style": {
    "aesthetic": "editorial lifestyle photography",
    "mood": "[adjetivos do mood]",
    "color_grade": "[warm tones | neutral | cool]",
    "ratio": "[4:5 | 9:16 | 1:1 | 16:9]",
    "quality_tags": ["photorealistic", "hyperrealistic", "natural skin texture", "candid"]
  },
  "negative": "[o que evitar]"
}
```

---

## SAÍDA 2 — Texto Corrido por Ferramenta

Gerado a partir do JSON. Cada ferramenta recebe na linguagem que entende.

### Lovart / Freepik Spaces
Texto completo e detalhado em bloco único:
```
Photorealistic editorial lifestyle photo of a young Brazilian woman, 
1.63m, athletic-elegant build, long dark brown hair reaching lower back 
with natural slight waves, light gray-green eyes, natural light tan skin 
with realistic pores, small mole on upper right shoulder,
[AÇÃO],
wearing [ROUPA DETALHADA],
[AMBIENTE DA BIBLE — detalhado],
[LUZ: golden hour backlight / soft diffused / etc],
shot on Sony A7IV, 85mm lens, f/1.8,
[ÂNGULO E ENQUADRAMENTO],
shallow depth of field, background softly bokeh,
natural skin texture, no filter look, realistic pores,
editorial lifestyle photography, [MOOD],
--ar [PROPORÇÃO]

NEGATIVE: cartoon, illustration, plastic skin, fake bokeh, 
oversaturated, HDR, distorted hands, extra fingers, 
artificial implant look, [outros específicos da cena]
```

### Higgsfield Cinema Studio
Texto curto — câmera configurada na interface, não no prompt:
```
[AÇÃO E SUJEITO em 1-2 frases].
[AMBIENTE E LUZ em 1 frase].
[MOOD em 1 frase].
Natural skin, realistic details, no filter.
```
> ⚠️ No Higgsfield: configurar câmera, lente e focal length diretamente na interface. Não repetir no texto.

---

## Termos que Aumentam Realismo
- `photorealistic`, `hyperrealistic`, `natural skin texture`
- `realistic pores`, `no filter look`, `candid photography`
- `shot on Sony A7IV`, `85mm lens`, `f/1.8`
- `golden hour`, `soft diffused light`, `rim light`

## Termos a Evitar no Prompt
- `beautiful`, `perfect`, `stunning` (causam idealização/distorção)
- Altura em números (ex: "1.63m tall" distorce proporções)
- Múltiplos estilos conflitantes no mesmo prompt

## Proporções
- Feed vertical: `--ar 4:5`
- Reel/Story: `--ar 9:16`
- Feed quadrado: `--ar 1:1`
- Horizontal: `--ar 16:9`

---

## Checklist
- [ ] Aparência da creator conforme APPEARANCE.md
- [ ] Ambiente conforme AMBIENTES.md
- [ ] Nenhum detalhe inventado — tudo da bible
- [ ] Aprovado pela Consistência
- [ ] JSON gerado e completo
- [ ] Texto Lovart/Freepik gerado
- [ ] Texto Higgsfield gerado (curto)
- [ ] Negative prompts incluídos
- [ ] Salvar JSON na PROMPT-LIBRARY após aprovação
