"use client";

import { useState } from "react";
import {
  Brain,
  Clock,
  FileText,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Zap,
  History,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { MemoryFile } from "./actions";

const FILE_ICONS: Record<string, LucideIcon> = {
  working: Zap,
  memory: Brain,
  status: History,
  lessons: AlertTriangle,
};

const FILE_COLORS: Record<string, string> = {
  working: "var(--hubia-limao-500)",
  memory: "#3B82F6",
  status: "#14B8A6",
  lessons: "#F59E0B",
};

export default function MemoriaClient({
  files,
}: {
  files: MemoryFile[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>("working");

  return (
    <div className="hubia-fade-in flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1
          className="font-bold"
          style={{ fontSize: "28px", color: "var(--hubia-ink-500)" }}
        >
          Memória
        </h1>
        <span
          className="font-semibold"
          style={{ fontSize: "14px", color: "var(--hubia-bg-base-700)" }}
        >
          {files.length} arquivos de memória
        </span>
      </div>

      {/* Info banner */}
      <div
        className="flex items-start gap-3 rounded-2xl border px-5 py-4"
        style={{
          borderColor: "#3B82F620",
          background: "#3B82F608",
        }}
      >
        <BookOpen size={18} className="mt-0.5 shrink-0" style={{ color: "#3B82F6" }} />
        <div>
          <p
            className="font-semibold"
            style={{ fontSize: "13px", color: "var(--hubia-ink-500)" }}
          >
            A memória é compartilhada entre todos os agentes. Cada agente lê
            esses arquivos antes de agir e atualiza após concluir.
          </p>
          <p
            className="mt-1 font-semibold"
            style={{ fontSize: "12px", color: "var(--hubia-bg-base-700)" }}
          >
            Fase atual: arquivos .md no repositório. Fase futura: banco de
            dados multi-tenant com busca semântica.
          </p>
        </div>
      </div>

      {/* Memory files */}
      <div className="flex flex-col gap-3">
        {files.map((file) => {
          const isExpanded = expandedId === file.id;
          const Icon = FILE_ICONS[file.id] || FileText;
          const color = FILE_COLORS[file.id] || "var(--hubia-bg-base-700)";

          return (
            <div
              key={file.id}
              className="rounded-[30px] bg-white overflow-hidden"
            >
              {/* Header */}
              <button
                type="button"
                onClick={() =>
                  setExpandedId(isExpanded ? null : file.id)
                }
                className="flex w-full items-center gap-4 px-6 py-5 text-left"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3
                      className="font-bold"
                      style={{ fontSize: "16px", color: "var(--hubia-ink-500)" }}
                    >
                      {file.label}
                    </h3>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{
                        background: "var(--hubia-bg-base-500)",
                        color: "var(--hubia-bg-base-700)",
                        fontFamily: "monospace",
                      }}
                    >
                      {file.name}
                    </span>
                  </div>
                  <p
                    className="mt-0.5 font-semibold"
                    style={{ fontSize: "13px", color: "var(--hubia-bg-base-700)" }}
                  >
                    {file.description}
                  </p>
                </div>

                {/* Last modified */}
                {file.lastModified && (
                  <div className="hidden sm:flex items-center gap-1.5">
                    <Clock size={12} style={{ color: "#C8C9C3" }} />
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: "#C8C9C3" }}
                    >
                      {new Date(file.lastModified).toLocaleDateString(
                        "pt-BR",
                        {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                )}

                {isExpanded ? (
                  <ChevronUp size={16} style={{ color: "var(--hubia-bg-base-700)" }} />
                ) : (
                  <ChevronDown size={16} style={{ color: "var(--hubia-bg-base-700)" }} />
                )}
              </button>

              {/* Content */}
              {isExpanded && (
                <div className="border-t border-base-500 px-6 py-5">
                  <pre
                    className="max-h-[600px] overflow-y-auto whitespace-pre-wrap text-[13px] leading-relaxed"
                    style={{
                      color: "var(--hubia-ink-500)",
                      fontFamily: "inherit",
                    }}
                  >
                    {file.content}
                  </pre>

                  {/* Word count */}
                  <div className="mt-4 flex items-center gap-4">
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: "#C8C9C3" }}
                    >
                      {file.content.split(/\s+/).length} palavras
                    </span>
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: "#C8C9C3" }}
                    >
                      {file.content.length} caracteres
                    </span>
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: "#C8C9C3" }}
                    >
                      {file.content.split("\n").length} linhas
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
