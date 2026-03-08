"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity-log";
import { dispatchTrigger } from "@/lib/triggers";
import { createClient } from "@/lib/supabase/server";
import type { ProjetoStatus } from "@prisma/client";

export type ProjetoCard = {
  id: string;
  nome: string;
  descricao: string | null;
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

export async function createProjeto(
  organizationId: string,
  data: { nome: string; descricao?: string; metadata?: Record<string, unknown> }
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!data.nome.trim()) return { ok: false, error: "Nome é obrigatório" };

  const projeto = await prisma.projeto.create({
    data: {
      organizationId,
      nome: data.nome.trim(),
      descricao: data.descricao?.trim() ?? null,
      status: "ativo",
      metadata: (data.metadata ?? {}) as object,
      createdBy: user?.id ?? null,
    },
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
