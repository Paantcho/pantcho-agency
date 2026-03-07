"use client";

import { useState } from "react";
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
          className="w-48 rounded-input border-none bg-sand-300 px-4 py-3 text-body-md text-ink-500 outline-none focus:ring-2 focus:ring-limao-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-button bg-limao-500 px-6 py-3 text-label-md text-ink-500 transition-colors hover:bg-limao-400 disabled:opacity-50"
      >
        {loading ? "Salvando…" : "Salvar"}
      </button>
      {message === "ok" && (
        <span className="text-body-sm text-limao-600">Salvo.</span>
      )}
      {message === "error" && (
        <span className="text-body-sm text-red-600">Erro ao salvar.</span>
      )}
    </form>
  );
}
