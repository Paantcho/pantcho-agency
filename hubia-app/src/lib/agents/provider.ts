// ============================================================
// HUBIA — AI Provider Resolver
// Lê provider do banco, decripta API key, retorna config pronta
// ============================================================

import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encrypt";
import type { ProviderConfig } from "./types";

const DEFAULT_MODELS: Record<string, string> = {
  anthropic: "claude-sonnet-4-20250514",
  openai: "gpt-4o",
  google: "gemini-2.0-flash",
};

/**
 * Resolve o provider padrão da organização.
 * Busca no banco, decripta a API key, retorna config pronta pra uso.
 */
export async function resolveProvider(
  organizationId: string,
  preferredType?: string
): Promise<ProviderConfig | null> {
  const where: Parameters<typeof prisma.aiProvider.findFirst>[0]["where"] = {
    organizationId,
    isActive: true,
  };

  if (preferredType) {
    where.type = preferredType as ProviderConfig["type"];
  } else {
    where.isDefault = true;
  }

  let provider = await prisma.aiProvider.findFirst({ where });

  // Fallback: se não achou default, pega o primeiro ativo
  if (!provider && !preferredType) {
    provider = await prisma.aiProvider.findFirst({
      where: { organizationId, isActive: true },
      orderBy: { createdAt: "asc" },
    });
  }

  if (!provider) return null;

  const apiKey = decrypt(provider.apiKeyEncrypted);

  return {
    type: provider.type,
    apiKey,
    model: provider.defaultModel || DEFAULT_MODELS[provider.type] || "claude-sonnet-4-20250514",
    baseUrl: provider.baseUrl || undefined,
    maxTokens: provider.maxTokens || 4096,
  };
}
