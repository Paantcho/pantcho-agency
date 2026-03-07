"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { AiProviderType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { encrypt } from "@/lib/encrypt";
import { getCurrentOrganizationId } from "@/lib/auth-organization";

const MASKED_KEY_DISPLAY = "••••••••";

export type ProviderRow = {
  id: string;
  name: string;
  type: AiProviderType;
  maskedKey: string;
  defaultModel: string | null;
  isDefault: boolean;
  isActive: boolean;
};

export async function getOrganizationIdForCurrentUser(): Promise<string | null> {
  return getCurrentOrganizationId();
}

export async function getProviders(
  organizationId: string
): Promise<ProviderRow[]> {
  const list = await prisma.aiProvider.findMany({
    where: { organizationId, isActive: true },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });
  return list.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    maskedKey: MASKED_KEY_DISPLAY,
    defaultModel: p.defaultModel,
    isDefault: p.isDefault,
    isActive: p.isActive,
  }));
}

export async function createProvider(
  organizationId: string,
  data: {
    name: string;
    type: AiProviderType;
    apiKey: string;
    baseUrl?: string | null;
    defaultModel?: string | null;
    isDefault?: boolean;
    maxTokens?: number | null;
  }
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

  if (!data.apiKey?.trim()) {
    return { ok: false, error: "API key é obrigatória" };
  }

  try {
    const encrypted = encrypt(data.apiKey.trim());
    const isFirst =
      (await prisma.aiProvider.count({ where: { organizationId } })) === 0;
    await prisma.aiProvider.create({
      data: {
        organizationId,
        name: data.name.trim(),
        type: data.type,
        apiKeyEncrypted: encrypted,
        baseUrl: data.baseUrl?.trim() || null,
        defaultModel: data.defaultModel?.trim() || null,
        isDefault: data.isDefault ?? isFirst,
        maxTokens: data.maxTokens ?? null,
        isActive: true,
      },
    });
    revalidatePath("/config/provedores");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao criptografar";
    return { ok: false, error: message };
  }
}

export async function updateProvider(
  organizationId: string,
  providerId: string,
  data: {
    name?: string;
    type?: AiProviderType;
    apiKey?: string;
    baseUrl?: string | null;
    defaultModel?: string | null;
    isDefault?: boolean;
    maxTokens?: number | null;
    isActive?: boolean;
  }
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

  const existing = await prisma.aiProvider.findFirst({
    where: { id: providerId, organizationId },
  });
  if (!existing) return { ok: false, error: "Provedor não encontrado" };

  const update: Parameters<typeof prisma.aiProvider.update>[0]["data"] = {};
  if (data.name !== undefined) update.name = data.name.trim();
  if (data.type !== undefined) update.type = data.type;
  if (data.apiKey?.trim()) {
    try {
      update.apiKeyEncrypted = encrypt(data.apiKey.trim());
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : "Erro ao criptografar",
      };
    }
  }
  if (data.baseUrl !== undefined) update.baseUrl = data.baseUrl?.trim() || null;
  if (data.defaultModel !== undefined)
    update.defaultModel = data.defaultModel?.trim() || null;
  if (data.isDefault !== undefined) update.isDefault = data.isDefault;
  if (data.maxTokens !== undefined) update.maxTokens = data.maxTokens;
  if (data.isActive !== undefined) update.isActive = data.isActive;

  await prisma.aiProvider.update({
    where: { id: providerId },
    data: update,
  });
  revalidatePath("/config/provedores");
  return { ok: true };
}

export async function deleteProvider(
  organizationId: string,
  providerId: string
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

  const existing = await prisma.aiProvider.findFirst({
    where: { id: providerId, organizationId },
  });
  if (!existing) return { ok: false, error: "Provedor não encontrado" };

  await prisma.aiProvider.delete({ where: { id: providerId } });
  revalidatePath("/config/provedores");
  return { ok: true };
}
