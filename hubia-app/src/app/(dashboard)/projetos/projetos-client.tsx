"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Plus, X, ArrowRight, Search, FolderKanban,
  User, Globe, Cpu, FileText, Megaphone,
  Layers, Zap, CalendarDays, Tag,
  Activity, AlertTriangle, Clock, Eye, Wrench,
  CheckSquare, ClipboardList, Link2,
  ListFilter, Pause, ShieldAlert, BookOpen, Timer,
} from "lucide-react";
import { HubiaPortal } from "@/components/ui/hubia-portal";
import { SlidingTabs } from "@/components/ui/sliding-tabs";
import { toast } from "@/components/ui/hubia-toast";
import { createProjeto } from "./actions";
import type { ProjetoCard } from "./actions";
import type { ProjetoTipo, ProjetoStatus } from "@prisma/client";

// ─── Inteligência de Tipo de Projeto ─────────────────────────────────────────

type TipoConfig = {
  label: string;
  descricao: string;
  icone: React.ElementType;
  cor: string;        // cor da barra de progresso e acentos
  pillBg: string;     // fundo da tag pill
  pillText: string;   // texto da tag pill
  squad: string;
  modulosBase: string[];
  conectoresBase: string[];
};

// Paleta de cores por tipo — extraída e derivada do Design System Hubia
// Regra: tons dentro da mesma família de saturação, legíveis, flat
const TIPO_CONFIG: Record<ProjetoTipo, TipoConfig> = {
  // ── Creators & Conteúdo ─────────────────────────────────────────────────
  creator: {
    label: "Creator",
    descricao: "Identidade, conteúdo e consistência de creator",
    icone: User,
    cor: "#7C6AF7",         // índigo suave
    pillBg: "#EEEAFF",      // índigo 8%
    pillText: "#4B3FC7",    // índigo escuro legível
    squad: "Audiovisual Squad",
    modulosBase: ["Identidade", "Aparência", "Tom de Voz", "Rules", "Operação"],
    conectoresBase: ["Figma", "Storage"],
  },
  conteudo: {
    label: "Grade de Conteúdo",
    descricao: "Planejamento mensal ou trimestral de conteúdo",
    icone: CalendarDays,
    cor: "#00897B",         // verde-azulado (teal)
    pillBg: "#E0F5F3",      // teal 10%
    pillText: "#00695C",    // teal escuro
    squad: "Audiovisual Squad",
    modulosBase: ["Estratégia", "Calendário", "Peças", "Aprovações"],
    conectoresBase: ["Figma"],
  },
  campanha: {
    label: "Campanha",
    descricao: "Campanha com conceito criativo e múltiplas peças",
    icone: Megaphone,
    cor: "#E91E8C",         // rosa quente
    pillBg: "#FCE4F3",      // rosa 10%
    pillText: "#AD1570",    // rosa escuro
    squad: "Audiovisual Squad",
    modulosBase: ["Conceito", "Público", "Peças", "Aprovações"],
    conectoresBase: ["Figma", "Storage"],
  },
  // ── Web & Dev ────────────────────────────────────────────────────────────
  landing_page: {
    label: "Landing Page",
    descricao: "Página de conversão com design, copy e deploy",
    icone: Globe,
    cor: "#0288D1",         // azul digital
    pillBg: "#E1F4FE",      // azul 10%
    pillText: "#01579B",    // azul escuro
    squad: "Dev Squad",
    modulosBase: ["PRD", "Design", "Dev", "Deploy", "Analytics"],
    conectoresBase: ["Figma", "GitHub", "Vercel"],
  },
  hotsite: {
    label: "Hotsite",
    descricao: "Site temporário de campanha ou lançamento",
    icone: Globe,
    cor: "#0288D1",
    pillBg: "#E1F4FE",
    pillText: "#01579B",
    squad: "Dev Squad",
    modulosBase: ["Design", "Dev", "Deploy"],
    conectoresBase: ["Figma", "Vercel"],
  },
  microsite: {
    label: "Microsite",
    descricao: "Site temático com escopo reduzido",
    icone: Globe,
    cor: "#0288D1",
    pillBg: "#E1F4FE",
    pillText: "#01579B",
    squad: "Dev Squad",
    modulosBase: ["Arquitetura", "Dev", "Deploy"],
    conectoresBase: ["Figma", "Vercel"],
  },
  app: {
    label: "App",
    descricao: "Aplicativo mobile ou web progressivo",
    icone: Cpu,
    cor: "#1565C0",         // azul profundo
    pillBg: "#E3EEFF",      // azul profundo 10%
    pillText: "#0D47A1",    // azul navy
    squad: "Dev Squad",
    modulosBase: ["PRD", "Arquitetura", "Design", "Frontend", "Backend", "Deploy"],
    conectoresBase: ["Figma", "GitHub", "Supabase", "Vercel"],
  },
  saas: {
    label: "SaaS",
    descricao: "Software as a Service completo e escalável",
    icone: Zap,
    cor: "#1565C0",
    pillBg: "#E3EEFF",
    pillText: "#0D47A1",
    squad: "Dev Squad",
    modulosBase: ["PRD", "Arquitetura", "Banco", "Frontend", "Backend", "Deploy"],
    conectoresBase: ["Figma", "GitHub", "Supabase", "Vercel", "Stripe"],
  },
  sistema: {
    label: "Sistema Web",
    descricao: "Sistema interno ou plataforma web customizada",
    icone: Cpu,
    cor: "#1565C0",
    pillBg: "#E3EEFF",
    pillText: "#0D47A1",
    squad: "Dev Squad",
    modulosBase: ["PRD", "Arquitetura", "Frontend", "Backend", "Deploy"],
    conectoresBase: ["GitHub", "Supabase", "Vercel"],
  },
  ferramenta: {
    label: "Ferramenta",
    descricao: "Automação, script ou ferramenta de uso interno",
    icone: Wrench,
    cor: "#37474F",         // cinza-ardósia escuro
    pillBg: "#ECEFF1",      // cinza-ardósia 10%
    pillText: "#263238",    // cinza-ardósia profundo
    squad: "Dev Squad",
    modulosBase: ["Contexto", "Requisitos", "Dev"],
    conectoresBase: ["GitHub"],
  },
  // ── Criação & Visual ─────────────────────────────────────────────────────
  branding: {
    label: "Branding",
    descricao: "Identidade visual e diretrizes de marca",
    icone: Tag,
    cor: "#FF6D00",         // laranja vibrante
    pillBg: "#FFF0E2",      // laranja 10%
    pillText: "#BF360C",    // laranja escuro
    squad: "Audiovisual Squad",
    modulosBase: ["Diagnóstico", "Estratégia", "Moodboard", "Marca", "Sistema Visual"],
    conectoresBase: ["Figma", "Storage"],
  },
  mockup: {
    label: "Visual / Assets",
    descricao: "Exploração visual ou prototipação de produto",
    icone: Eye,
    cor: "#8D6E63",         // marrom suave
    pillBg: "#F3ECE9",      // marrom 8%
    pillText: "#5D4037",    // marrom escuro
    squad: "Audiovisual Squad",
    modulosBase: ["Contexto", "Exploração", "Assets"],
    conectoresBase: ["Figma", "Storage"],
  },
  // ── Operação & Outros ────────────────────────────────────────────────────
  documentacao: {
    label: "Documentação",
    descricao: "Criação ou estruturação de documentação estratégica",
    icone: FileText,
    cor: "#546E7A",         // azul-cinza
    pillBg: "#EEF2F4",      // azul-cinza 8%
    pillText: "#37474F",    // azul-cinza escuro
    squad: "Dev Squad",
    modulosBase: ["Contexto", "Estrutura", "Documentos"],
    conectoresBase: [],
  },
  operacao: {
    label: "Multi-Squad",
    descricao: "Iniciativa que envolve múltiplos squads simultaneamente",
    icone: Layers,
    cor: "#7C6AF7",         // índigo (mesma família creator mas diferente)
    pillBg: "#EEEAFF",
    pillText: "#4B3FC7",
    squad: "Multi-Squad",
    modulosBase: ["Contexto", "Times", "Tarefas", "Memória"],
    conectoresBase: [],
  },
  outro: {
    label: "Outro",
    descricao: "Projeto com natureza ainda a definir",
    icone: FolderKanban,
    cor: "var(--hubia-bg-base-700)",         // base-700 — neutro da paleta
    pillBg: "var(--hubia-bg-base-500)",      // bg-base-500 — fundo da app
    pillText: "var(--hubia-ink-400)",    // ink-300
    squad: "A definir",
    modulosBase: ["Visão Geral", "Tarefas"],
    conectoresBase: [],
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

// ─── Views rápidas ────────────────────────────────────────────────────────────

type ViewRapida = "todos" | "ativos" | "pausados" | "em_risco" | "sem_prd" | "sem_rules" | "com_prazo";

const VIEWS_RAPIDAS: { id: ViewRapida; label: string; icon: React.ElementType }[] = [
  { id: "todos",     label: "Todos",      icon: ListFilter },
  { id: "ativos",    label: "Ativos",     icon: Activity },
  { id: "pausados",  label: "Pausados",   icon: Pause },
  { id: "em_risco",  label: "Em risco",   icon: ShieldAlert },
  { id: "sem_prd",   label: "Sem PRD",    icon: BookOpen },
  { id: "sem_rules", label: "Sem rules",  icon: AlertTriangle },
  { id: "com_prazo", label: "Com prazo",  icon: Timer },
];

function aplicarView(projetos: ProjetoCard[], view: ViewRapida): ProjetoCard[] {
  switch (view) {
    case "ativos":    return projetos.filter(p => p.status === "ativo");
    case "pausados":  return projetos.filter(p => p.status === "pausado");
    case "em_risco":  return projetos.filter(p => {
      const h = p.metadata?.health as string | undefined;
      return h === "risco" || h === "critico";
    });
    case "sem_prd":   return projetos.filter(p => {
      const tipo = p.tipo as ProjetoTipo;
      const precisaPrd = ["app","saas","sistema","landing_page","hotsite","microsite","ferramenta"].includes(tipo);
      return precisaPrd && !p.metadata?.prd;
    });
    case "sem_rules": return projetos.filter(p => {
      const rules = p.metadata?.rules;
      return !Array.isArray(rules) || (rules as unknown[]).length === 0;
    });
    case "com_prazo": return projetos.filter(p => !!p.metadata?.prazo);
    default:          return projetos;
  }
}

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
  const [viewAtiva, setViewAtiva] = useState<ViewRapida>("todos");

  const projetosFiltrados = (() => {
    let lista = projetos;
    lista = aplicarView(lista, viewAtiva);
    if (busca.trim()) {
      lista = lista.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()));
    }
    return lista;
  })();

  return (
    <div className="flex flex-col gap-4">
      {/* Linha 1: título + botão */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-bold text-ink-500">Projetos</h1>
          <p className="text-[13px] text-base-700 mt-0.5">
            {projetos.length} projeto{projetos.length !== 1 ? "s" : ""} · workspaces vivos por tipo
          </p>
        </div>
        <motion.button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-[18px] px-4 py-3 text-[15px] font-semibold text-ink-500"
          initial="rest" animate="rest" whileHover="hovered" whileTap={{ scale: 0.96 }}
          variants={{ rest: { scale: 1, backgroundColor: "var(--hubia-limao-500)" }, hovered: { scale: 1.03, backgroundColor: "#DFFF33" } }}
          transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <motion.span variants={{ rest: { scale: 1 }, hovered: { scale: 1.2 } }} transition={{ duration: 0.25 }}>
            <Plus size={16} />
          </motion.span>
          Novo Projeto
        </motion.button>
      </div>

      {/* Linha 2: views rápidas + busca */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Views rápidas — SlidingTabs padrão do sistema */}
        <div className="overflow-x-auto">
          <SlidingTabs
            tabs={VIEWS_RAPIDAS.map(v => ({ id: v.id, label: v.label, icon: v.icon }))}
            activeId={viewAtiva}
            onChange={(id) => setViewAtiva(id as ViewRapida)}
          />
        </div>

        {/* Busca */}
        <div className="relative flex items-center">
          <Search size={13} className="absolute left-3 text-base-700 pointer-events-none" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar projeto..."
            className="h-9 rounded-[12px] bg-white pl-8 pr-3.5 text-[13px] text-ink-500 outline-none placeholder:text-base-700 border border-transparent focus:border-ink-500 focus:ring-2 focus:ring-ink-500/10 transition-[border-color] duration-150 w-[200px]"
          />
        </div>
      </div>

      {/* Grid de projetos — sem white box, cards flutuam sobre o fundo base */}
      <AnimatePresence mode="wait">
        {projetosFiltrados.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-3"
          >
            <FolderKanban size={32} color="var(--hubia-sand-600)" />
            <p className="text-[13px] text-base-700">
              {busca || viewAtiva !== "todos" ? "Nenhum projeto nesta view." : "Nenhum projeto ainda."}
            </p>
            {!busca && viewAtiva === "todos" && (
              <motion.button
                onClick={() => setModalOpen(true)}
                className="mt-1 rounded-[14px] border-2 border-dashed border-sand-600 px-5 py-2.5 text-[13px] font-semibold text-base-700"
                whileHover={{ borderColor: "#A9AAA5", color: "#0E0F10", backgroundColor: "rgba(213,210,201,0.08)" }}
                whileTap={{ scale: 0.98 }}
              >
                + Criar primeiro projeto
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={`grid-${viewAtiva}`}
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
            {/* Card fantasma */}
            <motion.button
              onClick={() => setModalOpen(true)}
              className="rounded-[30px] border-2 border-dashed border-sand-600 p-6 flex flex-col items-center justify-center gap-2 min-h-[220px]"
              whileHover={{ borderColor: "#A9AAA5", backgroundColor: "rgba(213,210,201,0.08)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, transition: { delay: Math.min(projetosFiltrados.length * 0.06, 0.3) } }}
            >
              <Plus size={20} color="var(--hubia-bg-base-700)" />
              <span className="text-[13px] font-semibold text-base-700">Novo Projeto</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

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

// ─── Card de projeto inteligente ──────────────────────────────────────────────

function ProjetoCardItem({ projeto: p, index: i, onClick }: {
  projeto: ProjetoCard;
  index: number;
  onClick: () => void;
}) {
  const meta = p.metadata ?? {};
  const progresso = typeof meta.progresso === "number" ? meta.progresso : null;
  const tipoConfig = TIPO_CONFIG[p.tipo] ?? TIPO_CONFIG.outro;
  const TipoIcon = tipoConfig.icone;
  const statusPalette = STATUS_PALETTE[p.status];

  // Inteligência operacional
  const tarefas = Array.isArray(meta.tarefas) ? meta.tarefas as { concluido: boolean }[] : [];
  const tarefasAbertas = tarefas.filter(t => !t.concluido).length;
  const rules = Array.isArray(meta.rules) ? meta.rules as { bloqueante?: boolean }[] : [];
  const rulesBlockers = rules.filter(r => r.bloqueante).length;
  const subprojetos = Array.isArray(meta.subprojetos) ? meta.subprojetos as { nome: string; status: string }[] : [];
  const health = meta.health as string | undefined;

  // Cores de progresso — paleta Hubia correta
  const corBarra = progresso !== null
    ? progresso >= 75 ? "#D7FF00"   // limão-500 — acima de 75%
    : progresso >= 40 ? "#A8C800"   // limão-600 — entre 40-74%
    : "#FB8C00"                      // laranja — abaixo de 40%
    : tipoConfig.cor;

  const corBarraTexto = progresso !== null
    ? progresso >= 75 ? "#5A6600"
    : progresso >= 40 ? "#4A5C00"
    : "#A05500"
    : "#5E5E5F";

  return (
    <motion.div
      className="cursor-pointer rounded-[30px] bg-white p-5 flex flex-col"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: Math.min(i * 0.06, 0.3) }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      style={{ minHeight: 220 }}
    >
      {/* Linha 1: tag de tipo — pill 100% arredondada + status */}
      <div className="flex items-center justify-between mb-4">
        {/* Tag de tipo — pill definitiva com cor por tipo */}
        <div
          className="flex items-center gap-1.5 rounded-full px-3 py-1"
          style={{ backgroundColor: tipoConfig.pillBg }}
        >
          <TipoIcon size={12} style={{ color: tipoConfig.pillText }} />
          <span className="text-[11px] font-bold" style={{ color: tipoConfig.pillText }}>
            {tipoConfig.label}
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-1.5">
          {(health === "risco" || health === "critico") && (
            <span className="text-[9px] font-bold text-[#C62828] bg-[#FDECEA] px-1.5 py-0.5 rounded-[5px]">
              EM RISCO
            </span>
          )}
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusPalette.dot }} />
            <span className="text-[11px] font-semibold" style={{ color: statusPalette.text }}>
              {statusPalette.label}
            </span>
          </div>
        </div>
      </div>

      {/* Título — grande e dominante */}
      <h3 className="text-[22px] font-bold text-ink-500 leading-tight tracking-tight mb-1.5">
        {p.nome}
      </h3>

      {/* Descrição / objetivo */}
      {!!meta.objetivo ? (
        <p className="text-[12px] text-base-700 leading-relaxed line-clamp-2 mb-4">
          {String(meta.objetivo)}
        </p>
      ) : (
        <div className="mb-4" />
      )}

      {/* Subprojetos — se existirem */}
      {subprojetos.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {subprojetos.slice(0, 3).map((s, idx) => (
            <span
              key={idx}
              className="flex items-center gap-1 rounded-[6px] bg-[#F5F5F3] px-2 py-0.5 text-[10px] font-semibold text-ink-400"
            >
              <FolderKanban size={9} color="var(--hubia-bg-base-700)" />
              {s.nome}
            </span>
          ))}
          {subprojetos.length > 3 && (
            <span className="rounded-[6px] bg-[#F0F0EE] px-2 py-0.5 text-[10px] font-semibold text-base-700">
              +{subprojetos.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Espaço flexível */}
      <div className="flex-1" />

      {/* Barra de progresso com cor paleta correta */}
      {progresso !== null && (
        <div className="mb-3">
          <div className="h-1.5 w-full rounded-full bg-base-500 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: corBarra }}
              initial={{ width: 0 }}
              animate={{ width: `${progresso}%` }}
              transition={{ duration: 0.9, ease: [0, 0, 0.2, 1], delay: i * 0.06 + 0.1 }}
            />
          </div>
        </div>
      )}

      {/* Rodapé */}
      <div className="flex items-center justify-between pt-2.5 border-t border-[#F0F0EE]">
        <div className="flex items-center gap-3">
          {tarefasAbertas > 0 && (
            <div className="flex items-center gap-1">
              <CheckSquare size={11} color="var(--hubia-bg-base-700)" />
              <span className="text-[11px] text-base-700">{tarefasAbertas}</span>
            </div>
          )}
          {p.pedidosCount > 0 && (
            <div className="flex items-center gap-1">
              <ClipboardList size={11} color="var(--hubia-bg-base-700)" />
              <span className="text-[11px] text-base-700">{p.pedidosCount}</span>
            </div>
          )}
          {rulesBlockers > 0 && (
            <div className="flex items-center gap-1">
              <AlertTriangle size={11} color="#FB8C00" />
              <span className="text-[11px] font-semibold text-[#A05500]">{rulesBlockers}</span>
            </div>
          )}
          {subprojetos.length > 0 && (
            <div className="flex items-center gap-1">
              <Layers size={11} color="var(--hubia-bg-base-700)" />
              <span className="text-[11px] text-base-700">{subprojetos.length}</span>
            </div>
          )}
          {!!meta.prazo && (
            <div className="flex items-center gap-1">
              <Clock size={11} color="var(--hubia-bg-base-700)" />
              <span className="text-[11px] text-base-700">{String(meta.prazo)}</span>
            </div>
          )}
        </div>
        {progresso !== null && (
          <span className="text-[13px] font-bold" style={{ color: corBarraTexto }}>
            {progresso}%
          </span>
        )}
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
  const [cliente, setCliente] = useState("");
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
      if (saved.cliente) setCliente(saved.cliente);
    } catch { /* silencioso */ }
  }, [open]);

  const handleClose = () => {
    if (nome.trim() && typeof window !== "undefined") {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ nome, objetivo, tipo: tipoSelecionado, prazo, cliente }));
    }
    onClose();
    setTimeout(() => { setStep("tipo"); setTipoSelecionado(null); setNome(""); setObjetivo(""); setPrazo(""); setCliente(""); }, 350);
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
        cliente: cliente || null,
        progresso: 0,
        modulos_status: config.modulosBase.map(nome => ({ nome, status: "vazio", obrigatorio: true })),
        conectores: config.conectoresBase.map(nome => ({ nome, tipo: "default", status: "pendente" })),
        memoria: [],
        rules: [],
        log: [{
          id: Date.now(),
          acao: "Projeto criado",
          data: new Date().toLocaleDateString("pt-BR"),
        }],
        tarefas: [],
        proximas_acoes: [],
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
              className="w-full max-w-[620px] rounded-[30px] bg-white overflow-hidden"
              initial={{ scale: 0.88, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 10, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-7 pt-7 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {step === "detalhe" && (
                      <motion.button
                        onClick={() => setStep("tipo")}
                        className="text-[11px] font-semibold text-base-700 flex items-center gap-1"
                        whileHover={{ color: "#0E0F10" }} whileTap={{ scale: 0.97 }}>
                        ← Tipos
                      </motion.button>
                    )}
                    {step === "detalhe" && <span className="text-[#D4D5D6] text-[11px]">/</span>}
                    <span className="text-[11px] font-semibold text-base-700">
                      {step === "tipo" ? "1. Escolha o tipo" : "2. Configure o projeto"}
                    </span>
                  </div>
                  <h2 className="text-[22px] font-bold text-ink-500">Novo Projeto</h2>
                </div>
                <motion.button
                  onClick={handleClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-base-500 flex-shrink-0"
                  whileHover={{ rotate: 90, scale: 1.1, backgroundColor: "#0E0F10" }}
                  whileTap={{ rotate: 90, scale: 0.9 }}
                  transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <X size={14} color="var(--hubia-ink-500)" />
                </motion.button>
              </div>

              {/* Corpo animado */}
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
                        <p className="text-[10px] font-bold uppercase tracking-widest text-base-700 mb-2.5">{group.label}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {group.tipos.map((tipo) => {
                            const cfg = TIPO_CONFIG[tipo];
                            const Icon = cfg.icone;
                            return (
                              <motion.button
                                key={tipo}
                                onClick={() => handleSelecionarTipo(tipo)}
                                className="text-left rounded-[14px] p-3.5 flex items-start gap-3 border-2"
                                style={{
                                  backgroundColor: cfg.pillBg,
                                  borderColor: tipoSelecionado === tipo ? cfg.cor : "transparent",
                                }}
                                whileHover={{ borderColor: cfg.cor, scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                              >
                                <div
                                  className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-0.5"
                                  style={{ backgroundColor: `${cfg.cor}20`, color: cfg.pillText }}
                                >
                                  <Icon size={15} />
                                </div>
                                <div>
                                  <p className="text-[13px] font-bold text-ink-500">{cfg.label}</p>
                                  <p className="text-[11px] text-base-700 leading-snug mt-0.5">{cfg.descricao}</p>
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
                    {/* Preview do tipo */}
                    <div
                      className="rounded-[14px] p-4 mb-5 flex items-start gap-3"
                      style={{ backgroundColor: `${tipoConfig.cor}10` }}
                    >
                      <div
                        className="flex-shrink-0 h-9 w-9 rounded-[12px] flex items-center justify-center"
                        style={{ backgroundColor: `${tipoConfig.cor}25`, color: tipoConfig.cor }}
                      >
                        <tipoConfig.icone size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-ink-500">{tipoConfig.label}</p>
                        <p className="text-[11px] text-ink-400 mt-0.5">{tipoConfig.descricao}</p>
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {tipoConfig.modulosBase.map((m) => (
                            <span key={m} className="rounded-[5px] bg-white px-1.5 py-0.5 text-[9px] font-semibold" style={{ color: tipoConfig.cor }}>
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-base-700">Nome do Projeto *</label>
                        <input
                          autoFocus value={nome} onChange={(e) => setNome(e.target.value)}
                          placeholder={`Ex: ${tipoConfig.label} — Cliente 2026`}
                          className="h-11 w-full rounded-[12px] border border-transparent bg-base-500 px-3.5 text-[14px] text-ink-500 outline-none placeholder:text-base-700 hover:border-base-600 focus:border-ink-500 focus:ring-2 focus:ring-ink-500/10 transition-[border-color] duration-150"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-base-700">Cliente / Organização</label>
                          <input
                            value={cliente} onChange={(e) => setCliente(e.target.value)}
                            placeholder="Ex: Pantcho Agency"
                            className="h-11 w-full rounded-[12px] border border-transparent bg-base-500 px-3.5 text-[14px] text-ink-500 outline-none placeholder:text-base-700 hover:border-base-600 focus:border-ink-500 focus:ring-2 focus:ring-ink-500/10 transition-[border-color] duration-150"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-base-700">Prazo estimado</label>
                          <input
                            value={prazo} onChange={(e) => setPrazo(e.target.value)}
                            placeholder="Ex: Março 2026"
                            className="h-11 w-full rounded-[12px] border border-transparent bg-base-500 px-3.5 text-[14px] text-ink-500 outline-none placeholder:text-base-700 hover:border-base-600 focus:border-ink-500 focus:ring-2 focus:ring-ink-500/10 transition-[border-color] duration-150"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-base-700">Objetivo Principal</label>
                        <textarea
                          value={objetivo} onChange={(e) => setObjetivo(e.target.value)}
                          placeholder="O que esse projeto precisa entregar?"
                          rows={2}
                          className="w-full rounded-[12px] border border-transparent bg-base-500 px-3.5 py-2.5 text-[14px] text-ink-500 outline-none placeholder:text-base-700 resize-none hover:border-base-600 focus:border-ink-500 focus:ring-2 focus:ring-ink-500/10 transition-[border-color] duration-150"
                        />
                      </div>

                      {/* Squad automático */}
                      <div className="flex items-center justify-between rounded-[12px] bg-base-500 px-3.5 h-10">
                        <span className="text-[11px] text-base-700">Squad responsável</span>
                        <span className="text-[12px] font-bold text-ink-500">{tipoConfig.squad}</span>
                      </div>

                      <div className="flex gap-3 mt-1">
                        <motion.button type="button" onClick={handleClose}
                          className="rounded-[18px] border border-base-500 bg-white px-5 py-3 text-[14px] font-semibold text-ink-400"
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                          Cancelar
                        </motion.button>
                        <motion.button type="submit" disabled={!nome.trim() || loading}
                          className="flex-1 flex items-center justify-center gap-2 rounded-[18px] bg-limao-500 py-3 text-[14px] font-semibold text-ink-500 disabled:opacity-40"
                          initial="rest" animate="rest"
                          whileHover={nome.trim() && !loading ? "hovered" : "rest"}
                          whileTap={{ scale: 0.96 }}
                          variants={{ rest: { scale: 1, backgroundColor: "var(--hubia-limao-500)" }, hovered: { scale: 1.02, backgroundColor: "#DFFF33" } }}>
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
