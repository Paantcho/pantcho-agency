"use server";

import { prisma } from "@/lib/prisma";

export type CalendarioPedido = {
  id: string;
  titulo: string;
  tipo: string;
  urgencia: string;
  status: string;
  dueAt: string;
  creator: { id: string; name: string; avatarUrl: string | null } | null;
  projeto: { id: string; nome: string } | null;
};

export async function getPedidosCalendario(
  organizationId: string,
  ano: number,
  mes: number
): Promise<CalendarioPedido[]> {
  const inicio = new Date(ano, mes - 1, 1);
  const fim = new Date(ano, mes, 0, 23, 59, 59);

  const rows = await prisma.pedido.findMany({
    where: {
      organizationId,
      dueAt: { gte: inicio, lte: fim },
      status: { notIn: ["cancelado"] },
    },
    include: {
      creator: { select: { id: true, name: true, avatarUrl: true } },
      projeto: { select: { id: true, nome: true } },
    },
    orderBy: { dueAt: "asc" },
  });

  return rows.map((p) => ({
    id: p.id,
    titulo: p.titulo,
    tipo: p.tipo,
    urgencia: p.urgencia,
    status: p.status,
    dueAt: p.dueAt!.toISOString(),
    creator: p.creator ?? null,
    projeto: p.projeto ?? null,
  }));
}
