"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Check, X } from "lucide-react";
import { HubiaModal } from "@/components/ui/hubia-modal";
import type { CreatorDetail } from "../../actions";
import { upsertCreatorVoice } from "../../actions";

const inputClass =
  "w-full rounded-input border-0 bg-[var(--hubia-bg-base-500)] px-4 py-3 text-body-md font-semibold text-ink-500 outline-none focus:ring-2 focus:ring-limao-500/30";

export default function CreatorVoiceTab({
  creator,
  organizationId,
  voiceEditModalOpen,
  onCloseVoiceEdit,
}: {
  creator: CreatorDetail;
  organizationId: string;
  voiceEditModalOpen?: boolean;
  onCloseVoiceEdit?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [tone, setTone] = useState(creator.voice?.tone ?? "");
  const [style, setStyle] = useState(creator.voice?.style ?? "");
  const open = voiceEditModalOpen ?? false;
  const onClose = onCloseVoiceEdit ?? (() => {});

  useEffect(() => {
    if (open) {
      setTone(creator.voice?.tone ?? "");
      setStyle(creator.voice?.style ?? "");
      setErrorText(null);
    }
  }, [open, creator.voice?.tone, creator.voice?.style]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorText(null);
    setLoading(true);
    const result = await upsertCreatorVoice(organizationId, creator.id, {
      tone: tone.trim() || null,
      style: style.trim() || null,
      rules: creator.voice?.rules ?? [],
      examples: creator.voice?.examples ?? [],
    });
    setLoading(false);
    if (result.ok) {
      onClose();
      router.refresh();
    } else {
      setErrorText(result.error ?? "Erro ao salvar.");
    }
  }

  const tomGeral = tone || style || "Leve, feminino, confiante sem arrogância. Tom que transmite naturalidade e autenticidade.";
  const instagramText = "Tom alinhado ao feed: estético, momentos do dia, legendas curtas.";
  const privacyText = "Conteúdo mais pessoal e exclusivo. Tom íntimo sem perder a identidade.";
  const tiktokText = "Dinâmico, trend-friendly, legendas que engajam.";
  const usaTerms = ["sutil", "moment", "vibe", "aesthetic"];
  const evitaTerms = ["gírias forçadas", "'arrasa'", "'lacrou'"];
  const usaEmojis = "👋 ✨ ⭐";
  const evitaEmojis = "🔥 😈 💪 😭 (excesso) — exceto em plataformas +18";
  const exemplosLegendas = [
    "As vezes o melhor plano é não ter plano.",
    "Luz boa, café bom, dia bom.",
    "Detalhes.",
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Banner escuro — regra tom de voz */}
      <div className="flex gap-4 rounded-card border border-limao-500/30 bg-ink-500 p-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-400 text-limao-500">
          <Heart className="h-5 w-5" />
        </div>
        <p className="text-body-md font-semibold text-white">
          CRIAR UM TEXTO DE INTRODUÇÃO DIZENDO COMO É O MOOD DE VOZ DA CREATOR… E COLOCAR COMO REGRA SUPREMA PARA NÃO MUDAR E SEMPRE PASSAR PELO REVISOR.
        </p>
      </div>

      {/* Grid de cards */}
      {/* Tom Geral — full width */}
      <div className="rounded-[16px] p-6" style={{ background: "#FFFFFF" }}>
        <h3 className="font-bold text-ink-500" style={{ fontSize: "17px" }}>Tom Geral</h3>
        <p className="mt-2 text-base-700" style={{ fontSize: "14px", lineHeight: "1.6" }}>{tomGeral}</p>
      </div>

      {/* Instagram / Privacy / Tiktok — 3 colunas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-[16px] p-6" style={{ background: "#FFFFFF" }}>
          <h3 className="font-bold text-ink-500" style={{ fontSize: "17px" }}>Instagram</h3>
          <p className="mt-2 text-base-700" style={{ fontSize: "13px", lineHeight: "1.6" }}>{instagramText}</p>
        </div>
        <div className="rounded-[16px] p-6" style={{ background: "#FFFFFF" }}>
          <h3 className="font-bold text-ink-500" style={{ fontSize: "17px" }}>Privacy / onlyfans</h3>
          <p className="mt-2 text-base-700" style={{ fontSize: "13px", lineHeight: "1.6" }}>{privacyText}</p>
        </div>
        <div className="rounded-[16px] p-6" style={{ background: "#FFFFFF" }}>
          <h3 className="font-bold text-ink-500" style={{ fontSize: "17px" }}>Tiktok</h3>
          <p className="mt-2 text-base-700" style={{ fontSize: "13px", lineHeight: "1.6" }}>{tiktokText}</p>
        </div>
      </div>

      {/* Vocabulário / Emojis / Exemplos de Legendas — 3 colunas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-[16px] p-6" style={{ background: "#FFFFFF" }}>
          <h3 className="font-bold text-ink-500" style={{ fontSize: "17px" }}>Vocabulário</h3>
          <div className="mt-4 space-y-3">
            <div>
              <span className="flex items-center gap-2 font-semibold text-green-700" style={{ fontSize: "13px" }}>
                <Check className="h-4 w-4" /> USA
              </span>
              <p className="mt-1 text-base-700" style={{ fontSize: "13px" }}>
                {usaTerms.join(", ")}
              </p>
            </div>
            <div>
              <span className="flex items-center gap-2 font-semibold text-pink-600" style={{ fontSize: "13px" }}>
                <X className="h-4 w-4" /> EVITA
              </span>
              <p className="mt-1 text-base-700" style={{ fontSize: "13px" }}>
                {evitaTerms.join(", ")}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-[16px] p-6" style={{ background: "#FFFFFF" }}>
          <h3 className="font-bold text-ink-500" style={{ fontSize: "17px" }}>Emojis</h3>
          <div className="mt-4 space-y-3">
            <div>
              <span className="flex items-center gap-2 font-semibold text-green-700" style={{ fontSize: "13px" }}>
                <Check className="h-4 w-4" /> USA
              </span>
              <p className="mt-1 text-base-700" style={{ fontSize: "13px" }}>{usaEmojis}</p>
            </div>
            <div>
              <span className="flex items-center gap-2 font-semibold text-pink-600" style={{ fontSize: "13px" }}>
                <X className="h-4 w-4" /> EVITA
              </span>
              <p className="mt-1 text-base-700" style={{ fontSize: "13px" }}>{evitaEmojis}</p>
            </div>
          </div>
        </div>
        <div className="rounded-[16px] p-6" style={{ background: "#FFFFFF" }}>
          <h3 className="font-bold text-ink-500" style={{ fontSize: "17px" }}>Exemplos de Legendas</h3>
          <ul className="mt-4 space-y-2" style={{ fontSize: "13px", color: "var(--hubia-ink-400)" }}>
            {exemplosLegendas.map((ex) => (
              <li key={ex}>{ex}</li>
            ))}
          </ul>
        </div>
      </div>

      <HubiaModal
        open={open}
        onClose={onClose}
        title="Editar tom de voz"
        maxWidth="min(90vw, 480px)"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {errorText && (
            <div className="rounded-card border border-red-500/30 bg-red-500/10 px-4 py-3 text-body-sm font-semibold text-red-600">
              {errorText}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-semibold text-ink-500">Tom</label>
            <input type="text" value={tone} onChange={(e) => setTone(e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-semibold text-ink-500">Estilo</label>
            <textarea rows={2} value={style} onChange={(e) => setStyle(e.target.value)} className={inputClass} />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-button bg-limao-500 px-4 py-2 text-label-sm font-semibold text-ink-500 hover:bg-limao-400 disabled:opacity-50"
            >
              {loading ? "Salvando…" : "Salvar"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-button border-0 bg-[var(--hubia-bg-base-500)] px-4 py-2 text-label-sm font-semibold text-ink-500 hover:opacity-90"
            >
              Cancelar
            </button>
          </div>
        </form>
      </HubiaModal>
    </div>
  );
}
