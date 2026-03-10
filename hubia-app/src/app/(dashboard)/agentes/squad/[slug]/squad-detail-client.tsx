"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Code2,
  PenTool,
  Bot,
  X,
  UserPlus,
  ChevronRight,
  Search,
  Check,
  Trash2,
  Users,
  Activity,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { HubiaPortal } from "@/components/ui/hubia-portal";
import type { SquadDetail, AgentItem } from "../../actions";
import {
  addAgentToSquad,
  removeAgentFromSquad,
  createAgent,
} from "../../actions";

// ─── Cores e ícones por squad slug ───────────────────────────────
const SQUAD_COLOR: Record<string, string> = {
  "dev-squad": "var(--hubia-limao-500)",
  "audiovisual-squad": "#C8B4FA",
  "marketing-squad": "#93E0FF",
  "crm-squad": "#FFB347",
  "social-media-squad": "#FF6FA8",
};

function getSquadColor(slug: string) {
  return SQUAD_COLOR[slug] ?? "#D9D9D4";
}

const SQUAD_ICON: Record<string, React.ReactNode> = {
  "dev-squad": <Code2 size={20} strokeWidth={2} />,
  "audiovisual-squad": <PenTool size={20} strokeWidth={2} />,
};

function getSquadIcon(slug: string) {
  return SQUAD_ICON[slug] ?? <Users size={20} strokeWidth={2} />;
}

// ─── Status label do agente ───────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    ativo: { label: "Ativo", bg: "var(--hubia-limao-500)", color: "var(--hubia-ink-500)" },
    inativo: { label: "Inativo", bg: "var(--hubia-bg-base-500)", color: "var(--hubia-bg-base-700)" },
    rascunho: { label: "Rascunho", bg: "var(--hubia-bg-base-500)", color: "var(--hubia-bg-base-700)" },
  };
  const cfg = map[status] ?? { label: status, bg: "var(--hubia-bg-base-500)", color: "var(--hubia-ink-400)" };
  return (
    <span
      className="rounded-[9999px] px-2.5 py-0.5 text-[10px] font-bold tracking-[0.3px]"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// MODAL — Adicionar agente ao squad (seleção múltipla)
// ─────────────────────────────────────────────────────────────────
function AddAgentModal({
  open,
  onClose,
  squadId,
  currentAgentIds,
  allAgents,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  squadId: string;
  currentAgentIds: Set<string>;
  allAgents: AgentItem[];
  onAdded: (agents: AgentItem[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const available = allAgents.filter(
    (a) =>
      !currentAgentIds.has(a.id) &&
      a.name.toLowerCase().includes(search.toLowerCase())
  );

  function toggleAgent(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleConfirm() {
    if (selected.size === 0) return;
    setLoading(true);
    const toAdd = allAgents.filter((a) => selected.has(a.id));
    await Promise.all(toAdd.map((a) => addAgentToSquad(squadId, a.id)));
    setLoading(false);
    setSelected(new Set());
    onAdded(toAdd);
  }

  function handleClose() {
    setSelected(new Set());
    setSearch("");
    onClose();
  }

  return (
    <HubiaPortal>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
            initial={{ backgroundColor: "rgba(14,15,16,0)", backdropFilter: "blur(0px)" }}
            animate={{ backgroundColor: "rgba(14,15,16,0.70)", backdropFilter: "blur(12px)" }}
            exit={{ backgroundColor: "rgba(14,15,16,0)", backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
            onClick={handleClose}
          >
            <motion.div
              className="relative w-full max-w-[520px] rounded-[30px] bg-white p-7"
              initial={{ scale: 0.88, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 10, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                type="button"
                onClick={handleClose}
                className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: "var(--hubia-bg-base-500)", color: "var(--hubia-ink-400)" }}
                whileHover={{ rotate: 90, scale: 1.1, backgroundColor: "var(--hubia-sand-600)" }}
                whileTap={{ rotate: 90, scale: 0.9 }}
                transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <X size={14} strokeWidth={2.5} />
              </motion.button>

              <h2 className="mb-1 pr-8 text-[18px] font-bold" style={{ color: "var(--hubia-ink-500)" }}>
                Adicionar agentes ao squad
              </h2>
              <p className="mb-4 text-[12px]" style={{ color: "var(--hubia-bg-base-700)" }}>
                Selecione um ou mais agentes — confirme ao finalizar
              </p>

              {/* Search */}
              <div className="mb-3 flex items-center gap-2 rounded-[12px] px-3 py-2.5" style={{ background: "var(--hubia-bg-base-500)" }}>
                <Search size={14} strokeWidth={2} color="#A9AAA5" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar agente..."
                  className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#A9AAA5]"
                  style={{ color: "var(--hubia-ink-500)", fontFamily: "Urbanist, sans-serif" }}
                />
              </div>

              {/* Grid de cards selecionáveis */}
              <div className="mb-4 max-h-[300px] overflow-y-auto">
                {available.length === 0 ? (
                  <div className="rounded-[12px] px-4 py-8 text-center" style={{ background: "var(--hubia-bg-base-500)" }}>
                    <p className="text-[13px]" style={{ color: "var(--hubia-bg-base-700)" }}>
                      {search ? "Nenhum agente encontrado" : "Todos os agentes já estão no squad"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {available.map((agent, i) => {
                      const isSel = selected.has(agent.id);
                      return (
                        <motion.button
                          key={agent.id}
                          type="button"
                          onClick={() => toggleAgent(agent.id)}
                          className="relative flex items-start gap-3 rounded-[14px] p-3 text-left"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03, duration: 0.16 }}
                          // animate controla background dinamicamente
                          style={{ border: `1.5px solid ${isSel ? "var(--hubia-ink-500)" : "transparent"}` }}
                          whileHover={!isSel ? { backgroundColor: "#F5F5F0" } : undefined}
                          whileTap={{ scale: 0.97 }}
                        >
                          {/* Check badge */}
                          <motion.div
                            className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full"
                            initial={false}
                            animate={{
                              backgroundColor: isSel ? "var(--hubia-ink-500)" : "var(--hubia-bg-base-500)",
                              scale: isSel ? 1 : 0.85,
                            }}
                            transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                          >
                            <motion.div
                              animate={{ opacity: isSel ? 1 : 0, scale: isSel ? 1 : 0.5 }}
                              transition={{ duration: 0.12 }}
                            >
                              <Check size={11} strokeWidth={3} color="#D7FF00" />
                            </motion.div>
                          </motion.div>

                          {/* Ícone do agente */}
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px]"
                            style={{ background: "var(--hubia-ink-500)" }}
                          >
                            <Bot size={14} strokeWidth={2} color="#D7FF00" />
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1 pr-5">
                            <p className="truncate text-[13px] font-bold" style={{ color: "var(--hubia-ink-500)" }}>
                              {agent.name}
                            </p>
                            {agent.description ? (
                              <p className="mt-0.5 line-clamp-1 text-[11px]" style={{ color: "var(--hubia-bg-base-700)" }}>
                                {agent.description}
                              </p>
                            ) : (
                              <StatusBadge status={agent.status} />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Rodapé: contador + botão confirmar */}
              <div className="flex items-center justify-between gap-3 border-t pt-4" style={{ borderColor: "var(--hubia-bg-base-500)" }}>
                <span className="text-[12px] font-semibold" style={{ color: "var(--hubia-bg-base-700)" }}>
                  {selected.size === 0
                    ? "Nenhum agente selecionado"
                    : `${selected.size} agente${selected.size > 1 ? "s" : ""} selecionado${selected.size > 1 ? "s" : ""}`}
                </span>
                <motion.button
                  type="button"
                  onClick={handleConfirm}
                  disabled={selected.size === 0 || loading}
                  className="flex items-center gap-1.5 rounded-[12px] px-4 py-2.5 text-[13px] font-bold"
                  initial={false}
                  animate={{
                    backgroundColor: selected.size > 0 ? "#D7FF00" : "#EEEFE9",
                    color: selected.size > 0 ? "var(--hubia-ink-500)" : "var(--hubia-bg-base-700)",
                  }}
                  whileHover={selected.size > 0 ? { scale: 1.02, backgroundColor: "#DFFF33" } : undefined}
                  whileTap={selected.size > 0 ? { scale: 0.97 } : undefined}
                  transition={{ duration: 0.15 }}
                >
                  {loading ? (
                    <motion.div
                      className="h-4 w-4 rounded-full border-2 border-ink-500 border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <Check size={14} strokeWidth={2.5} />
                  )}
                  {loading ? "Adicionando..." : "Adicionar ao squad"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </HubiaPortal>
  );
}

// ─────────────────────────────────────────────────────────────────
// MODAL — Criar novo agente (reutiliza a lógica existente)
// ─────────────────────────────────────────────────────────────────
const statusOptions = [
  { value: "ativo" as const, label: "Ativo", desc: "Disponível para uso imediato" },
  { value: "inativo" as const, label: "Inativo", desc: "Desativado temporariamente" },
  { value: "rascunho" as const, label: "Rascunho", desc: "Em construção" },
];

function NovoAgenteModal({
  open,
  onClose,
  squadId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  squadId: string;
  onCreated: (agent: AgentItem) => void;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const DRAFT_KEY = `hubia:novo-agente:squad:${squadId}`;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"ativo" | "inativo" | "rascunho" | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [draftSavedMsg, setDraftSavedMsg] = useState(false);

  // Restaura rascunho ao montar (key open para re-checar)
  const loadedRef = useState(false);
  if (!loadedRef[0] && open && typeof window !== "undefined") {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.name) setName(d.name);
        if (d.description) setDescription(d.description);
        if (d.tagsInput) setTagsInput(d.tagsInput);
      } catch { /* noop */ }
    }
    loadedRef[1](true);
  }

  function clearDraft() {
    if (typeof window !== "undefined") localStorage.removeItem(DRAFT_KEY);
  }

  function reset() {
    setName(""); setDescription(""); setStatus(null); setTagsInput(""); setError(null);
    setDraftSavedMsg(false);
    loadedRef[1](false);
  }

  function handleClose() {
    if (name.trim()) {
      if (typeof window !== "undefined") {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ name, description, tagsInput }));
      }
      setDraftSavedMsg(true);
      setTimeout(() => {
        setDraftSavedMsg(false);
        reset();
        onClose();
      }, 1200);
    } else {
      clearDraft();
      reset();
      onClose();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("O nome é obrigatório."); return; }
    if (!status) { setError("Selecione um status para continuar."); return; }

    setLoading(true);
    setError(null);

    const tags = tagsInput ? tagsInput.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const slug = name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
    const result = await createAgent({ name: name.trim(), slug, description: description.trim(), squadId, status, tags });

    setLoading(false);

    if (result.success && result.agentSlug) {
      clearDraft();
      onCreated({
        id: result.agentSlug,
        name: name.trim(),
        slug: result.agentSlug,
        description: description.trim() || null,
        status,
        tags,
      });
      reset();
      onClose();
      startTransition(() => {
        router.push(`/agentes/${result.agentSlug}`);
      });
    } else {
      setError(result.error ?? "Erro ao criar agente");
    }
  }

  const inputClass = "w-full rounded-[12px] border border-transparent px-3.5 py-2.5 text-[14px] outline-none transition-[border-color] duration-150";
  const inputStyle = { background: "var(--hubia-bg-base-500)", color: "var(--hubia-ink-500)", fontFamily: "Urbanist, sans-serif" };

  return (
    <HubiaPortal>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
            initial={{ backgroundColor: "rgba(14,15,16,0)", backdropFilter: "blur(0px)" }}
            animate={{ backgroundColor: "rgba(14,15,16,0.70)", backdropFilter: "blur(12px)" }}
            exit={{ backgroundColor: "rgba(14,15,16,0)", backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
            onClick={handleClose}
          >
            <motion.div
              className="relative w-full max-w-[480px] rounded-[30px] bg-white p-7"
              initial={{ scale: 0.88, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 10, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                type="button"
                onClick={handleClose}
                className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: "var(--hubia-bg-base-500)", color: "var(--hubia-ink-400)" }}
                whileHover={{ rotate: 90, scale: 1.1, backgroundColor: "var(--hubia-sand-600)" }}
                whileTap={{ rotate: 90, scale: 0.9 }}
                transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <X size={14} strokeWidth={2.5} />
              </motion.button>

              <h2 className="mb-1 pr-8 text-[18px] font-bold" style={{ color: "var(--hubia-ink-500)" }}>
                Novo agente
              </h2>
              <p className="mb-3 text-[12px]" style={{ color: "var(--hubia-bg-base-700)" }}>
                O agente será vinculado a este squad automaticamente
              </p>

              {/* Banner rascunho salvo */}
              <AnimatePresence>
                {draftSavedMsg && (
                  <motion.div
                    className="mb-3 flex items-center gap-2 rounded-[12px] px-3 py-2"
                    style={{ background: "rgba(215,255,0,0.15)", border: "1px solid rgba(215,255,0,0.4)" }}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-[12px] font-semibold" style={{ color: "var(--hubia-ink-500)" }}>
                      💾 Rascunho salvo — você pode continuar de onde parou
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold tracking-[0.5px] uppercase" style={{ color: "var(--hubia-bg-base-700)" }}>
                    Nome *
                  </label>
                  <input
                    className={inputClass}
                    style={inputStyle}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Analista de SEO"
                    onFocus={(e) => (e.target.style.borderColor = "#0E0F10")}
                    onBlur={(e) => (e.target.style.borderColor = "transparent")}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold tracking-[0.5px] uppercase" style={{ color: "var(--hubia-bg-base-700)" }}>
                    Descrição
                  </label>
                  <textarea
                    className={inputClass}
                    style={{ ...inputStyle, resize: "none", minHeight: "72px" }}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="O que este agente faz?"
                    onFocus={(e) => (e.target.style.borderColor = "#0E0F10")}
                    onBlur={(e) => (e.target.style.borderColor = "transparent")}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold tracking-[0.5px] uppercase" style={{ color: "var(--hubia-bg-base-700)" }}>
                    Status inicial *
                  </label>
                  <div className="flex gap-2">
                    {statusOptions.map((opt) => {
                      const isSelected = status === opt.value;
                      return (
                        <motion.button
                          key={opt.value}
                          type="button"
                          onClick={() => setStatus(isSelected ? null : opt.value)}
                          className="flex flex-col rounded-[12px] px-3 py-2.5 text-left"
                          style={{ flex: 1 }}
                          initial={false}
                          animate={{
                            backgroundColor: isSelected ? "#0E0F10" : "#EEEFE9",
                            color: isSelected ? "#FFFFFF" : "#5E5E5F",
                          }}
                          whileHover={!isSelected ? { backgroundColor: "#D9D9D4" } : undefined}
                          whileTap={{ scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                        >
                          <span className="font-bold text-[12px]">{opt.label}</span>
                          <motion.span
                            className="text-[10px]"
                            animate={{ color: isSelected ? "rgba(255,255,255,0.55)" : "#A9AAA5" }}
                            transition={{ duration: 0.15 }}
                          >
                            {opt.desc}
                          </motion.span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold tracking-[0.5px] uppercase" style={{ color: "var(--hubia-bg-base-700)" }}>
                    Especialidades
                  </label>
                  <input
                    className={inputClass}
                    style={inputStyle}
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Ex: copywriting, SEO, análise"
                    onFocus={(e) => (e.target.style.borderColor = "#0E0F10")}
                    onBlur={(e) => (e.target.style.borderColor = "transparent")}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-[12px] px-3 py-2.5" style={{ background: "rgba(239,68,68,0.08)" }}>
                    <AlertCircle size={14} strokeWidth={2} color="#EF4444" />
                    <span className="text-[12px] font-semibold" style={{ color: "#EF4444" }}>{error}</span>
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="mt-1 w-full rounded-[14px] py-3 text-[14px] font-bold"
                  style={{ background: "var(--hubia-limao-500)", color: "var(--hubia-ink-500)" }}
                  whileHover={{ scale: 1.02, backgroundColor: "#DFFF33" }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                >
                  {loading ? "Criando..." : "Criar agente"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </HubiaPortal>
  );
}

// ─────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────
export default function SquadDetailClient({
  squad,
  allAgents,
}: {
  squad: SquadDetail;
  allAgents: AgentItem[];
}) {
  const router = useRouter();
  const [agents, setAgents] = useState<AgentItem[]>(squad.agents);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [showNovoAgente, setShowNovoAgente] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const squadColor = getSquadColor(squad.slug);
  const squadIcon = getSquadIcon(squad.slug);
  const isEmBreve = squad.status !== "ativo";

  const currentAgentIds = new Set(agents.map((a) => a.id));

  async function handleRemove(agentId: string) {
    setRemovingId(agentId);
    await removeAgentFromSquad(squad.id, agentId);
    setAgents((prev) => prev.filter((a) => a.id !== agentId));
    setRemovingId(null);
  }

  function handleAgentAdded(newAgents: AgentItem[]) {
    setAgents((prev) => [...prev, ...newAgents]);
    setShowAddAgent(false);
  }

  function handleAgentCreated(agent: AgentItem) {
    setAgents((prev) => [...prev, agent]);
    setShowNovoAgente(false);
  }

  return (
    <motion.div
      className="flex flex-col"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
    >
      {/* ── Breadcrumb ──────────────────────────────────────────── */}
      <div className="mb-5 flex items-center gap-2">
        <motion.button
          type="button"
          onClick={() => router.push("/agentes")}
          className="text-[13px] font-semibold"
          style={{ color: "var(--hubia-bg-base-700)" }}
          whileHover={{ color: "var(--hubia-ink-500)" }}
          transition={{ duration: 0.1 }}
        >
          Agentes
        </motion.button>
        <ChevronRight size={14} strokeWidth={2} color="#D5D2C9" />
        <span className="text-[13px] font-semibold" style={{ color: "var(--hubia-ink-500)" }}>
          {squad.name}
        </span>
      </div>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-6 flex items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[16px]"
            style={{ background: "var(--hubia-ink-500)", color: squadColor }}
          >
            {squadIcon}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-bold" style={{ fontSize: "24px", color: "var(--hubia-ink-500)", lineHeight: 1.2 }}>
                {squad.name}
              </h1>
              {isEmBreve ? (
                <span
                  className="rounded-[9999px] px-3 py-1 text-[11px] font-bold tracking-[0.4px]"
                  style={{ background: "var(--hubia-bg-base-500)", color: "var(--hubia-bg-base-700)" }}
                >
                  Em breve
                </span>
              ) : (
                <span
                  className="rounded-[9999px] px-3 py-1 text-[11px] font-bold tracking-[0.4px]"
                  style={{ background: "var(--hubia-limao-500)", color: "var(--hubia-ink-500)" }}
                >
                  Ativo
                </span>
              )}
            </div>
            <p className="mt-1 text-[13px]" style={{ color: "var(--hubia-bg-base-700)" }}>
              {squad.description ?? (isEmBreve ? "Este squad está sendo planejado" : `${agents.length} agente${agents.length !== 1 ? "s" : ""}`)}
            </p>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            type="button"
            onClick={() => setShowAddAgent(true)}
            className="flex items-center gap-1.5 rounded-[14px] px-4 py-2.5 text-[13px] font-bold"
            style={{ background: "#FFFFFF", color: "var(--hubia-ink-500)" }}
            whileHover={{ scale: 1.02, backgroundColor: "var(--hubia-bg-base-500)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            <UserPlus size={15} strokeWidth={2} />
            Adicionar agente
          </motion.button>
          <motion.button
            type="button"
            onClick={() => setShowNovoAgente(true)}
            className="flex items-center gap-1.5 rounded-[14px] px-4 py-2.5 text-[13px] font-bold"
            style={{ background: "var(--hubia-limao-500)", color: "var(--hubia-ink-500)" }}
            whileHover={{ scale: 1.02, backgroundColor: "#DFFF33" }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            <Plus size={15} strokeWidth={2.5} />
            Novo agente
          </motion.button>
        </div>
      </div>

      {/* ── Conteúdo principal ──────────────────────────────────── */}
      <div className="rounded-[30px] bg-white p-6">

        {/* Cabeçalho da seção */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={16} strokeWidth={2} color="#A9AAA5" />
            <h2 className="text-[14px] font-bold" style={{ color: "var(--hubia-ink-500)" }}>
              Agentes do squad
            </h2>
            <span
              className="rounded-[9999px] px-2 py-0.5 text-[11px] font-bold"
              style={{ background: "var(--hubia-bg-base-500)", color: "var(--hubia-ink-400)" }}
            >
              {agents.length}
            </span>
          </div>
          {isEmBreve && (
            <div className="flex items-center gap-1.5 rounded-[9999px] px-3 py-1.5" style={{ background: "var(--hubia-bg-base-500)" }}>
              <Activity size={12} strokeWidth={2} color="#A9AAA5" />
              <span className="text-[11px] font-semibold" style={{ color: "var(--hubia-bg-base-700)" }}>
                Você já pode montar este squad
              </span>
            </div>
          )}
        </div>

        {/* Lista de agentes */}
        {agents.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center rounded-[16px] py-16 text-center"
            style={{ background: "var(--hubia-bg-base-500)", border: "1.5px dashed #D5D2C9" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-[14px]"
              style={{ background: "#FFFFFF" }}
            >
              <Sparkles size={22} strokeWidth={1.5} color="#A9AAA5" />
            </div>
            <p className="text-[14px] font-bold" style={{ color: "var(--hubia-ink-500)" }}>
              Nenhum agente ainda
            </p>
            <p className="mt-1 max-w-[240px] text-[12px]" style={{ color: "var(--hubia-bg-base-700)" }}>
              Adicione agentes da sua biblioteca ou crie um novo agente para este squad
            </p>
            <div className="mt-5 flex items-center gap-2">
              <motion.button
                type="button"
                onClick={() => setShowAddAgent(true)}
                className="flex items-center gap-1.5 rounded-[12px] px-4 py-2.5 text-[13px] font-bold"
                style={{ background: "#FFFFFF", color: "var(--hubia-ink-500)" }}
                whileHover={{ scale: 1.02, backgroundColor: "#D9D9D4" }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
              >
                <UserPlus size={14} strokeWidth={2} />
                Adicionar da biblioteca
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setShowNovoAgente(true)}
                className="flex items-center gap-1.5 rounded-[12px] px-4 py-2.5 text-[13px] font-bold"
                style={{ background: "var(--hubia-limao-500)", color: "var(--hubia-ink-500)" }}
                whileHover={{ scale: 1.02, backgroundColor: "#DFFF33" }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
              >
                <Plus size={14} strokeWidth={2.5} />
                Criar novo
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {agents.map((agent, i) => (
                <motion.div
                  key={agent.id}
                  layout
                  className="flex items-center gap-4 rounded-[14px] px-4 py-3.5"
                  style={{ background: "var(--hubia-bg-base-500)" }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -16, scale: 0.96 }}
                  transition={{ delay: i * 0.04, duration: 0.18, ease: [0, 0, 0.2, 1] }}
                >
                  {/* Ícone do agente */}
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px]"
                    style={{ background: "var(--hubia-ink-500)" }}
                  >
                    <Bot size={16} strokeWidth={2} color={squadColor} />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[14px] font-bold" style={{ color: "var(--hubia-ink-500)" }}>
                        {agent.name}
                      </p>
                      <StatusBadge status={agent.status} />
                    </div>
                    {agent.description && (
                      <p className="mt-0.5 truncate text-[12px]" style={{ color: "var(--hubia-bg-base-700)" }}>
                        {agent.description}
                      </p>
                    )}
                    {agent.tags.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {agent.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-[6px] px-1.5 py-0.5 text-[10px] font-semibold"
                            style={{ background: "#D9D9D4", color: "var(--hubia-ink-400)" }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <motion.button
                      type="button"
                      onClick={() => router.push(`/agentes/${agent.slug}`)}
                      className="rounded-[12px] px-3 py-2 text-[12px] font-semibold"
                      style={{ background: "#FFFFFF", color: "var(--hubia-ink-500)" }}
                      whileHover={{ scale: 1.03, backgroundColor: "#D9D9D4" }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                    >
                      Ver agente
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => handleRemove(agent.id)}
                      disabled={removingId === agent.id}
                      className="flex h-8 w-8 items-center justify-center rounded-[12px]"
                      style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444" }}
                      whileHover={{ scale: 1.08, backgroundColor: "rgba(239,68,68,0.15)" }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.12 }}
                    >
                      {removingId === agent.id ? (
                        <motion.div
                          className="h-3 w-3 rounded-full border-2 border-red-400 border-t-transparent"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        <Trash2 size={13} strokeWidth={2} />
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Modais ─────────────────────────────────────────────── */}
      <AddAgentModal
        open={showAddAgent}
        onClose={() => setShowAddAgent(false)}
        squadId={squad.id}
        currentAgentIds={currentAgentIds}
        allAgents={allAgents}
        onAdded={handleAgentAdded}
      />
      <NovoAgenteModal
        open={showNovoAgente}
        onClose={() => setShowNovoAgente(false)}
        squadId={squad.id}
        onCreated={handleAgentCreated}
      />
    </motion.div>
  );
}
