import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const CURRENT_ORG_COOKIE = "hubia_current_organization_id";

/**
 * Garante que o usuário atual tenha pelo menos uma organização (útil após primeiro login por email/senha).
 * Se não tiver, associa à primeira organização ativa.
 */
export async function ensureUserHasOrganization(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return;

  const existing = await prisma.organizationMember.findFirst({
    where: { userId: user.id, isActive: true },
  });
  if (existing) return;

  const firstOrg = await prisma.organization.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });
  if (!firstOrg) return;

  await prisma.organizationMember.create({
    data: {
      organizationId: firstOrg.id,
      userId: user.id,
      role: "viewer",
      isActive: true,
      acceptedAt: new Date(),
    },
  });
}

export type OrgOption = { id: string; name: string };

/**
 * Lista organizações do usuário atual e o ID da organização atualmente selecionada (cookie ou primeira).
 * Em desenvolvimento sem usuário logado: retorna a primeira organização (Pantcho Agency) para testar o app sem login.
 */
export async function getOrganizationsForCurrentUser(): Promise<{
  organizations: OrgOption[];
  currentId: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    if (process.env.NODE_ENV === "development") {
      const firstOrg = await prisma.organization.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true },
      });
      if (firstOrg) {
        return {
          organizations: [{ id: firstOrg.id, name: firstOrg.name }],
          currentId: firstOrg.id,
        };
      }
    }
    return { organizations: [], currentId: null };
  }

  const members = await prisma.organizationMember.findMany({
    where: { userId: user.id, isActive: true },
    include: { organization: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
  const organizations: OrgOption[] = members.map((m) => ({
    id: m.organization.id,
    name: m.organization.name,
  }));

  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(CURRENT_ORG_COOKIE)?.value;
  const currentId =
    fromCookie && organizations.some((o) => o.id === fromCookie)
      ? fromCookie
      : organizations[0]?.id ?? null;

  return { organizations, currentId };
}

/**
 * Retorna o ID da organização atualmente selecionada (cookie ou primeira da lista).
 * Use em server components e server actions que precisam de organization_id.
 */
export async function getCurrentOrganizationId(): Promise<string | null> {
  const { currentId } = await getOrganizationsForCurrentUser();
  return currentId;
}
