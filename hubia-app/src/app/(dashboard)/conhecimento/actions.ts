"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentOrganizationId } from "@/lib/auth-organization";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type KnowledgeRow = {
  id: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[];
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const CATEGORIES = [
  "design",
  "desenvolvimento",
  "motion",
  "creators",
  "marketing",
  "negócios",
  "ia",
  "geral",
] as const;

export type KnowledgeCategory = (typeof CATEGORIES)[number];

export function getCategories() {
  return [...CATEGORIES];
}

export async function getKnowledgeEntries(): Promise<KnowledgeRow[]> {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return [];

  const entries = await prisma.knowledgeEntry.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });

  return entries.map((e: { id: string; title: string; content: string; category: string | null; tags: unknown; createdBy: string | null; createdAt: Date; updatedAt: Date }) => ({
    id: e.id,
    title: e.title,
    content: e.content,
    category: e.category,
    tags: (e.tags as string[]) || [],
    createdBy: e.createdBy,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  }));
}

export async function createKnowledgeEntry(data: {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
}): Promise<{ ok: boolean; error?: string }> {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return { ok: false, error: "Sem organização" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!data.title?.trim() || !data.content?.trim()) {
    return { ok: false, error: "Título e conteúdo são obrigatórios" };
  }

  await prisma.knowledgeEntry.create({
    data: {
      organizationId,
      title: data.title.trim(),
      content: data.content.trim(),
      category: data.category?.trim() || "geral",
      tags: data.tags || [],
      createdBy: user?.id || null,
    },
  });

  revalidatePath("/conhecimento");
  return { ok: true };
}

export async function updateKnowledgeEntry(
  entryId: string,
  data: {
    title?: string;
    content?: string;
    category?: string;
    tags?: string[];
  }
): Promise<{ ok: boolean; error?: string }> {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return { ok: false, error: "Sem organização" };

  const existing = await prisma.knowledgeEntry.findFirst({
    where: { id: entryId, organizationId },
  });
  if (!existing) return { ok: false, error: "Entrada não encontrada" };

  await prisma.knowledgeEntry.update({
    where: { id: entryId },
    data: {
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.content !== undefined && { content: data.content.trim() }),
      ...(data.category !== undefined && { category: data.category.trim() }),
      ...(data.tags !== undefined && { tags: data.tags }),
    },
  });

  revalidatePath("/conhecimento");
  return { ok: true };
}

export async function deleteKnowledgeEntry(
  entryId: string
): Promise<{ ok: boolean; error?: string }> {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return { ok: false, error: "Sem organização" };

  const existing = await prisma.knowledgeEntry.findFirst({
    where: { id: entryId, organizationId },
  });
  if (!existing) return { ok: false, error: "Entrada não encontrada" };

  await prisma.knowledgeEntry.delete({ where: { id: entryId } });

  revalidatePath("/conhecimento");
  return { ok: true };
}
