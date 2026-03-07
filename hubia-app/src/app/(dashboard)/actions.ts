"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const CURRENT_ORG_COOKIE = "hubia_current_organization_id";

export async function setCurrentOrganization(
  organizationId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, error: "Não autenticado" };

  const member = await prisma.organizationMember.findFirst({
    where: { organizationId, userId: user.id, isActive: true },
  });
  if (!member) return { ok: false, error: "Organização não encontrada" };

  const cookieStore = await cookies();
  cookieStore.set(CURRENT_ORG_COOKIE, organizationId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
