"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity-log";
import { createClient } from "@/lib/supabase/server";
import type { KnowledgeSourceType } from "@prisma/client";

export type KnowledgeCard = {
  id: string;
  title: string;
  summary: string | null;
  category: string | null;
  sourceType: KnowledgeSourceType;
  sourceUrl: string | null;
  fileUrl: string | null;
  tags: string[];
  aiProcessed: boolean;
  createdAt: string;
};

export async function getKnowledgeEntries(
  organizationId: string,
  categoria?: string
): Promise<KnowledgeCard[]> {
  const rows = await prisma.knowledgeEntry.findMany({
    where: {
      organizationId,
      ...(categoria ? { category: categoria } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((k) => ({
    id: k.id,
    title: k.title,
    summary: k.summary,
    category: k.category,
    sourceType: k.sourceType,
    sourceUrl: k.sourceUrl,
    fileUrl: k.fileUrl,
    tags: Array.isArray(k.tags) ? (k.tags as string[]) : [],
    aiProcessed: k.aiProcessed,
    createdAt: k.createdAt.toISOString(),
  }));
}

export async function createKnowledgeEntry(
  organizationId: string,
  data: {
    title: string;
    content: string;
    category?: string;
    sourceType: KnowledgeSourceType;
    sourceUrl?: string;
    fileUrl?: string;
    tags?: string[];
  }
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!data.title.trim()) return { ok: false, error: "Título é obrigatório" };
  if (!data.content.trim()) return { ok: false, error: "Conteúdo é obrigatório" };

  const entry = await prisma.knowledgeEntry.create({
    data: {
      organizationId,
      title: data.title.trim(),
      content: data.content.trim(),
      category: data.category?.trim() || null,
      sourceType: data.sourceType,
      sourceUrl: data.sourceUrl?.trim() || null,
      fileUrl: data.fileUrl?.trim() || null,
      tags: data.tags ?? [],
      createdBy: user?.id ?? null,
    },
  });

  await logActivity({
    organizationId,
    userId: user?.id,
    action: "conhecimento.entrada_criada",
    entityType: "knowledge_entry",
    entityId: entry.id,
    metadata: { title: entry.title, sourceType: entry.sourceType },
  });

  revalidatePath("/conhecimento");
  return { ok: true, id: entry.id };
}

export async function updateKnowledgeEntry(
  organizationId: string,
  id: string,
  data: {
    title?: string;
    content?: string;
    category?: string | null;
    tags?: string[];
    summary?: string;
  }
): Promise<{ ok: boolean; error?: string }> {
  const existing = await prisma.knowledgeEntry.findFirst({ where: { id, organizationId } });
  if (!existing) return { ok: false, error: "Entrada não encontrada" };

  await prisma.knowledgeEntry.update({
    where: { id },
    data: {
      ...(data.title ? { title: data.title.trim() } : {}),
      ...(data.content !== undefined ? { content: data.content.trim() } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.tags ? { tags: data.tags } : {}),
      ...(data.summary ? { summary: data.summary } : {}),
    },
  });

  revalidatePath("/conhecimento");
  return { ok: true };
}

export async function deleteKnowledgeEntry(
  organizationId: string,
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const existing = await prisma.knowledgeEntry.findFirst({ where: { id, organizationId } });
  if (!existing) return { ok: false, error: "Entrada não encontrada" };
  await prisma.knowledgeEntry.delete({ where: { id } });
  revalidatePath("/conhecimento");
  return { ok: true };
}

export async function getCategorias(organizationId: string): Promise<string[]> {
  const rows = await prisma.knowledgeEntry.findMany({
    where: { organizationId, category: { not: null } },
    select: { category: true },
    distinct: ["category"],
  });
  return rows.map((r) => r.category!).filter(Boolean);
}
