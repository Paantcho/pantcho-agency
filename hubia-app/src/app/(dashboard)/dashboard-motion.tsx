"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

interface KpiCard {
  label: string;
  value: string;
  sub: string;
  trend?: "up";
  bg: string;
  labelClass: string;
  valueClass: string;
  subClass: string;
}

interface PedidoPrioritario {
  id: string;
  title: string;
  desc: string;
  status: string;
  badge: string;
  badgeClass: string;
  pct: number;
}

export function KpiCards({ cards }: { cards: KpiCard[] }) {
  return (
    <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((kpi, i) => (
        <motion.div
          key={kpi.label}
          className={`rounded-card flex flex-col justify-between gap-[6px] p-5 ${kpi.bg}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: Math.min(i * 0.06, 0.3) }}
        >
          <div className={`card-kpi-label ${kpi.labelClass}`}>{kpi.label}</div>
          <div className={`card-kpi-value ${kpi.valueClass}`}>{kpi.value}</div>
          {(kpi.sub || kpi.trend) && (
            <div className={`card-kpi-sub ${kpi.subClass}`}>
              {kpi.trend === "up" && <TrendingUp className="size-3 shrink-0" aria-hidden />}
              {kpi.sub}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

export function PedidosPrioritariosCards({ pedidos }: { pedidos: PedidoPrioritario[] }) {
  if (pedidos.length === 0) {
    return (
      <div className="rounded-card bg-surface-500 p-5 text-center text-body-sm text-base-700">
        Nenhum pedido prioritário no momento.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {pedidos.map((pedido, i) => (
        <motion.div
          key={pedido.id}
          className="rounded-card bg-surface-500 p-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: Math.min(i * 0.06, 0.3) }}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-start justify-between gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${pedido.badgeClass}`}>
              {pedido.badge}
            </span>
            <span className="text-label-sm text-base-700">{pedido.id}</span>
          </div>
          <h3 className="mt-3 text-label-md text-ink-500">{pedido.title}</h3>
          <p className="mt-1 text-body-sm text-base-700">{pedido.desc}</p>
          <p className="mt-2 text-body-sm text-base-700">{pedido.status}</p>
          <div className="mt-3 hubia-progress-track h-1">
            <div className="hubia-progress-bar bg-ink-500" style={{ width: `${pedido.pct}%` }} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
