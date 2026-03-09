import { getCurrentOrganizationId } from "@/lib/auth-organization";
import { prisma } from "@/lib/prisma";
import PlanoClient from "@/app/(dashboard)/config/plano/plano-client";

export default async function OrganizationPlanoPage() {
  const organizationId = await getCurrentOrganizationId();

  let planoAtual: 1 | 2 | 3 | 4 = 1;
  if (organizationId) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { plan: true },
    });
    const slug = org?.plan?.slug ?? "basico";
    if (slug === "enterprise") planoAtual = 4;
    else if (slug === "avancado") planoAtual = 3;
    else if (slug === "profissional") planoAtual = 2;
    else planoAtual = 1;
  }

  return <PlanoClient planoAtual={planoAtual} />;
}
