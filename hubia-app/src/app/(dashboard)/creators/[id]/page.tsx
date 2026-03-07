import { getCurrentOrganizationId } from "@/lib/auth-organization";
import { getCreatorById } from "../actions";
import { notFound } from "next/navigation";
import CreatorDetailClient from "./creator-detail-client";

export default async function CreatorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) notFound();

  const creator = await getCreatorById(organizationId, id);
  if (!creator) notFound();

  return (
    <CreatorDetailClient creator={creator} organizationId={organizationId} />
  );
}
