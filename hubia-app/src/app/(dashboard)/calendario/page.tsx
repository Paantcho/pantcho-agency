import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import CalendarioClient from "./calendario-client";
import { getPedidosCalendario } from "./actions";

export default async function CalendarioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const member = user?.id
    ? await prisma.organizationMember.findFirst({ where: { userId: user.id, isActive: true } })
    : null;

  const organizationId = member?.organizationId ?? null;
  const agora = new Date();
  const pedidos = organizationId
    ? await getPedidosCalendario(organizationId, agora.getFullYear(), agora.getMonth() + 1)
    : [];

  return (
    <CalendarioClient
      organizationId={organizationId ?? ""}
      initialPedidos={pedidos}
      initialAno={agora.getFullYear()}
      initialMes={agora.getMonth() + 1}
    />
  );
}
