"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { TabContent } from "@/components/ui/tab-content";
import {
  TrendingUp, TrendingDown, Zap, CheckCircle2,
  Activity, BarChart3, Download, ArrowUpRight, Cpu,
  Bot, Sparkles, Shield, Clock, AlertCircle, Flame,
  FileVideo, Camera, Globe, Palette, MessageSquare, Users, Layers,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type KpiHero = {
  label: string;
  value: number;
  trend?: number;
  suffix?: string;
  dark?: boolean;
  limao?: boolean;
  live?: boolean;
  context?: string;
};

type AgentStatus = "active" | "processing" | "idle";
type Agent = { id: string; label: string; load: number; status: AgentStatus };
type LogEntry = { id: number; text: string };
type LucideIcon = React.ComponentType<{ size?: number; color?: string; className?: string }>;
type ChartView = "volume" | "squad" | "eficiencia";
type OrcView = "atual" | "historico";
type PedidoTab = "todos" | "revisao" | "atrasados";

// ─── Constantes de layout ─────────────────────────────────────────────────────

const ACTIVITY_H = 58;
const MAX_ACTIVITIES = 5;
const LOG_H = 27;
const MAX_LOGS = 4;

// ─── Dados mockados ──────────────────────────────────────────────────────────

const SERIE_INICIAL = [
  { mes: "Ago", pedidos: 24, entregues: 16 },
  { mes: "Set", pedidos: 31, entregues: 21 },
  { mes: "Out", pedidos: 38, entregues: 27 },
  { mes: "Nov", pedidos: 44, entregues: 32 },
  { mes: "Dez", pedidos: 52, entregues: 38 },
  { mes: "Jan", pedidos: 58, entregues: 43 },
  { mes: "Fev", pedidos: 67, entregues: 51 },
  { mes: "Mar", pedidos: 72, entregues: 56 },
];

// Dados por squad para a view "Por Squad" do gráfico de produção
const SERIE_SQUAD_BASE = [
  { mes: "Ago", audiovisual: 18, dev: 6 },
  { mes: "Set", audiovisual: 24, dev: 7 },
  { mes: "Out", audiovisual: 29, dev: 9 },
  { mes: "Nov", audiovisual: 34, dev: 10 },
  { mes: "Dez", audiovisual: 40, dev: 12 },
  { mes: "Jan", audiovisual: 43, dev: 15 },
  { mes: "Fev", audiovisual: 50, dev: 17 },
  { mes: "Mar", audiovisual: 54, dev: 18 },
];

// Dados de eficiência calculados (entregues/pedidos × 100)
const SERIE_EFICIENCIA_BASE = SERIE_INICIAL.map((d) => ({
  mes: d.mes,
  eficiencia: Math.round((d.entregues / d.pedidos) * 100),
}));

// Histórico de carga por agente (8 períodos)
const AGENTES_HISTORICO = [
  { id: "planner", label: "Planner", historico: [70, 75, 80, 85, 82, 88, 91, 87], pico: 91 },
  { id: "copy", label: "Copywriter", historico: [45, 50, 58, 55, 65, 70, 68, 63], pico: 70 },
  { id: "arte", label: "Dir. de Arte", historico: [80, 85, 90, 88, 92, 95, 93, 91], pico: 95 },
  { id: "cena", label: "Dir. de Cena", historico: [30, 25, 20, 15, 18, 22, 20, 22], pico: 30 },
  { id: "qa", label: "QA Review", historico: [40, 45, 50, 55, 58, 55, 55, 55], pico: 58 },
  { id: "dev", label: "Dev Squad", historico: [60, 65, 70, 75, 80, 78, 82, 78], pico: 82 },
];

const SPARKLINE_HERO = [12, 18, 15, 22, 28, 24, 31, 35, 38, 42, 39, 47, 52, 56, 61, 58, 67, 72, 68, 77, 82, 79, 88, 95];

const DADOS_STATUS = [
  { status: "entregue", label: "Entregue", value: 47, cor: "#D7FF00", insight: "Alta — dentro do esperado", critico: false },
  { status: "em_andamento", label: "Em andamento", value: 23, cor: "#2A2B2C", insight: "Normal para o período", critico: false },
  { status: "revisao", label: "Em revisão", value: 12, cor: "#FB8C00", insight: "Acima da média", critico: true },
  { status: "aguardando", label: "Aguardando", value: 9, cor: "#8A8B8C", insight: "Dentro do esperado", critico: false },
  { status: "cancelado", label: "Cancelado", value: 4, cor: "#E53935", insight: "Sob controle", critico: false },
];

const DADOS_TIPO: Array<{ tipo: string; value: number; Icon: LucideIcon }> = [
  { tipo: "Vídeo", value: 38, Icon: FileVideo },
  { tipo: "Imagem", value: 27, Icon: Camera },
  { tipo: "Landing page", value: 18, Icon: Globe },
  { tipo: "Branding", value: 10, Icon: Palette },
  { tipo: "Outros", value: 7, Icon: MessageSquare },
];

const AGENTES_INICIAL: Agent[] = [
  { id: "planner", label: "Planner", load: 87, status: "processing" },
  { id: "copy", label: "Copywriter", load: 63, status: "active" },
  { id: "arte", label: "Dir. de Arte", load: 91, status: "processing" },
  { id: "cena", label: "Dir. de Cena", load: 22, status: "idle" },
  { id: "qa", label: "QA Review", load: 55, status: "active" },
  { id: "dev", label: "Dev Squad", load: 78, status: "processing" },
];

const SQUADS = [
  { id: "audiovisual", label: "Audiovisual Squad", volume: 67, conclusao: 89, tempo: "3.2d" },
  { id: "dev", label: "Dev Squad", volume: 28, conclusao: 82, tempo: "5.1d" },
];

const INSIGHTS = [
  { Icon: TrendingUp, text: "Vídeos cresceram 23% no período", tipo: "positivo" },
  { Icon: TrendingDown, text: "Revisões caíram 12% vs. mês anterior", tipo: "positivo" },
  { Icon: Flame, text: "Quinta foi o dia com maior volume", tipo: "neutro" },
  { Icon: Bot, text: "Copywriter operou acima da média", tipo: "positivo" },
];

const LOG_POOL = [
  "Planner alocado para novo pedido",
  "Copywriter finalizou roteiro #049",
  "Dir. de Arte aguarda aprovação",
  "QA detectou inconsistência visual",
  "Dev Squad iniciou build automático",
  "Orquestrador redistribuiu carga",
  "Creator confirmou disponibilidade",
  "Prompt gerado com sucesso",
  "Pipeline de vídeo iniciado",
  "Artefato entregue para revisão",
  "Planner iniciou briefing #048",
  "Deploy automático concluído",
];

const ACTIVITIES_POOL: Array<{ Icon: LucideIcon; text: string; color: string }> = [
  { Icon: CheckCircle2, text: "Pedido #047 entregue com sucesso", color: "#43A047" },
  { Icon: Zap, text: "Planner iniciou briefing #048", color: "#B8D900" },
  { Icon: Palette, text: "Dir. de Arte solicitou revisão", color: "#FB8C00" },
  { Icon: Bot, text: "Agente QA detectou inconsistência", color: "#5E5E5F" },
  { Icon: FileVideo, text: "Novo pedido criado: Campanha Q2", color: "#0E0F10" },
  { Icon: Sparkles, text: "Prompt gerado para pedido #046", color: "#B8D900" },
  { Icon: Users, text: "Creator confirmada para pedido #045", color: "#5E5E5F" },
  { Icon: ArrowUpRight, text: "Deploy automático concluído", color: "#43A047" },
];

const PEDIDOS_MOCK = [
  { titulo: "Campanha Verão 2026 — Ninaah", tipo: "Vídeo", status: "em_andamento", creator: "Ninaah D.", dias: 2, Icon: FileVideo },
  { titulo: "Landing Page Produto X", tipo: "Landing page", status: "revisao", creator: null, dias: 5, Icon: Globe },
  { titulo: "Fotos de produto linha premium", tipo: "Imagem", status: "entregue", creator: "Ninaah D.", dias: 8, Icon: Camera },
  { titulo: "Branding identidade visual", tipo: "Branding", status: "aprovado", creator: null, dias: 12, Icon: Palette },
  { titulo: "Vídeo institucional Q1", tipo: "Vídeo", status: "entregue", creator: "Ninaah D.", dias: 15, Icon: FileVideo },
  { titulo: "Hotsite lançamento app", tipo: "Landing page", status: "em_andamento", creator: null, dias: 18, Icon: Globe },
];

const STATUS_MAP: Record<string, { cor: string; label: string }> = {
  em_andamento: { cor: "#2A2B2C", label: "Em andamento" },
  revisao: { cor: "#FB8C00", label: "Revisão" },
  entregue: { cor: "#43A047", label: "Entregue" },
  aprovado: { cor: "#1976D2", label: "Aprovado" },
};

const KPIS_HERO: KpiHero[] = [
  { label: "Total de pedidos", value: 95, trend: 12, dark: true },
  { label: "Em andamento", value: 23, trend: 3, limao: true, live: true, context: "+3 vs. semana passada" },
  { label: "Entregues", value: 47, trend: 18, context: "+18 este mês" },
  { label: "Taxa de aprovação", value: 94, suffix: "%", trend: 2, context: "Meta: 90%" },
];

const PERIODO_OPTIONS = [
  { value: "semana", label: "7 dias" },
  { value: "mes", label: "30 dias" },
  { value: "trimestre", label: "90 dias" },
  { value: "ano", label: "12 meses" },
] as const;

const CHART_VIEWS = [
  { id: "volume" as ChartView, label: "Volume" },
  { id: "squad" as ChartView, label: "Por Squad" },
  { id: "eficiencia" as ChartView, label: "Eficiência" },
];

const ORC_VIEWS = [
  { id: "atual" as OrcView, label: "Carga atual" },
  { id: "historico" as OrcView, label: "Histórico" },
];

const PEDIDO_TABS = [
  { id: "todos" as PedidoTab, label: "Todos", count: PEDIDOS_MOCK.length },
  { id: "revisao" as PedidoTab, label: "Em revisão", count: PEDIDOS_MOCK.filter((p) => p.status === "revisao").length },
  { id: "atrasados" as PedidoTab, label: "Atrasados", count: PEDIDOS_MOCK.filter((p) => p.dias > 7).length },
];

// ─── Utilitários ──────────────────────────────────────────────────────────────

function gerarSerieProducao() {
  const nomes = ["Ago", "Set", "Out", "Nov", "Dez", "Jan", "Fev", "Mar"];
  return nomes.map((mes, i) => ({
    mes,
    pedidos: Math.floor(20 + i * 6 + Math.random() * 14),
    entregues: Math.floor(14 + i * 4.5 + Math.random() * 10),
  }));
}

function computeStatus(load: number): AgentStatus {
  if (load > 80) return "processing";
  if (load > 30) return "active";
  return "idle";
}

// ─── Componentes base ─────────────────────────────────────────────────────────

function AnimatedCount({ target, delay = 0, suffix = "" }: {
  target: number; delay?: number; suffix?: string;
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      let val = 0;
      const duration = 1200;
      const step = 16;
      const inc = target / (duration / step);
      const timer = setInterval(() => {
        val += inc;
        if (val >= target) { setDisplay(target); clearInterval(timer); }
        else setDisplay(Math.floor(val));
      }, step);
      return () => clearInterval(timer);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, delay]);
  return <>{display.toLocaleString("pt-BR")}{suffix}</>;
}

function LivePulseDot({ color = "#D7FF00", sizePx = 9 }: { color?: string; sizePx?: number }) {
  return (
    <span className="relative flex flex-shrink-0" style={{ width: sizePx, height: sizePx }}>
      <motion.span
        className="absolute inline-flex h-full w-full rounded-full"
        style={{ backgroundColor: color, opacity: 0.75 }}
        animate={{ scale: [1, 2.2, 1], opacity: [0.75, 0, 0.75] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="relative inline-flex h-full w-full rounded-full" style={{ backgroundColor: color }} />
    </span>
  );
}

function AnimatedBar({ value, max, color, delay = 0, height = 6 }: {
  value: number; max: number; color: string; delay?: number; height?: number;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="relative w-full rounded-full overflow-hidden" style={{ height, backgroundColor: "rgba(14,15,16,0.07)" }}>
      <motion.div
        className="absolute left-0 top-0 h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%`, backgroundColor: color }}
        transition={{ duration: 0.7, ease: [0, 0, 0.2, 1], delay }}
      />
    </div>
  );
}

function MiniSparkline({ data, color, height = 48 }: { data: number[]; color: string; height?: number }) {
  const chartData = data.map((v, i) => ({ i, v }));
  const gradId = `spark-${color.replace("#", "")}`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 2 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="basis"
          dataKey="v"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradId})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Tabs compactas para uso dentro de cards brancos
function MiniTabBar({ tabs, active, onChange }: {
  tabs: Array<{ id: string; label: string; count?: number }>;
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex items-center rounded-[12px] p-1 gap-0.5" style={{ backgroundColor: "#EEEFE9" }}>
      {tabs.map((t) => (
        <motion.button
          key={t.id}
          onClick={() => onChange(t.id)}
          className="flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[12px] font-semibold"
          animate={{
            backgroundColor: active === t.id ? "#FFFFFF" : "transparent",
            color: active === t.id ? "#0E0F10" : "#A9AAA5",
          }}
          initial={false}
          whileHover={active !== t.id ? { backgroundColor: "rgba(255,255,255,0.55)", color: "#0E0F10" } : {}}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
        >
          {t.label}
          {t.count !== undefined && (
            <motion.span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              animate={{
                backgroundColor: active === t.id ? "#EEEFE9" : "rgba(169,170,165,0.15)",
                color: active === t.id ? "#0E0F10" : "#A9AAA5",
              }}
              initial={false}
              transition={{ duration: 0.15 }}
            >
              {t.count}
            </motion.span>
          )}
        </motion.button>
      ))}
    </div>
  );
}

function HubiaTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[12px] bg-[#0E0F10] px-3.5 py-3 text-white min-w-[130px]">
      <p className="text-[10px] text-[#6A6B6C] mb-2.5 font-bold tracking-widest uppercase">{label}</p>
      {payload.map((item) => (
        <div key={item.name} className="flex items-center justify-between gap-4 mb-1.5 last:mb-0">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-[11px] text-[#8A8B8C]">{item.name}</span>
          </div>
          <span className="text-[15px] font-bold">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Gráficos de Produção — 3 views ──────────────────────────────────────────

// View 1: Volume (Pedidos vs. Entregues) — FIX: margens corretas, sem corte
function ProducaoVolumeChart({ periodo }: { periodo: string }) {
  const [dados, setDados] = useState(SERIE_INICIAL);

  useEffect(() => {
    setDados(gerarSerieProducao());
  }, [periodo]);

  useEffect(() => {
    const timer = setInterval(() => {
      setDados((prev) => {
        const novo = [...prev];
        const last = { ...novo[novo.length - 1] };
        last.pedidos = Math.max(10, last.pedidos + Math.floor(Math.random() * 6 - 2));
        last.entregues = Math.max(5, last.entregues + Math.floor(Math.random() * 4 - 1));
        novo[novo.length - 1] = last;
        return novo;
      });
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <ResponsiveContainer width="100%" height={280}>
      {/* FIX: margem left positiva (8) + right (40) + XAxis padding (28) dão respiro real nas bordas */}
      <AreaChart data={dados} margin={{ top: 10, right: 40, left: 8, bottom: 4 }}>
        <defs>
          <linearGradient id="gradVolPedidos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D7FF00" stopOpacity={0.45} />
            <stop offset="70%" stopColor="#D7FF00" stopOpacity={0.08} />
            <stop offset="100%" stopColor="#D7FF00" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradVolEntregues" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0E0F10" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#0E0F10" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="mes"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "#A9AAA5", fontFamily: "Urbanist", fontWeight: 600 }}
          padding={{ left: 28, right: 28 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "#A9AAA5", fontFamily: "Urbanist" }}
          width={36}
        />
        <Tooltip content={<HubiaTooltip />} cursor={{ stroke: "rgba(14,15,16,0.06)", strokeWidth: 1 }} />
        <Area type="basis" dataKey="pedidos" name="Pedidos" stroke="#D7FF00" strokeWidth={3}
          fill="url(#gradVolPedidos)" dot={false} animationDuration={900} animationEasing="ease-out" />
        <Area type="basis" dataKey="entregues" name="Entregues" stroke="#0E0F10" strokeWidth={2}
          fill="url(#gradVolEntregues)" dot={false} animationDuration={900} animationEasing="ease-out" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// View 2: Por Squad — BarChart agrupado Audiovisual vs. Dev Squad
function ProducaoSquadChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={SERIE_SQUAD_BASE} margin={{ top: 10, right: 40, left: 8, bottom: 4 }} barGap={4} barCategoryGap="35%">
        <XAxis
          dataKey="mes"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "#A9AAA5", fontFamily: "Urbanist", fontWeight: 600 }}
          padding={{ left: 16, right: 16 }}
        />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#A9AAA5", fontFamily: "Urbanist" }} width={36} />
        <Tooltip content={<HubiaTooltip />} cursor={{ fill: "rgba(14,15,16,0.03)" }} />
        <Bar dataKey="audiovisual" name="Audiovisual" fill="#D7FF00" radius={[4, 4, 0, 0]} animationDuration={800} />
        <Bar dataKey="dev" name="Dev Squad" fill="#0E0F10" radius={[4, 4, 0, 0]} animationDuration={800} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// View 3: Eficiência — LineChart mostrando % de entrega ao longo do tempo
function ProducaoEficienciaChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={SERIE_EFICIENCIA_BASE} margin={{ top: 10, right: 40, left: 8, bottom: 4 }}>
        <defs>
          <linearGradient id="gradEfic" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#D7FF00" stopOpacity={0} />
            <stop offset="100%" stopColor="#D7FF00" stopOpacity={0.15} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="mes"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "#A9AAA5", fontFamily: "Urbanist", fontWeight: 600 }}
          padding={{ left: 28, right: 28 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "#A9AAA5", fontFamily: "Urbanist" }}
          domain={[50, 100]}
          tickFormatter={(v) => `${v}%`}
          width={40}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="rounded-[12px] bg-[#0E0F10] px-3.5 py-3 text-white min-w-[120px]">
                <p className="text-[10px] text-[#6A6B6C] mb-2 font-bold tracking-widest uppercase">{label}</p>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D7FF00]" />
                    <span className="text-[11px] text-[#8A8B8C]">Eficiência</span>
                  </div>
                  <span className="text-[15px] font-bold">{payload[0].value}%</span>
                </div>
              </div>
            );
          }}
          cursor={{ stroke: "rgba(14,15,16,0.06)", strokeWidth: 1 }}
        />
        <Line
          type="monotoneX"
          dataKey="eficiencia"
          name="Eficiência"
          stroke="#D7FF00"
          strokeWidth={3}
          dot={{ r: 4, fill: "#D7FF00", strokeWidth: 0 }}
          activeDot={{ r: 6, fill: "#D7FF00", strokeWidth: 0 }}
          animationDuration={800}
          animationEasing="ease-out"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Container do gráfico com tabs de view
function ProducaoChartContainer({ periodo }: { periodo: string }) {
  const [view, setView] = useState<ChartView>("volume");
  const [dir, setDir] = useState(1);
  const viewOrder = ["volume", "squad", "eficiencia"];

  function handleViewChange(newView: string) {
    const fromIdx = viewOrder.indexOf(view);
    const toIdx = viewOrder.indexOf(newView);
    setDir(toIdx > fromIdx ? 1 : -1);
    setView(newView as ChartView);
  }

  const legends: Record<ChartView, React.ReactNode> = {
    volume: (
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-5 rounded-full" style={{ backgroundColor: "#D7FF00" }} />
          <span className="text-[11px] font-semibold text-[#A9AAA5]">Pedidos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-5 rounded-full bg-[#0E0F10]" />
          <span className="text-[11px] font-semibold text-[#A9AAA5]">Entregues</span>
        </div>
      </div>
    ),
    squad: (
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-5 rounded-full" style={{ backgroundColor: "#D7FF00" }} />
          <span className="text-[11px] font-semibold text-[#A9AAA5]">Audiovisual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-5 rounded-full bg-[#0E0F10]" />
          <span className="text-[11px] font-semibold text-[#A9AAA5]">Dev Squad</span>
        </div>
      </div>
    ),
    eficiencia: (
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-5 rounded-full" style={{ backgroundColor: "#D7FF00" }} />
        <span className="text-[11px] font-semibold text-[#A9AAA5]">Taxa de entrega (%) por mês</span>
      </div>
    ),
  };

  const titles: Record<ChartView, string> = {
    volume: "Produção ao longo do tempo",
    squad: "Volume por squad",
    eficiencia: "Eficiência de entrega",
  };

  const subtitles: Record<ChartView, string> = {
    volume: "Pedidos criados vs. entregues",
    squad: "Audiovisual Squad vs. Dev Squad",
    eficiencia: "% de pedidos entregues no prazo",
  };

  return (
    <>
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-[#0E0F10]">{titles[view]}</h2>
          <p className="text-[11px] text-[#A9AAA5] mt-0.5">{subtitles[view]}</p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          {legends[view]}
          <MiniTabBar tabs={CHART_VIEWS} active={view} onChange={handleViewChange} />
        </div>
      </div>

      <TabContent tabKey={view} direction={dir}>
        {view === "volume" && <ProducaoVolumeChart periodo={periodo} />}
        {view === "squad" && <ProducaoSquadChart />}
        {view === "eficiencia" && <ProducaoEficienciaChart />}
      </TabContent>
    </>
  );
}

// ─── Saúde Operacional ────────────────────────────────────────────────────────

function SaudeOperacional() {
  const score = 82;
  const statusColor = "#4CAF50";
  const statusLabel = "Estável";

  const alertas = [
    { Icon: CheckCircle2, text: "Entregues em alta tendência", tipo: "ok" },
    { Icon: AlertCircle, text: "2 pedidos em revisão acima do ideal", tipo: "alerta" },
    { Icon: Clock, text: "Dir. de Arte com carga elevada", tipo: "alerta" },
    { Icon: CheckCircle2, text: "Aprovações dentro do esperado", tipo: "ok" },
  ];

  return (
    <motion.div
      className="rounded-[20px] bg-[#0E0F10] p-6 flex flex-col"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0, 0, 0.2, 1], delay: 0.18 }}
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#4A4B4C" }}>Saúde operacional</p>
          <h2 className="text-[22px] font-bold text-white mt-1 leading-tight">
            Operação <span style={{ color: statusColor }}>{statusLabel}</span>
          </h2>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-[12px]" style={{ backgroundColor: `${statusColor}20` }}>
          <Shield size={18} color={statusColor} />
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-end justify-between mb-2.5">
          <motion.span
            className="font-bold leading-none"
            style={{ fontSize: 56, color: statusColor }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {score}
          </motion.span>
          <span className="text-[13px] font-semibold mb-2" style={{ color: "#4A4B4C" }}>/100</span>
        </div>
        <AnimatedBar value={score} max={100} color={statusColor} height={4} delay={0.35} />
      </div>

      <div className="flex flex-col gap-3.5 flex-1">
        {alertas.map((a, i) => (
          <motion.div
            key={i}
            className="flex items-start gap-2.5"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.38 + i * 0.07 }}
          >
            <a.Icon size={13} color={a.tipo === "ok" ? "#4CAF50" : "#FB8C00"} className="flex-shrink-0 mt-0.5" />
            <span
              className="text-[12px] font-medium leading-snug"
              style={{ color: a.tipo === "alerta" ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.42)" }}
            >
              {a.text}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="mt-5 pt-4 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-1.5">
          <Users size={12} color="#4A4B4C" />
          <span className="text-[11px] font-semibold" style={{ color: "#4A4B4C" }}>Creators ativas</span>
        </div>
        <span className="text-[20px] font-bold text-white">6</span>
      </div>
    </motion.div>
  );
}

// ─── Status dos Pedidos ───────────────────────────────────────────────────────

function StatusPedidos() {
  const total = DADOS_STATUS.reduce((acc, s) => acc + s.value, 0);

  return (
    <motion.div
      className="rounded-[20px] bg-white p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0, 0, 0.2, 1], delay: 0.35 }}
    >
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 size={15} color="#0E0F10" />
        <div>
          <h2 className="text-[15px] font-bold text-[#0E0F10]">Status dos pedidos</h2>
          <p className="text-[11px] text-[#A9AAA5]">Leitura operacional</p>
        </div>
      </div>

      <div className="flex h-2 w-full rounded-full overflow-hidden mb-6" style={{ gap: 2 }}>
        {DADOS_STATUS.map((s, i) => (
          <motion.div
            key={s.status}
            className="h-full rounded-full"
            style={{ backgroundColor: s.cor }}
            initial={{ flexGrow: 0 }}
            animate={{ flexGrow: s.value }}
            transition={{ duration: 1.1, ease: [0, 0, 0.2, 1], delay: 0.38 + i * 0.05 }}
          />
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {DADOS_STATUS.map((s, i) => (
          <motion.div
            key={s.status}
            className="flex flex-col gap-1.5 cursor-default"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.42 + i * 0.06 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.cor }} />
                <span className="text-[13px] font-semibold text-[#0E0F10]">{s.label}</span>
                {s.critico && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#FB8C0015", color: "#FB8C00" }}>
                    atenção
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-medium" style={{ color: "#A9AAA5" }}>{s.insight}</span>
                <span className="text-[16px] font-bold text-[#0E0F10]">{s.value}</span>
                <span className="text-[10px] font-semibold w-8 text-right" style={{ color: "#C8C9C4" }}>
                  {Math.round((s.value / total) * 100)}%
                </span>
              </div>
            </div>
            <AnimatedBar value={s.value} max={total} color={s.cor} delay={0.48 + i * 0.06} height={5} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Distribuição por tipo ────────────────────────────────────────────────────

function DistribuicaoTipo() {
  const maxVal = Math.max(...DADOS_TIPO.map((d) => d.value));

  return (
    <motion.div
      className="rounded-[20px] bg-white p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0, 0, 0.2, 1], delay: 0.38 }}
    >
      <div className="mb-5">
        <h2 className="text-[15px] font-bold text-[#0E0F10]">Por tipo de pedido</h2>
        <p className="text-[11px] text-[#A9AAA5] mt-0.5">Ranking de volume no período</p>
      </div>

      <div className="flex flex-col gap-4">
        {DADOS_TIPO.map((d, i) => {
          const isFirst = i === 0;
          const IconComp = d.Icon;
          const barColor = isFirst ? "#D7FF00" : i === 1 ? "#2A2B2C" : "#D9D9D4";
          return (
            <motion.div
              key={d.tipo}
              className="flex flex-col gap-2"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.42 + i * 0.08 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-bold w-4 text-right" style={{ color: isFirst ? "#D7FF00" : "#D4D5D6" }}>
                    {i + 1}
                  </span>
                  <div className="flex h-6 w-6 items-center justify-center rounded-[7px]" style={{ backgroundColor: isFirst ? "#D7FF0022" : "#EEEFE9" }}>
                    <IconComp size={12} color={isFirst ? "#B8D900" : "#A9AAA5"} />
                  </div>
                  <span className="text-[13px] font-semibold text-[#0E0F10]">{d.tipo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-bold" style={{ color: isFirst ? "#0E0F10" : "#5E5E5F" }}>{d.value}%</span>
                  {isFirst && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#D7FF00", color: "#0E0F10" }}>
                      líder
                    </span>
                  )}
                </div>
              </div>
              <AnimatedBar value={d.value} max={maxVal} color={barColor} delay={0.48 + i * 0.08} height={isFirst ? 8 : 5} />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Uso de IA ────────────────────────────────────────────────────────────────

function UsoIA() {
  const metricas = [
    { label: "Prompts processados", value: "1.847", sub: "no período", trend: "+12%" },
    { label: "Custo estimado", value: "R$ 38", sub: "dentro do orçamento", trend: "-8%" },
    { label: "Taxa de sucesso", value: "97.2%", sub: "acima da meta 95%", trend: "+2.2pp" },
    { label: "Provedor principal", value: "OpenAI", sub: "GPT-4o · 89% das req.", trend: "estável" },
  ];

  return (
    <motion.div
      className="rounded-[20px] bg-white p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0, 0, 0.2, 1], delay: 0.42 }}
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-[10px]" style={{ backgroundColor: "#D7FF0018" }}>
          <Sparkles size={14} color="#B8D900" />
        </div>
        <div>
          <h2 className="text-[15px] font-bold text-[#0E0F10]">Uso de IA</h2>
          <p className="text-[10px] text-[#A9AAA5]">Consumo inteligente no período</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {metricas.map((m, i) => (
          <motion.div
            key={m.label}
            className="rounded-[14px] p-3.5 flex flex-col gap-2"
            style={{ backgroundColor: "#EEEFE9" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.48 + i * 0.07 }}
          >
            <p className="text-[20px] font-bold text-[#0E0F10] leading-none">{m.value}</p>
            <div>
              <p className="text-[10px] text-[#A9AAA5] leading-tight">{m.label}</p>
              <p className="text-[9px] font-bold mt-0.5" style={{ color: "#B8D900" }}>{m.sub}</p>
            </div>
            <div className="flex items-center gap-1 mt-auto">
              <TrendingUp size={9} color="#43A047" />
              <span className="text-[9px] font-bold" style={{ color: "#43A047" }}>{m.trend}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Orquestrador Monitor com 2 views ────────────────────────────────────────

function agentStatusConfig(load: number) {
  if (load > 80) return { color: "#FB8C00", label: "Sobrecarregado", bg: "#FB8C0012" };
  if (load > 30) return { color: "#D7FF00", label: "Ativo", bg: "#D7FF0012" };
  return { color: "#8A8B8C", label: "Livre", bg: "#8A8B8C12" };
}

function OrquestradorMonitor() {
  const [view, setView] = useState<OrcView>("atual");
  const [dir, setDir] = useState(1);
  const [agentes, setAgentes] = useState(AGENTES_INICIAL);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 0, text: "Planner iniciou briefing #047" },
    { id: 1, text: "Dir. de Arte concluiu aprovação" },
    { id: 2, text: "QA solicitado para pedido #044" },
    { id: 3, text: "Dev Squad em deploy automático" },
  ]);
  const logIdRef = useRef(10);

  useEffect(() => {
    const loadTimer = setInterval(() => {
      setAgentes((prev) =>
        prev.map((a) => {
          const novoLoad = Math.round(Math.max(5, Math.min(99, a.load + (Math.random() * 14 - 7))));
          return { ...a, load: novoLoad, status: computeStatus(novoLoad) };
        })
      );
    }, 2200);

    const logTimer = setInterval(() => {
      const novoLog = LOG_POOL[Math.floor(Math.random() * LOG_POOL.length)];
      const id = logIdRef.current++;
      setLogs((prev) => [{ id, text: novoLog }, ...prev.slice(0, MAX_LOGS - 1)]);
    }, 3000);

    return () => {
      clearInterval(loadTimer);
      clearInterval(logTimer);
    };
  }, []);

  function handleOrcView(newView: string) {
    setDir(newView === "historico" ? 1 : -1);
    setView(newView as OrcView);
  }

  return (
    <div className="flex flex-col gap-4">
      <MiniTabBar tabs={ORC_VIEWS} active={view} onChange={handleOrcView} />

      <TabContent tabKey={view} direction={dir}>
        {view === "atual" ? (
          /* View: Carga atual — grid de agentes com barras animadas */
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {agentes.map((ag) => {
                const { color, label, bg } = agentStatusConfig(ag.load);
                return (
                  <motion.div
                    key={ag.id}
                    className="flex flex-col gap-2.5 rounded-[14px] px-3.5 py-3.5 cursor-default"
                    style={{ backgroundColor: "#EEEFE9" }}
                    whileHover={{ backgroundColor: "#E5E6DF" }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <LivePulseDot color={color} sizePx={7} />
                        <span className="text-[11px] font-bold text-[#0E0F10]">{ag.label}</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ color, backgroundColor: bg }}>
                        {ag.load}%
                      </span>
                    </div>
                    <AnimatedBar value={ag.load} max={100} color={color} height={5} />
                    <span className="text-[10px] font-semibold" style={{ color: "#A9AAA5" }}>{label}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* LIVE log — altura fixa, sem layout shift */}
            <div className="rounded-[16px] bg-[#0E0F10] p-4">
              <div className="flex items-center gap-2 mb-3.5">
                <LivePulseDot color="#D7FF00" sizePx={7} />
                <span className="text-[10px] font-bold text-[#D7FF00] tracking-widest uppercase">Live</span>
                <span className="text-[10px] font-semibold ml-auto" style={{ color: "#3A3B3C" }}>Tempo real</span>
              </div>
              <div style={{ height: LOG_H * MAX_LOGS, overflow: "hidden", position: "relative" }}>
                <AnimatePresence initial={false}>
                  {logs.map((entry, i) => (
                    <motion.div
                      key={entry.id}
                      layout
                      className="absolute left-0 right-0 flex items-start gap-2"
                      style={{ top: i * LOG_H, height: LOG_H }}
                      initial={{ opacity: 0, y: -(LOG_H * 0.5) }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
                    >
                      <span className="text-[11px] flex-shrink-0 font-bold leading-tight" style={{ color: i === 0 ? "#D7FF00" : "rgba(255,255,255,0.2)" }}>›</span>
                      <p className="text-[11px] font-medium leading-tight truncate" style={{ color: i === 0 ? "#FFFFFF" : `rgba(255,255,255,${Math.max(0.15, 0.48 - i * 0.1)})` }}>
                        {entry.text}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        ) : (
          /* View: Histórico — sparkline por agente */
          <div className="flex flex-col gap-3">
            {AGENTES_HISTORICO.map((ag, i) => {
              const maxLoad = Math.max(...ag.historico);
              const statusCfg = agentStatusConfig(ag.historico[ag.historico.length - 1]);
              return (
                <motion.div
                  key={ag.id}
                  className="flex items-center gap-3 rounded-[12px] px-3.5 py-2.5"
                  style={{ backgroundColor: "#EEEFE9" }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <div className="flex items-center gap-1.5 w-28 flex-shrink-0">
                    <LivePulseDot color={statusCfg.color} sizePx={6} />
                    <span className="text-[11px] font-bold text-[#0E0F10] truncate">{ag.label}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <MiniSparkline data={ag.historico} color={statusCfg.color} height={32} />
                  </div>
                  <div className="flex-shrink-0 text-right w-12">
                    <p className="text-[13px] font-bold text-[#0E0F10]">{ag.historico[ag.historico.length - 1]}%</p>
                    <p className="text-[9px] font-semibold" style={{ color: "#A9AAA5" }}>pico {ag.pico}%</p>
                  </div>
                </motion.div>
              );
            })}
            <p className="text-[10px] text-[#A9AAA5] text-center pt-1 font-medium">Últimos 8 períodos de monitoramento</p>
          </div>
        )}
      </TabContent>
    </div>
  );
}

// ─── Activity Feed — altura fixa, sem layout shift ────────────────────────────

function ActivityFeed() {
  const [activities, setActivities] = useState(
    () => ACTIVITIES_POOL.slice(0, MAX_ACTIVITIES).map((a, i) => ({
      ...a, time: i === 0 ? "agora" : `${i * 6} min`, id: i,
    }))
  );
  const nextIdRef = useRef(10);

  useEffect(() => {
    const timer = setInterval(() => {
      const source = ACTIVITIES_POOL[Math.floor(Math.random() * ACTIVITIES_POOL.length)];
      const id = nextIdRef.current++;
      setActivities((prev) => [
        { ...source, time: "agora", id },
        ...prev.slice(0, MAX_ACTIVITIES - 1).map((a, i) => ({ ...a, time: `${(i + 1) * 6} min` })),
      ]);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      className="rounded-[20px] bg-white p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0, 0, 0.2, 1], delay: 0.22 }}
    >
      <div className="flex items-center gap-2 mb-5">
        <Activity size={15} color="#0E0F10" />
        <h2 className="text-[15px] font-bold text-[#0E0F10]">Atividade</h2>
        <LivePulseDot sizePx={7} />
      </div>

      {/* Altura fixa — nunca muda de tamanho por updates */}
      <div style={{ height: ACTIVITY_H * MAX_ACTIVITIES, position: "relative", overflow: "hidden" }}>
        <AnimatePresence initial={false}>
          {activities.map((a, i) => {
            const IconComp = a.Icon;
            return (
              <motion.div
                key={a.id}
                layout
                className="absolute left-0 right-0 flex items-center gap-3"
                style={{
                  top: i * ACTIVITY_H,
                  height: ACTIVITY_H,
                  borderBottom: i < MAX_ACTIVITIES - 1 ? "1px solid #EEEFE9" : "none",
                }}
                initial={{ opacity: 0, y: -(ACTIVITY_H * 0.5) }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.32, ease: [0, 0, 0.2, 1] }}
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px]" style={{ backgroundColor: `${a.color}12` }}>
                  <IconComp size={14} color={a.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold leading-snug truncate" style={{ color: i === 0 ? "#0E0F10" : "#5E5E5F" }}>
                    {a.text}
                  </p>
                  <p className="text-[10px] mt-0.5 font-medium" style={{ color: "#A9AAA5" }}>{a.time}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Pedidos Recentes com tabs de filtro ──────────────────────────────────────

function PedidosRecentes() {
  const [tab, setTab] = useState<PedidoTab>("todos");
  const [dir, setDir] = useState(1);
  const tabOrder = ["todos", "revisao", "atrasados"];

  function handleTabChange(newTab: string) {
    const fromIdx = tabOrder.indexOf(tab);
    const toIdx = tabOrder.indexOf(newTab);
    setDir(toIdx > fromIdx ? 1 : -1);
    setTab(newTab as PedidoTab);
  }

  const filtered = tab === "revisao"
    ? PEDIDOS_MOCK.filter((p) => p.status === "revisao")
    : tab === "atrasados"
    ? PEDIDOS_MOCK.filter((p) => p.dias > 7)
    : PEDIDOS_MOCK;

  return (
    <motion.div
      className="rounded-[20px] bg-white p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0, 0, 0.2, 1], delay: 0.45 }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-[15px] font-bold text-[#0E0F10]">Pedidos recentes</h2>
          <p className="text-[11px] text-[#A9AAA5]">Últimos 30 dias</p>
        </div>
        <div className="flex items-center gap-3">
          <MiniTabBar tabs={PEDIDO_TABS} active={tab} onChange={handleTabChange} />
          <motion.button
            className="flex items-center gap-1 text-[11px] font-bold text-[#A9AAA5]"
            whileHover={{ color: "#0E0F10" }}
            transition={{ duration: 0.15 }}
          >
            Ver todos <ArrowUpRight size={12} />
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_76px_98px_36px] gap-2 px-3 mb-3">
        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#C8C9C4" }}>Pedido</span>
        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#C8C9C4" }}>Tipo</span>
        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#C8C9C4" }}>Status</span>
        <span className="text-[10px] font-bold tracking-widest uppercase text-right" style={{ color: "#C8C9C4" }}>Dias</span>
      </div>

      <TabContent tabKey={tab} direction={dir}>
        <div className="flex flex-col gap-0.5">
          {filtered.length === 0 ? (
            <p className="text-[13px] text-[#A9AAA5] text-center py-8 font-medium">Nenhum pedido nesta categoria</p>
          ) : (
            filtered.map((pedido, i) => {
              const sm = STATUS_MAP[pedido.status] ?? { cor: "#A9AAA5", label: pedido.status };
              const IconComp = pedido.Icon;
              return (
                <motion.div
                  key={pedido.titulo}
                  className="grid grid-cols-[1fr_76px_98px_36px] gap-2 items-center rounded-[10px] px-3 py-3 -mx-3 cursor-pointer"
                  whileHover={{ backgroundColor: "#EEEFE9" }}
                  whileTap={{ scale: 0.99 }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <p className="text-[13px] font-semibold text-[#0E0F10] truncate">{pedido.titulo}</p>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <IconComp size={11} color="#C8C9C4" />
                    <span className="text-[11px] truncate" style={{ color: "#8A8B8C" }}>{pedido.tipo}</span>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full w-fit"
                    style={{ backgroundColor: `${sm.cor}12`, color: sm.cor }}
                  >
                    {sm.label}
                  </span>
                  <span className="text-[11px] font-semibold text-right" style={{ color: pedido.dias > 7 ? "#FB8C00" : "#A9AAA5" }}>
                    {pedido.dias}d
                  </span>
                </motion.div>
              );
            })
          )}
        </div>
      </TabContent>
    </motion.div>
  );
}

// ─── Squad Performance ────────────────────────────────────────────────────────

function SquadPerformance() {
  return (
    <motion.div
      className="rounded-[20px] bg-white p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0, 0, 0.2, 1], delay: 0.52 }}
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-[10px]" style={{ backgroundColor: "#EEEFE9" }}>
          <Layers size={14} color="#5E5E5F" />
        </div>
        <div>
          <h2 className="text-[15px] font-bold text-[#0E0F10]">Performance por squad</h2>
          <p className="text-[10px] text-[#A9AAA5]">Taxa de conclusão e volume</p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {SQUADS.map((squad, i) => (
          <motion.div key={squad.id} className="flex flex-col gap-2.5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.57 + i * 0.09 }}>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#0E0F10]">{squad.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium" style={{ color: "#A9AAA5" }}>{squad.volume} pedidos</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#D7FF0020", color: "#0E0F10" }}>
                  {squad.conclusao}%
                </span>
              </div>
            </div>
            <AnimatedBar value={squad.conclusao} max={100} color="#D7FF00" delay={0.62 + i * 0.09} height={6} />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock size={10} color="#C8C9C4" />
                <span className="text-[10px] font-medium" style={{ color: "#A9AAA5" }}>Tempo médio: {squad.tempo}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp size={10} color="#43A047" />
                <span className="text-[10px] font-bold" style={{ color: "#43A047" }}>+4%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Tendências do Período ────────────────────────────────────────────────────

function Tendencias() {
  return (
    <motion.div
      className="rounded-[20px] bg-white overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0, 0, 0.2, 1], delay: 0.58 }}
    >
      <div className="px-6 pt-5 pb-4 flex items-center gap-2" style={{ borderBottom: "2px solid #D7FF00" }}>
        <div className="flex h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: "#D7FF00" }}>
          <Flame size={11} color="#0E0F10" />
        </div>
        <h2 className="text-[14px] font-bold text-[#0E0F10]">Tendências do período</h2>
      </div>

      <div className="px-6 py-4 flex flex-col gap-3.5">
        {INSIGHTS.map((insight, i) => (
          <motion.div
            key={i}
            className="flex items-start gap-2.5"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.63 + i * 0.07 }}
          >
            <insight.Icon size={12} color={insight.tipo === "positivo" ? "#43A047" : "#8A8B8C"} className="flex-shrink-0 mt-0.5" />
            <p className="text-[12px] font-semibold text-[#0E0F10] leading-snug">{insight.text}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function RelatorioClient() {
  const [periodo, setPeriodo] = useState<"semana" | "mes" | "trimestre" | "ano">("mes");

  return (
    <motion.div
      className="flex flex-col gap-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#0E0F10] leading-tight">Relatório</h1>
          <p className="text-[13px] text-[#A9AAA5] mt-0.5 flex items-center gap-1.5">
            <LivePulseDot sizePx={7} />
            Dados atualizando em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-[14px] bg-white p-1 gap-0.5">
            {PERIODO_OPTIONS.map((opt) => (
              <motion.button
                key={opt.value}
                onClick={() => setPeriodo(opt.value)}
                className="rounded-[10px] px-3.5 py-2 text-[12px] font-semibold"
                animate={{
                  backgroundColor: periodo === opt.value ? "#0E0F10" : "transparent",
                  color: periodo === opt.value ? "#D7FF00" : "#A9AAA5",
                }}
                initial={false}
                whileHover={periodo !== opt.value ? { backgroundColor: "rgba(213,210,201,0.3)", color: "#0E0F10" } : {}}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                {opt.label}
              </motion.button>
            ))}
          </div>
          <motion.button
            className="flex items-center gap-1.5 rounded-[12px] bg-white px-3.5 py-2.5 text-[12px] font-semibold text-[#5E5E5F]"
            whileHover={{ scale: 1.03, color: "#0E0F10" }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Download size={14} />
            Exportar
          </motion.button>
        </div>
      </div>

      {/* ── Row 1: Hero KPIs ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-[2fr_1.5fr_1fr_1fr]">
        {KPIS_HERO.map((kpi, i) => {
          const isDark = !!kpi.dark;
          const isLimao = !!kpi.limao;
          const bgColor = isDark ? "#0E0F10" : isLimao ? "#D7FF00" : "#FFFFFF";
          const textMain = isDark ? "#FFFFFF" : "#0E0F10";
          const textSub = isDark ? "rgba(255,255,255,0.3)" : isLimao ? "rgba(14,15,16,0.45)" : "#C8C9C4";
          const numSize = isDark ? "54px" : isLimao ? "44px" : "36px";

          return (
            <motion.div
              key={kpi.label}
              className="rounded-[20px] p-5 flex flex-col cursor-default overflow-hidden"
              style={{ backgroundColor: bgColor }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0, 0, 0.2, 1], delay: Math.min(i * 0.07, 0.28) }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold tracking-widest uppercase leading-none text-[10px]" style={{ color: textSub }}>
                  {kpi.label}
                </p>
                {isLimao && kpi.live && <LivePulseDot color="#0E0F10" sizePx={7} />}
                {!isLimao && kpi.trend !== undefined && (
                  <div className="flex items-center gap-0.5 font-bold text-[10px]" style={{ color: isDark ? "#D7FF00" : "#43A047" }}>
                    <TrendingUp size={11} />
                    +{kpi.trend}{kpi.suffix ?? ""}
                  </div>
                )}
              </div>

              <p className="font-bold leading-none mt-1" style={{ fontSize: numSize, color: textMain }}>
                <AnimatedCount target={kpi.value} delay={i * 80} suffix={kpi.suffix ?? ""} />
              </p>

              {isDark && (
                <div className="mt-4 -mx-2">
                  <MiniSparkline data={SPARKLINE_HERO} color="#D7FF00" />
                </div>
              )}

              {!isDark && kpi.context && (
                <div className="mt-3 flex items-center gap-1.5">
                  {isLimao ? <Zap size={11} color="rgba(14,15,16,0.4)" /> : <TrendingUp size={11} color="#43A047" />}
                  <span className="text-[11px] font-semibold" style={{ color: isLimao ? "rgba(14,15,16,0.5)" : "#43A047" }}>
                    {kpi.context}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ── Row 2: Saúde Operacional + Atividade LIVE (subiu de prioridade) ─ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
        <SaudeOperacional />
        <ActivityFeed />
      </div>

      {/* ── Row 3: Produção ao longo do tempo — gráfico hero com tabs de view */}
      <motion.div
        className="rounded-[20px] bg-white p-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0, 0, 0.2, 1], delay: 0.28 }}
      >
        <ProducaoChartContainer periodo={periodo} />
      </motion.div>

      {/* ── Row 4: Status + Por tipo + Orquestração ─────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatusPedidos />
        <DistribuicaoTipo />
        <motion.div
          className="rounded-[20px] bg-white p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0, 0, 0.2, 1], delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px]" style={{ backgroundColor: "#EEEFE9" }}>
              <Cpu size={14} color="#5E5E5F" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#0E0F10]">Orquestração de agentes</h2>
              <p className="text-[11px] text-[#A9AAA5]">Carga e status em tempo real</p>
            </div>
          </div>
          <OrquestradorMonitor />
        </motion.div>
      </div>

      {/* ── Row 5: Uso de IA + Pedidos recentes ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        <UsoIA />
        <PedidosRecentes />
      </div>

      {/* ── Row 6: Squad Performance + Tendências ───────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        <SquadPerformance />
        <Tendencias />
      </div>
    </motion.div>
  );
}
