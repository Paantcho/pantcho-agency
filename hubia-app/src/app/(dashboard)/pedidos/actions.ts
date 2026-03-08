"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity-log";
import { dispatchTrigger } from "@/lib/triggers";
import { createClient } from "@/lib/supabase/server";
import type { PedidoStatus, PedidoTipo, PedidoUrgencia, PedidoSourceType } from "@prisma/client";

export type PedidoCard = {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: PedidoTipo;
  status: PedidoStatus;
  urgencia: PedidoUrgencia;
  sourceType: PedidoSourceType;
  dueAt: string | null;
  createdAt: string;
  creator: { id: string; name: string; avatarUrl: string | null } | null;
  projeto: { id: string; nome: string } | null;
  outputsCount: number;
};

export type PedidoDetail = PedidoCard & {
  briefing: Record<string, unknown>;
  sourcePayload: Record<string, unknown>;
  completedAt: string | null;
  outputs: {
    id: string;
    prompt: string;
    result: string | null;
    status: string;
    createdAt: string;
  }[];
  history: {
    id: string;
    action: string;
    metadata: Record<string, unknown>;
    createdAt: string;
  }[];
};

export async function getPedidos(organizationId: string, status?: PedidoStatus): Promise<PedidoCard[]> {
  const rows = await prisma.pedido.findMany({
    where: {
      organizationId,
      ...(status ? { status } : {}),
    },
    include: {
      creator: { select: { id: true, name: true, avatarUrl: true } },
      projeto: { select: { id: true, nome: true } },
      _count: { select: { outputs: true } },
    },
    orderBy: [{ urgencia: "desc" }, { createdAt: "desc" }],
  });

  return rows.map((p) => ({
    id: p.id,
    titulo: p.titulo,
    descricao: p.descricao,
    tipo: p.tipo,
    status: p.status,
    urgencia: p.urgencia,
    sourceType: p.sourceType,
    dueAt: p.dueAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    creator: p.creator ?? null,
    projeto: p.projeto ?? null,
    outputsCount: p._count.outputs,
  }));
}

export async function getPedidoById(organizationId: string, id: string): Promise<PedidoDetail | null> {
  const p = await prisma.pedido.findFirst({
    where: { id, organizationId },
    include: {
      creator: { select: { id: true, name: true, avatarUrl: true } },
      projeto: { select: { id: true, nome: true } },
      outputs: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!p) return null;

  const history = await prisma.activityLog.findMany({
    where: { entityType: "pedido", entityId: id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return {
    id: p.id,
    titulo: p.titulo,
    descricao: p.descricao,
    tipo: p.tipo,
    status: p.status,
    urgencia: p.urgencia,
    sourceType: p.sourceType,
    sourcePayload: p.sourcePayload as Record<string, unknown>,
    briefing: p.briefing as Record<string, unknown>,
    dueAt: p.dueAt?.toISOString() ?? null,
    completedAt: p.completedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    creator: p.creator ?? null,
    projeto: p.projeto ?? null,
    outputsCount: p.outputs.length,
    outputs: p.outputs.map((o) => ({
      id: o.id,
      prompt: o.prompt,
      result: o.result,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    })),
    history: history.map((h) => ({
      id: h.id,
      action: h.action,
      metadata: h.metadata as Record<string, unknown>,
      createdAt: h.createdAt.toISOString(),
    })),
  };
}

export async function createPedido(
  organizationId: string,
  data: {
    titulo: string;
    descricao?: string;
    tipo: PedidoTipo;
    urgencia: PedidoUrgencia;
    creatorId?: string;
    projetoId?: string;
    dueAt?: string;
  }
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!data.titulo.trim()) return { ok: false, error: "Título é obrigatório" };

  const pedido = await prisma.pedido.create({
    data: {
      organizationId,
      titulo: data.titulo.trim(),
      descricao: data.descricao?.trim() ?? null,
      tipo: data.tipo,
      urgencia: data.urgencia,
      status: "rascunho",
      sourceType: "manual",
      creatorId: data.creatorId ?? null,
      projetoId: data.projetoId ?? null,
      dueAt: data.dueAt ? new Date(data.dueAt) : null,
      createdBy: user?.id ?? null,
    },
  });

  await dispatchTrigger({
    type: "pedido.criado",
    pedidoId: pedido.id,
    titulo: pedido.titulo,
    sourceType: "manual",
    organizationId,
    userId: user?.id,
  });

  revalidatePath("/pedidos");
  return { ok: true, id: pedido.id };
}

export async function updatePedidoStatus(
  organizationId: string,
  pedidoId: string,
  status: PedidoStatus
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const existing = await prisma.pedido.findFirst({ where: { id: pedidoId, organizationId } });
  if (!existing) return { ok: false, error: "Pedido não encontrado" };

  await prisma.pedido.update({
    where: { id: pedidoId },
    data: {
      status,
      ...(status === "entregue" ? { completedAt: new Date() } : {}),
    },
  });

  await dispatchTrigger({
    type: "pedido.status_alterado",
    pedidoId,
    titulo: existing.titulo,
    statusAnterior: existing.status,
    statusNovo: status,
    organizationId,
    userId: user?.id,
  });

  revalidatePath("/pedidos");
  revalidatePath(`/pedidos/${pedidoId}`);
  return { ok: true };
}

export async function updatePedido(
  organizationId: string,
  pedidoId: string,
  data: {
    titulo?: string;
    descricao?: string;
    tipo?: PedidoTipo;
    urgencia?: PedidoUrgencia;
    creatorId?: string | null;
    projetoId?: string | null;
    dueAt?: string | null;
    briefing?: Record<string, unknown>;
  }
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const existing = await prisma.pedido.findFirst({ where: { id: pedidoId, organizationId } });
  if (!existing) return { ok: false, error: "Pedido não encontrado" };

  await prisma.pedido.update({
    where: { id: pedidoId },
    data: {
      ...(data.titulo ? { titulo: data.titulo.trim() } : {}),
      ...(data.descricao !== undefined ? { descricao: data.descricao?.trim() || null } : {}),
      ...(data.tipo ? { tipo: data.tipo } : {}),
      ...(data.urgencia ? { urgencia: data.urgencia } : {}),
      ...(data.creatorId !== undefined ? { creatorId: data.creatorId ?? null } : {}),
      ...(data.projetoId !== undefined ? { projetoId: data.projetoId ?? null } : {}),
      ...(data.dueAt !== undefined ? { dueAt: data.dueAt ? new Date(data.dueAt) : null } : {}),
      ...(data.briefing ? { briefing: data.briefing as object } : {}),
    },
  });

  await logActivity({
    organizationId,
    userId: user?.id,
    action: "pedido.atualizado",
    entityType: "pedido",
    entityId: pedidoId,
    metadata: { campos: Object.keys(data) },
  });

  revalidatePath("/pedidos");
  revalidatePath(`/pedidos/${pedidoId}`);
  return { ok: true };
}

export async function deletePedido(
  organizationId: string,
  pedidoId: string
): Promise<{ ok: boolean; error?: string }> {
  const existing = await prisma.pedido.findFirst({ where: { id: pedidoId, organizationId } });
  if (!existing) return { ok: false, error: "Pedido não encontrado" };

  await prisma.pedido.delete({ where: { id: pedidoId } });

  await logActivity({
    organizationId,
    action: "pedido.deletado",
    entityType: "pedido",
    entityId: pedidoId,
    metadata: { titulo: existing.titulo },
  });

  revalidatePath("/pedidos");
  return { ok: true };
}

export async function getCreatoresParaSelect(organizationId: string) {
  return prisma.creator.findMany({
    where: { organizationId, isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getProjetosParaSelect(organizationId: string) {
  return prisma.projeto.findMany({
    where: { organizationId, status: "ativo" },
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });
}
