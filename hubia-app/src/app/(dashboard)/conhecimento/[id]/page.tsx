import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ConhecimentoItemClient from "./conhecimento-item-client";
import type { KnowledgeCard } from "../actions";
import type { KnowledgeSourceType } from "@prisma/client";
import type { ItemTipo, ItemStatus } from "../actions";

// Mock data para IDs "mock-*"
const MOCK_DATA: KnowledgeCard[] = [
  {
    id: "mock-1",
    title: "Referência: Cinematic Still — técnica de iluminação para fashion outdoor",
    summary: "Análise completa da técnica de iluminação natural usada em editoriais de moda outdoor. Inclui configurações de câmera, horários de luz e composição de cena.",
    category: "ai image",
    sourceType: "link" as KnowledgeSourceType,
    sourceUrl: "https://midjourney.com/showcase",
    fileUrl: null,
    tags: ["iluminação", "outdoor", "ninaah", "fashion", "cinematic"],
    aiProcessed: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    itemTipo: "referencia" as ItemTipo,
    itemStatus: "processado" as ItemStatus,
    projetoVinculado: "Creator Ninaah",
    creatorVinculado: "Ninaah",
    qtdAprendizados: 7,
    qtdLicoes: 4,
    qtdRulesSugeridas: 2,
    temAnexos: false,
    temLinks: true,
    origem: "Midjourney Showcase",
  },
  {
    id: "mock-2",
    title: "PDF: Guia completo de prompting para consistência de personagem — Flux",
    summary: "Documento técnico com 40 páginas sobre como manter consistência visual de personagem no Flux. Técnicas de seed, face locking e prompt weighting.",
    category: "prompting",
    sourceType: "pdf" as KnowledgeSourceType,
    sourceUrl: null,
    fileUrl: "/docs/flux-consistency-guide.pdf",
    tags: ["flux", "consistência", "personagem", "seed", "prompting"],
    aiProcessed: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    itemTipo: "documento" as ItemTipo,
    itemStatus: "revisado" as ItemStatus,
    projetoVinculado: "Gerador de Prompt v2",
    creatorVinculado: null,
    qtdAprendizados: 12,
    qtdLicoes: 8,
    qtdRulesSugeridas: 5,
    temAnexos: true,
    temLinks: false,
    origem: "Flux Community Docs",
  },
  {
    id: "mock-3",
    title: "Benchmark: Motion design de interfaces — referências top 10 de 2024",
    summary: "Curadoria de 10 interfaces com motion design excepcional. Análise de timing, easing e micro-interações que podem influenciar o design system do Hubia.",
    category: "motion",
    sourceType: "link" as KnowledgeSourceType,
    sourceUrl: "https://dribbble.com/shots/motion-2024",
    fileUrl: null,
    tags: ["motion", "interfaces", "dribbble", "micro-interação", "easing"],
    aiProcessed: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    itemTipo: "link" as ItemTipo,
    itemStatus: "bruto" as ItemStatus,
    projetoVinculado: null,
    creatorVinculado: null,
    qtdAprendizados: 0,
    qtdLicoes: 0,
    qtdRulesSugeridas: 0,
    temAnexos: false,
    temLinks: true,
    origem: "Dribbble",
  },
  {
    id: "mock-4",
    title: "Aprendizado: Padrões de erro no briefing de creators — análise dos últimos 3 meses",
    summary: "Análise interna dos pedidos com retrabalho. Identificados 5 padrões de briefing inadequado que geraram mais de 40% dos ciclos extras nos últimos 90 dias.",
    category: "estratégia",
    sourceType: "texto" as KnowledgeSourceType,
    sourceUrl: null,
    fileUrl: null,
    tags: ["briefing", "qualidade", "processo", "creators", "retrabalho"],
    aiProcessed: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    itemTipo: "aprendizado" as ItemTipo,
    itemStatus: "aplicado" as ItemStatus,
    projetoVinculado: null,
    creatorVinculado: null,
    qtdAprendizados: 5,
    qtdLicoes: 6,
    qtdRulesSugeridas: 3,
    temAnexos: false,
    temLinks: false,
    origem: "Análise interna",
  },
  {
    id: "mock-5",
    title: "Imagem: Looks de referência para editorial urbano — mood board Layla",
    summary: "Conjunto de 24 imagens de referência para os looks urbanos da creator Layla. Paleta de cores dominante: terra e cobre com acentos metálicos.",
    category: "imagem",
    sourceType: "imagem" as KnowledgeSourceType,
    sourceUrl: null,
    fileUrl: "/uploads/moodboard-layla-urbano.zip",
    tags: ["layla", "editorial", "urbano", "mood-board", "terra"],
    aiProcessed: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    itemTipo: "imagem" as ItemTipo,
    itemStatus: "processado" as ItemStatus,
    projetoVinculado: null,
    creatorVinculado: "Layla",
    qtdAprendizados: 3,
    qtdLicoes: 2,
    qtdRulesSugeridas: 1,
    temAnexos: true,
    temLinks: false,
    origem: "Arquivo interno",
  },
  {
    id: "mock-6",
    title: "Insight: Creators com mais engajamento têm 3 características em comum",
    summary: "Insight derivado da análise de 120 posts dos últimos 6 meses. Creators que mantêm consistência de paleta, frequência de 4-5 posts/semana e tom de voz autêntico geram 3x mais engajamento.",
    category: "creator",
    sourceType: "texto" as KnowledgeSourceType,
    sourceUrl: null,
    fileUrl: null,
    tags: ["engajamento", "consistência", "frequência", "creator", "análise"],
    aiProcessed: true,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    itemTipo: "insight" as ItemTipo,
    itemStatus: "revisado" as ItemStatus,
    projetoVinculado: null,
    creatorVinculado: null,
    qtdAprendizados: 8,
    qtdLicoes: 5,
    qtdRulesSugeridas: 4,
    temAnexos: false,
    temLinks: false,
    origem: "Análise interna",
  },
  {
    id: "mock-7",
    title: "Regra sugerida: Padrão de nomenclatura para arquivos de prompt",
    summary: "Baseado em inconsistências encontradas no workflow do gerador, esta regra propõe um padrão de nomenclatura para os arquivos de prompt gerados pelo sistema.",
    category: "workflow",
    sourceType: "texto" as KnowledgeSourceType,
    sourceUrl: null,
    fileUrl: null,
    tags: ["nomenclatura", "workflow", "gerador", "padrão", "organização"],
    aiProcessed: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    itemTipo: "regra_sugerida" as ItemTipo,
    itemStatus: "revisado" as ItemStatus,
    projetoVinculado: "Gerador de Prompt v2",
    creatorVinculado: null,
    qtdAprendizados: 2,
    qtdLicoes: 3,
    qtdRulesSugeridas: 1,
    temAnexos: false,
    temLinks: false,
    origem: "Análise de sistema",
  },
  {
    id: "mock-8",
    title: "Manual de operação: Fluxo de aprovação de conteúdo no Audiovisual Squad",
    summary: "Documento que descreve o fluxo completo de aprovação de conteúdo: desde o briefing inicial até a entrega final ao cliente. Inclui responsabilidades por papel, SLAs e critérios de aprovação.",
    category: "workflow",
    sourceType: "pdf" as KnowledgeSourceType,
    sourceUrl: null,
    fileUrl: "/docs/manual-aprovacao-audiovisual.pdf",
    tags: ["manual", "aprovação", "audiovisual", "fluxo", "SLA"],
    aiProcessed: true,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    itemTipo: "manual" as ItemTipo,
    itemStatus: "aplicado" as ItemStatus,
    projetoVinculado: null,
    creatorVinculado: null,
    qtdAprendizados: 4,
    qtdLicoes: 6,
    qtdRulesSugeridas: 2,
    temAnexos: true,
    temLinks: false,
    origem: "Documentação interna",
  },
];

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ConhecimentoItemPage({ params }: Props) {
  const { id } = await params;

  // Mock items
  if (id.startsWith("mock-")) {
    const mock = MOCK_DATA.find((m) => m.id === id);
    if (!mock) notFound();
    return <ConhecimentoItemClient item={mock} />;
  }

  // Item real do banco
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const member = user?.id
    ? await prisma.organizationMember.findFirst({ where: { userId: user.id, isActive: true } })
    : null;

  const organizationId = member?.organizationId ?? null;
  if (!organizationId) notFound();

  const entry = await prisma.knowledgeEntry.findFirst({
    where: { id, organizationId },
  });
  if (!entry) notFound();

  const meta = (entry.aiMetadata as Record<string, unknown>) ?? {};

  const item: KnowledgeCard = {
    id: entry.id,
    title: entry.title,
    summary: entry.summary,
    category: entry.category,
    sourceType: entry.sourceType,
    sourceUrl: entry.sourceUrl,
    fileUrl: entry.fileUrl,
    tags: Array.isArray(entry.tags) ? (entry.tags as string[]) : [],
    aiProcessed: entry.aiProcessed,
    createdAt: entry.createdAt.toISOString(),
    itemTipo: (meta.itemTipo as ItemTipo) ?? "texto",
    itemStatus: (meta.itemStatus as ItemStatus) ?? "bruto",
    projetoVinculado: (meta.projetoVinculado as string) ?? null,
    creatorVinculado: (meta.creatorVinculado as string) ?? null,
    qtdAprendizados: (meta.qtdAprendizados as number) ?? 0,
    qtdLicoes: (meta.qtdLicoes as number) ?? 0,
    qtdRulesSugeridas: (meta.qtdRulesSugeridas as number) ?? 0,
    temAnexos: (meta.temAnexos as boolean) ?? false,
    temLinks: !!(entry.sourceUrl),
    origem: (meta.origem as string) ?? null,
  };

  return <ConhecimentoItemClient item={item} />;
}
