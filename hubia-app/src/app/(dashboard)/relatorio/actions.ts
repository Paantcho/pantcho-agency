"use server";

import { prisma } from "@/lib/prisma";

export type RelatorioStats = {
  totalPedidos: number;
  emAndamento: number;
  entreguesMes: number;
  creatorsAtivos: number;
  projetos: number;
  pedidosPorStatus: { status: string; count: number }[];
  pedidosPorTipo: { tipo: string; count: number }[];
  pedidosPorUrgencia: { urgencia: string; count: number }[];
  activityRecente: {
    id: string;
    action: string;
    entityType: string | null;
    metadata: Record<string, unknown>;
    createdAt: string;
  }[];
  pedidosRecentes: {
    id: string;
    titulo: string;
    status: string;
    urgencia: string;
    createdAt: string;
    creator: { name: string } | null;
  }[];
};

export async function getRelatorioStats(
  organizationId: string,
  periodo: "semana" | "mes" | "trimestre" = "mes"
): Promise<RelatorioStats> {
  const agora = new Date();
  const inicio = new Date(agora);
  if (periodo === "semana") inicio.setDate(agora.getDate() - 7);
  else if (periodo === "mes") inicio.setMonth(agora.getMonth() - 1);
  else inicio.setMonth(agora.getMonth() - 3);

  const [
    totalPedidos,
    emAndamento,
    entreguesMes,
    creatorsAtivos,
    totalProjetos,
    pedidosGrupoStatus,
    pedidosGrupoTipo,
    pedidosGrupoUrgencia,
    activityLogs,
    pedidosRecentes,
  ] = await Promise.all([
    prisma.pedido.count({ where: { organizationId } }),
    prisma.pedido.count({ where: { organizationId, status: "em_andamento" } }),
    prisma.pedido.count({
      where: {
        organizationId,
        status: "entregue",
        completedAt: { gte: inicio },
      },
    }),
    prisma.creator.count({ where: { organizationId, isActive: true } }),
    prisma.projeto.count({ where: { organizationId } }),
    prisma.pedido.groupBy({
      by: ["status"],
      where: { organizationId },
      _count: { id: true },
    }),
    prisma.pedido.groupBy({
      by: ["tipo"],
      where: { organizationId },
      _count: { id: true },
    }),
    prisma.pedido.groupBy({
      by: ["urgencia"],
      where: { organizationId },
      _count: { id: true },
    }),
    prisma.activityLog.findMany({
      where: { organizationId, createdAt: { gte: inicio } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.pedido.findMany({
      where: { organizationId },
      include: { creator: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return {
    totalPedidos,
    emAndamento,
    entreguesMes,
    creatorsAtivos,
    projetos: totalProjetos,
    pedidosPorStatus: pedidosGrupoStatus.map((g) => ({
      status: g.status,
      count: g._count.id,
    })),
    pedidosPorTipo: pedidosGrupoTipo.map((g) => ({
      tipo: g.tipo,
      count: g._count.id,
    })),
    pedidosPorUrgencia: pedidosGrupoUrgencia.map((g) => ({
      urgencia: g.urgencia,
      count: g._count.id,
    })),
    activityRecente: activityLogs.map((a) => ({
      id: a.id,
      action: a.action,
      entityType: a.entityType,
      metadata: a.metadata as Record<string, unknown>,
      createdAt: a.createdAt.toISOString(),
    })),
    pedidosRecentes: pedidosRecentes.map((p) => ({
      id: p.id,
      titulo: p.titulo,
      status: p.status,
      urgencia: p.urgencia,
      createdAt: p.createdAt.toISOString(),
      creator: p.creator ?? null,
    })),
  };
}
