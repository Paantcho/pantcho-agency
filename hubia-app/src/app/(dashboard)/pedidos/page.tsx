import { getCurrentOrganizationId } from "@/lib/auth-organization";
import PedidosClient from "./pedidos-client";
import { getPedidos } from "./actions";

export default async function PedidosPage() {
  const organizationId = await getCurrentOrganizationId();
  const pedidos = organizationId ? await getPedidos(organizationId) : [];

  return (
    <PedidosClient
      organizationId={organizationId ?? ""}
      initialPedidos={pedidos}
    />
  );
}
