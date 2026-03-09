import { getCurrentOrganizationId } from "@/lib/auth-organization";
import { prisma } from "@/lib/prisma";
import DomainClient from "./domain-client";

export default async function DomainPage() {
  const organizationId = await getCurrentOrganizationId();

  let planoEnterprise = false;
  let dominioAtual: string | null = null;

  if (organizationId) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { plan: true },
    });
    planoEnterprise = org?.plan?.slug === "enterprise";
    dominioAtual = org?.domain ?? null;
  }

  return (
    <DomainClient
      planoEnterprise={planoEnterprise}
      dominioAtual={dominioAtual}
    />
  );
}
