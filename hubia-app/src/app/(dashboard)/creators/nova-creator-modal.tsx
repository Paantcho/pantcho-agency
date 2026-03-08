"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HubiaModal } from "@/components/ui/hubia-modal";
import { createCreator } from "./actions";

const inputClass =
  "w-full rounded-input border-0 bg-[var(--hubia-bg-base-500)] px-4 py-3 text-body-md font-medium text-ink-500 outline-none placeholder:text-base-600 focus:ring-2 focus:ring-limao-500/30";

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
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  function deriveSlugFromName(value: string) {
    const s = value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setSlug(s);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await createCreator(organizationId, {
      name: name.trim(),
      slug: slug.trim() || undefined,
      bio: bio.trim() || null,
      avatarUrl: avatarUrl.trim() || null,
      isActive,
    });
    setLoading(false);
    if (result.ok) {
      onClose();
      router.refresh();
    } else {
      setError(result.error ?? "Erro ao criar.");
    }
  }

  return (
    <HubiaModal
      open={open}
      onClose={onClose}
      title="Nova creator"
      maxWidth="min(90vw, 560px)"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div
            role="alert"
            className="rounded-card border border-red-500/30 bg-red-500/10 px-4 py-3 text-body-sm font-medium text-red-600"
          >
            {error}
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="mc-name" className="text-label-sm font-semibold text-ink-500">
            Nome *
          </label>
          <input
            id="mc-name"
            type="text"
            required
            minLength={2}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slug || slug === name.toLowerCase().replace(/\s+/g, "-"))
                deriveSlugFromName(e.target.value);
            }}
            placeholder="Ex.: Ninaah Dornfeld"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="mc-slug" className="text-label-sm font-semibold text-ink-500">
            Slug
          </label>
          <input
            id="mc-slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="ninaah-dornfeld"
            className={`${inputClass} font-mono`}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="mc-bio" className="text-label-sm font-semibold text-ink-500">
            Bio
          </label>
          <textarea
            id="mc-bio"
            rows={2}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Breve descrição..."
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="mc-avatar" className="text-label-sm font-semibold text-ink-500">
            URL do avatar
          </label>
          <input
            id="mc-avatar"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            id="mc-active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-base-600 text-limao-500 focus:ring-limao-500"
          />
          <label htmlFor="mc-active" className="text-body-md font-medium text-ink-500">
            Creator ativa
          </label>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <motion.button
            type="submit"
            disabled={loading}
            className="rounded-button bg-limao-500 px-6 py-3 text-label-md font-semibold text-ink-500 disabled:opacity-50"
            whileHover={{ scale: 1.03, backgroundColor: "#DFFF33" }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {loading ? "Salvando…" : "Salvar"}
          </motion.button>
          <motion.button
            type="button"
            onClick={onClose}
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
