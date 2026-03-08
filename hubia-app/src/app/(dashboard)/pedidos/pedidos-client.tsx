"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  useDroppable, useDraggable, type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core";
import {
  Plus, List, Columns, Calendar, ClipboardList, X, Flame, AlertTriangle,
  ExternalLink, Zap, ChevronLeft, ChevronRight, CheckSquare, Square,
  Lightbulb, Rocket, TrendingUp, FileText, CheckCircle2, Search, SlidersHorizontal,
} from "lucide-react";
import { HubiaPortal } from "@/components/ui/hubia-portal";
import { HubiaSelect } from "@/components/ui/hubia-select";
import { toast } from "@/components/ui/hubia-toast";
import {
  getPedidos, createPedido, getPedidoById, updatePedidoStatus,
  getCreatoresParaSelect, getProjetosParaSelect,
} from "./actions";
import { createProjeto } from "../projetos/actions";
import type { PedidoCard, PedidoDetail } from "./actions";
import type { PedidoStatus, PedidoTipo, PedidoUrgencia } from "@prisma/client";

// ─── Paleta travada de status (legível em qualquer contexto) ─────────────────
// Regra: texto sobre badge usa sempre a cor escura correspondente
// NUNCA usar limão (#D7FF00) como COR DE TEXTO — apenas como fundo

const STATUS_LABELS: Record<PedidoStatus, string> = {
  rascunho: "Backlog",
  aguardando: "Aguardando",
  em_andamento: "Em Progresso",
  revisao: "Revisão",
  aprovado: "Aprovado",
  entregue: "Concluído",
  cancelado: "Cancelado",
};

// bg: fundo do badge | text: texto sobre esse fundo | dot: bolinha indicadora
const STATUS_PALETTE: Record<PedidoStatus, { bg: string; text: string; dot: string; label: string }> = {
  rascunho:     { bg: "#F0F0EE", text: "#6B6C68", dot: "#A9AAA5", label: "Backlog" },
  aguardando:   { bg: "#F0EFFF", text: "#5B52C7", dot: "#7C6AF7", label: "Aguardando" },
  em_andamento: { bg: "#F0FF80", text: "#5A6600", dot: "#A8C800", label: "Em Progresso" },
  revisao:      { bg: "#FFF0E0", text: "#A05500", dot: "#FB8C00", label: "Revisão" },
  aprovado:     { bg: "#E6F4EA", text: "#2E7D32", dot: "#43A047", label: "Aprovado" },
  entregue:     { bg: "#E8E8E8", text: "#0E0F10", dot: "#0E0F10", label: "Concluído" },
  cancelado:    { bg: "#FDECEA", text: "#C62828", dot: "#E53935", label: "Cancelado" },
};

const URGENCIA_COLORS: Record<PedidoUrgencia, string> = {
  baixa: "#A9AAA5",
  media: "#5E5E5F",
  alta: "#FB8C00",
  critica: "#E53935",
};

const TIPO_LABELS: Record<PedidoTipo, string> = {
  imagem: "Imagem",
  video: "Vídeo",
  landing_page: "Landing Page",
  app: "App",
  site: "Site",
  sistema: "Sistema",
  creator: "Creator",
  skill: "Skill",
  agente: "Agente",
  outro: "Outro",
};

const TIPO_BADGES: Record<PedidoTipo, string> = {
  imagem: "#7C6AF7",
  video: "#E53935",
  landing_page: "#0288D1",
  app: "#43A047",
  site: "#0288D1",
  sistema: "#5E5E5F",
  creator: "#E91E63",
  skill: "#FF8F00",
  agente: "#0E0F10",
  outro: "#A9AAA5",
};

const TIPO_SQUAD: Record<PedidoTipo, "AUDIOVISUAL" | "DEV"> = {
  imagem: "AUDIOVISUAL",
  video: "AUDIOVISUAL",
  creator: "AUDIOVISUAL",
  landing_page: "DEV",
  app: "DEV",
  site: "DEV",
  sistema: "DEV",
  agente: "DEV",
  skill: "DEV",
  outro: "DEV",
};

// Creator só faz sentido nesses tipos
const TIPOS_COM_CREATOR: PedidoTipo[] = ["imagem", "video", "creator"];

function getTabsParaTipo(tipo: PedidoTipo): { id: string; label: string }[] {
  if (["landing_page", "app", "site", "sistema"].includes(tipo)) {
    return [
      { id: "geral", label: "Visão Geral" },
      { id: "arquitetura", label: "Arquitetura" },
      { id: "tarefas", label: "Tarefas" },
      { id: "decisoes", label: "Decisões" },
      { id: "deploy", label: "Deploy" },
      { id: "timeline", label: "Timeline" },
    ];
  }
  if (["imagem", "video"].includes(tipo)) {
    return [
      { id: "geral", label: "Visão Geral" },
      { id: "briefing", label: "Briefing" },
      { id: "referencias", label: "Referências" },
      { id: "aprovacao", label: "Aprovação" },
      { id: "entrega", label: "Entrega" },
    ];
  }
  if (tipo === "creator") {
    return [
      { id: "geral", label: "Visão Geral" },
      { id: "planejamento", label: "Planejamento" },
      { id: "posts", label: "Posts" },
      { id: "aprovacao", label: "Aprovação" },
      { id: "publicacao", label: "Publicação" },
    ];
  }
  return [
    { id: "geral", label: "Visão Geral" },
    { id: "tarefas", label: "Tarefas" },
    { id: "decisoes", label: "Decisões" },
    { id: "entrega", label: "Entrega" },
  ];
}

const KANBAN_COLS: PedidoStatus[] = ["rascunho", "aguardando", "em_andamento", "revisao", "aprovado", "entregue"];

const DRAFT_KEY = "hubia:novo-pedido:rascunho";
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEMANA = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

type View = "kanban" | "calendario" | "lista";

// ─── Paleta travada para garantir legibilidade ────────────────────────────────
function StatusBadge({ status, size = "sm" }: { status: PedidoStatus; size?: "sm" | "md" }) {
  const p = STATUS_PALETTE[status];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-[6px] font-bold uppercase tracking-wide"
      style={{
        backgroundColor: p.bg,
        color: p.text,
        fontSize: size === "sm" ? 9 : 11,
        padding: size === "sm" ? "2px 6px" : "3px 8px",
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.dot }} />
      {p.label}
    </span>
  );
}

// ─── HubiaDatePicker — substitui input[type=date] nativo ─────────────────────
function HubiaDatePicker({ value, onChange, placeholder = "Selecionar data" }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hoje = new Date();
  const [viewAno, setViewAno] = useState(value ? new Date(value + "T12:00:00").getFullYear() : hoje.getFullYear());
  const [viewMes, setViewMes] = useState(value ? new Date(value + "T12:00:00").getMonth() : hoje.getMonth());

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const primeiroDia = new Date(viewAno, viewMes, 1).getDay();
  const diasNoMes = new Date(viewAno, viewMes + 1, 0).getDate();
  const celulas: (number | null)[] = [
    ...Array(primeiroDia).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];
  while (celulas.length % 7 !== 0) celulas.push(null);

  const selectedDate = value ? new Date(value + "T12:00:00") : null;

  const handleDia = (dia: number) => {
    const m = String(viewMes + 1).padStart(2, "0");
    const d = String(dia).padStart(2, "0");
    onChange(`${viewAno}-${m}-${d}`);
    setOpen(false);
  };

  const prevMes = () => { if (viewMes === 0) { setViewAno(y => y - 1); setViewMes(11); } else setViewMes(m => m - 1); };
  const nextMes = () => { if (viewMes === 11) { setViewAno(y => y + 1); setViewMes(0); } else setViewMes(m => m + 1); };

  const displayValue = selectedDate
    ? selectedDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    : "";

  return (
    <div ref={containerRef} className="relative">
      <motion.button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="h-11 w-full rounded-[10px] border border-transparent bg-[#EEEFE9] px-3.5 text-left text-[14px] outline-none hover:border-[#D4D5D6] transition-[border-color] duration-150 flex items-center justify-between"
        whileTap={{ scale: 0.99 }}
      >
        <span style={{ color: displayValue ? "#0E0F10" : "#A9AAA5" }}>
          {displayValue || placeholder}
        </span>
        <Calendar size={15} color="#A9AAA5" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute z-[200] mt-1.5 w-[280px] rounded-[16px] bg-white p-4"
            style={{ boxShadow: "0 8px 32px rgba(14,15,16,0.12)" }}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
          >
            {/* Nav mês */}
            <div className="flex items-center justify-between mb-3">
              <motion.button type="button" onClick={prevMes} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-[#EEEFE9]" whileTap={{ scale: 0.9 }}>
                <ChevronLeft size={14} />
              </motion.button>
              <span className="text-[13px] font-bold text-[#0E0F10]">{MESES[viewMes]} {viewAno}</span>
              <motion.button type="button" onClick={nextMes} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-[#EEEFE9]" whileTap={{ scale: 0.9 }}>
                <ChevronRight size={14} />
              </motion.button>
            </div>

            {/* Dias semana */}
            <div className="grid grid-cols-7 mb-1">
              {DIAS_SEMANA.map(d => (
                <div key={d} className="text-center text-[10px] font-bold text-[#A9AAA5] py-1">{d[0]}</div>
              ))}
            </div>

            {/* Grade */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {celulas.map((dia, i) => {
                if (!dia) return <div key={i} />;
                const isSelected = selectedDate && selectedDate.getDate() === dia && selectedDate.getMonth() === viewMes && selectedDate.getFullYear() === viewAno;
                const isHoje = hoje.getDate() === dia && hoje.getMonth() === viewMes && hoje.getFullYear() === viewAno;
                return (
                  <motion.button
                    key={i}
                    type="button"
                    onClick={() => handleDia(dia)}
                    className="flex h-8 w-8 mx-auto items-center justify-center rounded-full text-[13px] font-semibold transition-colors duration-100"
                    style={{
                      backgroundColor: isSelected ? "#0E0F10" : isHoje ? "#D7FF00" : "transparent",
                      color: isSelected ? "#FFFFFF" : isHoje ? "#0E0F10" : "#0E0F10",
                    }}
                    whileHover={{ backgroundColor: isSelected ? "#0E0F10" : "#EEEFE9" }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {dia}
                  </motion.button>
                );
              })}
            </div>

            {/* Limpar */}
            {value && (
              <motion.button
                type="button"
                onClick={() => { onChange(""); setOpen(false); }}
                className="mt-3 w-full text-center text-[12px] font-semibold text-[#A9AAA5]"
                whileHover={{ color: "#E53935" }}
              >
                Limpar data
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Client ─────────────────────────────────────────────────────────────

export default function PedidosClient({
  organizationId,
  initialPedidos,
}: {
  organizationId: string;
  initialPedidos: PedidoCard[];
}) {
  const router = useRouter();
  const [pedidos, setPedidos] = useState(initialPedidos);
  const [view, setView] = useState<View>("kanban");
  const [novoModalOpen, setNovoModalOpen] = useState(false);
  const [detalheId, setDetalheId] = useState<string | null>(null);

  // Filtros
  const [busca, setBusca] = useState("");
  const [filtroSquad, setFiltroSquad] = useState<"todos" | "AUDIOVISUAL" | "DEV">("todos");
  const [filtroUrgencia, setFiltroUrgencia] = useState<PedidoUrgencia | "todas">("todas");
  const [filtroAberto, setFiltroAberto] = useState(false);

  const agora = new Date();
  const [calAno, setCalAno] = useState(agora.getFullYear());
  const [calMes, setCalMes] = useState(agora.getMonth() + 1);

  const reload = useCallback(async () => {
    const data = await getPedidos(organizationId);
    setPedidos(data);
  }, [organizationId]);

  const pedidosFiltrados = pedidos.filter((p) => {
    if (busca && !p.titulo.toLowerCase().includes(busca.toLowerCase())) return false;
    if (filtroSquad !== "todos" && TIPO_SQUAD[p.tipo] !== filtroSquad) return false;
    if (filtroUrgencia !== "todas" && p.urgencia !== filtroUrgencia) return false;
    return true;
  });

  // DnD
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingHeight, setDraggingHeight] = useState<number>(120);
  const draggingPedido = pedidos.find(p => p.id === draggingId) ?? null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (e: DragStartEvent) => {
    const id = String(e.active.id);
    setDraggingId(id);
    // Captura a altura real do elemento sendo arrastado
    const el = document.querySelector(`[data-pedido-id="${id}"]`);
    if (el) setDraggingHeight(el.getBoundingClientRect().height);
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    setDraggingId(null);
    const { active, over } = e;
    if (!over) return;
    const newStatus = over.id as PedidoStatus;
    const pedido = pedidos.find(p => p.id === active.id);
    if (!pedido || pedido.status === newStatus) return;
    setPedidos(prev => prev.map(p => p.id === pedido.id ? { ...p, status: newStatus } : p));
    const result = await updatePedidoStatus(organizationId, pedido.id, newStatus);
    if (!result.ok) {
      toast.error("Erro ao mover pedido");
      setPedidos(prev => prev.map(p => p.id === pedido.id ? { ...p, status: pedido.status } : p));
    } else {
      toast.success(`Movido para ${STATUS_LABELS[newStatus]}`);
    }
  };

  // Toggle views pill
  const viewOptions: { id: View; icon: React.ElementType; label: string }[] = [
    { id: "kanban", icon: Columns, label: "Kanban" },
    { id: "calendario", icon: Calendar, label: "Calendário" },
    { id: "lista", icon: List, label: "Lista" },
  ];
  const viewRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const viewContainerRef = useRef<HTMLDivElement>(null);
  const [pillLeft, setPillLeft] = useState(0);
  const [pillWidth, setPillWidth] = useState(0);

  useEffect(() => {
    const idx = viewOptions.findIndex((v) => v.id === view);
    const el = viewRefs.current[idx];
    const container = viewContainerRef.current;
    if (!el || !container) return;
    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    setPillLeft(eRect.left - cRect.left);
    setPillWidth(eRect.width);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const abrirDetalhe = (id: string) => setDetalheId(id);

  return (
    <div className="flex flex-col gap-4">
      {/* ─── Linha 1: Título + Novo Pedido — fora do box, sobre #EEEFE9 ─────── */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[28px] font-bold text-[#0E0F10]">Pedidos</h1>
        <motion.button
          onClick={() => setNovoModalOpen(true)}
          className="flex items-center gap-2 rounded-[18px] bg-[#D7FF00] px-4 py-3 text-[15px] font-semibold text-[#0E0F10]"
          initial="rest" animate="rest" whileHover="hovered" whileTap={{ scale: 0.96 }}
          variants={{ rest: { scale: 1, backgroundColor: "#D7FF00" }, hovered: { scale: 1.03, backgroundColor: "#DFFF33" } }}
          transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <motion.span variants={{ rest: { scale: 1 }, hovered: { scale: 1.2 } }} transition={{ duration: 0.25 }}>
            <Plus size={16} />
          </motion.span>
          Novo Pedido
        </motion.button>
      </div>

      {/* ─── Linha 2: Tab-navbar — fora do box, estilo pill animada ────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Esquerda: filtros de squad como tabs com pill */}
        <div className="flex items-center gap-1 rounded-[14px] bg-white p-1 relative">
          {(["todos", "AUDIOVISUAL", "DEV"] as const).map((squad) => {
            const isActive = filtroSquad === squad;
            return (
              <motion.button
                key={squad}
                onClick={() => setFiltroSquad(squad)}
                className="relative rounded-[10px] px-3.5 py-2 text-[12px] font-bold z-10"
                animate={{
                  backgroundColor: isActive ? "#0E0F10" : "transparent",
                  color: isActive ? "#D7FF00" : "#A9AAA5",
                }}
                initial={false}
                whileHover={!isActive ? { backgroundColor: "rgba(213,210,201,0.3)", color: "#0E0F10" } : {}}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.8 }}
              >
                {squad === "todos" ? "Todos" : squad}
              </motion.button>
            );
          })}
        </div>

        {/* Direita: busca + filtro urgência + views */}
        <div className="flex items-center gap-2">
          {/* Busca */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#A9AAA5" }} />
            <motion.input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar..."
              className="h-9 rounded-[10px] bg-white pl-8 pr-3 text-[13px] text-[#0E0F10] outline-none placeholder:text-[#A9AAA5] border border-transparent transition-[border-color,width] duration-200"
              style={{ width: busca ? 180 : 130 }}
              onFocus={(e) => (e.target.style.borderColor = "#0E0F10")}
              onBlur={(e) => (e.target.style.borderColor = "transparent")}
            />
          </div>

          {/* Filtro urgência */}
          <div className="relative">
            <motion.button
              onClick={() => setFiltroAberto(o => !o)}
              className="flex items-center gap-1.5 h-9 rounded-[10px] bg-white px-3 text-[12px] font-semibold"
              whileHover={{ backgroundColor: "#F0F0EE" }} whileTap={{ scale: 0.97 }}
              animate={{
                color: filtroUrgencia !== "todas" ? "#0E0F10" : "#A9AAA5",
                backgroundColor: filtroUrgencia !== "todas" ? "#F0F0EE" : "#FFFFFF",
              }}
              initial={false}
            >
              <SlidersHorizontal size={13} />
              {filtroUrgencia === "todas" ? "Filtrar" : filtroUrgencia.charAt(0).toUpperCase() + filtroUrgencia.slice(1)}
            </motion.button>
            <AnimatePresence>
              {filtroAberto && (
                <motion.div
                  className="absolute right-0 top-11 z-50 w-[160px] rounded-[12px] bg-white p-1.5 flex flex-col gap-0.5"
                  style={{ boxShadow: "0 4px 20px rgba(14,15,16,0.1)" }}
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                >
                  {(["todas", "baixa", "media", "alta", "critica"] as const).map((u) => (
                    <motion.button
                      key={u}
                      onClick={() => { setFiltroUrgencia(u); setFiltroAberto(false); }}
                      className="rounded-[8px] px-3 py-2 text-left text-[13px] font-semibold"
                      animate={{ backgroundColor: filtroUrgencia === u ? "#EEEFE9" : "transparent", color: filtroUrgencia === u ? "#0E0F10" : "#5E5E5F" }}
                      initial={false}
                      whileHover={{ backgroundColor: "#EEEFE9" }}
                    >
                      {u === "todas" ? "Todas urgências" : u.charAt(0).toUpperCase() + u.slice(1)}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Toggle views — pill com spring */}
          <div ref={viewContainerRef} className="relative flex items-center gap-0.5 rounded-[14px] bg-white p-1">
            <motion.div
              aria-hidden
              className="pointer-events-none absolute rounded-[9999px] bg-[#0E0F10]"
              animate={{ left: pillLeft, width: pillWidth }}
              transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.8 }}
              style={{ top: 4, bottom: 4 }}
            />
            {viewOptions.map((opt, i) => {
              const isActive = view === opt.id;
              return (
                <motion.button
                  key={opt.id}
                  ref={(el) => { viewRefs.current[i] = el; }}
                  onClick={() => setView(opt.id)}
                  className="relative z-10 flex items-center gap-1.5 rounded-[9999px] px-3.5 py-2 text-[12px] font-semibold"
                  animate={{ color: isActive ? "#D7FF00" : "#A9AAA5" }}
                  initial={false}
                  whileHover={!isActive ? { backgroundColor: "rgba(213,210,201,0.3)" } : {}}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                >
                  <opt.icon size={13} />
                  {opt.label}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contador de resultados */}
      <AnimatePresence>
        {(busca || filtroSquad !== "todos" || filtroUrgencia !== "todas") && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="text-[12px] text-[#A9AAA5]"
          >
            {pedidosFiltrados.length} pedido{pedidosFiltrados.length !== 1 ? "s" : ""} encontrado{pedidosFiltrados.length !== 1 ? "s" : ""}
            {" · "}
            <button onClick={() => { setBusca(""); setFiltroSquad("todos"); setFiltroUrgencia("todas"); }} className="text-[#0E0F10] font-semibold underline">
              limpar filtros
            </button>
          </motion.p>
        )}
      </AnimatePresence>

      {/* ─── White box: apenas o conteúdo ───────────────────────────────────── */}
      <div className="rounded-[20px] bg-white p-5 min-h-[400px]">
        <AnimatePresence mode="wait">
          {view === "kanban" && (
            <motion.div key="kanban" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}>
              <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <KanbanView pedidos={pedidosFiltrados} onPedidoClick={abrirDetalhe} onNovoClick={() => setNovoModalOpen(true)} draggingId={draggingId} draggingHeight={draggingHeight} />
                <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18,0.67,0.6,1.22)" }}>
                  {draggingPedido && <KanbanCardOverlay pedido={draggingPedido} />}
                </DragOverlay>
              </DndContext>
            </motion.div>
          )}
          {view === "calendario" && (
            <motion.div key="calendario" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}>
              <CalendarioView pedidos={pedidosFiltrados} ano={calAno} mes={calMes} onNavegar={(a, m) => { setCalAno(a); setCalMes(m); }} onPedidoClick={abrirDetalhe} />
            </motion.div>
          )}
          {view === "lista" && (
            <motion.div key="lista" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}>
              <ListaView pedidos={pedidosFiltrados} onPedidoClick={abrirDetalhe} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modais */}
      <NovoPedidoModal
        open={novoModalOpen}
        onClose={() => setNovoModalOpen(false)}
        organizationId={organizationId}
        onCreated={async (id) => {
          setNovoModalOpen(false);
          await reload();
          abrirDetalhe(id);
        }}
      />
      <PedidoDetalheModal
        open={!!detalheId}
        pedidoId={detalheId}
        organizationId={organizationId}
        onClose={() => setDetalheId(null)}
        onAbrirCompleto={(id) => router.push(`/pedidos/${id}`)}
      />
    </div>
  );
}

// ─── Kanban Droppable Column ──────────────────────────────────────────────────

function DroppableColumn({
  status, children, isDragging, draggingHeight,
}: {
  status: PedidoStatus;
  children: React.ReactNode;
  isDragging: boolean;
  draggingHeight: number;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const palette = STATUS_PALETTE[status];
  return (
    <motion.div
      ref={setNodeRef}
      className="flex flex-col gap-2 rounded-[14px]"
      animate={{
        backgroundColor: isOver
          ? `${palette.dot}22`
          : isDragging
          ? `${palette.dot}08`
          : "transparent",
        outline: isOver ? `2px dashed ${palette.dot}` : "2px dashed transparent",
        outlineOffset: 2,
      }}
      style={{ minHeight: isDragging ? draggingHeight + 16 : 0 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.div>
  );
}

function DraggableCard({
  pedido, index, onClick,
}: {
  pedido: PedidoCard;
  index: number;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: pedido.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      data-pedido-id={pedido.id}
      style={{ opacity: isDragging ? 0.35 : 1, cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
    >
      <KanbanCard pedido={pedido} index={index} onClick={onClick} />
    </div>
  );
}

// ─── Kanban View ─────────────────────────────────────────────────────────────

function KanbanView({
  pedidos, onPedidoClick, onNovoClick, draggingId, draggingHeight,
}: {
  pedidos: PedidoCard[];
  onPedidoClick: (id: string) => void;
  onNovoClick: () => void;
  draggingId: string | null;
  draggingHeight: number;
}) {
  const isDragging = !!draggingId;
  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {KANBAN_COLS.map((status) => {
        const cards = pedidos.filter((p) => p.status === status);
        const palette = STATUS_PALETTE[status];
        return (
          <div key={status} className="flex-shrink-0 w-[260px] flex flex-col gap-2">
            {/* Cabeçalho da coluna */}
            <motion.div
              className="flex items-center justify-between px-1.5 py-1.5 rounded-[10px]"
              animate={{ backgroundColor: isDragging ? `${palette.dot}10` : "transparent" }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: palette.dot }} />
                <span className="text-[12px] font-bold text-[#0E0F10]">{STATUS_LABELS[status]}</span>
              </div>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ backgroundColor: `${palette.dot}18`, color: palette.text }}
              >
                {cards.length}
              </span>
            </motion.div>

            <DroppableColumn status={status} isDragging={isDragging} draggingHeight={draggingHeight}>
              {cards.map((p, i) => (
                <DraggableCard key={p.id} pedido={p} index={i} onClick={() => onPedidoClick(p.id)} />
              ))}
              {/* Indicador de drop adaptável ao tamanho do card arrastado */}
              {isDragging && cards.length === 0 && (
                <motion.div
                  className="rounded-[12px] border-2 border-dashed flex items-center justify-center text-[11px] font-semibold"
                  style={{
                    borderColor: `${palette.dot}60`,
                    color: palette.text,
                    height: draggingHeight,
                  }}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  Soltar aqui
                </motion.div>
              )}
              {status === "rascunho" && !isDragging && (
                <motion.button
                  onClick={onNovoClick}
                  className="flex items-center gap-1.5 rounded-[12px] px-3 py-2.5 text-[12px] font-semibold text-[#A9AAA5] w-full"
                  whileHover={{ backgroundColor: "rgba(213,210,201,0.3)", color: "#0E0F10" }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                >
                  <Plus size={13} />
                  Novo Pedido
                </motion.button>
              )}
            </DroppableColumn>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({ pedido: p, index: i, onClick }: { pedido: PedidoCard; index: number; onClick: () => void }) {
  const isCritica = p.urgencia === "critica";
  const isAlta = p.urgencia === "alta";
  const squad = TIPO_SQUAD[p.tipo];
  const numPedido = parseInt(p.id.replace(/-/g, "").slice(-8), 16) % 999 + 1;

  return (
    <motion.div
      // Cards ficam em #F7F7F5 (sutil) sobre o container branco
      className="rounded-[14px] p-4 flex flex-col gap-2.5 cursor-pointer"
      style={{ backgroundColor: "#F7F7F5" }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0, 0, 0.2, 1], delay: Math.min(i * 0.04, 0.2) }}
      whileHover={{ y: -3, backgroundColor: "#F0F0ED" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Linha superior */}
      <div className="flex items-center justify-between">
        <span
          className="rounded-[5px] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
          style={{ backgroundColor: `${TIPO_BADGES[p.tipo]}20`, color: TIPO_BADGES[p.tipo] }}
        >
          {squad}
        </span>
        <span className="text-[10px] font-bold text-[#A9AAA5]">#{numPedido.toString().padStart(3, "0")}</span>
      </div>

      {/* Urgência */}
      {(isCritica || isAlta) && (
        <span
          className="inline-flex w-fit items-center gap-1 rounded-[6px] px-2 py-0.5 text-[10px] font-bold"
          style={{
            backgroundColor: isCritica ? "#FDECEA" : "#FFF3E0",
            color: isCritica ? "#C62828" : "#A05500",
          }}
        >
          {isCritica ? <Flame size={10} /> : <AlertTriangle size={10} />}
          {isCritica ? "Urgente" : "Alta"}
        </span>
      )}

      {/* Título */}
      <p className="text-[13px] font-semibold text-[#0E0F10] leading-snug line-clamp-2">{p.titulo}</p>

      {/* Tags contextuais */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="rounded-[5px] px-1.5 py-0.5 text-[9px] font-semibold text-[#5E5E5F] bg-white">
          {TIPO_LABELS[p.tipo]}
        </span>
        {p.creator && (
          <span className="rounded-[5px] px-1.5 py-0.5 text-[9px] font-semibold bg-[#F3F0FF] text-[#7C6AF7]">
            {p.creator.name.split(" ")[0]}
          </span>
        )}
        {p.projeto && (
          <span className="rounded-[5px] px-1.5 py-0.5 text-[9px] font-semibold bg-[#E8F5E9] text-[#2E7D32] truncate max-w-[80px]">
            {p.projeto.nome.split(" ")[0]}
          </span>
        )}
      </div>

      {/* Rodapé */}
      <div className="flex items-center justify-between">
        {p.sourceType !== "manual" && (
          <span className="flex items-center gap-0.5 text-[9px] text-[#A9AAA5]">
            <Zap size={9} />{p.sourceType}
          </span>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          <StatusBadge status={p.status} />
          {p.dueAt && (
            <span className="text-[10px] text-[#A9AAA5] flex items-center gap-0.5">
              <Calendar size={9} />
              {new Date(p.dueAt).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function KanbanCardOverlay({ pedido: p }: { pedido: PedidoCard }) {
  return (
    <div
      className="rounded-[14px] p-4 rotate-2 cursor-grabbing"
      style={{ backgroundColor: "#F7F7F5", boxShadow: "0 12px 40px rgba(14,15,16,0.18)", width: 240 }}
    >
      <p className="text-[13px] font-semibold text-[#0E0F10] line-clamp-1">{p.titulo}</p>
      <StatusBadge status={p.status} />
    </div>
  );
}

// ─── Calendário View ─────────────────────────────────────────────────────────

function CalendarioView({ pedidos, ano, mes, onNavegar, onPedidoClick }: {
  pedidos: PedidoCard[];
  ano: number;
  mes: number;
  onNavegar: (ano: number, mes: number) => void;
  onPedidoClick: (id: string) => void;
}) {
  const pedidosComData = pedidos.filter((p) => {
    if (!p.dueAt) return false;
    const d = new Date(p.dueAt);
    return d.getFullYear() === ano && d.getMonth() + 1 === mes;
  });

  const porDia: Record<number, PedidoCard[]> = {};
  for (const p of pedidosComData) {
    const dia = new Date(p.dueAt!).getDate();
    if (!porDia[dia]) porDia[dia] = [];
    porDia[dia].push(p);
  }

  const primeiroDia = new Date(ano, mes - 1, 1).getDay();
  const diasNoMes = new Date(ano, mes, 0).getDate();
  const celulas: (number | null)[] = [
    ...Array(primeiroDia).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];
  while (celulas.length % 7 !== 0) celulas.push(null);

  const hoje = new Date();
  const mesPrev = mes === 1 ? 12 : mes - 1;
  const anoMesPrev = mes === 1 ? ano - 1 : ano;
  const mesNext = mes === 12 ? 1 : mes + 1;
  const anoMesNext = mes === 12 ? ano + 1 : ano;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[22px] font-bold text-[#0E0F10]">{MESES[mes - 1]} {ano}</h2>
        <div className="flex items-center gap-2">
          <motion.button onClick={() => onNavegar(anoMesPrev, mesPrev)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white"
            whileHover={{ scale: 1.1, backgroundColor: "#EEEFE9" }} whileTap={{ scale: 0.95 }}>
            <ChevronLeft size={16} />
          </motion.button>
          <motion.button onClick={() => onNavegar(anoMesNext, mesNext)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white"
            whileHover={{ scale: 1.1, backgroundColor: "#EEEFE9" }} whileTap={{ scale: 0.95 }}>
            <ChevronRight size={16} />
          </motion.button>
        </div>
      </div>

      <div className="rounded-[20px] bg-white overflow-hidden">
        <div className="grid grid-cols-7 border-b border-[#EEEFE9]">
          {DIAS_SEMANA.map(d => (
            <div key={d} className="py-3 text-center text-[11px] font-bold text-[#A9AAA5] uppercase tracking-wide">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {celulas.map((dia, idx) => {
            const eventos = dia ? (porDia[dia] ?? []) : [];
            const isHoje = dia ? (dia === hoje.getDate() && mes === hoje.getMonth() + 1 && ano === hoje.getFullYear()) : false;
            return (
              <div
                key={idx}
                className="min-h-[100px] p-2"
                style={{
                  borderBottom: "1px solid #EEEFE9",
                  borderRight: (idx + 1) % 7 !== 0 ? "1px solid #EEEFE9" : "none",
                }}
              >
                {dia && (
                  <>
                    <div className="mb-2 flex justify-center">
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-semibold"
                        style={{ backgroundColor: isHoje ? "#D7FF00" : "transparent", color: isHoje ? "#0E0F10" : "#5E5E5F" }}
                      >
                        {dia}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {eventos.slice(0, 3).map((e) => {
                        const palette = STATUS_PALETTE[e.status];
                        return (
                          <motion.button
                            key={e.id}
                            onClick={() => onPedidoClick(e.id)}
                            className="w-full rounded-[5px] px-2 py-1 text-left"
                            style={{ backgroundColor: `${TIPO_BADGES[e.tipo]}18`, border: `1px solid ${TIPO_BADGES[e.tipo]}30` }}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          >
                            <p className="text-[10px] font-bold truncate" style={{ color: TIPO_BADGES[e.tipo] }}>{e.titulo}</p>
                            <p className="text-[9px] mt-0.5" style={{ color: palette.text }}>{palette.label}</p>
                          </motion.button>
                        );
                      })}
                      {eventos.length > 3 && (
                        <span className="pl-1 text-[9px] text-[#A9AAA5]">+{eventos.length - 3}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Lista View ───────────────────────────────────────────────────────────────

function ListaView({ pedidos, onPedidoClick }: { pedidos: PedidoCard[]; onPedidoClick: (id: string) => void }) {
  if (pedidos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[20px] bg-white py-20 text-center">
        <ClipboardList size={24} color="#A9AAA5" />
        <p className="text-[14px] text-[#A9AAA5]">Nenhum pedido encontrado.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1.5">
      {pedidos.map((p, i) => (
        <motion.div
          key={p.id}
          className="cursor-pointer rounded-[14px] bg-white px-5 py-4 flex items-center gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(i * 0.04, 0.25) }}
          whileHover={{ backgroundColor: "#FAFAFA", y: -2 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onPedidoClick(p.id)}
        >
          <span
            className="rounded-[5px] px-1.5 py-0.5 text-[9px] font-bold uppercase flex-shrink-0"
            style={{ backgroundColor: `${TIPO_BADGES[p.tipo]}20`, color: TIPO_BADGES[p.tipo] }}
          >
            {TIPO_LABELS[p.tipo]}
          </span>
          <p className="text-[14px] font-semibold text-[#0E0F10] flex-1 truncate">{p.titulo}</p>
          {p.creator && <span className="text-[12px] text-[#A9AAA5] flex-shrink-0">{p.creator.name}</span>}
          <StatusBadge status={p.status} size="md" />
          {p.dueAt && (
            <span className="text-[11px] text-[#A9AAA5] flex-shrink-0">
              {new Date(p.dueAt).toLocaleDateString("pt-BR")}
            </span>
          )}
          <ExternalLink size={13} color="#A9AAA5" className="flex-shrink-0" />
        </motion.div>
      ))}
    </div>
  );
}

// ─── Modal Detalhe do Pedido ──────────────────────────────────────────────────

function PedidoDetalheModal({
  open, pedidoId, organizationId, onClose, onAbrirCompleto,
}: {
  open: boolean;
  pedidoId: string | null;
  organizationId: string;
  onClose: () => void;
  onAbrirCompleto: (id: string) => void;
}) {
  const [detalhe, setDetalhe] = useState<PedidoDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("geral");

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const [tabPillLeft, setTabPillLeft] = useState(0);
  const [tabPillWidth, setTabPillWidth] = useState(100);

  useEffect(() => {
    if (!open || !pedidoId) { setDetalhe(null); return; }
    setLoading(true);
    getPedidoById(organizationId, pedidoId).then((d) => {
      setDetalhe(d);
      setActiveTab("geral");
      setLoading(false);
    });
  }, [open, pedidoId, organizationId]);

  const tabs = detalhe ? getTabsParaTipo(detalhe.tipo) : [];

  useEffect(() => {
    const idx = tabs.findIndex((t) => t.id === activeTab);
    if (idx === -1) return;
    const el = tabRefs.current[idx];
    const container = tabContainerRef.current;
    if (!el || !container) return;
    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    setTabPillLeft(eRect.left - cRect.left);
    setTabPillWidth(eRect.width);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, tabs.length]);

  const briefing = detalhe?.briefing ?? {};
  const tarefas = Array.isArray((briefing as Record<string,unknown>).tarefas)
    ? (briefing as Record<string,unknown>).tarefas as { titulo: string; concluido: boolean }[]
    : [];
  const tarefasConcluidas = tarefas.filter((t) => t.concluido).length;
  const progresso = tarefas.length > 0 ? Math.round((tarefasConcluidas / tarefas.length) * 100) : 0;
  const decisoes = Array.isArray((briefing as Record<string,unknown>).decisoes)
    ? (briefing as Record<string,unknown>).decisoes as { titulo: string; desc?: string; data?: string }[]
    : [];

  const kpis = [
    { label: "Progresso", value: `${progresso}%`, icon: TrendingUp, bg: "#F5FFB8", color: "#5A6600" },
    { label: "Tarefas", value: `${tarefasConcluidas}/${tarefas.length || "?"}`, icon: CheckSquare, bg: "#E6F4EA", color: "#2E7D32" },
    { label: detalhe && ["imagem","video","creator"].includes(detalhe.tipo) ? "Posts" : "Módulos",
      value: String((briefing as Record<string,unknown>).modulos ?? (briefing as Record<string,unknown>).posts ?? "—"),
      icon: FileText, bg: "#F3F0FF", color: "#5B52C7" },
    { label: detalhe && ["imagem","video"].includes(detalhe.tipo) ? "Imagens" : "Telas",
      value: String((briefing as Record<string,unknown>).telas ?? (briefing as Record<string,unknown>).quantidade ?? "—"),
      icon: Rocket, bg: "#E3F2FD", color: "#0277BD" },
  ];

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
            onClick={(e) => e.target === e.currentTarget && onClose()}
          >
            <motion.div
              className="w-full max-w-[720px] max-h-[90vh] rounded-[20px] bg-white flex flex-col overflow-hidden"
              initial={{ scale: 0.88, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 10, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {loading || !detalhe ? (
                <div className="flex items-center justify-center py-32">
                  <div className="h-8 w-8 rounded-full border-2 border-[#D7FF00] border-t-transparent animate-spin" />
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="p-6 pb-0">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span
                            className="rounded-[5px] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                            style={{ backgroundColor: `${TIPO_BADGES[detalhe.tipo]}20`, color: TIPO_BADGES[detalhe.tipo] }}
                          >
                            {TIPO_SQUAD[detalhe.tipo]}
                          </span>
                          <span className="text-[11px] text-[#A9AAA5]">
                            {TIPO_LABELS[detalhe.tipo]} · v1
                            {detalhe.dueAt && ` · Entrega ${new Date(detalhe.dueAt).toLocaleDateString("pt-BR")}`}
                          </span>
                          <StatusBadge status={detalhe.status} />
                        </div>
                        <h2 className="text-[20px] font-bold text-[#0E0F10] leading-tight">{detalhe.titulo}</h2>
                        {detalhe.descricao && (
                          <p className="mt-1 text-[13px] text-[#5E5E5F] line-clamp-1">{detalhe.descricao}</p>
                        )}
                      </div>
                      <motion.button onClick={onClose}
                        className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#0E0F10]"
                        whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ rotate: 90, scale: 0.9 }}
                        transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}>
                        <X size={14} color="#D7FF00" />
                      </motion.button>
                    </div>

                    {/* KPIs */}
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {kpis.map((kpi, i) => (
                        <motion.div
                          key={kpi.label}
                          className="rounded-[12px] p-3"
                          style={{ backgroundColor: kpi.bg }}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <kpi.icon size={11} style={{ color: kpi.color }} />
                            <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: kpi.color }}>{kpi.label}</span>
                          </div>
                          <span className="text-[22px] font-bold text-[#0E0F10]">{kpi.value}</span>
                          {kpi.label === "Progresso" && (
                            <div className="mt-1.5 h-1 rounded-full bg-white/60 overflow-hidden">
                              <motion.div className="h-full rounded-full bg-[#A8C800]"
                                initial={{ width: 0 }} animate={{ width: `${progresso}%` }}
                                transition={{ duration: 0.8, ease: [0, 0, 0.2, 1], delay: 0.3 }} />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {/* Tabs */}
                    <div ref={tabContainerRef} className="relative mt-4 flex rounded-[12px] bg-[#EEEFE9] p-1 overflow-x-auto">
                      <motion.div aria-hidden className="pointer-events-none absolute rounded-[9px] bg-white"
                        animate={{ left: tabPillLeft, width: tabPillWidth }}
                        transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.8 }}
                        style={{ top: 4, bottom: 4 }} />
                      {tabs.map((tab, i) => (
                        <motion.button
                          key={tab.id}
                          ref={(el) => { tabRefs.current[i] = el; }}
                          onClick={() => setActiveTab(tab.id)}
                          className="relative z-10 flex-shrink-0 rounded-[9px] px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap"
                          animate={{ color: activeTab === tab.id ? "#0E0F10" : "#A9AAA5" }}
                          initial={false}
                          whileTap={{ scale: 0.97 }}
                        >
                          {tab.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 overflow-y-auto p-6 pt-4">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                      >
                        {activeTab === "geral" && (
                          <div className="flex flex-col gap-4">
                            {Object.keys(briefing).filter(k => !["tarefas","decisoes"].includes(k)).length > 0 && (
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wide text-[#A9AAA5] mb-2">Briefing</p>
                                <div className="rounded-[12px] bg-[#EEEFE9] p-3 space-y-1.5">
                                  {Object.entries(briefing).filter(([k]) => !["tarefas","decisoes"].includes(k)).map(([k, v]) => (
                                    <div key={k} className="flex gap-2 text-[12px]">
                                      <span className="font-semibold text-[#0E0F10] capitalize min-w-[90px]">{k}:</span>
                                      <span className="text-[#5E5E5F]">{Array.isArray(v) ? v.join(", ") : String(v)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {decisoes.length > 0 && (
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wide text-[#A9AAA5] mb-2">Decisões recentes</p>
                                <div className="flex flex-col gap-2">
                                  {decisoes.slice(0, 2).map((dec, i) => (
                                    <div key={i} className="rounded-[10px] bg-[#FFFDE7] p-3 flex items-start gap-2">
                                      <Lightbulb size={13} color="#FB8C00" className="mt-0.5 flex-shrink-0" />
                                      <div>
                                        <p className="text-[12px] font-semibold text-[#0E0F10]">{dec.titulo}</p>
                                        {dec.desc && <p className="text-[11px] text-[#5E5E5F]">{dec.desc}</p>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {["tarefas","planejamento","posts"].includes(activeTab) && (
                          <div className="flex flex-col gap-1.5">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-[#A9AAA5] mb-2">
                              {tarefas.length > 0 ? `${tarefasConcluidas}/${tarefas.length} concluídas` : "Sem tarefas"}
                            </p>
                            {tarefas.map((t, i) => (
                              <div key={i} className="flex items-center gap-2.5 rounded-[10px] px-3 py-2.5" style={{ backgroundColor: t.concluido ? "#E6F4EA" : "#FAFAFA" }}>
                                {t.concluido ? <CheckCircle2 size={15} color="#43A047" /> : <Square size={15} color="#A9AAA5" />}
                                <span className="text-[13px] font-semibold" style={{ color: t.concluido ? "#2E7D32" : "#0E0F10" }}>{t.titulo}</span>
                              </div>
                            ))}
                            {tarefas.length === 0 && (
                              <div className="flex flex-col items-center gap-2 py-10 text-center">
                                <CheckSquare size={20} color="#A9AAA5" />
                                <p className="text-[13px] text-[#A9AAA5]">Tarefas serão definidas no início do projeto.</p>
                              </div>
                            )}
                          </div>
                        )}
                        {activeTab === "decisoes" && (
                          <div className="flex flex-col gap-2">
                            {decisoes.map((dec, i) => (
                              <div key={i} className="rounded-[12px] bg-[#FFFDE7] p-4 flex items-start gap-2">
                                <Lightbulb size={14} color="#FB8C00" className="mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-[13px] font-semibold text-[#0E0F10]">{dec.titulo}</p>
                                  {dec.desc && <p className="text-[12px] text-[#5E5E5F] mt-0.5">{dec.desc}</p>}
                                  {dec.data && <p className="text-[10px] text-[#A9AAA5] mt-1">{dec.data}</p>}
                                </div>
                              </div>
                            ))}
                            {decisoes.length === 0 && (
                              <div className="flex flex-col items-center gap-2 py-10 text-center">
                                <Lightbulb size={20} color="#A9AAA5" />
                                <p className="text-[13px] text-[#A9AAA5]">Decisões serão registradas no projeto.</p>
                              </div>
                            )}
                          </div>
                        )}
                        {["arquitetura","briefing","referencias","aprovacao","entrega","publicacao","deploy","timeline"].includes(activeTab) && (
                          <div className="flex flex-col items-center gap-3 py-10 text-center">
                            <Rocket size={22} color="#A9AAA5" />
                            <p className="text-[14px] font-semibold text-[#5E5E5F]">
                              {activeTab === "referencias" ? "Referências serão vinculadas ao abrir o pedido completo." : "Em andamento"}
                            </p>
                            <p className="text-[12px] text-[#A9AAA5]">Acesse o pedido completo para editar esta seção.</p>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Footer */}
                  <div className="border-t border-[#EEEFE9] px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[12px] text-[#5E5E5F]">
                      {detalhe.creator && <span>Creator: <strong className="text-[#0E0F10]">{detalhe.creator.name}</strong></span>}
                      {detalhe.projeto && <span>Projeto: <strong className="text-[#0E0F10]">{detalhe.projeto.nome}</strong></span>}
                    </div>
                    <motion.button
                      onClick={() => onAbrirCompleto(detalhe.id)}
                      className="flex items-center gap-2 rounded-[14px] bg-[#0E0F10] px-4 py-2.5 text-[13px] font-semibold text-white"
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                      transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                    >
                      Abrir pedido completo
                      <ExternalLink size={13} />
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </HubiaPortal>
  );
}

// ─── Modal Novo Pedido ────────────────────────────────────────────────────────
// Layout 2 colunas, sem scroll. Datepicker fica visível sem overflow.

function NovoPedidoModal({
  open, onClose, organizationId, onCreated,
}: {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  onCreated: (id: string) => void;
}) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<PedidoTipo>("imagem");
  const [urgencia, setUrgencia] = useState<PedidoUrgencia>("media");
  const [creatorId, setCreatorId] = useState("");
  const [projetoId, setProjetoId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [creators, setCreators] = useState<{ id: string; name: string }[]>([]);
  const [projetos, setProjetos] = useState<{ id: string; nome: string }[]>([]);

  // Criar projeto inline
  const [criandoProjeto, setCriandoProjeto] = useState(false);
  const [nomeProjeto, setNomeProjeto] = useState("");
  const [loadingProjeto, setLoadingProjeto] = useState(false);

  const mostraCreator = TIPOS_COM_CREATOR.includes(tipo);

  useEffect(() => {
    if (typeof window === "undefined" || !open) return;
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.titulo) setTitulo(d.titulo);
        if (d.descricao) setDescricao(d.descricao);
        if (d.tipo) setTipo(d.tipo);
        if (d.urgencia) setUrgencia(d.urgencia);
        if (d.dueAt) setDueAt(d.dueAt);
      } catch { /* ignore */ }
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    getCreatoresParaSelect(organizationId).then(setCreators);
    getProjetosParaSelect(organizationId).then(setProjetos);
  }, [open, organizationId]);

  useEffect(() => {
    if (!mostraCreator) setCreatorId("");
  }, [tipo, mostraCreator]);

  const handleClose = () => {
    if (titulo.trim() && typeof window !== "undefined") {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ titulo, descricao, tipo, urgencia, dueAt }));
    }
    onClose();
  };

  const handleCriarProjeto = async () => {
    if (!nomeProjeto.trim()) return;
    setLoadingProjeto(true);
    const result = await createProjeto(organizationId, { nome: nomeProjeto.trim(), tipo: "outro" });
    setLoadingProjeto(false);
    if (!result.ok) { toast.error("Erro ao criar projeto"); return; }
    const novoProjeto = { id: result.id, nome: nomeProjeto.trim() };
    setProjetos(prev => [novoProjeto, ...prev]);
    setProjetoId(result.id);
    setNomeProjeto("");
    setCriandoProjeto(false);
    toast.success(`Projeto "${novoProjeto.nome}" criado!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;
    setLoading(true);
    const result = await createPedido(organizationId, {
      titulo, descricao: descricao || undefined, tipo, urgencia,
      creatorId: mostraCreator && creatorId ? creatorId : undefined,
      projetoId: projetoId || undefined,
      dueAt: dueAt || undefined,
    });
    setLoading(false);
    if (!result.ok) { toast.error(result.error); return; }
    if (typeof window !== "undefined") localStorage.removeItem(DRAFT_KEY);
    toast.success("Pedido criado!");
    onCreated(result.id);
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
              className="w-full max-w-[680px] rounded-[20px] bg-white p-7"
              initial={{ scale: 0.88, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 10, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[20px] font-bold text-[#0E0F10]">Novo Pedido</h2>
                  <p className="text-[12px] text-[#A9AAA5] mt-0.5">Organizado automaticamente pelo Orquestrador</p>
                </div>
                <motion.button onClick={handleClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0E0F10]"
                  whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ rotate: 90, scale: 0.9 }}
                  transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}>
                  <X size={14} color="#D7FF00" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Layout 2 colunas — elimina scroll */}
                <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                  {/* Col 1 */}
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Título *</label>
                      <input
                        autoFocus value={titulo} onChange={(e) => setTitulo(e.target.value)}
                        placeholder="Ex: Pack Piscina Ninaah — Março"
                        className="h-10 w-full rounded-[10px] border border-transparent bg-[#F7F7F5] px-3.5 text-[13px] text-[#0E0F10] outline-none placeholder:text-[#A9AAA5] hover:border-[#D4D5D6] focus:border-[#0E0F10] focus:shadow-[0_0_0_3px_rgba(14,15,16,0.08)] transition-[border-color,box-shadow] duration-150"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Descrição</label>
                      <textarea
                        value={descricao} onChange={(e) => setDescricao(e.target.value)}
                        placeholder="Mood, referências, detalhes..."
                        rows={3}
                        className="w-full rounded-[10px] border border-transparent bg-[#F7F7F5] px-3.5 py-2.5 text-[13px] text-[#0E0F10] outline-none placeholder:text-[#A9AAA5] resize-none hover:border-[#D4D5D6] focus:border-[#0E0F10] focus:shadow-[0_0_0_3px_rgba(14,15,16,0.08)] transition-[border-color,box-shadow] duration-150"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Tipo</label>
                        <HubiaSelect
                          value={tipo} onChange={(v) => setTipo(v as PedidoTipo)}
                          options={Object.entries(TIPO_LABELS).map(([v, l]) => ({ value: v, label: l }))}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Urgência</label>
                        <HubiaSelect
                          value={urgencia} onChange={(v) => setUrgencia(v as PedidoUrgencia)}
                          options={[
                            { value: "baixa", label: "Baixa" }, { value: "media", label: "Média" },
                            { value: "alta", label: "Alta" }, { value: "critica", label: "Crítica" },
                          ]}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Col 2 */}
                  <div className="flex flex-col gap-4">
                    {/* Creator condicional */}
                    <AnimatePresence initial={false}>
                      {mostraCreator ? (
                        <motion.div
                          key="creator"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Creator</label>
                          <HubiaSelect
                            value={creatorId} onChange={setCreatorId} placeholder="Selecionar creator"
                            options={[{ value: "", label: "Nenhum" }, ...creators.map((c) => ({ value: c.id, label: c.name }))]}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="squad-info"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Squad</label>
                          <div className="h-10 rounded-[10px] bg-[#0E0F10] px-3.5 flex items-center">
                            <span className="text-[12px] font-bold text-[#D7FF00]">DEV</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Projeto com criar inline */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Projeto</label>
                        <motion.button
                          type="button"
                          onClick={() => setCriandoProjeto(o => !o)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-[#A9AAA5]"
                          whileHover={{ color: "#0E0F10" }}
                        >
                          <Plus size={11} />
                          Criar novo
                        </motion.button>
                      </div>
                      <AnimatePresence>
                        {criandoProjeto && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex gap-2"
                          >
                            <input
                              autoFocus value={nomeProjeto} onChange={(e) => setNomeProjeto(e.target.value)}
                              placeholder="Nome do projeto..."
                              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCriarProjeto())}
                              className="flex-1 h-9 rounded-[9px] border border-transparent bg-[#F7F7F5] px-3 text-[13px] text-[#0E0F10] outline-none placeholder:text-[#A9AAA5] focus:border-[#0E0F10] transition-[border-color] duration-150"
                            />
                            <motion.button type="button" onClick={handleCriarProjeto} disabled={!nomeProjeto.trim() || loadingProjeto}
                              className="h-9 rounded-[9px] bg-[#D7FF00] px-3 text-[12px] font-bold text-[#0E0F10] disabled:opacity-40"
                              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
                              {loadingProjeto ? "..." : "OK"}
                            </motion.button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <HubiaSelect
                        value={projetoId} onChange={setProjetoId} placeholder="Associar projeto (opcional)"
                        options={[{ value: "", label: "Nenhum" }, ...projetos.map((p) => ({ value: p.id, label: p.nome }))]}
                      />
                    </div>

                    {/* Data de entrega — sem scroll, sem overflow */}
                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Data de entrega</label>
                      <HubiaDatePicker value={dueAt} onChange={setDueAt} placeholder="Selecionar data" />
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-3 mt-6">
                  <motion.button type="button" onClick={handleClose}
                    className="flex-1 rounded-[18px] border border-[#EEEFE9] bg-white py-3 text-[14px] font-semibold text-[#5E5E5F]"
                    whileHover={{ scale: 1.02, backgroundColor: "#FAFAFA" }} whileTap={{ scale: 0.97 }}>
                    Cancelar
                  </motion.button>
                  <motion.button type="submit" disabled={!titulo.trim() || loading}
                    className="flex-[2] rounded-[18px] bg-[#D7FF00] py-3 text-[14px] font-semibold text-[#0E0F10] disabled:opacity-40"
                    initial="rest" animate="rest"
                    whileHover={titulo.trim() && !loading ? "hovered" : "rest"}
                    whileTap={{ scale: 0.96 }}
                    variants={{ rest: { scale: 1, backgroundColor: "#D7FF00" }, hovered: { scale: 1.02, backgroundColor: "#DFFF33" } }}>
                    {loading ? "Criando..." : "Criar Pedido"}
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
