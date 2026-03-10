"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedLink } from "@/components/ui/animated-link";
import {
  ArrowLeft,
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
import { createCreatorWithAutoFill } from "../actions";
import type { CreatorAutoFillData } from "@/app/api/creators/process-zip/route";

const inputClass =
  "rounded-input border border-base-600 bg-surface-500 px-4 py-3 text-body-md text-ink-500 outline-none transition-colors duration-[150ms] placeholder:text-base-700 focus:border-limao-500 focus:ring-2 focus:ring-limao-500/20";

const DRAFT_KEY = "hubia-creator-draft-page";

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

export default function CreatorFormClient({
  organizationId,
}: {
  organizationId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [autoSlug, setAutoSlug] = useState(true);

  // ZIP upload
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [aiProcessed, setAiProcessed] = useState(false);
  const [zipFileName, setZipFileName] = useState<string | null>(null);
  const [filesExtracted, setFilesExtracted] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formDirtyRef = useRef(false);

  // ——— Auto-save: carregar rascunho ———
  useEffect(() => {
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
      // ignore
    }
  }, []);

  // ——— Auto-save: debounce ———
  useEffect(() => {
    if (!formDirtyRef.current && !form.name) return;
    const timeout = setTimeout(() => {
      if (form.name) localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [form]);

  // ——— Auto-save: beforeunload ———
  useEffect(() => {
    function handleBeforeUnload() {
      if (form.name) localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form]);

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

        const data = result.data as CreatorAutoFillData;
        if (data) {
          const patch: Partial<FormData> = {};
          if (data.name) {
            patch.name = data.name;
            if (autoSlug) patch.slug = deriveSlug(data.name);
          }
          if (data.bio) patch.bio = data.bio;
          if (data.metadata) patch.metadata = { ...form.metadata, ...data.metadata };
          if (data.appearance?.basePrompt) { patch.appearance = { basePrompt: data.appearance.basePrompt, markers: data.appearance.markers }; setShowAdvanced(true); }
          if (data.environments?.length) { patch.environments = data.environments; setShowAdvanced(true); }
          if (data.looks?.length) { patch.looks = data.looks; setShowAdvanced(true); }
          if (data.voice) { patch.voice = data.voice; setShowAdvanced(true); }
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
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }

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
      router.push(`/creators/${result.id}`);
      router.refresh();
    } else {
      setError(result.error ?? "Erro ao criar.");
    }
  }

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
      router.push("/creators");
      router.refresh();
    } else {
      setError(result.error ?? "Erro ao salvar rascunho.");
    }
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <motion.div
          whileHover={{ x: -2 }}
          transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <AnimatedLink
            href="/creators"
            className="flex items-center gap-2 text-body-md text-base-700 transition-colors duration-150 hover:text-ink-500"
          >
            <ArrowLeft size={18} />
            Voltar para Creators
          </AnimatedLink>
        </motion.div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-card border border-red-500/30 bg-red-500/10 px-4 py-3 text-body-sm text-red-600"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {uploadMessage && (
        <div
          className={`flex items-start gap-2 rounded-card border px-4 py-3 text-body-sm font-medium ${
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
                {filesExtracted.length} arquivo(s) encontrado(s)
              </p>
            )}
          </div>
        </div>
      )}

      {formDirtyRef.current && form.name && !uploadMessage && (
        <div className="flex items-center justify-between rounded-card border border-base-600/50 bg-base-500/30 px-4 py-2 text-body-sm">
          <span className="text-base-700">Rascunho restaurado</span>
          <button type="button" onClick={handleDiscardDraft} className="text-red-500 hover:text-red-600">
            Descartar
          </button>
        </div>
      )}

      {/* ——— ZIP Upload ——— */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center gap-3 rounded-card border-2 border-dashed px-8 py-8 transition-all duration-200 ${
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
          onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); }}
        />
        {uploading ? (
          <>
            <Loader2 size={32} className="animate-spin text-limao-500" />
            <p className="text-body-md font-semibold text-ink-500">Processando ZIP...</p>
            <p className="text-body-sm text-base-700">Extraindo arquivos e analisando com IA</p>
          </>
        ) : zipFileName ? (
          <>
            <FileArchive size={32} className="text-limao-500" />
            <p className="text-body-md font-semibold text-ink-500">{zipFileName}</p>
            <p className="text-body-sm text-base-700">Clique ou arraste outro ZIP para substituir</p>
          </>
        ) : (
          <>
            <Upload size={32} className="text-base-700" />
            <p className="text-body-md font-semibold text-ink-500">
              Arraste um arquivo ZIP ou clique para selecionar
            </p>
            <p className="text-center text-body-sm text-base-700">
              Documentos do creator (aparência, ambientes, looks, voz) serão lidos pela IA e preencherão o formulário automaticamente
            </p>
          </>
        )}
      </div>

      {/* ——— Dados Básicos ——— */}
      <div className="rounded-card bg-surface-500 p-6 transition-shadow duration-[200ms] ease-[cubic-bezier(0.4,0,0.2,1)]">
        <h2 className="mb-6 text-heading-sm text-ink-500">Dados básicos</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="flex items-center gap-2 text-label-sm text-ink-500">
              Nome *
              {aiProcessed && form.name && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-limao-600">
                  <Sparkles size={10} /> IA
                </span>
              )}
            </label>
            <input
              id="name"
              type="text"
              required
              minLength={2}
              value={form.name}
              onChange={(e) => {
                const val = e.target.value;
                updateForm({ name: val, ...(autoSlug ? { slug: deriveSlug(val) } : {}) });
              }}
              placeholder="Ex.: Ninaah Dornfeld"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="slug" className="text-label-sm text-ink-500">
              Slug (identificador único)
            </label>
            <input
              id="slug"
              type="text"
              value={form.slug}
              onChange={(e) => { setAutoSlug(false); updateForm({ slug: e.target.value }); }}
              placeholder="ninaah-dornfeld"
              className={`${inputClass} font-mono`}
            />
            <p className="text-body-sm text-base-700">
              Gerado automaticamente a partir do nome. Use apenas letras, números e hífens.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-1.5">
          <label htmlFor="bio" className="flex items-center gap-2 text-label-sm text-ink-500">
            Bio
            {aiProcessed && form.bio && (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-limao-600">
                <Sparkles size={10} /> IA
              </span>
            )}
          </label>
          <textarea
            id="bio"
            rows={3}
            value={form.bio}
            onChange={(e) => updateForm({ bio: e.target.value })}
            placeholder="Breve descrição do creator..."
            className={inputClass}
          />
        </div>

        <div className="mt-6 flex flex-col gap-1.5">
          <label htmlFor="avatarUrl" className="text-label-sm text-ink-500">
            URL do avatar
          </label>
          <input
            id="avatarUrl"
            type="url"
            value={form.avatarUrl}
            onChange={(e) => updateForm({ avatarUrl: e.target.value })}
            placeholder="https://..."
            className={inputClass}
          />
        </div>

        {/* Metadata: idade, cidade, UF, plataformas */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="age" className="flex items-center gap-2 text-label-sm text-ink-500">
              Idade
              {aiProcessed && form.metadata?.age && (
                <span className="text-[10px] text-limao-600"><Sparkles size={10} /></span>
              )}
            </label>
            <input
              id="age"
              type="number"
              min={0}
              max={120}
              value={form.metadata?.age ?? ""}
              onChange={(e) =>
                updateForm({ metadata: { ...form.metadata, age: e.target.value ? Number(e.target.value) : undefined } })
              }
              placeholder="25"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="city" className="text-label-sm text-ink-500">Cidade</label>
            <input
              id="city"
              type="text"
              value={form.metadata?.city ?? ""}
              onChange={(e) => updateForm({ metadata: { ...form.metadata, city: e.target.value || undefined } })}
              placeholder="São Paulo"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="state" className="text-label-sm text-ink-500">UF</label>
            <input
              id="state"
              type="text"
              maxLength={2}
              value={form.metadata?.state ?? ""}
              onChange={(e) =>
                updateForm({ metadata: { ...form.metadata, state: e.target.value.toUpperCase() || undefined } })
              }
              placeholder="SP"
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-1.5">
          <label htmlFor="platforms" className="text-label-sm text-ink-500">
            Plataformas <span className="font-normal text-base-700">(separadas por vírgula)</span>
          </label>
          <input
            id="platforms"
            type="text"
            value={form.metadata?.platforms?.join(", ") ?? ""}
            onChange={(e) =>
              updateForm({
                metadata: { ...form.metadata, platforms: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) },
              })
            }
            placeholder="instagram, tiktok, youtube"
            className={inputClass}
          />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <input
            id="isActive"
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => updateForm({ isActive: e.target.checked })}
            className="h-4 w-4 rounded border-base-600 text-limao-500 transition-colors duration-[150ms] focus:ring-limao-500"
          />
          <label htmlFor="isActive" className="text-body-md text-ink-500">
            Creator ativo
          </label>
        </div>
      </div>

      {/* ——— Dados Avançados (IA) ——— */}
      {(aiProcessed || showAdvanced) && (
        <div className="rounded-card bg-surface-500 p-6">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex w-full items-center gap-2 text-heading-sm text-ink-500 hover:text-limao-600"
          >
            {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            Dados avançados (IA)
            {aiProcessed && (
              <span className="ml-2 flex items-center gap-1 rounded-full bg-limao-500/20 px-2 py-0.5 text-[10px] font-bold text-limao-600">
                <Sparkles size={10} /> Auto-preenchido
              </span>
            )}
          </button>

          {showAdvanced && (
            <div className="mt-4 flex flex-col gap-6">
              {/* Aparência */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 text-label-sm text-ink-500">
                  Aparência (base prompt)
                  {form.appearance?.basePrompt && <Check size={12} className="text-limao-500" />}
                </label>
                <textarea
                  rows={4}
                  value={form.appearance?.basePrompt ?? ""}
                  onChange={(e) =>
                    updateForm({
                      appearance: { ...form.appearance, basePrompt: e.target.value, markers: form.appearance?.markers ?? [] },
                    })
                  }
                  placeholder="Prompt descrevendo aparência física do creator..."
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm text-ink-500">
                  Marcadores visuais <span className="font-normal text-base-700">(separados por vírgula)</span>
                </label>
                <input
                  type="text"
                  value={form.appearance?.markers?.join(", ") ?? ""}
                  onChange={(e) =>
                    updateForm({
                      appearance: {
                        ...form.appearance,
                        basePrompt: form.appearance?.basePrompt ?? "",
                        markers: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
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
                  <label className="flex items-center gap-2 text-label-sm text-ink-500">
                    Ambientes ({form.environments.length})
                    <Check size={12} className="text-limao-500" />
                  </label>
                  {form.environments.map((env, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-card border border-base-600/50 px-4 py-3">
                      <div className="flex-1">
                        <p className="text-body-sm font-semibold text-ink-500">{env.name}</p>
                        {env.description && <p className="text-body-sm text-base-700">{env.description}</p>}
                        <p className="mt-1 text-body-sm italic text-base-700">{env.prompt.slice(0, 100)}{env.prompt.length > 100 ? "..." : ""}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { const u = [...form.environments!]; u.splice(i, 1); updateForm({ environments: u }); }}
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
                  <label className="flex items-center gap-2 text-label-sm text-ink-500">
                    Looks ({form.looks.length})
                    <Check size={12} className="text-limao-500" />
                  </label>
                  {form.looks.map((look, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-card border border-base-600/50 px-4 py-3">
                      <div className="flex-1">
                        <p className="text-body-sm font-semibold text-ink-500">{look.name}</p>
                        {look.description && <p className="text-body-sm text-base-700">{look.description}</p>}
                        <p className="mt-1 text-body-sm italic text-base-700">{look.prompt.slice(0, 100)}{look.prompt.length > 100 ? "..." : ""}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { const u = [...form.looks!]; u.splice(i, 1); updateForm({ looks: u }); }}
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
                  <label className="flex items-center gap-2 text-label-sm text-ink-500">
                    Voz <Check size={12} className="text-limao-500" />
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-semibold uppercase text-base-700">Tom</span>
                      <input
                        type="text"
                        value={form.voice.tone ?? ""}
                        onChange={(e) => updateForm({ voice: { ...form.voice, tone: e.target.value } })}
                        className={inputClass}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-semibold uppercase text-base-700">Estilo</span>
                      <input
                        type="text"
                        value={form.voice.style ?? ""}
                        onChange={(e) => updateForm({ voice: { ...form.voice, style: e.target.value } })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ——— Botões ——— */}
      <div className="flex flex-wrap items-center gap-4">
        <motion.button
          type="submit"
          disabled={loading || uploading}
          className="rounded-button bg-limao-500 px-6 py-3 text-label-md font-semibold text-ink-500 disabled:opacity-50"
          whileHover={{ scale: 1.03, backgroundColor: "#DFFF33" }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        >
          {loading ? "Criando…" : "Criar creator"}
        </motion.button>
        <motion.button
          type="button"
          onClick={handleSaveAsDraft}
          disabled={loading || uploading}
          className="rounded-button border border-base-600 bg-surface-500 px-5 py-3 text-label-md font-semibold text-ink-500 disabled:opacity-50"
          whileHover={{ scale: 1.03, backgroundColor: "rgba(213,210,201,0.5)" }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        >
          Salvar como rascunho
        </motion.button>
        <motion.div
          whileHover={{ scale: 1.03, backgroundColor: "rgba(213,210,201,0.5)" }}
          whileTap={{ scale: 0.96 }}
          style={{ borderRadius: "18px" }}
          transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <AnimatedLink
            href="/creators"
            className="block rounded-button border border-base-600 bg-surface-500 px-6 py-3 text-label-md text-ink-500"
          >
            Cancelar
          </AnimatedLink>
        </motion.div>
      </div>
    </form>
  );
}
