"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity-log";
import { dispatchTrigger } from "@/lib/triggers";
import { createClient } from "@/lib/supabase/server";
import type { ProjetoStatus, ProjetoTipo } from "@prisma/client";

// ─── Tipos exportados ─────────────────────────────────────────────────────────

export type ProjetoCard = {
  id: string;
  nome: string;
  descricao: string | null;
  tipo: ProjetoTipo;
  status: ProjetoStatus;
  createdAt: string;
  pedidosCount: number;
  pedidosPorStatus: Record<string, number>;
  metadata: Record<string, unknown>;
};

export type ProjetoDetail = ProjetoCard & {
  pedidos: {
    id: string;
    titulo: string;
    tipo: string;
    status: string;
    urgencia: string;
    dueAt: string | null;
    creator: { id: string; name: string } | null;
  }[];
};

export type CreateProjetoData = {
  nome: string;
  tipo: ProjetoTipo;
  descricao?: string;
  metadata?: Record<string, unknown>;
};

export type UpdateProjetoData = {
  nome?: string;
  descricao?: string;
  tipo?: ProjetoTipo;
  metadata?: Record<string, unknown>;
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getProjetos(organizationId: string): Promise<ProjetoCard[]> {
  const rows = await prisma.projeto.findMany({
    where: { organizationId },
    include: { _count: { select: { pedidos: true } }, pedidos: { select: { status: true } } },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((p) => {
    const porStatus: Record<string, number> = {};
    for (const pedido of p.pedidos) {
      porStatus[pedido.status] = (porStatus[pedido.status] ?? 0) + 1;
    }
    return {
      id: p.id,
      nome: p.nome,
      descricao: p.descricao,
      tipo: p.tipo,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
      pedidosCount: p._count.pedidos,
      pedidosPorStatus: porStatus,
      metadata: (p.metadata as Record<string, unknown>) ?? {},
    };
  });
}

export async function getProjetoById(organizationId: string, id: string): Promise<ProjetoDetail | null> {
  const p = await prisma.projeto.findFirst({
    where: { id, organizationId },
    include: {
      pedidos: {
        include: { creator: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!p) return null;

  const porStatus: Record<string, number> = {};
  for (const pedido of p.pedidos) {
    porStatus[pedido.status] = (porStatus[pedido.status] ?? 0) + 1;
  }

  return {
    id: p.id,
    nome: p.nome,
    descricao: p.descricao,
    tipo: p.tipo,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    pedidosCount: p.pedidos.length,
    pedidosPorStatus: porStatus,
    metadata: (p.metadata as Record<string, unknown>) ?? {},
    pedidos: p.pedidos.map((ped) => ({
      id: ped.id,
      titulo: ped.titulo,
      tipo: ped.tipo,
      status: ped.status,
      urgencia: ped.urgencia,
      dueAt: ped.dueAt?.toISOString() ?? null,
      creator: ped.creator ?? null,
    })),
  };
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createProjeto(
  organizationId: string,
  data: CreateProjetoData
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!data.nome.trim()) return { ok: false, error: "Nome é obrigatório" };

  const projeto = await prisma.projeto.create({
    data: {
      organizationId,
      nome: data.nome.trim(),
      descricao: data.descricao?.trim() ?? null,
      tipo: data.tipo,
      status: "ativo",
      metadata: (data.metadata ?? {}) as object,
      createdBy: user?.id ?? null,
    },
  });

  await logActivity({
    organizationId,
    userId: user?.id,
    action: "projeto.criado",
    entityType: "projeto",
    entityId: projeto.id,
    metadata: { nome: projeto.nome, tipo: projeto.tipo },
  });

  await dispatchTrigger({
    type: "projeto.criado",
    projetoId: projeto.id,
    nome: projeto.nome,
    organizationId,
    userId: user?.id,
  });

  revalidatePath("/projetos");
  return { ok: true, id: projeto.id };
}

export async function updateProjeto(
  organizationId: string,
  projetoId: string,
  data: UpdateProjetoData
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const existing = await prisma.projeto.findFirst({ where: { id: projetoId, organizationId } });
  if (!existing) return { ok: false, error: "Projeto não encontrado" };

  await prisma.projeto.update({
    where: { id: projetoId },
    data: {
      ...(data.nome !== undefined && { nome: data.nome }),
      ...(data.descricao !== undefined && { descricao: data.descricao }),
      ...(data.tipo !== undefined && { tipo: data.tipo }),
      ...(data.metadata !== undefined && { metadata: data.metadata as object }),
    },
  });

  await logActivity({
    organizationId,
    userId: user?.id,
    action: "projeto.editado",
    entityType: "projeto",
    entityId: projetoId,
    metadata: { campos: Object.keys(data) },
  });

  revalidatePath(`/projetos/${projetoId}`);
  return { ok: true };
}

export async function updateProjetoStatus(
  organizationId: string,
  projetoId: string,
  status: ProjetoStatus
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const existing = await prisma.projeto.findFirst({ where: { id: projetoId, organizationId } });
  if (!existing) return { ok: false, error: "Projeto não encontrado" };

  await prisma.projeto.update({ where: { id: projetoId }, data: { status } });

  await logActivity({
    organizationId,
    userId: user?.id,
    action: "projeto.status_alterado",
    entityType: "projeto",
    entityId: projetoId,
    metadata: { de: existing.status, para: status },
  });

  revalidatePath("/projetos");
  revalidatePath(`/projetos/${projetoId}`);
  return { ok: true };
}

export async function updateProjetoMetadata(
  organizationId: string,
  projetoId: string,
  section: string,
  value: unknown
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const existing = await prisma.projeto.findFirst({ where: { id: projetoId, organizationId } });
  if (!existing) return { ok: false, error: "Projeto não encontrado" };

  const currentMeta = (existing.metadata as Record<string, unknown>) ?? {};
  const newMeta = { ...currentMeta, [section]: value };

  await prisma.projeto.update({ where: { id: projetoId }, data: { metadata: newMeta as object } });

  await logActivity({
    organizationId,
    userId: user?.id,
    action: "projeto.editado",
    entityType: "projeto",
    entityId: projetoId,
    metadata: { secao: section },
  });

  revalidatePath(`/projetos/${projetoId}`);
  return { ok: true };
}

export async function deleteProjeto(
  organizationId: string,
  projetoId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const existing = await prisma.projeto.findFirst({ where: { id: projetoId, organizationId } });
  if (!existing) return { ok: false, error: "Projeto não encontrado" };

  await prisma.projeto.delete({ where: { id: projetoId } });

  await logActivity({
    organizationId,
    userId: user?.id,
    action: "projeto.deletado",
    entityType: "projeto",
    entityId: projetoId,
    metadata: { nome: existing.nome },
  });

  revalidatePath("/projetos");
  return { ok: true };
}
