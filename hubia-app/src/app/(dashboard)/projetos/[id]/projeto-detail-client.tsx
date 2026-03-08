"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, FolderKanban, ClipboardList, ExternalLink, TrendingUp,
  CheckSquare, FileText, Rocket, CheckCircle2, Square, Lightbulb,
  Activity, Edit3, Save, X, Plus, Code2, Globe, Zap, BarChart3,
  Calendar, Users, GitBranch,
} from "lucide-react";
import { HubiaSelect } from "@/components/ui/hubia-select";
import { toast } from "@/components/ui/hubia-toast";
import { updateProjetoStatus } from "../actions";
import type { ProjetoDetail } from "../actions";
import type { ProjetoStatus } from "@prisma/client";

// ─── Constantes ───────────────────────────────────────────────────────────────

const STATUS_PALETTE: Record<ProjetoStatus, { bg: string; text: string; dot: string; label: string }> = {
  ativo:      { bg: "#F0FF80", text: "#5A6600", dot: "#A8C800", label: "Ativo" },
  pausado:    { bg: "#FFF0E0", text: "#A05500", dot: "#FB8C00", label: "Pausado" },
  concluido:  { bg: "#E6F4EA", text: "#2E7D32", dot: "#43A047", label: "Concluído" },
  cancelado:  { bg: "#FDECEA", text: "#C62828", dot: "#E53935", label: "Cancelado" },
};

const PEDIDO_STATUS_PALETTE: Record<string, { bg: string; text: string; dot: string }> = {
  rascunho:     { bg: "#F0F0EE", text: "#6B6C68", dot: "#A9AAA5" },
  aguardando:   { bg: "#F0EFFF", text: "#5B52C7", dot: "#7C6AF7" },
  em_andamento: { bg: "#F0FF80", text: "#5A6600", dot: "#A8C800" },
  revisao:      { bg: "#FFF0E0", text: "#A05500", dot: "#FB8C00" },
  aprovado:     { bg: "#E6F4EA", text: "#2E7D32", dot: "#43A047" },
  entregue:     { bg: "#E8E8E8", text: "#0E0F10", dot: "#0E0F10" },
  cancelado:    { bg: "#FDECEA", text: "#C62828", dot: "#E53935" },
};

const PEDIDO_STATUS_LABELS: Record<string, string> = {
  rascunho: "Backlog", aguardando: "Aguardando", em_andamento: "Em Progresso",
  revisao: "Revisão", aprovado: "Aprovado", entregue: "Concluído", cancelado: "Cancelado",
};

const SQUAD_COLORS: Record<string, string> = {
  "Dev Squad": "#0E0F10",
  "Audiovisual Squad": "#7C6AF7",
  "Marketing": "#43A047",
  "Outro": "#A9AAA5",
};

// Tabs dinâmicas baseadas no squad do projeto
function getTabsParaSquad(meta: Record<string, unknown>): { id: string; label: string }[] {
  const squad = String(meta.squad ?? "Outro");
  if (squad.includes("Dev")) {
    return [
      { id: "geral", label: "Visão Geral" },
      { id: "arquitetura", label: "Arquitetura" },
      { id: "tarefas", label: "Tarefas" },
      { id: "decisoes", label: "Decisões" },
      { id: "pedidos", label: "Pedidos" },
      { id: "deploy", label: "Deploy" },
      { id: "timeline", label: "Timeline" },
    ];
  }
  if (squad.includes("Audiovisual")) {
    return [
      { id: "geral", label: "Visão Geral" },
      { id: "tarefas", label: "Tarefas" },
      { id: "decisoes", label: "Decisões" },
      { id: "posts", label: "Posts" },
      { id: "pedidos", label: "Pedidos" },
      { id: "aprovacao", label: "Aprovação" },
    ];
  }
  return [
    { id: "geral", label: "Visão Geral" },
    { id: "tarefas", label: "Tarefas" },
    { id: "decisoes", label: "Decisões" },
    { id: "pedidos", label: "Pedidos" },
  ];
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

function StatusBadge({ status, small }: { status: ProjetoStatus; small?: boolean }) {
  const p = STATUS_PALETTE[status];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-[6px] font-bold uppercase tracking-wide"
      style={{
        backgroundColor: p.bg, color: p.text,
        fontSize: small ? 9 : 11,
        padding: small ? "2px 6px" : "3px 9px",
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.dot }} />
      {p.label}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProjetoDetailClient({
  projeto: initial,
  organizationId,
}: {
  projeto: ProjetoDetail;
  organizationId: string;
}) {
  const router = useRouter();
  const [projeto, setProjeto] = useState(initial);

  const meta = (projeto.metadata ?? {}) as Record<string, unknown>;
  const tabs = getTabsParaSquad(meta);
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  // Pill de tabs
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const [tabPillLeft, setTabPillLeft] = useState(0);
  const [tabPillWidth, setTabPillWidth] = useState(100);

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

  const handleStatus = async (status: ProjetoStatus) => {
    const result = await updateProjetoStatus(organizationId, projeto.id, status);
    if (!result.ok) { toast.error(result.error ?? "Erro"); return; }
    setProjeto((p) => ({ ...p, status }));
    toast.success("Status do projeto atualizado.");
  };

  // Dados do metadata
  const tarefas = Array.isArray(meta.tarefas)
    ? meta.tarefas as { id: number; titulo: string; concluido: boolean }[]
    : [];
  const tarefasConcluidas = tarefas.filter((t) => t.concluido).length;
  const progresso = Number(meta.progresso ?? (tarefas.length > 0 ? Math.round((tarefasConcluidas / tarefas.length) * 100) : 0));
  const decisoes = Array.isArray(meta.decisoes)
    ? meta.decisoes as { titulo: string; desc?: string; data?: string }[]
    : [];
  const stack = Array.isArray(meta.stack) ? meta.stack as string[] : [];
  const squad = String(meta.squad ?? "Outro");
  const squadColor = SQUAD_COLORS[squad] ?? "#A9AAA5";

  const kpis = [
    { label: "Progresso", value: `${progresso}%`, icon: TrendingUp, bg: "#F5FFB8", color: "#5A6600" },
    { label: "Tarefas", value: `${tarefasConcluidas}/${tarefas.length || "?"}`, icon: CheckSquare, bg: "#E6F4EA", color: "#2E7D32" },
    {
      label: String(meta.squad ?? "").includes("Dev") ? "Módulos" : "Posts",
      value: String(meta.modulos ?? meta.posts ?? projeto.pedidosCount ?? "—"),
      icon: FileText, bg: "#F3F0FF", color: "#5B52C7",
    },
    {
      label: String(meta.squad ?? "").includes("Dev") ? "Telas" : "Imagens",
      value: String(meta.telas ?? meta.imagens ?? "—"),
      icon: Rocket, bg: "#E3F2FD", color: "#0277BD",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <motion.button onClick={() => router.push("/projetos")}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-[#A9AAA5]"
          whileHover={{ color: "#0E0F10", x: -2 }} whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}>
          <ArrowLeft size={14} /> Projetos
        </motion.button>
        <span className="text-[#D4D5D6]">/</span>
        <span className="text-[13px] font-semibold text-[#0E0F10] truncate max-w-[280px]">{projeto.nome}</span>
      </div>

      {/* Layout 2 colunas */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        {/* ─── Coluna principal ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Header card */}
          <div className="rounded-[20px] bg-white p-6">
            <div className="flex items-start gap-4 mb-5">
              {/* Ícone do projeto */}
              <div
                className="flex-shrink-0 h-12 w-12 rounded-[16px] flex items-center justify-center"
                style={{ backgroundColor: `${squadColor}18`, color: squadColor }}
              >
                <FolderKanban size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className="rounded-[5px] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                    style={{ backgroundColor: `${squadColor}18`, color: squadColor }}
                  >
                    {squad}
                  </span>
                  {meta.prioridade && (
                    <span className="text-[11px] text-[#A9AAA5]">· Prioridade {String(meta.prioridade)}</span>
                  )}
                  {meta.deadline && (
                    <span className="text-[11px] text-[#A9AAA5] flex items-center gap-1">
                      · <Calendar size={10} /> {String(meta.deadline)}
                    </span>
                  )}
                </div>
                <h1 className="text-[24px] font-bold text-[#0E0F10] leading-tight">{projeto.nome}</h1>
                {projeto.descricao && (
                  <p className="mt-0.5 text-[13px] text-[#5E5E5F] leading-relaxed">{projeto.descricao}</p>
                )}
              </div>
              <StatusBadge status={projeto.status} />
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
              {kpis.map((kpi, i) => (
                <motion.div
                  key={kpi.label}
                  className="rounded-[14px] p-3.5"
                  style={{ backgroundColor: kpi.bg }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <kpi.icon size={12} style={{ color: kpi.color }} />
                    <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: kpi.color }}>{kpi.label}</span>
                  </div>
                  <span className="text-[26px] font-bold text-[#0E0F10]">{kpi.value}</span>
                  {kpi.label === "Progresso" && (
                    <div className="mt-2 h-1.5 rounded-full bg-white/60 overflow-hidden">
                      <motion.div className="h-full rounded-full bg-[#A8C800]"
                        initial={{ width: 0 }} animate={{ width: `${progresso}%` }}
                        transition={{ duration: 0.9, ease: [0, 0, 0.2, 1], delay: 0.4 }} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="rounded-[20px] bg-white overflow-hidden">
            <div ref={tabContainerRef} className="relative flex overflow-x-auto border-b border-[#EEEFE9]">
              <motion.div aria-hidden
                className="pointer-events-none absolute bottom-0 h-[2px] rounded-t-[2px] bg-[#0E0F10]"
                animate={{ left: tabPillLeft, width: tabPillWidth }}
                transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.8 }}
              />
              {tabs.map((tab, i) => (
                <motion.button
                  key={tab.id}
                  ref={(el) => { tabRefs.current[i] = el; }}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex-shrink-0 px-5 py-3.5 text-[13px] font-semibold whitespace-nowrap"
                  animate={{ color: activeTab === tab.id ? "#0E0F10" : "#A9AAA5" }}
                  initial={false}
                  whileTap={{ scale: 0.97 }}
                >
                  {tab.label}
                  {tab.id === "pedidos" && projeto.pedidosCount > 0 && (
                    <span className="ml-1.5 rounded-full bg-[#EEEFE9] px-1.5 py-0.5 text-[9px] font-bold text-[#5E5E5F]">
                      {projeto.pedidosCount}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
                >
                  <ProjetoTabConteudo
                    tab={activeTab}
                    projeto={projeto}
                    meta={meta}
                    tarefas={tarefas}
                    tarefasConcluidas={tarefasConcluidas}
                    decisoes={decisoes}
                    stack={stack}
                    onNavigatePedido={(id) => router.push(`/pedidos/${id}`)}
                    organizationId={organizationId}
                    onMetaUpdate={(newMeta) => setProjeto(p => ({ ...p, metadata: newMeta }))}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ─── Coluna lateral ───────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {/* Alterar status */}
          <div className="rounded-[16px] bg-white p-5 flex flex-col gap-3">
            <p className="text-[11px] font-bold text-[#A9AAA5] uppercase tracking-wide">Status do Projeto</p>
            <HubiaSelect
              value={projeto.status}
              onChange={(v) => handleStatus(v as ProjetoStatus)}
              options={Object.entries(STATUS_PALETTE).map(([v, p]) => ({ value: v, label: p.label }))}
            />
          </div>

          {/* Detalhes */}
          <div className="rounded-[16px] bg-white p-5 flex flex-col gap-3.5">
            <p className="text-[11px] font-bold text-[#A9AAA5] uppercase tracking-wide">Detalhes</p>
            <MetaRow label="Squad" value={
              <span className="text-[13px] font-semibold" style={{ color: squadColor }}>{squad}</span>
            } />
            {meta.prioridade && <MetaRow label="Prioridade" value={String(meta.prioridade)} />}
            {meta.deadline && <MetaRow label="Prazo" value={String(meta.deadline)} />}
            {meta.version && <MetaRow label="Versão" value={String(meta.version)} />}
            {meta.objetivo && (
              <div>
                <p className="text-[11px] text-[#A9AAA5] mb-1">Objetivo</p>
                <p className="text-[13px] text-[#0E0F10] leading-relaxed">{String(meta.objetivo)}</p>
              </div>
            )}
            <MetaRow label="Criado em" value={new Date(projeto.createdAt).toLocaleDateString("pt-BR")} />
            <MetaRow label="Pedidos" value={String(projeto.pedidosCount)} />
          </div>

          {/* Stack (se Dev) */}
          {stack.length > 0 && (
            <div className="rounded-[16px] bg-white p-5 flex flex-col gap-3">
              <p className="text-[11px] font-bold text-[#A9AAA5] uppercase tracking-wide flex items-center gap-1.5">
                <Code2 size={11} /> Stack
              </p>
              <div className="flex flex-wrap gap-1.5">
                {stack.map((tech) => (
                  <span key={tech} className="rounded-[7px] bg-[#0E0F10] px-2.5 py-1 text-[11px] font-bold text-[#D7FF00]">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Progresso resumido */}
          <div className="rounded-[16px] bg-white p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-[#A9AAA5] uppercase tracking-wide flex items-center gap-1.5">
                <BarChart3 size={11} /> Progresso
              </p>
              <span className="text-[13px] font-bold text-[#0E0F10]">{progresso}%</span>
            </div>
            <div className="h-2 rounded-full bg-[#EEEFE9] overflow-hidden">
              <motion.div className="h-full rounded-full bg-[#A8C800]"
                initial={{ width: 0 }} animate={{ width: `${progresso}%` }}
                transition={{ duration: 0.9, ease: [0, 0, 0.2, 1] }} />
            </div>
            {tarefas.length > 0 && (
              <p className="text-[11px] text-[#A9AAA5]">{tarefasConcluidas} de {tarefas.length} tarefas concluídas</p>
            )}
          </div>

          {/* Figma link se existir */}
          {meta.figmaUrl && (
            <motion.a
              href={String(meta.figmaUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[16px] bg-white p-4 flex items-center gap-3"
              whileHover={{ backgroundColor: "#EEEFE9" }} whileTap={{ scale: 0.99 }}
            >
              <div className="h-8 w-8 rounded-[10px] bg-[#1E1E1E] flex items-center justify-center flex-shrink-0">
                <Globe size={15} color="#FFFFFF" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-[#0E0F10]">Figma</p>
                <p className="text-[10px] text-[#A9AAA5] truncate">Abrir arquivo de design</p>
              </div>
              <ExternalLink size={12} color="#A9AAA5" />
            </motion.a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TabConteudo do Projeto ───────────────────────────────────────────────────

function ProjetoTabConteudo({
  tab, projeto, meta, tarefas, tarefasConcluidas, decisoes, stack,
  onNavigatePedido, organizationId, onMetaUpdate,
}: {
  tab: string;
  projeto: ProjetoDetail;
  meta: Record<string, unknown>;
  tarefas: { id: number; titulo: string; concluido: boolean }[];
  tarefasConcluidas: number;
  decisoes: { titulo: string; desc?: string; data?: string }[];
  stack: string[];
  onNavigatePedido: (id: string) => void;
  organizationId: string;
  onMetaUpdate: (m: Record<string, unknown>) => void;
}) {
  if (tab === "geral") {
    return (
      <div className="flex flex-col gap-5">
        {/* Objetivo */}
        {meta.objetivo && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5] mb-2">Objetivo</p>
            <p className="text-[14px] text-[#0E0F10] leading-relaxed">{String(meta.objetivo)}</p>
          </div>
        )}

        {/* Stack */}
        {stack.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5] mb-2">Stack</p>
            <div className="flex flex-wrap gap-1.5">
              {stack.map((tech) => (
                <span key={tech} className="rounded-[8px] bg-[#0E0F10] px-3 py-1.5 text-[12px] font-bold text-[#D7FF00]">{tech}</span>
              ))}
            </div>
          </div>
        )}

        {/* Decisões recentes */}
        {decisoes.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5] mb-2">Decisões recentes</p>
            <div className="flex flex-col gap-2">
              {decisoes.slice(0, 3).map((dec, i) => (
                <motion.div key={i} className="rounded-[12px] bg-[#FFFDE7] p-3.5"
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}>
                  <div className="flex items-start gap-2">
                    <Lightbulb size={13} color="#FB8C00" className="mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[13px] font-semibold text-[#0E0F10]">{dec.titulo}</p>
                      {dec.desc && <p className="text-[12px] text-[#5E5E5F] mt-0.5">{dec.desc}</p>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Stats de pedidos */}
        {projeto.pedidosCount > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5] mb-2">Pedidos por status</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(projeto.pedidosPorStatus).map(([s, c]) => {
                const p = PEDIDO_STATUS_PALETTE[s] ?? { bg: "#EEEFE9", text: "#5E5E5F", dot: "#A9AAA5" };
                return (
                  <span key={s} className="inline-flex items-center gap-1 rounded-[8px] px-2.5 py-1 text-[12px] font-semibold"
                    style={{ backgroundColor: p.bg, color: p.text }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.dot }} />
                    {c} {PEDIDO_STATUS_LABELS[s] ?? s.replace("_", " ")}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (tab === "arquitetura") {
    return (
      <div className="flex flex-col gap-4">
        {meta.figmaUrl && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5] mb-2">Design</p>
            <motion.a
              href={String(meta.figmaUrl)} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[12px] bg-[#1E1E1E] px-4 py-2.5 text-[13px] font-semibold text-white"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Globe size={14} /> Abrir no Figma <ExternalLink size={11} />
            </motion.a>
          </div>
        )}
        {stack.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5] mb-2">Stack técnica</p>
            <div className="grid grid-cols-2 gap-2">
              {stack.map((tech) => (
                <div key={tech} className="rounded-[10px] bg-[#EEEFE9] px-3 py-2.5 flex items-center gap-2">
                  <Code2 size={14} color="#5E5E5F" />
                  <span className="text-[13px] font-semibold text-[#0E0F10]">{tech}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {stack.length === 0 && !meta.figmaUrl && (
          <EmptyState icon={GitBranch} text="Arquitetura será definida ao iniciar o projeto." />
        )}
      </div>
    );
  }

  if (tab === "tarefas") {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">
            {tarefas.length > 0 ? `${tarefasConcluidas} de ${tarefas.length} concluídas` : "Sem tarefas"}
          </p>
        </div>
        {tarefas.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {tarefas.map((t, i) => (
              <motion.div key={t.id} className="flex items-center gap-3 rounded-[10px] px-3 py-2.5"
                style={{ backgroundColor: t.concluido ? "#E6F4EA" : "#FAFAFA" }}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}>
                {t.concluido ? <CheckCircle2 size={16} color="#43A047" /> : <Square size={16} color="#A9AAA5" />}
                <span className="text-[13px] font-semibold flex-1"
                  style={{ color: t.concluido ? "#2E7D32" : "#0E0F10",
                    textDecoration: t.concluido ? "line-through" : "none" }}>
                  {t.titulo}
                </span>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState icon={CheckSquare} text="As tarefas serão definidas no início do projeto." />
        )}
      </div>
    );
  }

  if (tab === "decisoes") {
    return (
      <div className="flex flex-col gap-3">
        {decisoes.length > 0 ? decisoes.map((dec, i) => (
          <motion.div key={i} className="rounded-[12px] bg-[#FFFDE7] p-4"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}>
            <div className="flex items-start gap-2.5">
              <Lightbulb size={15} color="#FB8C00" className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[14px] font-semibold text-[#0E0F10]">{dec.titulo}</p>
                {dec.desc && <p className="text-[13px] text-[#5E5E5F] mt-0.5">{dec.desc}</p>}
                {dec.data && <p className="text-[11px] text-[#A9AAA5] mt-1">{dec.data}</p>}
              </div>
            </div>
          </motion.div>
        )) : (
          <EmptyState icon={Lightbulb} text="Decisões serão registradas ao longo do projeto." />
        )}
      </div>
    );
  }

  if (tab === "pedidos" || tab === "posts") {
    if (projeto.pedidos.length === 0) {
      return <EmptyState icon={ClipboardList} text="Nenhum pedido vinculado a este projeto ainda." />;
    }
    return (
      <div className="flex flex-col gap-1.5">
        {projeto.pedidos.map((p, i) => {
          const palette = PEDIDO_STATUS_PALETTE[p.status] ?? { bg: "#EEEFE9", text: "#5E5E5F", dot: "#A9AAA5" };
          return (
            <motion.div key={p.id}
              className="cursor-pointer rounded-[14px] bg-[#FAFAFA] px-4 py-3.5 flex items-center gap-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.25) }}
              whileHover={{ backgroundColor: "#F3F3F1", y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onNavigatePedido(p.id)}>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#0E0F10] truncate">{p.titulo}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-[#A9AAA5]">{p.tipo.replace("_", " ")}</span>
                  {p.creator && <span className="text-[11px] text-[#A9AAA5]">· {p.creator.name}</span>}
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-[6px] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide flex-shrink-0"
                style={{ backgroundColor: palette.bg, color: palette.text }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: palette.dot }} />
                {PEDIDO_STATUS_LABELS[p.status] ?? p.status}
              </span>
              <ExternalLink size={12} color="#A9AAA5" className="flex-shrink-0" />
            </motion.div>
          );
        })}
      </div>
    );
  }

  return <EmptyState icon={Rocket} text="Esta etapa será preenchida conforme o projeto avança." />;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[12px] text-[#A9AAA5] flex-shrink-0">{label}</span>
      {typeof value === "string" ? (
        <span className="text-[13px] font-semibold text-[#0E0F10] capitalize text-right">{value}</span>
      ) : value}
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <Icon size={24} color="#A9AAA5" />
      <p className="text-[13px] text-[#A9AAA5] max-w-[240px] leading-relaxed">{text}</p>
    </div>
  );
}
