"use server";

import { prisma } from "@/lib/prisma";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonValue = any;
import { getCurrentOrganizationId } from "@/lib/auth-organization";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type CreatorRow = {
  id: string;
  name: string;
  slug: string;
  avatarUrl: string | null;
  bio: string | null;
  isActive: boolean;
  metadata: {
    city?: string;
    state?: string;
    age?: number;
    birthdate?: string;
    platforms?: string[];
    isDraft?: boolean;
  };
};

export async function getCreators(
  organizationId: string
): Promise<CreatorRow[]> {
  const list = await prisma.creator.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      avatarUrl: true,
      bio: true,
      isActive: true,
      metadata: true,
    },
  });
  return list.map((c: { id: string; name: string; slug: string; avatarUrl: string | null; bio: string | null; isActive: boolean; metadata: unknown }) => ({
    ...c,
    metadata: (c.metadata ?? {}) as CreatorRow["metadata"],
  }));
}

export type CreatorDetail = CreatorRow & {
  createdAt: Date;
  updatedAt: Date;
  appearance: {
    id: string;
    basePrompt: string;
    markers: unknown[];
    protected: unknown[];
  } | null;
  environments: {
    id: string;
    name: string;
    description: string | null;
    prompt: string;
    thumbnailUrl: string | null;
    isActive: boolean;
  }[];
  looks: {
    id: string;
    name: string;
    description: string | null;
    prompt: string;
    thumbnailUrl: string | null;
    isActive: boolean;
  }[];
  voice: {
    id: string;
    tone: string | null;
    style: string | null;
    rules: unknown[];
    examples: unknown[];
  } | null;
};

export async function getCreatorById(
  organizationId: string,
  creatorId: string
): Promise<CreatorDetail | null> {
  const creator = await prisma.creator.findFirst({
    where: { id: creatorId, organizationId },
    include: {
      appearance: true,
      environments: { orderBy: { name: "asc" } },
      looks: { orderBy: { name: "asc" } },
      voice: true,
    },
  });
  if (!creator) return null;
  return {
    id: creator.id,
    name: creator.name,
    slug: creator.slug,
    avatarUrl: creator.avatarUrl,
    bio: creator.bio,
    isActive: creator.isActive,
    metadata: (creator.metadata ?? {}) as CreatorRow["metadata"],
    createdAt: creator.createdAt,
    updatedAt: creator.updatedAt,
    appearance: creator.appearance
      ? {
          id: creator.appearance.id,
          basePrompt: creator.appearance.basePrompt,
          markers: (creator.appearance.markers as unknown[]) ?? [],
          protected: (creator.appearance.protected as unknown[]) ?? [],
        }
      : null,
    environments: creator.environments.map((e: { id: string; name: string; description: string | null; prompt: string; thumbnailUrl: string | null; isActive: boolean }) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      prompt: e.prompt,
      thumbnailUrl: e.thumbnailUrl,
      isActive: e.isActive,
    })),
    looks: creator.looks.map((l: { id: string; name: string; description: string | null; prompt: string; thumbnailUrl: string | null; isActive: boolean }) => ({
      id: l.id,
      name: l.name,
      description: l.description,
      prompt: l.prompt,
      thumbnailUrl: l.thumbnailUrl,
      isActive: l.isActive,
    })),
    voice: creator.voice
      ? {
          id: creator.voice.id,
          tone: creator.voice.tone,
          style: creator.voice.style,
          rules: (creator.voice.rules as unknown[]) ?? [],
          examples: (creator.voice.examples as unknown[]) ?? [],
        }
      : null,
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createCreator(
  organizationId: string,
  data: {
    name: string;
    slug?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    isActive?: boolean;
    isDraft?: boolean;
    metadata?: Record<string, unknown>;
  }
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, error: "Não autenticado" };

  const member = await prisma.organizationMember.findFirst({
    where: { organizationId, userId: user.id, isActive: true },
  });
  if (!member || (member.role !== "owner" && member.role !== "admin" && member.role !== "editor")) {
    return { ok: false, error: "Sem permissão" };
  }

  const name = data.name?.trim();
  if (!name || name.length < 2) {
    return { ok: false, error: "Nome deve ter pelo menos 2 caracteres." };
  }

  const slug = data.slug?.trim() ? slugify(data.slug) : slugify(name);
  if (!slug) return { ok: false, error: "Slug inválido." };

  const existing = await prisma.creator.findUnique({
    where: { organizationId_slug: { organizationId, slug } },
  });
  if (existing) return { ok: false, error: "Já existe um creator com esse slug nesta organização." };

  const metadata = {
    ...(data.metadata ?? {}),
    ...(data.isDraft ? { isDraft: true } : {}),
  };

  try {
    const created = await prisma.creator.create({
      data: {
        organizationId,
        name,
        slug,
        bio: data.bio?.trim() || null,
        avatarUrl: data.avatarUrl?.trim() || null,
        isActive: data.isDraft ? false : (data.isActive ?? true),
        metadata: metadata as JsonValue,
      },
    });
    revalidatePath("/creators");
    revalidatePath("/", "layout");
    return { ok: true, id: created.id };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Erro ao criar creator." };
  }
}

/**
 * Cria um creator completo com dados de auto-fill (aparência, ambientes, looks, voz).
 * Usado após o processamento do ZIP com IA.
 */
export async function createCreatorWithAutoFill(
  organizationId: string,
  data: {
    name: string;
    slug?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    isActive?: boolean;
    isDraft?: boolean;
    metadata?: Record<string, unknown>;
    appearance?: {
      basePrompt: string;
      markers?: string[];
    };
    environments?: {
      name: string;
      description?: string;
      prompt: string;
    }[];
    looks?: {
      name: string;
      description?: string;
      prompt: string;
    }[];
    voice?: {
      tone?: string;
      style?: string;
      rules?: string[];
      examples?: string[];
    };
  }
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  // Primeiro criar o creator básico
  const result = await createCreator(organizationId, {
    name: data.name,
    slug: data.slug,
    bio: data.bio,
    avatarUrl: data.avatarUrl,
    isActive: data.isActive,
    isDraft: data.isDraft,
    metadata: data.metadata,
  });

  if (!result.ok) return result;

  const creatorId = result.id;

  try {
    // Criar aparência se fornecida
    if (data.appearance?.basePrompt) {
      await prisma.creatorAppearance.create({
        data: {
          creatorId,
          basePrompt: data.appearance.basePrompt,
          markers: (data.appearance.markers ?? []) as JsonValue,
          protected: [] as JsonValue,
        },
      });
    }

    // Criar ambientes se fornecidos
    if (data.environments?.length) {
      await prisma.creatorEnvironment.createMany({
        data: data.environments.map((env) => ({
          creatorId,
          name: env.name,
          description: env.description || null,
          prompt: env.prompt,
        })),
      });
    }

    // Criar looks se fornecidos
    if (data.looks?.length) {
      await prisma.creatorLook.createMany({
        data: data.looks.map((look) => ({
          creatorId,
          name: look.name,
          description: look.description || null,
          prompt: look.prompt,
        })),
      });
    }

    // Criar voz se fornecida
    if (data.voice && (data.voice.tone || data.voice.style || data.voice.rules?.length || data.voice.examples?.length)) {
      await prisma.creatorVoice.create({
        data: {
          creatorId,
          tone: data.voice.tone || null,
          style: data.voice.style || null,
          rules: (data.voice.rules ?? []) as JsonValue,
          examples: (data.voice.examples ?? []) as JsonValue,
        },
      });
    }

    revalidatePath(`/creators/${creatorId}`);
    return { ok: true, id: creatorId };
  } catch (e) {
    console.error("Erro ao criar sub-entidades do creator:", e);
    // Creator foi criado, sub-entidades falharam — não reverter
    return { ok: true, id: creatorId };
  }
}

/**
 * Remove flag isDraft do metadata quando o creator é finalizado.
 */
export async function finalizeDraft(
  organizationId: string,
  creatorId: string
): Promise<{ ok: boolean; error?: string }> {
  const creator = await prisma.creator.findFirst({
    where: { id: creatorId, organizationId },
  });
  if (!creator) return { ok: false, error: "Creator não encontrado." };

  const metadata = (creator.metadata as Record<string, unknown>) ?? {};
  delete metadata.isDraft;

  await prisma.creator.update({
    where: { id: creatorId },
    data: {
      isActive: true,
      metadata: metadata as JsonValue,
    },
  });

  revalidatePath("/creators");
  revalidatePath(`/creators/${creatorId}`);
  return { ok: true };
}

/**
 * Busca creators que são rascunhos (isDraft no metadata).
 */
export async function getDraftCreators(
  organizationId: string
): Promise<{ id: string; name: string; updatedAt: Date }[]> {
  const all = await prisma.creator.findMany({
    where: { organizationId },
    select: { id: true, name: true, metadata: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  return all
    .filter((c: { metadata: unknown }) => {
      const meta = c.metadata as Record<string, unknown> | null;
      return meta?.isDraft === true;
    })
    .map((c: { id: string; name: string; updatedAt: Date }) => ({ id: c.id, name: c.name, updatedAt: c.updatedAt }));
}

export async function updateCreator(
  organizationId: string,
  creatorId: string,
  data: {
    name?: string;
    slug?: string;
    bio?: string | null;
    avatarUrl?: string | null;
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
  if (!member || (member.role !== "owner" && member.role !== "admin" && member.role !== "editor")) {
    return { ok: false, error: "Sem permissão" };
  }

  const existing = await prisma.creator.findFirst({
    where: { id: creatorId, organizationId },
  });
  if (!existing) return { ok: false, error: "Creator não encontrado." };

  const name = data.name !== undefined ? data.name.trim() : existing.name;
  if (name.length < 2) return { ok: false, error: "Nome deve ter pelo menos 2 caracteres." };

  const slug =
    data.slug !== undefined
      ? slugify(data.slug.trim())
      : existing.slug;
  if (!slug) return { ok: false, error: "Slug inválido." };

  if (slug !== existing.slug) {
    const conflict = await prisma.creator.findUnique({
      where: { organizationId_slug: { organizationId, slug } },
    });
    if (conflict) return { ok: false, error: "Já existe um creator com esse slug." };
  }

  try {
    await prisma.creator.update({
      where: { id: creatorId },
      data: {
        name,
        slug,
        bio: data.bio !== undefined ? (data.bio?.trim() || null) : undefined,
        avatarUrl: data.avatarUrl !== undefined ? (data.avatarUrl?.trim() || null) : undefined,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
      },
    });
    revalidatePath("/creators");
    revalidatePath(`/creators/${creatorId}`);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Erro ao atualizar." };
  }
}

// ——— Appearance ———
export async function upsertCreatorAppearance(
  organizationId: string,
  creatorId: string,
  data: { basePrompt: string; markers?: unknown[]; protected?: unknown[] }
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, error: "Não autenticado" };

  const creator = await prisma.creator.findFirst({
    where: { id: creatorId, organizationId },
    include: { appearance: true },
  });
  if (!creator) return { ok: false, error: "Creator não encontrado." };

  try {
    if (creator.appearance) {
      await prisma.creatorAppearance.update({
        where: { id: creator.appearance.id },
        data: {
          basePrompt: data.basePrompt.trim() || " ",
          markers: (data.markers ?? []) as JsonValue,
          protected: (data.protected ?? []) as JsonValue,
        },
      });
    } else {
      await prisma.creatorAppearance.create({
        data: {
          creatorId,
          basePrompt: data.basePrompt.trim() || " ",
          markers: (data.markers ?? []) as JsonValue,
          protected: (data.protected ?? []) as JsonValue,
        },
      });
    }
    revalidatePath(`/creators/${creatorId}`);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Erro ao salvar aparência." };
  }
}

// ——— Environments ———
export async function createEnvironment(
  organizationId: string,
  creatorId: string,
  data: { name: string; description?: string | null; prompt: string; thumbnailUrl?: string | null }
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, error: "Não autenticado" };

  const creator = await prisma.creator.findFirst({
    where: { id: creatorId, organizationId },
  });
  if (!creator) return { ok: false, error: "Creator não encontrado." };

  const name = data.name?.trim();
  if (!name) return { ok: false, error: "Nome é obrigatório." };

  try {
    const env = await prisma.creatorEnvironment.create({
      data: {
        creatorId,
        name,
        description: data.description?.trim() || null,
        prompt: data.prompt?.trim() || " ",
        thumbnailUrl: data.thumbnailUrl?.trim() || null,
      },
    });
    revalidatePath(`/creators/${creatorId}`);
    return { ok: true, id: env.id };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Erro ao criar ambiente." };
  }
}

export async function updateEnvironment(
  organizationId: string,
  creatorId: string,
  environmentId: string,
  data: { name?: string; description?: string | null; prompt?: string; thumbnailUrl?: string | null; isActive?: boolean }
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, error: "Não autenticado" };

  const env = await prisma.creatorEnvironment.findFirst({
    where: { id: environmentId, creatorId },
  });
  const creator = await prisma.creator.findFirst({
    where: { id: creatorId, organizationId },
  });
  if (!env || !creator) return { ok: false, error: "Não encontrado." };

  try {
    await prisma.creatorEnvironment.update({
      where: { id: environmentId },
      data: {
        name: data.name !== undefined ? data.name.trim() : undefined,
        description: data.description !== undefined ? (data.description?.trim() || null) : undefined,
        prompt: data.prompt !== undefined ? data.prompt.trim() : undefined,
        thumbnailUrl: data.thumbnailUrl !== undefined ? (data.thumbnailUrl?.trim() || null) : undefined,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
      },
    });
    revalidatePath(`/creators/${creatorId}`);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Erro ao atualizar." };
  }
}

export async function deleteEnvironment(
  organizationId: string,
  creatorId: string,
  environmentId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, error: "Não autenticado" };

  const creator = await prisma.creator.findFirst({
    where: { id: creatorId, organizationId },
  });
  const env = await prisma.creatorEnvironment.findFirst({
    where: { id: environmentId, creatorId },
  });
  if (!creator || !env) return { ok: false, error: "Não encontrado." };

  try {
    await prisma.creatorEnvironment.delete({ where: { id: environmentId } });
    revalidatePath(`/creators/${creatorId}`);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Erro ao excluir." };
  }
}

// ——— Looks ———
export async function createLook(
  organizationId: string,
  creatorId: string,
  data: { name: string; description?: string | null; prompt: string; thumbnailUrl?: string | null }
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, error: "Não autenticado" };

  const creator = await prisma.creator.findFirst({
    where: { id: creatorId, organizationId },
  });
  if (!creator) return { ok: false, error: "Creator não encontrado." };

  const name = data.name?.trim();
  if (!name) return { ok: false, error: "Nome é obrigatório." };

  try {
    const look = await prisma.creatorLook.create({
      data: {
        creatorId,
        name,
        description: data.description?.trim() || null,
        prompt: data.prompt?.trim() || " ",
        thumbnailUrl: data.thumbnailUrl?.trim() || null,
      },
    });
    revalidatePath(`/creators/${creatorId}`);
    return { ok: true, id: look.id };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Erro ao criar look." };
  }
}

export async function updateLook(
  organizationId: string,
  creatorId: string,
  lookId: string,
  data: { name?: string; description?: string | null; prompt?: string; thumbnailUrl?: string | null; isActive?: boolean }
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, error: "Não autenticado" };

  const look = await prisma.creatorLook.findFirst({
    where: { id: lookId, creatorId },
  });
  const creator = await prisma.creator.findFirst({
    where: { id: creatorId, organizationId },
  });
  if (!look || !creator) return { ok: false, error: "Não encontrado." };

  try {
    await prisma.creatorLook.update({
      where: { id: lookId },
      data: {
        name: data.name !== undefined ? data.name.trim() : undefined,
        description: data.description !== undefined ? (data.description?.trim() || null) : undefined,
        prompt: data.prompt !== undefined ? data.prompt.trim() : undefined,
        thumbnailUrl: data.thumbnailUrl !== undefined ? (data.thumbnailUrl?.trim() || null) : undefined,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
      },
    });
    revalidatePath(`/creators/${creatorId}`);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Erro ao atualizar." };
  }
}

export async function deleteLook(
  organizationId: string,
  creatorId: string,
  lookId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, error: "Não autenticado" };

  const creator = await prisma.creator.findFirst({
    where: { id: creatorId, organizationId },
  });
  const look = await prisma.creatorLook.findFirst({
    where: { id: lookId, creatorId },
  });
  if (!creator || !look) return { ok: false, error: "Não encontrado." };

  try {
    await prisma.creatorLook.delete({ where: { id: lookId } });
    revalidatePath(`/creators/${creatorId}`);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Erro ao excluir." };
  }
}

// ——— Voice ———
export async function upsertCreatorVoice(
  organizationId: string,
  creatorId: string,
  data: { tone?: string | null; style?: string | null; rules?: unknown[]; examples?: unknown[] }
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, error: "Não autenticado" };

  const creator = await prisma.creator.findFirst({
    where: { id: creatorId, organizationId },
    include: { voice: true },
  });
  if (!creator) return { ok: false, error: "Creator não encontrado." };

  try {
    if (creator.voice) {
      await prisma.creatorVoice.update({
        where: { id: creator.voice.id },
        data: {
          tone: data.tone !== undefined ? (data.tone?.trim() || null) : undefined,
          style: data.style !== undefined ? (data.style?.trim() || null) : undefined,
          rules: (data.rules ?? undefined) as JsonValue | undefined,
          examples: (data.examples ?? undefined) as JsonValue | undefined,
        },
      });
    } else {
      await prisma.creatorVoice.create({
        data: {
          creatorId,
          tone: data.tone?.trim() || null,
          style: data.style?.trim() || null,
          rules: (data.rules ?? []) as JsonValue,
          examples: (data.examples ?? []) as JsonValue,
        },
      });
    }
    revalidatePath(`/creators/${creatorId}`);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Erro ao salvar voz." };
  }
}
