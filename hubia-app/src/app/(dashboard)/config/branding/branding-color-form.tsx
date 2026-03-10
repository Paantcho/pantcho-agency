"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { HubiaPageAction } from "@/components/ui/hubia-page-action";
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
          className="w-48 rounded-input border border-base-600 bg-sand-300 px-4 py-3 text-body-md text-ink-500 outline-none transition-[border-color] duration-150 focus:border-ink-500 focus:ring-2 focus:ring-ink-500/10"
        />
      </div>
      <HubiaPageAction
        type="submit"
        icon={Check}
        iconRotate={false}
        disabled={loading}
        loading={loading}
        loadingText="Salvando…"
      >
        Salvar
      </HubiaPageAction>
      {message === "ok" && (
        <span className="text-body-sm text-limao-600">Salvo.</span>
      )}
      {message === "error" && (
        <span className="text-body-sm text-red-600">Erro ao salvar.</span>
      )}
    </form>
  );
}
