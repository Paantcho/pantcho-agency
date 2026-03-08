"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { BarChart3, TrendingUp, Users, Package, FolderKanban, Activity, Zap } from "lucide-react";
import { getRelatorioStats } from "./actions";
import type { RelatorioStats } from "./actions";

const PERIODO_OPTIONS = [
  { value: "semana", label: "Última semana" },
  { value: "mes", label: "Último mês" },
  { value: "trimestre", label: "Último trimestre" },
] as const;

const STATUS_COLORS: Record<string, string> = {
  rascunho: "#A9AAA5", aguardando: "#5E5E5F", em_andamento: "#D7FF00",
  revisao: "#FB8C00", aprovado: "#43A047", entregue: "#0E0F10", cancelado: "#E53935",
};

const URGENCIA_COLORS: Record<string, string> = {
  baixa: "#A9AAA5", media: "#5E5E5F", alta: "#FB8C00", critica: "#E53935",
};

function AnimatedBar({ value, max, color, delay = 0 }: { value: number; max: number; color: string; delay?: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="relative h-2 w-full rounded-full bg-[#EEEFE9] overflow-hidden">
      <motion.div
        className="absolute left-0 top-0 h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: [0, 0, 0.2, 1], delay }}
      />
    </div>
  );
}

function AnimatedNumber({ value, delay = 0 }: { value: number; delay?: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0, 0, 0.2, 1], delay }}
    >
      {value}
    </motion.span>
  );
}

export default function RelatorioClient({
  organizationId,
  initialStats,
}: {
  organizationId: string;
  initialStats: RelatorioStats;
}) {
  const router = useRouter();
  const [stats, setStats] = useState(initialStats);
  const [periodo, setPeriodo] = useState<"semana" | "mes" | "trimestre">("mes");
  const [loading, setLoading] = useState(false);

  const handlePeriodo = async (p: "semana" | "mes" | "trimestre") => {
    setPeriodo(p);
    setLoading(true);
    const data = await getRelatorioStats(organizationId, p);
    setStats(data);
    setLoading(false);
  };

  const maxStatus = Math.max(...stats.pedidosPorStatus.map((s) => s.count), 1);
  const maxTipo = Math.max(...stats.pedidosPorTipo.map((t) => t.count), 1);

  // KPI cards
  const kpis = [
    { label: "Total de pedidos", value: stats.totalPedidos, icon: Package, color: "#0E0F10" },
    { label: "Em andamento", value: stats.emAndamento, icon: Zap, color: "#D7FF00" },
    { label: `Entregues (${periodo})`, value: stats.entreguesMes, icon: TrendingUp, color: "#43A047" },
    { label: "Creators ativas", value: stats.creatorsAtivos, icon: Users, color: "#5E5E5F" },
    { label: "Projetos", value: stats.projetos, icon: FolderKanban, color: "#A9AAA5" },
  ];

  return (
    <motion.div
      className="flex flex-col gap-6"
      animate={{ opacity: loading ? 0.6 : 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#0E0F10]">Relatório</h1>
          <p className="text-[14px] text-[#A9AAA5] mt-0.5">Visão geral da operação</p>
        </div>
        {/* Seletor de período */}
        <div className="flex items-center gap-1 rounded-[14px] bg-white p-1">
          {PERIODO_OPTIONS.map((opt) => (
            <motion.button
              key={opt.value}
              onClick={() => handlePeriodo(opt.value)}
              className="rounded-[10px] px-3.5 py-2 text-[12px] font-semibold"
              animate={{
                backgroundColor: periodo === opt.value ? "#0E0F10" : "transparent",
                color: periodo === opt.value ? "#D7FF00" : "#A9AAA5",
              }}
              initial={false}
              whileHover={periodo !== opt.value ? { backgroundColor: "rgba(213,210,201,0.3)" } : {}}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15 }}
            >
              {opt.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            className="rounded-[20px] bg-white p-5 flex flex-col gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.35, ease: [0, 0, 0.2, 1], delay: Math.min(i * 0.07, 0.3) }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-[12px]"
              style={{ backgroundColor: `${kpi.color}18` }}
            >
              <kpi.icon size={18} color={kpi.color} />
            </div>
            <div>
              <p className="text-[28px] font-bold text-[#0E0F10] leading-none">
                <AnimatedNumber value={kpi.value} delay={i * 0.07} />
              </p>
              <p className="text-[12px] text-[#A9AAA5] mt-1">{kpi.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Gráficos: Status + Tipo */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Por status */}
        <motion.div
          className="rounded-[20px] bg-white p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0, 0, 0.2, 1], delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={16} color="#0E0F10" />
            <h2 className="text-[15px] font-bold text-[#0E0F10]">Pedidos por status</h2>
          </div>
          <div className="flex flex-col gap-3">
            {stats.pedidosPorStatus.sort((a, b) => b.count - a.count).map((s, i) => (
              <div key={s.status} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold capitalize" style={{ color: STATUS_COLORS[s.status] ?? "#A9AAA5" }}>
                    {s.status.replace("_", " ")}
                  </span>
                  <span className="text-[12px] font-bold text-[#0E0F10]">{s.count}</span>
                </div>
                <AnimatedBar value={s.count} max={maxStatus} color={STATUS_COLORS[s.status] ?? "#A9AAA5"} delay={0.25 + i * 0.05} />
              </div>
            ))}
            {stats.pedidosPorStatus.length === 0 && (
              <p className="text-[13px] text-[#A9AAA5] text-center py-4">Nenhum dado ainda</p>
            )}
          </div>
        </motion.div>

        {/* Por tipo */}
        <motion.div
          className="rounded-[20px] bg-white p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0, 0, 0.2, 1], delay: 0.25 }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Package size={16} color="#0E0F10" />
            <h2 className="text-[15px] font-bold text-[#0E0F10]">Pedidos por tipo</h2>
          </div>
          <div className="flex flex-col gap-3">
            {stats.pedidosPorTipo.sort((a, b) => b.count - a.count).map((t, i) => (
              <div key={t.tipo} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-[#5E5E5F] capitalize">
                    {t.tipo.replace("_", " ")}
                  </span>
                  <span className="text-[12px] font-bold text-[#0E0F10]">{t.count}</span>
                </div>
                <AnimatedBar value={t.count} max={maxTipo} color="#D7FF00" delay={0.3 + i * 0.05} />
              </div>
            ))}
            {stats.pedidosPorTipo.length === 0 && (
              <p className="text-[13px] text-[#A9AAA5] text-center py-4">Nenhum dado ainda</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Pedidos recentes + Activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        {/* Pedidos recentes */}
        <motion.div
          className="rounded-[20px] bg-white p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0, 0, 0.2, 1], delay: 0.3 }}
        >
          <h2 className="text-[15px] font-bold text-[#0E0F10] mb-4">Pedidos recentes</h2>
          <div className="flex flex-col gap-2">
            {stats.pedidosRecentes.map((p, i) => (
              <motion.div
                key={p.id}
                className="flex items-center gap-3 cursor-pointer rounded-[10px] px-3 py-2.5 -mx-3"
                whileHover={{ backgroundColor: "#EEEFE9" }}
                whileTap={{ scale: 0.99 }}
                onClick={() => router.push(`/pedidos/${p.id}`)}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.04 }}
              >
                <div
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[p.status] ?? "#A9AAA5" }}
                />
                <p className="text-[13px] font-semibold text-[#0E0F10] flex-1 truncate">{p.titulo}</p>
                {p.creator && <span className="text-[11px] text-[#A9AAA5]">{p.creator.name}</span>}
                <span className="text-[11px] text-[#A9AAA5] flex-shrink-0">
                  {new Date(p.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </motion.div>
            ))}
            {stats.pedidosRecentes.length === 0 && (
              <p className="text-[13px] text-[#A9AAA5] text-center py-8">Nenhum pedido ainda</p>
            )}
          </div>
        </motion.div>

        {/* Activity log */}
        <motion.div
          className="rounded-[20px] bg-white p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0, 0, 0.2, 1], delay: 0.35 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity size={15} color="#0E0F10" />
            <h2 className="text-[15px] font-bold text-[#0E0F10]">Atividade recente</h2>
          </div>
          <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto pr-1">
            {stats.activityRecente.map((a, i) => (
              <motion.div
                key={a.id}
                className="flex items-start gap-2.5"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.03 }}
              >
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#D7FF00] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#0E0F10] leading-tight">
                    {a.action.replace(".", " → ")}
                  </p>
                  <p className="text-[10px] text-[#A9AAA5] mt-0.5">
                    {new Date(a.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </motion.div>
            ))}
            {stats.activityRecente.length === 0 && (
              <p className="text-[12px] text-[#A9AAA5] text-center py-6">Nenhuma atividade no período</p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
