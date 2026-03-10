"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type NotificationSettings = Record<string, boolean>;

const DEFAULTS: NotificationSettings = {
  pedidos: true,
  projetos: true,
  equipe: false,
  sistema: true,
  email: false,
};

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return DEFAULTS;

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const stored = meta.notifications as NotificationSettings | undefined;
  if (!stored || typeof stored !== "object") return DEFAULTS;

  return { ...DEFAULTS, ...stored };
}

export async function saveNotificationSettings(
  settings: NotificationSettings
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Não autenticado" };

  try {
    await supabase.auth.updateUser({
      data: { notifications: settings },
    });

    revalidatePath("/config/notificacoes");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erro ao salvar" };
  }
}
