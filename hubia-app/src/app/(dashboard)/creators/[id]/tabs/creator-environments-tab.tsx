"use client";

import { useState } from "react";
import { Home } from "lucide-react";
import { HubiaModal } from "@/components/ui/hubia-modal";
import { HubiaConfirmModal } from "@/components/ui/hubia-confirm-modal";
import type { CreatorDetail } from "../../actions";
import {
  createEnvironment,
  updateEnvironment,
  deleteEnvironment,
} from "../../actions";

// Texto placeholder do banner de localização (usado quando não há dados)
const BANNER_TEXT =
  "CASA DE CONDOMÍNIO FECHADO. 2 PAVIMENTOS, SC. RIQUEZA IMPLÍCITA. CONTEMPORÂNEA, BOM GOSTO. CÉU DO SUL DO BRASIL. VEGETAÇÃO COMPATÍVEL SC. ÁRVORE ÂNCORA PRÓXIMA À PISCINA.";
const BANNER_SUB =
  "Ambientes ultra-travados — novos ambientes precisam ser aprovados e documentados antes de gerar qualquer imagem...";

// Tags de categoria dos ambientes
function CategoryTag({
  label,
  color,
}: {
  label: string;
  color: { bg: string; text: string };
}) {
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest"
      style={{ background: color.bg, color: color.text }}
    >
      {label}
    </span>
  );
}

const CATEGORY_COLORS = {
  fixos: { bg: "#DCFFF6", text: "#00A87A" },
  flexiveis: { bg: "#FFF4E5", text: "#D97706" },
  proibido: { bg: "#FFE8EB", text: "var(--hubia-red-500)" },
};

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
    <div className="flex flex-col gap-5">
      {/* Banner de localização — fundo ink escuro */}
      <div
        className="flex items-start gap-4 rounded-2xl px-6 py-5"
        style={{ background: "var(--hubia-ink-500)" }}
      >
        <div
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <Home size={18} style={{ color: "rgba(255,255,255,0.7)" }} />
        </div>
        <div>
          <p className="font-bold leading-snug" style={{ fontSize: "12px", color: "#FFFFFF" }}>
            {BANNER_TEXT}
          </p>
          <p className="mt-1.5 font-semibold" style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>
            {BANNER_SUB}
          </p>
        </div>
      </div>

      {/* Título com contagem */}
      <h2 className="font-bold" style={{ fontSize: "17px", color: "var(--hubia-ink-500)" }}>
        {environments.length}{" "}
        {environments.length === 1 ? "Ambiente Aprovado" : "Ambientes Aprovados"}
      </h2>

      {/* Estado vazio */}
      {environments.length === 0 && !showForm && (
        <div
          className="flex flex-col items-center justify-center gap-4 rounded-[30px] border-2 border-dashed py-16"
          style={{ borderColor: "var(--hubia-sand-600)" }}
        >
          <p className="font-semibold" style={{ fontSize: "14px", color: "var(--hubia-bg-base-700)" }}>
            Nenhum ambiente cadastrado.
          </p>
          <button
            type="button"
            onClick={() => { resetForm(); setShowForm(true); }}
            className="rounded-full font-bold transition-opacity hover:opacity-90"
            style={{ background: "var(--hubia-limao-500)", color: "var(--hubia-ink-500)", fontSize: "13px", padding: "9px 22px" }}
          >
            Adicionar ambiente
          </button>
        </div>
      )}

      {/* Grid de cards de ambientes */}
      {environments.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {environments.map((env) => (
            <div
              key={env.id}
              className="flex flex-col gap-4 rounded-[30px] p-5"
              style={{ background: "#FFFFFF" }}
            >
              {/* Nome */}
              <p className="font-bold" style={{ fontSize: "15px", color: "var(--hubia-ink-500)" }}>
                {env.name}
              </p>

              {/* Seção FIXOS */}
              <div className="flex flex-col gap-1.5">
                <CategoryTag label="FIXOS" color={CATEGORY_COLORS.fixos} />
                <p className="font-semibold leading-snug" style={{ fontSize: "12px", color: "#A9AAA5" }}>
                  {env.prompt ||
                    "Cinza contemporâneo, volumes retos, detalhes madeira/pedra clara. Jardim impecável. Porta grande madeira nobre. Espaço SUV."}
                </p>
              </div>

              {/* Seção FLEXÍVEIS */}
              <div className="flex flex-col gap-1.5">
                <CategoryTag label="FLEXÍVEIS" color={CATEGORY_COLORS.flexiveis} />
                <p className="font-semibold leading-snug" style={{ fontSize: "12px", color: "#A9AAA5" }}>
                  {env.description ||
                    "Detalhar aqui o que pode ser variável sem que descaracterize algo mais complexo de ser mudado. Ex.: se houver uma fonte a mesma não pode ser retirada... mas pode estar desligada."}
                </p>
              </div>

              {/* Seção PROIBIDO */}
              <div className="flex flex-col gap-1.5">
                <CategoryTag label="PROIBIDO" color={CATEGORY_COLORS.proibido} />
                <p className="font-semibold leading-snug" style={{ fontSize: "12px", color: "#A9AAA5" }}>
                  Cor da casa ou arquitetura. Qualquer vegetação que não seja compatível com a localização. Tipo do piso / acabamento.
                </p>
              </div>

              {/* Ações */}
              <div className="mt-auto flex gap-2 border-t pt-3" style={{ borderColor: "#EEEFE9" }}>
                <button
                  type="button"
                  onClick={() => startEdit(env)}
                  className="rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors hover:bg-[#EEEFE9]"
                  style={{ borderColor: "#D9D9D4", color: "#0E0F10" }}
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteModalEnvId(env.id)}
                  className="rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors hover:bg-[#FFF0F2]"
                  style={{ borderColor: "#FFB2BC", color: "#FF576D" }}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de formulário */}
      <HubiaModal
        open={showForm}
        onClose={resetForm}
        title={editingId ? "Editar ambiente" : "Novo ambiente"}
        maxWidth="min(90vw, 480px)"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && (
            <div
              className="rounded-xl px-4 py-3 text-[12px] font-semibold"
              style={{ background: "#FFE8EB", color: "#FF576D" }}
            >
              {formError}
            </div>
          )}
          {[
            { id: "env-name", label: "Nome *", value: name, onChange: setName, required: true, type: "text", rows: undefined },
            { id: "env-desc", label: "Flexíveis (descrição)", value: description, onChange: setDescription, required: false, type: "text", rows: undefined },
          ].map((field) => (
            <div key={field.id} className="flex flex-col gap-1.5">
              <label htmlFor={field.id} className="font-semibold" style={{ fontSize: "12px", color: "#0E0F10" }}>
                {field.label}
              </label>
              <input
                id={field.id}
                type="text"
                required={field.required}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                className="w-full rounded-xl border-0 px-4 py-3 font-semibold outline-none transition-colors focus:ring-2 focus:ring-[#D7FF00]/30"
                style={{ background: "#EEEFE9", fontSize: "13px", color: "#0E0F10" }}
              />
            </div>
          ))}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="env-prompt" className="font-semibold" style={{ fontSize: "12px", color: "#0E0F10" }}>
              Fixos (prompt)
            </label>
            <textarea
              id="env-prompt"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full rounded-xl border-0 px-4 py-3 font-semibold outline-none transition-colors focus:ring-2 focus:ring-[#D7FF00]/30"
              style={{ background: "#EEEFE9", fontSize: "13px", color: "#0E0F10" }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="env-thumb" className="font-semibold" style={{ fontSize: "12px", color: "#0E0F10" }}>
              URL thumbnail
            </label>
            <input
              id="env-thumb"
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="w-full rounded-xl border-0 px-4 py-3 font-semibold outline-none transition-colors focus:ring-2 focus:ring-[#D7FF00]/30"
              style={{ background: "#EEEFE9", fontSize: "13px", color: "#0E0F10" }}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--hubia-limao-500)", color: "var(--hubia-ink-500)", fontSize: "13px", padding: "9px 22px" }}
            >
              {loading ? "Salvando…" : editingId ? "Salvar" : "Criar"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border font-semibold transition-colors hover:bg-[#EEEFE9]"
              style={{ borderColor: "#D9D9D4", color: "#0E0F10", fontSize: "13px", padding: "9px 22px" }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </HubiaModal>

      {/* Modal de confirmação de exclusão */}
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
