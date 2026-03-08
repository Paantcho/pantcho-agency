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

// ─── Detalhe completo de um agente ───────────────────────────────
export interface AgentDetail extends AgentItem {
  systemPrompt: string | null;
  squads: { id: string; name: string; slug: string; color: string | null }[];
  skills: SkillItem[];
}

export async function getAgentBySlug(slug: string): Promise<AgentDetail | null> {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return null;

  const agent = await prisma.agent.findFirst({
    where: { organizationId, slug },
    include: {
      squads: { include: { squad: { select: { id: true, name: true, slug: true, color: true } } } },
      skills: {
        include: {
          skill: { select: { id: true, name: true, slug: true, description: true, config: true, isActive: true } },
        },
      },
    },
  });

  if (!agent) return null;

  return {
    id: agent.id,
    name: agent.name,
    slug: agent.slug,
    description: agent.description,
    systemPrompt: agent.systemPrompt,
    status: agent.status as AgentItem["status"],
    tags: (agent.config as { tags?: string[] })?.tags ?? [],
    squads: agent.squads.map(({ squad }) => ({
      id: squad.id,
      name: squad.name,
      slug: squad.slug,
      color: squad.color,
    })),
    skills: agent.skills
      .filter(({ skill }) => skill.isActive)
      .map(({ skill }) => ({
        id: skill.id,
        name: skill.name,
        slug: skill.slug,
        description: skill.description,
        isAlways: (skill.config as { always?: boolean })?.always === true,
      })),
  };
}

// ─── Adicionar versão de documento do agente ─────────────────────
export async function saveAgentDocVersion(data: {
  agentId: string;
  docKey: string;
  content: string;
  changedBy?: string;
}): Promise<{ success: boolean; version?: number; error?: string }> {
  try {
    const organizationId = await getCurrentOrganizationId();
    if (!organizationId) return { success: false, error: "Sem organização ativa" };

    // Conta versões existentes para este doc deste agente
    const existingCount = await prisma.entityVersion.count({
      where: {
        organizationId,
        entityType: `agent_doc_${data.docKey}`,
        entityId: data.agentId,
      },
    });

    const nextVersion = existingCount + 1;

    await prisma.entityVersion.create({
      data: {
        organizationId,
        entityType: `agent_doc_${data.docKey}`,
        entityId: data.agentId,
        version: nextVersion,
        data: { content: data.content, docKey: data.docKey },
        changedBy: data.changedBy ?? null,
      },
    });

    return { success: true, version: nextVersion };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    return { success: false, error: msg };
  }
}

// ─── Buscar histórico de versões de um doc ────────────────────────
export interface DocVersion {
  id: string;
  version: number;
  content: string;
  createdAt: string;
}

export async function getAgentDocVersions(
  agentId: string,
  docKey: string
): Promise<DocVersion[]> {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return [];

  const versions = await prisma.entityVersion.findMany({
    where: {
      organizationId,
      entityType: `agent_doc_${docKey}`,
      entityId: agentId,
    },
    orderBy: { version: "desc" },
    take: 10,
  });

  return versions.map((v) => ({
    id: v.id,
    version: v.version,
    content: (v.data as { content: string }).content ?? "",
    createdAt: v.createdAt.toISOString(),
  }));
}

// ─── Criar novo agente ────────────────────────────────────────────
export async function createAgent(data: {
  name: string;
  slug: string;
  description: string;
  squadId: string | null;
  tags: string[];
  status: "ativo" | "inativo" | "rascunho";
}): Promise<{ success: boolean; agentSlug?: string; error?: string }> {
  try {
    const organizationId = await getCurrentOrganizationId();
    if (!organizationId) return { success: false, error: "Sem organização ativa" };

    // Verifica duplicidade de slug
    const existing = await prisma.agent.findFirst({
      where: { organizationId, slug: data.slug },
    });
    if (existing) {
      return { success: false, error: `Já existe um agente com o slug "${data.slug}"` };
    }

    const agent = await prisma.agent.create({
      data: {
        organizationId,
        name: data.name.trim(),
        slug: data.slug,
        description: data.description.trim() || null,
        status: data.status,
        config: { tags: data.tags },
      },
    });

    if (data.squadId) {
      await prisma.squadAgent.create({
        data: { squadId: data.squadId, agentId: agent.id },
      });
    }

    return { success: true, agentSlug: agent.slug };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    return { success: false, error: msg };
  }
}

// ─── Detalhe completo de um squad ────────────────────────────────
export interface SquadDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  status: "ativo" | "em_breve" | "planejado";
  agents: AgentItem[];
}

export async function getSquadBySlug(slug: string): Promise<SquadDetail | null> {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return null;

  const squad = await prisma.squad.findFirst({
    where: { organizationId, slug },
    include: {
      agents: {
        include: {
          agent: {
            select: { id: true, name: true, slug: true, description: true, status: true, config: true },
          },
        },
      },
    },
  });

  if (!squad) return null;

  return {
    id: squad.id,
    name: squad.name,
    slug: squad.slug,
    description: squad.description,
    icon: squad.icon,
    color: squad.color,
    status: squad.status as SquadDetail["status"],
    agents: squad.agents.map(({ agent }) => ({
      id: agent.id,
      name: agent.name,
      slug: agent.slug,
      description: agent.description,
      status: agent.status as AgentItem["status"],
      tags: (agent.config as { tags?: string[] })?.tags ?? [],
    })),
  };
}

// ─── Todos os agentes da organização (para adicionar a squads) ───
export async function getAllAgents(): Promise<AgentItem[]> {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return [];

  const agents = await prisma.agent.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, description: true, status: true, config: true },
  });

  return agents.map((agent) => ({
    id: agent.id,
    name: agent.name,
    slug: agent.slug,
    description: agent.description,
    status: agent.status as AgentItem["status"],
    tags: (agent.config as { tags?: string[] })?.tags ?? [],
  }));
}

// ─── Adicionar agente a um squad ──────────────────────────────────
export async function addAgentToSquad(
  squadId: string,
  agentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const organizationId = await getCurrentOrganizationId();
    if (!organizationId) return { success: false, error: "Sem organização ativa" };

    await prisma.squadAgent.upsert({
      where: { squadId_agentId: { squadId, agentId } },
      create: { squadId, agentId },
      update: {},
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Erro desconhecido" };
  }
}

// ─── Remover agente de um squad ───────────────────────────────────
export async function removeAgentFromSquad(
  squadId: string,
  agentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.squadAgent.deleteMany({ where: { squadId, agentId } });
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Erro desconhecido" };
  }
}

// ─── Criar novo squad ─────────────────────────────────────────────
export async function createSquad(data: {
  name: string;
  slug: string;
  description: string;
  status: "ativo" | "em_breve" | "planejado";
}): Promise<{ success: boolean; squadSlug?: string; error?: string }> {
  try {
    const organizationId = await getCurrentOrganizationId();
    if (!organizationId) return { success: false, error: "Sem organização ativa" };

    const existing = await prisma.squad.findFirst({ where: { organizationId, slug: data.slug } });
    if (existing) return { success: false, error: `Já existe um squad com o slug "${data.slug}"` };

    const squad = await prisma.squad.create({
      data: {
        organizationId,
        name: data.name.trim(),
        slug: data.slug,
        description: data.description || null,
        status: data.status,
      },
    });

    return { success: true, squadSlug: squad.slug };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Erro desconhecido" };
  }
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
