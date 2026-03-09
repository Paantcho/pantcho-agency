import { AppShell } from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/theme-provider";
import {
  ensureUserHasOrganization,
  getOrganizationsForCurrentUser,
} from "@/lib/auth-organization";
import { getOrgContext } from "@/lib/org-context";
import { getBranding } from "@/app/(dashboard)/config/branding/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureUserHasOrganization();

  const [{ organizations, currentId }, orgContext] = await Promise.all([
    getOrganizationsForCurrentUser(),
    getOrgContext(),
  ]);

  const branding = orgContext.organizationId
    ? await getBranding(orgContext.organizationId)
    : null;

  const colorPrimary = branding?.colorPrimary ?? null;
  const colorPrimaryHover =
    branding?.colorScale &&
    typeof branding.colorScale === "object" &&
    "400" in branding.colorScale
      ? (branding.colorScale as Record<string, string>)["400"]
      : null;

  return (
    <ThemeProvider colorPrimary={colorPrimary} colorPrimaryHover={colorPrimaryHover}>
      <AppShell
        organizations={organizations}
        currentOrganizationId={currentId}
        userRole={orgContext.userRole}
        planSlug={orgContext.planSlug}
        enabledFeatures={orgContext.enabledFeatures}
      >
        {children}
      </AppShell>
    </ThemeProvider>
  );
}
