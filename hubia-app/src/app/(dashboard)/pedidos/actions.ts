"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentOrganizationId } from "@/lib/auth-organization";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type PedidoRow = {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: string;
  status: string;
  urgencia: string;
  creatorName: string | null;
  projetoNome: string | null;
  dueAt: Date | null;
  createdAt: Date;
};

const STATUS_LABELS: Record<string, string> = {
  rascunho: "Rascunho",
  aguardando: "Aguardando",
  em_andamento: "Em andamento",
  revisao: "Em revisão",
  aprovado: "Aprovado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const TIPO_LABELS: Record<string, string> = {
  imagem: "Imagem",
  video: "Vídeo",
  landing_page: "Landing Page",
  app: "App",
  site: "Site",
  sistema: "Sistema",
  outro: "Outro",
};

export function getStatusLabels() {
  return STATUS_LABELS;
}

export function getTipoLabels() {
  return TIPO_LABELS;
}

export async function getPedidos(): Promise<PedidoRow[]> {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return [];

  const pedidos = await prisma.pedido.findMany({
    where: { organizationId },
    include: {
      creator: { select: { name: true } },
      projeto: { select: { nome: true } },
    },
    orderBy: [{ urgencia: "desc" }, { createdAt: "desc" }],
  });

  return pedidos.map((p: {
    id: string;
    titulo: string;
    descricao: string | null;
    tipo: string;
    status: string;
    urgencia: string;
    dueAt: Date | null;
    createdAt: Date;
    creator: { name: string } | null;
    projeto: { nome: string } | null;
  }) => ({
    id: p.id,
    titulo: p.titulo,
    descricao: p.descricao,
    tipo: p.tipo,
    status: p.status,
    urgencia: p.urgencia,
    creatorName: p.creator?.name || null,
    projetoNome: p.projeto?.nome || null,
    dueAt: p.dueAt,
    createdAt: p.createdAt,
  }));
}

export async function getCreatorsForSelect(): Promise<
  { id: string; name: string }[]
> {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return [];

  const creators = await prisma.creator.findMany({
    where: { organizationId, isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return creators;
}

export async function createPedido(data: {
  titulo: string;
  descricao?: string;
  tipo: string;
  urgencia: string;
  creatorId?: string;
  dueAt?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return { ok: false, error: "Sem organização" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!data.titulo?.trim()) {
    return { ok: false, error: "Título é obrigatório" };
  }

  await prisma.pedido.create({
    data: {
      organizationId,
      titulo: data.titulo.trim(),
      descricao: data.descricao?.trim() || null,
      tipo: data.tipo as "imagem",
      urgencia: data.urgencia as "media",
      status: "rascunho",
      creatorId: data.creatorId || null,
      dueAt: data.dueAt ? new Date(data.dueAt) : null,
      createdBy: user?.id || null,
    },
  });

  revalidatePath("/pedidos");
  revalidatePath("/");
  return { ok: true };
}

export async function updatePedidoStatus(
  pedidoId: string,
  status: string
): Promise<{ ok: boolean; error?: string }> {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return { ok: false, error: "Sem organização" };

  const existing = await prisma.pedido.findFirst({
    where: { id: pedidoId, organizationId },
  });
  if (!existing) return { ok: false, error: "Pedido não encontrado" };

  await prisma.pedido.update({
    where: { id: pedidoId },
    data: {
      status: status as "rascunho",
      ...(status === "entregue" ? { completedAt: new Date() } : {}),
    },
  });

  revalidatePath("/pedidos");
  revalidatePath("/");
  return { ok: true };
}

export async function deletePedido(
  pedidoId: string
): Promise<{ ok: boolean; error?: string }> {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return { ok: false, error: "Sem organização" };

  const existing = await prisma.pedido.findFirst({
    where: { id: pedidoId, organizationId },
  });
  if (!existing) return { ok: false, error: "Pedido não encontrado" };

  await prisma.pedido.delete({ where: { id: pedidoId } });

  revalidatePath("/pedidos");
  revalidatePath("/");
  return { ok: true };
}
