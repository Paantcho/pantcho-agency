import { prisma } from "@/lib/prisma";
import { getCurrentOrganizationId } from "@/lib/auth-organization";

const ACTIVE_STATUSES = [
  "rascunho",
  "aguardando",
  "em_andamento",
  "revisao",
  "aprovado",
] as const;

export async function getDashboardData(organizationId: string | null) {
  if (!organizationId) {
    return {
      pedidosAtivos: 0,
      promptsGerados: 0,
      creatorsAtivos: 0,
      creatorsNomes: "",
      agentesCount: 0,
      emAndamento: [] as { titulo: string; subtitulo: string }[],
      atividadeRecente: [] as { title: string; meta: string; dot: string }[],
      pedidosPrioritarios: [] as {
        id: string;
        badge: string;
        badgeClass: string;
        title: string;
        desc: string;
        status: string;
        pct: number;
      }[],
    };
  }

  const [pedidosAtivos, promptsGerados, creators, agents, emAndamentoList, activityLogs, pedidos] =
    await Promise.all([
      prisma.pedido.count({
        where: {
          organizationId,
          status: { in: [...ACTIVE_STATUSES] },
        },
      }),
      prisma.promptOutput.count({
        where: { organizationId },
      }),
      prisma.creator.findMany({
        where: { organizationId, isActive: true },
        select: { name: true },
        orderBy: { name: "asc" },
      }),
      prisma.agent.count({
        where: { organizationId, status: "ativo" },
      }),
      prisma.pedido.findMany({
        where: { organizationId, status: "em_andamento" },
        select: { titulo: true, descricao: true },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.activityLog.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.pedido.findMany({
        where: {
          organizationId,
          status: { in: ["aguardando", "em_andamento", "revisao"] },
        },
        orderBy: [{ urgencia: "desc" }, { createdAt: "desc" }],
        take: 3,
      }),
    ]);

  const emAndamento = emAndamentoList.map((p) => ({
    titulo: p.titulo.toUpperCase().replace(/\.[^/.]+$/, ""),
    subtitulo: p.descricao
      ? `${p.descricao.slice(0, 50)}${p.descricao.length > 50 ? "…" : ""}`
      : "—",
  }));

  const urgenciaBadge: Record<string, { badge: string; class: string }> = {
    critica: { badge: "URGENTE", class: "bg-red-200 text-ink-500" },
    alta: { badge: "ALTA", class: "bg-orange-500/20 text-ink-500" },
    media: { badge: "EM PROGRESSO", class: "bg-indigo-50 text-ink-500" },
    baixa: { badge: "BACKLOG", class: "bg-base-500 text-ink-500" },
  };

  const atividadeRecente = activityLogs.map((a) => ({
    title: a.action,
    meta: new Date(a.createdAt).toLocaleString("pt-BR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
    dot: "bg-limao-500",
  }));

  const pedidosPrioritarios = pedidos.map((p) => {
    const b = urgenciaBadge[p.urgencia] ?? urgenciaBadge.media;
    const statusLabel =
      p.status === "em_andamento"
        ? "Em andamento"
        : p.status === "revisao"
          ? "Em revisão"
          : "Aguardando";
    const pct =
      p.status === "entregue"
        ? 100
        : p.status === "em_andamento"
          ? 50
          : p.status === "revisao"
            ? 80
            : 20;
    return {
      id: p.id.slice(0, 8),
      badge: b.badge,
      badgeClass: b.class,
      title: p.titulo,
      desc: p.descricao ?? "—",
      status: statusLabel,
      pct,
    };
  });

  const skillsCount = await prisma.skill.count({
    where: { organizationId },
  });

  return {
    pedidosAtivos,
    promptsGerados,
    creatorsAtivos: creators.length,
    creatorsNomes: creators.map((c) => c.name).join(" • ") || "—",
    agentesCount: agents,
    skillsCount,
    emAndamento,
    atividadeRecente,
    pedidosPrioritarios,
  };
}
