"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Plus, BookOpen, X, Bot, Trash2, Link, FileText, File, Image,
  Brain, Sparkles, FolderKanban, Users, ExternalLink,
  Paperclip, Lightbulb, ClipboardList, BookMarked, Layers,
  Search, TrendingUp, Zap,
} from "lucide-react";
import { HubiaPortal } from "@/components/ui/hubia-portal";
import { HubiaSelect } from "@/components/ui/hubia-select";
import { toast } from "@/components/ui/hubia-toast";
import { getKnowledgeEntries, createKnowledgeEntry, deleteKnowledgeEntry } from "./actions";
import type { KnowledgeCard, ItemTipo, ItemStatus } from "./actions";
import type { KnowledgeSourceType } from "@prisma/client";

// ─── Configs ──────────────────────────────────────────────────────────────────

const TIPO_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  link:           { label: "Link",           bg: "#E1F4FE", text: "#0277BD", icon: Link },
  arquivo:        { label: "Arquivo",        bg: "#E8F5E9", text: "#2E7D32", icon: File },
  imagem:         { label: "Imagem",         bg: "#EDE7F6", text: "#512DA8", icon: Image },
  documento:      { label: "Documento",      bg: "#FFF8E1", text: "#F57F17", icon: FileText },
  referencia:     { label: "Referência",     bg: "#FCE4EC", text: "#AD1457", icon: BookMarked },
  aprendizado:    { label: "Aprendizado",    bg: "#F3E5F5", text: "#6A1B9A", icon: Brain },
  insight:        { label: "Insight",        bg: "#FFF3E0", text: "#E65100", icon: Lightbulb },
  regra_sugerida: { label: "Regra",          bg: "#E8EAF6", text: "#283593", icon: ClipboardList },
  manual:         { label: "Manual",         bg: "#E0F7FA", text: "#00695C", icon: Layers },
  texto:          { label: "Texto",          bg: "#EEEFE9", text: "#5E5E5F", icon: FileText },
};

const STATUS_CONFIG: Record<ItemStatus, { label: string; dot: string }> = {
  bruto:        { label: "Bruto",        dot: "#A9AAA5" },
  processando:  { label: "Processando",  dot: "#F57F17" },
  processado:   { label: "Processado",   dot: "#2E7D32" },
  revisado:     { label: "Revisado",     dot: "#0277BD" },
  aplicado:     { label: "Aplicado",     dot: "#8AB000" },
  arquivado:    { label: "Arquivado",    dot: "#A9AAA5" },
};

const CATEGORIA_COLORS: Record<string, { bg: string; text: string }> = {
  "ai image":    { bg: "#7C6AF720", text: "#7C6AF7" },
  "prompting":   { bg: "#FB8C0020", text: "#FB8C00" },
  "frontend":    { bg: "#0288D120", text: "#0288D1" },
  "consistência":{ bg: "#43A04720", text: "#43A047" },
  "next.js":     { bg: "#0E0F1015", text: "#0E0F10" },
  "creator":     { bg: "#F48FB120", text: "#F48FB1" },
  "imagem":      { bg: "#7C6AF720", text: "#7C6AF7" },
  "vídeo":       { bg: "#E5393520", text: "#E53935" },
  "workflow":    { bg: "#43A04720", text: "#43A047" },
  "referência":  { bg: "#0288D120", text: "#0288D1" },
  "benchmark":   { bg: "#FB8C0020", text: "#FB8C00" },
  "motion":      { bg: "#7C6AF720", text: "#7C6AF7" },
  "design":      { bg: "#E91E8C20", text: "#AD1570" },
  "estratégia":  { bg: "#00897B20", text: "#00695C" },
};

function getCatStyle(cat: string | null) {
  if (!cat) return null;
  return CATEGORIA_COLORS[cat.toLowerCase()] ?? null;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_DATA: KnowledgeCard[] = [
  {
    id: "mock-1",
    title: "Referência: Cinematic Still — técnica de iluminação para fashion outdoor",
    summary: "Análise completa da técnica de iluminação natural usada em editoriais de moda outdoor. Inclui configurações de câmera, horários de luz e composição de cena.",
    category: "ai image",
    sourceType: "link",
    sourceUrl: "https://midjourney.com/showcase",
    fileUrl: null,
    tags: ["iluminação", "outdoor", "ninaah", "fashion"],
    aiProcessed: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    itemTipo: "referencia",
    itemStatus: "processado",
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
    sourceType: "pdf",
    sourceUrl: null,
    fileUrl: "/docs/flux-consistency-guide.pdf",
    tags: ["flux", "consistência", "personagem", "seed"],
    aiProcessed: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    itemTipo: "documento",
    itemStatus: "revisado",
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
    sourceType: "link",
    sourceUrl: "https://dribbble.com/shots/motion-2024",
    fileUrl: null,
    tags: ["motion", "interfaces", "micro-interação"],
    aiProcessed: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    itemTipo: "link",
    itemStatus: "bruto",
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
    sourceType: "texto",
    sourceUrl: null,
    fileUrl: null,
    tags: ["briefing", "qualidade", "retrabalho"],
    aiProcessed: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    itemTipo: "aprendizado",
    itemStatus: "aplicado",
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
    sourceType: "imagem",
    sourceUrl: null,
    fileUrl: "/uploads/moodboard-layla-urbano.zip",
    tags: ["layla", "editorial", "urbano"],
    aiProcessed: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    itemTipo: "imagem",
    itemStatus: "processado",
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
    summary: "Insight derivado da análise de 120 posts. Creators que mantêm consistência de paleta, frequência de 4–5 posts/semana e tom de voz autêntico geram 3x mais engajamento.",
    category: "creator",
    sourceType: "texto",
    sourceUrl: null,
    fileUrl: null,
    tags: ["engajamento", "consistência", "frequência"],
    aiProcessed: true,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    itemTipo: "insight",
    itemStatus: "revisado",
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
    sourceType: "texto",
    sourceUrl: null,
    fileUrl: null,
    tags: ["nomenclatura", "workflow", "padrão"],
    aiProcessed: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    itemTipo: "regra_sugerida",
    itemStatus: "revisado",
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
    summary: "Documento que descreve o fluxo completo de aprovação de conteúdo: desde o briefing inicial até a entrega final. Inclui responsabilidades por papel, SLAs e critérios.",
    category: "workflow",
    sourceType: "pdf",
    sourceUrl: null,
    fileUrl: "/docs/manual-aprovacao-audiovisual.pdf",
    tags: ["manual", "aprovação", "audiovisual"],
    aiProcessed: true,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    itemTipo: "manual",
    itemStatus: "aplicado",
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

const DRAFT_KEY = "hubia:novo-conhecimento:rascunho";

const TIPO_FILTROS = [
  { id: "todos",          label: "Todos" },
  { id: "link",           label: "Links" },
  { id: "documento",      label: "Documentos" },
  { id: "imagem",         label: "Imagens" },
  { id: "aprendizado",    label: "Aprendizados" },
  { id: "insight",        label: "Insights" },
  { id: "regra_sugerida", label: "Regras" },
  { id: "manual",         label: "Manuais" },
];

const STATUS_FILTROS = [
  { id: "todos",       label: "Todos" },
  { id: "bruto",       label: "Bruto" },
  { id: "processando", label: "Processando" },
  { id: "processado",  label: "Processado" },
  { id: "revisado",    label: "Revisado" },
  { id: "aplicado",    label: "Aplicado" },
];

// ─── Componente principal ──────────────────────────────────────────────────────

export default function ConhecimentoClient({
  organizationId,
  initialEntradas,
}: {
  organizationId: string;
  initialEntradas: KnowledgeCard[];
}) {
  const router = useRouter();
  const [entradas, setEntradas] = useState<KnowledgeCard[]>([...MOCK_DATA, ...initialEntradas]);
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = entradas.filter((e) => {
    const matchTipo   = tipoFiltro   === "todos" || e.itemTipo   === tipoFiltro;
    const matchStatus = statusFiltro === "todos" || e.itemStatus === statusFiltro;
    const matchBusca  = !busca ||
      e.title.toLowerCase().includes(busca.toLowerCase()) ||
      e.summary?.toLowerCase().includes(busca.toLowerCase()) ||
      e.tags.some((t) => t.toLowerCase().includes(busca.toLowerCase()));
    return matchTipo && matchStatus && matchBusca;
  });

  const totalItens         = entradas.length;
  const totalAprendizados  = entradas.reduce((s, e) => s + (e.qtdAprendizados ?? 0), 0);
  const totalRules         = entradas.reduce((s, e) => s + (e.qtdRulesSugeridas ?? 0), 0);
  const projetosImpactados = new Set(entradas.filter((e) => e.projetoVinculado).map((e) => e.projetoVinculado)).size;

  const handleDelete = async (id: string) => {
    if (id.startsWith("mock-")) {
      setEntradas((prev) => prev.filter((e) => e.id !== id));
      toast.success("Item removido.");
      return;
    }
    const result = await deleteKnowledgeEntry(organizationId, id);
    if (!result.ok) { toast.error(result.error ?? "Erro"); return; }
    setEntradas((prev) => prev.filter((e) => e.id !== id));
    toast.success("Item removido.");
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#0E0F10]">Conhecimento</h1>
          <p className="text-[13px] text-[#A9AAA5] mt-0.5">Centro de ingestão, curadoria e aprendizado da Hubia</p>
        </div>
        <motion.button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-[18px] bg-[#D7FF00] px-4 py-3 text-[15px] font-semibold text-[#0E0F10]"
          initial="rest" animate="rest" whileHover="hovered" whileTap={{ scale: 0.96 }}
          variants={{ rest: { scale: 1, backgroundColor: "#D7FF00" }, hovered: { scale: 1.03, backgroundColor: "#DFFF33" } }}
          transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <motion.span variants={{ rest: { scale: 1 }, hovered: { scale: 1.2 } }} transition={{ duration: 0.25 }}>
            <Plus size={16} />
          </motion.span>
          Adicionar conhecimento
        </motion.button>
      </div>

      {/* Cards macro — indicadores estratégicos */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Itens",
            sublabel: "Base de conhecimento",
            valor: totalItens,
            icon: BookOpen,
            cor: "#0E0F10",
            bg: "#FFFFFF",
            trend: "+3 esta semana",
          },
          {
            label: "Aprendizados",
            sublabel: "Extraídos pela IA",
            valor: totalAprendizados,
            icon: Brain,
            cor: "#6A1B9A",
            bg: "#F3E5F5",
            trend: "de " + totalItens + " itens",
          },
          {
            label: "Regras",
            sublabel: "Sugeridas para aplicar",
            valor: totalRules,
            icon: ClipboardList,
            cor: "#283593",
            bg: "#E8EAF6",
            trend: "prontas para revisar",
          },
          {
            label: "Projetos",
            sublabel: "Impactados pelo acervo",
            valor: projetosImpactados,
            icon: FolderKanban,
            cor: "#2E7D32",
            bg: "#E8F5E9",
            trend: "com vínculos ativos",
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            className="rounded-[20px] p-4 flex flex-col gap-3"
            style={{ backgroundColor: card.bg }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: i * 0.06 }}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: card.cor, opacity: 0.5 }}>
                  {card.label}
                </p>
                <p className="text-[10px] text-[#A9AAA5] mt-0.5 leading-tight">{card.sublabel}</p>
              </div>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px]"
                style={{ backgroundColor: card.cor + "12" }}>
                <card.icon size={14} style={{ color: card.cor }} />
              </div>
            </div>
            <div className="flex items-end justify-between gap-1">
              <span className="text-[32px] font-bold leading-none" style={{ color: card.cor }}>
                {card.valor}
              </span>
              <span className="text-[10px] text-[#A9AAA5] mb-0.5 leading-tight text-right">{card.trend}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filtros + Busca */}
      <div className="rounded-[20px] bg-white px-4 py-3 flex flex-col gap-3">
        {/* Busca */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A9AAA5]" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título, resumo ou tag..."
            className="h-9 w-full rounded-[10px] border border-transparent bg-[#EEEFE9] pl-8 pr-3.5 text-[13px] text-[#0E0F10] outline-none placeholder:text-[#A9AAA5] hover:border-[#D4D5D6] focus:border-[#0E0F10] focus:bg-white focus:shadow-[0_0_0_3px_rgba(14,15,16,0.06)] transition-[border-color,background-color,box-shadow] duration-150"
          />
        </div>

        {/* Divisor */}
        <div className="border-t border-[#EEEFE9]" />

        {/* Filtro: tipo */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#D5D2C9] w-[36px] shrink-0">Tipo</span>
          <div className="flex items-center gap-1 flex-wrap">
            {TIPO_FILTROS.map((f) => {
              const isActive = tipoFiltro === f.id;
              const conf = f.id !== "todos" ? TIPO_CONFIG[f.id] : null;
              return (
                <motion.button
                  key={f.id}
                  onClick={() => setTipoFiltro(f.id)}
                  className="rounded-[9999px] px-2.5 py-1 text-[11px] font-semibold transition-none"
                  animate={{
                    backgroundColor: isActive
                      ? (conf ? conf.bg : "#0E0F10")
                      : "transparent",
                    color: isActive
                      ? (conf ? conf.text : "#FFFFFF")
                      : "#A9AAA5",
                  }}
                  initial={false}
                  whileHover={!isActive ? { backgroundColor: "rgba(213,210,201,0.25)", color: "#0E0F10" } : {}}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.12 }}
                >
                  {f.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Filtro: status */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#D5D2C9] w-[36px] shrink-0">Status</span>
          <div className="flex items-center gap-1 flex-wrap">
            {STATUS_FILTROS.map((f) => {
              const isActive = statusFiltro === f.id;
              const dot = f.id !== "todos" ? STATUS_CONFIG[f.id as ItemStatus]?.dot : null;
              return (
                <motion.button
                  key={f.id}
                  onClick={() => setStatusFiltro(f.id)}
                  className="flex items-center gap-1.5 rounded-[9999px] px-2.5 py-1 text-[11px] font-semibold transition-none"
                  animate={{
                    backgroundColor: isActive ? "#0E0F10" : "transparent",
                    color: isActive ? "#FFFFFF" : "#A9AAA5",
                  }}
                  initial={false}
                  whileHover={!isActive ? { backgroundColor: "rgba(213,210,201,0.25)", color: "#0E0F10" } : {}}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.12 }}
                >
                  {dot && !isActive && (
                    <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: dot }} />
                  )}
                  {f.label}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contagem de resultados */}
      {(tipoFiltro !== "todos" || statusFiltro !== "todos" || busca) && (
        <p className="text-[12px] text-[#A9AAA5] -mt-1">
          {filtered.length === 0 ? "Nenhum item encontrado" : `${filtered.length} item${filtered.length !== 1 ? "s" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`}
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState onAdd={() => setModalOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e, i) => (
            <KnowledgeCardItem
              key={e.id}
              entry={e}
              index={i}
              onClick={() => router.push(`/conhecimento/${e.id}`)}
              onDelete={handleDelete}
            />
          ))}
          {/* Card adicionar */}
          <motion.button
            onClick={() => setModalOpen(true)}
            className="rounded-[20px] border-2 border-dashed border-[#D5D2C9] p-5 flex flex-col items-center justify-center gap-2 min-h-[140px]"
            whileHover={{ borderColor: "#A9AAA5", backgroundColor: "rgba(213,210,201,0.06)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            <motion.span
              whileHover={{ scale: 1.2 }}
              transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <Plus size={18} color="#A9AAA5" />
            </motion.span>
            <span className="text-[11px] font-semibold text-[#A9AAA5]">Adicionar item</span>
          </motion.button>
        </div>
      )}

      {/* Modal */}
      <NovoItemModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        organizationId={organizationId}
        onCreated={async () => {
          setModalOpen(false);
          const data = await getKnowledgeEntries(organizationId);
          setEntradas([...MOCK_DATA, ...data]);
        }}
      />
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const recursos = [
    { icon: Link,         label: "Colar links" },
    { icon: File,         label: "Enviar arquivos" },
    { icon: Image,        label: "Subir imagens" },
    { icon: Brain,        label: "Gerar aprendizados" },
    { icon: Sparkles,     label: "Alimentar memória" },
    { icon: FolderKanban, label: "Vincular a projetos" },
  ];

  return (
    <motion.div
      className="flex flex-col items-center gap-6 rounded-[24px] bg-white py-14 px-8"
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#EEEFE9]">
        <BookOpen size={20} color="#A9AAA5" />
      </div>
      <div className="text-center">
        <p className="text-[16px] font-bold text-[#0E0F10]">Base de conhecimento vazia</p>
        <p className="mt-1.5 text-[13px] text-[#A9AAA5] max-w-[360px] leading-relaxed">
          Adicione referências, materiais, aprendizados e insights que alimentam toda a operação da Hubia.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {recursos.map(({ icon: Icon, label }) => (
          <span key={label} className="flex items-center gap-1.5 rounded-[9999px] bg-[#EEEFE9] px-3 py-1.5 text-[11px] font-semibold text-[#5E5E5F]">
            <Icon size={11} /> {label}
          </span>
        ))}
      </div>
      <motion.button
        onClick={onAdd}
        className="flex items-center gap-2 rounded-[18px] bg-[#D7FF00] px-5 py-3 text-[14px] font-semibold text-[#0E0F10]"
        whileHover={{ scale: 1.03, backgroundColor: "#DFFF33" }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <Plus size={14} /> Adicionar primeiro item
      </motion.button>
    </motion.div>
  );
}

// ─── Card de conhecimento ──────────────────────────────────────────────────────

function KnowledgeCardItem({
  entry: e,
  index: i,
  onClick,
  onDelete,
}: {
  entry: KnowledgeCard;
  index: number;
  onClick: () => void;
  onDelete: (id: string) => void;
}) {
  const tipoConf  = TIPO_CONFIG[e.itemTipo ?? "texto"] ?? TIPO_CONFIG.texto;
  const statusConf = STATUS_CONFIG[e.itemStatus ?? "bruto"] ?? STATUS_CONFIG.bruto;
  const catStyle  = getCatStyle(e.category);
  const TipoIcon  = tipoConf.icon;

  const temMetricas = (e.qtdAprendizados ?? 0) > 0 || (e.qtdLicoes ?? 0) > 0 || (e.qtdRulesSugeridas ?? 0) > 0;

  return (
    <motion.div
      className="cursor-pointer rounded-[20px] bg-white p-4 flex flex-col gap-2.5 group"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: Math.min(i * 0.06, 0.3) }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Linha 1: tipo + status + delete */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Tipo */}
          <span
            className="flex items-center gap-1 rounded-[5px] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide shrink-0"
            style={{ backgroundColor: tipoConf.bg, color: tipoConf.text }}
          >
            <TipoIcon size={8} />
            {tipoConf.label}
          </span>
          {/* Categoria — mais discreta */}
          {catStyle && e.category && (
            <span
              className="rounded-[5px] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide truncate max-w-[80px]"
              style={{ backgroundColor: catStyle.bg, color: catStyle.text }}
            >
              {e.category}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Status com dot — sutil */}
          <span className="flex items-center gap-1 text-[9px] font-semibold text-[#A9AAA5]">
            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: statusConf.dot }} />
            {statusConf.label}
          </span>
          {/* IA badge */}
          {e.aiProcessed && (
            <span className="flex items-center gap-0.5 rounded-[5px] bg-[#D7FF00]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#6B7C00] uppercase">
              <Bot size={8} /> IA
            </span>
          )}
          {/* Delete no hover */}
          <motion.button
            className="flex h-5 w-5 items-center justify-center rounded-full opacity-0 group-hover:opacity-100"
            style={{ backgroundColor: "#EEEFE9" }}
            whileHover={{ backgroundColor: "#FEE2E2", scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.15 }}
            onClick={(ev) => { ev.stopPropagation(); onDelete(e.id); }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
          >
            <Trash2 size={9} color="#E53935" />
          </motion.button>
        </div>
      </div>

      {/* Título — hierarquia principal */}
      <h3 className="text-[14px] font-bold text-[#0E0F10] leading-snug line-clamp-2">{e.title}</h3>

      {/* Resumo — hierarquia secundária, mais leve */}
      {e.summary && (
        <p className="text-[11px] text-[#A9AAA5] line-clamp-2 leading-relaxed -mt-0.5">{e.summary}</p>
      )}

      {/* Vínculos — contexto operacional */}
      {(e.projetoVinculado || e.creatorVinculado) && (
        <div className="flex items-center gap-2.5 flex-wrap">
          {e.projetoVinculado && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-[#5E5E5F]">
              <FolderKanban size={9} color="#A9AAA5" /> {e.projetoVinculado}
            </span>
          )}
          {e.creatorVinculado && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-[#5E5E5F]">
              <Users size={9} color="#A9AAA5" /> {e.creatorVinculado}
            </span>
          )}
        </div>
      )}

      {/* Métricas de valor — o coração da feature */}
      {temMetricas && (
        <div className="flex items-center gap-2 pt-2 border-t border-[#F3F3F0]">
          {(e.qtdAprendizados ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: "#6A1B9A" }}>
              <Brain size={9} /> {e.qtdAprendizados}
              <span className="font-normal text-[#A9AAA5]">aprend.</span>
            </span>
          )}
          {(e.qtdLicoes ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: "#E65100" }}>
              <Lightbulb size={9} /> {e.qtdLicoes}
              <span className="font-normal text-[#A9AAA5]">lições</span>
            </span>
          )}
          {(e.qtdRulesSugeridas ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: "#283593" }}>
              <ClipboardList size={9} /> {e.qtdRulesSugeridas}
              <span className="font-normal text-[#A9AAA5]">regras</span>
            </span>
          )}
        </div>
      )}

      {/* Rodapé — metadata discreta */}
      <div className="flex items-center justify-between pt-1.5 border-t border-[#F3F3F0] mt-auto">
        <div className="flex items-center gap-1.5">
          {e.temAnexos  && <Paperclip   size={10} color="#D5D2C9" />}
          {e.temLinks   && <ExternalLink size={10} color="#D5D2C9" />}
          {e.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[9px] text-[#D5D2C9] font-medium">#{tag}</span>
          ))}
        </div>
        <span className="text-[9px] text-[#D5D2C9]">
          {new Date(e.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Modal novo item ───────────────────────────────────────────────────────────

function NovoItemModal({ open, onClose, organizationId, onCreated }: {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  onCreated: () => void;
}) {
  const [title, setTitle]         = useState("");
  const [content, setContent]     = useState("");
  const [category, setCategory]   = useState("");
  const [sourceType, setSourceType] = useState<KnowledgeSourceType>("texto");
  const [itemTipo, setItemTipo]   = useState<ItemTipo>("texto");
  const [sourceUrl, setSourceUrl] = useState("");
  const [tags, setTags]           = useState("");
  const [loading, setLoading]     = useState(false);

  const handleClose = () => {
    if (title.trim() && typeof window !== "undefined") {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, content, category, sourceType }));
      toast.info("Rascunho salvo.");
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    const result = await createKnowledgeEntry(organizationId, {
      title, content, category: category || undefined,
      sourceType, sourceUrl: sourceUrl || undefined,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      itemTipo,
    });
    setLoading(false);
    if (!result.ok) { toast.error(result.error); return; }
    if (typeof window !== "undefined") localStorage.removeItem(DRAFT_KEY);
    toast.success("Item de conhecimento adicionado!");
    onCreated();
  };

  return (
    <HubiaPortal>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            initial={{ backgroundColor: "rgba(14,15,16,0)", backdropFilter: "blur(0px)" }}
            animate={{ backgroundColor: "rgba(14,15,16,0.70)", backdropFilter: "blur(12px)" }}
            exit={{ backgroundColor: "rgba(14,15,16,0)", backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
            onClick={(e) => e.target === e.currentTarget && handleClose()}
          >
            <motion.div
              className="w-full max-w-[560px] rounded-[20px] bg-white p-7 max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.88, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 10, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[20px] font-bold text-[#0E0F10]">Adicionar conhecimento</h2>
                  <p className="text-[12px] text-[#A9AAA5] mt-0.5">Links, arquivos, textos, insights, referências</p>
                </div>
                <motion.button
                  onClick={handleClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0E0F10]"
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ rotate: 90, scale: 0.9 }}
                  transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <X size={14} color="#D7FF00" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Tipo de item */}
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Tipo de item</label>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(TIPO_CONFIG).filter(([k]) => k !== "texto" && k !== "arquivo").map(([key, conf]) => {
                      const Icon = conf.icon;
                      const isSelected = itemTipo === key;
                      return (
                        <motion.button
                          key={key}
                          type="button"
                          onClick={() => setItemTipo(key as ItemTipo)}
                          className="flex items-center gap-1.5 rounded-[9999px] px-3 py-1.5 text-[11px] font-semibold border"
                          animate={{
                            backgroundColor: isSelected ? conf.bg : "transparent",
                            color: isSelected ? conf.text : "#A9AAA5",
                            borderColor: isSelected ? conf.text + "30" : "#EEEFE9",
                          }}
                          initial={false}
                          whileHover={!isSelected ? { backgroundColor: "rgba(213,210,201,0.2)", color: "#0E0F10" } : {}}
                          whileTap={{ scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Icon size={11} />
                          {conf.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Título *</label>
                  <input
                    autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Benchmark de motion design — interfaces top 2024"
                    className="h-11 w-full rounded-[10px] border border-transparent bg-[#EEEFE9] px-3.5 text-[14px] text-[#0E0F10] outline-none placeholder:text-[#A9AAA5] hover:border-[#D4D5D6] focus:border-[#0E0F10] focus:shadow-[0_0_0_3px_rgba(14,15,16,0.08)] transition-[border-color,box-shadow] duration-150"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Categoria</label>
                    <HubiaSelect
                      value={category} onChange={setCategory} placeholder="Selecionar..."
                      options={[
                        { value: "", label: "Sem categoria" },
                        ...Object.keys(CATEGORIA_COLORS).map((c) => ({ value: c, label: c })),
                      ]}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Formato</label>
                    <HubiaSelect
                      value={sourceType} onChange={(v) => setSourceType(v as KnowledgeSourceType)}
                      options={[
                        { value: "texto",  label: "Texto" },
                        { value: "link",   label: "Link" },
                        { value: "pdf",    label: "PDF" },
                        { value: "md",     label: "Markdown" },
                        { value: "imagem", label: "Imagem" },
                      ]}
                    />
                  </div>
                </div>

                {sourceType === "link" && (
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">URL</label>
                    <input
                      value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)}
                      placeholder="https://..."
                      className="h-11 w-full rounded-[10px] border border-transparent bg-[#EEEFE9] px-3.5 text-[14px] text-[#0E0F10] outline-none placeholder:text-[#A9AAA5] hover:border-[#D4D5D6] focus:border-[#0E0F10] focus:shadow-[0_0_0_3px_rgba(14,15,16,0.08)] transition-[border-color,box-shadow] duration-150"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">
                    {sourceType === "link" ? "Descrição / contexto" : "Conteúdo *"}
                  </label>
                  <textarea
                    value={content} onChange={(e) => setContent(e.target.value)}
                    placeholder="Descreva o que este item contém e qual o seu valor para a operação..."
                    rows={4}
                    className="w-full rounded-[10px] border border-transparent bg-[#EEEFE9] px-3.5 py-2.5 text-[14px] text-[#0E0F10] outline-none placeholder:text-[#A9AAA5] resize-none hover:border-[#D4D5D6] focus:border-[#0E0F10] focus:shadow-[0_0_0_3px_rgba(14,15,16,0.08)] transition-[border-color,box-shadow] duration-150"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Tags</label>
                  <input
                    value={tags} onChange={(e) => setTags(e.target.value)}
                    placeholder="prompt, creator, referência (separar por vírgula)"
                    className="h-11 w-full rounded-[10px] border border-transparent bg-[#EEEFE9] px-3.5 text-[14px] text-[#0E0F10] outline-none placeholder:text-[#A9AAA5] hover:border-[#D4D5D6] focus:border-[#0E0F10] focus:shadow-[0_0_0_3px_rgba(14,15,16,0.08)] transition-[border-color,box-shadow] duration-150"
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <motion.button type="button" onClick={handleClose}
                    className="rounded-[18px] border border-[#EEEFE9] bg-white px-6 py-3 text-[14px] font-semibold text-[#5E5E5F]"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>Cancelar</motion.button>
                  <motion.button
                    type="submit"
                    disabled={!title.trim() || !content.trim() || loading}
                    className="flex-1 rounded-[18px] bg-[#D7FF00] py-3 text-[14px] font-semibold text-[#0E0F10] disabled:opacity-40"
                    initial="rest" animate="rest"
                    whileHover={(title.trim() && content.trim() && !loading) ? "hovered" : "rest"}
                    whileTap={{ scale: 0.96 }}
                    variants={{ rest: { scale: 1, backgroundColor: "#D7FF00" }, hovered: { scale: 1.02, backgroundColor: "#DFFF33" } }}
                  >
                    {loading ? "Salvando..." : "Adicionar item"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </HubiaPortal>
  );
}
