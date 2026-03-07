# Versionamento — Pantcho Agency

Este repositório é um **monorepo**: todo o código (squads, memória, app Hubia) está no mesmo Git, com um único histórico e um único remote.

## Por que assim?

- **Um clone, tudo disponível** — não há submodules para atualizar
- **Commits únicos** — mudanças no `hubia-app` e em docs/agentes no mesmo histórico
- **Tags organizadas** — dá para marcar releases por “produto” (ex.: app vs. apenas docs)
- **CI/CD simples** — um pipeline pode buildar o app e/ou publicar artefatos a partir da pasta correta

## Estrutura de tags (recomendação)

| Padrão | Uso |
|--------|-----|
| `hubia-app/v1.2.3` | Release do app Hubia (semver) |
| `v1.0.0` ou `docs/v1.0.0` | (Opcional) Releases gerais do repositório ou só documentação |

Exemplos:

```bash
# Marcar release atual do app como 1.0.0
git tag hubia-app/v1.0.0

# Enviar tag para o remote
git push origin hubia-app/v1.0.0
```

## Changelog

- **CHANGELOG.md** (na raiz): decisões globais, entregas que afetam vários squads ou o projeto como um todo.
- **hubia-app/**: pode ter um `CHANGELOG.md` ou `RELEASES.md` dentro da pasta para histórico de versões só do app.

## Fluxo de trabalho sugerido

1. Trabalhar em branches (ex.: `feature/nova-tela`, `fix/hubia-login`).
2. Merge para `main` após review.
3. Quando for release do app: fazer tag `hubia-app/vX.Y.Z` em um commit estável de `main`.
4. Opcional: gerar notas de release a partir das mensagens de commit entre duas tags.

Com isso, as versões e o histórico ficam organizados em um único lugar, de forma profissional e fácil de manter.
