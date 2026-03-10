"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HubiaModal } from "@/components/ui/hubia-modal";
import { createCreatorWithAutoFill } from "./actions";
import {
  Upload,
  FileArchive,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  AlertCircle,
  Check,
} from "lucide-react";
import type { CreatorAutoFillData } from "@/app/api/creators/process-zip/route";

const inputClass =
  "w-full rounded-input border-0 bg-[var(--hubia-bg-base-500)] px-4 py-3 text-body-md font-semibold text-ink-500 outline-none placeholder:text-base-600 focus:ring-2 focus:ring-limao-500/30";

const DRAFT_KEY = "hubia-creator-draft";

type FormData = {
  name: string;
  slug: string;
  bio: string;
  avatarUrl: string;
  isActive: boolean;
  metadata: {
    age?: number;
    city?: string;
    state?: string;
    birthdate?: string;
    platforms?: string[];
  };
  appearance?: {
    basePrompt: string;
    markers?: string[];
  };
  environments?: {
    name: string;
    description?: string;
    prompt: string;
  }[];
  looks?: {
    name: string;
    description?: string;
    prompt: string;
  }[];
  voice?: {
    tone?: string;
    style?: string;
    rules?: string[];
    examples?: string[];
  };
};

const EMPTY_FORM: FormData = {
  name: "",
  slug: "",
  bio: "",
  avatarUrl: "",
  isActive: true,
  metadata: {},
};

function deriveSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function NovaCreatorModal({
  organizationId,
  open,
  onClose,
}: {
  organizationId: string;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [autoSlug, setAutoSlug] = useState(true);

  // ZIP upload state
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [aiProcessed, setAiProcessed] = useState(false);
  const [zipFileName, setZipFileName] = useState<string | null>(null);
  const [filesExtracted, setFilesExtracted] = useState<string[]>([]);

  // Seções colapsáveis
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formDirtyRef = useRef(false);

  // ——— Auto-save: carregar rascunho do localStorage ———
  useEffect(() => {
    if (open) {
      try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
          const draft = JSON.parse(saved) as FormData;
          if (draft.name) {
            setForm(draft);
            formDirtyRef.current = true;
            setUploadMessage("Rascunho restaurado do salvamento automático.");
            if (draft.appearance || draft.environments?.length || draft.looks?.length || draft.voice) {
              setShowAdvanced(true);
              setAiProcessed(true);
            }
          }
        }
      } catch {
        // Ignora erros de parse
      }
    }
  }, [open]);

  // ——— Auto-save: salvar no localStorage quando form muda ———
  useEffect(() => {
    if (!open) return;
    if (!formDirtyRef.current && !form.name) return;

    const timeout = setTimeout(() => {
      if (form.name) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      }
    }, 1000); // Debounce 1s

    return () => clearTimeout(timeout);
  }, [form, open]);

  // ——— Auto-save: beforeunload ———
  useEffect(() => {
    if (!open) return;

    function handleBeforeUnload() {
      if (form.name) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [open, form]);

  function updateForm(patch: Partial<FormData>) {
    formDirtyRef.current = true;
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
    formDirtyRef.current = false;
  }

  // ——— ZIP Upload ———
  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const file = Array.from(files).find(
        (f) =>
          f.name.endsWith(".zip") ||
          f.type === "application/zip" ||
          f.type === "application/x-zip-compressed"
      );

      if (!file) {
        setError("Selecione um arquivo .zip");
        return;
      }

      setUploading(true);
      setError(null);
      setUploadMessage(null);
      setZipFileName(file.name);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/creators/process-zip", {
          method: "POST",
          body: formData,
        });

        const result = await res.json();

        if (!res.ok) {
          setError(result.error || "Erro ao processar arquivo");
          return;
        }

        setUploadMessage(result.message);
        setAiProcessed(result.aiProcessed);
        setFilesExtracted(result.data?.filesExtracted || []);

        // Auto-fill form com dados da IA
        const data = result.data as CreatorAutoFillData;
        if (data) {
          const patch: Partial<FormData> = {};

          if (data.name) {
            patch.name = data.name;
            if (autoSlug) patch.slug = deriveSlug(data.name);
          }
          if (data.bio) patch.bio = data.bio;
          if (data.metadata) {
            patch.metadata = {
              ...form.metadata,
              ...data.metadata,
            };
          }
          if (data.appearance?.basePrompt) {
            patch.appearance = {
              basePrompt: data.appearance.basePrompt,
              markers: data.appearance.markers,
            };
            setShowAdvanced(true);
          }
          if (data.environments?.length) {
            patch.environments = data.environments;
            setShowAdvanced(true);
          }
          if (data.looks?.length) {
            patch.looks = data.looks;
            setShowAdvanced(true);
          }
          if (data.voice) {
            patch.voice = data.voice;
            setShowAdvanced(true);
          }

          updateForm(patch);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao enviar arquivo");
      } finally {
        setUploading(false);
      }
    },
    [autoSlug, form.metadata]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  // ——— Submit ———
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await createCreatorWithAutoFill(organizationId, {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      bio: form.bio.trim() || null,
      avatarUrl: form.avatarUrl.trim() || null,
      isActive: form.isActive,
      metadata: form.metadata,
      appearance: form.appearance,
      environments: form.environments,
      looks: form.looks,
      voice: form.voice,
    });

    setLoading(false);
    if (result.ok) {
      clearDraft();
      onClose();
      router.refresh();
    } else {
      setError(result.error ?? "Erro ao criar.");
    }
  }

  // ——— Save as Draft ———
  async function handleSaveAsDraft() {
    if (!form.name.trim()) {
      setError("Informe ao menos o nome para salvar como rascunho.");
      return;
    }

    setError(null);
    setLoading(true);

    const result = await createCreatorWithAutoFill(organizationId, {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      bio: form.bio.trim() || null,
      avatarUrl: form.avatarUrl.trim() || null,
      isActive: false,
      isDraft: true,
      metadata: form.metadata,
      appearance: form.appearance,
      environments: form.environments,
      looks: form.looks,
      voice: form.voice,
    });

    setLoading(false);
    if (result.ok) {
      clearDraft();
      onClose();
      router.refresh();
    } else {
      setError(result.error ?? "Erro ao salvar rascunho.");
    }
  }

  function handleClose() {
    // Se tem dados no form, salva no localStorage automaticamente
    if (form.name.trim()) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    }
    onClose();
  }

  function handleDiscardDraft() {
    clearDraft();
    setForm(EMPTY_FORM);
    setAiProcessed(false);
    setUploadMessage(null);
    setZipFileName(null);
    setFilesExtracted([]);
    setShowAdvanced(false);
    setAutoSlug(true);
  }

  return (
    <HubiaModal
      open={open}
      onClose={handleClose}
      title="Nova creator"
      maxWidth="min(92vw, 680px)"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Mensagem de erro */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-card border border-red-500/30 bg-red-500/10 px-4 py-3 text-body-sm font-semibold text-red-600"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Mensagem de upload/AI */}
        {uploadMessage && (
          <div
            className={`flex items-start gap-2 rounded-card border px-4 py-3 text-body-sm font-semibold ${
              aiProcessed
                ? "border-limao-500/30 bg-limao-500/10 text-ink-500"
                : "border-orange-400/30 bg-orange-400/10 text-orange-700"
            }`}
          >
            {aiProcessed ? (
              <Sparkles size={16} className="mt-0.5 shrink-0 text-limao-600" />
            ) : (
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
            )}
            <div>
              <p>{uploadMessage}</p>
              {filesExtracted.length > 0 && (
                <p className="mt-1 text-base-700">
                  {filesExtracted.length} arquivo(s) encontrado(s) no ZIP
                </p>
              )}
            </div>
          </div>
        )}

        {/* Rascunho restaurado */}
        {formDirtyRef.current && form.name && !uploadMessage && (
          <div className="flex items-center justify-between rounded-card border border-base-600/50 bg-base-500/30 px-4 py-2 text-body-sm">
            <span className="text-base-700">Rascunho restaurado</span>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="text-red-500 hover:text-red-600"
            >
              Descartar
            </button>
          </div>
        )}

        {/* ——— ZIP Drag & Drop Zone ——— */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex cursor-pointer flex-col items-center gap-3 rounded-card border-2 border-dashed px-6 py-6 transition-all duration-200 ${
            dragOver
              ? "border-limao-500 bg-limao-500/10"
              : zipFileName
                ? "border-limao-500/30 bg-limao-500/5"
                : "border-base-600 hover:border-base-700 hover:bg-base-500/30"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) handleFiles(e.target.files);
            }}
          />

          {uploading ? (
            <>
              <Loader2 size={28} className="animate-spin text-limao-500" />
              <p className="text-body-sm font-semibold text-ink-500">
                Processando ZIP...
              </p>
              <p className="text-body-sm text-base-700">
                Extraindo arquivos e analisando com IA
              </p>
            </>
          ) : zipFileName ? (
            <>
              <FileArchive size={28} className="text-limao-500" />
              <p className="text-body-sm font-semibold text-ink-500">
                {zipFileName}
              </p>
              <p className="text-body-sm text-base-700">
                Clique ou arraste outro ZIP para substituir
              </p>
            </>
          ) : (
            <>
              <Upload size={28} className="text-base-700" />
              <p className="text-body-sm font-semibold text-ink-500">
                Arraste um arquivo ZIP ou clique para selecionar
              </p>
              <p className="text-body-sm text-base-700">
                Documentos do creator (aparência, ambientes, looks, voz) serão
                lidos pela IA e preencherão o formulário automaticamente
              </p>
            </>
          )}
        </div>

        {/* ——— Dados Básicos ——— */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="mc-name"
              className="flex items-center gap-2 text-label-sm font-semibold text-ink-500"
            >
              Nome *
              {aiProcessed && form.name && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-limao-600">
                  <Sparkles size={10} /> IA
                </span>
              )}
            </label>
            <input
              id="mc-name"
              type="text"
              required
              minLength={2}
              value={form.name}
              onChange={(e) => {
                const val = e.target.value;
                updateForm({
                  name: val,
                  ...(autoSlug ? { slug: deriveSlug(val) } : {}),
                });
              }}
              placeholder="Ex.: Ninaah Dornfeld"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="mc-slug"
              className="text-label-sm font-semibold text-ink-500"
            >
              Slug
            </label>
            <input
              id="mc-slug"
              type="text"
              value={form.slug}
              onChange={(e) => {
                setAutoSlug(false);
                updateForm({ slug: e.target.value });
              }}
              placeholder="ninaah-dornfeld"
              className={`${inputClass} font-mono`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="mc-bio"
              className="flex items-center gap-2 text-label-sm font-semibold text-ink-500"
            >
              Bio
              {aiProcessed && form.bio && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-limao-600">
                  <Sparkles size={10} /> IA
                </span>
              )}
            </label>
            <textarea
              id="mc-bio"
              rows={2}
              value={form.bio}
              onChange={(e) => updateForm({ bio: e.target.value })}
              placeholder="Breve descrição..."
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="mc-avatar"
              className="text-label-sm font-semibold text-ink-500"
            >
              URL do avatar
            </label>
            <input
              id="mc-avatar"
              type="url"
              value={form.avatarUrl}
              onChange={(e) => updateForm({ avatarUrl: e.target.value })}
              placeholder="https://..."
              className={inputClass}
            />
          </div>

          {/* Metadata inline: idade, cidade, estado, plataformas */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="mc-age"
                className="flex items-center gap-2 text-label-sm font-semibold text-ink-500"
              >
                Idade
                {aiProcessed && form.metadata?.age && (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-limao-600">
                    <Sparkles size={10} />
                  </span>
                )}
              </label>
              <input
                id="mc-age"
                type="number"
                min={0}
                max={120}
                value={form.metadata?.age ?? ""}
                onChange={(e) =>
                  updateForm({
                    metadata: {
                      ...form.metadata,
                      age: e.target.value ? Number(e.target.value) : undefined,
                    },
                  })
                }
                placeholder="25"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="mc-city"
                className="text-label-sm font-semibold text-ink-500"
              >
                Cidade
              </label>
              <input
                id="mc-city"
                type="text"
                value={form.metadata?.city ?? ""}
                onChange={(e) =>
                  updateForm({
                    metadata: { ...form.metadata, city: e.target.value || undefined },
                  })
                }
                placeholder="São Paulo"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="mc-state"
                className="text-label-sm font-semibold text-ink-500"
              >
                UF
              </label>
              <input
                id="mc-state"
                type="text"
                maxLength={2}
                value={form.metadata?.state ?? ""}
                onChange={(e) =>
                  updateForm({
                    metadata: {
                      ...form.metadata,
                      state: e.target.value.toUpperCase() || undefined,
                    },
                  })
                }
                placeholder="SP"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="mc-platforms"
              className="text-label-sm font-semibold text-ink-500"
            >
              Plataformas{" "}
              <span className="text-base-700 font-normal">(separadas por vírgula)</span>
            </label>
            <input
              id="mc-platforms"
              type="text"
              value={form.metadata?.platforms?.join(", ") ?? ""}
              onChange={(e) =>
                updateForm({
                  metadata: {
                    ...form.metadata,
                    platforms: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  },
                })
              }
              placeholder="instagram, tiktok, youtube"
              className={inputClass}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="mc-active"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => updateForm({ isActive: e.target.checked })}
              className="h-4 w-4 rounded border-base-600 text-limao-500 focus:ring-limao-500"
            />
            <label
              htmlFor="mc-active"
              className="text-body-md font-semibold text-ink-500"
            >
              Creator ativa
            </label>
          </div>
        </div>

        {/* ——— Seção Avançada (dados da IA) ——— */}
        {(aiProcessed || showAdvanced) && (
          <>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-label-sm font-semibold text-ink-500 hover:text-limao-600"
            >
              {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              Dados avançados (IA)
              {aiProcessed && (
                <span className="flex items-center gap-1 rounded-full bg-limao-500/20 px-2 py-0.5 text-[10px] font-bold text-limao-600">
                  <Sparkles size={10} /> Auto-preenchido
                </span>
              )}
            </button>

            {showAdvanced && (
              <div className="flex flex-col gap-4 rounded-card bg-base-500/20 p-4">
                {/* Aparência */}
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-2 text-label-sm font-semibold text-ink-500">
                    Aparência (base prompt)
                    {form.appearance?.basePrompt && (
                      <Check size={12} className="text-limao-500" />
                    )}
                  </label>
                  <textarea
                    rows={3}
                    value={form.appearance?.basePrompt ?? ""}
                    onChange={(e) =>
                      updateForm({
                        appearance: {
                          ...form.appearance,
                          basePrompt: e.target.value,
                          markers: form.appearance?.markers ?? [],
                        },
                      })
                    }
                    placeholder="Prompt descrevendo aparência física do creator..."
                    className={inputClass}
                  />
                </div>

                {/* Marcadores */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-sm font-semibold text-ink-500">
                    Marcadores visuais{" "}
                    <span className="font-normal text-base-700">(separados por vírgula)</span>
                  </label>
                  <input
                    type="text"
                    value={form.appearance?.markers?.join(", ") ?? ""}
                    onChange={(e) =>
                      updateForm({
                        appearance: {
                          ...form.appearance,
                          basePrompt: form.appearance?.basePrompt ?? "",
                          markers: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        },
                      })
                    }
                    placeholder="sinal no rosto, tatuagem no braço..."
                    className={inputClass}
                  />
                </div>

                {/* Ambientes */}
                {form.environments && form.environments.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-label-sm font-semibold text-ink-500">
                      Ambientes ({form.environments.length})
                      <Check size={12} className="text-limao-500" />
                    </label>
                    {form.environments.map((env, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 rounded-card bg-surface-500 px-3 py-2"
                      >
                        <div className="flex-1">
                          <p className="text-body-sm font-semibold text-ink-500">
                            {env.name}
                          </p>
                          {env.description && (
                            <p className="text-body-sm text-base-700">
                              {env.description}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...form.environments!];
                            updated.splice(i, 1);
                            updateForm({ environments: updated });
                          }}
                          className="shrink-0 text-base-700 hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Looks */}
                {form.looks && form.looks.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-label-sm font-semibold text-ink-500">
                      Looks ({form.looks.length})
                      <Check size={12} className="text-limao-500" />
                    </label>
                    {form.looks.map((look, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 rounded-card bg-surface-500 px-3 py-2"
                      >
                        <div className="flex-1">
                          <p className="text-body-sm font-semibold text-ink-500">
                            {look.name}
                          </p>
                          {look.description && (
                            <p className="text-body-sm text-base-700">
                              {look.description}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...form.looks!];
                            updated.splice(i, 1);
                            updateForm({ looks: updated });
                          }}
                          className="shrink-0 text-base-700 hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Voz */}
                {form.voice && (form.voice.tone || form.voice.style) && (
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-label-sm font-semibold text-ink-500">
                      Voz
                      <Check size={12} className="text-limao-500" />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold uppercase text-base-700">
                          Tom
                        </span>
                        <input
                          type="text"
                          value={form.voice.tone ?? ""}
                          onChange={(e) =>
                            updateForm({
                              voice: { ...form.voice, tone: e.target.value },
                            })
                          }
                          className={inputClass}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold uppercase text-base-700">
                          Estilo
                        </span>
                        <input
                          type="text"
                          value={form.voice.style ?? ""}
                          onChange={(e) =>
                            updateForm({
                              voice: { ...form.voice, style: e.target.value },
                            })
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ——— Botões ——— */}
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <motion.button
            type="submit"
            disabled={loading || uploading}
            className="rounded-button bg-limao-500 px-6 py-3 text-label-md font-semibold text-ink-500 disabled:opacity-50"
            whileHover={{ scale: 1.03, backgroundColor: "#DFFF33" }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {loading ? "Salvando…" : "Salvar"}
          </motion.button>
          <motion.button
            type="button"
            onClick={handleSaveAsDraft}
            disabled={loading || uploading}
            className="rounded-button border border-base-600 bg-transparent px-5 py-3 text-label-md font-semibold text-ink-500 disabled:opacity-50"
            whileHover={{ scale: 1.03, backgroundColor: "rgba(213,210,201,0.5)" }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
          >
            Salvar como rascunho
          </motion.button>
          <motion.button
            type="button"
            onClick={handleClose}
            className="rounded-button bg-[var(--hubia-bg-base-500)] px-6 py-3 text-label-md font-semibold text-ink-500"
            whileHover={{ scale: 1.03, backgroundColor: "rgba(213,210,201,0.5)" }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
          >
            Cancelar
          </motion.button>
        </div>
      </form>
    </HubiaModal>
  );
}
