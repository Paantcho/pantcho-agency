"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Bot,
  Brain,
  Code,
  Sparkles,
  PlusCircle,
  Calendar,
  PenTool,
  Palette,
  Camera,
  ShieldCheck,
  Wand2,
  Zap,
  AlertCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AgentRow } from "./actions";
import { seedAgentsForOrganization } from "./actions";

const SQUAD_LABELS: Record<string, string> = {
  orquestracao: "Orquestração",
  "dev-squad": "Dev Squad",
  "audiovisual-squad": "Audiovisual Squad",
};

const SQUAD_ORDER = ["orquestracao", "dev-squad", "audiovisual-squad"];

const ICON_MAP: Record<string, LucideIcon> = {
  brain: Brain,
  code: Code,
  sparkles: Sparkles,
  "plus-circle": PlusCircle,
  calendar: Calendar,
  "pen-tool": PenTool,
  palette: Palette,
  camera: Camera,
  "shield-check": ShieldCheck,
  "wand-2": Wand2,
};

function getIcon(config: Record<string, unknown>): LucideIcon {
  const iconName = (config.icon as string) || "bot";
  return ICON_MAP[iconName] || Bot;
}

function getColor(config: Record<string, unknown>): string {
  return (config.color as string) || "#D7FF00";
}

function getSquad(config: Record<string, unknown>): string {
  return (config.squad as string) || "dev-squad";
}

function getLevel(config: Record<string, unknown>): string {
  return (config.level as string) || "specialist";
}

function AgentCard({ agent }: { agent: AgentRow }) {
  const Icon = getIcon(agent.config);
  const color = getColor(agent.config);
  const level = getLevel(agent.config);

  return (
    <Link
      href={`/agentes/${agent.slug}`}
      className="group flex flex-col gap-4 rounded-[30px] border border-transparent bg-white p-6 transition-all duration-300 hover:border-[#D7FF00]/30"
    >
      {/* Ícone + Status */}
      <div className="flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={24} style={{ color }} strokeWidth={2} />
        </div>
        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
            style={{
              background:
                agent.status === "ativo" ? "#D7FF0020" : "#EF444420",
              color: agent.status === "ativo" ? "#0E0F10" : "#EF4444",
            }}
          >
            {agent.status}
          </span>
        </div>
      </div>

      {/* Nome + Descrição */}
      <div className="flex flex-col gap-1.5">
        <h3
          className="font-bold leading-tight"
          style={{ fontSize: "17px", color: "var(--hubia-ink-500)" }}
        >
          {agent.name}
        </h3>
        <p
          className="line-clamp-2 font-semibold leading-snug"
          style={{ fontSize: "13px", color: "var(--hubia-bg-base-700)" }}
        >
          {agent.description}
        </p>
      </div>

      {/* Footer: nível + skills */}
      <div className="mt-auto flex items-center gap-3">
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
          style={{
            background: level === "lead" ? "#0E0F10" : "#EEEFE9",
            color: level === "lead" ? "#D7FF00" : "#0E0F10",
          }}
        >
          {level}
        </span>
        {agent.skillCount > 0 && (
          <span
            className="text-[11px] font-semibold"
            style={{ color: "var(--hubia-bg-base-700)" }}
          >
            {agent.skillCount} {agent.skillCount === 1 ? "skill" : "skills"}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function AgentesListClient({
  agents,
  hasProvider = false,
}: {
  agents: AgentRow[];
  hasProvider?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [seeded, setSeeded] = useState(false);

  // Agrupar por squad
  const squads = SQUAD_ORDER.filter((squad) =>
    agents.some((a) => getSquad(a.config) === squad)
  );

  async function handleSeed() {
    startTransition(async () => {
      const result = await seedAgentsForOrganization();
      if (result.ok) {
        setSeeded(true);
        window.location.reload();
      }
    });
  }

  // Estado vazio — sem agentes
  if (agents.length === 0) {
    return (
      <div className="hubia-fade-in flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1
            className="font-bold"
            style={{ fontSize: "28px", color: "var(--hubia-ink-500)" }}
          >
            Agentes
          </h1>
        </div>

        <div
          className="flex flex-col items-center justify-center gap-5 rounded-[30px] py-20"
          style={{ background: "#FFFFFF" }}
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: "#EEEFE9" }}
          >
            <Bot size={32} style={{ color: "var(--hubia-bg-base-700)" }} />
          </div>
          <div className="text-center">
            <p
              className="font-semibold"
              style={{ fontSize: "16px", color: "var(--hubia-ink-500)" }}
            >
              Nenhum agente configurado
            </p>
            <p
              className="mt-1 font-semibold"
              style={{ fontSize: "13px", color: "var(--hubia-bg-base-700)" }}
            >
              Inicialize os 10 agentes do ecossistema Pantcho Agency.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSeed}
            disabled={isPending}
            className="flex items-center gap-2 rounded-full font-bold transition-opacity hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{
              background: "var(--hubia-limao-500)",
              color: "var(--hubia-ink-500)",
              fontSize: "14px",
              padding: "12px 28px",
            }}
          >
            <Zap size={16} strokeWidth={2.5} />
            {isPending ? "Inicializando..." : "Inicializar Agentes"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hubia-fade-in flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1
          className="font-bold"
          style={{ fontSize: "28px", color: "var(--hubia-ink-500)" }}
        >
          Agentes
        </h1>
        <div className="flex items-center gap-3">
          <span
            className="font-semibold"
            style={{ fontSize: "14px", color: "var(--hubia-bg-base-700)" }}
          >
            {agents.filter((a) => a.status === "ativo").length} ativos
          </span>
        </div>
      </div>

      {/* Banner: sem provedor */}
      <ProviderBanner hasProvider={hasProvider} />

      {/* Agentes agrupados por squad */}
      {squads.map((squad) => {
        const squadAgents = agents.filter(
          (a) => getSquad(a.config) === squad
        );

        return (
          <section key={squad} className="flex flex-col gap-4">
            <h2
              className="font-bold uppercase tracking-wider"
              style={{ fontSize: "12px", color: "var(--hubia-bg-base-700)" }}
            >
              {SQUAD_LABELS[squad] || squad}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {squadAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ProviderBanner({ hasProvider }: { hasProvider: boolean }) {
  if (hasProvider) return null;

  return (
    <div
      className="flex items-center gap-3 rounded-2xl border px-5 py-4"
      style={{
        borderColor: "#D7FF0050",
        background: "#D7FF0010",
      }}
    >
      <AlertCircle size={18} style={{ color: "var(--hubia-bg-base-700)" }} />
      <p
        className="flex-1 font-semibold"
        style={{ fontSize: "13px", color: "var(--hubia-ink-500)" }}
      >
        Para conversar com os agentes, configure um provedor de IA em{" "}
        <Link
          href="/organization/provedores"
          className="font-bold underline"
          style={{ color: "var(--hubia-ink-500)" }}
        >
          Config &gt; Provedores
        </Link>
        .
      </p>
    </div>
  );
}
