import { AppShell } from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/theme-provider";
import {
  ensureUserHasOrganization,
  getOrganizationsForCurrentUser,
  getCurrentOrganizationId,
} from "@/lib/auth-organization";
import { getBranding } from "@/app/(dashboard)/config/branding/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureUserHasOrganization();
  const { organizations, currentId } = await getOrganizationsForCurrentUser();
  const organizationId = await getCurrentOrganizationId();
  const branding = organizationId ? await getBranding(organizationId) : null;
  const colorPrimary = branding?.colorPrimary ?? null;
  const colorPrimaryHover =
    branding?.colorScale &&
    typeof branding.colorScale === "object" &&
    "400" in branding.colorScale
      ? (branding.colorScale as Record<string, string>)["400"]
      : null;

  return (
    <ThemeProvider colorPrimary={colorPrimary} colorPrimaryHover={colorPrimaryHover}>
      <AppShell organizations={organizations} currentOrganizationId={currentId}>
        {children}
      </AppShell>
    </ThemeProvider>
  );
}
