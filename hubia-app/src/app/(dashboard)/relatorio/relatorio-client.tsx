"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { TabContent } from "@/components/ui/tab-content";
import {
  TrendingUp, Zap, CheckCircle2,
  Activity, BarChart3, Download, ArrowUpRight, Cpu,
  Bot, Sparkles, Shield, Clock, AlertCircle, Flame,
  FileVideo, Camera, Globe, Palette, MessageSquare, Users, Layers,
  ArrowUp,
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

const ACTIVITY_H = 62;
const MAX_ACTIVITIES = 5;
const LOG_H = 28;
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

const SERIE_EFICIENCIA_BASE = SERIE_INICIAL.map((d) => ({
  mes: d.mes,
  eficiencia: Math.round((d.entregues / d.pedidos) * 100),
}));

const AGENTES_HISTORICO = [
  { id: "planner", label: "Planner", historico: [70, 75, 80, 85, 82, 88, 91, 87], pico: 91 },
  { id: "copy", label: "Copywriter", historico: [45, 50, 58, 55, 65, 70, 68, 63], pico: 70 },
  { id: "arte", label: "Dir. de Arte", historico: [80, 85, 90, 88, 92, 95, 93, 91], pico: 95 },
  { id: "cena", label: "Dir. de Cena", historico: [30, 25, 20, 15, 18, 22, 20, 22], pico: 30 },
  { id: "qa", label: "QA Review", historico: [40, 45, 50, 55, 58, 55, 55, 55], pico: 58 },
  { id: "dev", label: "Dev Squad", historico: [60, 65, 70, 75, 80, 78, 82, 78], pico: 82 },
];

const SPARKLINE_HERO = [8, 14, 11, 18, 22, 19, 26, 30, 27, 35, 38, 32, 41, 44, 38, 47, 52, 56, 61, 58, 67, 72, 68, 77, 82, 79, 88, 95];

const DADOS_STATUS = [
  { status: "entregue", label: "Entregue", value: 47, cor: "var(--hubia-limao-500)", insight: "Alta tendência", critico: false },
  { status: "em_andamento", label: "Em andamento", value: 23, cor: "#2A2B2C", insight: "Normal", critico: false },
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
  { id: "audiovisual", label: "Audiovisual Squad", volume: 67, conclusao: 89, tempo: "3.2d", trend: "+4%" },
  { id: "dev", label: "Dev Squad", volume: 28, conclusao: 82, tempo: "5.1d", trend: "+2%" },
];

const INSIGHTS = [
  { Icon: TrendingUp, text: "Vídeos cresceram 23% no período", tipo: "positivo", destaque: true },
  { Icon: CheckCircle2, text: "Revisões caíram 12% vs. mês anterior", tipo: "positivo", destaque: false },
  { Icon: Flame, text: "Quinta foi o dia com maior volume", tipo: "neutro", destaque: false },
  { Icon: Bot, text: "Copywriter operou acima da média", tipo: "positivo", destaque: false },
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

const ACTIVITIES_POOL: Array<{ Icon: LucideIcon; text: string; color: string; tipo: string }> = [
  { Icon: CheckCircle2, text: "Pedido #047 entregue com sucesso", color: "#43A047", tipo: "Entrega" },
  { Icon: Zap, text: "Planner iniciou briefing #048", color: "var(--hubia-limao-500)", tipo: "Briefing" },
  { Icon: Palette, text: "Dir. de Arte solicitou revisão", color: "#FB8C00", tipo: "Revisão" },
  { Icon: Bot, text: "Agente QA detectou inconsistência", color: "#5E5E5F", tipo: "QA" },
  { Icon: FileVideo, text: "Novo pedido criado: Campanha Q2", color: "var(--hubia-ink-500)", tipo: "Pedido" },
  { Icon: Sparkles, text: "Prompt gerado para pedido #046", color: "#8AB000", tipo: "IA" },
  { Icon: Users, text: "Creator confirmada para pedido #045", color: "#5E5E5F", tipo: "Creator" },
  { Icon: ArrowUpRight, text: "Deploy automático concluído", color: "#43A047", tipo: "Deploy" },
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
  em_andamento: { cor: "#2A74DC", label: "Em andamento" },
  revisao: { cor: "#FB8C00", label: "Revisão" },
  entregue: { cor: "#43A047", label: "Entregue" },
  aprovado: { cor: "var(--hubia-limao-500)", label: "Aprovado" },
};

const KPIS_HERO: KpiHero[] = [
  { label: "Total de pedidos", value: 95, trend: 12, dark: true },
  { label: "Em andamento", value: 23, trend: 3, limao: true, live: true, context: "+3 vs. semana passada" },
  { label: "Entregues", value: 47, trend: 18, context: "+18 este mês" },
  { label: "Aprovação", value: 94, suffix: "%", trend: 2, context: "Meta: 90%" },
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

function LivePulseDot({ color = "var(--hubia-limao-500)", sizePx = 9 }: { color?: string; sizePx?: number }) {
  return (
    <span className="relative flex flex-shrink-0" style={{ width: sizePx, height: sizePx }}>
      <motion.span
        className="absolute inline-flex h-full w-full rounded-full"
        style={{ backgroundColor: color, opacity: 0.75 }}
        animate={{ scale: [1, 2.4, 1], opacity: [0.75, 0, 0.75] }}
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
        transition={{ duration: 0.9, ease: [0, 0, 0.2, 1], delay }}
      />
    </div>
  );
}

// MiniSparkline — margem zero para sangrar até as bordas do container
function MiniSparkline({ data, color, height = 48 }: { data: number[]; color: string; height?: number }) {
  const chartData = data.map((v, i) => ({ i, v }));
  const gradId = `spark-${color.replace("#", "")}-${height}`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.55} />
            <stop offset="55%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2.5}
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
    <div className="flex items-center rounded-[12px] p-1 gap-0.5" style={{ backgroundColor: "var(--hubia-bg-base-500)" }}>
      {tabs.map((t) => (
        <motion.button
          key={t.id}
          onClick={() => onChange(t.id)}
          className="flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[12px] font-semibold"
          animate={{
            backgroundColor: active === t.id ? "#FFFFFF" : "transparent",
            color: active === t.id ? "var(--hubia-ink-500)" : "var(--hubia-bg-base-700)",
          }}
          initial={false}
          whileHover={active !== t.id ? { backgroundColor: "rgba(255,255,255,0.55)", color: "var(--hubia-ink-500)" } : {}}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
        >
          {t.label}
          {t.count !== undefined && (
            <motion.span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              animate={{
                backgroundColor: active === t.id ? "var(--hubia-bg-base-500)" : "rgba(169,170,165,0.15)",
                color: active === t.id ? "var(--hubia-ink-500)" : "var(--hubia-bg-base-700)",
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
    <div className="rounded-[16px] bg-ink-500 px-4 py-4 text-white min-w-[150px]">
      <p className="text-[10px] mb-3 font-bold tracking-[0.12em] uppercase" style={{ color: "#4A4B4C" }}>{label}</p>
      {payload.map((item) => (
        <div key={item.name} className="flex items-center justify-between gap-6 mb-2.5 last:mb-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-[11px] font-semibold" style={{ color: "#6A6B6C" }}>{item.name}</span>
          </div>
          <span className="text-[18px] font-bold tabular-nums">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Gráficos de Produção — 3 views ──────────────────────────────────────────

// ProducaoVolumeChart
// Margens corrigidas: margin.right mínimo (sem eixo direito = sem espaço morto)
// Animação orgânica: cada série tem seu próprio momentum independente,
// atualiza a cada 450ms com deltas pequenos → movimento fluido e não correlacionado
function ProducaoVolumeChart({ periodo }: { periodo: string }) {
  const [dados, setDados] = useState(SERIE_INICIAL);
  const pMomentum = useRef(0.4);   // momentum independente de pedidos
  const eMomentum = useRef(0.2);   // momentum independente de entregues

  useEffect(() => {
    setDados(gerarSerieProducao());
  }, [periodo]);

  useEffect(() => {
    const timer = setInterval(() => {
      // Cada série tem ruído independente com inércia (momentum)
      pMomentum.current = pMomentum.current * 0.65 + (Math.random() - 0.44) * 0.35;
      eMomentum.current = eMomentum.current * 0.65 + (Math.random() - 0.46) * 0.28;

      setDados((prev) => {
        const novo = [...prev];
        const last = { ...novo[novo.length - 1] };
        last.pedidos = Math.max(12, Math.round(last.pedidos + pMomentum.current * 5));
        last.entregues = Math.max(
          6,
          Math.min(last.pedidos - 4, Math.round(last.entregues + eMomentum.current * 4))
        );
        novo[novo.length - 1] = last;
        return novo;
      });
    }, 450);
    return () => clearInterval(timer);
  }, []);

  return (
    <ResponsiveContainer width="100%" height={360}>
      {/* margin.right=8 porque não existe eixo direito — espaço morto eliminado */}
      <AreaChart data={dados} margin={{ top: 16, right: 8, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id="gradVolPedidos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--hubia-limao-500)" stopOpacity={0.6} />
            <stop offset="30%" stopColor="var(--hubia-limao-500)" stopOpacity={0.28} />
            <stop offset="70%" stopColor="var(--hubia-limao-500)" stopOpacity={0.06} />
            <stop offset="100%" stopColor="var(--hubia-limao-500)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradVolEntregues" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--hubia-ink-500)" stopOpacity={0.14} />
            <stop offset="100%" stopColor="var(--hubia-ink-500)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="0" stroke="rgba(14,15,16,0.04)" horizontal={true} vertical={false} />
        <XAxis
          dataKey="mes"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#B0B1AB", fontFamily: "Urbanist", fontWeight: 700 }}
          padding={{ left: 20, right: 20 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "#B0B1AB", fontFamily: "Urbanist", fontWeight: 600 }}
          width={40}
        />
        <Tooltip content={<HubiaTooltip />} cursor={{ stroke: "rgba(14,15,16,0.06)", strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="pedidos"
          name="Pedidos"
          stroke="var(--hubia-limao-500)"
          strokeWidth={4}
          fill="url(#gradVolPedidos)"
          dot={false}
          activeDot={{ r: 7, fill: "#D7FF00", strokeWidth: 3, stroke: "#FFFFFF" }}
          animationDuration={420}
          animationEasing="ease-in-out"
        />
        <Area
          type="monotone"
          dataKey="entregues"
          name="Entregues"
          stroke="var(--hubia-ink-500)"
          strokeWidth={2.5}
          fill="url(#gradVolEntregues)"
          dot={false}
          activeDot={{ r: 5, fill: "var(--hubia-ink-500)", strokeWidth: 2, stroke: "#FFFFFF" }}
          animationDuration={420}
          animationEasing="ease-in-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ProducaoSquadChart() {
  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart data={SERIE_SQUAD_BASE} margin={{ top: 16, right: 8, left: 0, bottom: 4 }} barGap={4} barCategoryGap="35%">
        <CartesianGrid strokeDasharray="0" stroke="rgba(14,15,16,0.04)" horizontal={true} vertical={false} />
        <XAxis
          dataKey="mes"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#B0B1AB", fontFamily: "Urbanist", fontWeight: 700 }}
          padding={{ left: 16, right: 16 }}
        />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#B0B1AB", fontFamily: "Urbanist", fontWeight: 600 }} width={40} />
        <Tooltip content={<HubiaTooltip />} cursor={{ fill: "rgba(14,15,16,0.03)" }} />
        <Bar dataKey="audiovisual" name="Audiovisual" fill="#D7FF00" radius={[6, 6, 0, 0]} animationDuration={900} />
        <Bar dataKey="dev" name="Dev Squad" fill="var(--hubia-ink-500)" radius={[6, 6, 0, 0]} animationDuration={900} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function ProducaoEficienciaChart() {
  return (
    <ResponsiveContainer width="100%" height={360}>
      <LineChart data={SERIE_EFICIENCIA_BASE} margin={{ top: 16, right: 8, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id="gradEfic" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--hubia-limao-500)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--hubia-limao-500)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="0" stroke="rgba(14,15,16,0.04)" horizontal={true} vertical={false} />
        <XAxis
          dataKey="mes"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#B0B1AB", fontFamily: "Urbanist", fontWeight: 700 }}
          padding={{ left: 20, right: 20 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "#B0B1AB", fontFamily: "Urbanist", fontWeight: 600 }}
          domain={[50, 100]}
          tickFormatter={(v) => `${v}%`}
          width={44}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="rounded-[16px] bg-ink-500 px-4 py-4 text-white min-w-[140px]">
                <p className="text-[10px] mb-3 font-bold tracking-[0.12em] uppercase" style={{ color: "#4A4B4C" }}>{label}</p>
                <div className="flex items-center justify-between gap-5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-limao-500" />
                    <span className="text-[11px] font-semibold" style={{ color: "#6A6B6C" }}>Eficiência</span>
                  </div>
                  <span className="text-[18px] font-bold tabular-nums">{payload[0].value}%</span>
                </div>
              </div>
            );
          }}
          cursor={{ stroke: "rgba(14,15,16,0.06)", strokeWidth: 1 }}
        />
        <Line
          type="monotone"
          dataKey="eficiencia"
          name="Eficiência"
          stroke="var(--hubia-limao-500)"
          strokeWidth={4}
          dot={{ r: 5, fill: "#D7FF00", strokeWidth: 0 }}
          activeDot={{ r: 8, fill: "#D7FF00", strokeWidth: 3, stroke: "#FFFFFF" }}
          animationDuration={420}
          animationEasing="ease-in-out"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

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
        <div className="flex items-center gap-2">
          <span className="h-[3px] w-7 rounded-full" style={{ backgroundColor: "#D7FF00" }} />
          <span className="text-[12px] font-bold text-[#8A8B8C]">Pedidos</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-[3px] w-7 rounded-full bg-ink-500" />
          <span className="text-[12px] font-bold text-[#8A8B8C]">Entregues</span>
        </div>
      </div>
    ),
    squad: (
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded-[4px]" style={{ backgroundColor: "#D7FF00" }} />
          <span className="text-[12px] font-bold text-[#8A8B8C]">Audiovisual</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded-[4px] bg-ink-500" />
          <span className="text-[12px] font-bold text-[#8A8B8C]">Dev Squad</span>
        </div>
      </div>
    ),
    eficiencia: (
      <div className="flex items-center gap-2">
        <span className="h-[3px] w-7 rounded-full" style={{ backgroundColor: "#D7FF00" }} />
        <span className="text-[12px] font-bold text-[#8A8B8C]">Taxa de entrega (%) por mês</span>
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
      <div className="flex items-start justify-between mb-7 gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-ink-500">{titles[view]}</h2>
          <p className="text-[12px] font-semibold mt-1" style={{ color: "var(--hubia-bg-base-700)" }}>{subtitles[view]}</p>
        </div>
        <div className="flex items-center gap-5 flex-shrink-0">
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

  const alertas = [
    { Icon: CheckCircle2, text: "Entregues em alta tendência", tipo: "ok" },
    { Icon: AlertCircle, text: "2 pedidos em revisão acima do ideal", tipo: "alerta" },
    { Icon: Clock, text: "Dir. de Arte com carga elevada", tipo: "alerta" },
    { Icon: CheckCircle2, text: "Aprovações dentro do esperado", tipo: "ok" },
  ];

  return (
    <motion.div
      className="rounded-[30px] bg-ink-500 p-6 flex flex-col"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0, 0, 0.2, 1], delay: 0.18 }}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-2" style={{ color: "#3A3B3C" }}>Saúde operacional</p>
          <h2 className="text-[20px] font-bold text-white leading-tight">
            Operação <span style={{ color: statusColor }}>Estável</span>
          </h2>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-[12px]" style={{ backgroundColor: `${statusColor}1A` }}>
          <Shield size={18} color={statusColor} />
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-end gap-2 mb-4">
          <motion.span
            className="font-bold leading-none tabular-nums"
            style={{ fontSize: 72, color: statusColor }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {score}
          </motion.span>
          <span className="text-[14px] font-bold mb-3" style={{ color: "#3A3B3C" }}>/100</span>
        </div>
        <AnimatedBar value={score} max={100} color={statusColor} height={5} delay={0.35} />
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {alertas.map((a, i) => (
          <motion.div
            key={i}
            className="flex items-start gap-3"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.38 + i * 0.07 }}
          >
            <div
              className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full mt-0.5"
              style={{ backgroundColor: a.tipo === "ok" ? "#4CAF5018" : "#FB8C0018" }}
            >
              <a.Icon size={11} color={a.tipo === "ok" ? "#4CAF50" : "#FB8C00"} />
            </div>
            <span
              className="text-[12px] font-semibold leading-snug"
              style={{ color: a.tipo === "alerta" ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)" }}
            >
              {a.text}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-5 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-1.5">
          <Users size={13} color="#3A3B3C" />
          <span className="text-[12px] font-bold" style={{ color: "#3A3B3C" }}>Creators ativas</span>
        </div>
        <span className="text-[28px] font-bold text-white tabular-nums">6</span>
      </div>
    </motion.div>
  );
}

// ─── Status dos Pedidos ───────────────────────────────────────────────────────

function StatusPedidos() {
  const total = DADOS_STATUS.reduce((acc, s) => acc + s.value, 0);

  return (
    <motion.div
      className="rounded-[30px] bg-white p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0, 0, 0.2, 1], delay: 0.35 }}
    >
      <div className="flex items-center gap-2.5 mb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-[12px]" style={{ backgroundColor: "#F6F7F2" }}>
          <BarChart3 size={15} color="#5E5E5F" />
        </div>
        <div>
          <h2 className="text-[16px] font-bold text-ink-500">Status dos pedidos</h2>
          <p className="text-[11px] font-semibold mt-0.5" style={{ color: "var(--hubia-bg-base-700)" }}>Leitura operacional</p>
        </div>
      </div>

      {/* Barra segmentada */}
      <div className="flex h-3.5 w-full rounded-full overflow-hidden mb-6" style={{ gap: 2 }}>
        {DADOS_STATUS.map((s, i) => (
          <motion.div
            key={s.status}
            className="h-full rounded-full"
            style={{ backgroundColor: s.cor }}
            initial={{ flexGrow: 0 }}
            animate={{ flexGrow: s.value }}
            transition={{ duration: 1.2, ease: [0, 0, 0.2, 1], delay: 0.38 + i * 0.05 }}
          />
        ))}
      </div>

      <div className="flex flex-col gap-5">
        {DADOS_STATUS.map((s, i) => (
          <motion.div
            key={s.status}
            className="flex flex-col gap-2.5 cursor-default"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.42 + i * 0.06 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.cor }} />
                <span className="text-[14px] font-bold text-ink-500">{s.label}</span>
                {s.critico && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#FB8C0018", color: "#FB8C00" }}>
                    atenção
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold" style={{ color: "var(--hubia-bg-base-700)" }}>{s.insight}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-[26px] font-bold text-ink-500 leading-none tabular-nums">{s.value}</span>
                  <span className="text-[11px] font-bold" style={{ color: "#C8C9C4" }}>
                    {Math.round((s.value / total) * 100)}%
                  </span>
                </div>
              </div>
            </div>
            <AnimatedBar value={s.value} max={total} color={s.cor} delay={0.48 + i * 0.06} height={9} />
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
      className="rounded-[30px] bg-white p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0, 0, 0.2, 1], delay: 0.38 }}
    >
      <div className="mb-6">
        <h2 className="text-[16px] font-bold text-ink-500">Por tipo de pedido</h2>
        <p className="text-[11px] font-semibold mt-0.5" style={{ color: "var(--hubia-bg-base-700)" }}>Ranking de volume no período</p>
      </div>

      <div className="flex flex-col gap-6">
        {DADOS_TIPO.map((d, i) => {
          const isFirst = i === 0;
          const isSecond = i === 1;
          const IconComp = d.Icon;
          const barColor = isFirst ? "#D7FF00" : isSecond ? "#2A2B2C" : "#D9D9D4";
          const barH = isFirst ? 12 : isSecond ? 8 : 6;
          const numSize = isFirst ? "26px" : isSecond ? "22px" : "18px";
          return (
            <motion.div
              key={d.tipo}
              className="flex flex-col gap-2.5"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.42 + i * 0.08 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="text-[10px] font-bold flex-shrink-0 flex items-center justify-center rounded-full"
                    style={{
                      color: isFirst ? "var(--hubia-ink-500)" : "var(--hubia-bg-base-700)",
                      backgroundColor: isFirst ? "#D7FF00" : "transparent",
                      width: 20,
                      height: 20,
                      border: isFirst ? "none" : "1.5px solid #E4E5E0",
                    }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-[12px]" style={{ backgroundColor: isFirst ? "#D7FF0020" : "#EEEFE9" }}>
                    <IconComp size={14} color={isFirst ? "#8AB000" : "#A9AAA5"} />
                  </div>
                  <span className="text-[14px] font-bold text-ink-500">{d.tipo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold tabular-nums" style={{ fontSize: numSize, color: isFirst ? "var(--hubia-ink-500)" : "var(--hubia-ink-400)" }}>
                    {d.value}%
                  </span>
                  {isFirst && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "var(--hubia-limao-500)", color: "var(--hubia-ink-500)" }}>
                      #1
                    </span>
                  )}
                </div>
              </div>
              <AnimatedBar value={d.value} max={maxVal} color={barColor} delay={0.48 + i * 0.08} height={barH} />
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
    { label: "Prompts processados", value: "1.847", sub: "no período", trend: "+12%", pos: true },
    { label: "Custo estimado", value: "R$ 38", sub: "dentro do orçamento", trend: "−8%", pos: true },
    { label: "Taxa de sucesso", value: "97.2%", sub: "meta 95%", trend: "+2.2pp", pos: true },
    { label: "Provedor principal", value: "GPT-4o", sub: "89% das requisições", trend: "estável", pos: false },
  ];

  return (
    <motion.div
      className="rounded-[30px] bg-white p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0, 0, 0.2, 1], delay: 0.42 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-[12px]" style={{ backgroundColor: "#D7FF0020" }}>
          <Sparkles size={16} color="#8AB000" />
        </div>
        <div>
          <h2 className="text-[16px] font-bold text-ink-500">Uso de IA</h2>
          <p className="text-[11px] font-semibold mt-0.5" style={{ color: "var(--hubia-bg-base-700)" }}>Consumo inteligente no período</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metricas.map((m, i) => (
          <motion.div
            key={m.label}
            className="rounded-[16px] p-4 flex flex-col gap-3"
            style={{ backgroundColor: "#F6F7F2" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.48 + i * 0.07 }}
          >
            <p className="text-[10px] font-bold tracking-[0.1em] uppercase leading-tight" style={{ color: "var(--hubia-bg-base-700)" }}>{m.label}</p>
            <p className="text-[28px] font-bold text-ink-500 leading-none tabular-nums">{m.value}</p>
            <div className="flex items-center justify-between mt-auto">
              <p className="text-[11px] font-semibold leading-tight" style={{ color: "#8A8B8C" }}>{m.sub}</p>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ backgroundColor: m.pos ? "#43A04714" : "#8A8B8C12" }}>
                <ArrowUp size={8} color={m.pos ? "#43A047" : "#8A8B8C"} />
                <span className="text-[10px] font-bold" style={{ color: m.pos ? "#43A047" : "#8A8B8C" }}>{m.trend}</span>
              </div>
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
    return () => { clearInterval(loadTimer); clearInterval(logTimer); };
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
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {agentes.map((ag) => {
                const { color, label, bg } = agentStatusConfig(ag.load);
                return (
                  <motion.div
                    key={ag.id}
                    className="flex flex-col gap-2.5 rounded-[14px] px-3.5 py-3.5"
                    style={{ backgroundColor: "#F6F7F2" }}
                    whileHover={{ backgroundColor: "#EDEEE8" }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <LivePulseDot color={color} sizePx={7} />
                        <span className="text-[11px] font-bold text-ink-500 truncate">{ag.label}</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ color, backgroundColor: bg }}>
                        {ag.load}%
                      </span>
                    </div>
                    <AnimatedBar value={ag.load} max={100} color={color} height={5} />
                    <span className="text-[10px] font-semibold" style={{ color: "var(--hubia-bg-base-700)" }}>{label}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* LIVE log */}
            <div className="rounded-[16px] bg-ink-500 p-4">
              <div className="flex items-center gap-2 mb-4">
                <LivePulseDot color="#D7FF00" sizePx={7} />
                <span className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: "#D7FF00" }}>Live</span>
                <span className="text-[10px] font-semibold ml-auto" style={{ color: "#333435" }}>Tempo real</span>
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
                      <span className="text-[12px] flex-shrink-0 font-bold leading-tight" style={{ color: i === 0 ? "#D7FF00" : "rgba(255,255,255,0.18)" }}>›</span>
                      <p className="text-[11px] font-semibold leading-tight truncate" style={{ color: i === 0 ? "#FFFFFF" : `rgba(255,255,255,${Math.max(0.14, 0.45 - i * 0.1)})` }}>
                        {entry.text}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {AGENTES_HISTORICO.map((ag, i) => {
              const statusCfg = agentStatusConfig(ag.historico[ag.historico.length - 1]);
              return (
                <motion.div
                  key={ag.id}
                  className="flex items-center gap-3 rounded-[12px] px-3.5 py-3"
                  style={{ backgroundColor: "#F6F7F2" }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <div className="flex items-center gap-1.5 w-28 flex-shrink-0">
                    <LivePulseDot color={statusCfg.color} sizePx={6} />
                    <span className="text-[12px] font-bold text-ink-500 truncate">{ag.label}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <MiniSparkline data={ag.historico} color={statusCfg.color} height={34} />
                  </div>
                  <div className="flex-shrink-0 text-right w-14">
                    <p className="text-[16px] font-bold text-ink-500 tabular-nums">{ag.historico[ag.historico.length - 1]}%</p>
                    <p className="text-[10px] font-semibold" style={{ color: "var(--hubia-bg-base-700)" }}>pico {ag.pico}%</p>
                  </div>
                </motion.div>
              );
            })}
            <p className="text-[10px] text-base-700 text-center pt-1 font-semibold">Últimos 8 períodos de monitoramento</p>
          </div>
        )}
      </TabContent>
    </div>
  );
}

// ─── Activity Feed — monitoramento premium ────────────────────────────────────

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
      className="rounded-[30px] bg-white overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0, 0, 0.2, 1], delay: 0.22 }}
    >
      {/* Header com acento limão na borda superior */}
      <div
        className="px-6 pt-5 pb-4 flex items-center gap-3"
        style={{ borderBottom: "1px solid #F2F3EE" }}
      >
        <div className="flex items-center gap-2.5 flex-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-[12px]" style={{ backgroundColor: "var(--hubia-ink-500)" }}>
            <Activity size={14} color="#D7FF00" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-ink-500">Atividade</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <LivePulseDot sizePx={6} />
              <span className="text-[10px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--hubia-bg-base-700)" }}>Tempo real</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feed com altura fixa */}
      <div className="px-4" style={{ height: ACTIVITY_H * MAX_ACTIVITIES, position: "relative", overflow: "hidden" }}>
        <AnimatePresence initial={false}>
          {activities.map((a, i) => {
            const IconComp = a.Icon;
            const isLive = i === 0;
            return (
              <motion.div
                key={a.id}
                layout
                className="absolute left-4 right-4 flex items-center gap-4"
                style={{
                  top: i * ACTIVITY_H,
                  height: ACTIVITY_H,
                  borderBottom: i < MAX_ACTIVITIES - 1 ? "1px solid #F5F5F0" : "none",
                }}
                initial={{ opacity: 0, y: -(ACTIVITY_H * 0.6) }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0, 0, 0.2, 1] }}
              >
                {/* Ícone */}
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px]"
                  style={{
                    backgroundColor: isLive ? `${a.color}18` : "#F6F7F2",
                    outline: isLive ? `2px solid ${a.color}40` : "none",
                    outlineOffset: "2px",
                  }}
                >
                  <IconComp size={16} color={isLive ? a.color : "#B0B1AB"} />
                </div>

                {/* Texto + tipo */}
                <div className="flex-1 min-w-0">
                  <p
                    className="leading-tight truncate font-bold"
                    style={{
                      fontSize: isLive ? "14px" : "13px",
                      color: isLive ? "var(--hubia-ink-500)" : "#7A7B7C",
                      fontWeight: isLive ? 700 : 500,
                    }}
                  >
                    {a.text}
                  </p>
                  {isLive && (
                    <span className="text-[10px] font-bold" style={{ color: a.color }}>{a.tipo}</span>
                  )}
                </div>

                {/* Timestamp */}
                <span
                  className="text-[11px] font-bold px-2.5 py-1.5 rounded-[8px] flex-shrink-0 tabular-nums"
                  style={{
                    backgroundColor: isLive ? "var(--hubia-ink-500)" : "#F2F3EE",
                    color: isLive ? "#D7FF00" : "#B0B1AB",
                  }}
                >
                  {a.time}
                </span>
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
      className="rounded-[30px] bg-white p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0, 0, 0.2, 1], delay: 0.45 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[16px] font-bold text-ink-500">Pedidos recentes</h2>
          <p className="text-[11px] font-semibold mt-0.5" style={{ color: "var(--hubia-bg-base-700)" }}>Últimos 30 dias</p>
        </div>
        <div className="flex items-center gap-3">
          <MiniTabBar tabs={PEDIDO_TABS} active={tab} onChange={handleTabChange} />
          <motion.button
            className="flex items-center gap-1 text-[11px] font-bold"
            style={{ color: "#C8C9C4" }}
            whileHover={{ color: "var(--hubia-ink-500)" }}
            transition={{ duration: 0.15 }}
          >
            Ver todos <ArrowUpRight size={11} />
          </motion.button>
        </div>
      </div>

      {/* Cabeçalho da tabela */}
      <div className="grid grid-cols-[1fr_88px_116px_48px] gap-2 px-3 mb-2">
        {["Pedido", "Tipo", "Status", "Dias"].map((h, i) => (
          <span key={i} className="text-[10px] font-bold tracking-[0.1em] uppercase" style={{ color: "#D4D5D0", textAlign: i >= 2 ? "right" : "left" }}>{h}</span>
        ))}
      </div>

      <TabContent tabKey={tab} direction={dir}>
        <div className="flex flex-col gap-0.5">
          {filtered.length === 0 ? (
            <p className="text-[13px] text-base-700 text-center py-8 font-semibold">Nenhum pedido nesta categoria</p>
          ) : (
            filtered.map((pedido, i) => {
              const sm = STATUS_MAP[pedido.status] ?? { cor: "#A9AAA5", label: pedido.status };
              const IconComp = pedido.Icon;
              const isAtrasado = pedido.dias > 7;
              return (
                <motion.div
                  key={pedido.titulo}
                  className="grid grid-cols-[1fr_88px_116px_48px] gap-2 items-center rounded-[12px] px-3 -mx-3 cursor-pointer"
                  style={{ paddingTop: "16px", paddingBottom: "16px" }}
                  whileHover={{ backgroundColor: "#F6F7F2" }}
                  whileTap={{ scale: 0.99 }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <p className="text-[14px] font-bold text-ink-500 truncate">{pedido.titulo}</p>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="flex h-5 w-5 items-center justify-center rounded-[5px]" style={{ backgroundColor: "#EEEFE9" }}>
                      <IconComp size={10} color="#8A8B8C" />
                    </div>
                    <span className="text-[12px] font-semibold truncate" style={{ color: "#8A8B8C" }}>{pedido.tipo}</span>
                  </div>
                  <div className="flex justify-end">
                    <span
                      className="text-[11px] font-bold px-2.5 py-1.5 rounded-[8px]"
                      style={{ backgroundColor: `${sm.cor}15`, color: sm.cor }}
                    >
                      {sm.label}
                    </span>
                  </div>
                  <span className="text-[13px] font-bold text-right tabular-nums" style={{ color: isAtrasado ? "#FB8C00" : "#C8C9C4" }}>
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
      className="rounded-[30px] bg-white p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0, 0, 0.2, 1], delay: 0.52 }}
    >
      <div className="flex items-center gap-3 mb-7">
        <div className="flex h-10 w-10 items-center justify-center rounded-[12px]" style={{ backgroundColor: "#F6F7F2" }}>
          <Layers size={16} color="#5E5E5F" />
        </div>
        <div>
          <h2 className="text-[16px] font-bold text-ink-500">Performance por squad</h2>
          <p className="text-[11px] font-semibold mt-0.5" style={{ color: "var(--hubia-bg-base-700)" }}>Taxa de conclusão e volume</p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {SQUADS.map((squad, i) => (
          <motion.div key={squad.id} className="flex flex-col gap-3"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.57 + i * 0.09 }}>
            <div className="flex items-start justify-between">
              <span className="text-[15px] font-bold text-ink-500">{squad.label}</span>
              <div className="text-right">
                <div className="flex items-baseline gap-1">
                  <span className="text-[34px] font-bold text-ink-500 leading-none tabular-nums">{squad.conclusao}</span>
                  <span className="text-[14px] font-bold" style={{ color: "var(--hubia-bg-base-700)" }}>%</span>
                </div>
                <span className="text-[11px] font-semibold" style={{ color: "var(--hubia-bg-base-700)" }}>{squad.volume} pedidos</span>
              </div>
            </div>
            <AnimatedBar value={squad.conclusao} max={100} color="#D7FF00" delay={0.62 + i * 0.09} height={10} />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock size={11} color="#D0D1CC" />
                <span className="text-[11px] font-semibold" style={{ color: "#B0B1AB" }}>Tempo médio: {squad.tempo}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: "#43A04714" }}>
                <TrendingUp size={10} color="#43A047" />
                <span className="text-[11px] font-bold" style={{ color: "#43A047" }}>{squad.trend}</span>
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
      className="rounded-[30px] bg-white overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0, 0, 0.2, 1], delay: 0.58 }}
    >
      <div
        className="px-6 pt-5 pb-4 flex items-center gap-3"
        style={{ borderBottom: "1px solid #F2F3EE" }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: "#D7FF00" }}>
          <Flame size={13} color="var(--hubia-ink-500)" />
        </div>
        <div>
          <h2 className="text-[15px] font-bold text-ink-500">Tendências</h2>
          <p className="text-[10px] font-semibold mt-0.5" style={{ color: "var(--hubia-bg-base-700)" }}>Destaques do período</p>
        </div>
      </div>

      <div className="px-6 py-5 flex flex-col gap-5">
        {INSIGHTS.map((insight, i) => (
          <motion.div
            key={i}
            className="flex items-start gap-3"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.63 + i * 0.07 }}
          >
            <div
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[9px] mt-0.5"
              style={{
                backgroundColor: insight.tipo === "positivo" ? "#43A04714" : "#8A8B8C10",
                border: insight.destaque ? "1.5px solid #43A04730" : "none",
              }}
            >
              <insight.Icon size={13} color={insight.tipo === "positivo" ? "#43A047" : "#8A8B8C"} />
            </div>
            <p className="text-[13px] font-semibold text-ink-500 leading-snug">{insight.text}</p>
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
          <h1 className="text-[28px] font-bold text-ink-500 leading-tight">Relatório</h1>
          <p className="text-[13px] font-semibold mt-0.5 flex items-center gap-1.5" style={{ color: "var(--hubia-bg-base-700)" }}>
            <LivePulseDot sizePx={7} />
            Dados em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-[14px] bg-white p-1 gap-0.5">
            {PERIODO_OPTIONS.map((opt) => (
              <motion.button
                key={opt.value}
                onClick={() => setPeriodo(opt.value)}
                className="rounded-[12px] px-3.5 py-2 text-[12px] font-bold"
                animate={{
                  backgroundColor: periodo === opt.value ? "var(--hubia-ink-500)" : "transparent",
                  color: periodo === opt.value ? "#D7FF00" : "#A9AAA5",
                }}
                initial={false}
                whileHover={periodo !== opt.value ? { backgroundColor: "rgba(213,210,201,0.3)", color: "var(--hubia-ink-500)" } : {}}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                {opt.label}
              </motion.button>
            ))}
          </div>
          <motion.button
            className="flex items-center gap-1.5 rounded-[12px] bg-white px-3.5 py-2.5 text-[12px] font-bold"
            style={{ color: "#8A8B8C" }}
            whileHover={{ scale: 1.03, color: "var(--hubia-ink-500)" }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Download size={14} />
            Exportar
          </motion.button>
        </div>
      </div>

      {/* ── Row 1: Hero KPIs ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-[2.2fr_1.4fr_1fr_1fr]">
        {KPIS_HERO.map((kpi, i) => {
          const isDark = !!kpi.dark;
          const isLimao = !!kpi.limao;
          const bgColor = isDark ? "var(--hubia-ink-500)" : isLimao ? "var(--hubia-limao-500)" : "#FFFFFF";
          const textMain = isDark ? "#FFFFFF" : "var(--hubia-ink-500)";
          const textSub = isDark ? "#3A3B3C" : isLimao ? "rgba(14,15,16,0.4)" : "#B8B9B3";
          const numSize = isDark ? "80px" : isLimao ? "60px" : "52px";

          return (
            <motion.div
              key={kpi.label}
              className="rounded-[30px] p-6 flex flex-col cursor-default overflow-hidden"
              style={{ backgroundColor: bgColor }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0, 0, 0.2, 1], delay: Math.min(i * 0.07, 0.28) }}
            >
              {/* Label + badge */}
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold tracking-[0.1em] uppercase leading-none text-[10px]" style={{ color: textSub }}>
                  {kpi.label}
                </p>
                {isLimao && kpi.live && <LivePulseDot color="var(--hubia-ink-500)" sizePx={8} />}
                {!isLimao && !isDark && kpi.trend !== undefined && (
                  <div className="flex items-center gap-0.5 font-bold text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{ color: "#43A047", backgroundColor: "#43A04712" }}>
                    <TrendingUp size={9} />
                    +{kpi.trend}{kpi.suffix ?? ""}
                  </div>
                )}
                {isDark && kpi.trend !== undefined && (
                  <div className="flex items-center gap-0.5 font-bold text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{ color: "#D7FF00", backgroundColor: "#D7FF0015" }}>
                    <TrendingUp size={9} />
                    +{kpi.trend}
                  </div>
                )}
              </div>

              {/* Número principal */}
              <p className="font-bold leading-none mt-3 tabular-nums" style={{ fontSize: numSize, color: textMain }}>
                <AnimatedCount target={kpi.value} delay={i * 80} suffix={kpi.suffix ?? ""} />
              </p>

              {/* Card escuro: sparkline de base */}
              {isDark && (
                <div className="mt-6 -mx-6 -mb-6">
                  <MiniSparkline data={SPARKLINE_HERO} color="#D7FF00" height={80} />
                </div>
              )}

              {/* Cards claros: contexto */}
              {!isDark && kpi.context && (
                <div className="mt-4 flex items-center gap-1.5">
                  {isLimao ? <Zap size={11} color="rgba(14,15,16,0.35)" /> : <ArrowUp size={11} color="#43A047" />}
                  <span className="text-[12px] font-bold" style={{ color: isLimao ? "rgba(14,15,16,0.45)" : "#43A047" }}>
                    {kpi.context}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ── Row 2: Saúde Operacional + Atividade LIVE ────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
        <SaudeOperacional />
        <ActivityFeed />
      </div>

      {/* ── Row 3: Gráfico hero ───────────────────────────────────────────── */}
      <motion.div
        className="rounded-[30px] bg-white px-6 pt-7 pb-4"
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
          className="rounded-[30px] bg-white p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0, 0, 0.2, 1], delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px]" style={{ backgroundColor: "#F6F7F2" }}>
              <Cpu size={15} color="#5E5E5F" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-ink-500">Orquestração</h2>
              <p className="text-[11px] font-semibold mt-0.5" style={{ color: "var(--hubia-bg-base-700)" }}>Carga e status em tempo real</p>
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
