import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import RelatorioClient from "./relatorio-client";
import { getRelatorioStats } from "./actions";

export default async function RelatorioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const member = user?.id
    ? await prisma.organizationMember.findFirst({ where: { userId: user.id, isActive: true } })
    : null;

  const organizationId = member?.organizationId ?? null;
  const stats = organizationId ? await getRelatorioStats(organizationId) : {
    totalPedidos: 0, emAndamento: 0, entreguesMes: 0, creatorsAtivos: 0, projetos: 0,
    pedidosPorStatus: [], pedidosPorTipo: [], pedidosPorUrgencia: [],
    activityRecente: [], pedidosRecentes: [],
  };

  return <RelatorioClient organizationId={organizationId ?? ""} initialStats={stats} />;
}
