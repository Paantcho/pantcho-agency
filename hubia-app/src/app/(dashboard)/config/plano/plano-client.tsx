"use client";

import { motion } from "framer-motion";
import {
  Users,
  FolderKanban,
  CalendarDays,
  Zap,
  Bot,
  Brain,
  Network,
  Lock,
  CheckCircle2,
  Crown,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

type PlanoNivel = 1 | 2 | 3 | 4;

const planos: {
  nivel: PlanoNivel;
  nome: string;
  descricao: string;
  modulos: { icon: React.ElementType; label: string }[];
  branding: boolean;
  destaque?: boolean;
}[] = [
  {
    nivel: 1,
    nome: "Básico",
    descricao: "Acesso ao módulo de Creators com identidade visual global da Hubia.",
    modulos: [
      { icon: Users, label: "Creators" },
    ],
    branding: false,
  },
  {
    nivel: 2,
    nome: "Profissional",
    descricao: "Creators + módulos de produção e gestão de projetos.",
    modulos: [
      { icon: Users, label: "Creators" },
      { icon: FolderKanban, label: "Projetos" },
      { icon: CalendarDays, label: "Calendário" },
    ],
    branding: false,
    destaque: true,
  },
  {
    nivel: 3,
    nome: "Avançado",
    descricao: "Acesso completo a todas as funcionalidades estruturais da plataforma.",
    modulos: [
      { icon: Users, label: "Creators" },
      { icon: FolderKanban, label: "Projetos" },
      { icon: CalendarDays, label: "Calendário" },
      { icon: Zap, label: "Automação" },
      { icon: Bot, label: "Agentes" },
      { icon: Brain, label: "Memória" },
      { icon: Network, label: "Arquitetura" },
    ],
    branding: false,
  },
  {
    nivel: 4,
    nome: "Enterprise",
    descricao: "Personalização completa da identidade visual + todos os módulos.",
    modulos: [
      { icon: Users, label: "Creators" },
      { icon: FolderKanban, label: "Projetos" },
      { icon: CalendarDays, label: "Calendário" },
      { icon: Zap, label: "Automação" },
      { icon: Bot, label: "Agentes" },
      { icon: Brain, label: "Memória" },
      { icon: Network, label: "Arquitetura" },
      { icon: Sparkles, label: "Branding próprio" },
    ],
    branding: true,
  },
];

export default function PlanoClient({
  planoAtual,
}: {
  planoAtual: PlanoNivel;
}) {
  const atual = planos.find((p) => p.nivel === planoAtual) ?? planos[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Banner do plano ativo */}
      <div className="rounded-[30px] bg-ink-500 p-6 flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-limao-500">
            <Crown size={18} color="var(--hubia-ink-500)" />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-white/50 uppercase tracking-wide">
              Plano atual
            </p>
            <p className="mt-0.5 text-[22px] font-bold text-white">
              {atual.nome}{" "}
              <span className="text-limao-500">N{planoAtual}</span>
            </p>
            <p className="mt-1 text-[13px] text-white/60 max-w-[400px]">
              {atual.descricao}
            </p>
          </div>
        </div>

        <motion.button
          className="flex items-center gap-2 rounded-[14px] border border-white/20 px-5 py-2.5 text-[13px] font-semibold text-white"
          whileHover={{ backgroundColor: "rgba(255,255,255,0.08)", scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}
        >
          <ArrowUpRight size={14} />
          Fazer upgrade
        </motion.button>
      </div>

      {/* Módulos liberados */}
      <div className="rounded-[30px] bg-white p-6">
        <h2 className="mb-4 text-[15px] font-bold text-ink-500">
          Módulos disponíveis
        </h2>
        <div className="flex flex-wrap gap-2">
          {atual.modulos.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.06, 0.3) }}
                className="flex items-center gap-2 rounded-[9999px] bg-base-500 px-4 py-2"
              >
                <Icon size={14} className="text-ink-500" />
                <span className="text-[13px] font-semibold text-ink-500">
                  {m.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Comparativo de planos */}
      <div className="rounded-[30px] bg-white p-6">
        <h2 className="mb-5 text-[15px] font-bold text-ink-500">
          Comparativo de planos
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {planos.map((p, i) => {
            const isAtual = p.nivel === planoAtual;
            return (
              <motion.div
                key={p.nivel}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.08, 0.3) }}
                className="relative flex flex-col gap-4 rounded-[16px] p-5"
                style={{
                  backgroundColor: isAtual ? "var(--hubia-ink-500)" : "var(--hubia-bg-base-500)",
                }}
              >
                {isAtual && (
                  <div className="absolute right-3 top-3 rounded-[6px] bg-limao-500 px-2 py-0.5 text-[10px] font-bold text-ink-500 uppercase">
                    Atual
                  </div>
                )}

                <div>
                  <p
                    className="text-[11px] font-bold uppercase tracking-wide"
                    style={{ color: isAtual ? "var(--hubia-bg-base-700)" : "var(--hubia-bg-base-700)" }}
                  >
                    Nível {p.nivel}
                  </p>
                  <p
                    className="mt-0.5 text-[18px] font-bold"
                    style={{ color: isAtual ? "#FFFFFF" : "var(--hubia-ink-500)" }}
                  >
                    {p.nome}
                  </p>
                  <p
                    className="mt-1 text-[12px] leading-relaxed"
                    style={{ color: isAtual ? "rgba(255,255,255,0.5)" : "var(--hubia-bg-base-700)" }}
                  >
                    {p.descricao}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  {p.modulos.map((m) => {
                    const Icon = m.icon;
                    return (
                      <div key={m.label} className="flex items-center gap-2">
                        <CheckCircle2
                          size={13}
                          color={isAtual ? "var(--hubia-limao-500)" : "#43A047"}
                        />
                        <span
                          className="text-[12px] font-semibold"
                          style={{ color: isAtual ? "rgba(255,255,255,0.8)" : "var(--hubia-ink-500)" }}
                        >
                          {m.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-auto flex items-center gap-1.5">
                  {p.branding ? (
                    <Sparkles
                      size={13}
                      color={isAtual ? "var(--hubia-limao-500)" : "var(--hubia-ink-500)"}
                    />
                  ) : (
                    <Lock size={13} color={isAtual ? "#555" : "var(--hubia-bg-base-700)"} />
                  )}
                  <span
                    className="text-[11px] font-semibold"
                    style={{
                      color: p.branding
                        ? isAtual ? "var(--hubia-limao-500)" : "var(--hubia-ink-500)"
                        : isAtual ? "#555" : "var(--hubia-bg-base-700)",
                    }}
                  >
                    {p.branding ? "Branding próprio liberado" : "Branding Hubia padrão"}
                  </span>
                </div>

                {!isAtual && p.nivel > planoAtual && (
                  <motion.button
                    className="mt-1 rounded-[12px] bg-ink-500 px-4 py-2.5 text-[12px] font-bold text-white"
                    whileHover={{ backgroundColor: "#2a2b2c", scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                  >
                    Fazer upgrade
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
