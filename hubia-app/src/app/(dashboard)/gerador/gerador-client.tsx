"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, Check, Upload, ChevronDown, History, Wand2, ImageIcon } from "lucide-react";
import { SlidingTabs } from "@/components/ui/sliding-tabs";
import { HubiaModal } from "@/components/ui/hubia-modal";
import type { CreatorOption, GeradorFormData, GeradorResult } from "./actions";
import { gerarPrompt } from "./actions";

// ─── Listas fixas de opções ──────────────────────────────────────
const MOODS = [
  "C - sol plácido",
  "C - sol piscina",
  "D - nublado suave",
  "E - dourado tarde",
  "F - noturno urbano",
];

const HORARIOS = [
  "golden hour (16 - 18h)",
  "blue hour (18 - 19h)",
  "manhã (7 - 9h)",
  "meio-dia (11 - 13h)",
  "tarde (14 - 16h)",
  "noite",
];

const CAMERAS = [
  "Sony A7R V",
  "Sony A7 IV",
  "Canon EOS R5",
  "Nikon Z8",
  "Fujifilm GFX 100S",
];

const LENTES = ["85mm", "50mm", "35mm", "135mm", "24-70mm", "70-200mm"];

// ─── Label de select ─────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="mb-1 block"
      style={{
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.3px",
        color: "#A9AAA5",
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

// ─── Select estilizado ───────────────────────────────────────────
function StyledSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full appearance-none rounded-[10px] border border-transparent py-2.5 pl-3.5 pr-9 text-[14px] font-semibold text-ink-500 outline-none transition-[border-color,box-shadow] duration-150 focus:border-ink-500 focus:shadow-[0_0_0_3px_rgba(14,15,16,0.08)] disabled:opacity-50"
        style={{ background: "#EEEFE9" }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#A9AAA5]"
      />
    </div>
  );
}

// ─── Card Parâmetros Técnicos ─────────────────────────────────────
function ParamCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        style={{
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.3px",
          color: "#A9AAA5",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span className="text-[13px] font-semibold text-ink-500">{value || "—"}</span>
    </div>
  );
}

// ─── Checklist item ───────────────────────────────────────────────
function ChecklistItem({ text, index, type }: { text: string; index: number; type: "check" | "block" }) {
  return (
    <motion.div
      className="flex items-start gap-2"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: [0, 0, 0.2, 1], delay: Math.min(index * 0.04, 0.3) }}
    >
      <div
        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px]"
        style={{ background: type === "check" ? "#22c55e" : "#ef4444" }}
      >
        {type === "check" ? (
          <Check size={10} strokeWidth={3} color="white" />
        ) : (
          <span style={{ fontSize: "10px", color: "white", fontWeight: 900, lineHeight: 1 }}>×</span>
        )}
      </div>
      <span className="text-[12px] leading-[1.4]" style={{ color: "#5E5E5F" }}>
        {text}
      </span>
    </motion.div>
  );
}

// ─── Briefing + Output (shared between Gerador e Photo Cloner) ────
function BriefingOutputSection({
  creators,
  form,
  setForm,
  output,
  isGenerating,
  onGenerate,
  onVerCompleto,
  copied,
  onCopy,
}: {
  creators: CreatorOption[];
  form: GeradorFormData;
  setForm: React.Dispatch<React.SetStateAction<GeradorFormData>>;
  output: (GeradorResult & { ok: true }) | null;
  isGenerating: boolean;
  onGenerate: () => void;
  onVerCompleto: () => void;
  copied: boolean;
  onCopy: () => void;
}) {
  const selectedCreator = creators.find((c) => c.id === form.creatorId);
  const environmentOptions = selectedCreator?.environments.map((e) => ({ value: e.id, label: e.name })) ?? [];

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
      {/* Coluna esquerda — Briefing */}
      <div className="rounded-[20px] bg-white p-6">
        <h2
          className="mb-5"
          style={{ fontSize: "20px", fontWeight: 700, color: "#0E0F10" }}
        >
          Briefing da cena
        </h2>

        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          {/* CREATOR */}
          <div>
            <FieldLabel>Creator</FieldLabel>
            <StyledSelect
              value={form.creatorId}
              onChange={(v) => setForm((f) => ({ ...f, creatorId: v, ambienteId: "" }))}
              options={creators.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Selecionar..."
            />
          </div>

          {/* AMBIENTE */}
          <div>
            <FieldLabel>Ambiente</FieldLabel>
            <StyledSelect
              value={form.ambienteId}
              onChange={(v) => setForm((f) => ({ ...f, ambienteId: v }))}
              options={environmentOptions}
              placeholder={form.creatorId ? "Selecionar..." : "— Creator primeiro —"}
              disabled={!form.creatorId || environmentOptions.length === 0}
            />
          </div>

          {/* MOOD */}
          <div>
            <FieldLabel>Mood</FieldLabel>
            <StyledSelect
              value={form.mood}
              onChange={(v) => setForm((f) => ({ ...f, mood: v }))}
              options={MOODS.map((m) => ({ value: m, label: m }))}
              placeholder="Selecionar..."
            />
          </div>

          {/* HORÁRIO */}
          <div>
            <FieldLabel>Horário</FieldLabel>
            <StyledSelect
              value={form.horario}
              onChange={(v) => setForm((f) => ({ ...f, horario: v }))}
              options={HORARIOS.map((h) => ({ value: h, label: h }))}
              placeholder="Selecionar..."
            />
          </div>

          {/* CÂMERA */}
          <div>
            <FieldLabel>Câmera</FieldLabel>
            <StyledSelect
              value={form.camera}
              onChange={(v) => setForm((f) => ({ ...f, camera: v }))}
              options={CAMERAS.map((c) => ({ value: c, label: c }))}
              placeholder="Selecionar..."
            />
          </div>

          {/* LENTE */}
          <div>
            <FieldLabel>Lente</FieldLabel>
            <StyledSelect
              value={form.lente}
              onChange={(v) => setForm((f) => ({ ...f, lente: v }))}
              options={LENTES.map((l) => ({ value: l, label: l }))}
              placeholder="Selecionar..."
            />
          </div>
        </div>

        {/* DESCRIÇÃO */}
        <div className="mt-4">
          <FieldLabel>Descrição da cena</FieldLabel>
          <textarea
            value={form.descricao}
            onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
            placeholder="Ex: Ninaah está no beiro da piscina, sentada na espreguiçadeira..."
            rows={4}
            className="w-full resize-none rounded-[10px] border border-transparent px-3.5 py-2.5 text-[14px] text-ink-500 outline-none placeholder:text-[#A9AAA5] transition-[border-color,box-shadow] duration-150 focus:border-ink-500 focus:shadow-[0_0_0_3px_rgba(14,15,16,0.08)]"
            style={{ background: "#EEEFE9" }}
          />
        </div>

        {/* Botão gerar */}
        <motion.button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || !form.creatorId}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-[18px] py-3 text-[16px] font-bold tracking-[0.3px] text-ink-500 disabled:opacity-50"
          style={{ background: "#D7FF00" }}
          whileHover={!isGenerating && form.creatorId ? { scale: 1.02, backgroundColor: "#DFFF33" } : {}}
          whileTap={!isGenerating && form.creatorId ? { scale: 0.97 } : {}}
          transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <motion.span
            className="icon-spark"
            whileHover={{ scale: 1.3 }}
            transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Sparkles size={18} strokeWidth={2} />
          </motion.span>
          {isGenerating ? "Gerando..." : "GERAR PROMPT COMPLETO"}
        </motion.button>
      </div>

      {/* Coluna direita */}
      <div className="flex flex-col gap-4">
        {/* Card Output — preto */}
        <AnimatePresence mode="wait">
          <motion.div
            key={output ? "with-output" : "empty"}
            className="rounded-[20px] p-6"
            style={{ background: "#0E0F10", minHeight: "200px" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span
                style={{ fontSize: "18px", fontWeight: 700, color: "#D7FF00" }}
              >
                Output — Prompt Final
              </span>
              {output && (
                <div className="flex items-center gap-2">
                  {/* Botão copiar */}
                  <motion.button
                    type="button"
                    onClick={onCopy}
                    className="flex items-center gap-1 rounded-[9999px] px-3 py-1 text-[11px] font-semibold"
                    style={{ background: "rgba(255,255,255,0.1)", color: "#A9AAA5" }}
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.18)", color: "#FFFFFF" }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    {copied ? (
                      <Check size={11} strokeWidth={3} />
                    ) : (
                      <Copy size={11} strokeWidth={2} />
                    )}
                    {copied ? "Copiado" : "Copiar"}
                  </motion.button>
                  {/* Botão ver completo */}
                  <motion.button
                    type="button"
                    onClick={onVerCompleto}
                    className="flex items-center gap-1 rounded-[9999px] px-3 py-1 text-[11px] font-semibold"
                    style={{ background: "rgba(255,255,255,0.1)", color: "#A9AAA5" }}
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.18)", color: "#FFFFFF" }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    VER COMPLETO
                  </motion.button>
                </div>
              )}
            </div>
            {output ? (
              <p
                className="line-clamp-6 text-[13px] leading-relaxed"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                {output.prompt}
              </p>
            ) : (
              <p
                className="text-[13px]"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                O prompt gerado aparecerá aqui...
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Card Parâmetros Técnicos */}
        <div className="rounded-[20px] bg-white p-5">
          <h3
            className="mb-4"
            style={{ fontSize: "16px", fontWeight: 700, color: "#0E0F10" }}
          >
            Parâmetros Técnicos
          </h3>
          <div className="grid grid-cols-4 gap-3 rounded-[10px] p-3" style={{ background: "#EEEFE9" }}>
            <ParamCell label="Câmera" value={output?.parametros.camera ?? form.camera} />
            <ParamCell label="Lente" value={output?.parametros.lente ?? (form.lente ? `${form.lente} f/1.4` : "")} />
            <ParamCell label="Abertura" value={output?.parametros.abertura ?? ""} />
            <ParamCell label="ISO" value={output?.parametros.iso ?? ""} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab Gerador ──────────────────────────────────────────────────
function TabGerador({
  creators,
  form,
  setForm,
  output,
  isGenerating,
  onGenerate,
  onVerCompleto,
  copied,
  onCopy,
}: {
  creators: CreatorOption[];
  form: GeradorFormData;
  setForm: React.Dispatch<React.SetStateAction<GeradorFormData>>;
  output: (GeradorResult & { ok: true }) | null;
  isGenerating: boolean;
  onGenerate: () => void;
  onVerCompleto: () => void;
  copied: boolean;
  onCopy: () => void;
}) {
  const selectedCreator = creators.find((c) => c.id === form.creatorId);
  const markers = output?.markers ?? selectedCreator?.appearance?.markers ?? [];
  const protectedItems = output?.protected ?? selectedCreator?.appearance?.protected ?? [];

  return (
    <div className="flex flex-col gap-5">
      <BriefingOutputSection
        creators={creators}
        form={form}
        setForm={setForm}
        output={output}
        isGenerating={isGenerating}
        onGenerate={onGenerate}
        onVerCompleto={onVerCompleto}
        copied={copied}
        onCopy={onCopy}
      />

      {/* Checklist + Blindagem */}
      {(markers.length > 0 || protectedItems.length > 0) && (
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {/* Checklist Forense */}
          <div className="rounded-[20px] bg-white p-6">
            <h3
              className="mb-4"
              style={{ fontSize: "16px", fontWeight: 700, color: "#0E0F10" }}
            >
              Checklist Forense — Validar ANTES de aprovar
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {(markers as string[]).map((item, i) => (
                <ChecklistItem key={i} text={item} index={i} type="check" />
              ))}
            </div>
          </div>

          {/* Blindagem */}
          <div className="rounded-[20px] bg-white p-6">
            <h3
              className="mb-4"
              style={{ fontSize: "16px", fontWeight: 700, color: "#0E0F10" }}
            >
              Blindagem — Proibido
            </h3>
            <div className="flex flex-col gap-2">
              {(protectedItems as string[]).map((item, i) => (
                <ChecklistItem key={i} text={item} index={i} type="block" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Estado: creator selecionada mas sem dados ainda */}
      {selectedCreator && markers.length === 0 && protectedItems.length === 0 && (
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="rounded-[20px] bg-white p-6">
            <h3
              className="mb-3"
              style={{ fontSize: "16px", fontWeight: 700, color: "#0E0F10" }}
            >
              Checklist Forense — Validar ANTES de aprovar
            </h3>
            <p className="text-[13px]" style={{ color: "#A9AAA5" }}>
              Configure a aparência da creator para ver o checklist.
            </p>
          </div>
          <div className="rounded-[20px] bg-white p-6">
            <h3
              className="mb-3"
              style={{ fontSize: "16px", fontWeight: 700, color: "#0E0F10" }}
            >
              Blindagem — Proibido
            </h3>
            <p className="text-[13px]" style={{ color: "#A9AAA5" }}>
              Configure a aparência da creator para ver as restrições.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab Histórico ────────────────────────────────────────────────
function TabHistorico() {
  return (
    <div className="min-h-[400px]" />
  );
}

// ─── Tab Photo Cloner ─────────────────────────────────────────────
function TabPhotoCloner({
  creators,
  form,
  setForm,
  output,
  isGenerating,
  onGenerate,
  onVerCompleto,
  copied,
  onCopy,
}: {
  creators: CreatorOption[];
  form: GeradorFormData;
  setForm: React.Dispatch<React.SetStateAction<GeradorFormData>>;
  output: (GeradorResult & { ok: true }) | null;
  isGenerating: boolean;
  onGenerate: () => void;
  onVerCompleto: () => void;
  copied: boolean;
  onCopy: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [clonePrompt, setClonePrompt] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    // Ponto de integração futura com API de análise de imagem
    setClonePrompt("Sony A7R V + 85mm f/1.4 portrait lens + golden hour natural light\n\n[Análise da imagem será integrada via API]");
  }

  const selectedCreator = creators.find((c) => c.id === form.creatorId);
  const markers = selectedCreator?.appearance?.markers ?? [];
  const protectedItems = selectedCreator?.appearance?.protected ?? [];

  return (
    <div className="flex flex-col gap-5">
      {/* Bloco preto full-width */}
      <div className="rounded-[20px] p-6" style={{ background: "#0E0F10" }}>
        <div className="grid gap-5" style={{ gridTemplateColumns: "340px 1fr" }}>
          {/* Área de upload */}
          <div className="flex flex-col gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <motion.div
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[16px] p-8 text-center"
              style={{
                border: "2px dashed rgba(255,255,255,0.25)",
                minHeight: "180px",
              }}
              onClick={() => fileInputRef.current?.click()}
              whileHover={{ borderColor: "rgba(255,255,255,0.5)" }}
              transition={{ duration: 0.15 }}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Imagem para clonar"
                  className="max-h-[150px] rounded-[10px] object-contain"
                />
              ) : (
                <>
                  <Upload size={28} color="rgba(255,255,255,0.4)" strokeWidth={1.5} />
                  <p className="text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Insira sua imagem para clonar
                  </p>
                </>
              )}
            </motion.div>

            {/* Botão inserir no gerador */}
            <motion.button
              type="button"
              disabled={!clonePrompt}
              className="w-full rounded-[10px] py-3 text-[13px] font-bold tracking-[0.5px] text-white disabled:opacity-40"
              style={{ background: "#3E3F40" }}
              whileHover={clonePrompt ? { backgroundColor: "#4A4B4C" } : {}}
              whileTap={clonePrompt ? { scale: 0.98 } : {}}
              transition={{ duration: 0.15 }}
            >
              INSERIR NO GERADOR PROMPT
            </motion.button>
          </div>

          {/* Output do clone */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#D7FF00" }}>
                Image Prompt — descrição
              </span>
              {clonePrompt && (
                <motion.button
                  type="button"
                  className="rounded-[9999px] px-3 py-1 text-[11px] font-semibold"
                  style={{ background: "rgba(255,255,255,0.1)", color: "#A9AAA5" }}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.18)", color: "#FFFFFF" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  VER COMPLETO
                </motion.button>
              )}
            </div>
            {clonePrompt ? (
              <p
                className="text-[13px] leading-relaxed"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                {clonePrompt}
              </p>
            ) : (
              <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                Faça upload de uma imagem para gerar a descrição do prompt...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Briefing + Output abaixo */}
      <BriefingOutputSection
        creators={creators}
        form={form}
        setForm={setForm}
        output={output}
        isGenerating={isGenerating}
        onGenerate={onGenerate}
        onVerCompleto={onVerCompleto}
        copied={copied}
        onCopy={onCopy}
      />

      {/* Checklist + Blindagem */}
      {(markers.length > 0 || protectedItems.length > 0) && (
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="rounded-[20px] bg-white p-6">
            <h3 className="mb-4" style={{ fontSize: "16px", fontWeight: 700, color: "#0E0F10" }}>
              Checklist Forense — Validar ANTES de aprovar
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {(markers as string[]).map((item, i) => (
                <ChecklistItem key={i} text={item} index={i} type="check" />
              ))}
            </div>
          </div>
          <div className="rounded-[20px] bg-white p-6">
            <h3 className="mb-4" style={{ fontSize: "16px", fontWeight: 700, color: "#0E0F10" }}>
              Blindagem — Proibido
            </h3>
            <div className="flex flex-col gap-2">
              {(protectedItems as string[]).map((item, i) => (
                <ChecklistItem key={i} text={item} index={i} type="block" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state checklist */}
      {markers.length === 0 && protectedItems.length === 0 && (
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="rounded-[20px] bg-white p-6">
            <h3 className="mb-2" style={{ fontSize: "16px", fontWeight: 700, color: "#0E0F10" }}>
              Checklist Forense — Validar ANTES de aprovar
            </h3>
          </div>
          <div className="rounded-[20px] bg-white p-6">
            <h3 className="mb-2" style={{ fontSize: "16px", fontWeight: 700, color: "#0E0F10" }}>
              Blindagem — Proibido
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Modal Ver Completo ───────────────────────────────────────────
function ModalVerCompleto({
  open,
  onClose,
  output,
  onCopy,
  copied,
}: {
  open: boolean;
  onClose: () => void;
  output: (GeradorResult & { ok: true }) | null;
  onCopy: () => void;
  copied: boolean;
}) {
  if (!output) return null;

  const subtitulo = [
    output.creatorName,
    output.ambienteName,
    output.parametros.camera,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <HubiaModal
      open={open}
      onClose={onClose}
      title="Output — Prompt Final"
      maxWidth="min(90vw, 580px)"
    >
      {/* Subtítulo */}
      <p className="mb-4 -mt-4 text-[13px]" style={{ color: "#A9AAA5" }}>
        {subtitulo}
      </p>

      {/* Caixa preta com prompt */}
      <div
        className="rounded-[16px] p-5 overflow-y-auto"
        style={{ background: "#0E0F10", maxHeight: "360px" }}
      >
        <p
          className="whitespace-pre-wrap text-[13px] leading-relaxed"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          {output.prompt}
        </p>
      </div>

      {/* Botão copiar */}
      <div className="mt-5 flex justify-end">
        <motion.button
          type="button"
          onClick={onCopy}
          className="flex items-center gap-2 rounded-[18px] px-6 py-3 text-[14px] font-bold text-ink-500"
          style={{ background: "#D7FF00" }}
          whileHover={{ scale: 1.03, backgroundColor: "#DFFF33" }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <motion.span whileHover={{ scale: 1.2 }} transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}>
            {copied ? <Check size={16} strokeWidth={3} /> : <Copy size={16} strokeWidth={2} />}
          </motion.span>
          {copied ? "Copiado!" : "Copiar prompt"}
        </motion.button>
      </div>
    </HubiaModal>
  );
}

// ─── Tabs config ──────────────────────────────────────────────────
const TABS = [
  { id: "gerador", label: "GERADOR", icon: Wand2 },
  { id: "historico", label: "HISTÓRICO", icon: History },
  { id: "photo-cloner", label: "PHOTO CLONER", icon: ImageIcon },
];

// ─── Componente principal ─────────────────────────────────────────
export function GeradorClient({ creators }: { creators: CreatorOption[] }) {
  const [activeTab, setActiveTab] = useState("gerador");
  const [form, setForm] = useState<GeradorFormData>({
    creatorId: creators[0]?.id ?? "",
    ambienteId: "",
    mood: "",
    horario: "",
    camera: "Sony A7R V",
    lente: "85mm",
    descricao: "",
  });
  const [output, setOutput] = useState<(GeradorResult & { ok: true }) | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    if (!form.creatorId) return;
    setIsGenerating(true);
    try {
      const result = await gerarPrompt(form);
      if (result.ok) {
        setOutput(result);
      }
    } finally {
      setIsGenerating(false);
    }
  }

  function handleCopy() {
    if (!output) return;
    navigator.clipboard.writeText(output.prompt).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#0E0F10" }}>
          Gerador de prompt
        </h1>
        <motion.button
          type="button"
          className="flex items-center gap-2 rounded-[18px] px-4 py-3 text-[14px] font-bold text-ink-500"
          style={{ background: "#D7FF00" }}
          whileHover={{ scale: 1.03, backgroundColor: "#DFFF33" }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <motion.span whileHover={{ scale: 1.2 }} transition={{ duration: 0.2 }}>
            <span style={{ fontSize: "16px", fontWeight: 900 }}>+</span>
          </motion.span>
          Novo pedido
        </motion.button>
      </div>

      {/* Tabs */}
      <SlidingTabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />

      {/* Conteúdo das tabs */}
      <AnimatePresence mode="wait">
        {activeTab === "gerador" && (
          <motion.div
            key="gerador"
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(3px)" }}
            transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
          >
            <TabGerador
              creators={creators}
              form={form}
              setForm={setForm}
              output={output}
              isGenerating={isGenerating}
              onGenerate={handleGenerate}
              onVerCompleto={() => setModalOpen(true)}
              copied={copied}
              onCopy={handleCopy}
            />
          </motion.div>
        )}

        {activeTab === "historico" && (
          <motion.div
            key="historico"
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(3px)" }}
            transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
          >
            <TabHistorico />
          </motion.div>
        )}

        {activeTab === "photo-cloner" && (
          <motion.div
            key="photo-cloner"
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(3px)" }}
            transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
          >
            <TabPhotoCloner
              creators={creators}
              form={form}
              setForm={setForm}
              output={output}
              isGenerating={isGenerating}
              onGenerate={handleGenerate}
              onVerCompleto={() => setModalOpen(true)}
              copied={copied}
              onCopy={handleCopy}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Ver Completo */}
      <ModalVerCompleto
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        output={output}
        onCopy={handleCopy}
        copied={copied}
      />
    </div>
  );
}
