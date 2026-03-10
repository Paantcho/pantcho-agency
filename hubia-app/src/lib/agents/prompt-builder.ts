// ============================================================
// HUBIA — Prompt Builder
// Monta system prompt completo: SOUL (systemPrompt do banco)
// + skills associadas + contexto de memória
// ============================================================

import { prisma } from "@/lib/prisma";

/**
 * Monta o system prompt completo de um agente.
 * Concatena: systemPrompt (SOUL) + skills ativas + contexto.
 */
export async function buildSystemPrompt(
  agentId: string,
  organizationId: string
): Promise<string> {
  // Buscar agente com skills
  const agent = await prisma.agent.findFirst({
    where: { id: agentId, organizationId },
    include: {
      skills: {
        include: { skill: true },
        where: { skill: { isActive: true } },
      },
    },
  });

  if (!agent) throw new Error(`Agente não encontrado: ${agentId}`);

  const parts: string[] = [];

  // 1. System prompt base (SOUL.md do agente)
  if (agent.systemPrompt) {
    parts.push(agent.systemPrompt);
  }

  // 2. Skills ativas associadas
  if (agent.skills.length > 0) {
    parts.push("\n---\n## Skills Carregadas\n");
    for (const as of agent.skills) {
      const skill = as.skill;
      parts.push(`### ${skill.name}`);
      if (skill.description) parts.push(skill.description);
      const config = skill.config as Record<string, unknown>;
      if (config && typeof config === "object" && config.content) {
        parts.push(String(config.content));
      }
    }
  }

  // 3. Contexto da organização
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { name: true, slug: true },
  });

  if (org) {
    parts.push(`\n---\n## Contexto da Organização\n- Nome: ${org.name}\n- Slug: ${org.slug}`);
  }

  return parts.join("\n\n");
}
