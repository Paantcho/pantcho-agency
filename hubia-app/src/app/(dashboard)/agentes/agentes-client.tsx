"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Code2,
  PenTool,
  FileText,
  X,
  Bot,
  Users,
  Network,
  Sparkles,
  BookOpen,
  ChevronRight,
  Tag,
  Activity,
  TrendingUp,
  Save,
  Pencil,
  Check,
  AlertCircle,
} from "lucide-react";
import { SlidingTabs } from "@/components/ui/sliding-tabs";
import { HubiaPortal } from "@/components/ui/hubia-portal";
import type { SquadWithAgents, SkillsBySquad, AgentItem, SkillItem } from "./actions";
import { createAgent, createSquad } from "./actions";

// ─── Cores por squad slug ─────────────────────────────────────────
const SQUAD_COLOR: Record<string, string> = {
  "dev-squad": "#D7FF00",
  "audiovisual-squad": "#C8B4FA",
};

function getSquadColor(slug: string) {
  return SQUAD_COLOR[slug] ?? "#D9D9D4";
}

const SQUAD_ICON_MAP: Record<string, React.ReactNode> = {
  "dev-squad": <Code2 size={14} strokeWidth={2.5} />,
  "audiovisual-squad": <PenTool size={14} strokeWidth={2.5} />,
};

function getSquadIcon(slug: string) {
  return SQUAD_ICON_MAP[slug] ?? <Bot size={14} strokeWidth={2.5} />;
}

// ─── Badge de status ──────────────────────────────────────────────
function getStatusBadge(status: string, name: string) {
  if (status === "ativo" && name === "Orquestrador")
    return { label: "Revisão ativa", bg: "#D7FF00", color: "#0E0F10" };
  if (status === "ativo" && (name === "Consistência" || name === "Eng. de Prompts"))
    return { label: "Em tarefa", bg: "#0E0F10", color: "#D7FF00" };
  if (status === "ativo") return { label: "Standby", bg: "#D9D9D4", color: "#5E5E5F" };
  return { label: "Inativo", bg: "#D9D9D4", color: "#5E5E5F" };
}

// ─────────────────────────────────────────────────────────────────
// CAMADAS DE MODAL — estrutura base com portal (regra inviolável)
// ─────────────────────────────────────────────────────────────────
function ModalBase({
  open,
  onClose,
  children,
  maxWidth = "520px",
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
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
              className="relative w-full rounded-[20px] bg-white p-7"
              style={{ maxWidth }}
              initial={{ scale: 0.88, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 10, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botão fechar */}
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

              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </HubiaPortal>
  );
}

// ─────────────────────────────────────────────────────────────────
// DRAWER DE DOCUMENTO DO AGENTE
// Abre ao clicar em SOUL.md / SKILL.md / RULES.md
// ─────────────────────────────────────────────────────────────────
const DOC_CONTENT: Record<string, { title: string; content: string }> = {
  "SOUL.md": {
    title: "SOUL.md",
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
- Mantém o tom profissional e objetivo`,
  },
  "SKILL.md": {
    title: "SKILL.md",
    content: `# Skills do Agente

## Skills ativas
Lista de habilidades que este agente pode acionar conforme o contexto:

- **Análise de briefing** — decompõe pedidos em tarefas menores
- **Geração de prompts** — produz prompts estruturados para modelos de IA
- **Revisão de output** — verifica qualidade antes de entregar
- **Roteamento** — identifica qual agente ou squad deve receber uma tarefa

## Como são acionadas
Skills são acionadas automaticamente pelo orquestrador ou via instrução direta.`,
  },
  "RULES.md": {
    title: "RULES.md",
    content: `# Regras Invioláveis

## O que NUNCA fazer
1. Não expor dados sensíveis de outros usuários ou organizações
2. Não alterar arquivos de configuração sem autorização explícita
3. Não executar ações destrutivas sem confirmação

## O que SEMPRE fazer
1. Registrar decisões relevantes na memória (WORKING.md ou MEMORY.md)
2. Seguir o design system Hubia em outputs visuais
3. Responder em português brasileiro

## Ciclo obrigatório
PLAN → EXECUTE → REFLECT`,
  },
};

function AgentDocDrawer({
  open,
  docKey,
  agentName,
  onClose,
}: {
  open: boolean;
  docKey: string | null;
  agentName: string;
  onClose: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [savedContent, setSavedContent] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saved, setSaved] = useState(false);

  const doc = docKey ? DOC_CONTENT[docKey] : null;
  const displayContent = savedContent ?? doc?.content ?? "";

  function startEdit() {
    setEditContent(displayContent);
    setIsEditing(true);
  }

  function handleSave() {
    setSavedContent(editContent);
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <HubiaPortal>
      <AnimatePresence>
        {open && doc && (
          <>
            {/* Overlay semitransparente */}
            <motion.div
              className="fixed inset-0 z-[9998]"
              initial={{ backgroundColor: "rgba(14,15,16,0)", backdropFilter: "blur(0px)" }}
              animate={{ backgroundColor: "rgba(14,15,16,0.50)", backdropFilter: "blur(8px)" }}
              exit={{ backgroundColor: "rgba(14,15,16,0)", backdropFilter: "blur(0px)" }}
              transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
              onClick={onClose}
            />

            {/* Drawer lateral */}
            <motion.div
              className="fixed right-0 top-0 z-[9999] flex h-full flex-col bg-white"
              style={{ width: "520px", boxShadow: "none" }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 35, mass: 1 }}
            >
              {/* Header do drawer */}
              <div
                className="flex items-center justify-between border-b px-7 py-5"
                style={{ borderColor: "#EEEFE9" }}
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-[8px]"
                      style={{ background: "#0E0F10" }}
                    >
                      <FileText size={14} strokeWidth={2} color="#D7FF00" />
                    </span>
                    <h2 className="font-bold" style={{ fontSize: "17px", color: "#0E0F10" }}>
                      {doc.title}
                    </h2>
                  </div>
                  <p className="mt-0.5 pl-[36px] text-[12px]" style={{ color: "#A9AAA5" }}>
                    {agentName}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!isEditing && (
                    <motion.button
                      type="button"
                      onClick={startEdit}
                      className="flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-[12px] font-semibold"
                      style={{ background: "#EEEFE9", color: "#0E0F10" }}
                      whileHover={{ backgroundColor: "#D9D9D4", scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Pencil size={12} strokeWidth={2.5} />
                      Editar
                    </motion.button>
                  )}
                  <motion.button
                    type="button"
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ background: "#EEEFE9", color: "#5E5E5F" }}
                    whileHover={{ rotate: 90, scale: 1.1, backgroundColor: "#D5D2C9" }}
                    whileTap={{ rotate: 90, scale: 0.9 }}
                    transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    <X size={14} strokeWidth={2.5} />
                  </motion.button>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="flex-1 overflow-y-auto p-7">
                <AnimatePresence mode="wait">
                  {isEditing ? (
                    <motion.textarea
                      key="editor"
                      className="h-full w-full resize-none rounded-[12px] p-4 font-mono text-[13px] leading-[1.7] outline-none"
                      style={{
                        background: "#EEEFE9",
                        color: "#0E0F10",
                        border: "1.5px solid transparent",
                        minHeight: "calc(100vh - 280px)",
                      }}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = "#0E0F10")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = "transparent")
                      }
                    />
                  ) : (
                    <motion.div
                      key="viewer"
                      className="prose prose-sm max-w-none"
                      style={{ color: "#0E0F10" }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {displayContent.split("\n").map((line, i) => {
                        if (line.startsWith("# "))
                          return (
                            <h1 key={i} className="mb-3 mt-0 font-bold" style={{ fontSize: "20px" }}>
                              {line.replace("# ", "")}
                            </h1>
                          );
                        if (line.startsWith("## "))
                          return (
                            <h2
                              key={i}
                              className="mb-2 mt-5 font-bold"
                              style={{ fontSize: "14px", color: "#A9AAA5", letterSpacing: "0.5px", textTransform: "uppercase" }}
                            >
                              {line.replace("## ", "")}
                            </h2>
                          );
                        if (line.startsWith("- **"))
                          return (
                            <p key={i} className="mb-1.5 flex gap-2 text-[13px]" style={{ color: "#0E0F10" }}>
                              <span style={{ color: "#D7FF00", fontWeight: 700 }}>—</span>
                              <span dangerouslySetInnerHTML={{ __html: line.replace("- **", "").replace("**", "<strong>").replace("**", "</strong>").replace(" — ", "</strong> — ") }} />
                            </p>
                          );
                        if (line.startsWith("- "))
                          return (
                            <p key={i} className="mb-1 flex gap-2 text-[13px]" style={{ color: "#5E5E5F" }}>
                              <span style={{ color: "#D7FF00" }}>•</span>
                              {line.replace("- ", "")}
                            </p>
                          );
                        if (line.match(/^\d+\./))
                          return (
                            <p key={i} className="mb-1.5 text-[13px]" style={{ color: "#5E5E5F" }}>
                              {line}
                            </p>
                          );
                        if (line === "")
                          return <div key={i} className="h-2" />;
                        return (
                          <p key={i} className="mb-1.5 text-[13px] leading-[1.65]" style={{ color: "#5E5E5F" }}>
                            {line}
                          </p>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer — apenas quando editando */}
              <AnimatePresence>
                {isEditing && (
                  <motion.div
                    className="flex items-center gap-3 border-t px-7 py-5"
                    style={{ borderColor: "#EEEFE9" }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
                  >
                    <motion.button
                      type="button"
                      onClick={handleSave}
                      className="flex flex-1 items-center justify-center gap-2 rounded-[14px] py-3 text-[14px] font-bold"
                      style={{ background: "#D7FF00", color: "#0E0F10" }}
                      initial="rest"
                      whileHover="hovered"
                      whileTap={{ scale: 0.96 }}
                      animate="rest"
                      variants={{
                        rest: { scale: 1, backgroundColor: "#D7FF00" },
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
                      Salvar alterações
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
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Toast de salvo */}
              <AnimatePresence>
                {saved && (
                  <motion.div
                    className="absolute bottom-24 left-1/2 flex items-center gap-2 rounded-[12px] px-4 py-2.5"
                    style={{
                      background: "#0E0F10",
                      color: "#D7FF00",
                      translateX: "-50%",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                    initial={{ opacity: 0, y: 8, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
                  >
                    <Check size={14} strokeWidth={2.5} />
                    Versão salva
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </HubiaPortal>
  );
}

// ─────────────────────────────────────────────────────────────────
// MODAL DE DETALHE DO AGENTE
// ─────────────────────────────────────────────────────────────────
function AgentDetailModal({
  open,
  agent,
  squadName,
  onClose,
}: {
  open: boolean;
  agent: AgentItem | null;
  squadName: string;
  onClose: () => void;
}) {
  const [activeDoc, setActiveDoc] = useState<string | null>(null);

  if (!agent) return null;

  const badge = getStatusBadge(agent.status, agent.name);

  const docsItems = [
    { key: "SOUL.md", label: "SOUL.md", desc: "Alma, missão e valores", icon: <BookOpen size={14} /> },
    { key: "SKILL.md", label: "SKILL.md", desc: "Skills e quando acionar", icon: <Sparkles size={14} /> },
    { key: "RULES.md", label: "RULES.md", desc: "Regras invioláveis", icon: <FileText size={14} /> },
  ];

  return (
    <>
      <ModalBase open={open} onClose={onClose} maxWidth="520px">
        {/* Header */}
        <div className="mb-6 flex items-start gap-4 pr-8">
          <div
            className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[14px]"
            style={{ background: "#0E0F10" }}
          >
            <Bot size={22} strokeWidth={2} color="#D7FF00" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#0E0F10", lineHeight: 1.2 }}>
                {agent.name}
              </h2>
              <span
                className="rounded-[9999px] px-2.5 py-1 text-[10px] font-bold tracking-[0.4px]"
                style={{ background: badge.bg, color: badge.color }}
              >
                {badge.label}
              </span>
            </div>
            <p className="mt-1 text-[13px]" style={{ color: "#A9AAA5" }}>
              {squadName}
            </p>
          </div>
        </div>

        {/* Descrição */}
        {agent.description && (
          <div className="mb-5 rounded-[12px] p-4" style={{ background: "#EEEFE9" }}>
            <p className="text-[13px] leading-[1.6]" style={{ color: "#5E5E5F" }}>
              {agent.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {agent.tags.length > 0 && (
          <div className="mb-5">
            <p className="mb-2 text-[11px] font-bold tracking-[0.5px] uppercase" style={{ color: "#A9AAA5" }}>
              Especialidades
            </p>
            <div className="flex flex-wrap gap-1.5">
              {agent.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-[8px] px-2.5 py-1 text-[11px] font-semibold"
                  style={{ background: "#EEEFE9", color: "#5E5E5F" }}
                >
                  <Tag size={10} strokeWidth={2.5} />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Documentos */}
        <div>
          <p className="mb-3 text-[11px] font-bold tracking-[0.5px] uppercase" style={{ color: "#A9AAA5" }}>
            Documentos do agente
          </p>
          <div className="flex flex-col gap-2">
            {docsItems.map((doc, i) => (
              <motion.button
                key={doc.key}
                type="button"
                onClick={() => setActiveDoc(doc.key)}
                className="flex items-center gap-3 rounded-[12px] px-4 py-3 text-left"
                style={{ background: "#EEEFE9" }}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + i * 0.04, duration: 0.2, ease: [0, 0, 0.2, 1] }}
                whileHover={{ backgroundColor: "#D9D9D4", x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span style={{ color: "#5E5E5F" }}>{doc.icon}</span>
                <div className="flex-1">
                  <p className="text-[13px] font-bold" style={{ color: "#0E0F10" }}>
                    {doc.label}
                  </p>
                  <p className="text-[11px]" style={{ color: "#A9AAA5" }}>
                    {doc.desc}
                  </p>
                </div>
                <ChevronRight size={14} strokeWidth={2.5} color="#A9AAA5" />
              </motion.button>
            ))}
          </div>
        </div>
      </ModalBase>

      {/* Drawer de documento (sobrepõe o modal) */}
      <AgentDocDrawer
        open={activeDoc !== null}
        docKey={activeDoc}
        agentName={agent.name}
        onClose={() => setActiveDoc(null)}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// MODAL DE EDIÇÃO DE SKILL
// ─────────────────────────────────────────────────────────────────
function SkillEditModal({
  open,
  skill,
  squadName,
  onClose,
}: {
  open: boolean;
  skill: SkillItem | null;
  squadName: string;
  onClose: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [saved, setSaved] = useState(false);

  // Inicializar form quando a skill mudar
  const startEdit = useCallback(() => {
    setEditName(skill?.name ?? "");
    setEditDesc(skill?.description ?? "");
    setIsEditing(true);
  }, [skill]);

  function handleSave() {
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!skill) return null;

  return (
    <ModalBase open={open} onClose={onClose} maxWidth="480px">
      <div className="pr-8">
        {/* Header */}
        <div className="mb-5">
          <div className="mb-1 flex items-center gap-2.5 flex-wrap">
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#0E0F10" }}>
              {isEditing ? editName : skill.name}
            </h2>
            {skill.isAlways && (
              <span
                className="rounded-[9999px] px-2.5 py-1 text-[10px] font-bold tracking-[0.4px]"
                style={{ background: "#D7FF00", color: "#0E0F10" }}
              >
                SEMPRE
              </span>
            )}
          </div>
          <p className="text-[12px]" style={{ color: "#A9AAA5" }}>
            {squadName}
          </p>
        </div>

        {/* Tag SEMPRE — explicação */}
        {skill.isAlways && (
          <div
            className="mb-5 rounded-[12px] p-4"
            style={{ background: "rgba(215,255,0,0.08)", border: "1px solid rgba(215,255,0,0.4)" }}
          >
            <p className="mb-1 text-[12px] font-bold" style={{ color: "#0E0F10" }}>
              O que é a tag SEMPRE?
            </p>
            <p className="text-[12px] leading-[1.6]" style={{ color: "#5E5E5F" }}>
              Skill acionada automaticamente em toda execução — sem depender do contexto.
              Vem de <code className="rounded px-1 text-[11px]" style={{ background: "#EEEFE9" }}>config.always: true</code> no banco.
            </p>
          </div>
        )}

        {/* Campos editáveis */}
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="edit-form"
              className="flex flex-col gap-4"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              <div>
                <label className="mb-1.5 block text-[11px] font-bold tracking-[0.5px] uppercase" style={{ color: "#A9AAA5" }}>
                  Nome
                </label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-11 w-full rounded-[10px] px-3.5 text-[14px] font-semibold outline-none"
                  style={{
                    background: "#EEEFE9",
                    color: "#0E0F10",
                    border: "1.5px solid transparent",
                    transition: "border-color 150ms",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#0E0F10")}
                  onBlur={(e) => (e.target.style.borderColor = "transparent")}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-bold tracking-[0.5px] uppercase" style={{ color: "#A9AAA5" }}>
                  Descrição
                </label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-[10px] px-3.5 py-3 text-[13px] leading-[1.6] outline-none"
                  style={{
                    background: "#EEEFE9",
                    color: "#0E0F10",
                    border: "1.5px solid transparent",
                    transition: "border-color 150ms",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#0E0F10")}
                  onBlur={(e) => (e.target.style.borderColor = "transparent")}
                />
              </div>

              {/* Ações */}
              <div className="flex gap-3 pt-1">
                <motion.button
                  type="button"
                  onClick={handleSave}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[14px] py-3 text-[14px] font-bold"
                  style={{ background: "#D7FF00", color: "#0E0F10" }}
                  initial="rest"
                  whileHover="hovered"
                  whileTap={{ scale: 0.96 }}
                  animate="rest"
                  variants={{
                    rest: { scale: 1, backgroundColor: "#D7FF00" },
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
                  Salvar
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
              key="view-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* Descrição */}
              {skill.description && (
                <div className="mb-4">
                  <p className="mb-1.5 text-[11px] font-bold tracking-[0.5px] uppercase" style={{ color: "#A9AAA5" }}>
                    Descrição
                  </p>
                  <div className="rounded-[12px] p-4" style={{ background: "#EEEFE9" }}>
                    <p className="text-[13px] leading-[1.6]" style={{ color: "#5E5E5F" }}>
                      {saved ? editDesc || skill.description : skill.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Info técnica */}
              <div className="mb-6 rounded-[12px] p-4" style={{ background: "#EEEFE9" }}>
                <p className="mb-2 text-[11px] font-bold tracking-[0.5px] uppercase" style={{ color: "#A9AAA5" }}>
                  Informações técnicas
                </p>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px]" style={{ color: "#5E5E5F" }}>Slug</span>
                    <code className="rounded px-2 py-0.5 text-[11px] font-bold" style={{ background: "#D9D9D4", color: "#0E0F10" }}>
                      {skill.slug}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px]" style={{ color: "#5E5E5F" }}>Acionamento</span>
                    <span className="text-[12px] font-semibold" style={{ color: "#0E0F10" }}>
                      {skill.isAlways ? "Automático (sempre)" : "Contextual"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botão editar */}
              <motion.button
                type="button"
                onClick={startEdit}
                className="flex w-full items-center justify-center gap-2 rounded-[14px] py-3 text-[14px] font-bold"
                style={{ background: "#D7FF00", color: "#0E0F10" }}
                initial="rest"
                whileHover="hovered"
                whileTap={{ scale: 0.96 }}
                animate="rest"
                variants={{
                  rest: { scale: 1, backgroundColor: "#D7FF00" },
                  hovered: { scale: 1.02, backgroundColor: "#DFFF33" },
                }}
                transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <motion.span
                  className="flex items-center"
                  variants={{ rest: { scale: 1 }, hovered: { scale: 1.2 } }}
                  transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <Pencil size={14} strokeWidth={2.5} />
                </motion.span>
                Editar skill
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmação de salvo */}
        <AnimatePresence>
          {saved && (
            <motion.div
              className="mt-3 flex items-center gap-2 rounded-[10px] px-3 py-2.5"
              style={{ background: "#0E0F10", color: "#D7FF00", fontSize: "12px", fontWeight: 600 }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Check size={12} strokeWidth={2.5} />
              Alterações salvas · versão registrada
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ModalBase>
  );
}

// ─────────────────────────────────────────────────────────────────
// CARD DE AGENTE — navega para /agentes/[slug]
// ─────────────────────────────────────────────────────────────────
function AgentCard({
  agent,
  squadSlug,
  index,
}: {
  agent: AgentItem;
  squadSlug: string;
  index: number;
}) {
  const router = useRouter();
  const badge = getStatusBadge(agent.status, agent.name);
  const squadColor = getSquadColor(squadSlug);

  return (
    <motion.button
      type="button"
      onClick={() => router.push(`/agentes/${agent.slug}`)}
      className="flex flex-col rounded-[20px] p-5 text-left"
      style={{ background: "#0E0F10", minHeight: "200px" }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: Math.min(index * 0.06, 0.3) }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div
          className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[12px]"
          style={{ background: squadColor }}
        >
          <Bot size={22} strokeWidth={2} color="#0E0F10" />
        </div>
        <span
          className="mt-0.5 rounded-[9999px] px-2.5 py-1 text-[10px] font-bold tracking-[0.4px]"
          style={{ background: badge.bg, color: badge.color }}
        >
          {badge.label}
        </span>
      </div>

      <h3 className="mb-1.5 font-bold leading-tight" style={{ fontSize: "18px", color: squadColor }}>
        {agent.name}
      </h3>

      <p className="mb-4 flex-1 text-[12px] leading-[1.5]" style={{ color: "rgba(255,255,255,0.60)" }}>
        {agent.description ?? "—"}
      </p>

      {agent.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {agent.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-[6px] px-2 py-0.5 text-[10px] font-semibold"
              style={{ background: "rgba(255,255,255,0.10)", color: "#A9AAA5" }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────────
// MODAL DE NOVO AGENTE
// ─────────────────────────────────────────────────────────────────
function NovoAgenteModal({
  open,
  squads,
  onClose,
  onSuccess,
}: {
  open: boolean;
  squads: SquadWithAgents[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const DRAFT_KEY = "hubia:novo-agente:rascunho";
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [squadId, setSquadId] = useState<string | null>(null);
  const [status, setStatus] = useState<"ativo" | "inativo" | "rascunho" | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftSavedMsg, setDraftSavedMsg] = useState(false);

  // Restaura rascunho ao abrir
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

  function saveDraft() {
    if (typeof window !== "undefined" && name.trim()) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ name, description, tagsInput }));
    }
  }

  function resetForm() {
    setName(""); setDescription(""); setSquadId(null);
    setStatus(null); setTagsInput(""); setError(null);
    setDraftSavedMsg(false);
    loadedRef[1](false);
  }

  function handleClose() {
    // Se tem conteúdo e não chegou a submeter, salva rascunho
    if (name.trim()) {
      saveDraft();
      setDraftSavedMsg(true);
      setTimeout(() => {
        setDraftSavedMsg(false);
        resetForm();
        onClose();
      }, 1200);
    } else {
      clearDraft();
      resetForm();
      onClose();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !status) {
      setError(!status ? "Selecione um status inicial" : "Nome obrigatório");
      return;
    }
    setLoading(true);
    setError(null);
    // Gera slug a partir do nome
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    const result = await createAgent({ name: name.trim(), slug, description, squadId, tags, status });
    setLoading(false);
    if (result.success) {
      clearDraft();
      resetForm();
      onSuccess();
      onClose();
      if (result.agentSlug) {
        router.push(`/agentes/${result.agentSlug}`);
      }
    } else {
      setError(result.error ?? "Erro ao criar agente");
    }
  }

  const inputClass = "h-11 w-full rounded-[10px] px-3.5 text-[14px] outline-none transition-[border-color] duration-150";
  const inputStyle = { background: "#EEEFE9", color: "#0E0F10", border: "1.5px solid transparent" };

  const statusOptions: { value: "rascunho" | "ativo" | "inativo"; label: string; desc: string }[] = [
    { value: "rascunho", label: "Rascunho", desc: "Em configuração" },
    { value: "ativo", label: "Ativo", desc: "Operacional" },
    { value: "inativo", label: "Standby", desc: "Pausado" },
  ];

  const slugPreview = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  const canSubmit = !!name.trim() && !!status;

  return (
    <ModalBase open={open} onClose={handleClose} maxWidth="500px">
      <form onSubmit={handleSubmit} className="pr-8">
        <h2 className="mb-1 font-bold" style={{ fontSize: "20px", color: "#0E0F10" }}>
          Novo agente
        </h2>

        {/* Banner rascunho salvo */}
        <AnimatePresence>
          {draftSavedMsg && (
            <motion.div
              className="mt-2 mb-2 flex items-center gap-2 rounded-[10px] px-3 py-2"
              style={{ background: "rgba(215,255,0,0.15)", border: "1px solid rgba(215,255,0,0.4)" }}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-[12px] font-semibold" style={{ color: "#0E0F10" }}>
                💾 Rascunho salvo — você pode continuar de onde parou
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4 flex flex-col gap-4">
          {/* Nome */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold tracking-[0.5px] uppercase" style={{ color: "#A9AAA5" }}>
              Nome *
            </label>
            <input
              className={inputClass}
              style={inputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Copywriter"
              required
              onFocus={(e) => (e.target.style.borderColor = "#0E0F10")}
              onBlur={(e) => (e.target.style.borderColor = "transparent")}
            />
            {slugPreview && (
              <p className="mt-1 text-[11px]" style={{ color: "#A9AAA5" }}>
                slug: <code style={{ color: "#5E5E5F" }}>{slugPreview}</code>
              </p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold tracking-[0.5px] uppercase" style={{ color: "#A9AAA5" }}>
              Descrição
            </label>
            <textarea
              className="w-full resize-none rounded-[10px] px-3.5 py-3 text-[14px] leading-[1.6] outline-none"
              style={{ ...inputStyle, minHeight: "80px" }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="O que este agente faz?"
              rows={3}
              onFocus={(e) => (e.target.style.borderColor = "#0E0F10")}
              onBlur={(e) => (e.target.style.borderColor = "transparent")}
            />
          </div>

          {/* Squad — começa sem nada selecionado */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold tracking-[0.5px] uppercase" style={{ color: "#A9AAA5" }}>
              Squad <span style={{ fontWeight: 400, textTransform: "none" }}>(opcional)</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {/* Opção "Nenhum" */}
              <motion.button
                key="none"
                type="button"
                onClick={() => setSquadId(null)}
                className="flex items-center gap-1.5 rounded-[9999px] px-3.5 py-2 text-[12px] font-semibold"
                initial={false}
                animate={{
                  backgroundColor: squadId === null ? "#0E0F10" : "#EEEFE9",
                  color: squadId === null ? "#A9AAA5" : "#5E5E5F",
                }}
                whileHover={squadId !== null ? { backgroundColor: "#D9D9D4" } : undefined}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
              >
                Nenhum
              </motion.button>
              {squads.map((squad) => {
                const isSelected = squadId === squad.id;
                const color = getSquadColor(squad.slug);
                return (
                  <motion.button
                    key={squad.id}
                    type="button"
                    onClick={() => setSquadId(isSelected ? null : squad.id)}
                    className="flex items-center gap-1.5 rounded-[9999px] px-3.5 py-2 text-[12px] font-semibold"
                    initial={false}
                    animate={{
                      backgroundColor: isSelected ? "#0E0F10" : "#EEEFE9",
                      color: isSelected ? color : "#5E5E5F",
                    }}
                    whileHover={!isSelected ? { backgroundColor: "#D9D9D4" } : undefined}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                  >
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
                    {squad.name}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Status — começa sem nada selecionado */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold tracking-[0.5px] uppercase" style={{ color: "#A9AAA5" }}>
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
                    className="flex flex-col rounded-[10px] px-3.5 py-2.5 text-left"
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
                      className="text-[11px]"
                      animate={{ color: isSelected ? "rgba(255,255,255,0.55)" : "#A9AAA5" }}
                      transition={{ duration: 0.15 }}
                    >
                      {opt.desc}
                    </motion.span>
                  </motion.button>
                );
              })}
            </div>
            {!status && (
              <p className="mt-1.5 text-[11px]" style={{ color: "#A9AAA5" }}>
                Selecione um status para continuar
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold tracking-[0.5px] uppercase" style={{ color: "#A9AAA5" }}>
              Especialidades <span style={{ fontWeight: 400, textTransform: "none" }}>(separadas por vírgula)</span>
            </label>
            <input
              className={inputClass}
              style={inputStyle}
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Ex: copywriting, SEO, redes sociais"
              onFocus={(e) => (e.target.style.borderColor = "#0E0F10")}
              onBlur={(e) => (e.target.style.borderColor = "transparent")}
            />
          </div>

          {/* Erro */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="flex items-center gap-2 rounded-[10px] px-3.5 py-3 text-[13px]"
                style={{ background: "rgba(239,68,68,0.08)", color: "#dc2626" }}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <AlertCircle size={14} strokeWidth={2.5} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botões */}
          <div className="flex gap-3 pt-1">
            <motion.button
              type="submit"
              disabled={loading || !canSubmit}
              className="flex flex-1 items-center justify-center gap-2 rounded-[14px] py-3 text-[14px] font-bold"
              style={{
                background: loading || !canSubmit ? "#D9D9D4" : "#D7FF00",
                color: "#0E0F10",
                cursor: loading || !canSubmit ? "not-allowed" : "pointer",
              }}
              whileHover={!loading && canSubmit ? { scale: 1.02, backgroundColor: "#DFFF33" } : {}}
              whileTap={!loading && canSubmit ? { scale: 0.96 } : {}}
              transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
            >
              {loading ? "Criando..." : "Criar agente"}
            </motion.button>
            <motion.button
              type="button"
              onClick={() => { resetForm(); onClose(); }}
              className="rounded-[14px] px-5 py-3 text-[14px] font-semibold"
              style={{ background: "#EEEFE9", color: "#5E5E5F" }}
              whileHover={{ backgroundColor: "#D9D9D4", scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15 }}
            >
              Cancelar
            </motion.button>
          </div>
        </div>
      </form>
    </ModalBase>
  );
}

// ─────────────────────────────────────────────────────────────────
// TAB 1 — SQUADS
// ─────────────────────────────────────────────────────────────────
function TabSquads({ squads, filterSlug }: { squads: SquadWithAgents[]; filterSlug: string | null }) {
  const router = useRouter();
  const filtered = filterSlug ? squads.filter((s) => s.slug === filterSlug) : squads;

  return (
    <div className="flex flex-col gap-8">
      {filtered.map((squad) => (
        <div key={squad.id}>
          <div className="mb-4 flex items-center gap-2.5">
            <motion.button
              type="button"
              onClick={() => router.push(`/agentes/squad/${squad.slug}`)}
              className="flex items-center gap-2.5"
              whileHover={{ opacity: 0.7 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.12 }}
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-[8px]"
                style={{ background: getSquadColor(squad.slug) }}
              >
                {getSquadIcon(squad.slug)}
              </div>
              <span className="font-bold" style={{ fontSize: "16px", color: "#0E0F10" }}>
                {squad.name}
              </span>
            </motion.button>
            <span className="text-[13px] font-medium" style={{ color: "#A9AAA5" }}>
              {squad.agents.length} {squad.agents.length === 1 ? "agente" : "agentes"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {squad.agents.map((agent, i) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                squadSlug={squad.slug}
                index={i}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TAB 2 — SKILLS REGISTRY
// ─────────────────────────────────────────────────────────────────
function TabSkillsRegistry({ skillsBySquad }: { skillsBySquad: SkillsBySquad[] }) {
  const [editing, setEditing] = useState<{ skill: SkillItem; squadName: string } | null>(null);

  return (
    <>
      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {skillsBySquad.map((item) => (
          <motion.div
            key={item.squad.id}
            className="rounded-[20px] bg-white p-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
          >
            {/* Header */}
            <div className="mb-5 flex items-center gap-2.5">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-[8px]"
                style={{ background: getSquadColor(item.squad.slug) }}
              >
                {getSquadIcon(item.squad.slug)}
              </div>
              <span className="font-bold" style={{ fontSize: "16px", color: "#0E0F10" }}>
                {item.squad.name}
              </span>
              <span
                className="rounded-[9999px] px-2 py-0.5 text-[11px] font-semibold"
                style={{ background: "#EEEFE9", color: "#A9AAA5" }}
              >
                {item.skills.length} skills
              </span>
            </div>

            {/* Lista */}
            <div className="flex flex-col">
              {item.skills.map((skill, i) => (
                <motion.div
                  key={skill.id}
                  className="flex items-center justify-between gap-4 py-3"
                  style={{ borderBottom: i < item.skills.length - 1 ? "1px solid #EEEFE9" : "none" }}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.04, 0.25), ease: [0, 0, 0.2, 1] }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold" style={{ fontSize: "13px", color: "#0E0F10" }}>
                        {skill.name}
                      </p>
                      {skill.isAlways && (
                        <span
                          className="rounded-[9999px] px-2 py-0.5 text-[9px] font-bold tracking-[0.4px]"
                          style={{ background: "#D7FF00", color: "#0E0F10" }}
                        >
                          SEMPRE
                        </span>
                      )}
                    </div>
                    {skill.description && (
                      <p className="mt-0.5 text-[11px] leading-[1.4]" style={{ color: "#A9AAA5" }}>
                        {skill.description}
                      </p>
                    )}
                  </div>

                  <motion.button
                    type="button"
                    onClick={() => setEditing({ skill, squadName: item.squad.name })}
                    className="flex shrink-0 items-center gap-1.5 rounded-[9999px] border px-3 py-1.5 text-[11px] font-semibold"
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
                      <Pencil size={10} strokeWidth={2.5} />
                    </motion.span>
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <SkillEditModal
        open={editing !== null}
        skill={editing?.skill ?? null}
        squadName={editing?.squadName ?? ""}
        onClose={() => setEditing(null)}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// TAB 3 — FLUXO DO ORQUESTRADOR (dinâmico + cores de squad)
// ─────────────────────────────────────────────────────────────────
function SquadDot({ color }: { color: string }) {
  return (
    <span
      className="h-2 w-2 rounded-full shrink-0"
      style={{ background: color }}
    />
  );
}

function TabFluxo({ squads }: { squads: SquadWithAgents[] }) {
  return (
    <div className="rounded-[20px] bg-white p-10">
      <div className="flex flex-col items-center gap-0">
        {/* Entrada */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0 }}
        >
          <span className="mb-1.5 text-[9px] font-bold tracking-[0.8px] uppercase" style={{ color: "#A9AAA5" }}>
            ENTRADA
          </span>
          <div
            className="flex items-center gap-2.5 rounded-[14px] px-5 py-3"
            style={{ background: "#0E0F10", minWidth: "200px" }}
          >
            <Users size={14} strokeWidth={2} color="#FFFFFF" />
            <span className="font-bold" style={{ fontSize: "13px", color: "#FFFFFF" }}>
              Pedido do usuário
            </span>
          </div>
        </motion.div>

        <div style={{ width: 1, height: 28, background: "#D5D2C9" }} />

        {/* Orquestrador */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.12 }}
        >
          <span className="mb-1.5 text-[9px] font-bold tracking-[0.8px] uppercase" style={{ color: "#A9AAA5" }}>
            ORQUESTRADOR
          </span>
          <div
            className="flex items-center gap-2.5 rounded-[14px] px-5 py-3"
            style={{ background: "#D7FF00", minWidth: "240px" }}
          >
            <Network size={14} strokeWidth={2} color="#0E0F10" />
            <span className="font-bold" style={{ fontSize: "13px", color: "#0E0F10" }}>
              Detecta · Classifica · Roteia
            </span>
          </div>
        </motion.div>

        <div style={{ width: 1, height: 28, background: "#D5D2C9" }} />

        {/* Squads */}
        <motion.div
          className="flex items-start gap-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.24 }}
        >
          {squads.map((squad) => {
            const squadColor = getSquadColor(squad.slug);
            return (
              <div key={squad.id} className="flex flex-col items-center gap-0">
                <div className="mb-2 flex items-center gap-1.5">
                  <SquadDot color={squadColor} />
                  <span
                    className="text-[9px] font-bold tracking-[0.8px] uppercase"
                    style={{ color: "#A9AAA5" }}
                  >
                    {squad.name}
                  </span>
                </div>

                {squad.agents.map((agent, i) => (
                  <div key={agent.id} className="flex flex-col items-center">
                    {i > 0 && <div style={{ width: 1, height: 10, background: "#D5D2C9" }} />}
                    <div
                      className="flex items-center gap-2 rounded-[12px] px-4 py-2.5"
                      style={{ background: "#0E0F10", minWidth: "160px" }}
                    >
                      <SquadDot color={squadColor} />
                      <span className="font-semibold" style={{ fontSize: "12px", color: "#FFFFFF" }}>
                        {agent.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </motion.div>

        <div style={{ width: 1, height: 28, background: "#D5D2C9" }} />

        {/* Memória */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.38 }}
        >
          <span className="mb-1.5 text-[9px] font-bold tracking-[0.8px] uppercase" style={{ color: "#A9AAA5" }}>
            MEMÓRIA
          </span>
          <div
            className="flex items-center gap-2.5 rounded-[14px] px-5 py-3"
            style={{ background: "#D7FF00", minWidth: "260px" }}
          >
            <FileText size={14} strokeWidth={2} color="#0E0F10" />
            <span className="font-bold" style={{ fontSize: "13px", color: "#0E0F10" }}>
              Atualiza WORKING.md + MEMORY.md
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TAB 4 — SQUADS FUTUROS
// ─────────────────────────────────────────────────────────────────

// ─── Modal: Criar novo squad ──────────────────────────────────────
function NovoSquadModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (slug: string) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"ativo" | "em_breve" | "planejado" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const statusOpts = [
    { value: "ativo" as const, label: "Ativo", desc: "Disponível imediatamente" },
    { value: "em_breve" as const, label: "Em breve", desc: "Planejado para breve" },
    { value: "planejado" as const, label: "Planejado", desc: "Sem data definida" },
  ];

  function reset() { setName(""); setDescription(""); setStatus(null); setError(null); }

  function handleClose() { reset(); onClose(); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("O nome é obrigatório."); return; }
    if (!status) { setError("Selecione um status para continuar."); return; }

    setLoading(true);
    setError(null);

    const slug = name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
    const result = await createSquad({ name: name.trim(), slug, description: description.trim(), status });

    setLoading(false);

    if (result.success && result.squadSlug) {
      reset();
      onCreated(result.squadSlug);
    } else {
      setError(result.error ?? "Erro ao criar squad");
    }
  }

  const inputClass = "w-full rounded-[10px] border border-transparent px-3.5 py-2.5 text-[14px] outline-none transition-[border-color] duration-150";
  const inputStyle = { background: "#EEEFE9", color: "#0E0F10", fontFamily: "Urbanist, sans-serif" };

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
              className="relative w-full max-w-[480px] rounded-[20px] bg-white p-7"
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
                style={{ background: "#EEEFE9", color: "#5E5E5F" }}
                whileHover={{ rotate: 90, scale: 1.1, backgroundColor: "#D5D2C9" }}
                whileTap={{ rotate: 90, scale: 0.9 }}
                transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <X size={14} strokeWidth={2.5} />
              </motion.button>

              <h2 className="mb-1 pr-8 text-[18px] font-bold" style={{ color: "#0E0F10" }}>Novo squad</h2>
              <p className="mb-5 text-[12px]" style={{ color: "#A9AAA5" }}>
                Crie um squad e comece a adicionar agentes a ele
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold tracking-[0.5px] uppercase" style={{ color: "#A9AAA5" }}>
                    Nome *
                  </label>
                  <input
                    className={inputClass} style={inputStyle}
                    value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Marketing Squad"
                    onFocus={(e) => (e.target.style.borderColor = "#0E0F10")}
                    onBlur={(e) => (e.target.style.borderColor = "transparent")}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold tracking-[0.5px] uppercase" style={{ color: "#A9AAA5" }}>
                    Descrição
                  </label>
                  <textarea
                    className={inputClass} style={{ ...inputStyle, resize: "none", minHeight: "64px" }}
                    value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="O que este squad faz?"
                    onFocus={(e) => (e.target.style.borderColor = "#0E0F10")}
                    onBlur={(e) => (e.target.style.borderColor = "transparent")}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold tracking-[0.5px] uppercase" style={{ color: "#A9AAA5" }}>
                    Status *
                  </label>
                  <div className="flex gap-2">
                    {statusOpts.map((opt) => {
                      const isSel = status === opt.value;
                      return (
                        <motion.button
                          key={opt.value}
                          type="button"
                          onClick={() => setStatus(isSel ? null : opt.value)}
                          className="flex flex-col rounded-[10px] px-3 py-2.5 text-left"
                          style={{ flex: 1 }}
                          initial={false}
                          animate={{ backgroundColor: isSel ? "#0E0F10" : "#EEEFE9", color: isSel ? "#FFFFFF" : "#5E5E5F" }}
                          whileHover={!isSel ? { backgroundColor: "#D9D9D4" } : undefined}
                          whileTap={{ scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                        >
                          <span className="font-bold text-[12px]">{opt.label}</span>
                          <motion.span
                            className="text-[10px]"
                            animate={{ color: isSel ? "rgba(255,255,255,0.55)" : "#A9AAA5" }}
                            transition={{ duration: 0.15 }}
                          >
                            {opt.desc}
                          </motion.span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-[10px] px-3 py-2.5" style={{ background: "rgba(239,68,68,0.08)" }}>
                    <AlertCircle size={14} strokeWidth={2} color="#EF4444" />
                    <span className="text-[12px] font-semibold" style={{ color: "#EF4444" }}>{error}</span>
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="mt-1 w-full rounded-[14px] py-3 text-[14px] font-bold"
                  style={{ background: "#D7FF00", color: "#0E0F10" }}
                  whileHover={{ scale: 1.02, backgroundColor: "#DFFF33" }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                >
                  {loading ? "Criando..." : "Criar squad"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </HubiaPortal>
  );
}

const FUTURE_SQUADS_CONFIG = [
  {
    slug: "marketing-squad",
    name: "Marketing Squad",
    agents: "Copy · SEO · Ads · Analytics",
    badgeLabel: "Em breve",
    badgeBg: "#0E0F10",
    badgeColor: "#D7FF00",
  },
  {
    slug: "crm-squad",
    name: "CRM Squad",
    agents: "Gestão de clientes e leads",
    badgeLabel: "Planejado",
    badgeBg: "#EEEFE9",
    badgeColor: "#A9AAA5",
  },
  {
    slug: "social-squad",
    name: "Social Media Squad",
    agents: "Publicação · Engajamento",
    badgeLabel: "Planejado",
    badgeBg: "#EEEFE9",
    badgeColor: "#A9AAA5",
  },
];

function TabSquadsFuturos({ squads }: { squads: SquadWithAgents[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [showNovoSquad, setShowNovoSquad] = useState(false);

  return (
    <>
      <NovoSquadModal
        open={showNovoSquad}
        onClose={() => setShowNovoSquad(false)}
        onCreated={(slug) => {
          setShowNovoSquad(false);
          startTransition(() => router.push(`/agentes/squad/${slug}`));
        }}
      />

      <div className="flex flex-col gap-5">
        {/* Banner */}
        <motion.div
          className="flex items-start gap-4 rounded-[20px] p-5"
          style={{ background: "#FFFFFF", border: "1.5px dashed #D5D2C9" }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
            style={{ background: "#EEEFE9" }}
          >
            <TrendingUp size={18} strokeWidth={2} color="#5E5E5F" />
          </div>
          <div>
            <p className="font-bold" style={{ fontSize: "13px", color: "#0E0F10", letterSpacing: "0.3px" }}>
              ESCALABILIDADE DA AGÊNCIA
            </p>
            <p className="mt-1 text-[12px] leading-[1.55]" style={{ color: "#5E5E5F" }}>
              O sistema foi arquitetado para crescer. Novos squads são criados via Agente Criador de Agentes — cada
              um recebe seus próprios SOUL.md, skills e se integra automaticamente ao AGENTS.md.
            </p>
          </div>
        </motion.div>

        {/* Squads ativos */}
        <div>
          <p className="mb-3 text-[11px] font-bold tracking-[0.5px] uppercase" style={{ color: "#A9AAA5" }}>
            Squads ativos
          </p>
          <div className="grid grid-cols-3 gap-4">
            {squads.map((squad, i) => {
              const squadColor = getSquadColor(squad.slug);
              return (
                <motion.button
                  key={squad.slug}
                  type="button"
                  onClick={() => router.push(`/agentes/squad/${squad.slug}`)}
                  className="flex flex-col justify-between rounded-[20px] p-5 text-left"
                  style={{ background: "#0E0F10", minHeight: "110px" }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: i * 0.06 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <SquadDot color={squadColor} />
                      <h3 className="font-bold leading-tight" style={{ fontSize: "16px", color: squadColor }}>
                        {squad.name}
                      </h3>
                    </div>
                    <span
                      className="mt-0.5 shrink-0 rounded-[9999px] px-2.5 py-1 text-[10px] font-bold tracking-[0.4px]"
                      style={{ background: "#22c55e", color: "#FFFFFF" }}
                    >
                      Ativo
                    </span>
                  </div>
                  <p className="mt-2 text-[11px]" style={{ color: "rgba(255,255,255,0.50)" }}>
                    {squad.agents.length} {squad.agents.length === 1 ? "agente" : "agentes"}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Próximos squads */}
        <div>
          <p className="mb-3 text-[11px] font-bold tracking-[0.5px] uppercase" style={{ color: "#A9AAA5" }}>
            Próximos squads
          </p>
          <div className="grid grid-cols-3 gap-4">
            {FUTURE_SQUADS_CONFIG.map((squad, i) => (
              <motion.button
                key={squad.slug}
                type="button"
                onClick={() => router.push(`/agentes/squad/${squad.slug}`)}
                className="flex flex-col justify-between rounded-[20px] p-5 text-left"
                style={{ background: "#FFFFFF", minHeight: "110px", border: "1.5px solid #EEEFE9" }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.1 + i * 0.06 }}
                whileHover={{ y: -4, borderColor: "#D5D2C9" }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold leading-tight" style={{ fontSize: "16px", color: "#0E0F10" }}>
                    {squad.name}
                  </h3>
                  <span
                    className="mt-0.5 shrink-0 rounded-[9999px] px-2.5 py-1 text-[10px] font-bold tracking-[0.4px]"
                    style={{ background: squad.badgeBg, color: squad.badgeColor }}
                  >
                    {squad.badgeLabel}
                  </span>
                </div>
                <p className="mt-2 text-[11px]" style={{ color: "#A9AAA5" }}>
                  {squad.agents}
                </p>
              </motion.button>
            ))}

            {/* Criar novo squad — agora funcional */}
            <motion.button
              type="button"
              onClick={() => setShowNovoSquad(true)}
              className="flex flex-col items-center justify-center gap-2 rounded-[20px]"
              style={{ minHeight: "110px", border: "1.5px dashed #D5D2C9", background: "transparent" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.28 }}
              whileHover={{ borderColor: "#A9AAA5", backgroundColor: "rgba(213,210,201,0.12)" }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.span
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: "#EEEFE9" }}
                whileHover={{ scale: 1.15, backgroundColor: "#D5D2C9" }}
                transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <Plus size={16} strokeWidth={2.5} color="#5E5E5F" />
              </motion.span>
              <span className="text-[10px] font-bold tracking-[0.5px] uppercase" style={{ color: "#A9AAA5" }}>
                Criar novo squad
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Tabs de navegação ────────────────────────────────────────────
const MAIN_TABS = [
  { id: "squads", label: "SQUADS", icon: Users, iconClass: "icon-pulse" },
  { id: "skills", label: "SKILLS REGISTRY", icon: Sparkles, iconClass: "icon-spark" },
  { id: "fluxo", label: "FLUXO DO ORQUESTRADOR", icon: Network, iconClass: "icon-nod" },
  { id: "futuros", label: "SQUADS FUTUROS", icon: Activity, iconClass: "icon-grow" },
];

// ─────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────
export function AgentesClient({
  squads,
  skillsBySquad,
}: {
  squads: SquadWithAgents[];
  skillsBySquad: SkillsBySquad[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("squads");
  const [filterSlug, setFilterSlug] = useState<string | null>(null);
  const [showNovoAgente, setShowNovoAgente] = useState(false);

  const filterOptions = [
    { id: "todos", label: "TODOS" },
    ...squads.map((s) => ({ id: s.slug, label: s.name.toUpperCase().replace(" SQUAD", "") })),
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#0E0F10" }}>Agentes</h1>

        <div className="flex items-center gap-3">
          {/* Filtros pill */}
          <div
            className="inline-flex items-center rounded-[20px] p-1"
            style={{ background: "#FFFFFF" }}
          >
            {filterOptions.map((opt) => {
              const isActive = opt.id === "todos" ? filterSlug === null : filterSlug === opt.id;
              return (
                <motion.button
                  key={opt.id}
                  type="button"
                  onClick={() => setFilterSlug(opt.id === "todos" ? null : opt.id)}
                  className="relative rounded-[9999px] px-4 py-1.5 text-[12px] font-semibold"
                  style={{ color: isActive ? "#0E0F10" : "#A9AAA5" }}
                  initial="rest"
                  whileHover={!isActive ? "hovered" : "rest"}
                  whileTap={{ scale: 0.97 }}
                  animate="rest"
                  variants={{
                    rest: { backgroundColor: isActive ? "#D7FF00" : "transparent" },
                    hovered: { backgroundColor: "rgba(213,210,201,0.35)", color: "#0E0F10" },
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
            onClick={() => setShowNovoAgente(true)}
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

      {/* Tabs */}
      <SlidingTabs tabs={MAIN_TABS} activeId={activeTab} onChange={setActiveTab} />

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
            <TabFluxo squads={squads} />
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
            <TabSquadsFuturos squads={squads} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Novo Agente */}
      <NovoAgenteModal
        open={showNovoAgente}
        squads={squads}
        onClose={() => setShowNovoAgente(false)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
