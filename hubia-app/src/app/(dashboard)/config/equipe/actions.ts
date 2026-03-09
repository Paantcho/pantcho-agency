"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { MemberRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getCurrentOrganizationId } from "@/lib/auth-organization";
import crypto from "crypto";

// ============================================================
// TYPES
// ============================================================

export type TeamMemberRow = {
  id: string;
  userId: string;
  role: MemberRole;
  invitedAt: string | null;
  acceptedAt: string | null;
  isActive: boolean;
  // do UserProfile
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
};

export type PendingInviteRow = {
  id: string;
  email: string;
  role: MemberRole;
  invitedBy: string;
  inviterName: string | null;
  expiresAt: string;
  createdAt: string;
};

// ============================================================
// LEITURA
// ============================================================

export async function getOrganizationIdForCurrentUser(): Promise<string | null> {
  return getCurrentOrganizationId();
}

/**
 * Role do usuário atual na organização.
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
 * Lista membros ativos da organização cruzando com UserProfile para nome/email reais.
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
      acceptedAt: true,
      isActive: true,
    },
  });

  if (members.length === 0) return [];

  // Busca perfis de todos os membros de uma vez
  const userIds = members.map((m) => m.userId);
  const profiles = await prisma.userProfile.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true, avatarUrl: true },
  });

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  return members.map((m) => {
    const profile = profileMap.get(m.userId);
    return {
      id: m.id,
      userId: m.userId,
      role: m.role,
      invitedAt: m.invitedAt?.toISOString() ?? null,
      acceptedAt: m.acceptedAt?.toISOString() ?? null,
      isActive: m.isActive,
      name: profile?.name ?? null,
      email: profile?.email ?? null,
      avatarUrl: profile?.avatarUrl ?? null,
    };
  });
}

/**
 * Lista convites pendentes (não aceitos e não revogados) da organização.
 */
export async function getPendingInvites(
  organizationId: string
): Promise<PendingInviteRow[]> {
  const invites = await prisma.invite.findMany({
    where: {
      organizationId,
      acceptedAt: null,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (invites.length === 0) return [];

  const inviterIds = [...new Set(invites.map((i) => i.invitedBy))];
  const inviters = await prisma.userProfile.findMany({
    where: { id: { in: inviterIds } },
    select: { id: true, name: true, email: true },
  });
  const inviterMap = new Map(inviters.map((u) => [u.id, u]));

  return invites.map((inv) => {
    const inviter = inviterMap.get(inv.invitedBy);
    return {
      id: inv.id,
      email: inv.email,
      role: inv.role,
      invitedBy: inv.invitedBy,
      inviterName: inviter?.name ?? inviter?.email ?? null,
      expiresAt: inv.expiresAt.toISOString(),
      createdAt: inv.createdAt.toISOString(),
    };
  });
}

// ============================================================
// MUTAÇÕES
// ============================================================

/**
 * Altera o role de um membro da organização.
 * Apenas owner/admin podem alterar. Owner não pode ser rebaixado por admin.
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
    return { ok: false, error: "Sem permissão para alterar roles" };
  }

  const target = await prisma.organizationMember.findFirst({
    where: { id: memberId, organizationId, isActive: true },
  });
  if (!target) return { ok: false, error: "Membro não encontrado" };
  if (target.role === "owner" && current.role !== "owner") {
    return { ok: false, error: "Apenas o proprietário pode alterar outro owner" };
  }
  if (role === "owner" && current.role !== "owner") {
    return { ok: false, error: "Apenas o proprietário pode promover outro owner" };
  }

  await prisma.organizationMember.update({
    where: { id: memberId },
    data: { role },
  });
  revalidatePath("/organization/team");
  revalidatePath("/config/equipe");
  return { ok: true };
}

/**
 * Remove um membro da organização (desativa o vínculo, não deleta o usuário).
 */
export async function removeMember(
  organizationId: string,
  memberId: string
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
    return { ok: false, error: "Sem permissão para remover membros" };
  }

  const target = await prisma.organizationMember.findFirst({
    where: { id: memberId, organizationId, isActive: true },
  });
  if (!target) return { ok: false, error: "Membro não encontrado" };
  if (target.role === "owner") {
    return { ok: false, error: "Não é possível remover o proprietário" };
  }
  if (target.userId === user.id) {
    return { ok: false, error: "Você não pode remover a si mesmo" };
  }

  await prisma.organizationMember.update({
    where: { id: memberId },
    data: { isActive: false },
  });
  revalidatePath("/organization/team");
  revalidatePath("/config/equipe");
  return { ok: true };
}

/**
 * Envia convite por email para uma pessoa entrar na organização.
 * Usa o Supabase Admin para disparar o email de convite.
 */
export async function inviteMember(
  organizationId: string,
  email: string,
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
    return { ok: false, error: "Sem permissão para convidar membros" };
  }
  if (role === "owner") {
    return { ok: false, error: "Não é possível convidar alguém como proprietário" };
  }

  // Verificar se já é membro ativo
  const existingProfile = await prisma.userProfile.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existingProfile) {
    const existingMember = await prisma.organizationMember.findFirst({
      where: { organizationId, userId: existingProfile.id, isActive: true },
    });
    if (existingMember) {
      return { ok: false, error: "Este email já é membro da organização" };
    }
  }

  // Verificar convite pendente já existente
  const existingInvite = await prisma.invite.findFirst({
    where: {
      organizationId,
      email,
      acceptedAt: null,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  if (existingInvite) {
    return { ok: false, error: "Já existe um convite pendente para este email" };
  }

  // Gerar token único
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

  // Salvar convite no banco
  await prisma.invite.create({
    data: {
      organizationId,
      email,
      role,
      token,
      invitedBy: user.id,
      expiresAt,
    },
  });

  // Disparar email via Supabase Admin
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${appUrl}/auth/callback?next=/organization/team`,
    data: {
      invite_token: token,
      organization_id: organizationId,
      role,
    },
  });

  if (inviteError) {
    // Se o usuário já existe no Supabase, o convite no banco ainda é válido
    // O email de "já cadastrado" é tratado pelo Supabase automaticamente
    console.error("[inviteMember] Supabase error:", inviteError.message);
    if (!inviteError.message.includes("already registered")) {
      // Reverter o convite criado
      await prisma.invite.deleteMany({ where: { token } });
      return { ok: false, error: "Erro ao enviar email de convite. Tente novamente." };
    }
    // Se já registrado, Supabase envia email de login com redirect — convite no banco funciona
  }

  revalidatePath("/organization/team");
  return { ok: true };
}

/**
 * Revoga um convite pendente.
 */
export async function revokeInvite(
  organizationId: string,
  inviteId: string
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

  const invite = await prisma.invite.findFirst({
    where: { id: inviteId, organizationId, acceptedAt: null, revokedAt: null },
  });
  if (!invite) return { ok: false, error: "Convite não encontrado ou já processado" };

  await prisma.invite.update({
    where: { id: inviteId },
    data: { revokedAt: new Date() },
  });

  revalidatePath("/organization/team");
  return { ok: true };
}

/**
 * Reenviar convite — revoga o antigo e cria um novo.
 */
export async function resendInvite(
  organizationId: string,
  inviteId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, error: "Não autenticado" };

  const invite = await prisma.invite.findFirst({
    where: { id: inviteId, organizationId, acceptedAt: null, revokedAt: null },
  });
  if (!invite) return { ok: false, error: "Convite não encontrado" };

  // Revogar o antigo
  await prisma.invite.update({ where: { id: inviteId }, data: { revokedAt: new Date() } });

  // Criar novo convite
  return inviteMember(organizationId, invite.email, invite.role);
}
