"use client";

import { useState, useTransition } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { KnowledgeRow } from "./actions";
import {
  createKnowledgeEntry,
  deleteKnowledgeEntry,
  getCategories,
} from "./actions";

const CATEGORY_COLORS: Record<string, string> = {
  design: "#EC4899",
  desenvolvimento: "#3B82F6",
  motion: "#8B5CF6",
  creators: "#F97316",
  marketing: "#14B8A6",
  "negócios": "#F59E0B",
  ia: "#6366F1",
  geral: "var(--hubia-bg-base-700)",
};

function getCategoryColor(cat: string | null): string {
  return CATEGORY_COLORS[cat || "geral"] || "var(--hubia-bg-base-700)";
}

export default function ConhecimentoClient({
  entries: initialEntries,
}: {
  entries: KnowledgeRow[];
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("geral");
  const [tagsInput, setTagsInput] = useState("");

  const categories = getCategories();

  const filtered = entries.filter((e) => {
    const matchesSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.content.toLowerCase().includes(search.toLowerCase()) ||
      e.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      !categoryFilter || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  async function handleCreate() {
    if (!title.trim() || !content.trim()) return;

    startTransition(async () => {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const result = await createKnowledgeEntry({
        title,
        content,
        category,
        tags,
      });
      if (result.ok) {
        setTitle("");
        setContent("");
        setCategory("geral");
        setTagsInput("");
        setShowForm(false);
        window.location.reload();
      }
    });
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteKnowledgeEntry(id);
      if (result.ok) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
      }
    });
  }

  return (
    <div className="hubia-fade-in flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1
          className="font-bold"
          style={{ fontSize: "28px", color: "var(--hubia-ink-500)" }}
        >
          Conhecimento
        </h1>
        <div className="flex items-center gap-3">
          <span
            className="font-semibold"
            style={{ fontSize: "14px", color: "var(--hubia-bg-base-700)" }}
          >
            {entries.length} {entries.length === 1 ? "entrada" : "entradas"}
          </span>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-full font-bold transition-colors duration-200 hover:opacity-90 active:scale-95"
            style={{
              background: "var(--hubia-limao-500)",
              color: "var(--hubia-ink-500)",
              fontSize: "14px",
              padding: "10px 22px",
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            Novo Conhecimento
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-[30px] bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3
              className="font-bold"
              style={{ fontSize: "16px", color: "var(--hubia-ink-500)" }}
            >
              Adicionar Conhecimento
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg p-1.5 hover:bg-base-500"
            >
              <X size={18} style={{ color: "var(--hubia-bg-base-700)" }} />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título"
              className="rounded-xl border border-base-500 bg-sand-200 px-4 py-3 text-[14px] text-ink-500 placeholder:text-base-700 outline-none focus:border-limao-500"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Conteúdo, link, anotação, lição aprendida..."
              rows={5}
              className="resize-none rounded-xl border border-base-500 bg-sand-200 px-4 py-3 text-[14px] text-ink-500 placeholder:text-base-700 outline-none focus:border-limao-500"
            />
            <div className="flex gap-4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-1 rounded-xl border border-base-500 bg-sand-200 px-4 py-3 text-[14px] text-ink-500 outline-none focus:border-limao-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Tags (separadas por vírgula)"
                className="flex-1 rounded-xl border border-base-500 bg-sand-200 px-4 py-3 text-[14px] text-ink-500 placeholder:text-base-700 outline-none focus:border-limao-500"
              />
            </div>
            <button
              type="button"
              onClick={handleCreate}
              disabled={!title.trim() || !content.trim() || isPending}
              className="self-end rounded-full font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{
                background: "var(--hubia-limao-500)",
                color: "var(--hubia-ink-500)",
                fontSize: "13px",
                padding: "10px 22px",
              }}
            >
              {isPending ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      )}

      {/* Search + Category filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: "var(--hubia-bg-base-700)" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, conteúdo ou tag..."
            className="w-full rounded-xl border border-base-500 bg-white py-2.5 pl-10 pr-4 text-[13px] text-ink-500 placeholder:text-base-700 outline-none focus:border-limao-500"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setCategoryFilter(null)}
            className="rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors"
            style={{
              background: categoryFilter === null ? "var(--hubia-ink-500)" : "var(--hubia-bg-base-500)",
              color: categoryFilter === null ? "var(--hubia-limao-500)" : "var(--hubia-bg-base-700)",
            }}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() =>
                setCategoryFilter(categoryFilter === cat ? null : cat)
              }
              className="rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors"
              style={{
                background:
                  categoryFilter === cat
                    ? getCategoryColor(cat)
                    : "var(--hubia-bg-base-500)",
                color:
                  categoryFilter === cat ? "#FFFFFF" : "#A9AAA5",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Entries */}
      <div className="flex flex-col gap-3">
        {filtered.map((entry) => {
          const isExpanded = expandedId === entry.id;
          const color = getCategoryColor(entry.category);

          return (
            <div
              key={entry.id}
              className="rounded-[30px] bg-white"
            >
              {/* Header row */}
              <button
                type="button"
                onClick={() =>
                  setExpandedId(isExpanded ? null : entry.id)
                }
                className="flex w-full items-center gap-4 px-5 py-4 text-left"
              >
                {/* Category dot */}
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ background: color }}
                />

                <div className="flex-1 min-w-0">
                  <h3
                    className="truncate font-bold"
                    style={{ fontSize: "15px", color: "var(--hubia-ink-500)" }}
                  >
                    {entry.title}
                  </h3>
                  {!isExpanded && (
                    <p
                      className="mt-0.5 truncate font-semibold"
                      style={{ fontSize: "12px", color: "var(--hubia-bg-base-700)" }}
                    >
                      {entry.content.slice(0, 120)}
                      {entry.content.length > 120 ? "..." : ""}
                    </p>
                  )}
                </div>

                {/* Tags */}
                <div className="hidden sm:flex items-center gap-1.5">
                  {entry.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: "var(--hubia-bg-base-500)", color: "var(--hubia-bg-base-700)" }}
                    >
                      <Tag size={9} />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Category label */}
                <span
                  className="hidden sm:inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background: `${color}20`,
                    color,
                  }}
                >
                  {entry.category}
                </span>

                {isExpanded ? (
                  <ChevronUp size={16} style={{ color: "var(--hubia-bg-base-700)" }} />
                ) : (
                  <ChevronDown size={16} style={{ color: "var(--hubia-bg-base-700)" }} />
                )}
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-base-500 px-5 py-4">
                  <pre
                    className="whitespace-pre-wrap text-[13px] leading-relaxed"
                    style={{
                      color: "var(--hubia-ink-500)",
                      fontFamily: "inherit",
                    }}
                  >
                    {entry.content}
                  </pre>

                  {/* Tags in expanded view */}
                  {entry.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                          style={{
                            background: "var(--hubia-bg-base-500)",
                            color: "var(--hubia-ink-500)",
                          }}
                        >
                          <Tag size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: "#C8C9C3" }}
                    >
                      Criado em{" "}
                      {new Date(entry.createdAt).toLocaleDateString(
                        "pt-BR"
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(entry.id);
                      }}
                      disabled={isPending}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors hover:bg-red-50"
                      style={{ color: "#EF4444" }}
                    >
                      <Trash2 size={13} />
                      Excluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div
          className="flex flex-col items-center justify-center gap-4 rounded-[30px] py-16"
          style={{ background: "#FFFFFF" }}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: "var(--hubia-bg-base-500)" }}
          >
            <BookOpen size={28} style={{ color: "var(--hubia-bg-base-700)" }} />
          </div>
          <p
            className="font-semibold"
            style={{ fontSize: "15px", color: "var(--hubia-bg-base-700)" }}
          >
            {entries.length === 0
              ? "Nenhum conhecimento cadastrado."
              : "Nenhum resultado para esta busca."}
          </p>
          {entries.length === 0 && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="rounded-full font-bold transition-opacity hover:opacity-90"
              style={{
                background: "var(--hubia-limao-500)",
                color: "var(--hubia-ink-500)",
                fontSize: "13px",
                padding: "10px 22px",
              }}
            >
              Adicionar primeiro conhecimento
            </button>
          )}
        </div>
      )}
    </div>
  );
}
