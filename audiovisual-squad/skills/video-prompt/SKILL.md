---
name: video-prompt
description: Use para gerar prompt de vídeo da creator. Entrega JSON + texto por ferramenta (Higgsfield, Lovart, Freepik). Só usar após aprovação da Consistência.
---

# Video Prompt

## Missão
Tudo da image-prompt + movimento intencional. Sempre entregar JSON (fonte da verdade) + texto por ferramenta. Um vídeo mal dirigido parece mais IA que uma foto ruim.

## Pré-requisito
Ter o JSON da image-prompt gerado e aprovado. Esta skill adiciona as camadas de movimento e tempo.

---

## SAÍDA 1 — JSON (Fonte da Verdade)

```json
{
  "id": "[data]-[ambiente]-[tipo]-video",
  "creator": "ninaah",
  "base_image_id": "[id do JSON da image-prompt]",
  "subject": {
    "description": "[igual ao JSON de imagem]",
    "behavior": "[o que ela faz durante o vídeo]",
    "micro_movements": ["natural breathing, subtle chest movement", "hair moving gently"]
  },
  "camera_motion": {
    "type": "[dolly_in | drift | static | handheld | pan | pull_out | orbit]",
    "speed": "[slow | medium]",
    "description": "[descrição do movimento em texto]"
  },
  "timing": {
    "duration_seconds": "[6-15]",
    "action_start": "[quando começa a ação principal]",
    "action_peak": "[momento de maior intensidade]"
  },
  "platform": {
    "format": "[reel | story | horizontal]",
    "ratio": "[9:16 | 16:9]"
  },
  "style": {
    "mood": "[adjetivos]",
    "color_grade": "[warm | neutral | cool]",
    "loop": "[true | false]"
  }
}
```

---

## SAÍDA 2 — Texto por Ferramenta

### Higgsfield Cinema Studio
Texto curto de cena — câmera e movimento configurados na interface:
```
[SUJEITO + AÇÃO em 1-2 frases].
[AMBIENTE E LUZ em 1 frase].
[COMPORTAMENTO ESPECÍFICO: natural breathing / hair in breeze / etc].
[MOOD em 1 frase].
Natural skin, realistic motion, no filter look.
```
> ⚠️ No Higgsfield: selecionar movimento de câmera via preset (dolly in, drift, handheld), duração e formato na interface. Não descrever câmera no texto.

### Lovart / Freepik Spaces
Texto completo com movimento descrito:
```
[PROMPT COMPLETO DA IMAGE-PROMPT]

CAMERA MOVEMENT: [slow dolly in | gentle drift left | handheld subtle shake]
DURATION: [X] seconds
SUBJECT BEHAVIOR: [natural breathing, subtle chest movement / hair moving gently in breeze]
LOOP: [seamless loop | single take]
```

---

## Movimentos de Câmera por Situação

| Situação | Movimento | Ferramenta |
|----------|-----------|-----------|
| Momentos íntimos, quarto | static shot | Qualquer |
| Piscina, ambiental, relaxado | slow drift left/right | Higgsfield drift preset |
| Aproximação emocional | slow dolly in | Higgsfield dolly in preset |
| Revelar ambiente | slow pull out | Higgsfield pull out preset |
| Lifestyle casual, stories | handheld subtle shake | Higgsfield handheld preset |
| Seguir movimento | slow pan | Higgsfield pan preset |

## Comportamentos Naturais da Ninaah

| Cena | Comportamento |
|------|--------------|
| Relaxada | `natural breathing, subtle chest movement` |
| Ao ar livre | `hair moving gently in breeze` |
| Olhando câmera | `looks gently at camera, natural eye movement` |
| Casual | `hand raises slowly to adjust hair` |
| Bebendo | `raises cup slowly, takes sip naturally` |
| No carro | `settles in naturally, adjusts mirror` |

## Regra de Ouro
**Menos é mais.** Drift suave de 8s com boa luz > movimento complexo com IA alucinando detalhes. Um movimento por cena, executado com precisão.

## Plataformas e Durações

| Formato | Duração | AR | Movimento |
|---------|---------|-----|-----------|
| Reel feed | 6-15s | 9:16 | 1 movimento suave |
| Story | 5-10s | 9:16 | Estático ou drift |
| Horizontal | 10-20s | 16:9 | Conforme cena |

---

## Checklist
- [ ] JSON da image-prompt como base
- [ ] JSON de vídeo gerado e completo
- [ ] Texto Higgsfield gerado (curto + configurações separadas)
- [ ] Texto Lovart/Freepik gerado (completo com movimento)
- [ ] Movimento de câmera adequado à cena
- [ ] Duração adequada à plataforma
- [ ] Aprovado pela Consistência
- [ ] Salvar JSON na PROMPT-LIBRARY após aprovação
