import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import MemoriaClient from "./memoria-client";

export default async function MemoriaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const member = user?.id
    ? await prisma.organizationMember.findFirst({ where: { userId: user.id, isActive: true } })
    : null;

  const organizationId = member?.organizationId ?? null;

  const entityVersions = organizationId
    ? await prisma.entityVersion.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        take: 100,
      })
    : [];

  return (
    <MemoriaClient
      organizationId={organizationId ?? ""}
      entityVersions={entityVersions.map((v) => ({
        id: v.id,
        entityType: v.entityType,
        entityId: v.entityId,
        version: v.version,
        data: v.data as Record<string, unknown>,
        changedBy: v.changedBy,
        createdAt: v.createdAt.toISOString(),
      }))}
    />
  );
}
