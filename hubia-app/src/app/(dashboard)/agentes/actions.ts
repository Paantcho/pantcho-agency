"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentOrganizationId } from "@/lib/auth-organization";

// ─── Tipos exportados para o client ──────────────────────────────
export interface AgentItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "ativo" | "inativo" | "rascunho";
  tags: string[];
}

export interface SquadWithAgents {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  status: "ativo" | "em_breve" | "planejado";
  agents: AgentItem[];
}

export interface SkillItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isAlways: boolean;
}

export interface SkillsBySquad {
  squad: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    color: string | null;
  };
  skills: SkillItem[];
}

// ─── Busca squads com agentes ─────────────────────────────────────
export async function getSquadsWithAgents(): Promise<SquadWithAgents[]> {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return [];

  const squads = await prisma.squad.findMany({
    where: { organizationId, status: "ativo" },
    orderBy: { createdAt: "asc" },
    include: {
      agents: {
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              status: true,
              config: true,
            },
          },
        },
      },
    },
  });

  return squads.map((squad) => ({
    id: squad.id,
    name: squad.name,
    slug: squad.slug,
    description: squad.description,
    icon: squad.icon,
    color: squad.color,
    status: squad.status as SquadWithAgents["status"],
    agents: squad.agents.map(({ agent }) => ({
      id: agent.id,
      name: agent.name,
      slug: agent.slug,
      description: agent.description,
      status: agent.status as AgentItem["status"],
      tags: (agent.config as { tags?: string[] })?.tags ?? [],
    })),
  }));
}

// ─── Busca skills agrupadas por squad ────────────────────────────
export async function getSkillsBySquad(): Promise<SkillsBySquad[]> {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return [];

  // Buscamos todos os squads ativos e todos os agentes que têm skills
  const squads = await prisma.squad.findMany({
    where: { organizationId, status: "ativo" },
    orderBy: { createdAt: "asc" },
    include: {
      agents: {
        include: {
          agent: {
            include: {
              skills: {
                include: {
                  skill: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                      description: true,
                      config: true,
                      isActive: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return squads.map((squad) => {
    // Deduplica skills do squad (vários agentes podem ter a mesma skill)
    const skillMap = new Map<string, SkillItem>();
    for (const { agent } of squad.agents) {
      for (const { skill } of agent.skills) {
        if (!skillMap.has(skill.id) && skill.isActive) {
          skillMap.set(skill.id, {
            id: skill.id,
            name: skill.name,
            slug: skill.slug,
            description: skill.description,
            isAlways: (skill.config as { always?: boolean })?.always === true,
          });
        }
      }
    }

    return {
      squad: {
        id: squad.id,
        name: squad.name,
        slug: squad.slug,
        icon: squad.icon,
        color: squad.color,
      },
      skills: Array.from(skillMap.values()),
    };
  });
}
