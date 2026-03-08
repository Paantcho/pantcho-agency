"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Plus, FolderKanban, X, ArrowRight } from "lucide-react";
import { HubiaPortal } from "@/components/ui/hubia-portal";
import { HubiaSelect } from "@/components/ui/hubia-select";
import { toast } from "@/components/ui/hubia-toast";
import { createProjeto } from "./actions";
import type { ProjetoCard } from "./actions";
import type { ProjetoStatus } from "@prisma/client";

const STATUS_COLORS: Record<ProjetoStatus, string> = {
  ativo: "#43A047",
  pausado: "#FB8C00",
  concluido: "#A9AAA5",
  cancelado: "#E53935",
};

const STATUS_DOT_COLORS: Record<ProjetoStatus, string> = {
  ativo: "#43A047",
  pausado: "#FB8C00",
  concluido: "#A9AAA5",
  cancelado: "#E53935",
};

const STATUS_LABELS_PT: Record<ProjetoStatus, string> = {
  ativo: "ATIVO",
  pausado: "PAUSADO",
  concluido: "CONCLUÍDO",
  cancelado: "CANCELADO",
};

const SQUAD_OPTIONS = [
  { value: "Dev Squad", label: "Dev Squad", color: "#0E0F10" },
  { value: "Audiovisual Squad", label: "Audiovisual Squad", color: "#7C6AF7" },
  { value: "Marketing", label: "Marketing", color: "#43A047" },
  { value: "Outro", label: "Outro", color: "#A9AAA5" },
];

const SQUAD_COLORS: Record<string, string> = {
  "Dev Squad": "#0E0F10",
  "Audiovisual Squad": "#7C6AF7",
  "Marketing": "#43A047",
  "Outro": "#A9AAA5",
};

const PRIORIDADE_OPTIONS = ["Alta", "Média", "Baixa"];
const DRAFT_KEY = "hubia:novo-projeto:rascunho";

export default function ProjetosClient({
  organizationId,
  initialProjetos,
}: {
  organizationId: string;
  initialProjetos: ProjetoCard[];
}) {
  const router = useRouter();
  const [projetos, setProjetos] = useState(initialProjetos);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold text-[#0E0F10]">Projetos</h1>
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
          + Novo Projeto
        </motion.button>
      </div>

      {/* Grid */}
      {projetos.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <EmptyProjectCard onClick={() => setModalOpen(true)} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projetos.map((p, i) => (
            <ProjetoCardItem
              key={p.id}
              projeto={p}
              index={i}
              onClick={() => router.push(`/projetos/${p.id}`)}
            />
          ))}
          <EmptyProjectCard onClick={() => setModalOpen(true)} />
        </div>
      )}

      {/* Modal */}
      <NovoProjetoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        organizationId={organizationId}
        onCreated={(id) => {
          setModalOpen(false);
          router.push(`/projetos/${id}`);
        }}
      />
    </div>
  );
}

function ProjetoCardItem({
  projeto: p,
  index: i,
  onClick,
}: {
  projeto: ProjetoCard;
  index: number;
  onClick: () => void;
}) {
  const meta = (p as ProjetoCard & { metadata?: Record<string, unknown> }).metadata ?? {};
  const squad = (meta.squad as string) ?? null;
  const progresso = typeof meta.progresso === "number" ? meta.progresso : null;
  const objetivo = (meta.objetivo as string) ?? p.descricao ?? null;
  const squadColor = squad ? (SQUAD_COLORS[squad] ?? "#A9AAA5") : null;

  return (
    <motion.div
      className="cursor-pointer rounded-[20px] bg-white p-6 flex flex-col gap-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: Math.min(i * 0.06, 0.3) }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Status + Squad */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: STATUS_DOT_COLORS[p.status] }}
          />
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: STATUS_COLORS[p.status] }}>
            {STATUS_LABELS_PT[p.status]}
          </span>
        </div>
        {squad && (
          <span
            className="rounded-[6px] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
            style={{ backgroundColor: `${squadColor}15`, color: squadColor as string }}
          >
            {squad.toUpperCase()}
          </span>
        )}
      </div>

      {/* Nome + objetivo */}
      <div>
        <h3 className="text-[18px] font-bold text-[#0E0F10] leading-snug">{p.nome}</h3>
        {objetivo && (
          <p className="text-[12px] text-[#A9AAA5] mt-1 line-clamp-2">{objetivo}</p>
        )}
      </div>

      {/* Barra de progresso */}
      {progresso !== null && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-[#A9AAA5]">Progresso</span>
            <span className="text-[13px] font-bold text-[#0E0F10]">{progresso}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#EEEFE9] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: progresso >= 80 ? "#D7FF00" : progresso >= 50 ? "#D7FF00" : "#D7FF00" }}
              initial={{ width: 0 }}
              animate={{ width: `${progresso}%` }}
              transition={{ duration: 0.8, ease: [0, 0, 0.2, 1], delay: i * 0.06 }}
            />
          </div>
        </div>
      )}

      {/* Rodapé */}
      <div className="flex items-center justify-between pt-3 border-t border-[#EEEFE9] mt-auto">
        <span className="text-[12px] font-semibold text-[#0E0F10]">
          {p.pedidosCount} pedido{p.pedidosCount !== 1 ? "s" : ""}
        </span>
        <span className="text-[11px] text-[#A9AAA5]">
          {new Date(p.createdAt).toLocaleDateString("pt-BR")}
        </span>
      </div>
    </motion.div>
  );
}

function EmptyProjectCard({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="rounded-[20px] border-2 border-dashed border-[#D5D2C9] p-6 flex flex-col items-center justify-center gap-2 min-h-[160px]"
      whileHover={{ borderColor: "#A9AAA5", backgroundColor: "rgba(213,210,201,0.1)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      <Plus size={20} color="#A9AAA5" />
      <span className="text-[13px] font-semibold text-[#A9AAA5]">Novo Projeto</span>
    </motion.button>
  );
}

// ─── Modal Novo Projeto ───────────────────────────────────────────────────────

function NovoProjetoModal({
  open,
  onClose,
  organizationId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  onCreated: (id: string) => void;
}) {
  const [nome, setNome] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [squad, setSquad] = useState("Dev Squad");
  const [prioridade, setPrioridade] = useState("Alta");
  const [figmaUrl, setFigmaUrl] = useState("");
  const [referencias, setReferencias] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !open) return;
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.nome) setNome(d.nome);
        if (d.objetivo) setObjetivo(d.objetivo);
        if (d.squad) setSquad(d.squad);
        if (d.prioridade) setPrioridade(d.prioridade);
        if (d.figmaUrl) setFigmaUrl(d.figmaUrl);
        if (d.referencias) setReferencias(d.referencias);
      } catch {}
    }
  }, [open]);

  const handleClose = () => {
    if (nome.trim()) {
      if (typeof window !== "undefined") {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ nome, objetivo, squad, prioridade, figmaUrl, referencias }));
        toast.info("Rascunho salvo.");
      }
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    setLoading(true);
    const result = await createProjeto(organizationId, {
      nome,
      descricao: objetivo || undefined,
      metadata: { squad, prioridade, objetivo, figmaUrl: figmaUrl || null, referencias: referencias || null, progresso: 0 },
    });
    setLoading(false);
    if (!result.ok) { toast.error(result.error); return; }
    if (typeof window !== "undefined") localStorage.removeItem(DRAFT_KEY);
    toast.success("Projeto criado! O PRD está sendo estruturado.");
    onCreated(result.id);
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
              className="w-full max-w-[540px] rounded-[20px] bg-white p-8 max-h-[92vh] overflow-y-auto"
              initial={{ scale: 0.88, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 10, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-[22px] font-bold text-[#0E0F10]">Novo Projeto</h2>
                  <p className="text-[12px] text-[#A9AAA5] mt-0.5">
                    O PRD é gerado automaticamente pelo Dev Squad antes de qualquer código
                  </p>
                </div>
                <motion.button onClick={handleClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEEFE9] mt-1 flex-shrink-0"
                  whileHover={{ rotate: 90, scale: 1.1, backgroundColor: "#0E0F10" }}
                  whileTap={{ rotate: 90, scale: 0.9 }}
                  transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}>
                  <X size={14} color="#0E0F10" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Nome do Projeto</label>
                  <input
                    autoFocus value={nome} onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Landing Page Privacy"
                    className="h-11 w-full rounded-[10px] border border-transparent bg-[#EEEFE9] px-3.5 text-[14px] text-[#0E0F10] outline-none placeholder:text-[#A9AAA5] hover:border-[#D4D5D6] focus:border-[#0E0F10] focus:shadow-[0_0_0_3px_rgba(14,15,16,0.08)] transition-[border-color,box-shadow] duration-150"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Objetivo</label>
                  <textarea
                    value={objetivo} onChange={(e) => setObjetivo(e.target.value)}
                    placeholder="O que este projeto deve fazer? Qual o problema que resolve?"
                    rows={3}
                    className="w-full rounded-[10px] border border-transparent bg-[#EEEFE9] px-3.5 py-2.5 text-[14px] text-[#0E0F10] outline-none placeholder:text-[#A9AAA5] resize-none hover:border-[#D4D5D6] focus:border-[#0E0F10] focus:shadow-[0_0_0_3px_rgba(14,15,16,0.08)] transition-[border-color,box-shadow] duration-150"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Squad</label>
                    <HubiaSelect
                      value={squad} onChange={setSquad}
                      options={SQUAD_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Prioridade</label>
                    <HubiaSelect
                      value={prioridade} onChange={setPrioridade}
                      options={PRIORIDADE_OPTIONS.map((p) => ({ value: p, label: p }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Link do Figma (Opcional)</label>
                  <input
                    value={figmaUrl} onChange={(e) => setFigmaUrl(e.target.value)}
                    placeholder="https://figma.com/file/..."
                    className="h-11 w-full rounded-[10px] border border-transparent bg-[#EEEFE9] px-3.5 text-[14px] text-[#0E0F10] outline-none placeholder:text-[#A9AAA5] hover:border-[#D4D5D6] focus:border-[#0E0F10] focus:shadow-[0_0_0_3px_rgba(14,15,16,0.08)] transition-[border-color,box-shadow] duration-150"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">Referências</label>
                  <textarea
                    value={referencias} onChange={(e) => setReferencias(e.target.value)}
                    placeholder="URLs, inspirações, exemplos..."
                    rows={3}
                    className="w-full rounded-[10px] border border-transparent bg-[#EEEFE9] px-3.5 py-2.5 text-[14px] text-[#0E0F10] outline-none placeholder:text-[#A9AAA5] resize-none hover:border-[#D4D5D6] focus:border-[#0E0F10] focus:shadow-[0_0_0_3px_rgba(14,15,16,0.08)] transition-[border-color,box-shadow] duration-150"
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <motion.button type="button" onClick={handleClose}
                    className="rounded-[18px] border border-[#EEEFE9] bg-white px-6 py-3 text-[14px] font-semibold text-[#5E5E5F]"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    Cancelar
                  </motion.button>
                  <motion.button type="submit" disabled={!nome.trim() || loading}
                    className="flex-1 flex items-center justify-center gap-2 rounded-[18px] bg-[#D7FF00] py-3 text-[14px] font-semibold text-[#0E0F10] disabled:opacity-40"
                    initial="rest" animate="rest"
                    whileHover={nome.trim() && !loading ? "hovered" : "rest"}
                    whileTap={{ scale: 0.96 }}
                    variants={{ rest: { scale: 1, backgroundColor: "#D7FF00" }, hovered: { scale: 1.02, backgroundColor: "#DFFF33" } }}>
                    <motion.span variants={{ rest: { x: 0 }, hovered: { x: 2 } }} transition={{ duration: 0.2 }}>
                      <ArrowRight size={14} />
                    </motion.span>
                    {loading ? "Criando..." : "Criar e Gerar PRD →"}
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
