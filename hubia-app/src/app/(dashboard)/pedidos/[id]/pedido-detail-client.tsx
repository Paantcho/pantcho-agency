"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Clock, AlertTriangle, Flame, CheckCircle2, Square,
  User, FolderKanban, Zap, FileText, Activity, Edit3, Save, X,
  TrendingUp, Rocket, Lightbulb, CheckSquare, Copy, Check,
  Upload, Tag, BookOpen, Cpu, Clipboard, Users, Eye,
  ChevronDown, ChevronUp, Plus,
} from "lucide-react";
import { toast } from "@/components/ui/hubia-toast";
import { HubiaSelect } from "@/components/ui/hubia-select";
import { updatePedidoStatus, updatePedido } from "../actions";
import type { PedidoDetail } from "../actions";
import type { PedidoStatus, PedidoTipo, PedidoUrgencia } from "@prisma/client";

// ─── Paleta travada de status ─────────────────────────────────────────────────

const STATUS_LABELS: Record<PedidoStatus, string> = {
  rascunho: "Backlog",
  aguardando: "Aguardando",
  em_andamento: "Em Progresso",
  revisao: "Revisão",
  aprovado: "Aprovado",
  entregue: "Concluído",
  cancelado: "Cancelado",
};

const STATUS_PALETTE: Record<PedidoStatus, { bg: string; text: string; dot: string }> = {
  rascunho:     { bg: "#F0F0EE", text: "#6B6C68", dot: "#A9AAA5" },
  aguardando:   { bg: "#F0EFFF", text: "#5B52C7", dot: "#7C6AF7" },
  em_andamento: { bg: "#F0FF80", text: "#5A6600", dot: "#A8C800" },
  revisao:      { bg: "#FFF0E0", text: "#A05500", dot: "#FB8C00" },
  aprovado:     { bg: "#E6F4EA", text: "#2E7D32", dot: "#43A047" },
  entregue:     { bg: "#E8E8E8", text: "#0E0F10", dot: "#0E0F10" },
  cancelado:    { bg: "#FDECEA", text: "#C62828", dot: "#E53935" },
};

const STATUS_FLOW: PedidoStatus[] = ["rascunho", "aguardando", "em_andamento", "revisao", "aprovado", "entregue"];

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

const TIPO_SQUAD: Record<PedidoTipo, string> = {
  imagem: "AUDIOVISUAL", video: "AUDIOVISUAL", creator: "AUDIOVISUAL",
  landing_page: "DEV", app: "DEV", site: "DEV", sistema: "DEV", agente: "DEV", skill: "DEV", outro: "DEV",
};

const TIPOS_COM_CREATOR: PedidoTipo[] = ["imagem", "video", "creator"];

const URGENCIA_COLORS: Record<PedidoUrgencia, string> = {
  baixa: "#A9AAA5", media: "#5E5E5F", alta: "#FB8C00", critica: "#E53935",
};

// ─── Cadeia de produção por tipo ──────────────────────────────────────────────

type EtapaProducao = {
  id: string;
  role: string;
  icon: React.ElementType;
  descricao: string;
  concluido: boolean;
};

function getCadeiaProducao(tipo: PedidoTipo, briefing: Record<string, unknown>): EtapaProducao[] {
  if (["imagem", "video", "creator"].includes(tipo)) {
    return [
      { id: "planner",    role: "Planner",         icon: Clipboard,  descricao: String(briefing.mood ?? briefing.objetivo ?? "Definir mood e contexto"), concluido: !!briefing.squad },
      { id: "copywriter", role: "Copywriter",       icon: Edit3,      descricao: String(briefing.copy ?? "Criar legenda e copy"), concluido: !!briefing.copy },
      { id: "diretorarte",role: "Diretor de Arte",  icon: Eye,        descricao: String(briefing.mood ? `Referência visual: ${briefing.mood}` : "Definir estética"), concluido: !!briefing.mood },
      { id: "diretorcena",role: "Diretor de Cena",  icon: Cpu,        descricao: String(briefing.formato ?? briefing.equipamento ?? "Cenário e props"), concluido: !!briefing.formato },
      { id: "consistencia",role:"Consistência",     icon: Check,      descricao: briefing.validacao ? String(briefing.validacao) : "Validação forense pendente", concluido: briefing.validacao === "OK" || briefing.validacao === true },
      { id: "engprompts", role: "Eng. Prompts",     icon: Zap,        descricao: briefing.prompt ? "Prompt final gerado" : "Aguardando etapas anteriores", concluido: !!briefing.prompt },
    ];
  }
  if (["landing_page", "app", "site"].includes(tipo)) {
    return [
      { id: "arquiteto",  role: "Arquiteto",         icon: BookOpen,   descricao: String(briefing.objetivo ?? "Definir arquitetura"), concluido: !!briefing.objetivo },
      { id: "designer",   role: "UI Designer",       icon: Eye,        descricao: String(briefing.figmaUrl ? "Figma disponível" : "Design pendente"), concluido: !!briefing.figmaUrl },
      { id: "dev",        role: "Desenvolvedor",     icon: Cpu,        descricao: String(briefing.stack ? `Stack: ${(briefing.stack as string[]).join(", ")}` : "Dev pendente"), concluido: !!briefing.stack },
      { id: "qa",         role: "QA/Review",         icon: Check,      descricao: String(briefing.progresso ? `Progresso: ${briefing.progresso}%` : "Review pendente"), concluido: Number(briefing.progresso ?? 0) === 100 },
      { id: "deploy",     role: "Deploy",            icon: Rocket,     descricao: String(briefing.plataforma ? `Deploy em ${briefing.plataforma}` : "Deploy pendente"), concluido: !!briefing.completedAt },
    ];
  }
  if (tipo === "sistema" || tipo === "agente" || tipo === "skill") {
    return [
      { id: "arquiteto",  role: "Arquiteto",         icon: BookOpen,   descricao: String(briefing.escopo ?? "Definir escopo"), concluido: !!briefing.escopo },
      { id: "dev",        role: "Desenvolvedor",     icon: Cpu,        descricao: String(briefing.squad ? `Squad: ${briefing.squad}` : "Dev pendente"), concluido: !!briefing.squad },
      { id: "qa",         role: "QA",                icon: Check,      descricao: "Review e testes", concluido: false },
    ];
  }
  return [
    { id: "planner",    role: "Planejamento",      icon: Clipboard,  descricao: "Definir escopo e objetivos", concluido: Object.keys(briefing).length > 0 },
    { id: "execucao",   role: "Execução",           icon: Cpu,        descricao: "Em andamento", concluido: false },
    { id: "revisao",    role: "Revisão",            icon: Check,      descricao: "Aguardando entrega", concluido: false },
  ];
}

// ─── Tabs dinâmicas por tipo ──────────────────────────────────────────────────

type TabDef = { id: string; label: string };

function getTabsParaTipo(tipo: PedidoTipo): TabDef[] {
  if (["landing_page", "app", "site", "sistema"].includes(tipo)) {
    return [
      { id: "geral", label: "Visão Geral" },
      { id: "arquitetura", label: "Arquitetura" },
      { id: "tarefas", label: "Tarefas" },
      { id: "decisoes", label: "Decisões" },
      { id: "deploy", label: "Deploy" },
      { id: "timeline", label: "Timeline" },
      { id: "historico", label: "Histórico" },
    ];
  }
  if (["imagem", "video"].includes(tipo)) {
    return [
      { id: "geral", label: "Visão Geral" },
      { id: "briefing", label: "Briefing" },
      { id: "referencias", label: "Referências" },
      { id: "aprovacao", label: "Aprovação" },
      { id: "entrega", label: "Entrega" },
      { id: "historico", label: "Histórico" },
    ];
  }
  if (tipo === "creator") {
    return [
      { id: "geral", label: "Visão Geral" },
      { id: "planejamento", label: "Planejamento" },
      { id: "posts", label: "Posts" },
      { id: "aprovacao", label: "Aprovação" },
      { id: "publicacao", label: "Publicação" },
      { id: "historico", label: "Histórico" },
    ];
  }
  return [
    { id: "geral", label: "Visão Geral" },
    { id: "tarefas", label: "Tarefas" },
    { id: "decisoes", label: "Decisões" },
    { id: "historico", label: "Histórico" },
  ];
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PedidoStatus }) {
  const p = STATUS_PALETTE[status];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-[6px] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
      style={{ backgroundColor: p.bg, color: p.text }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.dot }} />
      {STATUS_LABELS[status]}
    </span>
  );
}

// ─── Component principal ──────────────────────────────────────────────────────

export default function PedidoDetailClient({
  pedido: initial,
  organizationId,
  creators,
  projetos,
}: {
  pedido: PedidoDetail;
  organizationId: string;
  creators: { id: string; name: string; avatarUrl: string | null }[];
  projetos: { id: string; nome: string }[];
}) {
  const router = useRouter();
  const [pedido, setPedido] = useState(initial);
  const [savingStatus, setSavingStatus] = useState(false);

  const tabs = getTabsParaTipo(pedido.tipo);
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

  const handleStatusChange = async (status: PedidoStatus) => {
    setSavingStatus(true);
    const result = await updatePedidoStatus(organizationId, pedido.id, status);
    setSavingStatus(false);
    if (!result.ok) { toast.error(result.error ?? "Erro ao atualizar status"); return; }
    setPedido((p) => ({ ...p, status }));
    toast.success(`Status: ${STATUS_LABELS[status]}`);
  };

  const handleCreatorChange = async (creatorId: string) => {
    await updatePedido(organizationId, pedido.id, { creatorId: creatorId || null });
    const c = creators.find((c) => c.id === creatorId) ?? null;
    if (c && pedido.creator && c.id !== pedido.creator.id) {
      toast.info(`Creator alterado para ${c.name}. Verifique se o projeto precisa ser atualizado.`);
    }
    setPedido((p) => ({ ...p, creator: c }));
    toast.success("Creator vinculado.");
  };

  const handleProjetoChange = async (projetoId: string) => {
    await updatePedido(organizationId, pedido.id, { projetoId: projetoId || null });
    const pr = projetos.find((p) => p.id === projetoId) ?? null;
    setPedido((p) => ({ ...p, projeto: pr }));
    toast.success("Projeto vinculado.");
  };

  const currentStatusIdx = STATUS_FLOW.indexOf(pedido.status as PedidoStatus);

  const briefing = (pedido.briefing ?? {}) as Record<string, unknown>;
  const tarefas = Array.isArray(briefing.tarefas)
    ? briefing.tarefas as { titulo: string; concluido: boolean }[]
    : [];
  const tarefasConcluidas = tarefas.filter((t) => t.concluido).length;
  const progresso = tarefas.length > 0 ? Math.round((tarefasConcluidas / tarefas.length) * 100) : 0;
  const decisoes = Array.isArray(briefing.decisoes)
    ? briefing.decisoes as { titulo: string; desc?: string; data?: string }[]
    : [];

  const cadeia = getCadeiaProducao(pedido.tipo, briefing);
  const etapasConcluidas = cadeia.filter((e) => e.concluido).length;

  const mostraCreator = TIPOS_COM_CREATOR.includes(pedido.tipo);

  const kpis = [
    { label: "Progresso", value: `${progresso}%`, icon: TrendingUp, bg: "#F5FFB8", color: "#5A6600" },
    { label: "Tarefas", value: `${tarefasConcluidas}/${tarefas.length || "?"}`, icon: CheckSquare, bg: "#E6F4EA", color: "#2E7D32" },
    {
      label: ["imagem","video","creator"].includes(pedido.tipo) ? "Posts" : "Módulos",
      value: String(briefing.modulos ?? briefing.posts ?? briefing.total ?? "—"),
      icon: FileText, bg: "#F3F0FF", color: "#5B52C7",
    },
    {
      label: ["imagem","video"].includes(pedido.tipo) ? "Imagens" : "Telas",
      value: String(briefing.telas ?? briefing.quantidade ?? "—"),
      icon: Rocket, bg: "#E3F2FD", color: "#0277BD",
    },
  ];

  const numPedido = parseInt(pedido.id.replace(/-/g, "").slice(-8), 16) % 9999 + 1;

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <motion.button
          onClick={() => router.push("/pedidos")}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-[#A9AAA5]"
          whileHover={{ color: "#0E0F10", x: -2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}
        >
          <ArrowLeft size={14} />
          Pedidos
        </motion.button>
        <span className="text-[#D4D5D6]">/</span>
        <span className="text-[13px] text-[#0E0F10] font-semibold truncate max-w-[300px]">Pedido #{numPedido.toString().padStart(2, "0")}</span>
      </div>

      {/* Layout 2 colunas */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
        {/* ─── Coluna principal ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Header card */}
          <div className="rounded-[30px] bg-white p-6">
            <div className="flex items-start gap-3 mb-5">
              {/* Avatar colorido baseado no tipo */}
              <div
                className="flex-shrink-0 h-11 w-11 rounded-full flex items-center justify-center text-[18px] font-bold"
                style={{ backgroundColor: `${TIPO_BADGES[pedido.tipo]}25`, color: TIPO_BADGES[pedido.tipo] }}
              >
                {pedido.titulo.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-[#A9AAA5] mb-0.5">
                  {pedido.creator?.name ?? TIPO_SQUAD[pedido.tipo]} · {pedido.dueAt ? new Date(pedido.dueAt).toLocaleDateString("pt-BR") : "Sem data"} · v1
                </p>
                <h1 className="text-[22px] font-bold text-[#0E0F10] leading-tight">
                  Pedido #{numPedido.toString().padStart(2, "0")} — {pedido.titulo}
                </h1>
              </div>
              <StatusBadge status={pedido.status} />
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

            {/* Flow de status */}
            <div className="mt-5 flex items-center gap-1.5 overflow-x-auto pb-1">
              {STATUS_FLOW.map((s, i) => {
                const isPast = i <= currentStatusIdx;
                const isCurrent = s === pedido.status;
                const p = STATUS_PALETTE[s];
                return (
                  <div key={s} className="flex items-center gap-1">
                    <motion.button
                      onClick={() => !savingStatus && handleStatusChange(s)}
                      className="flex items-center gap-1.5 rounded-[9999px] px-3 py-1.5 text-[11px] font-bold whitespace-nowrap"
                      animate={{
                        backgroundColor: isCurrent ? p.dot : isPast ? `${p.dot}20` : "#EEEFE9",
                        color: isCurrent ? (s === "em_andamento" ? "#5A6600" : ["rascunho","aguardando"].includes(s) ? p.text : "#FFFFFF") : isPast ? p.text : "#A9AAA5",
                        scale: isCurrent ? 1.05 : 1,
                      }}
                      initial={false}
                      whileHover={!isCurrent ? { scale: 1.05 } : {}}
                      whileTap={{ scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                    >
                      {isCurrent && <CheckCircle2 size={11} />}
                      {STATUS_LABELS[s]}
                    </motion.button>
                    {i < STATUS_FLOW.length - 1 && (
                      <span className="text-[#D4D5D6] text-[10px] flex-shrink-0">›</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cadeia de produção */}
          <CadeiaProducao etapas={cadeia} />

          {/* Tabs + conteúdo */}
          <div className="rounded-[30px] bg-white overflow-hidden">
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
                  whileHover={activeTab !== tab.id ? { backgroundColor: "#EEEFE9/50" } : {}}
                  whileTap={{ scale: 0.97 }}
                >
                  {tab.label}
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
                  <TabConteudo
                    tab={activeTab}
                    pedido={pedido}
                    briefing={briefing}
                    tarefas={tarefas}
                    tarefasConcluidas={tarefasConcluidas}
                    decisoes={decisoes}
                    organizationId={organizationId}
                    onBriefingUpdate={(newBriefing) => {
                      setPedido(p => ({ ...p, briefing: newBriefing }));
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Prompt Final (para tipos audiovisual) */}
          {["imagem", "video", "creator"].includes(pedido.tipo) && (
            <PromptFinalCard briefing={briefing} />
          )}
        </div>

        {/* ─── Coluna lateral ───────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {/* Contexto automático */}
          <ContextoAutomatico pedido={pedido} creators={creators} />

          {/* Detalhes */}
          <div className="rounded-[16px] bg-white p-5 flex flex-col gap-3.5">
            <p className="text-[11px] font-bold text-[#A9AAA5] uppercase tracking-wide">Detalhes</p>
            <MetaRow label="Tipo" value={pedido.tipo.replace("_", " ")} />
            <MetaRow label="Urgência"
              value={
                <span className="flex items-center gap-1 text-[13px] font-semibold" style={{ color: URGENCIA_COLORS[pedido.urgencia] }}>
                  {pedido.urgencia === "critica" ? <Flame size={12} /> : pedido.urgencia === "alta" ? <AlertTriangle size={12} /> : <Clock size={12} />}
                  {pedido.urgencia.charAt(0).toUpperCase() + pedido.urgencia.slice(1)}
                </span>
              }
            />
            {pedido.dueAt && <MetaRow label="Entrega" value={new Date(pedido.dueAt).toLocaleDateString("pt-BR")} />}
            <MetaRow label="Criado em" value={new Date(pedido.createdAt).toLocaleDateString("pt-BR")} />
            {pedido.sourceType !== "manual" && (
              <MetaRow label="Fonte" value={
                <span className="flex items-center gap-1 text-[12px] text-[#5E5E5F]"><Zap size={11} />{pedido.sourceType}</span>
              } />
            )}
          </div>

          {/* Creator — só exibe para tipos audiovisual */}
          {mostraCreator && (
            <div className="rounded-[16px] bg-white p-5 flex flex-col gap-3">
              <p className="text-[11px] font-bold text-[#A9AAA5] uppercase tracking-wide flex items-center gap-1.5">
                <User size={11} /> Creator
              </p>
              {pedido.creator && (
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-7 w-7 rounded-full bg-[#EEEFE9] overflow-hidden flex-shrink-0">
                    {pedido.creator.avatarUrl && <img src={pedido.creator.avatarUrl} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <span className="text-[13px] font-semibold text-[#0E0F10]">{pedido.creator.name}</span>
                </div>
              )}
              <HubiaSelect
                value={pedido.creator?.id ?? ""}
                onChange={handleCreatorChange}
                placeholder="Vincular creator"
                options={[{ value: "", label: "Nenhum" }, ...creators.map((c) => ({ value: c.id, label: c.name }))]}
              />
            </div>
          )}

          {/* Projeto */}
          <div className="rounded-[16px] bg-white p-5 flex flex-col gap-3">
            <p className="text-[11px] font-bold text-[#A9AAA5] uppercase tracking-wide flex items-center gap-1.5">
              <FolderKanban size={11} /> Projeto
            </p>
            {pedido.projeto && (
              <p className="text-[13px] font-semibold text-[#0E0F10] mb-1">{pedido.projeto.nome}</p>
            )}
            <HubiaSelect
              value={pedido.projeto?.id ?? ""}
              onChange={handleProjetoChange}
              placeholder="Vincular projeto"
              options={[{ value: "", label: "Nenhum" }, ...projetos.map((p) => ({ value: p.id, label: p.nome }))]}
            />
          </div>

          {/* Resultado / Upload */}
          {["imagem", "video", "creator"].includes(pedido.tipo) && (
            <UploadResultado tipo={pedido.tipo} />
          )}

          {/* Notas */}
          <NotasCard pedidoId={pedido.id} organizationId={organizationId} />
        </div>
      </div>
    </div>
  );
}

// ─── Cadeia de Produção ───────────────────────────────────────────────────────

function CadeiaProducao({ etapas }: { etapas: EtapaProducao[] }) {
  const concluidas = etapas.filter(e => e.concluido).length;
  return (
    <div className="rounded-[30px] bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Cadeia de Produção</p>
        <span className="text-[11px] font-semibold text-[#5E5E5F]">{concluidas}/{etapas.length} concluídas</span>
      </div>
      <div className="flex flex-col gap-0">
        {etapas.map((etapa, i) => {
          const Icon = etapa.icon;
          return (
            <motion.div
              key={etapa.id}
              className="flex items-start gap-4 py-3"
              style={{ borderBottom: i < etapas.length - 1 ? "1px solid #EEEFE9" : "none" }}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.25 }}
            >
              {/* Ícone check/pending */}
              <div className="flex-shrink-0 mt-0.5">
                {etapa.concluido ? (
                  <div className="h-7 w-7 rounded-full bg-[#E6F4EA] flex items-center justify-center">
                    <CheckCircle2 size={16} color="#43A047" />
                  </div>
                ) : (
                  <div className="h-7 w-7 rounded-full bg-[#EEEFE9] flex items-center justify-center">
                    <Icon size={14} color="#A9AAA5" />
                  </div>
                )}
              </div>
              {/* Role + descrição */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[#0E0F10]">{etapa.role}</p>
                <p className="text-[12px] text-[#5E5E5F] mt-0.5 leading-relaxed">{etapa.descricao}</p>
              </div>
              {/* Status pill */}
              <span
                className="flex-shrink-0 text-[10px] font-bold rounded-[6px] px-2 py-0.5"
                style={{
                  backgroundColor: etapa.concluido ? "#E6F4EA" : "#EEEFE9",
                  color: etapa.concluido ? "#2E7D32" : "#A9AAA5",
                }}
              >
                {etapa.concluido ? "Concluído" : "Pendente"}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Prompt Final ─────────────────────────────────────────────────────────────

function PromptFinalCard({ briefing }: { briefing: Record<string, unknown> }) {
  const [copied, setCopied] = useState(false);
  const prompt = String(briefing.prompt ?? "Prompt será gerado após a conclusão da Cadeia de Produção.");
  const temPrompt = !!briefing.prompt;

  const handleCopy = () => {
    if (!temPrompt) return;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast.success("Prompt copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-[30px] bg-[#0E0F10] p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Prompt Final</p>
        <div className="flex items-center gap-2">
          {temPrompt && (
            <motion.button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-[12px] bg-[#D7FF00] px-3 py-1.5 text-[11px] font-bold text-[#0E0F10]"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copiado!" : "Copiar Prompt"}
            </motion.button>
          )}
        </div>
      </div>
      <p
        className="text-[13px] leading-relaxed font-mono"
        style={{ color: temPrompt ? "#E8E8E6" : "#5E5E5F" }}
      >
        {prompt}
      </p>
    </div>
  );
}

// ─── Contexto Automático ──────────────────────────────────────────────────────

function ContextoAutomatico({
  pedido,
  creators,
}: {
  pedido: PedidoDetail;
  creators: { id: string; name: string; avatarUrl: string | null }[];
}) {
  const briefing = (pedido.briefing ?? {}) as Record<string, unknown>;
  const creator = pedido.creator;

  const itens = [
    { label: "Appearance", value: creator ? `${creator.name.split(" ")[0]}.md` : "—", badge: "v4", badgeBg: "#E6F4EA", badgeColor: "#2E7D32" },
    { label: "Ambiente", value: String(briefing.ambiente ?? briefing.sala ?? briefing.local ?? "—"), badge: briefing.ambiente ? "v2" : null, badgeBg: "#F0EFFF", badgeColor: "#5B52C7" },
    { label: "Detalhe", value: String(briefing.unhas ?? briefing.detalhe ?? "—"), badge: null, badgeBg: null, badgeColor: null },
    { label: "KB", value: String(briefing.consistencia ?? briefing.kb ?? "consistência facial"), badge: "live", badgeBg: "#FDECEA", badgeColor: "#C62828" },
  ].filter(i => i.value !== "—");

  return (
    <div className="rounded-[16px] bg-white p-5 flex flex-col gap-3">
      <p className="text-[11px] font-bold text-[#A9AAA5] uppercase tracking-wide">Contexto Automático</p>
      {itens.length === 0 ? (
        <p className="text-[12px] text-[#A9AAA5]">Contexto será gerado automaticamente.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {itens.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-[12px] text-[#A9AAA5]">{item.label}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-semibold text-[#0E0F10]">{item.value}</span>
                {item.badge && (
                  <span
                    className="rounded-[4px] px-1.5 py-0.5 text-[8px] font-bold uppercase"
                    style={{ backgroundColor: item.badgeBg ?? "#EEEFE9", color: item.badgeColor ?? "#5E5E5F" }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Notas ────────────────────────────────────────────────────────────────────

function NotasCard({ pedidoId, organizationId }: { pedidoId: string; organizationId: string }) {
  const [nota, setNota] = useState("");
  const [editing, setEditing] = useState(false);

  return (
    <div className="rounded-[16px] bg-white p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-[#A9AAA5] uppercase tracking-wide">Notas</p>
        {!editing && (
          <motion.button onClick={() => setEditing(true)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Plus size={14} color="#A9AAA5" />
          </motion.button>
        )}
      </div>
      {editing ? (
        <div className="flex flex-col gap-2">
          <textarea
            autoFocus value={nota} onChange={(e) => setNota(e.target.value)}
            placeholder="Adicionar nota..."
            rows={3}
            className="w-full rounded-[12px] border border-transparent bg-[#EEEFE9] px-3 py-2 text-[13px] text-[#0E0F10] outline-none placeholder:text-[#A9AAA5] resize-none focus:border-[#0E0F10] focus:ring-2 focus:ring-ink-500/10 transition-[border-color,box-shadow] duration-150"
          />
          <div className="flex gap-2">
            <motion.button onClick={() => setEditing(false)}
              className="flex-1 rounded-[12px] bg-[#EEEFE9] py-2 text-[12px] font-semibold text-[#5E5E5F]"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              Cancelar
            </motion.button>
            <motion.button onClick={() => { setEditing(false); if (nota.trim()) toast.success("Nota salva!"); }}
              className="flex-1 rounded-[12px] bg-[#0E0F10] py-2 text-[12px] font-semibold text-white"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              Salvar
            </motion.button>
          </div>
        </div>
      ) : (
        <p className="text-[12px] text-[#A9AAA5]">{nota || "Nenhuma nota ainda"}</p>
      )}
    </div>
  );
}

// ─── TabConteudo ──────────────────────────────────────────────────────────────

function TabConteudo({
  tab, pedido, briefing, tarefas, tarefasConcluidas, decisoes, organizationId, onBriefingUpdate,
}: {
  tab: string;
  pedido: PedidoDetail;
  briefing: Record<string, unknown>;
  tarefas: { titulo: string; concluido: boolean }[];
  tarefasConcluidas: number;
  decisoes: { titulo: string; desc?: string; data?: string }[];
  organizationId: string;
  onBriefingUpdate: (b: Record<string, unknown>) => void;
}) {
  const [editMode, setEditMode] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSaveBriefing = async () => {
    setSaving(true);
    try {
      const parsed = JSON.parse(editValue);
      await updatePedido(organizationId, pedido.id, { briefing: parsed });
      onBriefingUpdate(parsed);
      setEditMode(false);
      toast.success("Briefing atualizado!");
    } catch {
      toast.error("JSON inválido. Verifique o formato.");
    }
    setSaving(false);
  };

  if (tab === "geral" || tab === "briefing") {
    const briefingLimpo = Object.entries(briefing).filter(([k]) => !["tarefas","decisoes","prompt"].includes(k));
    return (
      <div className="flex flex-col gap-4">
        {/* Briefing editável */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Briefing</p>
            <motion.button
              onClick={() => {
                if (!editMode) { setEditValue(JSON.stringify(briefing, null, 2)); }
                setEditMode(e => !e);
              }}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#A9AAA5]"
              whileHover={{ color: "#0E0F10" }} whileTap={{ scale: 0.97 }}
            >
              {editMode ? <X size={12} /> : <Edit3 size={12} />}
              {editMode ? "Cancelar" : "Editar"}
            </motion.button>
          </div>
          {editMode ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={10}
                className="w-full rounded-[12px] border border-[#EEEFE9] bg-[#EEEFE9] px-4 py-3 text-[12px] text-[#0E0F10] font-mono outline-none resize-vertical focus:border-[#0E0F10] focus:ring-2 focus:ring-ink-500/10 transition-[border-color,box-shadow] duration-150"
                placeholder='{"squad": "AUDIOVISUAL", "mood": "elegante"}'
              />
              <div className="flex gap-2">
                <motion.button onClick={() => setEditMode(false)}
                  className="flex-1 rounded-[12px] bg-[#EEEFE9] py-2.5 text-[13px] font-semibold text-[#5E5E5F]"
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  Cancelar
                </motion.button>
                <motion.button onClick={handleSaveBriefing} disabled={saving}
                  className="flex-1 rounded-[12px] bg-[#0E0F10] py-2.5 text-[13px] font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Save size={14} />
                  {saving ? "Salvando..." : "Salvar Briefing"}
                </motion.button>
              </div>
            </div>
          ) : briefingLimpo.length > 0 ? (
            <div className="rounded-[12px] bg-[#EEEFE9] p-4 space-y-2">
              {briefingLimpo.map(([k, v]) => (
                <div key={k} className="flex gap-2 text-[13px]">
                  <span className="font-semibold text-[#0E0F10] capitalize min-w-[100px] flex-shrink-0">{k}:</span>
                  <span className="text-[#5E5E5F]">{Array.isArray(v) ? v.join(", ") : String(v)}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={FileText} text="Nenhum briefing preenchido ainda. Clique em Editar para adicionar." />
          )}
        </div>

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
      </div>
    );
  }

  if (["tarefas","planejamento","posts"].includes(tab)) {
    return (
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5] mb-3">
          {tarefas.length > 0 ? `${tarefasConcluidas} de ${tarefas.length} concluídas` : "Sem tarefas definidas"}
        </p>
        {tarefas.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {tarefas.map((t, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 rounded-[12px] px-3 py-2.5"
                style={{ backgroundColor: t.concluido ? "#E6F4EA" : "#FAFAFA" }}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                {t.concluido ? <CheckCircle2 size={16} color="#43A047" /> : <Square size={16} color="#A9AAA5" />}
                <span className="text-[13px] font-semibold" style={{ color: t.concluido ? "#2E7D32" : "#0E0F10" }}>{t.titulo}</span>
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
          <EmptyState icon={Lightbulb} text="Decisões serão registradas durante o projeto." />
        )}
      </div>
    );
  }

  if (tab === "referencias") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Referências</p>
        </div>
        <motion.div
          className="rounded-[12px] border-2 border-dashed border-[#D9D9D4] p-8 flex flex-col items-center gap-3 cursor-pointer text-center"
          whileHover={{ borderColor: "#0E0F10", backgroundColor: "#EEEFE9" }}
          whileTap={{ scale: 0.99 }}
        >
          <Upload size={24} color="#A9AAA5" />
          <div>
            <p className="text-[14px] font-semibold text-[#5E5E5F]">Subir referências</p>
            <p className="text-[12px] text-[#A9AAA5] mt-0.5">Imagens, links, PDFs, screenshots</p>
          </div>
          <motion.div
            className="mt-1 rounded-[12px] bg-[#0E0F10] px-4 py-2 text-[12px] font-semibold text-white"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          >
            Escolher arquivos
          </motion.div>
        </motion.div>
        {!!briefing.referencias && (
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(briefing.referencias) ? briefing.referencias : [briefing.referencias]).map((ref, i) => (
              <span key={i} className="rounded-[8px] bg-[#EEEFE9] px-3 py-1.5 text-[12px] font-semibold text-[#0E0F10]">
                {String(ref)}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (tab === "historico") {
    return (
      <div>
        {pedido.history.length === 0 ? (
          <EmptyState icon={Activity} text="Nenhuma atividade registrada ainda." />
        ) : (
          <div className="flex flex-col gap-3">
            {pedido.history.map((h, i) => (
              <motion.div key={h.id} className="flex items-start gap-3"
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}>
                <div className="mt-1.5 h-2 w-2 rounded-full bg-[#D7FF00] flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-[#0E0F10]">{h.action}</p>
                  {Object.keys(h.metadata).length > 0 && (
                    <p className="text-[11px] text-[#A9AAA5] mt-0.5">
                      {Object.entries(h.metadata).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                    </p>
                  )}
                </div>
                <span className="text-[11px] text-[#A9AAA5] flex-shrink-0">
                  {new Date(h.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return <EmptyState icon={Rocket} text="Esta etapa será preenchida conforme o projeto avança." />;
}

// ─── Upload de Resultado ─────────────────────────────────────────────────────

function UploadResultado({ tipo }: { tipo: PedidoTipo }) {
  const [arquivos, setArquivos] = useState<{ file: File; url: string }[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processarArquivos = (files: FileList | null) => {
    if (!files) return;
    const novos = Array.from(files)
      .filter(f => f.type.startsWith("image/") || f.type.startsWith("video/"))
      .map(f => ({ file: f, url: URL.createObjectURL(f) }));
    setArquivos(prev => [...prev, ...novos]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    processarArquivos(e.dataTransfer.files);
  };
  const handleRemover = (idx: number) => {
    setArquivos(prev => {
      URL.revokeObjectURL(prev[idx].url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  return (
    <div className="rounded-[16px] bg-white p-5 flex flex-col gap-3">
      <p className="text-[11px] font-bold text-[#A9AAA5] uppercase tracking-wide">
        Resultado {arquivos.length > 0 && <span className="text-[#0E0F10]">({arquivos.length})</span>}
      </p>

      {/* Previews */}
      {arquivos.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {arquivos.map((arq, i) => (
            <motion.div key={i} className="relative rounded-[12px] overflow-hidden group"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}>
              {arq.file.type.startsWith("image/") ? (
                <img src={arq.url} alt="" className="w-full h-[80px] object-cover rounded-[12px]" />
              ) : (
                <div className="w-full h-[80px] rounded-[12px] bg-[#0E0F10] flex items-center justify-center">
                  <span className="text-[10px] font-bold text-[#D7FF00]">VÍDEO</span>
                </div>
              )}
              <motion.button
                onClick={() => handleRemover(i)}
                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-[#0E0F10]/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
                <X size={10} color="white" />
              </motion.button>
              <div className="mt-1 text-[9px] text-[#A9AAA5] truncate px-0.5">{arq.file.name}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <motion.div
        className="rounded-[12px] border-2 border-dashed p-5 flex flex-col items-center gap-2 cursor-pointer text-center"
        style={{ borderColor: isDragOver ? "#0E0F10" : "#D9D9D4" }}
        animate={{ backgroundColor: isDragOver ? "#EEEFE9" : "transparent" }}
        transition={{ duration: 0.15 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        whileHover={{ borderColor: "#0E0F10", backgroundColor: "#EEEFE9" }}
        whileTap={{ scale: 0.99 }}
      >
        <Upload size={18} color={isDragOver ? "#0E0F10" : "#A9AAA5"} />
        <p className="text-[11px] font-semibold text-[#5E5E5F]">
          {isDragOver ? "Solte para adicionar" : "Upload ou arraste"}
        </p>
        <p className="text-[9px] text-[#A9AAA5]">Imagens, vídeos · múltiplos arquivos</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => processarArquivos(e.target.files)}
        />
      </motion.div>
    </div>
  );
}

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
