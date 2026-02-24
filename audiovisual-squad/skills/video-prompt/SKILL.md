---
name: video-prompt
description: Use para gerar prompt de vídeo da creator. Adiciona movimento de câmera e comportamento ao prompt base de imagem.
---

# Video Prompt

## Missão
Tudo da image-prompt + movimento intencional. Um vídeo mal dirigido parece mais IA que uma foto ruim.

## Pré-requisito
Gerar o prompt base com image-prompt primeiro. Esta skill adiciona as camadas de vídeo.

## Movimentos de Câmera
| Movimento | Código | Quando usar |
|-----------|--------|-------------|
| Estática | static shot | Momentos íntimos, foco na ação |
| Drift suave | slow drift left/right | Ambiental, quarto, piscina |
| Push in | slow push in | Aproximação emocional |
| Pull out | slow pull out | Revelar ambiente |
| Pan | slow pan [direção] | Seguir movimento |
| Na mão | handheld subtle shake | Casual, lifestyle, stories |

## Comportamentos Naturais
- Respiração: `natural breathing, subtle chest movement`
- Cabelo: `hair moving gently in breeze`
- Olha câmera: `looks gently at camera, natural eye movement`
- Mexe cabelo: `hand raises slowly to adjust hair`

## Plataformas
| Formato | Duração | AR |
|---------|---------|-----|
| Reel feed | 6-15s | 9:16 |
| Story | 5-10s | 9:16 |
| Horizontal | 10-20s | 16:9 |

## Regra de Ouro
Menos é mais. Drift suave de 8s com boa luz > movimento complexo com IA alucinando.

## Modelos Recomendados
- **Runway Gen-3 Alpha:** movimento de câmera controlado
- **Kling 1.5:** consistência facial, movimento natural
- **Pika 2.0:** stories curtos, lifestyle simples
