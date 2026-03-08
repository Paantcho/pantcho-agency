import { notFound } from "next/navigation";
import { getCurrentOrganizationId } from "@/lib/auth-organization";
import { getProjetoById } from "../actions";
import ProjetoDetailClient from "./projeto-detail-client";

export default async function ProjetoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const organizationId = await getCurrentOrganizationId();

  if (!organizationId) notFound();

  const projeto = await getProjetoById(organizationId, id);
  if (!projeto) notFound();

  return <ProjetoDetailClient projeto={projeto} organizationId={organizationId} />;
}
