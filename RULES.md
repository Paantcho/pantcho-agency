# RULES.md — Regras Invioláveis

Este arquivo é carregado SEMPRE. Todo agente, todo squad, toda tarefa. Sem exceção.

---

## Protocolo de Memória (OBRIGATÓRIO)

**Antes de QUALQUER ação:**
1. Leia `memory/WORKING.md` — entenda o que está em andamento
2. Leia `memory/MEMORY.md` — entenda decisões anteriores e preferências do usuário
3. Leia `memory/LESSONS.md` — entenda erros passados e como evitá-los
4. Só então comece a trabalhar

**Depois de QUALQUER ação:**
1. Atualize `memory/WORKING.md` com o que foi feito e os próximos passos
2. Se houve decisão importante → salve em `memory/MEMORY.md`
3. Se houve correção do usuário → salve em `memory/LESSONS.md`

**Regra de ouro:** Se quer lembrar, escreva. Se precisa saber, leia. Nota mental não sobrevive.

---

## Regras de Comportamento

### 1. Nunca Assumir — Sempre Validar
Se falta informação para executar com qualidade, PARE e pergunte antes de agir.
- O escopo está claro?
- Tenho todas as informações necessárias?
- Há ambiguidade? → Pergunte.

### 2. Problema = Problema + Alternativas
Nunca apresente apenas um problema. Sempre traga no mínimo 2 alternativas com prós e contras.

❌ "A fonte não está disponível para web."

✅ "A fonte não está disponível para web.
   Opção A: Inter (gratuita, 95% similar).
   Opção B: Licença web original (~$50/ano).
   Recomendo A pelo custo-benefício. Qual prefere?"

### 3. Checkpoint de Progresso
Em tarefas que levam mais de 10 minutos, reporte status parcial. O usuário nunca deve ficar sem saber o que está acontecendo.

### 4. Qualidade Enterprise
Todo código e entrega deve estar num nível que uma equipe humana profissional aceitaria sem questionamento. Sem gambiarras. Sem "depois a gente arruma". Sem atalhos.

### 5. Consultar Documentação Oficial
Antes de implementar qualquer tecnologia, verifique a documentação oficial mais recente. Versões mudam, APIs deprecam.

### 6. Comunicação
- Português brasileiro sempre
- Tom profissional mas acessível
- O usuário é diretor de arte, não desenvolvedor — explique decisões técnicas em linguagem simples
- Nunca use jargão sem explicar

---

## Ciclo Plan-Execute-Reflect (OBRIGATÓRIO)

Todo trabalho segue 3 fases:

### PLAN (Planejar)
Antes de executar qualquer coisa, criar lista de tarefas no WORKING.md:
```
## Plano de Execução
- [ ] Tarefa 1 — descrição clara
- [ ] Tarefa 2 — descrição clara
- [ ] Tarefa 3 — descrição clara
```
Para tarefas simples (< 5 min), pode executar direto sem plano formal.

### EXECUTE (Executar)
- Marcar cada tarefa ao iniciar e ao concluir
- **Regra crítica: se disse que vai fazer, faça neste mesmo turno.** Sem prometer e depois esquecer.
- Atualizar WORKING.md a cada tarefa concluída
- Se tarefas são independentes, executar em paralelo

### REFLECT (Refletir)
Após executar, ANTES de entregar:
- O resultado atende ao que foi pedido?
- Algo ficou faltando?
- A qualidade está no nível enterprise?
- Pergunta: "Um engenheiro sênior aprovaria isso?"
- Se NÃO em qualquer uma → voltar ao EXECUTE e corrigir

**Sem Reflect, não entrega.**

---

## Regras de Execução

1. **Se disse que vai fazer, faça agora.** Nunca prometa algo e deixe pra depois.
2. **Status updates constantes.** Reportar progresso antes e depois de cada bloco de trabalho.
3. **Paralelize quando possível.** Se tarefas não dependem uma da outra, execute simultaneamente.
4. **Marque conclusão imediatamente.** Ao terminar uma tarefa, atualize o status no WORKING.md antes de seguir pra próxima.
5. **Pule com justificativa.** Se decidir pular uma tarefa, explique em uma linha o porquê.

---

## Regra de Contexto (40%)

A janela de contexto nunca deve ultrapassar 40% de ocupação:
- Carregue skills apenas quando necessárias para a tarefa atual
- Use subagents para trabalho pesado
- Subagents retornam apenas o resumo, não o processo completo
- Ao terminar uma skill, libere o contexto

---

## Resolve Before Returning

Continue trabalhando até resolver completamente a tarefa. Só pare e peça input do usuário quando realmente precisar de uma decisão que só ele pode tomar (aprovação de design, conteúdo faltando, ambiguidade no briefing).

Decisões técnicas dentro da sua competência — tome sozinho e documente.

Não pergunte "quer que eu faça X?" quando X é claramente parte da tarefa. Faça, informe que fez, e siga.

---

## Self-Improvement Loop (OBRIGATÓRIO)

Após QUALQUER correção do usuário:
1. Identifique o padrão do erro
2. Escreva uma regra que previne o mesmo erro
3. Salve em `memory/LESSONS.md`
4. Revise LESSONS.md no início de sessões relevantes

---

## Segurança (Inviolável)

- NUNCA expor chaves de API, senhas, tokens em código
- Sempre usar variáveis de ambiente (.env.local)
- .env.local SEMPRE no .gitignore
- Validar inputs do usuário server-side
- Usar Zod para validação de schemas
- Seguir OWASP Top 10
- HTTPS obrigatório em produção
