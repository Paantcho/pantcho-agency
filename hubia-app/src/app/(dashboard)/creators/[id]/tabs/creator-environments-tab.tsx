"use client";

import { useState } from "react";
import { HubiaModal } from "@/components/ui/hubia-modal";
import { HubiaConfirmModal } from "@/components/ui/hubia-confirm-modal";
import type { CreatorDetail } from "../../actions";
import {
  createEnvironment,
  updateEnvironment,
  deleteEnvironment,
} from "../../actions";

export default function CreatorEnvironmentsTab({
  creator,
  organizationId,
}: {
  creator: CreatorDetail;
  organizationId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [deleteModalEnvId, setDeleteModalEnvId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  function resetForm() {
    setName("");
    setDescription("");
    setPrompt("");
    setThumbnailUrl("");
    setEditingId(null);
    setShowForm(false);
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setLoading(true);
    if (editingId) {
      const result = await updateEnvironment(
        organizationId,
        creator.id,
        editingId,
        { name, description: description || null, prompt, thumbnailUrl: thumbnailUrl || null }
      );
      if (result.ok) resetForm();
      else setFormError(result.error ?? "Erro ao salvar.");
    } else {
      const result = await createEnvironment(organizationId, creator.id, {
        name,
        description: description || null,
        prompt,
        thumbnailUrl: thumbnailUrl || null,
      });
      if (result.ok) resetForm();
      else setFormError(result.error ?? "Erro ao criar.");
    }
    setLoading(false);
  }

  async function handleConfirmDelete() {
    if (!deleteModalEnvId) return;
    setDeleteError(null);
    setLoading(true);
    const result = await deleteEnvironment(organizationId, creator.id, deleteModalEnvId);
    setLoading(false);
    if (result.ok) {
      setDeleteModalEnvId(null);
    } else {
      setDeleteError(result.error ?? "Erro ao excluir.");
    }
  }

  function startEdit(env: (typeof creator.environments)[0]) {
    setEditingId(env.id);
    setName(env.name);
    setDescription(env.description ?? "");
    setPrompt(env.prompt);
    setThumbnailUrl(env.thumbnailUrl ?? "");
    setShowForm(true);
  }

  const environments = creator.environments;

  return (
    <div className="flex flex-col gap-6">
      {/* Banner escuro — casa, descrição geral */}
      <div className="flex gap-4 rounded-card bg-ink-500 p-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-400 text-white">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <div>
          <p className="text-body-md font-bold text-white">
            CASA DE CONDOMÍNIO FECHADO. 2 PAVIMENTOS, SC. RIQUEZA IMPLÍCITA, CONTEMPORÂNEA, BOM GOSTO. CÉU DO SUL DO BRASIL, VEGETAÇÃO COMPATÍVEL SC. ÁRVORE ANCORA PRÓXIMA À PISCINA.
          </p>
          <p className="mt-2 text-body-sm text-white/70">
            Ambientes ultra-travados — novos ambientes precisam ser aprovados e documentados antes de gerar qualquer imagem.
          </p>
        </div>
      </div>

      <h2 className="text-heading-sm text-ink-500">
        {environments.length} {environments.length === 1 ? "Ambiente Aprovado" : "Ambientes Aprovados"}
      </h2>

      {environments.length === 0 && !showForm && (
        <div className="rounded-card border border-dashed border-base-600 bg-base-500/30 py-12 text-center">
          <p className="text-body-md font-medium text-base-700">
            Nenhum ambiente cadastrado.
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setName("");
              setDescription("");
              setPrompt("");
              setThumbnailUrl("");
              setFormError(null);
              setShowForm(true);
            }}
            className="mt-4 rounded-button bg-limao-500 px-4 py-2 text-label-sm font-semibold text-ink-500 hover:bg-limao-400"
          >
            Adicionar ambiente
          </button>
        </div>
      )}

      {environments.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {environments.map((env) => (
            <div
              key={env.id}
              className="rounded-card bg-surface-500 p-4 transition-shadow hover:shadow-md"
            >
              <p className="text-label-md font-semibold text-ink-500">{env.name}</p>
              <div className="mt-4 space-y-3">
                <div>
                  <span className="inline-block rounded-tag bg-green-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    FIXOS
                  </span>
                  <p className="mt-1.5 text-body-sm font-medium text-base-700">
                    {env.prompt || "Cinza contemporâneo, volumes retos, detalhes madeira/pedra clara. Jardim impecável. Porta grande madeira nobre. Espaço SUV."}
                  </p>
                </div>
                <div>
                  <span className="inline-block rounded-tag bg-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    FLEXÍVEIS
                  </span>
                  <p className="mt-1.5 text-body-sm font-medium text-base-700">
                    {env.description || "Detalhar aqui o que pode ser variável sem que descaracterize algo mais complexo de ser mudado. Ex.: se houver uma fonte a mesma não pode ser retirada... mas pode estar desligada."}
                  </p>
                </div>
                <div>
                  <span className="inline-block rounded-tag bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    PROIBIDO
                  </span>
                  <p className="mt-1.5 text-body-sm font-medium text-base-700">
                    Cor da casa ou arquitetura. Qualquer vegetação que não seja compatível com a localização. Tipo do piso / acabamento.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(env)}
                  className="rounded-button border border-base-600 px-3 py-1.5 text-label-sm text-ink-500 hover:bg-base-500"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteModalEnvId(env.id)}
                  className="rounded-button border border-red-500/50 px-3 py-1.5 text-label-sm text-red-600 hover:bg-red-500/10"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {environments.length > 0 && (
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setName("");
            setDescription("");
            setPrompt("");
            setThumbnailUrl("");
            setFormError(null);
            setShowForm(true);
          }}
          className="rounded-button border border-base-600 px-4 py-2 text-label-sm font-medium text-ink-500 hover:bg-base-500"
        >
          + Adicionar ambiente
        </button>
      )}

      <HubiaModal
        open={showForm}
        onClose={resetForm}
        title={editingId ? "Editar ambiente" : "Novo ambiente"}
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
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-input border-0 bg-[var(--hubia-bg-base-500)] px-4 py-3 text-body-md font-medium text-ink-500 outline-none focus:ring-2 focus:ring-limao-500/30"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-semibold text-ink-500">Descrição</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-input border-0 bg-[var(--hubia-bg-base-500)] px-4 py-3 text-body-md font-medium text-ink-500 outline-none focus:ring-2 focus:ring-limao-500/30"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-semibold text-ink-500">Prompt</label>
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full rounded-input border-0 bg-[var(--hubia-bg-base-500)] px-4 py-3 text-body-md font-medium text-ink-500 outline-none focus:ring-2 focus:ring-limao-500/30"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-semibold text-ink-500">URL thumbnail</label>
            <input
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="w-full rounded-input border-0 bg-[var(--hubia-bg-base-500)] px-4 py-3 text-body-md font-medium text-ink-500 outline-none focus:ring-2 focus:ring-limao-500/30"
            />
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
        open={deleteModalEnvId !== null}
        onClose={() => { setDeleteModalEnvId(null); setDeleteError(null); }}
        title="Excluir ambiente"
        message="Tem certeza que deseja excluir este ambiente? Esta ação não pode ser desfeita."
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
