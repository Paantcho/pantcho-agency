"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
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
  | { organizationId: string; mode: "add"; asCard?: boolean; providerId?: never; providerName?: never; providerType?: never; defaultModel?: never }
  | {
      organizationId: string;
      mode: "edit";
      providerId: string;
      providerName: string;
      providerType: AiProviderType;
      defaultModel: string | null;
    };

export default function ProvedoresClient(props: Props) {
  const { organizationId, mode } = props;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(mode === "edit" ? props.providerName : "");
  const [type, setType] = useState<AiProviderType>(
    mode === "edit" ? props.providerType : "openai"
  );
  const [apiKey, setApiKey] = useState("");
  const [defaultModel, setDefaultModel] = useState(
    mode === "edit" ? props.defaultModel ?? "" : ""
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result =
      mode === "add"
        ? await createProvider(organizationId, {
            name,
            type,
            apiKey,
            defaultModel: defaultModel || null,
          })
        : await updateProvider(organizationId, props.providerId, {
            name,
            type,
            ...(apiKey && { apiKey }),
            defaultModel: defaultModel || null,
          });
    setLoading(false);
    if (result.ok) {
      setOpen(false);
      if (mode === "add") {
        setName("");
        setType("openai");
        setApiKey("");
        setDefaultModel("");
      }
    } else {
      setError(result.error ?? "Erro");
    }
  }

  if (mode === "add" && props.asCard) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex flex-col items-center gap-[12px] text-label-md text-base-700 hover:text-ink-500"
        >
          <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-sand-300">
            <Plus size={24} className="text-base-700" />
          </div>
          Adicionar provedor
        </button>
        {open && (
          <ModalAdd
            onClose={() => setOpen(false)}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            name={name}
            setName={setName}
            type={type}
            setType={setType}
            apiKey={apiKey}
            setApiKey={setApiKey}
            defaultModel={defaultModel}
            setDefaultModel={setDefaultModel}
          />
        )}
      </>
    );
  }

  if (mode === "add") {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-[8px] rounded-button bg-limao-500 px-[20px] py-[12px] text-label-sm font-bold text-ink-500 transition-colors duration-200 hover:bg-limao-400"
        >
          <Plus size={18} strokeWidth={2.5} />
          Adicionar provedor
        </button>
        {open && (
          <ModalAdd
            onClose={() => setOpen(false)}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            name={name}
            setName={setName}
            type={type}
            setType={setType}
            apiKey={apiKey}
            setApiKey={setApiKey}
            defaultModel={defaultModel}
            setDefaultModel={setDefaultModel}
          />
        )}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setName(props.providerName);
          setType(props.providerType);
          setApiKey("");
          setDefaultModel(props.defaultModel ?? "");
          setOpen(true);
        }}
        className="inline-flex w-full items-center justify-center gap-[8px] rounded-button border border-white px-[16px] py-[10px] text-label-sm text-white transition-colors duration-200 hover:bg-white/10"
      >
        <Pencil size={14} />
        Editar
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-500/70 p-4 backdrop-blur-[12px]">
          <div className="w-full max-w-md rounded-card bg-surface-500 p-6">
            <h3 className="text-heading-xs text-ink-500">Editar provedor</h3>
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
              <div>
                <label className="text-label-sm text-ink-500">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 w-full rounded-input border border-base-600 bg-sand-100 px-3 py-2 text-body-sm text-ink-500"
                />
              </div>
              <div>
                <label className="text-label-sm text-ink-500">Tipo</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AiProviderType)}
                  className="mt-1 w-full rounded-input border border-base-600 bg-sand-100 px-3 py-2 text-body-sm text-ink-500"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {typeLabel[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-label-sm text-ink-500">
                  Nova API key (deixe em branco para manter a atual)
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-input border border-base-600 bg-sand-100 px-3 py-2 text-body-sm text-ink-500"
                />
              </div>
              <div>
                <label className="text-label-sm text-ink-500">
                  Modelo padrão
                </label>
                <input
                  type="text"
                  value={defaultModel}
                  onChange={(e) => setDefaultModel(e.target.value)}
                  placeholder="ex: gpt-4o"
                  className="mt-1 w-full rounded-input border border-base-600 bg-sand-100 px-3 py-2 text-body-sm text-ink-500"
                />
              </div>
              {error && (
                <p className="text-body-sm text-red-600">{error}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-button border border-base-600 px-4 py-2 text-label-sm text-ink-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-button bg-limao-500 px-4 py-2 text-label-sm text-ink-500 disabled:opacity-50"
                >
                  {loading ? "Salvando…" : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function ModalAdd({
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
}: {
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
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-500/70 p-4 backdrop-blur-[12px]">
      <div className="w-full max-w-md rounded-card bg-surface-500 p-6">
        <h3 className="text-heading-xs text-ink-500">Adicionar provedor</h3>
        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <label className="text-label-sm text-ink-500">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="ex: OpenAI produção"
              className="mt-1 w-full rounded-input border border-base-600 bg-sand-100 px-3 py-2 text-body-sm text-ink-500"
            />
          </div>
          <div>
            <label className="text-label-sm text-ink-500">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AiProviderType)}
              className="mt-1 w-full rounded-input border border-base-600 bg-sand-100 px-3 py-2 text-body-sm text-ink-500"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {typeLabel[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-label-sm text-ink-500">API key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              className="mt-1 w-full rounded-input border border-base-600 bg-sand-100 px-3 py-2 text-body-sm text-ink-500"
            />
          </div>
          <div>
            <label className="text-label-sm text-ink-500">
              Modelo padrão (opcional)
            </label>
            <input
              type="text"
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              placeholder="ex: gpt-4o"
              className="mt-1 w-full rounded-input border border-base-600 bg-sand-100 px-3 py-2 text-body-sm text-ink-500"
            />
          </div>
          {error && <p className="text-body-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-button border border-base-600 px-4 py-2 text-label-sm text-ink-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-button bg-limao-500 px-4 py-2 text-label-sm text-ink-500 disabled:opacity-50"
            >
              {loading ? "Salvando…" : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
