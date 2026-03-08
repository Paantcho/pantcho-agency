"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, FolderKanban, ClipboardList, ExternalLink, TrendingUp,
  CheckSquare, FileText, Rocket, CheckCircle2, Square, Lightbulb,
  BarChart3, Code2, Globe, GitBranch, Users, Brain, ShieldCheck,
  History, Puzzle, Zap, Eye, Edit3, Save, X, Plus,
  CalendarDays, Tag, Star,
} from "lucide-react";
import { HubiaSelect } from "@/components/ui/hubia-select";
import { toast } from "@/components/ui/hubia-toast";
import { updateProjetoStatus, updateProjetoMetadata } from "../actions";
import type { ProjetoDetail } from "../actions";
import type { ProjetoStatus, ProjetoTipo } from "@prisma/client";

// ─── Tipo Config (duplicado do client para uso standalone) ───────────────────

type TipoConfig = {
  label: string; cor: string; squad: string;
  modulos: string[]; icone: React.ElementType;
};

const TIPO_CONFIG: Record<ProjetoTipo, TipoConfig> = {
  creator:      { label: "Creator",            cor: "#7C6AF7", squad: "Audiovisual Squad", icone: Users,       modulos: ["Identidade","Aparência","Tom de Voz","Ambientes","Regras","Conteúdo","Assets","Memória"] },
  landing_page: { label: "Landing Page",       cor: "#0E0F10", squad: "Dev Squad",         icone: Globe,       modulos: ["Briefing","Arquitetura","Design","Conteúdo","Dev","Deploy","Analytics"] },
  hotsite:      { label: "Hotsite",            cor: "#0E0F10", squad: "Dev Squad",         icone: Globe,       modulos: ["Briefing","Design","Conteúdo","Dev","Deploy"] },
  microsite:    { label: "Microsite",          cor: "#0E0F10", squad: "Dev Squad",         icone: Globe,       modulos: ["Briefing","Arquitetura","Conteúdo","Dev","Deploy"] },
  app:          { label: "App",                cor: "#1565C0", squad: "Dev Squad",         icone: Puzzle,      modulos: ["Contexto","PRD","Arquitetura","Design","Frontend","Backend","Deploy","Observabilidade"] },
  saas:         { label: "SaaS",               cor: "#1565C0", squad: "Dev Squad",         icone: Zap,         modulos: ["Contexto","PRD","Arquitetura","Banco","Auth","Frontend","Backend","Integrações","Deploy","Observabilidade","Rules"] },
  sistema:      { label: "Sistema Web",        cor: "#1565C0", squad: "Dev Squad",         icone: Code2,       modulos: ["PRD","Arquitetura","Banco","Frontend","Backend","Deploy"] },
  ferramenta:   { label: "Ferramenta Interna", cor: "#5E5E5F", squad: "Dev Squad",         icone: Code2,       modulos: ["Contexto","Requisitos","Dev","Docs"] },
  conteudo:     { label: "Grade de Conteúdo",  cor: "#43A047", squad: "Audiovisual Squad", icone: CalendarDays,modulos: ["Briefing","Calendário","Peças","Copies","Referências","Aprovações"] },
  campanha:     { label: "Campanha",           cor: "#43A047", squad: "Audiovisual Squad", icone: Star,        modulos: ["Briefing","Conceito","Público","Peças","Copies","Aprovações"] },
  branding:     { label: "Branding",           cor: "#FB8C00", squad: "Audiovisual Squad", icone: Tag,         modulos: ["Contexto","Conceito","Referências","Exploração","Assets","Apresentações"] },
  mockup:       { label: "Mockup",             cor: "#FB8C00", squad: "Audiovisual Squad", icone: Eye,         modulos: ["Contexto","Referências","Exploração","Assets"] },
  documentacao: { label: "Documentação",       cor: "#5E5E5F", squad: "Dev Squad",         icone: FileText,    modulos: ["Contexto","Estrutura","Documentos","Versionamento"] },
  operacao:     { label: "Operação",           cor: "#7C6AF7", squad: "Multi-Squad",       icone: Users,       modulos: ["Contexto","Tarefas","Times","Aprovações","Memória","Log"] },
  outro:        { label: "Outro",              cor: "#A9AAA5", squad: "A definir",         icone: FolderKanban,modulos: ["Visão Geral","Tarefas","Memória","Log"] },
};

// Tabs por tipo
function getTabsParaTipo(tipo: ProjetoTipo): { id: string; label: string }[] {
  const base = [
    { id: "geral",    label: "Visão Geral" },
    { id: "contexto", label: "Contexto" },
    { id: "tarefas",  label: "Tarefas" },
    { id: "pedidos",  label: "Pedidos" },
    { id: "memoria",  label: "Memória" },
    { id: "rules",    label: "Rules" },
    { id: "log",      label: "Log" },
  ];

  const extras: Record<ProjetoTipo, { id: string; label: string }[]> = {
    creator:      [{ id: "identidade", label: "Identidade" }, { id: "aparencia", label: "Aparência" }, { id: "voz", label: "Tom de Voz" }],
    landing_page: [{ id: "arquitetura", label: "Arquitetura" }, { id: "design", label: "Design" }, { id: "deploy", label: "Deploy" }],
    hotsite:      [{ id: "design", label: "Design" }, { id: "deploy", label: "Deploy" }],
    microsite:    [{ id: "arquitetura", label: "Arquitetura" }, { id: "deploy", label: "Deploy" }],
    app:          [{ id: "prd", label: "PRD" }, { id: "arquitetura", label: "Arquitetura" }, { id: "design", label: "Design" }, { id: "deploy", label: "Deploy" }],
    saas:         [{ id: "prd", label: "PRD" }, { id: "arquitetura", label: "Arquitetura" }, { id: "banco", label: "Banco" }, { id: "integracoes", label: "Integrações" }, { id: "deploy", label: "Deploy" }],
    sistema:      [{ id: "prd", label: "PRD" }, { id: "arquitetura", label: "Arquitetura" }, { id: "deploy", label: "Deploy" }],
    ferramenta:   [{ id: "requisitos", label: "Requisitos" }],
    conteudo:     [{ id: "calendario", label: "Calendário" }, { id: "pecas", label: "Peças" }],
    campanha:     [{ id: "conceito", label: "Conceito" }, { id: "pecas", label: "Peças" }],
    branding:     [{ id: "conceito", label: "Conceito" }, { id: "assets", label: "Assets" }],
    mockup:       [{ id: "exploracao", label: "Exploração" }],
    documentacao: [{ id: "estrutura", label: "Estrutura" }],
    operacao:     [{ id: "times", label: "Times" }, { id: "aprovacoes", label: "Aprovações" }],
    outro:        [],
  };

  // Montar array: base + extras intercalados
  const result = [base[0]]; // Visão Geral
  const extrasTipo = extras[tipo] ?? [];
  if (extrasTipo.length > 0) result.push(...extrasTipo);
  result.push(base[1]); // Contexto
  result.push(base[2]); // Tarefas
  result.push(base[3]); // Pedidos
  result.push(base[4]); // Memória
  result.push(base[5]); // Rules
  result.push(base[6]); // Log
  return result;
}

// ─── Paletas ──────────────────────────────────────────────────────────────────

const STATUS_PALETTE: Record<ProjetoStatus, { bg: string; text: string; dot: string; label: string }> = {
  ativo:     { bg: "#F0FF80", text: "#5A6600", dot: "#A8C800", label: "Ativo" },
  pausado:   { bg: "#FFF0E0", text: "#A05500", dot: "#FB8C00", label: "Pausado" },
  concluido: { bg: "#E6F4EA", text: "#2E7D32", dot: "#43A047", label: "Concluído" },
  cancelado: { bg: "#FDECEA", text: "#C62828", dot: "#E53935", label: "Cancelado" },
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

  const tipo = projeto.tipo as ProjetoTipo;
  const tipoConfig = TIPO_CONFIG[tipo] ?? TIPO_CONFIG.outro;
  const meta = (projeto.metadata ?? {}) as Record<string, unknown>;
  const tabs = getTabsParaTipo(tipo);

  const [activeTab, setActiveTab] = useState(tabs[0].id);
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
    toast.success("Status atualizado.");
  };

  const handleMetaUpdate = async (section: string, value: unknown) => {
    const result = await updateProjetoMetadata(organizationId, projeto.id, section, value);
    if (!result.ok) { toast.error(result.error ?? "Erro"); return; }
    setProjeto((p) => ({ ...p, metadata: { ...((p.metadata ?? {}) as Record<string, unknown>), [section]: value } }));
  };

  // Dados derivados
  const tarefas = Array.isArray(meta.tarefas) ? meta.tarefas as { id: number; titulo: string; concluido: boolean }[] : [];
  const tarefasConcluidas = tarefas.filter((t) => t.concluido).length;
  const progresso = Number(meta.progresso ?? (tarefas.length > 0 ? Math.round((tarefasConcluidas / tarefas.length) * 100) : 0));
  const decisoes = Array.isArray(meta.decisoes) ? meta.decisoes as { titulo: string; desc?: string; data?: string }[] : [];
  const stack = Array.isArray(meta.stack) ? meta.stack as string[] : [];
  const memoria = Array.isArray(meta.memoria) ? meta.memoria as { texto: string; data?: string }[] : [];
  const rules = Array.isArray(meta.rules) ? meta.rules as { regra: string }[] : [];
  const log = Array.isArray(meta.log) ? meta.log as { acao: string; data?: string }[] : [];
  const integracoes = Array.isArray(meta.integracoes) ? meta.integracoes as string[] : tipoConfig.modulos;

  const kpis = [
    { label: "Progresso",  value: `${progresso}%`,                             icon: TrendingUp,  bg: "#F5FFB8", cor: "#5A6600" },
    { label: "Tarefas",    value: `${tarefasConcluidas}/${tarefas.length||"?"}`,icon: CheckSquare, bg: "#E6F4EA", cor: "#2E7D32" },
    { label: "Pedidos",    value: String(projeto.pedidosCount),                 icon: ClipboardList,bg: "#F3F0FF",cor: "#5B52C7" },
    { label: "Módulos",    value: String(tipoConfig.modulos.length),            icon: Puzzle,      bg: "#E3F2FD", cor: "#0277BD" },
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        {/* ─── Coluna principal ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Header card */}
          <div className="rounded-[20px] bg-white p-6">
            <div className="flex items-start gap-4 mb-5">
              <div
                className="flex-shrink-0 h-12 w-12 rounded-[16px] flex items-center justify-center"
                style={{ backgroundColor: `${tipoConfig.cor}18`, color: tipoConfig.cor }}
              >
                <tipoConfig.icone size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className="rounded-[5px] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                    style={{ backgroundColor: `${tipoConfig.cor}18`, color: tipoConfig.cor }}
                  >
                    {tipoConfig.label}
                  </span>
                  <span className="text-[11px] text-[#A9AAA5]">· {tipoConfig.squad}</span>
                  {!!meta.prazo && (
                    <span className="text-[11px] text-[#A9AAA5] flex items-center gap-1">
                      · <CalendarDays size={10} /> {String(meta.prazo)}
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
                <motion.div key={kpi.label}
                  className="rounded-[14px] p-3.5"
                  style={{ backgroundColor: kpi.bg }}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <kpi.icon size={12} style={{ color: kpi.cor }} />
                    <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: kpi.cor }}>{kpi.label}</span>
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

          {/* Tabs card */}
          <div className="rounded-[20px] bg-white overflow-hidden">
            <div ref={tabContainerRef} className="relative flex overflow-x-auto border-b border-[#EEEFE9] scrollbar-none">
              <motion.div aria-hidden
                className="pointer-events-none absolute bottom-0 h-[2px] rounded-t-[2px] bg-[#0E0F10]"
                animate={{ left: tabPillLeft, width: tabPillWidth }}
                transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.8 }}
              />
              {tabs.map((tab, i) => (
                <motion.button key={tab.id}
                  ref={(el) => { tabRefs.current[i] = el; }}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex-shrink-0 px-5 py-3.5 text-[13px] font-semibold whitespace-nowrap"
                  animate={{ color: activeTab === tab.id ? "#0E0F10" : "#A9AAA5" }}
                  initial={false} whileTap={{ scale: 0.97 }}>
                  {tab.label}
                  {tab.id === "pedidos" && projeto.pedidosCount > 0 && (
                    <span className="ml-1.5 rounded-full bg-[#EEEFE9] px-1.5 py-0.5 text-[9px] font-bold text-[#5E5E5F]">
                      {projeto.pedidosCount}
                    </span>
                  )}
                  {tab.id === "tarefas" && tarefas.length > 0 && (
                    <span className="ml-1.5 rounded-full bg-[#EEEFE9] px-1.5 py-0.5 text-[9px] font-bold text-[#5E5E5F]">
                      {tarefasConcluidas}/{tarefas.length}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div key={activeTab}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}>
                  <TabConteudo
                    tab={activeTab} tipo={tipo} projeto={projeto} meta={meta}
                    tarefas={tarefas} tarefasConcluidas={tarefasConcluidas}
                    decisoes={decisoes} stack={stack} memoria={memoria} rules={rules} log={log}
                    progresso={progresso}
                    onNavigatePedido={(id) => router.push(`/pedidos/${id}`)}
                    onMetaUpdate={handleMetaUpdate}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ─── Coluna lateral ───────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {/* Status */}
          <div className="rounded-[16px] bg-white p-5 flex flex-col gap-3">
            <p className="text-[11px] font-bold text-[#A9AAA5] uppercase tracking-wide">Status</p>
            <HubiaSelect
              value={projeto.status}
              onChange={(v) => handleStatus(v as ProjetoStatus)}
              options={Object.entries(STATUS_PALETTE).map(([v, p]) => ({ value: v, label: p.label }))}
            />
          </div>

          {/* Detalhes */}
          <div className="rounded-[16px] bg-white p-5 flex flex-col gap-3.5">
            <p className="text-[11px] font-bold text-[#A9AAA5] uppercase tracking-wide">Detalhes</p>
            <MetaRow label="Tipo" value={
              <span className="text-[12px] font-bold px-2 py-0.5 rounded-[5px]"
                style={{ backgroundColor: `${tipoConfig.cor}15`, color: tipoConfig.cor }}>
                {tipoConfig.label}
              </span>
            } />
            <MetaRow label="Squad" value={<span className="text-[13px] font-semibold text-[#0E0F10]">{tipoConfig.squad}</span>} />
            {!!meta.prazo && <MetaRow label="Prazo" value={String(meta.prazo)} />}
            {!!meta.objetivo ? (
              <div>
                <p className="text-[11px] text-[#A9AAA5] mb-1">Objetivo</p>
                <p className="text-[12px] text-[#0E0F10] leading-relaxed">{String(meta.objetivo)}</p>
              </div>
            ) : null}
            <MetaRow label="Criado em" value={new Date(projeto.createdAt).toLocaleDateString("pt-BR")} />
          </div>

          {/* Progresso */}
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
            {tarefas.length > 0 ? (
              <p className="text-[11px] text-[#A9AAA5]">{tarefasConcluidas} de {tarefas.length} tarefas</p>
            ) : null}
          </div>

          {/* Stack (se Dev) */}
          {stack.length > 0 && (
            <div className="rounded-[16px] bg-white p-5 flex flex-col gap-3">
              <p className="text-[11px] font-bold text-[#A9AAA5] uppercase tracking-wide flex items-center gap-1.5">
                <Code2 size={11} /> Stack
              </p>
              <div className="flex flex-wrap gap-1.5">
                {stack.map((tech) => (
                  <span key={tech} className="rounded-[7px] bg-[#0E0F10] px-2.5 py-1 text-[11px] font-bold text-[#D7FF00]">{tech}</span>
                ))}
              </div>
            </div>
          )}

          {/* Módulos ativos */}
          <div className="rounded-[16px] bg-white p-5 flex flex-col gap-3">
            <p className="text-[11px] font-bold text-[#A9AAA5] uppercase tracking-wide flex items-center gap-1.5">
              <Puzzle size={11} /> Módulos
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tipoConfig.modulos.map((m) => (
                <span key={m} className="rounded-[6px] px-2 py-0.5 text-[10px] font-semibold"
                  style={{ backgroundColor: `${tipoConfig.cor}10`, color: tipoConfig.cor }}>
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Figma link */}
          {!!meta.figmaUrl ? (
            <motion.a href={String(meta.figmaUrl)} target="_blank" rel="noopener noreferrer"
              className="rounded-[16px] bg-white p-4 flex items-center gap-3"
              whileHover={{ backgroundColor: "#EEEFE9" }} whileTap={{ scale: 0.99 }}>
              <div className="h-8 w-8 rounded-[10px] bg-[#1E1E1E] flex items-center justify-center flex-shrink-0">
                <Globe size={15} color="#FFFFFF" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-[#0E0F10]">Figma</p>
                <p className="text-[10px] text-[#A9AAA5] truncate">Abrir design</p>
              </div>
              <ExternalLink size={12} color="#A9AAA5" />
            </motion.a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ─── TabConteudo Adaptativo ───────────────────────────────────────────────────

function TabConteudo({
  tab, tipo, projeto, meta, tarefas, tarefasConcluidas, decisoes, stack, memoria, rules, log, progresso,
  onNavigatePedido, onMetaUpdate,
}: {
  tab: string; tipo: ProjetoTipo; projeto: ProjetoDetail; meta: Record<string, unknown>;
  tarefas: { id: number; titulo: string; concluido: boolean }[];
  tarefasConcluidas: number; decisoes: { titulo: string; desc?: string; data?: string }[];
  stack: string[]; memoria: { texto: string; data?: string }[];
  rules: { regra: string }[]; log: { acao: string; data?: string }[];
  progresso: number;
  onNavigatePedido: (id: string) => void;
  onMetaUpdate: (section: string, value: unknown) => Promise<void>;
}) {
  // ── Visão Geral ──────────────────────────────────────────────────────────
  if (tab === "geral") {
    return (
      <div className="flex flex-col gap-5">
        {!!meta.objetivo && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5] mb-2">Objetivo Principal</p>
            <p className="text-[14px] text-[#0E0F10] leading-relaxed">{String(meta.objetivo)}</p>
          </div>
        )}
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
                    {c} {PEDIDO_STATUS_LABELS[s] ?? s}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        {/* Se não há nada ainda */}
        {!meta.objetivo && decisoes.length === 0 && stack.length === 0 && projeto.pedidosCount === 0 && (
          <EmptyState icon={FolderKanban} text="Configure o contexto e adicione tarefas para começar." />
        )}
      </div>
    );
  }

  // ── Contexto ─────────────────────────────────────────────────────────────
  if (tab === "contexto") {
    return (
      <EditableTextSection
        title="Contexto do Projeto"
        fieldKey="contexto"
        value={meta.contexto as string ?? ""}
        placeholder="Descreva o contexto: o que é, por que existe, objetivo de negócio, público alvo, riscos, restrições..."
        onSave={onMetaUpdate}
      />
    );
  }

  // ── PRD ──────────────────────────────────────────────────────────────────
  if (tab === "prd") {
    return (
      <EditableTextSection
        title="Documento de Requisitos (PRD)"
        fieldKey="prd"
        value={meta.prd as string ?? ""}
        placeholder="Visão do produto, casos de uso, requisitos funcionais e não funcionais, critérios de aceite..."
        onSave={onMetaUpdate}
      />
    );
  }

  // ── Arquitetura ──────────────────────────────────────────────────────────
  if (tab === "arquitetura") {
    return (
      <div className="flex flex-col gap-5">
        {!!meta.figmaUrl && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5] mb-2">Design</p>
            <motion.a href={String(meta.figmaUrl)} target="_blank" rel="noopener noreferrer"
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
        <EditableTextSection
          title="Notas de Arquitetura"
          fieldKey="arquitetura_notas"
          value={meta.arquitetura_notas as string ?? ""}
          placeholder="Decisões de arquitetura, diagramas (URL), padrões, serviços, fluxos de dados..."
          onSave={onMetaUpdate}
        />
      </div>
    );
  }

  // ── Design ───────────────────────────────────────────────────────────────
  if (tab === "design") {
    return (
      <div className="flex flex-col gap-4">
        {meta.figmaUrl ? (
          <motion.a href={String(meta.figmaUrl)} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-[14px] bg-[#1E1E1E] px-5 py-4"
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <div className="h-9 w-9 rounded-[10px] bg-white/10 flex items-center justify-center">
              <Globe size={16} color="white" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-white">Figma</p>
              <p className="text-[11px] text-white/50">Abrir arquivo de design</p>
            </div>
            <ExternalLink size={14} color="white" />
          </motion.a>
        ) : (
          <EmptyState icon={Globe} text="Nenhum link de Figma adicionado ainda. Configure nos detalhes do projeto." />
        )}
        <EditableTextSection
          title="Notas de Design"
          fieldKey="design_notas"
          value={meta.design_notas as string ?? ""}
          placeholder="Decisões visuais, componentes, guidelines de UI, referências..."
          onSave={onMetaUpdate}
        />
      </div>
    );
  }

  // ── Deploy ───────────────────────────────────────────────────────────────
  if (tab === "deploy") {
    return (
      <div className="flex flex-col gap-4">
        {[
          { label: "URL de produção", key: "deploy_url" },
          { label: "URL de staging", key: "staging_url" },
          { label: "Repositório GitHub", key: "github_url" },
        ].map(({ label, key }) => meta[key] ? (
          <div key={key}>
            <p className="text-[11px] font-bold text-[#A9AAA5] uppercase tracking-wide mb-1.5">{label}</p>
            <motion.a href={String(meta[key])} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0E0F10] rounded-[8px] bg-[#EEEFE9] px-3 py-1.5"
              whileHover={{ backgroundColor: "#D9D9D4" }}>
              {String(meta[key])} <ExternalLink size={11} />
            </motion.a>
          </div>
        ) : null)}
        <EditableTextSection
          title="Notas de Deploy"
          fieldKey="deploy_notas"
          value={meta.deploy_notas as string ?? ""}
          placeholder="Plataforma de deploy, variáveis de ambiente, domínio, CI/CD, processo de release..."
          onSave={onMetaUpdate}
        />
      </div>
    );
  }

  // ── Banco ────────────────────────────────────────────────────────────────
  if (tab === "banco") {
    return (
      <EditableTextSection
        title="Banco de Dados"
        fieldKey="banco_notas"
        value={meta.banco_notas as string ?? ""}
        placeholder="Entidades, relações, regras de RLS, migrations, estratégia de dados..."
        onSave={onMetaUpdate}
      />
    );
  }

  // ── Integrações ──────────────────────────────────────────────────────────
  if (tab === "integracoes") {
    return (
      <div className="flex flex-col gap-4">
        {typeof meta.integracoes_config === "object" && meta.integracoes_config !== null ? (
          <div className="flex flex-col gap-2">
            {Object.entries(meta.integracoes_config as Record<string, string>).map(([nome, url]) => (
              <div key={nome} className="flex items-center justify-between rounded-[12px] bg-[#FAFAFA] px-4 py-3">
                <span className="text-[13px] font-semibold text-[#0E0F10]">{nome}</span>
                <motion.a href={url} target="_blank" rel="noopener noreferrer"
                  className="text-[11px] text-[#A9AAA5] flex items-center gap-1"
                  whileHover={{ color: "#0E0F10" }}>
                  Abrir <ExternalLink size={10} />
                </motion.a>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <p className="text-[11px] font-bold text-[#A9AAA5] uppercase tracking-wide mb-2">Integrações previstas</p>
            <div className="flex flex-wrap gap-2">
              {TIPO_CONFIG[tipo].modulos.filter((m) => ["Figma","GitHub","Vercel","Supabase","Analytics","Stripe"].includes(m)).concat(
                (meta.integracoes as string[] | undefined) ?? []
              ).map((int) => (
                <span key={int} className="rounded-[8px] bg-[#EEEFE9] px-2.5 py-1 text-[12px] font-semibold text-[#5E5E5F]">{int}</span>
              ))}
            </div>
          </div>
        )}
        <EditableTextSection
          title="Notas de Integrações"
          fieldKey="integracoes_notas"
          value={meta.integracoes_notas as string ?? ""}
          placeholder="Como cada integração se conecta, status, credenciais necessárias..."
          onSave={onMetaUpdate}
        />
      </div>
    );
  }

  // ── Identidade (creator) ─────────────────────────────────────────────────
  if (tab === "identidade") {
    return (
      <EditableTextSection
        title="Identidade da Creator"
        fieldKey="identidade"
        value={meta.identidade as string ?? ""}
        placeholder="Quem é, personalidade, valores, história, missão narrativa, forma de ser..."
        onSave={onMetaUpdate}
      />
    );
  }

  // ── Aparência (creator) ──────────────────────────────────────────────────
  if (tab === "aparencia") {
    return (
      <EditableTextSection
        title="Aparência e Diretrizes Visuais"
        fieldKey="aparencia"
        value={meta.aparencia as string ?? ""}
        placeholder="Características físicas, estilo, looks recorrentes, paleta de cores, diretrizes de imagem..."
        onSave={onMetaUpdate}
      />
    );
  }

  // ── Tom de Voz (creator) ─────────────────────────────────────────────────
  if (tab === "voz") {
    return (
      <EditableTextSection
        title="Tom de Voz"
        fieldKey="tom_de_voz"
        value={meta.tom_de_voz as string ?? ""}
        placeholder="Como fala, linguagem usada, expressões recorrentes, o que nunca diz, estilo narrativo..."
        onSave={onMetaUpdate}
      />
    );
  }

  // ── Conceito (campanha/branding) ─────────────────────────────────────────
  if (tab === "conceito") {
    return (
      <EditableTextSection
        title="Conceito Criativo"
        fieldKey="conceito"
        value={meta.conceito as string ?? ""}
        placeholder="Ideia central, defesa conceitual, moodboard, referências criativas..."
        onSave={onMetaUpdate}
      />
    );
  }

  // ── Exploração (branding/mockup) ─────────────────────────────────────────
  if (tab === "exploracao") {
    return (
      <EmptyState icon={Eye} text="Área de exploração visual. Vincule assets e referências nos arquivos do projeto." />
    );
  }

  // ── Assets ───────────────────────────────────────────────────────────────
  if (tab === "assets") {
    return (
      <EmptyState icon={FileText} text="Assets do projeto. Use o Supabase Storage para uploads (configuração pendente)." />
    );
  }

  // ── Calendário (conteúdo) ────────────────────────────────────────────────
  if (tab === "calendario") {
    return (
      <EmptyState icon={CalendarDays} text="Calendário de conteúdo. Será alimentado pelos pedidos vinculados a este projeto." />
    );
  }

  // ── Peças (conteúdo/campanha) ────────────────────────────────────────────
  if (tab === "pecas") {
    return (
      <EmptyState icon={Lightbulb} text="Lista de peças do projeto. Criadas automaticamente a partir dos pedidos vinculados." />
    );
  }

  // ── Requisitos (ferramenta) ──────────────────────────────────────────────
  if (tab === "requisitos") {
    return (
      <EditableTextSection
        title="Requisitos"
        fieldKey="requisitos"
        value={meta.requisitos as string ?? ""}
        placeholder="O que a ferramenta precisa fazer, entradas e saídas, casos de uso, limitações..."
        onSave={onMetaUpdate}
      />
    );
  }

  // ── Estrutura (documentação) ─────────────────────────────────────────────
  if (tab === "estrutura") {
    return (
      <EditableTextSection
        title="Estrutura da Documentação"
        fieldKey="estrutura"
        value={meta.estrutura as string ?? ""}
        placeholder="Sumário, hierarquia de seções, público alvo, formato de entrega..."
        onSave={onMetaUpdate}
      />
    );
  }

  // ── Times (operação) ────────────────────────────────────────────────────
  if (tab === "times") {
    return (
      <EmptyState icon={Users} text="Times e squads envolvidos serão listados automaticamente ao vincular pedidos." />
    );
  }

  // ── Aprovações (operação/campanha) ───────────────────────────────────────
  if (tab === "aprovacoes") {
    return (
      <EmptyState icon={ShieldCheck} text="Fluxo de aprovação será gerado conforme os pedidos avançam para o status 'Revisão'." />
    );
  }

  // ── Tarefas ──────────────────────────────────────────────────────────────
  if (tab === "tarefas") {
    return (
      <TarefasTab
        tarefas={tarefas}
        tarefasConcluidas={tarefasConcluidas}
        onSave={(novasTarefas) => onMetaUpdate("tarefas", novasTarefas)}
      />
    );
  }

  // ── Pedidos vinculados ───────────────────────────────────────────────────
  if (tab === "pedidos") {
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
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.25) }}
              whileHover={{ backgroundColor: "#F3F3F1", y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onNavigatePedido(p.id)}>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#0E0F10] truncate">{p.titulo}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-[#A9AAA5]">{p.tipo.replace("_", " ")}</span>
                  {p.creator && <span className="text-[11px] text-[#A9AAA5]">· {p.creator.name}</span>}
                  {p.dueAt && <span className="text-[11px] text-[#A9AAA5]">· {new Date(p.dueAt).toLocaleDateString("pt-BR")}</span>}
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

  // ── Memória ──────────────────────────────────────────────────────────────
  if (tab === "memoria") {
    return (
      <MemoriaTab
        memoria={memoria}
        onSave={(novaMemoria) => onMetaUpdate("memoria", novaMemoria)}
      />
    );
  }

  // ── Rules ────────────────────────────────────────────────────────────────
  if (tab === "rules") {
    return (
      <RulesTab
        rules={rules}
        onSave={(novasRules) => onMetaUpdate("rules", novasRules)}
      />
    );
  }

  // ── Log ──────────────────────────────────────────────────────────────────
  if (tab === "log") {
    return (
      <div className="flex flex-col gap-2">
        {log.length === 0 ? (
          <EmptyState icon={History} text="O histórico de eventos será registrado automaticamente." />
        ) : (
          log.map((entry, i) => (
            <motion.div key={i}
              className="flex items-start gap-3 rounded-[12px] bg-[#FAFAFA] px-4 py-3"
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}>
              <div className="h-6 w-6 rounded-full bg-[#EEEFE9] flex items-center justify-center flex-shrink-0 mt-0.5">
                <History size={11} color="#A9AAA5" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] text-[#0E0F10]">{entry.acao}</p>
                {entry.data && <p className="text-[11px] text-[#A9AAA5] mt-0.5">{entry.data}</p>}
              </div>
            </motion.div>
          ))
        )}
      </div>
    );
  }

  // Fallback para abas não mapeadas
  return <EmptyState icon={Rocket} text="Esta etapa será preenchida conforme o projeto avança." />;
}

// ─── Sub-componentes de edição ────────────────────────────────────────────────

function EditableTextSection({ title, fieldKey, value, placeholder, onSave }: {
  title: string; fieldKey: string; value: string; placeholder: string;
  onSave: (key: string, value: unknown) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(fieldKey, draft);
    setSaving(false);
    setEditing(false);
    toast.success("Salvo.");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">{title}</p>
        {!editing ? (
          <motion.button onClick={() => setEditing(true)}
            className="flex items-center gap-1 rounded-[8px] bg-[#EEEFE9] px-2.5 py-1 text-[11px] font-semibold text-[#5E5E5F]"
            whileHover={{ backgroundColor: "#D9D9D4", color: "#0E0F10", scale: 1.02 }}
            whileTap={{ scale: 0.97 }}>
            <Edit3 size={10} /> Editar
          </motion.button>
        ) : (
          <div className="flex items-center gap-2">
            <motion.button onClick={() => { setEditing(false); setDraft(value); }}
              className="flex items-center gap-1 rounded-[8px] bg-[#EEEFE9] px-2.5 py-1 text-[11px] font-semibold text-[#5E5E5F]"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <X size={10} /> Cancelar
            </motion.button>
            <motion.button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1 rounded-[8px] bg-[#0E0F10] px-2.5 py-1 text-[11px] font-semibold text-white"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Save size={10} /> {saving ? "Salvando..." : "Salvar"}
            </motion.button>
          </div>
        )}
      </div>
      <AnimatePresence mode="wait">
        {!editing ? (
          <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}>
            {draft ? (
              <p className="text-[14px] text-[#0E0F10] leading-relaxed whitespace-pre-wrap">{draft}</p>
            ) : (
              <p className="text-[13px] text-[#A9AAA5] italic">{placeholder}</p>
            )}
          </motion.div>
        ) : (
          <motion.textarea
            key="edit"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            rows={8}
            className="w-full rounded-[12px] border border-transparent bg-[#EEEFE9] px-4 py-3 text-[14px] text-[#0E0F10] outline-none placeholder:text-[#A9AAA5] resize-none focus:border-[#0E0F10] focus:shadow-[0_0_0_3px_rgba(14,15,16,0.08)] transition-[border-color,box-shadow] duration-150"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TarefasTab({ tarefas, tarefasConcluidas, onSave }: {
  tarefas: { id: number; titulo: string; concluido: boolean }[];
  tarefasConcluidas: number;
  onSave: (tarefas: unknown) => Promise<void>;
}) {
  const [lista, setLista] = useState(tarefas);
  const [novaTarefa, setNovaTarefa] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleTarefa = async (id: number) => {
    const novaLista = lista.map((t) => t.id === id ? { ...t, concluido: !t.concluido } : t);
    setLista(novaLista);
    setSaving(true);
    await onSave(novaLista);
    setSaving(false);
  };

  const adicionarTarefa = async () => {
    if (!novaTarefa.trim()) return;
    const novaLista = [...lista, { id: Date.now(), titulo: novaTarefa.trim(), concluido: false }];
    setLista(novaLista);
    setNovaTarefa("");
    setSaving(true);
    await onSave(novaLista);
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">
          {lista.length > 0 ? `${tarefasConcluidas} de ${lista.length} concluídas` : "Sem tarefas"}
        </p>
        {saving && <span className="text-[11px] text-[#A9AAA5]">Salvando...</span>}
      </div>

      {lista.length > 0 && (
        <div className="flex flex-col gap-1.5 mb-4">
          {lista.map((t, i) => (
            <motion.div key={t.id}
              className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 cursor-pointer"
              style={{ backgroundColor: t.concluido ? "#E6F4EA" : "#FAFAFA" }}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ backgroundColor: t.concluido ? "#DDF0E0" : "#F3F3F1" }}
              whileTap={{ scale: 0.99 }}
              onClick={() => toggleTarefa(t.id)}>
              {t.concluido
                ? <CheckCircle2 size={16} color="#43A047" />
                : <Square size={16} color="#A9AAA5" />
              }
              <span className="text-[13px] font-semibold flex-1"
                style={{ color: t.concluido ? "#2E7D32" : "#0E0F10", textDecoration: t.concluido ? "line-through" : "none" }}>
                {t.titulo}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={novaTarefa}
          onChange={(e) => setNovaTarefa(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && adicionarTarefa()}
          placeholder="Nova tarefa..."
          className="flex-1 h-9 rounded-[10px] border border-transparent bg-[#EEEFE9] px-3 text-[13px] text-[#0E0F10] outline-none placeholder:text-[#A9AAA5] focus:border-[#0E0F10] focus:shadow-[0_0_0_3px_rgba(14,15,16,0.08)] transition-[border-color,box-shadow] duration-150"
        />
        <motion.button onClick={adicionarTarefa} disabled={!novaTarefa.trim()}
          className="h-9 w-9 rounded-[10px] bg-[#0E0F10] flex items-center justify-center disabled:opacity-40"
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Plus size={14} color="#D7FF00" />
        </motion.button>
      </div>
    </div>
  );
}

function MemoriaTab({ memoria, onSave }: {
  memoria: { texto: string; data?: string }[];
  onSave: (memoria: unknown) => Promise<void>;
}) {
  const [lista, setLista] = useState(memoria);
  const [novo, setNovo] = useState("");
  const [saving, setSaving] = useState(false);

  const adicionar = async () => {
    if (!novo.trim()) return;
    const novaLista = [{ texto: novo.trim(), data: new Date().toLocaleDateString("pt-BR") }, ...lista];
    setLista(novaLista);
    setNovo("");
    setSaving(true);
    await onSave(novaLista);
    setSaving(false);
    toast.success("Adicionado à memória.");
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[12px] text-[#A9AAA5] leading-relaxed">
        A memória registra contexto útil acumulado — decisões, aprendizados, observações que os agentes precisam considerar.
      </p>

      <div className="flex gap-2">
        <input
          value={novo} onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && adicionar()}
          placeholder="Adicionar à memória do projeto..."
          className="flex-1 h-9 rounded-[10px] border border-transparent bg-[#EEEFE9] px-3 text-[13px] text-[#0E0F10] outline-none placeholder:text-[#A9AAA5] focus:border-[#0E0F10] focus:shadow-[0_0_0_3px_rgba(14,15,16,0.08)] transition-[border-color,box-shadow] duration-150"
        />
        <motion.button onClick={adicionar} disabled={!novo.trim() || saving}
          className="h-9 px-4 rounded-[10px] bg-[#0E0F10] text-[12px] font-semibold text-[#D7FF00] disabled:opacity-40"
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
          <Plus size={13} />
        </motion.button>
      </div>

      <div className="flex flex-col gap-2">
        {lista.length === 0 ? (
          <EmptyState icon={Brain} text="Nenhuma memória registrada. Adicione contexto que os agentes devem lembrar." />
        ) : lista.map((m, i) => (
          <motion.div key={i}
            className="rounded-[12px] bg-[#F0EFFF] p-3.5 flex items-start gap-3"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}>
            <Brain size={13} color="#7C6AF7" className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[13px] text-[#0E0F10] leading-relaxed">{m.texto}</p>
              {m.data && <p className="text-[10px] text-[#A9AAA5] mt-1">{m.data}</p>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function RulesTab({ rules, onSave }: {
  rules: { regra: string }[];
  onSave: (rules: unknown) => Promise<void>;
}) {
  const [lista, setLista] = useState(rules);
  const [nova, setNova] = useState("");
  const [saving, setSaving] = useState(false);

  const adicionar = async () => {
    if (!nova.trim()) return;
    const novaLista = [...lista, { regra: nova.trim() }];
    setLista(novaLista);
    setNova("");
    setSaving(true);
    await onSave(novaLista);
    setSaving(false);
    toast.success("Rule adicionada.");
  };

  const remover = async (i: number) => {
    const novaLista = lista.filter((_, idx) => idx !== i);
    setLista(novaLista);
    setSaving(true);
    await onSave(novaLista);
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[12px] text-[#A9AAA5] leading-relaxed">
        Rules são restrições que não podem ser quebradas neste projeto — branding, técnicas, tom de voz, escopo, exigências.
      </p>

      <div className="flex gap-2">
        <input
          value={nova} onChange={(e) => setNova(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && adicionar()}
          placeholder="Ex: Nunca usar cores fora do brand..."
          className="flex-1 h-9 rounded-[10px] border border-transparent bg-[#EEEFE9] px-3 text-[13px] text-[#0E0F10] outline-none placeholder:text-[#A9AAA5] focus:border-[#0E0F10] focus:shadow-[0_0_0_3px_rgba(14,15,16,0.08)] transition-[border-color,box-shadow] duration-150"
        />
        <motion.button onClick={adicionar} disabled={!nova.trim() || saving}
          className="h-9 px-4 rounded-[10px] bg-[#0E0F10] text-[12px] font-semibold text-[#D7FF00] disabled:opacity-40"
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
          <Plus size={13} />
        </motion.button>
      </div>

      <div className="flex flex-col gap-2">
        {lista.length === 0 ? (
          <EmptyState icon={ShieldCheck} text="Nenhuma rule definida. Adicione restrições obrigatórias para este projeto." />
        ) : lista.map((r, i) => (
          <motion.div key={i}
            className="rounded-[12px] bg-[#FFF8E1] p-3.5 flex items-start justify-between gap-3"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}>
            <div className="flex items-start gap-2.5">
              <ShieldCheck size={13} color="#FB8C00" className="mt-0.5 flex-shrink-0" />
              <p className="text-[13px] text-[#0E0F10] leading-relaxed">{r.regra}</p>
            </div>
            <motion.button onClick={() => remover(i)}
              className="flex-shrink-0 h-6 w-6 rounded-full bg-[#FFE0B2] flex items-center justify-center"
              whileHover={{ backgroundColor: "#FFCC80", scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <X size={10} color="#E65100" />
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ProjetoStatus }) {
  const p = STATUS_PALETTE[status];
  return (
    <span className="inline-flex items-center gap-1 rounded-[6px] font-bold uppercase tracking-wide flex-shrink-0"
      style={{ backgroundColor: p.bg, color: p.text, fontSize: 10, padding: "3px 9px" }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.dot }} />
      {p.label}
    </span>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[12px] text-[#A9AAA5] flex-shrink-0">{label}</span>
      {typeof value === "string"
        ? <span className="text-[13px] font-semibold text-[#0E0F10] capitalize text-right">{value}</span>
        : value
      }
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <Icon size={24} color="#A9AAA5" />
      <p className="text-[13px] text-[#A9AAA5] max-w-[260px] leading-relaxed">{text}</p>
    </div>
  );
}
