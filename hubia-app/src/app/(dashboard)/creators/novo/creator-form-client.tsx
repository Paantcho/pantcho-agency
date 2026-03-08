"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedLink } from "@/components/ui/animated-link";
import { ArrowLeft } from "lucide-react";
import { createCreator } from "../actions";

export default function CreatorFormClient({
  organizationId,
}: {
  organizationId: string;
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
      router.push(`/creators/${result.id}`);
      router.refresh();
    } else {
      setError(result.error ?? "Erro ao criar.");
    }
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
          className="rounded-card border border-red-500/30 bg-red-500/10 px-4 py-3 text-body-sm text-red-600"
        >
          {error}
        </div>
      )}

      <div className="rounded-card bg-surface-500 p-6 transition-shadow duration-[200ms] ease-[cubic-bezier(0.4,0,0.2,1)]">
        <h2 className="mb-6 text-heading-sm text-ink-500">Dados básicos</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-label-sm text-ink-500">
              Nome *
            </label>
            <input
              id="name"
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slug || slug === name.toLowerCase().replace(/\s+/g, "-")) {
                  deriveSlugFromName(e.target.value);
                }
              }}
              placeholder="Ex.: Ninaah Dornfeld"
              className="rounded-input border border-base-600 bg-surface-500 px-4 py-3 text-body-md text-ink-500 outline-none transition-colors duration-[150ms] placeholder:text-base-700 focus:border-limao-500 focus:ring-2 focus:ring-limao-500/20"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="slug" className="text-label-sm text-ink-500">
              Slug (identificador único)
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="ninaah-dornfeld"
              className="rounded-input border border-base-600 bg-surface-500 px-4 py-3 font-mono text-body-md text-ink-500 outline-none transition-colors duration-[150ms] placeholder:text-base-700 focus:border-limao-500 focus:ring-2 focus:ring-limao-500/20"
            />
            <p className="text-body-sm text-base-700">
              Gerado automaticamente a partir do nome. Use apenas letras, números e hífens.
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-1.5">
          <label htmlFor="bio" className="text-label-sm text-ink-500">
            Bio
          </label>
          <textarea
            id="bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Breve descrição do creator..."
            className="rounded-input border border-base-600 bg-surface-500 px-4 py-3 text-body-md text-ink-500 outline-none transition-colors duration-[150ms] placeholder:text-base-700 focus:border-limao-500 focus:ring-2 focus:ring-limao-500/20"
          />
        </div>
        <div className="mt-6 flex flex-col gap-1.5">
          <label htmlFor="avatarUrl" className="text-label-sm text-ink-500">
            URL do avatar (simulado)
          </label>
          <input
            id="avatarUrl"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
            className="rounded-input border border-base-600 bg-surface-500 px-4 py-3 text-body-md text-ink-500 outline-none transition-colors duration-[150ms] placeholder:text-base-700 focus:border-limao-500 focus:ring-2 focus:ring-limao-500/20"
          />
          <p className="text-body-sm text-base-700">
            Por enquanto use uma URL externa. Upload será integrado depois.
          </p>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <input
            id="isActive"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-base-600 text-limao-500 transition-colors duration-[150ms] focus:ring-limao-500"
          />
          <label htmlFor="isActive" className="text-body-md text-ink-500">
            Creator ativo
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <motion.button
          type="submit"
          disabled={loading}
          className="rounded-button bg-limao-500 px-6 py-3 text-label-md font-semibold text-ink-500 disabled:opacity-50"
          whileHover={{ scale: 1.03, backgroundColor: "#DFFF33" }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        >
          {loading ? "Criando…" : "Criar creator"}
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
