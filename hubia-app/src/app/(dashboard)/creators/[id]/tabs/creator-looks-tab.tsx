"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { HubiaModal } from "@/components/ui/hubia-modal";
import { HubiaConfirmModal } from "@/components/ui/hubia-confirm-modal";
import type { CreatorDetail } from "../../actions";
import { createLook, updateLook, deleteLook } from "../../actions";

const LOOK_FILTERS = ["TODOS", "ELEGANTE", "DESCOLADO", "PISCINA", "QUARTO"] as const;

const MOCK_LOOKS = [
  { id: "mock-1", name: "Elegante Sala", thumbnailUrl: null as string | null, date: "26/02", pedido: 67 },
  { id: "mock-2", name: "Moderna Cocina", thumbnailUrl: null as string | null, date: "25/02", pedido: 66 },
  { id: "mock-3", name: "Clásica Habitación", thumbnailUrl: null as string | null, date: "24/02", pedido: 65 },
  { id: "mock-4", name: "Sofisticada Oficina", thumbnailUrl: null as string | null, date: "23/02", pedido: 64 },
  { id: "mock-5", name: "Piscina Verão", thumbnailUrl: null as string | null, date: "22/02", pedido: 63 },
  { id: "mock-6", name: "Quarto Minimalista", thumbnailUrl: null as string | null, date: "21/02", pedido: 62 },
];

const inputClass =
  "w-full rounded-input border-0 bg-[var(--hubia-bg-base-500)] px-4 py-3 text-body-md font-medium text-ink-500 outline-none focus:ring-2 focus:ring-limao-500/30";

export default function CreatorLooksTab({
  creator,
  organizationId,
}: {
  creator: CreatorDetail;
  organizationId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [lookFilter, setLookFilter] = useState<(typeof LOOK_FILTERS)[number]>("TODOS");
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [deleteModalLookId, setDeleteModalLookId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  function resetForm() {
    setName("");
    setDescription("");
    setPrompt("");
    setThumbnailUrl("");
    setEditingId(null);
    setShowFormModal(false);
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setLoading(true);
    if (editingId) {
      const result = await updateLook(
        organizationId,
        creator.id,
        editingId,
        { name, description: description || null, prompt, thumbnailUrl: thumbnailUrl || null }
      );
      if (result.ok) {
        resetForm();
        router.refresh();
      } else setFormError(result.error ?? "Erro ao salvar.");
    } else {
      const result = await createLook(organizationId, creator.id, {
        name,
        description: description || null,
        prompt,
        thumbnailUrl: thumbnailUrl || null,
      });
      if (result.ok) {
        resetForm();
        router.refresh();
      } else setFormError(result.error ?? "Erro ao criar.");
    }
    setLoading(false);
  }

  async function handleConfirmDelete() {
    if (!deleteModalLookId) return;
    setDeleteError(null);
    setLoading(true);
    const result = await deleteLook(organizationId, creator.id, deleteModalLookId);
    setLoading(false);
    if (result.ok) {
      setDeleteModalLookId(null);
    } else {
      setDeleteError(result.error ?? "Erro ao excluir.");
    }
  }

  function openAddModal() {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrompt("");
    setThumbnailUrl("");
    setFormError(null);
    setShowFormModal(true);
  }

  function startEdit(look: (typeof creator.looks)[0]) {
    setEditingId(look.id);
    setName(look.name);
    setDescription(look.description ?? "");
    setPrompt(look.prompt);
    setThumbnailUrl(look.thumbnailUrl ?? "");
    setFormError(null);
    setShowFormModal(true);
  }

  const looks = creator.looks;
  type DisplayLook = { id: string; name: string; thumbnailUrl: string | null; isMock: boolean; date: string; pedido: number };
  const displayLooks: DisplayLook[] = [
    ...looks.map((l, i) => ({ id: l.id, name: l.name, thumbnailUrl: l.thumbnailUrl, isMock: false, date: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), pedido: i + 67 })),
    ...MOCK_LOOKS.map((m) => ({ id: m.id, name: m.name, thumbnailUrl: m.thumbnailUrl, isMock: true, date: m.date, pedido: m.pedido })),
  ];

  function toggleFavorite(id: string) {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-heading-sm text-ink-500">Look Library</h2>

      {/* Filtros: TODOS, ELEGANTE, DESCOLADO, PISCINA, QUARTO */}
      <div className="inline-flex flex-wrap items-center gap-2">
        {LOOK_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setLookFilter(f)}
            style={
              lookFilter === f
                ? { background: "#D7FF00", color: "#0E0F10", borderColor: "#D7FF00" }
                : { background: "#FFFFFF", color: "#0E0F10", borderColor: "#D9D9D4" }
            }
            className="motion-soft rounded-[18px] border px-4 py-2 text-[13px] font-semibold transition-colors duration-150"
          >
            {f}
          </button>
        ))}
      </div>

      {displayLooks.length === 0 ? (
        <div className="rounded-[16px] border border-dashed border-base-600 bg-base-500/30 py-12 text-center">
          <p className="font-medium text-base-700" style={{ fontSize: "14px" }}>Nenhum look cadastrado.</p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-4 rounded-[18px] px-4 py-2 text-[13px] font-semibold text-ink-500"
            style={{ background: "#D7FF00" }}
          >
            Adicionar look
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {displayLooks.map((look) => (
            <div key={look.id} className="flex flex-col">
              {/* Card fullbleed — foto ocupa 100% */}
              <div
                className="group relative overflow-hidden"
                style={{ borderRadius: "16px", aspectRatio: "3/4" }}
              >
                {/* Estrela favorito — canto superior esquerdo */}
                <button
                  type="button"
                  onClick={() => toggleFavorite(look.id)}
                  className="absolute left-3 top-3 z-10 rounded-full p-1 text-white/80 transition-colors hover:text-limao-500"
                  aria-label={favoriteIds.has(look.id) ? "Remover favorito" : "Favoritar"}
                >
                  <Star
                    size={18}
                    className={favoriteIds.has(look.id) ? "fill-[#D7FF00] text-[#D7FF00]" : "fill-transparent"}
                  />
                </button>

                {/* Imagem de fundo */}
                <div className="absolute inset-0 bg-[#1a1a1a]">
                  {look.thumbnailUrl ? (
                    <img
                      src={look.thumbnailUrl}
                      alt={look.name}
                      className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                  ) : creator.avatarUrl ? (
                    <img
                      src={creator.avatarUrl}
                      alt={look.name}
                      className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="font-bold text-white/20" style={{ fontSize: "32px" }}>
                        {look.name.slice(0, 2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Gradiente overlay + texto */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0E0F10]/95 via-[#0E0F10]/50 to-transparent p-3 pt-12">
                  <p
                    className="font-bold leading-tight"
                    style={{ fontSize: "15px", color: "#D7FF00" }}
                  >
                    {look.name}
                  </p>
                  <p
                    className="mt-0.5 font-medium"
                    style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)" }}
                  >
                    {look.date} · Pedido #{look.pedido}
                  </p>
                </div>
              </div>

              {/* Botões de editar/excluir — apenas looks reais */}
              {!look.isMock && (
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(creator.looks.find((l) => l.id === look.id)!)}
                    className="rounded-[10px] border border-base-600 px-3 py-1.5 text-[11px] font-semibold text-ink-500 transition-colors hover:bg-base-600/30"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteModalLookId(look.id)}
                    className="rounded-[10px] border border-red-400/40 px-3 py-1.5 text-[11px] font-semibold text-red-500 transition-colors hover:bg-red-500/10"
                  >
                    Excluir
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <HubiaModal
        open={showFormModal}
        onClose={resetForm}
        title={editingId ? "Editar look" : "Novo look"}
        maxWidth="min(90vw, 480px)"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && (
            <div className="rounded-card border border-red-500/30 bg-red-500/10 px-4 py-3 text-body-sm font-medium text-red-600">
              {formError}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-semibold text-ink-500">Nome *</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-semibold text-ink-500">Descrição</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-semibold text-ink-500">Prompt</label>
            <textarea rows={2} value={prompt} onChange={(e) => setPrompt(e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-semibold text-ink-500">URL thumbnail</label>
            <input type="url" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} className={inputClass} />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-button bg-limao-500 px-4 py-2 text-label-sm font-semibold text-ink-500 hover:bg-limao-400 disabled:opacity-50"
            >
              {loading ? "Salvando…" : editingId ? "Salvar" : "Criar"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-button border-0 bg-[var(--hubia-bg-base-500)] px-4 py-2 text-label-sm font-semibold text-ink-500 hover:opacity-90"
            >
              Cancelar
            </button>
          </div>
        </form>
      </HubiaModal>

      <HubiaConfirmModal
        open={deleteModalLookId !== null}
        onClose={() => { setDeleteModalLookId(null); setDeleteError(null); }}
        title="Excluir look"
        message="Tem certeza que deseja excluir este look? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        loading={loading}
        error={deleteError}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
