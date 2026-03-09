/**
 * HUBIA — Contexto Completo da Organização
 *
 * Retorna em uma única chamada tudo que as páginas precisam:
 *   - organizationId
 *   - role do usuário atual nessa org
 *   - plano da org (slug + nível + nome)
 *   - se é owner (bypass total de feature flags)
 *   - lista de features habilitadas
 *
 * Regra do proprietário (hubia-platform-governance §6):
 *   Owner sempre recebe ALL_FEATURES, independente do plano contratado.
 *   Isso garante que o fundador veja e use 100% da plataforma durante o desenvolvimento.
 */

import { MemberRole } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganizationId } from "@/lib/auth-organization";
import {
  type Feature,
  ALL_FEATURES,
  getPlanFeatures,
  getPlanLevel,
  getPlanName,
} from "@/lib/feature-flags";

export type OrgContext = {
  organizationId: string | null;
  userRole: MemberRole | null;
  isOwner: boolean;
  isAdmin: boolean;
  canManage: boolean;
  planSlug: string;
  planLevel: 1 | 2 | 3 | 4;
  planName: string;
  enabledFeatures: Feature[];
};

export async function getOrgContext(): Promise<OrgContext> {
  const organizationId = await getCurrentOrganizationId();

  const defaults: OrgContext = {
    organizationId,
    userRole: null,
    isOwner: false,
    isAdmin: false,
    canManage: false,
    planSlug: "starter",
    planLevel: 1,
    planName: "Básico",
    enabledFeatures: getPlanFeatures("starter"),
  };

  if (!organizationId) return defaults;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole: MemberRole | null = null;

  if (user?.id) {
    const member = await prisma.organizationMember.findFirst({
      where: { organizationId, userId: user.id, isActive: true },
      select: { role: true },
    });
    userRole = member?.role ?? null;
  } else if (process.env.NODE_ENV === "development") {
    // Em dev sem login, assume owner para testar tudo
    userRole = "owner";
  }

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { plan: { select: { slug: true } } },
  });

  const planSlug = org?.plan?.slug ?? "starter";
  const isOwner = userRole === "owner";
  const isAdmin = userRole === "admin";
  const canManage = isOwner || isAdmin;

  // Proprietário tem acesso a tudo independente do plano
  const enabledFeatures: Feature[] = isOwner
    ? ALL_FEATURES
    : getPlanFeatures(planSlug);

  return {
    organizationId,
    userRole,
    isOwner,
    isAdmin,
    canManage,
    planSlug,
    planLevel: getPlanLevel(planSlug),
    planName: getPlanName(planSlug),
    enabledFeatures,
  };
}
