"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, BookOpen, X, Bot, Trash2, Link, FileText, File, Image } from "lucide-react";
import { HubiaPortal } from "@/components/ui/hubia-portal";
import { HubiaSelect } from "@/components/ui/hubia-select";
import { toast } from "@/components/ui/hubia-toast";
import { getKnowledgeEntries, createKnowledgeEntry, deleteKnowledgeEntry, getCategorias } from "./actions";
import type { KnowledgeCard } from "./actions";
import type { KnowledgeSourceType } from "@prisma/client";

// Cores por categoria — espelham o protótipo
const CATEGORIA_COLORS: Record<string, { bg: string; text: string }> = {
  "ai image": { bg: "#7C6AF720", text: "#7C6AF7" },
  "prompting": { bg: "#FB8C0020", text: "#FB8C00" },
  "frontend": { bg: "#0288D120", text: "#0288D1" },
  "consistência": { bg: "#43A04720", text: "#43A047" },
  "next.js": { bg: "#0E0F1015", text: "#0E0F10" },
  "creator": { bg: "#F48FB120", text: "#F48FB1" },
  "imagem": { bg: "#7C6AF720", text: "#7C6AF7" },
  "vídeo": { bg: "#E5393520", text: "#E53935" },
  "prompt": { bg: "#FB8C0020", text: "#FB8C00" },
  "referência": { bg: "#0288D120", text: "#0288D1" },
  "workflow": { bg: "#43A04720", text: "#43A047" },
  "aprendizado": { bg: "#FF8F0020", text: "#FF8F00" },
};

function getCategoriaStyle(cat: string | null): { bg: string; text: string } {
  if (!cat) return { bg: "#EEEFE9", text: "#5E5E5F" };
  const key = cat.toLowerCase();
  return CATEGORIA_COLORS[key] ?? { bg: "#EEEFE9", text: "#5E5E5F" };
}

const SOURCE_ICONS: Record<KnowledgeSourceType, React.ReactNode> = {
  pdf: <FileText size={13} />,
  md: <File size={13} />,
  imagem: <Image size={13} />,
  link: <Link size={13} />,
  texto: <FileText size={13} />,
};

const CATEGORIAS_PADRAO = ["ai image", "prompting", "frontend", "consistência", "next.js", "creator", "imagem", "vídeo", "workflow", "referência"];
const DRAFT_KEY = "hubia:nova-entrada-conhecimento:rascunho";

export default function ConhecimentoClient({
  organizationId,
  initialEntradas,
  initialCategorias,
}: {
  organizationId: string;
  initialEntradas: KnowledgeCard[];
  initialCategorias: string[];
}) {
  const [entradas, setEntradas] = useState(initialEntradas);
  const [categorias] = useState([...new Set([...CATEGORIAS_PADRAO, ...initialCategorias])]);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas");
  const [modalOpen, setModalOpen] = useState(false);
  const [detailEntry, setDetailEntry] = useState<KnowledgeCard | null>(null);

  const filtered = entradas.filter((e) =>
    categoriaFiltro === "todas" || e.category?.toLowerCase() === categoriaFiltro.toLowerCase()
  );

  const handleDelete = async (id: string) => {
    const result = await deleteKnowledgeEntry(organizationId, id);
    if (!result.ok) { toast.error(result.error ?? "Erro"); return; }
    setEntradas((prev) => prev.filter((e) => e.id !== id));
    setDetailEntry(null);
    toast.success("Entrada removida.");
  };

  // Pill de categorias
  const allCats = ["todas", ...categorias];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold text-[#0E0F10]">Conhecimento</h1>
        <motion.button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-[18px] bg-[#D7FF00] px-4 py-3 text-[15px] font-semibold text-[#0E0F10]"
          initial="rest" animate="rest" whileHover="hovered" whileTap={{ scale: 0.96 }}
          variants={{ rest: { scale: 1, backgroundColor: "#D7FF00" }, hovered: { scale: 1.03, backgroundColor: "#DFFF33" } }}
          transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <motion.span variants={{ rest: { scale: 1 }, hovered: { scale: 1.2 } }} transition={{ duration: 0.25 }}>
            <Plus size={16} />
          </motion.span>
          + Novo Artigo
        </motion.button>
      </div>

      {/* Filtros de categoria */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {allCats.map((cat) => {
          const isActive = categoriaFiltro === cat;
          const style = cat !== "todas" ? getCategoriaStyle(cat) : null;
          return (
            <motion.button
              key={cat}
              onClick={() => setCategoriaFiltro(cat)}
              className="rounded-[9999px] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-none"
              animate={{
                backgroundColor: isActive
                  ? (style ? style.bg : "#0E0F10")
                  : "rgba(255,255,255,0.8)",
                color: isActive
                  ? (style ? style.text : "#0E0F10")
                  : "#A9AAA5",
              }}
              initial={false}
              whileHover={!isActive ? { backgroundColor: "rgba(213,210,201,0.3)", color: "#0E0F10" } : {}}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15 }}
            >
              {cat}
            </motion.button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <motion.div
          className="flex flex-col items-center gap-4 rounded-[20px] bg-white py-20"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        >
          <BookOpen size={24} color="#A9AAA5" />
          <p className="text-[14px] text-[#A9AAA5]">
            {categoriaFiltro !== "todas" ? `Nenhum artigo em "${categoriaFiltro}".` : "Biblioteca vazia."}
          </p>
          <motion.button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-[18px] bg-[#D7FF00] px-4 py-3 text-[14px] font-semibold text-[#0E0F10]"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
          >
            <Plus size={14} /> Adicionar primeiro artigo
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e, i) => (
            <KnowledgeCardItem key={e.id} entry={e} index={i} onClick={() => setDetailEntry(e)} />
          ))}
          {/* Card de adicionar */}
          <motion.button
            onClick={() => setModalOpen(true)}
            className="rounded-[20px] border-2 border-dashed border-[#D5D2C9] p-6 flex flex-col items-center justify-center gap-2 min-h-[160px]"
            whileHover={{ borderColor: "#A9AAA5", backgroundColor: "rgba(213,210,201,0.1)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            <Plus size={18} color="#A9AAA5" />
            <span className="text-[12px] font-semibold text-[#A9AAA5]">Adicionar Artigo</span>
          </motion.button>
        </div>
      )}

      {/* Modal */}
      <NovaEntradaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        organizationId={organizationId}
        categorias={categorias}
        onCreated={async () => {
          setModalOpen(false);
          const data = await getKnowledgeEntries(organizationId);
          setEntradas(data);
        }}
      />

      {/* Drawer */}
      <EntradaDrawer entry={detailEntry} onClose={() => setDetailEntry(null)} onDelete={handleDelete} />
    </div>
  );
}

// ─── Card ───────────────────────────────────────────────────────────────────

function KnowledgeCardItem({ entry: e, index: i, onClick }: { entry: KnowledgeCard; index: number; onClick: () => void }) {
  const catStyle = getCategoriaStyle(e.category);

  return (
    <motion.div
      className="cursor-pointer rounded-[20px] bg-white p-5 flex flex-col gap-3"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: Math.min(i * 0.06, 0.3) }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Tags de categoria */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {e.category && (
          <span
            className="rounded-[5px] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ backgroundColor: catStyle.bg, color: catStyle.text }}
          >
            {e.category}
          </span>
        )}
        {e.aiProcessed && (
          <span className="flex items-center gap-0.5 rounded-[5px] bg-[#D7FF00]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#0E0F10] uppercase">
            <Bot size={9} /> IA
          </span>
        )}
      </div>

      {/* Título */}
      <h3 className="text-[15px] font-bold text-[#0E0F10] leading-snug">{e.title}</h3>

      {/* Resumo */}
      {e.summary && (
        <p className="text-[12px] text-[#A9AAA5] line-clamp-2">{e.summary}</p>
      )}

      {/* Rodapé */}
      <div className="flex items-center justify-between pt-2 border-t border-[#EEEFE9] mt-auto">
        <span className="text-[11px] text-[#A9AAA5]">
          {new Date(e.createdAt).toLocaleDateString("pt-BR", { year: "numeric", month: "2-digit", day: "2-digit" })}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-[#A9AAA5]">
          {SOURCE_ICONS[e.sourceType]}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Modal nova entrada ──────────────────────────────────────────────────────

function NovaEntradaModal({ open, onClose, organizationId, categorias, onCreated }: {
  open: boolean; onClose: () => void; organizationId: string;
  categorias: string[]; onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [sourceType, setSourceType] = useState<KnowledgeSourceType>("texto");
  const [sourceUrl, setSourceUrl] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !open) return;
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try { const d = JSON.parse(saved); if (d.title) setTitle(d.title); if (d.content) setContent(d.content); if (d.category) setCategory(d.category); } catch {}
    }
  }, [open]);

  const handleClose = () => {
    if (title.trim() && typeof window !== "undefined") {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, content, category, sourceType }));
      toast.info("Rascunho salvo.");
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    const result = await createKnowledgeEntry(organizationId, {
      title, content, category: category || undefined,
      sourceType, sourceUrl: sourceUrl || undefined,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    setLoading(false);
    if (!result.ok) { toast.error(result.error); return; }
    if (typeof window !== "undefined") localStorage.removeItem(DRAFT_KEY);
    toast.success("Artigo adicionado!");
    onCreated();
  };

  return (
    <HubiaPortal>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            initial={{ backgroundColor: "rgba(14,15,16,0)", backdropFilter: "blur(0px)" }}
            animate={{ backgroundColor: "rgba(14,15,16,0.70)", backdropFilter: "blur(12px)" }}
            exit={{ backgroundColor: "rgba(14,15,16,0)", backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
            onClick={(e) => e.target === e.currentTarget && handleClose()}
          >
            <motion.div
              className="w-full max-w-[520px] rounded-[20px] bg-white p-7 max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.88, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 10, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[20px] font-bold text-[#0E0F10]">Novo Artigo</h2>
                <motion.button onClick={handleClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0E0F10]"
                  whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ rotate: 90, scale: 0.9 }}
                  transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}>
                  <X size={14} color="#D7FF00" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Título *</label>
                  <input
                    autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Cinematic Still — Técnica Completa"
                    className="h-11 w-full rounded-[10px] border border-transparent bg-[#EEEFE9] px-3.5 text-[14px] text-[#0E0F10] outline-none placeholder:text-[#A9AAA5] hover:border-[#D4D5D6] focus:border-[#0E0F10] focus:shadow-[0_0_0_3px_rgba(14,15,16,0.08)] transition-[border-color,box-shadow] duration-150"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Categoria</label>
                    <HubiaSelect
                      value={category} onChange={setCategory} placeholder="Selecionar..."
                      options={[{ value: "", label: "Sem categoria" }, ...categorias.map((c) => ({ value: c, label: c }))]}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Tipo</label>
                    <HubiaSelect
                      value={sourceType} onChange={(v) => setSourceType(v as KnowledgeSourceType)}
                      options={[
                        { value: "texto", label: "Texto" }, { value: "link", label: "Link" },
                        { value: "pdf", label: "PDF" }, { value: "md", label: "Markdown" }, { value: "imagem", label: "Imagem" },
                      ]}
                    />
                  </div>
                </div>

                {sourceType === "link" && (
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">URL</label>
                    <input
                      value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)}
                      placeholder="https://..."
                      className="h-11 w-full rounded-[10px] border border-transparent bg-[#EEEFE9] px-3.5 text-[14px] text-[#0E0F10] outline-none placeholder:text-[#A9AAA5] hover:border-[#D4D5D6] focus:border-[#0E0F10] focus:shadow-[0_0_0_3px_rgba(14,15,16,0.08)] transition-[border-color,box-shadow] duration-150"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Conteúdo *</label>
                  <textarea
                    value={content} onChange={(e) => setContent(e.target.value)}
                    placeholder="Cole o conteúdo, descreva o que este material contém..."
                    rows={4}
                    className="w-full rounded-[10px] border border-transparent bg-[#EEEFE9] px-3.5 py-2.5 text-[14px] text-[#0E0F10] outline-none placeholder:text-[#A9AAA5] resize-none hover:border-[#D4D5D6] focus:border-[#0E0F10] focus:shadow-[0_0_0_3px_rgba(14,15,16,0.08)] transition-[border-color,box-shadow] duration-150"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Tags</label>
                  <input
                    value={tags} onChange={(e) => setTags(e.target.value)}
                    placeholder="prompt, ninaah, outdoor (separar por vírgula)"
                    className="h-11 w-full rounded-[10px] border border-transparent bg-[#EEEFE9] px-3.5 text-[14px] text-[#0E0F10] outline-none placeholder:text-[#A9AAA5] hover:border-[#D4D5D6] focus:border-[#0E0F10] focus:shadow-[0_0_0_3px_rgba(14,15,16,0.08)] transition-[border-color,box-shadow] duration-150"
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <motion.button type="button" onClick={handleClose}
                    className="rounded-[18px] border border-[#EEEFE9] bg-white px-6 py-3 text-[14px] font-semibold text-[#5E5E5F]"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>Cancelar</motion.button>
                  <motion.button type="submit" disabled={!title.trim() || !content.trim() || loading}
                    className="flex-1 rounded-[18px] bg-[#D7FF00] py-3 text-[14px] font-semibold text-[#0E0F10] disabled:opacity-40"
                    initial="rest" animate="rest"
                    whileHover={(title.trim() && content.trim() && !loading) ? "hovered" : "rest"}
                    whileTap={{ scale: 0.96 }}
                    variants={{ rest: { scale: 1, backgroundColor: "#D7FF00" }, hovered: { scale: 1.02, backgroundColor: "#DFFF33" } }}>
                    {loading ? "Salvando..." : "Adicionar artigo"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </HubiaPortal>
  );
}

// ─── Drawer detalhe ──────────────────────────────────────────────────────────

function EntradaDrawer({ entry, onClose, onDelete }: {
  entry: KnowledgeCard | null; onClose: () => void; onDelete: (id: string) => void;
}) {
  const catStyle = entry ? getCategoriaStyle(entry.category) : null;

  return (
    <AnimatePresence>
      {entry && (
        <>
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ backgroundColor: "rgba(14,15,16,0.25)" }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 bottom-0 z-50 flex w-[380px] flex-col bg-white"
            style={{ borderRadius: "20px 0 0 20px" }}
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          >
            <div className="flex items-center justify-between border-b border-[#EEEFE9] p-5">
              <div className="flex flex-wrap gap-1.5">
                {entry.category && (
                  <span
                    className="rounded-[5px] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{ backgroundColor: catStyle!.bg, color: catStyle!.text }}
                  >
                    {entry.category}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <motion.button onClick={() => onDelete(entry.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEEFE9]"
                  whileHover={{ scale: 1.1, backgroundColor: "#FEE2E2" }} whileTap={{ scale: 0.9 }}>
                  <Trash2 size={13} color="#E53935" />
                </motion.button>
                <motion.button onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEEFE9]"
                  whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}>
                  <X size={14} color="#0E0F10" />
                </motion.button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              <h2 className="text-[18px] font-bold text-[#0E0F10] leading-snug">{entry.title}</h2>
              {entry.summary && (
                <p className="text-[13px] text-[#5E5E5F] leading-relaxed">{entry.summary}</p>
              )}
              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {entry.tags.map((t) => (
                    <span key={t} className="rounded-[9999px] bg-[#EEEFE9] px-2.5 py-0.5 text-[11px] font-semibold text-[#5E5E5F]">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
              {entry.sourceUrl && (
                <a href={entry.sourceUrl} target="_blank" rel="noreferrer"
                  className="text-[12px] text-[#0E0F10] underline break-all">
                  {entry.sourceUrl}
                </a>
              )}
              <p className="text-[12px] text-[#A9AAA5]">
                {new Date(entry.createdAt).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
