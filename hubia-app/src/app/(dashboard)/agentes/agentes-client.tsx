"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Code2,
  PenTool,
  Pencil,
  FileText,
  Timer,
  ChevronRight,
} from "lucide-react";
import { SlidingTabs } from "@/components/ui/sliding-tabs";
import type { SquadWithAgents, SkillsBySquad } from "./actions";

// ─── Mapa de ícone por squad slug ────────────────────────────────
const SQUAD_ICON: Record<string, React.ReactNode> = {
  "dev-squad": <Code2 size={14} strokeWidth={2.5} />,
  "audiovisual-squad": <PenTool size={14} strokeWidth={2.5} />,
};

// ─── Mapa de badge de status do agente ──────────────────────────
const STATUS_BADGE: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  ativo: { label: "Revisão ativa", bg: "#D7FF00", color: "#0E0F10" },
  inativo: { label: "Standby", bg: "#D9D9D4", color: "#5E5E5F" },
  rascunho: { label: "Standby", bg: "#D9D9D4", color: "#5E5E5F" },
};

// Alguns agentes têm status especial "em tarefa" — identificado via config futuramente
// Por ora, "ativo" sem ser o orquestrador = "Standby"
function getStatusBadge(status: string, name: string) {
  if (status === "ativo" && name === "Orquestrador") {
    return { label: "Revisão ativa", bg: "#D7FF00", color: "#0E0F10" };
  }
  if (status === "ativo" && (name === "Consistência" || name === "Eng. de Prompts")) {
    return { label: "Em tarefa", bg: "#0E0F10", color: "#D7FF00" };
  }
  return STATUS_BADGE[status] ?? STATUS_BADGE.rascunho;
}

// ─── Card de agente ──────────────────────────────────────────────
function AgentCard({
  agent,
  index,
}: {
  agent: SquadWithAgents["agents"][0];
  index: number;
}) {
  const badge = getStatusBadge(agent.status, agent.name);

  return (
    <motion.div
      className="flex flex-col rounded-[20px] p-5"
      style={{ background: "#0E0F10", minHeight: "200px" }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: [0, 0, 0.2, 1],
        delay: Math.min(index * 0.06, 0.3),
      }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header: avatar + badge */}
      <div className="mb-4 flex items-start justify-between gap-3">
        {/* Avatar placeholder */}
        <div
          className="h-[52px] w-[52px] shrink-0 rounded-[12px]"
          style={{ background: "#D7FF00" }}
        />
        {/* Badge de status */}
        <span
          className="mt-0.5 rounded-[9999px] px-2.5 py-1 text-[10px] font-bold tracking-[0.4px]"
          style={{ background: badge.bg, color: badge.color }}
        >
          {badge.label}
        </span>
      </div>

      {/* Nome */}
      <h3
        className="mb-1.5 font-bold leading-tight"
        style={{ fontSize: "18px", color: "#D7FF00" }}
      >
        {agent.name}
      </h3>

      {/* Descrição */}
      <p
        className="mb-4 flex-1 text-[12px] leading-[1.5]"
        style={{ color: "rgba(255,255,255,0.65)" }}
      >
        {agent.description}
      </p>

      {/* Tags */}
      {agent.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {agent.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-[6px] px-2 py-0.5 text-[10px] font-semibold"
              style={{ background: "rgba(255,255,255,0.1)", color: "#A9AAA5" }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Tab 1 — Squads ──────────────────────────────────────────────
function TabSquads({
  squads,
  filterSlug,
}: {
  squads: SquadWithAgents[];
  filterSlug: string | null;
}) {
  const filtered = filterSlug
    ? squads.filter((s) => s.slug === filterSlug)
    : squads;

  return (
    <div className="flex flex-col gap-8">
      {filtered.map((squad) => (
        <div key={squad.id}>
          {/* Header do squad */}
          <div className="mb-4 flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-[8px]"
              style={{ background: "#D7FF00" }}
            >
              {SQUAD_ICON[squad.slug] ?? <Code2 size={14} />}
            </div>
            <span
              className="font-bold"
              style={{ fontSize: "16px", color: "#0E0F10" }}
            >
              {squad.name}
            </span>
            <span
              className="text-[13px] font-medium"
              style={{ color: "#A9AAA5" }}
            >
              {squad.agents.length} {squad.agents.length === 1 ? "agente" : "agentes"}
            </span>
          </div>

          {/* Grid de cards */}
          <div className="grid grid-cols-3 gap-4">
            {squad.agents.map((agent, i) => (
              <AgentCard key={agent.id} agent={agent} index={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Tab 2 — Skills Registry ─────────────────────────────────────
function TabSkillsRegistry({ skillsBySquad }: { skillsBySquad: SkillsBySquad[] }) {
  return (
    <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
      {skillsBySquad.map((item) => (
        <div key={item.squad.id}>
          {/* Header do squad */}
          <div className="mb-4 flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-[8px]"
              style={{ background: "#D7FF00" }}
            >
              {SQUAD_ICON[item.squad.slug] ?? <Code2 size={14} />}
            </div>
            <span
              className="font-bold"
              style={{ fontSize: "16px", color: "#0E0F10" }}
            >
              {item.squad.name}
            </span>
            <span className="text-[13px] font-medium" style={{ color: "#A9AAA5" }}>
              {item.skills.length} {item.skills.length === 1 ? "skill" : "skills"}
            </span>
          </div>

          {/* Lista de skills */}
          <div className="flex flex-col gap-0">
            {item.skills.map((skill, i) => (
              <motion.div
                key={skill.id}
                className="flex items-center justify-between gap-4 rounded-[12px] py-3 px-1"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.2,
                  delay: Math.min(i * 0.04, 0.25),
                  ease: [0, 0, 0.2, 1],
                }}
              >
                <div className="min-w-0 flex-1">
                  <p
                    className="font-bold leading-tight"
                    style={{ fontSize: "14px", color: "#0E0F10" }}
                  >
                    {skill.name}
                  </p>
                  <p
                    className="mt-0.5 text-[12px]"
                    style={{ color: "#A9AAA5" }}
                  >
                    {skill.description}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {skill.isAlways && (
                    <span
                      className="rounded-[9999px] px-2.5 py-1 text-[10px] font-bold tracking-[0.4px]"
                      style={{ background: "#D7FF00", color: "#0E0F10" }}
                    >
                      SEMPRE
                    </span>
                  )}
                  <motion.button
                    type="button"
                    className="flex items-center gap-1.5 rounded-[9999px] border px-3 py-1.5 text-[11px] font-semibold"
                    style={{ borderColor: "#D9D9D4", color: "#0E0F10" }}
                    initial="rest"
                    whileHover="hovered"
                    whileTap={{ scale: 0.96 }}
                    animate="rest"
                    variants={{
                      rest: { backgroundColor: "transparent", scale: 1 },
                      hovered: { backgroundColor: "#EEEFE9", scale: 1.02 },
                    }}
                    transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    EDITAR
                    <motion.span
                      className="flex items-center"
                      variants={{ rest: { scale: 1 }, hovered: { scale: 1.2 } }}
                      transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                    >
                      <Pencil size={11} strokeWidth={2.5} />
                    </motion.span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Tab 3 — Fluxo do Orquestrador ───────────────────────────────
function FlowNode({
  label,
  sublabel,
  variant,
  index,
  children,
}: {
  label: string;
  sublabel?: string;
  variant: "black" | "limao" | "squad-active" | "squad-ghost" | "limao-icon";
  index: number;
  children?: React.ReactNode;
}) {
  const styles: Record<string, { bg: string; color: string; border?: string }> = {
    black: { bg: "#0E0F10", color: "#FFFFFF" },
    limao: { bg: "#D7FF00", color: "#0E0F10" },
    "squad-active": { bg: "#0E0F10", color: "#FFFFFF" },
    "squad-ghost": { bg: "#E8E4F0", color: "#5E5E5F" },
    "limao-icon": { bg: "#D7FF00", color: "#0E0F10" },
  };

  const s = styles[variant];

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: [0, 0, 0.2, 1],
        delay: index * 0.1,
      }}
    >
      {sublabel && (
        <span
          className="mb-1.5 text-[10px] font-bold tracking-[0.6px] uppercase"
          style={{ color: "#A9AAA5" }}
        >
          {sublabel}
        </span>
      )}
      <div
        className="flex items-center gap-2 rounded-[14px] px-6 py-3.5"
        style={{ background: s.bg, minWidth: "220px" }}
      >
        {children}
        <span
          className="text-center font-bold"
          style={{ fontSize: "15px", color: s.color }}
        >
          {label}
        </span>
      </div>
    </motion.div>
  );
}

function FlowArrow({ index }: { index: number }) {
  return (
    <motion.div
      className="flex justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: index * 0.1 + 0.05 }}
    >
      <span style={{ fontSize: "22px", color: "#0E0F10", lineHeight: 1 }}>↓</span>
    </motion.div>
  );
}

function TabFluxo() {
  return (
    <div className="rounded-[20px] bg-white p-10">
      <div className="flex flex-col items-center gap-4">
        {/* Nó 1 — Entrada */}
        <FlowNode label="Pedido do usuário" sublabel="ENTRADA" variant="black" index={0} />
        <FlowArrow index={0} />

        {/* Nó 2 — Orquestrador */}
        <FlowNode
          label="Detecta → Classifica → Roteia"
          sublabel="ORQUESTRADOR"
          variant="limao"
          index={1}
        />
        <FlowArrow index={1} />

        {/* Nó 3 — Squads lado a lado */}
        <motion.div
          className="flex items-start gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.3 }}
        >
          <div className="flex flex-col items-center gap-1">
            <span
              className="text-[10px] font-bold tracking-[0.6px] uppercase"
              style={{ color: "#A9AAA5" }}
            >
              DEV SQUAD
            </span>
            <div
              className="flex items-center gap-2 rounded-[14px] px-6 py-3.5"
              style={{ background: "#0E0F10", minWidth: "180px" }}
            >
              <span className="font-bold" style={{ fontSize: "14px", color: "#FFFFFF" }}>
                Desenvolvimento
              </span>
            </div>
            <div
              className="flex items-center gap-2 rounded-[14px] px-5 py-3"
              style={{ background: "#0E0F10", minWidth: "180px", marginTop: "8px" }}
            >
              <span className="font-bold" style={{ fontSize: "14px", color: "#FFFFFF" }}>
                Criador de Agentes
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span
              className="text-[10px] font-bold tracking-[0.6px] uppercase"
              style={{ color: "#A9AAA5" }}
            >
              DEV SQUAD
            </span>
            <div
              className="flex items-center gap-2 rounded-[14px] px-6 py-3.5"
              style={{ background: "#E8E4F0", minWidth: "180px" }}
            >
              <span className="font-bold" style={{ fontSize: "14px", color: "#5E5E5F" }}>
                Desenvolvimento
              </span>
            </div>
            <div
              className="flex items-center gap-2 rounded-[14px] px-5 py-3"
              style={{ background: "#E8E4F0", minWidth: "180px", marginTop: "8px" }}
            >
              <span className="font-bold" style={{ fontSize: "14px", color: "#5E5E5F" }}>
                Criador de Agentes
              </span>
            </div>
          </div>
        </motion.div>
        <FlowArrow index={3} />

        {/* Nó final — Memória */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.45 }}
        >
          <div
            className="flex items-center gap-2.5 rounded-[14px] px-6 py-3.5"
            style={{ background: "#D7FF00", minWidth: "280px" }}
          >
            <FileText size={16} strokeWidth={2} color="#0E0F10" />
            <span className="font-bold" style={{ fontSize: "15px", color: "#0E0F10" }}>
              Atualiza WORKING.md + MEMORY.md
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Tab 4 — Squads Futuros ───────────────────────────────────────
const FUTURE_SQUADS = [
  {
    name: "Dev Squad",
    slug: "dev-squad",
    agents: "2 agentes · 8 skills",
    status: "ativo",
    bg: "#0E0F10",
    nameColor: "#D7FF00",
    badgeLabel: "Ativo",
    badgeBg: "#22c55e",
    badgeColor: "#FFFFFF",
  },
  {
    name: "Audiovisual Squad",
    slug: "audiovisual-squad",
    agents: "6 agentes · 9 skills",
    status: "ativo",
    bg: "#0E0F10",
    nameColor: "#D7FF00",
    badgeLabel: "Ativo",
    badgeBg: "#22c55e",
    badgeColor: "#FFFFFF",
  },
  {
    name: "Marketing Squad",
    slug: "marketing-squad",
    agents: "Copy · SEO · Ads · Analytics",
    status: "em_breve",
    bg: "#EEEFE9",
    nameColor: "#0E0F10",
    badgeLabel: "Em breve",
    badgeBg: "#06b6d4",
    badgeColor: "#FFFFFF",
  },
  {
    name: "CRM Squad",
    slug: "crm-squad",
    agents: "Gestão de clientes e leads",
    status: "planejado",
    bg: "#EEEFE9",
    nameColor: "#0E0F10",
    badgeLabel: "Planejado",
    badgeBg: "#f97316",
    badgeColor: "#FFFFFF",
  },
  {
    name: "Social Media Squad",
    slug: "social-squad",
    agents: "Publicação · Engajamento",
    status: "planejado",
    bg: "#EEEFE9",
    nameColor: "#0E0F10",
    badgeLabel: "Planejado",
    badgeBg: "#f97316",
    badgeColor: "#FFFFFF",
  },
];

function TabSquadsFuturos() {
  return (
    <div className="flex flex-col gap-5">
      {/* Banner de escalabilidade */}
      <motion.div
        className="flex items-start gap-4 rounded-[20px] p-5"
        style={{ background: "#EEEFE9", border: "1.5px dashed #D5D2C9" }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
          style={{ background: "#D9D9D4" }}
        >
          <Timer size={18} strokeWidth={2} color="#5E5E5F" />
        </div>
        <div>
          <p
            className="font-bold"
            style={{ fontSize: "13px", color: "#0E0F10", letterSpacing: "0.3px" }}
          >
            ESCALABILIDADE DA AGÊNCIA
          </p>
          <p className="mt-1 text-[12px] leading-[1.55]" style={{ color: "#5E5E5F" }}>
            O sistema foi arquitetado para crescer. Novos squads são criados via Agente Criador de Agentes — cada um recebe seus próprios SOUL.md, skills e se integra automaticamente ao AGENTS.md...
          </p>
        </div>
      </motion.div>

      {/* Grid de squads */}
      <div className="grid grid-cols-3 gap-4">
        {FUTURE_SQUADS.map((squad, i) => (
          <motion.div
            key={squad.slug}
            className="flex flex-col justify-between rounded-[20px] p-5"
            style={{
              background: squad.bg,
              minHeight: "120px",
              border: "1.5px solid transparent",
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              ease: [0, 0, 0.2, 1],
              delay: Math.min(i * 0.06, 0.3),
            }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start justify-between gap-2">
              <h3
                className="font-bold leading-tight"
                style={{ fontSize: "18px", color: squad.nameColor }}
              >
                {squad.name}
              </h3>
              <span
                className="mt-0.5 shrink-0 rounded-[9999px] px-2.5 py-1 text-[10px] font-bold tracking-[0.4px]"
                style={{ background: squad.badgeBg, color: squad.badgeColor }}
              >
                {squad.badgeLabel}
              </span>
            </div>
            <p
              className="mt-2 text-[12px]"
              style={{ color: squad.bg === "#0E0F10" ? "rgba(255,255,255,0.55)" : "#A9AAA5" }}
            >
              {squad.agents}
            </p>
          </motion.div>
        ))}

        {/* Card Criar Novo Squad */}
        <motion.button
          type="button"
          className="flex flex-col items-center justify-center gap-2 rounded-[20px]"
          style={{
            minHeight: "120px",
            border: "1.5px dashed #D5D2C9",
            background: "transparent",
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.32 }}
          whileHover={{ borderColor: "#A9AAA5", backgroundColor: "rgba(213,210,201,0.15)" }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.span
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: "#EEEFE9" }}
            whileHover={{ scale: 1.15, backgroundColor: "#D5D2C9" }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Plus size={18} strokeWidth={2.5} color="#5E5E5F" />
          </motion.span>
          <span
            className="text-[11px] font-bold tracking-[0.5px] uppercase"
            style={{ color: "#A9AAA5" }}
          >
            Criar novo squad
          </span>
        </motion.button>
      </div>
    </div>
  );
}

// ─── Tabs de navegação principal ────────────────────────────────
const MAIN_TABS = [
  { id: "squads", label: "SQUADS" },
  { id: "skills", label: "SKILLS REGISTRY" },
  { id: "fluxo", label: "FLUXO DO ORQUESTRADOR" },
  { id: "futuros", label: "SQUADS FUTUROS" },
];

// ─── Componente principal ────────────────────────────────────────
export function AgentesClient({
  squads,
  skillsBySquad,
}: {
  squads: SquadWithAgents[];
  skillsBySquad: SkillsBySquad[];
}) {
  const [activeTab, setActiveTab] = useState("squads");
  const [filterSlug, setFilterSlug] = useState<string | null>(null);

  // Filtros do header: Todos + um por squad ativo
  const filterOptions = [
    { id: "todos", label: "TODOS" },
    ...squads.map((s) => ({ id: s.slug, label: s.name.toUpperCase().replace(" SQUAD", "") })),
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#0E0F10" }}>
          Agentes
        </h1>

        <div className="flex items-center gap-3">
          {/* Filtros pill */}
          <div
            className="relative inline-flex items-center rounded-[20px] p-1"
            style={{ background: "transparent" }}
          >
            {filterOptions.map((opt) => {
              const isActive =
                opt.id === "todos" ? filterSlug === null : filterSlug === opt.id;
              return (
                <motion.button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    setFilterSlug(opt.id === "todos" ? null : opt.id)
                  }
                  className="relative rounded-[9999px] px-4 py-1.5 text-[12px] font-semibold"
                  style={{ color: isActive ? "#0E0F10" : "#A9AAA5" }}
                  initial="rest"
                  whileHover={!isActive ? "hovered" : "rest"}
                  whileTap={{ scale: 0.97 }}
                  animate="rest"
                  variants={{
                    rest: {
                      backgroundColor: isActive ? "#D7FF00" : "transparent",
                    },
                    hovered: {
                      backgroundColor: "rgba(213,210,201,0.35)",
                      color: "#0E0F10",
                    },
                  }}
                  transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                >
                  {opt.label}
                </motion.button>
              );
            })}
          </div>

          {/* Botão Novo agente */}
          <motion.button
            type="button"
            className="flex items-center gap-2 rounded-[18px] px-4 py-3 text-[14px] font-bold"
            style={{ background: "#D7FF00", color: "#0E0F10" }}
            initial="rest"
            whileHover="hovered"
            whileTap={{ scale: 0.96 }}
            animate="rest"
            variants={{
              rest: { scale: 1, backgroundColor: "#D7FF00" },
              hovered: { scale: 1.03, backgroundColor: "#DFFF33" },
            }}
            transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <motion.span
              className="flex items-center"
              variants={{ rest: { scale: 1, rotate: 0 }, hovered: { scale: 1.2, rotate: 90 } }}
              transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <Plus size={16} strokeWidth={2.5} />
            </motion.span>
            Novo agente
          </motion.button>
        </div>
      </div>

      {/* Tabs horizontais */}
      <SlidingTabs
        tabs={MAIN_TABS}
        activeId={activeTab}
        onChange={setActiveTab}
      />

      {/* Conteúdo */}
      <AnimatePresence mode="wait">
        {activeTab === "squads" && (
          <motion.div
            key="squads"
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(3px)" }}
            transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
          >
            <TabSquads squads={squads} filterSlug={filterSlug} />
          </motion.div>
        )}

        {activeTab === "skills" && (
          <motion.div
            key="skills"
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(3px)" }}
            transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
          >
            <TabSkillsRegistry skillsBySquad={skillsBySquad} />
          </motion.div>
        )}

        {activeTab === "fluxo" && (
          <motion.div
            key="fluxo"
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(3px)" }}
            transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
          >
            <TabFluxo />
          </motion.div>
        )}

        {activeTab === "futuros" && (
          <motion.div
            key="futuros"
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(3px)" }}
            transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
          >
            <TabSquadsFuturos />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
