import { getCurrentOrganizationId } from "@/lib/auth-organization";
import { prisma } from "@/lib/prisma";
import { getBranding } from "@/app/(dashboard)/config/branding/actions";
import BrandingClient from "@/app/(dashboard)/config/branding/branding-client";

export default async function OrganizationBrandingPage() {
  const organizationId = await getCurrentOrganizationId();

  let planoEnterprise = false;
  let initialColor = "#D7FF00";

  if (organizationId) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { plan: true },
    });
    planoEnterprise = org?.plan?.slug === "enterprise";

    const branding = await getBranding(organizationId);
    initialColor = branding?.colorPrimary ?? "#D7FF00";
  }

  return (
    <BrandingClient
      organizationId={organizationId}
      initialColor={initialColor}
      planoEnterprise={planoEnterprise}
    />
  );
}
