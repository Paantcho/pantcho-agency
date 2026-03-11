"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type UserPreferences = {
  locale: string;
  dateFormat: string;
  visualMode: string;
};

const DEFAULTS: UserPreferences = {
  locale: "pt-BR",
  dateFormat: "dd/MM/yyyy",
  visualMode: "system",
};

export async function getPreferences(): Promise<UserPreferences> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return DEFAULTS;

  const profile = await prisma.userProfile.findUnique({
    where: { id: user.id },
    select: { locale: true },
  });

  const meta = (user.user_metadata ?? {}) as Record<string, string>;

  return {
    locale: profile?.locale ?? DEFAULTS.locale,
    dateFormat: meta.dateFormat ?? DEFAULTS.dateFormat,
    visualMode: meta.visualMode ?? DEFAULTS.visualMode,
  };
}

export async function savePreferences(
  prefs: UserPreferences
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Não autenticado" };

  try {
    // Salvar locale no UserProfile
    await prisma.userProfile.update({
      where: { id: user.id },
      data: { locale: prefs.locale },
    });

    // Salvar dateFormat e visualMode no user_metadata do Supabase
    await supabase.auth.updateUser({
      data: {
        dateFormat: prefs.dateFormat,
        visualMode: prefs.visualMode,
      },
    });

    revalidatePath("/config/preferencias");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erro ao salvar" };
  }
}
