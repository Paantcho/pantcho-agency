# Diretriz: Criação de Agentes e Skills (referência Anthropic)

Este documento é **diretriz apenas** para o Criador de Agentes e para quem desenha novas skills. Seguir o padrão da indústria garante consistência, segurança e qualidade.

---

## Referências oficiais

- **Skill Creator (Claude Plugin)** — https://claude.com/plugins/skill-creator  
  Create, improve, and measure skills. Modos: Create, Eval, Improve, Benchmark. Agentes internos: Executor, Grader, Comparator, Analyzer. Use para criar, atualizar e avaliar skills de forma orientada a dados.

- **Anthropic Skills (GitHub)** — https://github.com/anthropics/skills  
  Repositório público de Agent Skills. Contém spec, template e exemplos. Padrão Agent Skills: ver também agentskills.io.

---

## Formato de Skill (SKILL.md)

- **Front matter YAML obrigatório** no início do arquivo:
  - `name`: identificador único (lowercase, hífens para espaços)
  - `description`: descrição clara do que a skill faz e **quando usá-la**

- **Conteúdo Markdown:** instruções, exemplos, guidelines que o modelo segue quando a skill está ativa.

Exemplo mínimo (alinhado ao template Anthropic):

```markdown
---
name: minha-skill
description: Use quando precisar de X. Não use quando Y.
---

# Minha Skill

## Missão
[O que esta skill resolve]

## Regras
[Regras de execução]

## Exemplos
- Exemplo 1
- Exemplo 2

## Checklist de Qualidade
[O que verificar antes de considerar concluído]
```

---

## Boas práticas (resumo)

- Skills **modulares** e **específicas** (escopo claro).
- Máximo ~500 linhas por skill no Hub; quebrar em sub-skills se necessário.
- Criar novos agentes apenas quando **não existir** especialista no AGENTS.md; o Criador de Agentes pesquisa (inclusive na web), desenha SOUL + SKILL e integra na cadeia.
- Todo novo agente deve saber onde achar contexto global: CLAUDE.md, CONNECTORS.md, RULES.md, AGENTS.md, VERSIONING.md — registrar em MEMORY ou no SOUL do agente.

---

## Uso no Pantcho Agency Hub

- O **Criador de Agentes** (dev-squad) usa esta diretriz ao criar skills e agentes.
- Skills existentes em `dev-squad/skills/` e `audiovisual-squad/skills/` já seguem front matter `name` + `description`. Novas skills devem manter o padrão e, quando útil, usar Skill Creator (plugin) para evals e melhorias iterativas.
