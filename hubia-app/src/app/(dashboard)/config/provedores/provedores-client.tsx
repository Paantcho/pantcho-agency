"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Pencil, Trash2, X, Star, AlertTriangle } from "lucide-react";
import {
  createProvider,
  updateProvider,
  deleteProvider,
} from "./actions";
import { AiProviderType } from "@prisma/client";

const typeLabel: Record<AiProviderType, string> = {
  anthropic: "Anthropic",
  openai: "OpenAI",
  google: "Google",
  custom: "Custom",
};

const TYPES: AiProviderType[] = ["openai", "anthropic", "google", "custom"];

type Props =
  | { organizationId: string; mode: "add"; asCard?: boolean; providerId?: never; providerName?: never; providerType?: never; defaultModel?: never; isDefault?: never }
  | {
      organizationId: string;
      mode: "edit";
      providerId: string;
      providerName: string;
      providerType: AiProviderType;
      defaultModel: string | null;
      isDefault: boolean;
    };

const inputClass = "mt-1 w-full rounded-input border border-base-600 bg-sand-100 px-3 py-2 text-body-sm text-ink-500 outline-none transition-[border-color,box-shadow] duration-150 focus:border-ink-500 focus:shadow-[0_0_0_3px_rgba(14,15,16,0.08)]";

/* ─── Modal de formulário (criar/editar) ─────────────────────────────────── */

function ProviderModal({
  title,
  onClose,
  onSubmit,
  loading,
  error,
  name,
  setName,
  type,
  setType,
  apiKey,
  setApiKey,
  defaultModel,
  setDefaultModel,
  apiKeyLabel = "API key",
  apiKeyRequired = true,
}: {
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
  name: string;
  setName: (s: string) => void;
  type: AiProviderType;
  setType: (t: AiProviderType) => void;
  apiKey: string;
  setApiKey: (s: string) => void;
  defaultModel: string;
  setDefaultModel: (s: string) => void;
  apiKeyLabel?: string;
  apiKeyRequired?: boolean;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ backgroundColor: "rgba(14,15,16,0)", backdropFilter: "blur(0px)" }}
      animate={{ backgroundColor: "rgba(14,15,16,0.70)", backdropFilter: "blur(12px)" }}
      exit={{ backgroundColor: "rgba(14,15,16,0)", backdropFilter: "blur(0px)" }}
      transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="w-full max-w-md rounded-[30px] bg-surface-500 p-7"
        initial={{ scale: 0.88, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 10, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h3 className="text-heading-xs font-bold text-ink-500">{title}</h3>
          <motion.button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-500 text-white"
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ rotate: 90, scale: 0.9 }}
            transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <X size={16} strokeWidth={2.5} />
          </motion.button>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-label-sm text-ink-500">Nome</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="ex: OpenAI produção" className={inputClass} />
          </div>
          <div>
            <label className="text-label-sm text-ink-500">Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value as AiProviderType)} className={inputClass}>
              {TYPES.map((t) => <option key={t} value={t}>{typeLabel[t]}</option>)}
            </select>
          </div>
          <div>
            <label className="text-label-sm text-ink-500">{apiKeyLabel}</label>
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} required={apiKeyRequired} placeholder="••••••••" className={inputClass} />
          </div>
          <div>
            <label className="text-label-sm text-ink-500">Modelo padrão (opcional)</label>
            <input type="text" value={defaultModel} onChange={(e) => setDefaultModel(e.target.value)} placeholder="ex: gpt-4o" className={inputClass} />
          </div>
          {error && <p className="text-body-sm text-red-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <motion.button
              type="button"
              onClick={onClose}
              className="rounded-button border border-base-600 px-4 py-2 text-label-sm text-ink-500"
              whileHover={{ scale: 1.03, backgroundColor: "#EEEFE9" }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
            >
              Cancelar
            </motion.button>
            <motion.button
              type="submit"
              disabled={loading}
              className="rounded-button bg-limao-500 px-4 py-2 text-label-sm font-bold text-ink-500 disabled:opacity-50"
              whileHover={{ scale: 1.03, backgroundColor: "#DFFF33" }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
            >
              {loading ? "Salvando…" : title.startsWith("Editar") ? "Salvar" : "Adicionar"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ─── Modal de confirmação de exclusão ───────────────────────────────────── */

function DeleteConfirmModal({
  providerName,
  onClose,
  onConfirm,
  loading,
}: {
  providerName: string;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ backgroundColor: "rgba(14,15,16,0)", backdropFilter: "blur(0px)" }}
      animate={{ backgroundColor: "rgba(14,15,16,0.70)", backdropFilter: "blur(12px)" }}
      exit={{ backgroundColor: "rgba(14,15,16,0)", backdropFilter: "blur(0px)" }}
      transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="w-full max-w-sm rounded-[30px] bg-surface-500 p-7"
        initial={{ scale: 0.88, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 10, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <h3 className="text-heading-xs font-bold text-ink-500">Excluir provedor</h3>
        </div>
        <p className="text-body-md text-base-700 mb-5">
          Tem certeza que deseja excluir <strong className="text-ink-500">{providerName}</strong>? Agentes que usam este provedor deixarão de funcionar.
        </p>
        <div className="flex gap-2">
          <motion.button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-button border border-base-600 px-4 py-2 text-label-sm text-ink-500"
            whileHover={{ scale: 1.03, backgroundColor: "#EEEFE9" }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
          >
            Cancelar
          </motion.button>
          <motion.button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-button bg-red-600 px-4 py-2 text-label-sm font-bold text-white disabled:opacity-50"
            whileHover={{ scale: 1.03, backgroundColor: "#dc2626" }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {loading ? "Excluindo…" : "Excluir"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Componente principal ───────────────────────────────────────────────── */

export default function ProvedoresClient(props: Props) {
  const { organizationId, mode } = props;
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(mode === "edit" ? props.providerName : "");
  const [type, setType] = useState<AiProviderType>(mode === "edit" ? props.providerType : "openai");
  const [apiKey, setApiKey] = useState("");
  const [defaultModel, setDefaultModel] = useState(mode === "edit" ? props.defaultModel ?? "" : "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result =
      mode === "add"
        ? await createProvider(organizationId, { name, type, apiKey, defaultModel: defaultModel || null })
        : await updateProvider(organizationId, props.providerId, {
            name, type, ...(apiKey && { apiKey }), defaultModel: defaultModel || null,
          });
    setLoading(false);
    if (result.ok) {
      setOpen(false);
      if (mode === "add") { setName(""); setType("openai"); setApiKey(""); setDefaultModel(""); }
    } else {
      setError(result.error ?? "Erro");
    }
  }

  async function handleDelete() {
    if (mode !== "edit") return;
    setLoading(true);
    const result = await deleteProvider(organizationId, props.providerId);
    setLoading(false);
    if (result.ok) {
      setConfirmDelete(false);
    }
  }

  async function handleSetDefault() {
    if (mode !== "edit") return;
    setLoading(true);
    await updateProvider(organizationId, props.providerId, { isDefault: true });
    setLoading(false);
  }

  const modalProps = { onClose: () => setOpen(false), onSubmit: handleSubmit, loading, error, name, setName, type, setType, apiKey, setApiKey, defaultModel, setDefaultModel };

  /* ── modo "add" como card placeholder ──────────────────────────────────── */
  if (mode === "add" && props.asCard) {
    return (
      <>
        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          className="flex flex-col items-center gap-[12px] text-label-md text-base-700"
          whileHover={{ scale: 1.03, color: "#0E0F10" }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-sand-300">
            <motion.span whileHover={{ scale: 1.2 }} transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}>
              <Plus size={24} className="text-base-700" />
            </motion.span>
          </div>
          Adicionar provedor
        </motion.button>
        <AnimatePresence>
          {open && <ProviderModal title="Adicionar provedor" {...modalProps} />}
        </AnimatePresence>
      </>
    );
  }

  /* ── modo "add" como botão header ──────────────────────────────────────── */
  if (mode === "add") {
    return (
      <>
        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-[8px] rounded-button bg-limao-500 px-[20px] py-[12px] text-label-sm font-bold text-ink-500"
          whileHover={{ scale: 1.03, backgroundColor: "#DFFF33" }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <motion.span whileHover={{ scale: 1.2 }} transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}>
            <Plus size={18} strokeWidth={2.5} />
          </motion.span>
          Adicionar provedor
        </motion.button>
        <AnimatePresence>
          {open && <ProviderModal title="Adicionar provedor" {...modalProps} />}
        </AnimatePresence>
      </>
    );
  }

  /* ── modo "edit" — botões Editar + Excluir + Definir padrão ────────── */
  return (
    <>
      <div className="flex gap-2">
        {!props.isDefault && (
          <motion.button
            type="button"
            onClick={handleSetDefault}
            disabled={loading}
            title="Definir como padrão"
            className="inline-flex flex-1 items-center justify-center gap-[6px] rounded-button border border-white/30 px-[12px] py-[10px] text-label-sm text-white/70 disabled:opacity-50"
            whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.1)", color: "#D7FF00" }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Star size={14} />
            Padrão
          </motion.button>
        )}
        <motion.button
          type="button"
          onClick={() => {
            setName(props.providerName);
            setType(props.providerType);
            setApiKey("");
            setDefaultModel(props.defaultModel ?? "");
            setOpen(true);
          }}
          className="inline-flex flex-1 items-center justify-center gap-[8px] rounded-button border border-white px-[16px] py-[10px] text-label-sm text-white"
          whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.1)" }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <Pencil size={14} />
          Editar
        </motion.button>
        <motion.button
          type="button"
          onClick={() => setConfirmDelete(true)}
          title="Excluir provedor"
          className="inline-flex items-center justify-center rounded-button border border-red-500/40 px-[12px] py-[10px] text-red-400"
          whileHover={{ scale: 1.03, backgroundColor: "rgba(239,68,68,0.15)", borderColor: "rgba(239,68,68,0.6)" }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <Trash2 size={14} />
        </motion.button>
      </div>
      <AnimatePresence>
        {open && (
          <ProviderModal
            title="Editar provedor"
            {...modalProps}
            apiKeyLabel="Nova API key (deixe em branco para manter)"
            apiKeyRequired={false}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {confirmDelete && (
          <DeleteConfirmModal
            providerName={props.providerName}
            onClose={() => setConfirmDelete(false)}
            onConfirm={handleDelete}
            loading={loading}
          />
        )}
      </AnimatePresence>
    </>
  );
}
