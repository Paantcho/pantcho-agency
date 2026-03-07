"use client";

import { useState } from "react";
import { AlertTriangle, Check, X } from "lucide-react";
import type { CreatorDetail } from "../../actions";
import { upsertCreatorAppearance } from "../../actions";

const ROSTO_ROWS = [
  { elemento: "Rosto", definicao: "Oval suave, leve afunilamento no queixo", tolerancia: "Expressões discretas" },
  { elemento: "Olhos", definicao: "Amendoado, castanho claro a mel", tolerancia: "NUNCA verde/azul", alert: true },
  { elemento: "Cabelo", definicao: "Longo até cintura, castanho médio, liso/ondulado", tolerancia: "NUNCA loiro platinado", alert: true },
  { elemento: "Pele", definicao: "Natural, poros discretos, hidratada", tolerancia: "Bronzeado leve" },
  { elemento: "Lábios", definicao: "Cheios naturais, contorno definido", tolerancia: "Sorriso aberto/fechado" },
  { elemento: "Sobrancelhas", definicao: "Cheios naturais, contorno definido", tolerancia: "Expressões discretas" },
];

const CORPO_ROWS = [
  { elemento: "Braços", definicao: "Descrição detalhada...", tolerancia: "Deixar claro aqui a regra" },
  { elemento: "Mãos", definicao: "Descrição detalhada...", tolerancia: "Deixar claro aqui a regra" },
  { elemento: "Cintura", definicao: "Descrição detalhada...", tolerancia: "Expressões discretas" },
  { elemento: "Coxas", definicao: "Descrição detalhada...", tolerancia: "Deixar claro aqui a regra" },
];

const CHECKLIST_ITEMS = [
  "Rosto: Reconhece a mesma pessoa?",
  "Olhos: Castanho claro/mel — nunca verde ou azul?",
  "Cabelo: Comprimento, textura e cor corretos?",
  "Pintinha: Presente, lado direito, lugar certo?",
  "Piercing: Só aparece quando umbigo visível?",
  "Silhueta: Proporções constantes entre imagens?",
  "Carro: BMW X2 Cape York Green quando presente?",
  "Mãos: Dedos corretos, unhas da semana?",
];

const BLINDAGEM_ITEMS = [
  "Alterar traços faciais entre cenas",
  "Sumir com a pintinha do ombro",
  "Criar tatuagens",
  "Mudar cor dos olhos",
  "Aparência de implante exagerado",
];

export default function CreatorAppearanceTab({
  creator,
  organizationId,
}: {
  creator: CreatorDetail;
  organizationId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<"ok" | "error" | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [basePrompt, setBasePrompt] = useState(
    creator.appearance?.basePrompt ?? ""
  );
  const [showEdit, setShowEdit] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setErrorText(null);
    setLoading(true);
    const result = await upsertCreatorAppearance(organizationId, creator.id, {
      basePrompt: basePrompt.trim() || " ",
      markers: creator.appearance?.markers ?? [],
      protected: creator.appearance?.protected ?? [],
    });
    setLoading(false);
    setMessage(result.ok ? "ok" : "error");
    if (!result.ok) setErrorText(result.error ?? "Erro ao salvar.");
    if (result.ok) setShowEdit(false);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Banner rosa — documento forense */}
      <div className="flex gap-3 rounded-card border border-pink-500/30 bg-pink-500/10 p-4">
        <AlertTriangle className="h-5 w-5 shrink-0 text-pink-600" />
        <p className="text-body-sm font-medium text-pink-800">
          DOCUMENTO FORENSE — Fonte da verdade absoluta. Nenhum detalhe pode ser alterado sem aprovação explícita do responsável.
        </p>
      </div>

      {/* Tabelas forenses: cada linha como bloco legível (ELEMENTO | DEFINIÇÃO FIXA | TOLERÂNCIA) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-card bg-surface-500 p-6">
          <h3 className="text-heading-sm font-bold text-ink-500">
            Rosto (Forense)
          </h3>
          <div className="mt-4 space-y-3">
            {ROSTO_ROWS.map((row) => (
              <div
                key={row.elemento}
                className="rounded-button border-0 bg-[var(--hubia-bg-base-50)] p-3"
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-label-sm font-semibold text-ink-500">{row.elemento}</span>
                  <span className="text-body-sm font-medium text-base-700">{row.definicao}</span>
                </div>
                <p className={`mt-1 text-body-sm font-medium ${row.alert ? "text-red-600" : "text-base-700"}`}>
                  {row.tolerancia}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-card bg-surface-500 p-6">
          <h3 className="text-heading-sm font-bold text-ink-500">
            Corpo e Silhueta (Forense)
          </h3>
          <div className="mt-4 space-y-3">
            {CORPO_ROWS.map((row) => (
              <div
                key={row.elemento}
                className="rounded-button border-0 bg-[var(--hubia-bg-base-50)] p-3"
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-label-sm font-semibold text-ink-500">{row.elemento}</span>
                  <span className="text-body-sm font-medium text-base-700">{row.definicao}</span>
                </div>
                <p className="mt-1 text-body-sm font-medium text-base-700">{row.tolerancia}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Checklist Forense: itens com fundo verde suave e ícone check */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-card bg-surface-500 p-6">
          <h3 className="text-heading-sm font-bold text-ink-500">
            Checklist Forense — Validar ANTES de aprovar
          </h3>
          <ul className="mt-4 space-y-2">
            {CHECKLIST_ITEMS.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-button border-0 bg-green-500/10 p-3"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden />
                <span className="text-body-sm font-medium text-ink-500">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-card bg-surface-500 p-6">
          <h3 className="text-heading-sm font-bold text-ink-500">
            Blindagem — Proibido
          </h3>
          <ul className="mt-4 space-y-2">
            {BLINDAGEM_ITEMS.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-button border-0 bg-red-500/10 p-3"
              >
                <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden />
                <span className="text-body-sm font-medium text-ink-500">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Editar prompt base (colapsável) */}
      {showEdit ? (
        <form onSubmit={handleSubmit} className="rounded-card border border-base-600 bg-base-500/20 p-4">
          <label htmlFor="ap-base" className="text-label-sm text-ink-500">
            Prompt base (edição)
          </label>
          <textarea
            id="ap-base"
            rows={4}
            value={basePrompt}
            onChange={(e) => setBasePrompt(e.target.value)}
            placeholder="Descreva a aparência fixa do creator..."
            className="mt-2 w-full rounded-input border border-base-600 bg-surface-500 px-4 py-3 text-body-md text-ink-500 outline-none focus:border-limao-500"
          />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-button bg-limao-500 px-4 py-2 text-label-sm text-ink-500 hover:bg-limao-400 disabled:opacity-50"
            >
              {loading ? "Salvando…" : "Salvar"}
            </button>
            <button
              type="button"
              onClick={() => setShowEdit(false)}
              className="rounded-button border border-base-600 px-4 py-2 text-label-sm text-ink-500 hover:bg-base-500"
            >
              Cancelar
            </button>
            {message === "ok" && <span className="text-body-sm font-medium text-green-600">Salvo.</span>}
            {message === "error" && errorText && (
              <span className="text-body-sm font-medium text-red-600">{errorText}</span>
            )}
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowEdit(true)}
          className="w-fit rounded-button border border-base-600 px-4 py-2 text-label-sm text-ink-500 hover:bg-base-500"
        >
          Editar prompt base
        </button>
      )}
    </div>
  );
}
