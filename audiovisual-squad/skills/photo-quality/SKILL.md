---
name: photo-quality
description: Regras de qualidade fotográfica, seleção inteligente de câmera/lente por cena, padrões de pele/cabelo/olhos/iluminação. OBRIGATÓRIO para Diretor de Cena, Engenheiro de Prompts, Especialista em Consistência. Carregar SEMPRE que houver geração visual (foto ou vídeo).
---

# Photo Quality — Regras de Qualidade Fotográfica

> Documento OBRIGATÓRIO para qualquer agente que gere ou valide prompts visuais.
> Toda geração de imagem/vídeo da agência segue estas regras sem exceção.

**Versão:** 1.0 | **Data:** 2026-02-25

---

## 1. PRINCÍPIO CENTRAL

**Toda imagem gerada deve ser indistinguível de uma fotografia real tirada por uma pessoa real.**

Não existe "quase real". Se parece IA, está reprovado. Se a pele parece plástico, está reprovado. Se o cabelo parece renderizado, está reprovado. Se a luz não faz sentido físico, está reprovado.

---

## 2. PELE — O Teste Definitivo de Realismo

### 2.1 Textura Obrigatória (sempre incluir no prompt)
```
natural skin micro-relief with visible pores, fine skin grain, subtle uneven texture,
micro wrinkles around eyes and lips and nasolabial area, delicate natural creases,
visible vellus facial hair (peach fuzz) on cheeks forehead and upper lip,
natural skin imperfections: tiny freckles, micro redness, slight tonal variation,
epidermis-level detail
```

### 2.2 Brilho e Luminosidade da Pele
```
natural oil sheen ONLY on high points (cheekbone, nose, forehead), matte elsewhere,
realistic glossy highlights on skin, true light reflection, no artificial shine,
luminous due to real light only — not effects,
skin looks healthy and alive, not dull, not glossy
```

### 2.3 Proibições Absolutas de Pele
```
NUNCA usar: smooth skin, perfect skin, flawless skin, porcelain skin, glass skin
NUNCA usar: beauty filter, skin smoothing, airbrushed, retouched
NUNCA usar: plastic skin, AI skin, digital skin, CGI skin
SEMPRE incluir no negative: plastic skin, airbrushed, no pores, smooth artificial skin,
doll face, glass skin, beauty filter, skin smoothing, AI plastic skin
```

### 2.4 Regra de Brilho por Zona
| Zona do rosto | Brilho natural | Erro comum de IA |
|---|---|---|
| Testa | Leve sheen na zona T | Brilho uniforme inteiro |
| Bochechas | Matte com blush sutil | Glossy artificial |
| Nariz | Ponto de brilho na ponta/dorso | Nariz inteiro brilhando |
| Queixo | Matte | Brilho sem motivo |
| Pescoço | Matte, sombra suave | Mesmo tom do rosto (erro) |

---

## 3. CABELO — Naturalidade Obrigatória

### 3.1 Textura e Detalhes (sempre incluir)
```
natural hair strands visible, individual hair strands emerging from follicles,
subtle flyaways and baby hairs along hairline,
realistic hair texture with natural volume,
hair reacting naturally to light source — highlights where light hits, darker underneath
```

### 3.2 Comportamento por Contexto
| Contexto | Comportamento do cabelo |
|---|---|
| Interior sem vento | Caimento natural, fios parados, pontas com leve ondulação |
| Exterior com brisa | Fios leves movendo, flyaways visíveis, sem "ventania de comercial" |
| Pós-praia/piscina | Slightly damp strands, textura mais pesada, agrupamento natural |
| Preso (coque/rabo) | Volume realista no topo, fios soltos escapando, baby hairs na nuca |

### 3.3 Proibições de Cabelo
```
NUNCA: cabelo com textura uniforme (parece peruca)
NUNCA: cabelo sem flyaways (parece recortado)
NUNCA: brilho uniforme em todo o cabelo (brilho real é pontual)
NUNCA: cabelo que não reage à luz da cena
SEMPRE no negative: wig-like hair, uniform hair texture, helmet hair, no flyaways
```

---

## 4. OLHOS — Vida e Autenticidade

### 4.1 Detalhes Obrigatórios
```
realistic iris detail with visible limbal ring,
micro blood vessels in sclera (sutis, não exagerado),
natural light reflections in eyes matching light source of scene,
slight moisture on lower eyelid,
natural lash texture — individual lashes visible, not clumped
```

### 4.2 Proibições
```
NUNCA: olhos que brilham sem fonte de luz justificável
NUNCA: reflexo nos olhos que não corresponde à cena
NUNCA: iris com saturação exagerada
NUNCA: cílios uniformes demais (parece 3D)
```

---

## 5. ILUMINAÇÃO — Coerência Física Obrigatória

### 5.1 Regra de Ouro
A iluminação do prompt DEVE ser fisicamente coerente com o cenário descrito.

### 5.2 Separação de Temperatura de Cor
```
Cenas com múltiplas fontes de luz DEVEM especificar temperatura de cada uma:
- "warm foreground lighting from [fonte] and cool ambient from [fonte]"
- "warm-cool contrast between [fonte quente] and [fonte fria]"
```

### 5.3 Diretrizes por Horário
| Horário | Luz | Sombras | Temperatura |
|---|---|---|---|
| Manhã cedo (6-8h) | Lateral baixa, suave | Longas, suaves | Quente dourado |
| Meio-dia (11-14h) | Direta de cima | Curtas, duras | Neutra/fria |
| Golden hour (16-18h) | Lateral baixa | Longas, quentes | Quente intenso |
| Entardecer (18-19h) | Indireta, difusa | Suavíssimas | Quente → azul |
| Noite interior | Artificial, pontual | Definidas por fonte | Quente (tungstênio) |
| Noite exterior | Ambiente + fontes pontuais | Múltiplas direções | Fria + quente pontual |
| Flash de celular | Frontal, duro | Fortes atrás do sujeito | Neutra/fria |

### 5.4 Sombras (regra física)
```
TODA sombra deve ser consistente com a fonte de luz descrita.
Se a luz vem da esquerda → sombra cai à direita.
Se existem múltiplas fontes → múltiplas sombras suaves.
Sombras suaves em dia nublado. Sombras duras em sol direto.
NUNCA: sombra sem fonte de luz. NUNCA: ausência de sombra com luz direcional.
```

---

## 6. CENÁRIO E AMBIENTE — Coerência Total

### 6.1 Regra de Integração
```
O sujeito PERTENCE ao cenário. Mesma iluminação, mesma temperatura de cor,
mesma perspectiva. Se o fundo está desfocado, o blur deve ser óptico (natural DOF),
não blur artificial. O sujeito não pode parecer "colado" na cena.
```

### 6.2 Elementos de Ancoragem por Ambiente
| Ambiente | Elementos que ancoram na realidade |
|---|---|
| Praia | Reflexo de água na pele, areia nos pés/corpo, vento no cabelo, sal na pele |
| Restaurante noturno | Flash refletindo em superfícies, menu/objetos na mesa, iluminação quente |
| Casa/interior | Luz de janela com direção, reflexos em superfícies, profundidade do cômodo |
| Carro | Reflexos no vidro, textura do banco, iluminação do painel, cinto |
| Rua noturna | Luzes de fundo com bokeh, reflexos no chão se molhado, luz mista |
| Espelho/selfie | Reflexo coerente, telefone na mão, ângulo de selfie real (24-28mm) |

### 6.3 Detalhes Ambientais de Vida
```
Sempre incluir pelo menos 2-3 detalhes que tornam a cena "vivida":
- Condensação de respiração no frio
- Dobras naturais na roupa (sleeve bunching, natural folds)
- Objetos do contexto (copo, menu, bolsa, livro)
- Textura real das superfícies (concreto com imperfeições, madeira com veios)
- Micro-movimentos: vento leve, cabelo caindo, gesto casual
```

---

## 7. ROUPA E TECIDO — Materialidade Real

### 7.1 Regra de Textura
```
Toda roupa deve ter textura descrita: cotton texture, linen weave, silk sheen,
denim grain, knit pattern. Roupa sem textura descrita = roupa de IA.
```

### 7.2 Comportamento Natural
```
natural fabric draping, visible seams and stitching where appropriate,
natural wrinkles and folds at joints (elbows, waist, knees),
fabric clearly separated from skin tone (no blending),
clothing reacting to pose (bunching, stretching, falling)
```

---

## 8. MÃOS E ANATOMIA — Zona de Risco

### 8.1 Quando Mãos Aparecem (SEMPRE incluir)
```
anatomically correct hands with five fingers, natural finger proportions,
realistic skin texture on hands with visible knuckle creases and pores,
natural nail appearance with correct cuticles
```

### 8.2 Negative Prompt de Anatomia (SEMPRE)
```
extra fingers, deformed hands, melted hands, wrong number of fingers,
fused fingers, twisted fingers, unnatural hand pose, missing fingers,
extra limbs, deformed anatomy
```

---

## 9. EQUIPAMENTO OFICIAL DA AGÊNCIA

> Arsenal fixo. Só estas câmeras e lentes são usadas nos prompts.
> O agente NUNCA inventa câmera ou lente fora desta lista.

### 9.1 Câmeras de Fotografia

| Câmera | Perfil | Por que está aqui |
|---|---|---|
| **Sony A7R V** | Alta resolução (61MP), cores precisas, tonalidade de pele excelente | Altíssima representação nos datasets. Resultado consistente. Referência de nitidez. |
| **Canon EOS R5** | Autofoco perfeito, cores ricas, lentes RF excepcionais | Muito representada. RF 85mm f/1.2L = melhor setup de retrato que existe. |
| **Fujifilm X-T5** | Cores cinematográficas do sensor, estética lifestyle | Bem representada. Modelos associam a "cores com alma" — tons de pele quentes e naturais. |
| **Hasselblad X2D 100C** | Médio formato, 100MP, separação de planos incomparável | Fortemente associada a "high fashion editorial". Usar para look premium, revista, campanha. |

### 9.2 Lentes de Fotografia

| Lente | Câmera(s) | Uso principal |
|---|---|---|
| **85mm f/1.4** | Sony A7R V, Canon R5 | Retrato clássico — compressão facial perfeita, bokeh cremoso |
| **Canon RF 85mm f/1.2L** | Canon R5 | Retrato premium absoluto — separação do fundo incomparável |
| **50mm f/1.2** | Sony A7R V, Canon R5 | Versátil — meio-termo entre retrato e ambiental |
| **35mm f/1.4** | Sony A7R V, Fujifilm X-T5 (Fujinon 23mm f/1.4) | Lifestyle e candid — inclui contexto do ambiente |
| **24mm f/2.8** | Sony A7R V | Wide/ambiental — cenas completas, fachada, piscina |
| **100mm f/2.8 Macro** | Sony A7R V, Canon R5 | Detalhes extremos — pele, olhos, unhas, acessórios |
| **Hasselblad XCD 90mm f/2.5** | Hasselblad X2D | Retrato médio formato — editorial de moda |

### 9.3 Smartphone

| Dispositivo | Uso principal |
|---|---|
| **iPhone 17 Pro Max** | Selfies, mirror selfies, stories, UGC, fotos casuais, estética "pessoa real" |

Prompt padrão iPhone:
```
Shot on iPhone 17 Pro Max, 24mm equivalent lens, vertical framing,
authentic smartphone photography, natural phone-camera depth of field,
slight edge softness, natural focus falloff, subtle sensor grain,
social media ready, candid and believable smartphone photography
```

iPhone com flash:
```
Shot on iPhone 17 Pro Max with on-camera flash, 24mm equivalent,
direct frontal flash creating sharp highlights, defined shadows behind subject,
slight background darkness with flash falloff, authentic nighttime phone photo
```

### 9.4 Câmeras de Vídeo

| Câmera | Perfil | Por que está aqui |
|---|---|---|
| **Sony FX3** | Cinema full-frame compacto, qualidade cinema | Referência de creators premium. Fortemente representada. |
| **Canon EOS C70** | Cinema Canon, autofoco infalível, cores cinemáticas | Documentários, lifestyle premium, editorial em vídeo. |
| **ARRI Alexa Mini LF** | Padrão de cinema mundial. Large format. | Associação direta com "parece filme". Estética cinematográfica máxima. |

### 9.5 Lentes de Vídeo

| Lente | Câmera(s) | Uso |
|---|---|---|
| **35mm f/1.4** | Sony FX3, Canon C70 | Padrão cinema — campo de visão natural |
| **85mm f/1.4** | Sony FX3, Canon C70 | Close-up emocional, beauty video |
| **24-70mm f/2.8** | Sony FX3, Canon C70 | Zoom versátil — run & gun |
| **ARRI Signature Primes** | ARRI Alexa Mini LF | Cinema premium — 35mm, 47mm, 75mm |

---

## 10. SISTEMA INTELIGENTE DE SELEÇÃO — Câmera + Lente por Cena

> O agente NÃO escolhe câmera aleatoriamente.
> A cena determina o equipamento. Seguir a árvore de decisão.

### 10.1 Árvore de Decisão — FOTOGRAFIA

```
A CENA É SELFIE OU PERSPECTIVA DE CELULAR?
│
├── SIM → iPhone 17 Pro Max, 24mm equivalent
│   ├── Mirror selfie → vertical, reflexo no espelho, phone na mão
│   ├── Selfie frontal → olhando pra câmera, ângulo levemente de cima
│   ├── Selfie no carro → interior do carro, ângulo do motorista
│   └── Story/UGC casual → qualquer cena casual, estética "postei agora"
│
└── NÃO → Câmera profissional:
    │
    ├── É RETRATO? (rosto é o foco principal)
    │   ├── Retrato editorial/moda → Canon R5 + RF 85mm f/1.2L
    │   ├── Retrato lifestyle/natural → Sony A7R V + 85mm f/1.4
    │   ├── Retrato premium/revista → Hasselblad X2D + XCD 90mm f/2.5
    │   └── Retrato com contexto → Sony A7R V + 50mm f/1.2
    │
    ├── É CORPO INTEIRO? (outfit, pose, moda)
    │   ├── Fashion/editorial → Canon R5 + RF 85mm f/1.2L
    │   ├── Casual/lifestyle → Fujifilm X-T5 + 35mm f/1.4
    │   └── Premium/campanha → Hasselblad X2D + XCD 90mm f/2.5
    │
    ├── É CENA DE LIFESTYLE? (rotina, ação, momento do dia)
    │   ├── Interior dia → Fujifilm X-T5 + 35mm f/1.4
    │   ├── Interior noite → Fujifilm X-T5 + 35mm f/1.4 (luz quente)
    │   ├── Exterior dia → Fujifilm X-T5 + 35mm f/1.4
    │   ├── Exterior noite → Sony A7R V + 35mm f/1.4 (melhor ISO alto)
    │   └── Com objeto (café, livro) → Fujifilm X-T5 + 35mm f/1.4
    │
    ├── É CENA AMPLA? (ambiente tão importante quanto a pessoa)
    │   ├── Piscina/área externa → Sony A7R V + 24mm f/2.8
    │   ├── Fachada/chegada → Sony A7R V + 24mm f/2.8
    │   ├── Garagem com carro → Sony A7R V + 24mm f/2.8
    │   └── Sala/cozinha mostrando espaço → Sony A7R V + 24mm f/2.8
    │
    ├── É DETALHE/MACRO?
    │   ├── Pele/textura → Sony A7R V + 100mm f/2.8 Macro
    │   ├── Olho close-up → Sony A7R V + 100mm f/2.8 Macro
    │   ├── Mão/unhas/acessórios → Canon R5 + 100mm f/2.8 Macro
    │   └── Cabelo/lábios → Sony A7R V + 100mm f/2.8 Macro
    │
    └── É NOTURNO COM FLASH?
        ├── Flash iPhone → iPhone 17 Pro Max with flash
        ├── Flash digital camera → Canon R5 + 35mm f/1.4 with direct flash
        └── Flash editorial → Sony A7R V + 85mm f/1.4 with controlled flash
```

### 10.2 Árvore de Decisão — VÍDEO

```
QUAL É A ESTÉTICA?
│
├── CONTEÚDO SOCIAL (Reels, TikTok, Stories)
│   ├── Selfie video / talking head → iPhone 17 Pro Max
│   ├── GRWM → iPhone 17 Pro Max ou Sony FX3 + 35mm
│   ├── Rotina filmada → Sony FX3 + 35mm f/1.4
│   └── Vlog/dia a dia → Sony FX3 + 24-70mm f/2.8
│
├── CONTEÚDO PREMIUM (editoriais, teasers, branding)
│   ├── Beauty video → Sony FX3 + 85mm f/1.4
│   ├── Lifestyle cinematográfico → Canon C70 + 35mm f/1.4
│   ├── Fashion film → Canon C70 + 85mm f/1.4
│   └── Teaser/trailer → ARRI Alexa Mini LF + Signature Prime 47mm
│
└── CONTEÚDO CINEMA (comercial, campanha)
    ├── Narrativo → ARRI Alexa Mini LF + Signature Primes
    ├── Comercial de marca → ARRI Alexa Mini LF + Signature 35mm/75mm
    └── Documentário premium → Canon C70 + 24-70mm f/2.8
```

### 10.3 Mapa Completo por Cena — FOTOGRAFIA

| Cena | Câmera | Lente | Estilo no prompt |
|---|---|---|---|
| Sala — sofá, lendo, TV | Fujifilm X-T5 | 35mm f/1.4 | candid lifestyle, warm interior |
| Sala — retrato posado | Canon R5 | RF 85mm f/1.2L | editorial portrait, shallow DOF |
| Cozinha — bancada, café | Fujifilm X-T5 | 35mm f/1.4 | lifestyle candid, window light |
| Cozinha — close rosto | Sony A7R V | 85mm f/1.4 | intimate portrait, warm tones |
| Quarto — cama, manhã | Fujifilm X-T5 | 35mm f/1.4 | intimate lifestyle, soft morning light |
| Quarto — lingerie/editorial | Canon R5 | RF 85mm f/1.2L | editorial beauty, controlled light |
| Quarto — detalhe (mão, pele) | Sony A7R V | 100mm f/2.8 Macro | extreme macro |
| Piscina — corpo inteiro | Sony A7R V | 50mm f/1.2 | outdoor lifestyle, golden hour |
| Piscina — cena ampla | Sony A7R V | 24mm f/2.8 | environmental wide |
| Piscina — close rosto | Canon R5 | RF 85mm f/1.2L | beauty portrait, water reflections |
| Garagem — com carro | Sony A7R V | 24mm f/2.8 | wide, automotive editorial |
| Garagem — selfie no carro | iPhone 17 Pro Max | 24mm equiv | smartphone selfie, car interior |
| Fachada — chegando | Sony A7R V | 24mm f/2.8 | environmental wide, dusk/dawn |
| Restaurante — jantar | Fujifilm X-T5 | 35mm f/1.4 | warm ambient, candid |
| Restaurante — flash | iPhone 17 Pro Max flash | 24mm equiv | flash aesthetic, night out |
| Rua — noturno | Sony A7R V | 35mm f/1.4 | night street, mixed lighting |
| Rua — dia | Fujifilm X-T5 | 35mm f/1.4 | daytime candid, urban |
| Praia — corpo inteiro | Sony A7R V | 50mm f/1.2 | beach lifestyle, golden light |
| Praia — close rosto | Canon R5 | RF 85mm f/1.2L | beach portrait, sun-kissed |
| Espelho — selfie | iPhone 17 Pro Max | 24mm equiv | mirror selfie, vertical |
| Espelho — sem phone | Fujifilm X-T5 | 35mm f/1.4 | as if friend took the photo |
| Moda — outfit do dia | Canon R5 | RF 85mm f/1.2L | fashion editorial, full body |
| Editorial — campanha | Hasselblad X2D | XCD 90mm f/2.5 | high fashion, medium format |
| Macro — olho | Sony A7R V | 100mm f/2.8 Macro | extreme close-up, 8K |
| Macro — lábios | Canon R5 | 100mm f/2.8 Macro | beauty macro |
| Macro — mão/unhas | Sony A7R V | 100mm f/2.8 Macro | macro detail |
| Macro — cabelo | Sony A7R V | 100mm f/2.8 Macro | hair texture, follicle detail |

### 10.4 Mapa Completo por Cena — VÍDEO

| Cena | Câmera | Lente | Estilo |
|---|---|---|---|
| GRWM | iPhone 17 Pro Max ou Sony FX3 | 24mm / 35mm | casual UGC ou polished |
| Rotina manhã | Sony FX3 | 35mm f/1.4 | lifestyle cinematic, warm |
| Cozinha cozinhando | Sony FX3 | 35mm f/1.4 | candid, natural movement |
| Piscina — reel | Sony FX3 | 35mm f/1.4 | slow motion, golden hour |
| Fashion — outfit | Canon C70 | 85mm f/1.4 | fashion film, editorial |
| Noturno — saindo | Sony FX3 | 35mm f/1.4 | night lifestyle, mixed light |
| Teaser/branding | ARRI Alexa Mini LF | Signature 47mm | premium cinematic |
| Storytelling | Canon C70 | 24-70mm f/2.8 | documentary, variable framing |

### 10.5 Como o Prompt É Montado (Formato Final)

**Fotografia:**
```
Shot on [CÂMERA], [LENTE]mm f/[ABERTURA],
[ESTILO: candid lifestyle / editorial portrait / environmental wide / etc.],
[DOF: shallow / moderate / deep], [EXTRA: subtle film grain / natural bokeh],
RAW photo realism, [RESOLUÇÃO: 8K detail / high resolution]
```

**Smartphone:**
```
Shot on iPhone 17 Pro Max, [24mm] equivalent lens, vertical framing,
authentic smartphone photography, [CONTEXTO: mirror selfie / front camera / etc.],
natural phone-camera depth of field, slight edge softness,
subtle sensor grain, social media ready, candid and believable
```

**Vídeo:**
```
Filmed on [CÂMERA], [LENTE]mm f/[ABERTURA],
[ESTILO: cinematic lifestyle / fashion film / documentary],
[MOVIMENTO: slow dolly / handheld / static / tracking],
[FPS: 24fps cinematic / 60fps slow motion],
natural color grading, professional cinematography
```

---

## 11. NEGATIVE PROMPT BASE (Sempre Incluir)

```
plastic skin, airbrushed, no pores, smooth artificial skin, doll face, glass skin,
beauty filter, skin smoothing, AI plastic skin, retouched skin,
CGI render, 3d render, digital art, painted, illustration, AI-generated look,
extra fingers, deformed hands, melted hands, wrong number of fingers,
fused fingers, missing fingers, extra limbs, deformed anatomy,
heavy HDR, oversaturated, heavy filter, overexposed, underexposed,
washed out colors, faded colors, pastel tones, beige aesthetic, flat lighting,
AI glow, studio flat lighting [exceto quando briefado],
cartoon, 3D style, text, logos, watermark, frame,
uniform hair texture, helmet hair, wig-like hair,
symmetrical face [exceto quando briefado]
```

---

## 12. QUALIDADE E RESOLUÇÃO (Trava Final)

```
high resolution, 8K detail level, RAW photo realism,
professional color grading, natural color temperature,
sharp focus on subject, true-to-life colors,
zero retouching, zero smoothing, no beauty filters,
authentic photographic quality
```

---

## 13. TÉCNICA AVANÇADA: MACRO POR PARTES

Quando o resultado base não tem qualidade suficiente nos detalhes:

1. Gerar imagem base com prompt completo
2. Gerar macros separados referenciando a imagem base:
   - Macro de olho: 120mm, crop extremo, preservar ângulo e iluminação
   - Macro de pele: 100mm, poros visíveis, textura epidérmica
   - Macro de mão: 100mm, detalhes de pele e unhas
   - Macro de cabelo: 100mm, fios individuais, raiz, baby hairs
3. Combinar usando a imagem base como âncora
4. Aplicar upscale final se necessário

### Prompt de Upscale Padrão
```
Positive: Restore and enhance the provided image. Preserve original identity,
facial structure, proportions and composition. High-fidelity photo restoration,
ultra-realistic, natural skin texture, accurate details, professional photographic look.
4K output, sharp but natural focus, professional color grading, depth of field.
Shot on [CÂMERA DO PRESET USADO], raw photo aesthetic.

Negative: Creative reinterpretation, style change, identity alteration, face reshaping,
exaggerated features, cartoonish, painting, illustration, over-sharpening, plastic skin,
blur, noise, distortion, bad anatomy, overexposed, underexposed, washed out colors.

Parameters: steps 30, cfg_scale 6.5, denoising_strength 0.45, upscaler 4x_NMKD_Siax_200k
```

---

## 14. CHECKLIST PRÉ-GERAÇÃO (Obrigatório)

- [ ] Pele: termos de textura real incluídos? (pores, micro-relief, peach fuzz)
- [ ] Pele: brilho especificado por zona? (sheen on high points only)
- [ ] Cabelo: textura, flyaways e reação à luz descritos?
- [ ] Olhos: reflexo coerente com fonte de luz da cena?
- [ ] Iluminação: fisicamente coerente com horário e cenário?
- [ ] Temperatura de cor: separação quente/frio quando há múltiplas fontes?
- [ ] Sombras: direção coerente com fonte de luz?
- [ ] Câmera/lente: preset correto para o tipo de cena? (seção 10)
- [ ] Roupa: textura de tecido descrita?
- [ ] Mãos: se visíveis, anatomia reforçada no prompt e negative?
- [ ] Ambiente: detalhes de ancoragem que tornam a cena vivida?
- [ ] Negative prompt: completo, incluindo base + específicos da cena?
- [ ] Resolução: trava de qualidade final incluída?

---

## 15. REGRA FINAL

**Se o prompt não passa em TODOS os itens do checklist, ele não está pronto.**
Nenhum agente pode pular esta validação.
