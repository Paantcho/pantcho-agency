"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Plus, X, ArrowRight, Search, FolderKanban,
  User, Globe, Cpu, FileText, Megaphone, Brush,
  ChevronRight, TrendingUp, Layers,
} from "lucide-react";
import { HubiaPortal } from "@/components/ui/hubia-portal";
import { toast } from "@/components/ui/hubia-toast";
import { createProjeto } from "./actions";
import type { ProjetoCard } from "./actions";
import type { ProjetoTipo, ProjetoStatus } from "@prisma/client";

// ─── Inteligência de Tipo de Projeto ─────────────────────────────────────────

type TipoConfig = {
  label: string;
  descricao: string;
  icone: React.ElementType;
  cor: string;
  squad: string;
  modulos: string[];
  documentos: string[];
  integracoes: string[];
};

const TIPO_CONFIG: Record<ProjetoTipo, TipoConfig> = {
  creator: {
    label: "Creator", descricao: "Identidade, conteúdo e consistência de creator",
    icone: User, cor: "#7C6AF7",
    squad: "Audiovisual Squad",
    modulos: ["Identidade", "Aparência", "Tom de Voz", "Ambientes", "Regras", "Conteúdo", "Assets", "Memória"],
    documentos: ["Perfil da Creator", "Diretrizes de Imagem", "Tom de Voz", "Looks", "Regras de Consistência"],
    integracoes: ["Figma", "Storage de Assets"],
  },
  landing_page: {
    label: "Landing Page", descricao: "Página de conversão com design, copy e deploy",
    icone: Globe, cor: "#0E0F10",
    squad: "Dev Squad",
    modulos: ["Briefing", "Arquitetura", "Design", "Conteúdo", "Desenvolvimento", "Deploy", "Analytics"],
    documentos: ["Briefing do Cliente", "Estrutura de Seções", "Copy Base", "Requisitos Técnicos"],
    integracoes: ["Figma", "GitHub", "Vercel", "Analytics"],
  },
  hotsite: {
    label: "Hotsite", descricao: "Site temporário de campanha ou lançamento",
    icone: Globe, cor: "#0E0F10",
    squad: "Dev Squad",
    modulos: ["Briefing", "Design", "Conteúdo", "Desenvolvimento", "Deploy"],
    documentos: ["Briefing", "Copy", "Requisitos"],
    integracoes: ["Figma", "Vercel"],
  },
  microsite: {
    label: "Microsite", descricao: "Site temático com escopo reduzido",
    icone: Globe, cor: "#0E0F10",
    squad: "Dev Squad",
    modulos: ["Briefing", "Design", "Conteúdo", "Desenvolvimento", "Deploy"],
    documentos: ["Briefing", "Arquitetura", "Copy"],
    integracoes: ["Figma", "Vercel"],
  },
  app: {
    label: "App", descricao: "Aplicativo mobile ou web progressivo",
    icone: Cpu, cor: "#1565C0",
    squad: "Dev Squad",
    modulos: ["Contexto", "PRD", "Arquitetura", "Design System", "UX Flows", "Frontend", "Backend", "Deploy", "Observabilidade"],
    documentos: ["PRD", "Arquitetura Técnica", "Requisitos Funcionais", "Stack Oficial"],
    integracoes: ["Figma", "GitHub", "Supabase", "Vercel"],
  },
  saas: {
    label: "SaaS", descricao: "Software as a Service completo e escalável",
    icone: Cpu, cor: "#1565C0",
    squad: "Dev Squad",
    modulos: ["Contexto", "PRD", "Arquitetura", "Banco de Dados", "Auth", "Frontend", "Backend", "Integrações", "Deploy", "Observabilidade", "Rules"],
    documentos: ["Visão do Produto", "PRD", "Arquitetura Técnica", "Stack", "Critérios de Aceite"],
    integracoes: ["Figma", "GitHub", "Supabase", "Vercel", "Stripe", "Analytics"],
  },
  sistema: {
    label: "Sistema Web", descricao: "Sistema interno ou plataforma web customizada",
    icone: Cpu, cor: "#1565C0",
    squad: "Dev Squad",
    modulos: ["PRD", "Arquitetura", "Banco", "Frontend", "Backend", "Deploy"],
    documentos: ["PRD", "Requisitos", "Arquitetura"],
    integracoes: ["GitHub", "Supabase", "Vercel"],
  },
  ferramenta: {
    label: "Ferramenta Interna", descricao: "Automação, script ou ferramenta de uso interno",
    icone: Cpu, cor: "#5E5E5F",
    squad: "Dev Squad",
    modulos: ["Contexto", "Requisitos", "Desenvolvimento", "Documentação"],
    documentos: ["Objetivo", "Requisitos", "Documentação Técnica"],
    integracoes: ["GitHub"],
  },
  conteudo: {
    label: "Grade de Conteúdo", descricao: "Planejamento mensal ou trimestral de conteúdo",
    icone: Megaphone, cor: "#43A047",
    squad: "Audiovisual Squad",
    modulos: ["Briefing", "Calendário", "Peças", "Copies", "Referências", "Aprovações"],
    documentos: ["Briefing", "Calendário", "Pilares de Conteúdo", "Formatos", "Tom de Voz"],
    integracoes: ["Figma", "Calendário"],
  },
  campanha: {
    label: "Campanha Criativa", descricao: "Campanha com conceito criativo e múltiplas peças",
    icone: Megaphone, cor: "#43A047",
    squad: "Audiovisual Squad",
    modulos: ["Briefing", "Conceito", "Público", "Peças", "Copies", "Aprovações"],
    documentos: ["Briefing", "Conceito Criativo", "Defesa Conceitual", "Benchmark"],
    integracoes: ["Figma", "Storage"],
  },
  branding: {
    label: "Branding", descricao: "Identidade visual e diretrizes de marca",
    icone: Brush, cor: "#FB8C00",
    squad: "Audiovisual Squad",
    modulos: ["Contexto", "Conceito", "Referências", "Exploração Visual", "Assets", "Apresentações"],
    documentos: ["Brand Core", "Diretrizes Visuais", "Moodboard", "Rationale Criativo"],
    integracoes: ["Figma", "Storage"],
  },
  mockup: {
    label: "Mockup / Exploração", descricao: "Exploração visual ou prototipação de produto",
    icone: Brush, cor: "#FB8C00",
    squad: "Audiovisual Squad",
    modulos: ["Contexto", "Referências", "Exploração", "Assets", "Apresentações"],
    documentos: ["Objetivos Visuais", "Moodboard", "Mockups"],
    integracoes: ["Figma", "Storage"],
  },
  documentacao: {
    label: "Documentação", descricao: "Criação ou estruturação de documentação estratégica",
    icone: FileText, cor: "#5E5E5F",
    squad: "Dev Squad",
    modulos: ["Contexto", "Estrutura", "Documentos", "Versionamento"],
    documentos: ["Sumário", "Estrutura", "Specs"],
    integracoes: [],
  },
  operacao: {
    label: "Operação Multi-Equipe", descricao: "Iniciativa que envolve múltiplos squads simultaneamente",
    icone: Layers, cor: "#7C6AF7",
    squad: "Multi-Squad",
    modulos: ["Contexto", "Estrutura", "Tarefas", "Times", "Aprovações", "Memória", "Log"],
    documentos: ["Briefing Geral", "Responsabilidades", "Milestones"],
    integracoes: [],
  },
  outro: {
    label: "Outro", descricao: "Projeto com natureza ainda a definir",
    icone: FolderKanban, cor: "#A9AAA5",
    squad: "A definir",
    modulos: ["Visão Geral", "Tarefas", "Memória", "Log"],
    documentos: ["Briefing Inicial"],
    integracoes: [],
  },
};

const TIPO_GROUPS: { label: string; tipos: ProjetoTipo[] }[] = [
  { label: "Creators & Conteúdo", tipos: ["creator", "conteudo", "campanha"] },
  { label: "Web & Dev", tipos: ["landing_page", "hotsite", "microsite", "app", "saas", "sistema", "ferramenta"] },
  { label: "Criação & Visual", tipos: ["branding", "mockup"] },
  { label: "Outros", tipos: ["documentacao", "operacao", "outro"] },
];

const STATUS_PALETTE: Record<ProjetoStatus, { bg: string; text: string; dot: string; label: string }> = {
  ativo:     { bg: "#F0FF80", text: "#5A6600", dot: "#A8C800", label: "Ativo" },
  pausado:   { bg: "#FFF0E0", text: "#A05500", dot: "#FB8C00", label: "Pausado" },
  concluido: { bg: "#E6F4EA", text: "#2E7D32", dot: "#43A047", label: "Concluído" },
  cancelado: { bg: "#FDECEA", text: "#C62828", dot: "#E53935", label: "Cancelado" },
};

const FILTROS_TIPO: { label: string; value: string }[] = [
  { label: "Todos", value: "todos" },
  { label: "Creator", value: "creator" },
  { label: "Dev", value: "dev" },
  { label: "Conteúdo", value: "conteudo" },
  { label: "Visual", value: "visual" },
];

function tipoParaGrupo(tipo: ProjetoTipo): string {
  if (tipo === "creator" || tipo === "conteudo" || tipo === "campanha") return "conteudo";
  if (["landing_page","hotsite","microsite","app","saas","sistema","ferramenta"].includes(tipo)) return "dev";
  if (tipo === "branding" || tipo === "mockup") return "visual";
  return "outro";
}

const DRAFT_KEY = "hubia:novo-projeto:rascunho";

// ─── ProjetosClient ───────────────────────────────────────────────────────────

export default function ProjetosClient({
  organizationId,
  initialProjetos,
}: {
  organizationId: string;
  initialProjetos: ProjetoCard[];
}) {
  const router = useRouter();
  const [projetos, setProjetos] = useState(initialProjetos);
  const [modalOpen, setModalOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("todos");

  // Pill dos filtros
  const filtroRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const filtroContainerRef = useRef<HTMLDivElement>(null);
  const [pillLeft, setPillLeft] = useState(0);
  const [pillWidth, setPillWidth] = useState(0);

  useEffect(() => {
    const idx = FILTROS_TIPO.findIndex((f) => f.value === filtroAtivo);
    const el = filtroRefs.current[idx];
    const container = filtroContainerRef.current;
    if (!el || !container) return;
    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    setPillLeft(eRect.left - cRect.left);
    setPillWidth(eRect.width);
  }, [filtroAtivo]);

  const projetosFiltrados = projetos.filter((p) => {
    const matchBusca = !busca.trim() || p.nome.toLowerCase().includes(busca.toLowerCase());
    const grupo = tipoParaGrupo(p.tipo);
    const matchFiltro = filtroAtivo === "todos" || grupo === filtroAtivo;
    return matchBusca && matchFiltro;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Linha 1: título + botão — soltos sobre #EEEFE9 */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-bold text-[#0E0F10]">Projetos</h1>
          <p className="text-[13px] text-[#A9AAA5] mt-0.5">
            {projetos.length} projeto{projetos.length !== 1 ? "s" : ""} · estruturas vivas por tipo
          </p>
        </div>
        <motion.button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-[18px] px-4 py-3 text-[15px] font-semibold text-[#0E0F10]"
          initial="rest" animate="rest" whileHover="hovered" whileTap={{ scale: 0.96 }}
          variants={{ rest: { scale: 1, backgroundColor: "#D7FF00" }, hovered: { scale: 1.03, backgroundColor: "#DFFF33" } }}
          transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <motion.span variants={{ rest: { scale: 1 }, hovered: { scale: 1.2 } }} transition={{ duration: 0.25 }}>
            <Plus size={16} />
          </motion.span>
          Novo Projeto
        </motion.button>
      </div>

      {/* Linha 2: tab-navbar + busca — soltos sobre #EEEFE9 */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Filtros por grupo com pill spring */}
        <div
          ref={filtroContainerRef}
          className="relative flex items-center gap-0.5 rounded-[14px] bg-white p-1"
        >
          <motion.div
            className="pointer-events-none absolute rounded-[10px] bg-[#0E0F10]"
            animate={{ left: pillLeft, width: pillWidth }}
            transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.8 }}
            style={{ top: 4, bottom: 4 }}
          />
          {FILTROS_TIPO.map((f, i) => (
            <motion.button
              key={f.value}
              ref={(el) => { filtroRefs.current[i] = el; }}
              onClick={() => setFiltroAtivo(f.value)}
              className="relative z-10 rounded-[10px] px-3.5 py-1.5 text-[12px] font-semibold transition-colors duration-150"
              animate={{ color: filtroAtivo === f.value ? "#D7FF00" : "#A9AAA5" }}
              initial={false}
              whileTap={{ scale: 0.97 }}
            >
              {f.label}
            </motion.button>
          ))}
        </div>

        {/* Busca */}
        <div className="relative flex items-center">
          <Search size={13} className="absolute left-3 text-[#A9AAA5] pointer-events-none" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar projeto..."
            className="h-9 rounded-[12px] bg-white pl-8 pr-3.5 text-[13px] text-[#0E0F10] outline-none placeholder:text-[#A9AAA5] border border-transparent focus:border-[#0E0F10] focus:shadow-[0_0_0_3px_rgba(14,15,16,0.08)] transition-[border-color,box-shadow] duration-150 w-[200px]"
          />
        </div>
      </div>

      {/* White box: grid de projetos */}
      <div className="rounded-[20px] bg-white p-5 min-h-[300px]">
        <AnimatePresence mode="wait">
          {projetosFiltrados.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 gap-3"
            >
              <FolderKanban size={32} color="#D5D2C9" />
              <p className="text-[13px] text-[#A9AAA5]">
                {busca || filtroAtivo !== "todos" ? "Nenhum projeto encontrado com este filtro." : "Nenhum projeto ainda."}
              </p>
              {!busca && filtroAtivo === "todos" && (
                <motion.button
                  onClick={() => setModalOpen(true)}
                  className="mt-1 rounded-[14px] border-2 border-dashed border-[#D5D2C9] px-5 py-2.5 text-[13px] font-semibold text-[#A9AAA5]"
                  whileHover={{ borderColor: "#A9AAA5", color: "#0E0F10", backgroundColor: "rgba(213,210,201,0.08)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  + Criar primeiro projeto
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {projetosFiltrados.map((p, i) => (
                <ProjetoCardItem
                  key={p.id}
                  projeto={p}
                  index={i}
                  onClick={() => router.push(`/projetos/${p.id}`)}
                />
              ))}
              {/* Card fantasma: novo projeto */}
              <motion.button
                onClick={() => setModalOpen(true)}
                className="rounded-[20px] border-2 border-dashed border-[#D5D2C9] p-6 flex flex-col items-center justify-center gap-2 min-h-[180px]"
                whileHover={{ borderColor: "#A9AAA5", backgroundColor: "rgba(213,210,201,0.08)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, transition: { delay: Math.min(projetosFiltrados.length * 0.06, 0.3) } }}
              >
                <Plus size={20} color="#A9AAA5" />
                <span className="text-[13px] font-semibold text-[#A9AAA5]">Novo Projeto</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal */}
      <NovoProjetoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        organizationId={organizationId}
        onCreated={(id) => {
          setModalOpen(false);
          router.push(`/projetos/${id}`);
        }}
      />
    </div>
  );
}

// ─── Card de projeto ──────────────────────────────────────────────────────────

function ProjetoCardItem({ projeto: p, index: i, onClick }: {
  projeto: ProjetoCard;
  index: number;
  onClick: () => void;
}) {
  const meta = p.metadata ?? {};
  const progresso = typeof meta.progresso === "number" ? meta.progresso : null;
  const objetivo = (meta.objetivo as string) ?? p.descricao ?? null;
  const tipoConfig = TIPO_CONFIG[p.tipo] ?? TIPO_CONFIG.outro;
  const statusPalette = STATUS_PALETTE[p.status];
  const TipoIcon = tipoConfig.icone;

  return (
    <motion.div
      className="cursor-pointer rounded-[20px] bg-[#F7F7F5] p-5 flex flex-col gap-3.5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: Math.min(i * 0.06, 0.3) }}
      whileHover={{ y: -4, backgroundColor: "#F3F3F0" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Linha 1: ícone de tipo + status */}
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-1.5 rounded-[8px] px-2 py-1"
          style={{ backgroundColor: `${tipoConfig.cor}12` }}
        >
          <TipoIcon size={12} style={{ color: tipoConfig.cor }} />
          <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: tipoConfig.cor }}>
            {tipoConfig.label}
          </span>
        </div>
        <span
          className="inline-flex items-center gap-1 rounded-[6px] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
          style={{ backgroundColor: statusPalette.bg, color: statusPalette.text }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusPalette.dot }} />
          {statusPalette.label}
        </span>
      </div>

      {/* Nome + objetivo */}
      <div>
        <h3 className="text-[17px] font-bold text-[#0E0F10] leading-snug">{p.nome}</h3>
        {objetivo && (
          <p className="text-[12px] text-[#A9AAA5] mt-1 line-clamp-2 leading-relaxed">{objetivo}</p>
        )}
      </div>

      {/* Módulos preview (badge discretos) */}
      <div className="flex flex-wrap gap-1">
        {tipoConfig.modulos.slice(0, 4).map((m) => (
          <span key={m} className="rounded-[5px] bg-white px-1.5 py-0.5 text-[9px] font-semibold text-[#A9AAA5]">
            {m}
          </span>
        ))}
        {tipoConfig.modulos.length > 4 && (
          <span className="rounded-[5px] bg-white px-1.5 py-0.5 text-[9px] font-semibold text-[#D5D2C9]">
            +{tipoConfig.modulos.length - 4}
          </span>
        )}
      </div>

      {/* Barra de progresso */}
      {progresso !== null && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[#A9AAA5]">Progresso</span>
            <span className="text-[11px] font-bold text-[#0E0F10]">{progresso}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[#A8C800]"
              initial={{ width: 0 }}
              animate={{ width: `${progresso}%` }}
              transition={{ duration: 0.8, ease: [0, 0, 0.2, 1], delay: i * 0.06 }}
            />
          </div>
        </div>
      )}

      {/* Rodapé */}
      <div className="flex items-center justify-between pt-2.5 border-t border-white mt-auto">
        <span className="text-[11px] font-semibold text-[#5E5E5F]">
          {p.pedidosCount} pedido{p.pedidosCount !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-1 text-[#A9AAA5]">
          <span className="text-[10px]">{tipoConfig.squad}</span>
          <ChevronRight size={11} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Modal de criação inteligente ─────────────────────────────────────────────

function NovoProjetoModal({ open, onClose, organizationId, onCreated }: {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  onCreated: (id: string) => void;
}) {
  const [step, setStep] = useState<"tipo" | "detalhe">("tipo");
  const [tipoSelecionado, setTipoSelecionado] = useState<ProjetoTipo | null>(null);
  const [nome, setNome] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [prazo, setPrazo] = useState("");
  const [loading, setLoading] = useState(false);

  // Restaurar rascunho
  useEffect(() => {
    if (typeof window === "undefined" || !open) return;
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "{}");
      if (saved.nome) setNome(saved.nome);
      if (saved.objetivo) setObjetivo(saved.objetivo);
      if (saved.tipo) setTipoSelecionado(saved.tipo as ProjetoTipo);
      if (saved.prazo) setPrazo(saved.prazo);
    } catch {}
  }, [open]);

  const handleClose = () => {
    if (nome.trim() && typeof window !== "undefined") {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ nome, objetivo, tipo: tipoSelecionado, prazo }));
    }
    onClose();
    // Reset state após fechar
    setTimeout(() => { setStep("tipo"); setTipoSelecionado(null); setNome(""); setObjetivo(""); setPrazo(""); }, 350);
  };

  const handleSelecionarTipo = (tipo: ProjetoTipo) => {
    setTipoSelecionado(tipo);
    setStep("detalhe");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !tipoSelecionado) return;
    setLoading(true);

    const config = TIPO_CONFIG[tipoSelecionado];
    const result = await createProjeto(organizationId, {
      nome,
      tipo: tipoSelecionado,
      descricao: objetivo || undefined,
      metadata: {
        squad: config.squad,
        objetivo: objetivo || null,
        prazo: prazo || null,
        progresso: 0,
        modulos_ativos: config.modulos,
        integracoes: config.integracoes,
        memoria: [],
        rules: [],
        log: [],
        decisoes: [],
        tarefas: [],
      },
    });

    setLoading(false);
    if (!result.ok) { toast.error(result.error); return; }
    if (typeof window !== "undefined") localStorage.removeItem(DRAFT_KEY);
    toast.success("Projeto criado com estrutura adaptada ao tipo.");
    onCreated(result.id);
  };

  const tipoConfig = tipoSelecionado ? TIPO_CONFIG[tipoSelecionado] : null;

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
              className="w-full max-w-[600px] rounded-[20px] bg-white overflow-hidden"
              initial={{ scale: 0.88, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 10, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header do modal */}
              <div className="flex items-center justify-between px-7 pt-7 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {step === "detalhe" && (
                      <motion.button
                        onClick={() => setStep("tipo")}
                        className="text-[11px] font-semibold text-[#A9AAA5] flex items-center gap-1"
                        whileHover={{ color: "#0E0F10" }} whileTap={{ scale: 0.97 }}
                      >
                        ← Tipos
                      </motion.button>
                    )}
                    {step === "detalhe" && <span className="text-[#D4D5D6] text-[11px]">/</span>}
                    <span className="text-[11px] font-semibold text-[#A9AAA5]">
                      {step === "tipo" ? "1. Escolha o tipo" : "2. Configure o projeto"}
                    </span>
                  </div>
                  <h2 className="text-[22px] font-bold text-[#0E0F10]">Novo Projeto</h2>
                </div>
                <motion.button
                  onClick={handleClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEEFE9] flex-shrink-0"
                  whileHover={{ rotate: 90, scale: 1.1, backgroundColor: "#0E0F10" }}
                  whileTap={{ rotate: 90, scale: 0.9 }}
                  transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <X size={14} color="#0E0F10" />
                </motion.button>
              </div>

              {/* Corpo animado por step */}
              <AnimatePresence mode="wait">
                {step === "tipo" && (
                  <motion.div
                    key="tipo"
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
                    className="px-7 pb-7 max-h-[480px] overflow-y-auto flex flex-col gap-5"
                  >
                    {TIPO_GROUPS.map((group) => (
                      <div key={group.label}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#A9AAA5] mb-2.5">{group.label}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {group.tipos.map((tipo) => {
                            const cfg = TIPO_CONFIG[tipo];
                            const Icon = cfg.icone;
                            return (
                              <motion.button
                                key={tipo}
                                onClick={() => handleSelecionarTipo(tipo)}
                                className="text-left rounded-[14px] p-3.5 flex items-start gap-3 border-2 border-transparent"
                                style={{ backgroundColor: `${cfg.cor}08` }}
                                whileHover={{ backgroundColor: `${cfg.cor}14`, borderColor: `${cfg.cor}30`, scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                              >
                                <div
                                  className="flex-shrink-0 h-8 w-8 rounded-[10px] flex items-center justify-center mt-0.5"
                                  style={{ backgroundColor: `${cfg.cor}20`, color: cfg.cor }}
                                >
                                  <Icon size={15} />
                                </div>
                                <div>
                                  <p className="text-[13px] font-bold text-[#0E0F10]">{cfg.label}</p>
                                  <p className="text-[11px] text-[#A9AAA5] leading-snug mt-0.5">{cfg.descricao}</p>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {step === "detalhe" && tipoConfig && tipoSelecionado && (
                  <motion.div
                    key="detalhe"
                    initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
                    className="px-7 pb-7"
                  >
                    {/* Preview do tipo selecionado */}
                    <div
                      className="rounded-[14px] p-4 mb-5 flex items-start gap-3"
                      style={{ backgroundColor: `${tipoConfig.cor}10` }}
                    >
                      <div
                        className="flex-shrink-0 h-9 w-9 rounded-[10px] flex items-center justify-center"
                        style={{ backgroundColor: `${tipoConfig.cor}25`, color: tipoConfig.cor }}
                      >
                        <tipoConfig.icone size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-[#0E0F10]">{tipoConfig.label}</p>
                        <p className="text-[11px] text-[#5E5E5F] mt-0.5">{tipoConfig.descricao}</p>
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {tipoConfig.modulos.map((m) => (
                            <span key={m} className="rounded-[5px] bg-white px-1.5 py-0.5 text-[9px] font-semibold" style={{ color: tipoConfig.cor }}>
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Nome do Projeto *</label>
                        <input
                          autoFocus value={nome} onChange={(e) => setNome(e.target.value)}
                          placeholder={`Ex: ${tipoConfig.label} — Cliente 2026`}
                          className="h-11 w-full rounded-[10px] border border-transparent bg-[#EEEFE9] px-3.5 text-[14px] text-[#0E0F10] outline-none placeholder:text-[#A9AAA5] hover:border-[#D4D5D6] focus:border-[#0E0F10] focus:shadow-[0_0_0_3px_rgba(14,15,16,0.08)] transition-[border-color,box-shadow] duration-150"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Objetivo Principal</label>
                        <textarea
                          value={objetivo} onChange={(e) => setObjetivo(e.target.value)}
                          placeholder="O que esse projeto precisa entregar?"
                          rows={3}
                          className="w-full rounded-[10px] border border-transparent bg-[#EEEFE9] px-3.5 py-2.5 text-[14px] text-[#0E0F10] outline-none placeholder:text-[#A9AAA5] resize-none hover:border-[#D4D5D6] focus:border-[#0E0F10] focus:shadow-[0_0_0_3px_rgba(14,15,16,0.08)] transition-[border-color,box-shadow] duration-150"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Prazo estimado (opcional)</label>
                        <input
                          value={prazo} onChange={(e) => setPrazo(e.target.value)}
                          placeholder="Ex: Março 2026, Q2 2026..."
                          className="h-11 w-full rounded-[10px] border border-transparent bg-[#EEEFE9] px-3.5 text-[14px] text-[#0E0F10] outline-none placeholder:text-[#A9AAA5] hover:border-[#D4D5D6] focus:border-[#0E0F10] focus:shadow-[0_0_0_3px_rgba(14,15,16,0.08)] transition-[border-color,box-shadow] duration-150"
                        />
                      </div>

                      {/* Squad automático */}
                      <div className="flex items-center justify-between rounded-[10px] bg-[#EEEFE9] px-3.5 h-10">
                        <span className="text-[11px] text-[#A9AAA5]">Squad responsável</span>
                        <span className="text-[12px] font-bold text-[#0E0F10]">{tipoConfig.squad}</span>
                      </div>

                      <div className="flex gap-3 mt-1">
                        <motion.button type="button" onClick={handleClose}
                          className="rounded-[18px] border border-[#EEEFE9] bg-white px-5 py-3 text-[14px] font-semibold text-[#5E5E5F]"
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                          Cancelar
                        </motion.button>
                        <motion.button type="submit" disabled={!nome.trim() || loading}
                          className="flex-1 flex items-center justify-center gap-2 rounded-[18px] bg-[#D7FF00] py-3 text-[14px] font-semibold text-[#0E0F10] disabled:opacity-40"
                          initial="rest" animate="rest"
                          whileHover={nome.trim() && !loading ? "hovered" : "rest"}
                          whileTap={{ scale: 0.96 }}
                          variants={{ rest: { scale: 1, backgroundColor: "#D7FF00" }, hovered: { scale: 1.02, backgroundColor: "#DFFF33" } }}>
                          <motion.span variants={{ rest: { x: 0 }, hovered: { x: 2 } }}>
                            <ArrowRight size={14} />
                          </motion.span>
                          {loading ? "Criando..." : "Criar Projeto"}
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </HubiaPortal>
  );
}

// ─── Exportar TipoConfig para uso no detalhe ─────────────────────────────────
export { TIPO_CONFIG };
export type { TipoConfig };
