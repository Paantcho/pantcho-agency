"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Bot,
  Sparkles,
  FileText,
  Tag,
  Pencil,
  Save,
  Check,
  Brain,
  ShieldCheck,
  Layers,
  Clock,
  History,
  X,
} from "lucide-react";
import type { AgentDetail, SquadWithAgents, DocVersion } from "../actions";
import { saveAgentDocVersion, getAgentDocVersions } from "../actions";
import { HubiaPortal } from "@/components/ui/hubia-portal";

// ─── Cores por squad slug ─────────────────────────────────────────
const SQUAD_COLOR: Record<string, string> = {
  "dev-squad": "#D7FF00",
  "audiovisual-squad": "#C8B4FA",
};
function getSquadColor(slug: string) {
  return SQUAD_COLOR[slug] ?? "#D9D9D4";
}

// ─── Badge de status ──────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; desc: string }> = {
  ativo: { label: "Ativo", bg: "#D7FF00", color: "#0E0F10", desc: "Operacional — pode ser acionado agora" },
  inativo: { label: "Standby", bg: "#D9D9D4", color: "#5E5E5F", desc: "Configurado, mas não está em uso" },
  rascunho: { label: "Rascunho", bg: "#EEEFE9", color: "#A9AAA5", desc: "Em configuração — ainda não operacional" },
};

// ─── Documentos do agente ─────────────────────────────────────────
const DOCS = [
  {
    key: "soul",
    label: "SOUL.md",
    desc: "Alma, missão e valores",
    icon: <Brain size={15} strokeWidth={2} />,
    content: `# Alma do Agente

## Missão
Este agente existe para auxiliar no fluxo de trabalho da agência, entendendo o contexto, identificando prioridades e executando com precisão.

## Valores
- Clareza acima de tudo
- Execução impecável
- Memória ativa — registra decisões relevantes

## Princípios
- Nunca inventa informação não fornecida
- Sempre pergunta antes de agir em caso de dúvida
- Mantém o tom profissional e objetivo em português brasileiro`,
  },
  {
    key: "skill",
    label: "SKILL.md",
    desc: "Skills e quando acioná-las",
    icon: <Sparkles size={15} strokeWidth={2} />,
    content: `# Skills do Agente

## Skills ativas
Lista de habilidades que este agente pode acionar conforme o contexto.

## Como são acionadas
Skills são acionadas automaticamente pelo orquestrador ou via instrução direta.
Algumas skills têm o flag "SEMPRE" — são acionadas em toda execução.`,
  },
  {
    key: "rules",
    label: "RULES.md",
    desc: "Regras invioláveis de execução",
    icon: <ShieldCheck size={15} strokeWidth={2} />,
    content: `# Regras Invioláveis

## O que NUNCA fazer
1. Não expor dados sensíveis de outros usuários ou organizações
2. Não alterar arquivos de configuração sem autorização explícita
3. Não executar ações destrutivas sem confirmação

## O que SEMPRE fazer
1. Registrar decisões relevantes na memória (WORKING.md ou MEMORY.md)
2. Responder em português brasileiro
3. Seguir o design system Hubia em outputs visuais

## Ciclo obrigatório
PLAN → EXECUTE → REFLECT`,
  },
  {
    key: "system-prompt",
    label: "System Prompt",
    desc: "Prompt de sistema usado na IA",
    icon: <FileText size={15} strokeWidth={2} />,
    content: `# System Prompt

Este é o prompt base enviado ao modelo de IA em toda execução do agente.
Configure aqui as instruções iniciais, contexto e restrições específicas.`,
  },
];

// ─── Formata data/hora de uma versão ─────────────────────────────
function formatVersionDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Número de versão formatado: v0.0.1 ──────────────────────────
function formatVersion(n: number) {
  return `v${Math.floor(n / 100)}.${Math.floor((n % 100) / 10)}.${n % 10}`;
}

// ─── Renderizador de markdown simplificado ───────────────────────
function MarkdownViewer({ content }: { content: string }) {
  return (
    <div className="flex flex-col">
      {content.split("\n").map((line, i) => {
        if (line.startsWith("# "))
          return <h1 key={i} className="mb-4 mt-0 font-bold" style={{ fontSize: "20px", color: "#0E0F10" }}>{line.replace("# ", "")}</h1>;
        if (line.startsWith("## "))
          return <h2 key={i} className="mb-2 mt-5 font-bold" style={{ fontSize: "10px", color: "#A9AAA5", letterSpacing: "0.7px", textTransform: "uppercase" }}>{line.replace("## ", "")}</h2>;
        if (line.startsWith("- "))
          return (
            <p key={i} className="mb-1.5 flex gap-2.5 text-[14px]" style={{ color: "#5E5E5F" }}>
              <span style={{ color: "#D7FF00", fontWeight: 700, marginTop: "2px" }}>•</span>
              <span>{line.replace("- ", "")}</span>
            </p>
          );
        if (line.match(/^\d+\./))
          return <p key={i} className="mb-1.5 text-[14px]" style={{ color: "#5E5E5F" }}>{line}</p>;
        if (line === "") return <div key={i} className="h-2" />;
        return <p key={i} className="mb-1 text-[14px] leading-[1.7]" style={{ color: "#5E5E5F" }}>{line}</p>;
      })}
    </div>
  );
}

// ─── Modal de histórico de versões ───────────────────────────────
function VersionHistoryModal({
  open,
  versions,
  docLabel,
  onClose,
  onRestore,
}: {
  open: boolean;
  versions: DocVersion[];
  docLabel: string;
  onClose: () => void;
  onRestore: (content: string) => void;
}) {
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
            onClick={onClose}
          >
            <motion.div
              className="relative w-full max-w-[480px] rounded-[20px] bg-white p-7"
              initial={{ scale: 0.88, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 10, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                type="button"
                onClick={onClose}
                className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: "#EEEFE9", color: "#5E5E5F" }}
                whileHover={{ rotate: 90, scale: 1.1, backgroundColor: "#D5D2C9" }}
                whileTap={{ rotate: 90, scale: 0.9 }}
                transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <X size={14} strokeWidth={2.5} />
              </motion.button>

              <h2 className="mb-1.5 pr-8 font-bold" style={{ fontSize: "18px", color: "#0E0F10" }}>
                Histórico — {docLabel}
              </h2>
              <p className="mb-5 text-[12px]" style={{ color: "#A9AAA5" }}>
                Cada versão é gerada ao salvar. Clique para restaurar.
              </p>

              {versions.length === 0 ? (
                <div className="rounded-[12px] p-5 text-center" style={{ background: "#EEEFE9" }}>
                  <p className="text-[13px]" style={{ color: "#A9AAA5" }}>
                    Nenhuma versão salva ainda
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {versions.map((v, i) => (
                    <motion.button
                      key={v.id}
                      type="button"
                      onClick={() => { onRestore(v.content); onClose(); }}
                      className="flex items-center justify-between rounded-[12px] px-4 py-3 text-left"
                      style={{ background: "#EEEFE9" }}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.18 }}
                      whileHover={{ backgroundColor: "#D9D9D4", x: 2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="rounded-[7px] px-2 py-1 font-mono text-[11px] font-bold"
                          style={{ background: "#0E0F10", color: "#D7FF00" }}
                        >
                          {formatVersion(v.version)}
                        </span>
                        <span className="text-[12px] font-semibold" style={{ color: "#0E0F10" }}>
                          {i === 0 ? "Versão atual" : `Versão anterior`}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-[11px]" style={{ color: "#A9AAA5" }}>
                        <Clock size={11} strokeWidth={2} />
                        {formatVersionDate(v.createdAt)}
                      </span>
                    </motion.button>
                  ))}
                </div>
              )}
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
export default function AgentDetailPageClient({
  agent,
}: {
  agent: AgentDetail;
  squads: SquadWithAgents[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [activeDoc, setActiveDoc] = useState<string>("soul");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  // savedDocs: { [docKey]: { content, version } }
  const [savedDocs, setSavedDocs] = useState<Record<string, { content: string; version: number }>>({});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [savedVersion, setSavedVersion] = useState<number | null>(null);

  const [showHistory, setShowHistory] = useState(false);
  const [historyVersions, setHistoryVersions] = useState<DocVersion[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const currentDoc = DOCS.find((d) => d.key === activeDoc)!;
  const savedDoc = savedDocs[activeDoc];
  const displayContent = savedDoc?.content ?? currentDoc.content;

  const agentSquad = agent.squads[0];
  const squadColor = agentSquad ? getSquadColor(agentSquad.slug) : "#D9D9D4";
  const statusConfig = STATUS_CONFIG[agent.status] ?? STATUS_CONFIG.inativo;

  function startEdit() {
    setEditContent(displayContent);
    setIsEditing(true);
    setSaveState("idle");
  }

  async function handleSave() {
    setSaveState("saving");
    const result = await saveAgentDocVersion({
      agentId: agent.id,
      docKey: activeDoc,
      content: editContent,
    });

    if (result.success && result.version) {
      setSavedDocs((prev) => ({
        ...prev,
        [activeDoc]: { content: editContent, version: result.version! },
      }));
      setSavedVersion(result.version);
      setSaveState("saved");
      setIsEditing(false);
      setTimeout(() => setSaveState("idle"), 3000);
    } else {
      setSaveState("error");
    }
  }

  async function openHistory() {
    setHistoryLoading(true);
    setShowHistory(true);
    const versions = await getAgentDocVersions(agent.id, activeDoc);
    setHistoryVersions(versions);
    setHistoryLoading(false);
  }

  function handleRestore(content: string) {
    setEditContent(content);
    setIsEditing(true);
    setSaveState("idle");
  }

  function handleDocChange(key: string) {
    setActiveDoc(key);
    setIsEditing(false);
    setSaveState("idle");
  }

  return (
    <div className="flex flex-col">
      {/* ── Breadcrumb ────────────────────────────────────────── */}
      <div className="mb-5 flex items-center gap-2">
        <motion.button
          type="button"
          onClick={() => router.push("/agentes")}
          className="text-[13px] font-semibold"
          style={{ color: "#A9AAA5" }}
          whileHover={{ color: "#0E0F10" }}
          transition={{ duration: 0.1 }}
        >
          Agentes
        </motion.button>
        <ChevronRight size={14} strokeWidth={2} color="#D5D2C9" />
        <span className="text-[13px] font-semibold" style={{ color: "#0E0F10" }}>
          {agent.name}
        </span>
      </div>

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="mb-6 flex items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[16px]"
            style={{ background: "#0E0F10" }}
          >
            <Bot size={24} strokeWidth={2} color={squadColor} />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-bold" style={{ fontSize: "24px", color: "#0E0F10", lineHeight: 1.2 }}>
                {agent.name}
              </h1>
              <span
                className="rounded-[9999px] px-3 py-1 text-[11px] font-bold tracking-[0.4px]"
                style={{ background: statusConfig.bg, color: statusConfig.color }}
              >
                {statusConfig.label}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2.5 flex-wrap">
              {agentSquad && (
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: squadColor }} />
                  <span className="text-[12px]" style={{ color: "#A9AAA5" }}>{agentSquad.name}</span>
                </div>
              )}
              <span style={{ color: "#D5D2C9" }}>·</span>
              <span className="text-[12px]" style={{ color: "#A9AAA5" }}>{statusConfig.desc}</span>
            </div>
          </div>
        </div>

        {/* Ações do header */}
        <div className="flex items-center gap-2 shrink-0">
          {!isEditing && (
            <>
              <motion.button
                type="button"
                onClick={openHistory}
                className="flex items-center gap-1.5 rounded-[12px] px-3.5 py-2.5 text-[12px] font-semibold"
                style={{ background: "#FFFFFF", color: "#5E5E5F" }}
                whileHover={{ backgroundColor: "#EEEFE9", scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.15 }}
              >
                <History size={13} strokeWidth={2.5} />
                Histórico
              </motion.button>
              <motion.button
                type="button"
                onClick={startEdit}
                className="flex items-center gap-2 rounded-[14px] px-4 py-2.5 text-[13px] font-semibold"
                style={{ background: "#FFFFFF", color: "#0E0F10" }}
                initial="rest"
                whileHover="hovered"
                whileTap={{ scale: 0.96 }}
                animate="rest"
                variants={{
                  rest: { scale: 1, backgroundColor: "#FFFFFF" },
                  hovered: { scale: 1.02, backgroundColor: "#EEEFE9" },
                }}
                transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <motion.span
                  className="flex items-center"
                  variants={{ rest: { scale: 1 }, hovered: { scale: 1.2 } }}
                  transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <Pencil size={13} strokeWidth={2.5} />
                </motion.span>
                Editar {currentDoc.label}
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* ── Layout de duas colunas ─────────────────────────────── */}
      <div className="flex gap-4 items-start">

        {/* ── Coluna esquerda: 3 boxes brancos separados ──────── */}
        <div className="flex flex-col gap-3 shrink-0" style={{ width: "232px" }}>

          {/* Box 1: Documentos */}
          <div className="rounded-[16px] bg-white overflow-hidden">
            <p className="px-4 pb-2 pt-4 text-[10px] font-bold tracking-[0.6px] uppercase" style={{ color: "#A9AAA5" }}>
              Documentos
            </p>
            <div className="flex flex-col pb-2">
              {DOCS.map((doc) => {
                const isActive = activeDoc === doc.key;
                const docVersion = savedDocs[doc.key]?.version;
                return (
                  <motion.button
                    key={doc.key}
                    type="button"
                    onClick={() => handleDocChange(doc.key)}
                    className="flex items-center gap-2.5 px-3 py-2.5 mx-1.5 rounded-[10px] text-left"
                    // animate controla o background — nunca use style para valores dinâmicos com Framer
                    initial={false}
                    animate={{
                      backgroundColor: isActive ? "#0E0F10" : "rgba(0,0,0,0)",
                      color: isActive ? "#FFFFFF" : "#5E5E5F",
                    }}
                    whileHover={!isActive ? { backgroundColor: "rgba(213,210,201,0.35)", color: "#0E0F10" } : undefined}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <motion.span
                      className="flex items-center shrink-0"
                      animate={{ color: isActive ? squadColor : "#A9AAA5" }}
                      transition={{ duration: 0.15 }}
                    >
                      {doc.icon}
                    </motion.span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <motion.p
                          className="font-bold truncate"
                          style={{ fontSize: "12px" }}
                          animate={{ color: isActive ? "#FFFFFF" : "#0E0F10" }}
                          transition={{ duration: 0.15 }}
                        >
                          {doc.label}
                        </motion.p>
                        {docVersion && (
                          <span
                            className="rounded-[4px] px-1 py-0.5 font-mono text-[9px] font-bold shrink-0"
                            style={{
                              background: isActive ? "rgba(215,255,0,0.2)" : "#EEEFE9",
                              color: isActive ? "#D7FF00" : "#A9AAA5",
                            }}
                          >
                            {formatVersion(docVersion)}
                          </span>
                        )}
                      </div>
                      <motion.p
                        className="truncate text-[10px]"
                        animate={{ color: isActive ? "rgba(255,255,255,0.50)" : "#A9AAA5" }}
                        transition={{ duration: 0.15 }}
                      >
                        {doc.desc}
                      </motion.p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Box 2: Skills (só se tiver) */}
          {agent.skills.length > 0 && (
            <div className="rounded-[16px] bg-white overflow-hidden">
              <p className="px-4 pb-2 pt-4 text-[10px] font-bold tracking-[0.6px] uppercase" style={{ color: "#A9AAA5" }}>
                Skills
              </p>
              <div className="flex flex-col pb-3">
                {agent.skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center gap-2.5 px-4 py-2"
                  >
                    <Layers size={12} strokeWidth={2} color="#A9AAA5" />
                    <div className="min-w-0 flex-1 flex items-center gap-1.5">
                      <p className="truncate font-semibold text-[12px]" style={{ color: "#0E0F10" }}>
                        {skill.name}
                      </p>
                      {skill.isAlways && (
                        <span
                          className="rounded-[4px] px-1.5 py-0.5 text-[9px] font-bold shrink-0"
                          style={{ background: "#D7FF00", color: "#0E0F10" }}
                        >
                          SEMPRE
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Box 3: Especialidades/Tags (só se tiver) */}
          {agent.tags.length > 0 && (
            <div className="rounded-[16px] bg-white p-4">
              <p className="mb-3 text-[10px] font-bold tracking-[0.6px] uppercase" style={{ color: "#A9AAA5" }}>
                Especialidades
              </p>
              <div className="flex flex-wrap gap-1.5">
                {agent.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-[7px] px-2 py-1 text-[11px] font-semibold"
                    style={{ background: "#EEEFE9", color: "#5E5E5F" }}
                  >
                    <Tag size={9} strokeWidth={2.5} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Box 4: Memória acumulada (links) */}
          <div className="rounded-[16px] bg-white p-4">
            <p className="mb-2 text-[10px] font-bold tracking-[0.6px] uppercase" style={{ color: "#A9AAA5" }}>
              Arquivos alcançados
            </p>
            <div className="flex flex-col gap-1">
              {["AGENTS.md", "MEMORY.md", "alma.pendente"].map((f) => (
                <div key={f} className="flex items-center gap-2 py-0.5">
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "#D5D2C9" }} />
                  <span className="text-[11px] font-semibold" style={{ color: "#A9AAA5" }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Coluna direita: visualizador/editor ─────────────── */}
        <div className="flex-1 min-w-0">
          <motion.div
            className="rounded-[20px] bg-white p-8"
            style={{ minHeight: "520px" }}
            key={activeDoc}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0, 0, 0.2, 1] }}
          >
            {/* Header do doc */}
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-[10px] shrink-0"
                  style={{ background: "#0E0F10" }}
                >
                  <span style={{ color: squadColor }}>{currentDoc.icon}</span>
                </div>
                <div>
                  <h2 className="font-bold" style={{ fontSize: "15px", color: "#0E0F10" }}>
                    {currentDoc.label}
                  </h2>
                  <p className="text-[11px]" style={{ color: "#A9AAA5" }}>{currentDoc.desc}</p>
                </div>
              </div>

              {/* Status de salvo */}
              <AnimatePresence mode="wait">
                {saveState === "saved" && savedVersion && (
                  <motion.div
                    key="saved-badge"
                    className="flex items-center gap-1.5 rounded-[9px] px-3 py-1.5 shrink-0"
                    style={{ background: "#0E0F10", color: "#D7FF00", fontSize: "12px", fontWeight: 600 }}
                    initial={{ opacity: 0, scale: 0.88, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    <Check size={12} strokeWidth={2.5} />
                    {formatVersion(savedVersion)} salva · {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </motion.div>
                )}
                {saveState === "error" && (
                  <motion.div
                    key="error-badge"
                    className="flex items-center gap-1.5 rounded-[9px] px-3 py-1.5 shrink-0"
                    style={{ background: "rgba(239,68,68,0.1)", color: "#dc2626", fontSize: "12px", fontWeight: 600 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Erro ao salvar
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Conteúdo */}
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key={`edit-${activeDoc}`}
                  className="flex flex-col gap-4"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                >
                  {/* Aviso de versionamento */}
                  <div
                    className="flex items-start gap-2.5 rounded-[10px] px-3.5 py-3"
                    style={{ background: "rgba(215,255,0,0.08)", border: "1px solid rgba(215,255,0,0.3)" }}
                  >
                    <Clock size={13} strokeWidth={2.5} color="#5E5E5F" style={{ marginTop: "1px", flexShrink: 0 }} />
                    <p className="text-[12px] leading-[1.5]" style={{ color: "#5E5E5F" }}>
                      Ao salvar, uma nova versão numerada será criada e registrada no banco de dados.
                      O histórico completo fica disponível em <strong style={{ color: "#0E0F10" }}>Histórico</strong>.
                    </p>
                  </div>

                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full resize-none rounded-[12px] p-5 font-mono text-[13px] leading-[1.75] outline-none"
                    style={{
                      background: "#EEEFE9",
                      color: "#0E0F10",
                      border: "1.5px solid transparent",
                      minHeight: "360px",
                      transition: "border-color 150ms",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#0E0F10")}
                    onBlur={(e) => (e.target.style.borderColor = "transparent")}
                  />

                  <div className="flex gap-3">
                    <motion.button
                      type="button"
                      onClick={handleSave}
                      disabled={saveState === "saving"}
                      className="flex items-center gap-2 rounded-[14px] px-5 py-3 text-[14px] font-bold"
                      style={{
                        background: saveState === "saving" ? "#D9D9D4" : "#D7FF00",
                        color: "#0E0F10",
                        cursor: saveState === "saving" ? "wait" : "pointer",
                      }}
                      initial="rest"
                      whileHover={saveState !== "saving" ? "hovered" : "rest"}
                      whileTap={{ scale: 0.96 }}
                      animate="rest"
                      variants={{
                        rest: { scale: 1 },
                        hovered: { scale: 1.02, backgroundColor: "#DFFF33" },
                      }}
                      transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                    >
                      <motion.span
                        className="flex items-center"
                        variants={{ rest: { scale: 1 }, hovered: { scale: 1.2 } }}
                        transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                      >
                        <Save size={14} strokeWidth={2.5} />
                      </motion.span>
                      {saveState === "saving" ? "Salvando..." : "Salvar nova versão"}
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="rounded-[14px] px-5 py-3 text-[14px] font-semibold"
                      style={{ background: "#EEEFE9", color: "#5E5E5F" }}
                      whileHover={{ backgroundColor: "#D9D9D4", scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                    >
                      Cancelar
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`view-${activeDoc}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                >
                  <MarkdownViewer content={displayContent} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Modal de histórico de versões */}
      <VersionHistoryModal
        open={showHistory}
        versions={historyVersions}
        docLabel={currentDoc.label}
        onClose={() => setShowHistory(false)}
        onRestore={handleRestore}
      />
    </div>
  );
}
