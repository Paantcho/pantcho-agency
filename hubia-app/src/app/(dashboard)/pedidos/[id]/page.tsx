import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganizationId } from "@/lib/auth-organization";
import { getPedidoById } from "../actions";
import PedidoDetailClient from "./pedido-detail-client";

export default async function PedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) notFound();

  const pedido = await getPedidoById(organizationId, id);
  if (!pedido) notFound();

  const [creators, projetos] = await Promise.all([
    prisma.creator.findMany({
      where: { organizationId, isActive: true },
      select: { id: true, name: true, avatarUrl: true },
      orderBy: { name: "asc" },
    }),
    prisma.projeto.findMany({
      where: { organizationId, status: "ativo" },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  return (
    <PedidoDetailClient
      pedido={pedido}
      organizationId={organizationId}
      creators={creators}
      projetos={projetos}
    />
  );
}
