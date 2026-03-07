"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentOrganizationId } from "@/lib/auth-organization";

export type BrandingData = {
  colorPrimary: string;
  colorScale: Record<string, string>;
  logoUrl: string | null;
  faviconUrl: string | null;
};

const DEFAULT_SCALE: Record<string, string> = {
  "50": "#FAFFCC",
  "100": "#F5FF99",
  "200": "#EDFF66",
  "300": "#E2FF33",
  "400": "#D7FF00",
  "500": "#D7FF00",
  "600": "#ACCC00",
  "700": "#819900",
  "800": "#566600",
  "900": "#2B3300",
};

export async function getOrganizationIdForCurrentUser(): Promise<string | null> {
  return getCurrentOrganizationId();
}

export async function getBranding(
  organizationId: string
): Promise<BrandingData | null> {
  const b = await prisma.organizationBranding.findUnique({
    where: { organizationId },
  });
  if (!b) return null;
  const scale = b.colorScale as Record<string, string> | null;
  return {
    colorPrimary: b.colorPrimary,
    colorScale: scale && typeof scale === "object" ? scale : DEFAULT_SCALE,
    logoUrl: b.logoUrl,
    faviconUrl: b.faviconUrl,
  };
}

export async function updateBranding(
  organizationId: string,
  data: Partial<Pick<BrandingData, "colorPrimary" | "colorScale" | "logoUrl" | "faviconUrl">>
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, error: "Não autenticado" };

  const member = await prisma.organizationMember.findFirst({
    where: { organizationId, userId: user.id, isActive: true },
  });
  if (!member || (member.role !== "owner" && member.role !== "admin")) {
    return { ok: false, error: "Sem permissão" };
  }

  await prisma.organizationBranding.upsert({
    where: { organizationId },
    create: {
      organizationId,
      colorPrimary: data.colorPrimary ?? "#D7FF00",
      colorScale: (data.colorScale ?? DEFAULT_SCALE) as object,
      logoUrl: data.logoUrl ?? null,
      faviconUrl: data.faviconUrl ?? null,
    },
    update: {
      ...(data.colorPrimary != null && { colorPrimary: data.colorPrimary }),
      ...(data.colorScale != null && { colorScale: data.colorScale as object }),
      ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
      ...(data.faviconUrl !== undefined && { faviconUrl: data.faviconUrl }),
    },
  });
  revalidatePath("/config/branding");
  return { ok: true };
}
