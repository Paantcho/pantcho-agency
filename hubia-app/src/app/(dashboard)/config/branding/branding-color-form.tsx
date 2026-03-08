"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { updateBranding } from "./actions";

export default function BrandingColorForm({
  organizationId,
  initialColor,
}: {
  organizationId: string;
  initialColor: string;
}) {
  const [color, setColor] = useState(initialColor);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<"ok" | "error" | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const result = await updateBranding(organizationId, { colorPrimary: color });
    setLoading(false);
    if (result.ok) setMessage("ok");
    else setMessage("error");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex items-end gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-label-sm text-ink-500">Código hexadecimal</label>
        <input
          type="text"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          pattern="^#[0-9A-Fa-f]{6}$"
          placeholder="#D7FF00"
          className="w-48 rounded-input border border-base-600 bg-sand-300 px-4 py-3 text-body-md text-ink-500 outline-none transition-[border-color,box-shadow] duration-150 focus:border-ink-500 focus:shadow-[0_0_0_3px_rgba(14,15,16,0.08)]"
        />
      </div>
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
      {message === "ok" && (
        <span className="text-body-sm text-limao-600">Salvo.</span>
      )}
      {message === "error" && (
        <span className="text-body-sm text-red-600">Erro ao salvar.</span>
      )}
    </form>
  );
}
