"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Bot,
  User,
  AlertCircle,
  Settings,
  MessageSquare,
  Loader2,
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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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

interface AgentSkill {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface AgentData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  systemPrompt: string | null;
  status: string;
  config: Record<string, unknown>;
  skills: AgentSkill[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

type TabId = "chat" | "config";

export default function AgentDetailClient({
  agent,
  providerReady,
}: {
  agent: AgentData;
  providerReady: boolean;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("chat");
  const Icon = ICON_MAP[(agent.config.icon as string) || ""] || Bot;
  const color = (agent.config.color as string) || "var(--hubia-limao-500)";
  const level = (agent.config.level as string) || "specialist";
  const squad = (agent.config.squad as string) || "dev-squad";

  const SQUAD_LABELS: Record<string, string> = {
    orquestracao: "Orquestração",
    "dev-squad": "Dev Squad",
    "audiovisual-squad": "Audiovisual Squad",
  };

  const tabs: { id: TabId; label: string; icon: LucideIcon }[] = [
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "config", label: "Config", icon: Settings },
  ];

  return (
    <div className="hubia-fade-in flex flex-col gap-6">
      {/* Breadcrumb */}
      <Link
        href="/agentes"
        className="flex items-center gap-2 font-semibold transition-colors hover:opacity-70"
        style={{ fontSize: "13px", color: "var(--hubia-bg-base-700)" }}
      >
        <ArrowLeft size={16} />
        Agentes
      </Link>

      {/* Header */}
      <div className="flex items-start gap-5">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={32} style={{ color }} strokeWidth={2} />
        </div>
        <div className="flex flex-col gap-1">
          <h1
            className="font-bold leading-tight"
            style={{ fontSize: "28px", color: "var(--hubia-ink-500)" }}
          >
            {agent.name}
          </h1>
          <p
            className="font-semibold"
            style={{ fontSize: "14px", color: "var(--hubia-bg-base-700)" }}
          >
            {agent.description}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
              style={{
                background: level === "lead" ? "var(--hubia-ink-500)" : "var(--hubia-bg-base-500)",
                color: level === "lead" ? "var(--hubia-limao-500)" : "var(--hubia-ink-500)",
              }}
            >
              {level}
            </span>
            <span
              className="text-[11px] font-semibold"
              style={{ color: "var(--hubia-bg-base-700)" }}
            >
              {SQUAD_LABELS[squad] || squad}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-[#EEEFE9] p-1">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-all duration-200"
              style={{
                background: isActive ? "#FFFFFF" : "transparent",
                color: isActive ? "var(--hubia-ink-500)" : "var(--hubia-bg-base-700)",
                borderBottom: isActive ? "2px solid #0E0F10" : "2px solid transparent",
              }}
            >
              <TabIcon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === "chat" && (
        <ChatTab agent={agent} providerReady={providerReady} />
      )}
      {activeTab === "config" && <ConfigTab agent={agent} />}
    </div>
  );
}

// ============================================================
// Chat Tab
// ============================================================

function ChatTab({
  agent,
  providerReady,
}: {
  agent: AgentData;
  providerReady: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput("");
    setIsStreaming(true);

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(newMessages);

    // Add empty assistant message for streaming
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const response = await fetch("/api/agents/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentSlug: agent.slug,
          message: userMessage,
          history: newMessages.slice(-20), // Last 20 messages for context
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: `**Erro:** ${error.error || "Falha na execução"}`,
          };
          return updated;
        });
        setIsStreaming(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        setIsStreaming(false);
        return;
      }

      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                accumulated += parsed.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: accumulated,
                  };
                  return updated;
                });
              }
              if (parsed.error) {
                accumulated += `\n\n**Erro:** ${parsed.error}`;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: accumulated,
                  };
                  return updated;
                });
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (error) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: `**Erro de conexão:** ${error instanceof Error ? error.message : "Falha na comunicação com o servidor"}`,
        };
        return updated;
      });
    }

    setIsStreaming(false);
  }, [input, isStreaming, messages, agent.slug]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (!providerReady) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 rounded-[30px] py-16"
        style={{ background: "#FFFFFF" }}
      >
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: "#FEF2F2" }}
        >
          <AlertCircle size={28} style={{ color: "#EF4444" }} />
        </div>
        <div className="text-center">
          <p
            className="font-semibold"
            style={{ fontSize: "15px", color: "var(--hubia-ink-500)" }}
          >
            Nenhum provedor de IA configurado
          </p>
          <p
            className="mt-1 font-semibold"
            style={{ fontSize: "13px", color: "var(--hubia-bg-base-700)" }}
          >
            Adicione a chave da API (Anthropic ou OpenAI) para conversar com
            os agentes.
          </p>
        </div>
        <Link
          href="/organization/provedores"
          className="rounded-full font-bold transition-opacity hover:opacity-90"
          style={{
            background: "var(--hubia-limao-500)",
            color: "var(--hubia-ink-500)",
            fontSize: "13px",
            padding: "10px 22px",
          }}
        >
          Configurar Provedor
        </Link>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col rounded-[30px] bg-white"
      style={{ height: "calc(100vh - 320px)", minHeight: "400px" }}
    >
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <Bot size={40} style={{ color: "var(--hubia-bg-base-500)" }} />
            <p
              className="font-semibold"
              style={{ fontSize: "14px", color: "var(--hubia-bg-base-700)" }}
            >
              Envie uma mensagem para conversar com{" "}
              <strong style={{ color: "var(--hubia-ink-500)" }}>{agent.name}</strong>
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-4 flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {/* Avatar */}
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{
                background:
                  msg.role === "user" ? "var(--hubia-ink-500)" : `${(agent.config.color as string) || "#D7FF00"}20`,
              }}
            >
              {msg.role === "user" ? (
                <User size={14} style={{ color: "#D7FF00" }} />
              ) : (
                <Bot
                  size={14}
                  style={{
                    color: (agent.config.color as string) || "#D7FF00",
                  }}
                />
              )}
            </div>

            {/* Message bubble */}
            <div
              className="max-w-[75%] rounded-2xl px-4 py-3"
              style={{
                background: msg.role === "user" ? "#0E0F10" : "#F5F5F3",
                color: msg.role === "user" ? "#FFFFFF" : "#0E0F10",
              }}
            >
              <div
                className="whitespace-pre-wrap text-[14px] leading-relaxed"
                style={{ fontFamily: "inherit" }}
              >
                {msg.content}
                {isStreaming &&
                  idx === messages.length - 1 &&
                  msg.role === "assistant" && (
                    <span className="ml-1 inline-block h-4 w-1 animate-pulse rounded-full bg-current" />
                  )}
              </div>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-[#EEEFE9] p-4">
        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Mensagem para ${agent.name}...`}
            disabled={isStreaming}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-[#EEEFE9] bg-[#F5F5F3] px-4 py-3 text-[14px] text-[#0E0F10] placeholder-[#A9AAA5] outline-none transition-colors focus:border-[#D7FF00] disabled:opacity-50"
            style={{ maxHeight: "160px" }}
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-30"
            style={{
              background: input.trim() && !isStreaming ? "#D7FF00" : "#EEEFE9",
              color: "var(--hubia-ink-500)",
            }}
          >
            {isStreaming ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
        <p
          className="mt-2 text-center font-semibold"
          style={{ fontSize: "11px", color: "#C8C9C3" }}
        >
          Shift + Enter para nova linha
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Config Tab
// ============================================================

function ConfigTab({ agent }: { agent: AgentData }) {
  return (
    <div className="flex flex-col gap-6">
      {/* System Prompt */}
      <div className="rounded-[30px] bg-white p-6">
        <h3
          className="mb-3 font-bold"
          style={{ fontSize: "15px", color: "var(--hubia-ink-500)" }}
        >
          System Prompt (SOUL)
        </h3>
        <pre
          className="max-h-[500px] overflow-y-auto whitespace-pre-wrap rounded-xl p-4 text-[13px] leading-relaxed"
          style={{
            background: "#F5F5F3",
            color: "var(--hubia-ink-500)",
            fontFamily: "inherit",
          }}
        >
          {agent.systemPrompt || "Nenhum system prompt configurado."}
        </pre>
      </div>

      {/* Skills */}
      {agent.skills.length > 0 && (
        <div className="rounded-[30px] bg-white p-6">
          <h3
            className="mb-3 font-bold"
            style={{ fontSize: "15px", color: "var(--hubia-ink-500)" }}
          >
            Skills ({agent.skills.length})
          </h3>
          <div className="flex flex-col gap-2">
            {agent.skills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ background: "#F5F5F3" }}
              >
                <div>
                  <p
                    className="font-semibold"
                    style={{ fontSize: "14px", color: "var(--hubia-ink-500)" }}
                  >
                    {skill.name}
                  </p>
                  {skill.description && (
                    <p
                      className="mt-0.5 font-semibold"
                      style={{ fontSize: "12px", color: "var(--hubia-bg-base-700)" }}
                    >
                      {skill.description}
                    </p>
                  )}
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ background: "#D7FF0020", color: "var(--hubia-ink-500)" }}
                >
                  {skill.slug}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="rounded-[30px] bg-white p-6">
        <h3
          className="mb-3 font-bold"
          style={{ fontSize: "15px", color: "var(--hubia-ink-500)" }}
        >
          Configuração
        </h3>
        <pre
          className="overflow-x-auto rounded-xl p-4 text-[13px]"
          style={{
            background: "#F5F5F3",
            color: "var(--hubia-ink-500)",
            fontFamily: "monospace",
          }}
        >
          {JSON.stringify(agent.config, null, 2)}
        </pre>
      </div>
    </div>
  );
}
