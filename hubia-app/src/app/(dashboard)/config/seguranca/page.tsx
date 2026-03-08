import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import SegurancaClient from "./seguranca-client";

export default async function SegurancaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const member = user?.id
    ? await prisma.organizationMember.findFirst({
        where: { userId: user.id, isActive: true },
        include: { organization: true },
      })
    : null;

  const organizationId = member?.organizationId ?? null;

  const providers = organizationId
    ? await prisma.aiProvider.findMany({
        where: { organizationId },
        select: { id: true, name: true, type: true, isDefault: true, isActive: true, updatedAt: true },
      })
    : [];

  const membros = organizationId
    ? await prisma.organizationMember.findMany({
        where: { organizationId, isActive: true },
        select: { id: true, userId: true, role: true, createdAt: true },
      })
    : [];

  return (
    <SegurancaClient
      organizationId={organizationId ?? ""}
      providers={providers.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        isDefault: p.isDefault,
        isActive: p.isActive,
        updatedAt: p.updatedAt.toISOString(),
      }))}
      totalMembros={membros.length}
    />
  );
}
