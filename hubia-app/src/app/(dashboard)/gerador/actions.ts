"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentOrganizationId } from "@/lib/auth-organization";

export type CreatorOption = {
  id: string;
  name: string;
  environments: { id: string; name: string; prompt: string }[];
  looks: { id: string; name: string; prompt: string }[];
  appearance: {
    basePrompt: string;
    markers: string[];
    protected: string[];
  } | null;
};

export async function getCreatorsForGerador(): Promise<CreatorOption[]> {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return [];

  const creators = await prisma.creator.findMany({
    where: { organizationId, isActive: true },
    orderBy: { name: "asc" },
    include: {
      environments: { where: { isActive: true }, orderBy: { name: "asc" } },
      looks: { where: { isActive: true }, orderBy: { name: "asc" } },
      appearance: true,
    },
  });

  return creators.map((c) => ({
    id: c.id,
    name: c.name,
    environments: c.environments.map((e) => ({
      id: e.id,
      name: e.name,
      prompt: e.prompt,
    })),
    looks: c.looks.map((l) => ({
      id: l.id,
      name: l.name,
      prompt: l.prompt,
    })),
    appearance: c.appearance
      ? {
          basePrompt: c.appearance.basePrompt,
          markers: (c.appearance.markers as string[]) ?? [],
          protected: (c.appearance.protected as string[]) ?? [],
        }
      : null,
  }));
}

export type GeradorFormData = {
  creatorId: string;
  ambienteId: string;
  mood: string;
  horario: string;
  camera: string;
  lente: string;
  descricao: string;
};

export type GeradorResult = {
  ok: true;
  prompt: string;
  parametros: {
    camera: string;
    lente: string;
    abertura: string;
    iso: string;
  };
  creatorName: string;
  ambienteName: string;
  markers: string[];
  protected: string[];
} | { ok: false; error: string };

export async function gerarPrompt(data: GeradorFormData): Promise<GeradorResult> {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return { ok: false, error: "Não autenticado" };

  const creator = await prisma.creator.findFirst({
    where: { id: data.creatorId, organizationId },
    include: {
      appearance: true,
      environments: { where: { id: data.ambienteId } },
    },
  });
  if (!creator) return { ok: false, error: "Creator não encontrada." };

  const ambiente = creator.environments[0];
  const appearance = creator.appearance;

  // Derivar abertura e ISO padrão baseados na câmera/lente selecionada
  const abertura = "f/1.8";
  const iso = "200";

  // Montar o prompt completo a partir dos dados
  const parts: string[] = [];

  // Linha técnica de câmera
  const linhaTecnica = `${data.camera} + ${data.lente} portrait lens + ${data.horario} natural light`;
  parts.push(linhaTecnica);
  parts.push("");

  // Subject: aparência base da creator
  if (appearance?.basePrompt) {
    parts.push(`Subject: ${appearance.basePrompt}`);
    parts.push("");
  }

  // Scene: ambiente selecionado
  if (ambiente?.prompt) {
    parts.push(`Scene: ${ambiente.prompt}`);
    if (data.descricao?.trim()) {
      parts.push(data.descricao.trim());
    }
    parts.push("");
  } else if (data.descricao?.trim()) {
    parts.push(`Scene: ${data.descricao.trim()}`);
    parts.push("");
  }

  // Mood
  if (data.mood) {
    parts.push(`Mood: ${data.mood}`);
    parts.push("");
  }

  // Technical params
  parts.push(`Technical: ${abertura}, 1/400s, ISO ${iso}. Shallow DOF, background gently blurred. Skin texture: natural pores visible, realistic, hydrated — NOT plastic. No over-sharpening.`);
  parts.push("");

  // Style
  parts.push(`Style: High-end editorial lifestyle photography, warm natural color grade, analog film emulation subtle grain, NO HDR, NO artificial saturation. Photorealistic, indistinguishable from real photography.`);

  const prompt = parts.join("\n");

  return {
    ok: true,
    prompt,
    parametros: {
      camera: data.camera,
      lente: `${data.lente} f/1.4`,
      abertura,
      iso,
    },
    creatorName: creator.name,
    ambienteName: ambiente?.name ?? data.ambienteId,
    markers: (appearance?.markers as string[]) ?? [],
    protected: (appearance?.protected as string[]) ?? [],
  };
}
