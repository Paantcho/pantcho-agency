"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import type { CreatorDetail } from "../../actions";
import { upsertCreatorAppearance } from "../../actions";

// ---- Dados forenses (mock — em produção virão do banco) -------------------------

const ROSTO_ROWS = [
  { elemento: "Rosto", definicao: "Oval suave, leve afunilamento no queixo", tolerancia: "Expressões discretas", alert: false },
  { elemento: "Olhos", definicao: "Amendoado, castanho claro a mel", tolerancia: "NUNCA verde/azul", alert: true },
  { elemento: "Cabelo", definicao: "Longo até cintura, castanho médio, liso/ondulado", tolerancia: "NUNCA loiro platinado", alert: true },
  { elemento: "Pele", definicao: "Natural, poros discretos, hidratada", tolerancia: "Bronzeado leve", alert: false },
  { elemento: "Lábios", definicao: "Cheios naturais, contorno definido", tolerancia: "Sorriso aberto/fechado", alert: false },
  { elemento: "Dentes", definicao: "Longo até cintura, castanho médio, liso/ondulado", tolerancia: "NUNCA loiro platinado", alert: true },
  { elemento: "Nariz", definicao: "Natural, poros discretos, hidratada", tolerancia: "Bronzeado leve", alert: false },
  { elemento: "Sobrancelhas", definicao: "Cheios naturais, contorno definido", tolerancia: "Sorriso aberto/fechado", alert: false },
];

const CORPO_ROWS = [
  { elemento: "Braços", definicao: "Descrição detalhada...", tolerancia: "Deixar claro aqui a regra", alert: false },
  { elemento: "Mãos", definicao: "Descrição detalhada...", tolerancia: "Deixar claro aqui a regra", alert: false },
  { elemento: "Seios", definicao: "Descrição detalhada...", tolerancia: "NUNCA loiro platinado", alert: true },
  { elemento: "Barriga", definicao: "Descrição detalhada...", tolerancia: "Deixar claro aqui a regra", alert: false },
  { elemento: "Cintura", definicao: "Descrição detalhada...", tolerancia: "Expressões discretas", alert: false },
  { elemento: "Bumbum", definicao: "Descrição detalhada...", tolerancia: "Deixar claro aqui a regra", alert: false },
  { elemento: "Coxas", definicao: "Descrição detalhada...", tolerancia: "Deixar claro aqui a regra", alert: false },
  { elemento: "Pernas", definicao: "Descrição detalhada...", tolerancia: "Deixar claro aqui a regra", alert: false },
  { elemento: "Pés", definicao: "Descrição detalhada...", tolerancia: "Deixar claro aqui a regra", alert: false },
];

const CHECKLIST_LEFT = [
  "Rosto: Reconhece a mesma Ninaah?",
  "Cabelo: Comprimento, textura e cor corretos?",
  "Piercing: Só aparece quando umbigo visível...",
  "Carro: BMW X2 Cape York Green quando presente?",
];
const CHECKLIST_RIGHT = [
  "Olhos: Castanho claro/mel — nunca verde ou azul?",
  "Pintinha: Presente, lado direito, lugar certo?",
  "Silhueta: Proporções constantes entre imagens?",
  "Mãos: Dedos corretos, unhas da semana?",
];

const BLINDAGEM = [
  "Alterar traços faciais entre cenas...",
  "Sumir com a pintinha do ombro",
  "Criar tatuagens",
  "Mudar cor dos olhos",
  "Aparência de implante exagerado",
  "Sumir com a pintinha do ombro",
];

// ---- Componentes internos -------------------------------------------------------

function TableHeader() {
  return (
    <div
      className="grid grid-cols-3 gap-3 rounded-xl px-4 py-2"
      style={{ background: "#EEEFE9" }}
    >
      {["ELEMENTO", "DEFINIÇÃO FIXA", "TOLERÂNCIA"].map((h) => (
        <span
          key={h}
          className="font-bold uppercase tracking-widest"
          style={{ fontSize: "9px", color: "#A9AAA5" }}
        >
          {h}
        </span>
      ))}
    </div>
  );
}

function TableRow({
  elemento,
  definicao,
  tolerancia,
  alert,
}: {
  elemento: string;
  definicao: string;
  tolerancia: string;
  alert: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 border-b py-2.5 last:border-0" style={{ borderColor: "#EEEFE9" }}>
      <span className="font-semibold" style={{ fontSize: "12px", color: "#0E0F10" }}>
        {elemento}
      </span>
      <span className="font-semibold" style={{ fontSize: "12px", color: "#A9AAA5" }}>
        {definicao}
      </span>
      <span
        className="font-semibold"
        style={{ fontSize: "12px", color: alert ? "#FF576D" : "#A9AAA5" }}
      >
        {tolerancia}
      </span>
    </div>
  );
}

// ---- Componente principal -------------------------------------------------------

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
    <div className="flex flex-col gap-5">
      {/* Banner forense — rosa claro */}
      <div
        className="flex items-start gap-3 rounded-2xl px-5 py-4"
        style={{ background: "#FFE8EB", border: "1.5px solid #FFB2BC" }}
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "#FF576D" }} />
        <div>
          <p className="font-bold" style={{ fontSize: "12px", color: "#0E0F10" }}>
            DOCUMENTO FORENSE
          </p>
          <p className="font-semibold" style={{ fontSize: "12px", color: "#A9AAA5", marginTop: "2px" }}>
            Fonte da verdade absoluta — nenhum detalhe pode ser alterado sem aprovação explícita de Pantcho..
          </p>
        </div>
      </div>

      {/* Tabelas forenses — 2 colunas */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Rosto */}
        <div className="rounded-[30px] p-5" style={{ background: "#FFFFFF" }}>
          <h3 className="font-bold" style={{ fontSize: "16px", color: "#0E0F10" }}>
            Rosto (Forense)
          </h3>
          <div className="mt-4 flex flex-col gap-0">
            <TableHeader />
            <div className="mt-1 px-4">
              {ROSTO_ROWS.map((row) => (
                <TableRow key={row.elemento} {...row} />
              ))}
            </div>
          </div>
        </div>

        {/* Corpo e Silhueta */}
        <div className="rounded-[30px] p-5" style={{ background: "#FFFFFF" }}>
          <h3 className="font-bold" style={{ fontSize: "16px", color: "#0E0F10" }}>
            Corpo e Silhueta (Forense)
          </h3>
          <div className="mt-4 flex flex-col gap-0">
            <TableHeader />
            <div className="mt-1 px-4">
              {CORPO_ROWS.map((row) => (
                <TableRow key={row.elemento} {...row} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Checklist + Blindagem — 2 colunas */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Checklist forense */}
        <div className="rounded-[30px] p-5" style={{ background: "#FFFFFF" }}>
          <h3 className="font-bold" style={{ fontSize: "16px", color: "#0E0F10" }}>
            Checklist Forense — Validar ANTES de aprovar
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {CHECKLIST_LEFT.map((item) => (
              <div
                key={item}
                className="flex items-start gap-2 rounded-xl p-3"
                style={{ background: "#E8FFF8" }}
              >
                <span
                  className="mt-0.5 shrink-0 font-bold"
                  style={{ color: "#00FCB0", fontSize: "14px" }}
                >
                  ✓
                </span>
                <span className="font-semibold" style={{ fontSize: "11px", color: "#0E0F10" }}>
                  {item}
                </span>
              </div>
            ))}
            {CHECKLIST_RIGHT.map((item) => (
              <div
                key={item}
                className="flex items-start gap-2 rounded-xl p-3"
                style={{ background: "#E8FFF8" }}
              >
                <span
                  className="mt-0.5 shrink-0 font-bold"
                  style={{ color: "#00FCB0", fontSize: "14px" }}
                >
                  ✓
                </span>
                <span className="font-semibold" style={{ fontSize: "11px", color: "#0E0F10" }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Blindagem — proibido */}
        <div className="rounded-[30px] p-5" style={{ background: "#FFFFFF" }}>
          <h3 className="font-bold" style={{ fontSize: "16px", color: "#0E0F10" }}>
            Blindagem — Proibido
          </h3>
          <div className="mt-4 flex flex-col gap-2">
            {BLINDAGEM.map((item, i) => (
              <div
                key={`${item}-${i}`}
                className="flex items-start gap-2 rounded-xl p-3"
                style={{ background: "#FFF0F2" }}
              >
                <span
                  className="mt-0.5 shrink-0 font-bold"
                  style={{ color: "#FF576D", fontSize: "13px" }}
                >
                  ✕
                </span>
                <span className="font-semibold" style={{ fontSize: "12px", color: "#0E0F10" }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Editar prompt base */}
      {showEdit ? (
        <form
          onSubmit={handleSubmit}
          className="rounded-[30px] border p-5"
          style={{ borderColor: "#D9D9D4", background: "#FFFFFF" }}
        >
          <label htmlFor="ap-base" className="font-semibold" style={{ fontSize: "13px", color: "#0E0F10" }}>
            Prompt base (edição)
          </label>
          <textarea
            id="ap-base"
            rows={4}
            value={basePrompt}
            onChange={(e) => setBasePrompt(e.target.value)}
            placeholder="Descreva a aparência fixa do creator..."
            className="mt-2 w-full rounded-xl border px-4 py-3 font-semibold outline-none transition-colors focus:border-[#D7FF00]"
            style={{ borderColor: "#D9D9D4", background: "#EEEFE9", fontSize: "13px", color: "#0E0F10" }}
          />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "#D7FF00", color: "#0E0F10", fontSize: "13px", padding: "8px 20px" }}
            >
              {loading ? "Salvando…" : "Salvar"}
            </button>
            <button
              type="button"
              onClick={() => setShowEdit(false)}
              className="rounded-full border font-semibold transition-colors hover:bg-[#EEEFE9]"
              style={{ borderColor: "#D9D9D4", color: "#0E0F10", fontSize: "13px", padding: "8px 20px" }}
            >
              Cancelar
            </button>
            {message === "ok" && (
              <span className="font-semibold" style={{ fontSize: "12px", color: "#00FCB0" }}>Salvo.</span>
            )}
            {message === "error" && errorText && (
              <span className="font-semibold" style={{ fontSize: "12px", color: "#FF576D" }}>{errorText}</span>
            )}
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowEdit(true)}
          className="w-fit rounded-full border font-semibold transition-colors hover:bg-[#EEEFE9]"
          style={{ borderColor: "#D9D9D4", color: "#0E0F10", fontSize: "13px", padding: "8px 20px" }}
        >
          Editar prompt base
        </button>
      )}
    </div>
  );
}
