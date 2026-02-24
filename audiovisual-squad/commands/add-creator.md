# /add-creator
Trigger: nova creator, adicionar creator, novo personagem, criar creator

## Fluxo
Orquestrador → Criador de Agentes

Criador de Agentes:
1. Coletar: nome, aparência detalhada, personalidade, ambientes, estilo, carro
2. Criar: `memory/creators/[nome]/APPEARANCE.md`
3. Criar: `memory/creators/[nome]/AMBIENTES.md`
4. Criar: `memory/creators/[nome]/PROMPT-LIBRARY.md` (vazio)
5. Registrar creator no AGENTS.md
6. Confirmar com usuário

Output: creator completamente documentada e pronta para o sistema usar
