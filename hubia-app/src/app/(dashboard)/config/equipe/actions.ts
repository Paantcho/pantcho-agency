"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { MemberRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getCurrentOrganizationId } from "@/lib/auth-organization";

export type TeamMemberRow = {
  id: string;
  userId: string;
  role: MemberRole;
  invitedAt: string | null;
  isActive: boolean;
};

export async function getOrganizationIdForCurrentUser(): Promise<string | null> {
  return getCurrentOrganizationId();
}

/**
 * Role do usuário atual na organização (para esconder/mostrar ações).
 */
export async function getCurrentUserRoleInOrg(
  organizationId: string
): Promise<MemberRole | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return null;

  const member = await prisma.organizationMember.findFirst({
    where: { organizationId, userId: user.id, isActive: true },
    select: { role: true },
  });
  return member?.role ?? null;
}

/**
 * Lista membros da organização. Sem SUPABASE_SERVICE_ROLE_KEY não há email/nome no Auth;
 * exibimos role e identificador (userId truncado) ou "Membro" na UI.
 */
export async function getMembers(
  organizationId: string
): Promise<TeamMemberRow[]> {
  const members = await prisma.organizationMember.findMany({
    where: { organizationId, isActive: true },
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      userId: true,
      role: true,
      invitedAt: true,
      isActive: true,
    },
  });

  return members.map((m) => ({
    id: m.id,
    userId: m.userId,
    role: m.role,
    invitedAt: m.invitedAt?.toISOString() ?? null,
    isActive: m.isActive,
  }));
}

/**
 * Atualiza o role de um membro. Apenas owner/admin podem alterar.
 */
export async function updateMemberRole(
  organizationId: string,
  memberId: string,
  role: MemberRole
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, error: "Não autenticado" };

  const current = await prisma.organizationMember.findFirst({
    where: { organizationId, userId: user.id, isActive: true },
  });
  if (!current || (current.role !== "owner" && current.role !== "admin")) {
    return { ok: false, error: "Sem permissão" };
  }

  const target = await prisma.organizationMember.findFirst({
    where: { id: memberId, organizationId, isActive: true },
  });
  if (!target) return { ok: false, error: "Membro não encontrado" };
  if (target.role === "owner" && current.role !== "owner") {
    return { ok: false, error: "Apenas o proprietário pode alterar outro owner" };
  }

  await prisma.organizationMember.update({
    where: { id: memberId },
    data: { role },
  });
  revalidatePath("/config/equipe");
  return { ok: true };
}
