"use client";

import {
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
  ArrowDown,
  ArrowRight,
  Database,
  MessageSquare,
  FileText,
  Network,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ============================================================
// Types
// ============================================================

interface AgentNode {
  name: string;
  slug: string;
  icon: LucideIcon;
  color: string;
  level: "lead" | "specialist";
  description: string;
}

interface SquadSection {
  name: string;
  color: string;
  agents: AgentNode[];
}

// ============================================================
// Data
// ============================================================

const ORCHESTRATOR: AgentNode = {
  name: "Orquestrador",
  slug: "orquestrador",
  icon: Brain,
  color: "var(--hubia-limao-500)",
  level: "lead",
  description: "CEO — classifica, delega, valida",
};

const SQUADS: SquadSection[] = [
  {
    name: "Dev Squad",
    color: "#3B82F6",
    agents: [
      {
        name: "Desenvolvimento",
        slug: "desenvolvimento",
        icon: Code,
        color: "#3B82F6",
        level: "lead",
        description: "Full-stack, QA, segurança",
      },
      {
        name: "Motion & Interação",
        slug: "motion-interacao",
        icon: Sparkles,
        color: "#8B5CF6",
        level: "specialist",
        description: "Animações, hover, transições",
      },
      {
        name: "Criador de Agentes",
        slug: "criador-de-agentes",
        icon: PlusCircle,
        color: "#F59E0B",
        level: "lead",
        description: "Fábrica de novos agentes",
      },
    ],
  },
  {
    name: "Audiovisual Squad",
    color: "#EC4899",
    agents: [
      {
        name: "Planner",
        slug: "planner-conteudo",
        icon: Calendar,
        color: "#EC4899",
        level: "specialist",
        description: "Calendário e narrativa",
      },
      {
        name: "Copywriter",
        slug: "copywriter",
        icon: PenTool,
        color: "#F97316",
        level: "specialist",
        description: "Voz da creator",
      },
      {
        name: "Dir. de Arte",
        slug: "diretor-de-arte",
        icon: Palette,
        color: "#14B8A6",
        level: "specialist",
        description: "Mood, paleta, estética",
      },
      {
        name: "Dir. de Cena",
        slug: "diretor-de-cena",
        icon: Camera,
        color: "#6366F1",
        level: "specialist",
        description: "Iluminação, câmera, pose",
      },
      {
        name: "Consistência",
        slug: "consistencia",
        icon: ShieldCheck,
        color: "#EF4444",
        level: "lead",
        description: "Poder de veto total",
      },
      {
        name: "Eng. Prompts",
        slug: "engenheiro-de-prompts",
        icon: Wand2,
        color: "#A855F7",
        level: "specialist",
        description: "Prompt final otimizado",
      },
    ],
  },
];

const MEMORY_BLOCKS = [
  { name: "WORKING.md", description: "Tarefa ativa", color: "var(--hubia-limao-500)" },
  { name: "MEMORY.md", description: "Longo prazo", color: "#3B82F6" },
  { name: "STATUS.md", description: "Consolidado", color: "#14B8A6" },
  { name: "LESSONS.md", description: "Lições", color: "#F59E0B" },
];

// ============================================================
// Components
// ============================================================

function AgentCard({ agent }: { agent: AgentNode }) {
  const Icon = agent.icon;

  return (
    <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${agent.color}20` }}
      >
        <Icon size={18} style={{ color: agent.color }} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="font-bold"
            style={{ fontSize: "13px", color: "var(--hubia-ink-500)" }}
          >
            {agent.name}
          </span>
          <span
            className="rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider"
            style={{
              background:
                agent.level === "lead" ? "var(--hubia-ink-500)" : "var(--hubia-bg-base-500)",
              color:
                agent.level === "lead" ? "var(--hubia-limao-500)" : "var(--hubia-bg-base-700)",
            }}
          >
            {agent.level}
          </span>
        </div>
        <p
          className="truncate font-semibold"
          style={{ fontSize: "11px", color: "var(--hubia-bg-base-700)" }}
        >
          {agent.description}
        </p>
      </div>
    </div>
  );
}

export default function ArquiteturaClient() {
  return (
    <div className="hubia-fade-in flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1
          className="font-bold"
          style={{ fontSize: "28px", color: "var(--hubia-ink-500)" }}
        >
          Arquitetura
        </h1>
        <p
          className="mt-1 font-semibold"
          style={{ fontSize: "14px", color: "var(--hubia-bg-base-700)" }}
        >
          Visão completa do sistema multi-agente Pantcho Agency
        </p>
      </div>

      {/* Flow diagram */}
      <div className="flex flex-col items-center gap-4">
        {/* Entrada */}
        <div
          className="flex items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-4"
          style={{ borderColor: "#D9D9D4" }}
        >
          <MessageSquare size={20} style={{ color: "var(--hubia-bg-base-700)" }} />
          <div>
            <p
              className="font-bold"
              style={{ fontSize: "14px", color: "var(--hubia-ink-500)" }}
            >
              Entrada
            </p>
            <p
              className="font-semibold"
              style={{ fontSize: "11px", color: "var(--hubia-bg-base-700)" }}
            >
              Web UI / API / Telegram (futuro)
            </p>
          </div>
        </div>

        <ArrowDown size={20} style={{ color: "#D9D9D4" }} />

        {/* Orquestrador */}
        <div
          className="w-full max-w-lg rounded-2xl border-2 px-6 py-5"
          style={{ borderColor: "var(--hubia-limao-500)", background: "color-mix(in srgb, var(--hubia-limao-500) 6%, transparent)" }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: "color-mix(in srgb, var(--hubia-limao-500) 19%, transparent)" }}
            >
              <Brain size={28} style={{ color: "var(--hubia-ink-500)" }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className="font-bold"
                  style={{ fontSize: "18px", color: "var(--hubia-ink-500)" }}
                >
                  {ORCHESTRATOR.name}
                </h2>
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                  style={{ background: "var(--hubia-ink-500)", color: "var(--hubia-limao-500)" }}
                >
                  CEO
                </span>
              </div>
              <p
                className="mt-0.5 font-semibold"
                style={{ fontSize: "13px", color: "var(--hubia-bg-base-700)" }}
              >
                BrainRouter: classifica pedido → identifica squad → delega
                → valida → consolida
              </p>
            </div>
          </div>
        </div>

        {/* Arrows to squads */}
        <div className="flex items-center gap-8">
          <ArrowDown size={20} style={{ color: "#3B82F6" }} />
          <ArrowDown size={20} style={{ color: "#EC4899" }} />
        </div>

        {/* Squads */}
        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
          {SQUADS.map((squad) => (
            <div
              key={squad.name}
              className="rounded-2xl border p-5"
              style={{ borderColor: `${squad.color}30` }}
            >
              <h3
                className="mb-4 font-bold uppercase tracking-wider"
                style={{ fontSize: "12px", color: squad.color }}
              >
                {squad.name}
              </h3>
              <div className="flex flex-col gap-2">
                {squad.agents.map((agent) => (
                  <AgentCard key={agent.slug} agent={agent} />
                ))}
              </div>

              {/* Audiovisual flow */}
              {squad.name === "Audiovisual Squad" && (
                <div
                  className="mt-4 flex items-center gap-2 rounded-xl px-4 py-3"
                  style={{ background: "#F5F5F3" }}
                >
                  <Zap size={14} style={{ color: "#EC4899" }} />
                  <p
                    className="font-semibold"
                    style={{ fontSize: "11px", color: "var(--hubia-bg-base-700)" }}
                  >
                    Fluxo: Planner → Copywriter → Dir. Arte → Dir. Cena →
                    Consistência → Eng. Prompts
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Squads previstos */}
        <div
          className="w-full rounded-2xl border-2 border-dashed px-6 py-4"
          style={{ borderColor: "#D9D9D4" }}
        >
          <h3
            className="mb-2 font-bold uppercase tracking-wider"
            style={{ fontSize: "11px", color: "var(--hubia-bg-base-700)" }}
          >
            Squads Previstos
          </h3>
          <div className="flex flex-wrap gap-2">
            {["Marketing", "Finanças", "CRM", "Social Media"].map(
              (name) => (
                <span
                  key={name}
                  className="rounded-full px-3 py-1 text-[11px] font-semibold"
                  style={{ background: "var(--hubia-bg-base-500)", color: "var(--hubia-bg-base-700)" }}
                >
                  {name}
                </span>
              )
            )}
            <span
              className="rounded-full px-3 py-1 text-[11px] font-semibold"
              style={{ background: "color-mix(in srgb, var(--hubia-limao-500) 12%, transparent)", color: "var(--hubia-ink-500)" }}
            >
              + Criados sob demanda
            </span>
          </div>
        </div>

        <ArrowDown size={20} style={{ color: "#D9D9D4" }} />

        {/* Memória compartilhada */}
        <div
          className="w-full rounded-2xl border px-6 py-5"
          style={{ borderColor: "#3B82F630", background: "#3B82F608" }}
        >
          <div className="mb-4 flex items-center gap-3">
            <Database size={20} style={{ color: "#3B82F6" }} />
            <h3
              className="font-bold"
              style={{ fontSize: "15px", color: "var(--hubia-ink-500)" }}
            >
              Memória Compartilhada
            </h3>
            <span
              className="text-[11px] font-semibold"
              style={{ color: "var(--hubia-bg-base-700)" }}
            >
              (Source of Truth)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {MEMORY_BLOCKS.map((block) => (
              <div
                key={block.name}
                className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5"
              >
                <div
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: block.color }}
                />
                <div>
                  <p
                    className="font-bold"
                    style={{
                      fontSize: "11px",
                      color: "var(--hubia-ink-500)",
                      fontFamily: "monospace",
                    }}
                  >
                    {block.name}
                  </p>
                  <p
                    className="font-semibold"
                    style={{ fontSize: "10px", color: "var(--hubia-bg-base-700)" }}
                  >
                    {block.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ciclo */}
        <div
          className="flex items-center gap-3 rounded-2xl px-6 py-4"
          style={{ background: "var(--hubia-ink-500)" }}
        >
          <Network size={20} style={{ color: "var(--hubia-limao-500)" }} />
          <div>
            <p
              className="font-bold"
              style={{ fontSize: "13px", color: "var(--hubia-limao-500)" }}
            >
              Ciclo: PLAN → EXECUTE → REFLECT
            </p>
            <p
              className="mt-0.5 font-semibold"
              style={{ fontSize: "11px", color: "var(--hubia-bg-base-700)" }}
            >
              Obrigatório para todo agente. Validação de qualidade antes de
              entregar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
