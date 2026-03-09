import { getCurrentOrganizationId } from "@/lib/auth-organization";
import { prisma } from "@/lib/prisma";
import OverviewClient from "./overview-client";

export default async function OverviewPage() {
  const organizationId = await getCurrentOrganizationId();

  let orgName = "Organização";
  let planoNome = "Básico";
  let planoNivel = 1;
  let totalMembros = 0;
  let brandingAtivo = false;
  let dominioCustom: string | null = null;
  let integracoesAtivas = 0;

  if (organizationId) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        plan: true,
        branding: true,
        _count: {
          select: {
            members: { where: { isActive: true } },
            aiProviders: { where: { isActive: true } },
          },
        },
      },
    });

    if (org) {
      orgName = org.name;
      dominioCustom = org.domain ?? null;

      const slug = org.plan?.slug ?? "basico";
      if (slug === "enterprise") { planoNome = "Enterprise"; planoNivel = 4; }
      else if (slug === "avancado") { planoNome = "Avançado"; planoNivel = 3; }
      else if (slug === "profissional") { planoNome = "Profissional"; planoNivel = 2; }
      else { planoNome = "Básico"; planoNivel = 1; }

      totalMembros = org._count.members;
      brandingAtivo = !!org.branding && org.branding.colorPrimary !== "#D7FF00";
      integracoesAtivas = org._count.aiProviders;
    }
  }

  return (
    <OverviewClient
      orgName={orgName}
      planoNome={planoNome}
      planoNivel={planoNivel}
      totalMembros={totalMembros}
      brandingAtivo={brandingAtivo}
      dominioCustom={dominioCustom}
      integracoesAtivas={integracoesAtivas}
    />
  );
}
