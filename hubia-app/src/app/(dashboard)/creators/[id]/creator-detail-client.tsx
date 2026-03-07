"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatedLink } from "@/components/ui/animated-link";
import { Sparkles, Pencil, Plus, FileEdit, User, Palette, MapPin, Shirt, Mic } from "lucide-react";
import type { CreatorDetail } from "../actions";
import { updateCreator } from "../actions";
import CreatorOverviewTab from "./tabs/creator-overview-tab";
import CreatorAppearanceTab from "./tabs/creator-appearance-tab";
import CreatorEnvironmentsTab from "./tabs/creator-environments-tab";
import CreatorLooksTab from "./tabs/creator-looks-tab";
import CreatorVoiceTab from "./tabs/creator-voice-tab";

const TABS = [
  { id: "overview", label: "Visão geral", icon: User },
  { id: "appearance", label: "Aparência", icon: Palette },
  { id: "environments", label: "Ambientes", icon: MapPin },
  { id: "looks", label: "Look library", icon: Shirt },
  { id: "voice", label: "Tom de voz", icon: Mic },
] as const;

type TabId = (typeof TABS)[number]["id"];

type TabActions = {
  primary?: { label: string; icon: React.ElementType };
  secondary?: { label: string; icon: React.ElementType };
};

const tabActions: Record<TabId, TabActions> = {
  overview: {
    primary: { label: "Gerar prompt", icon: Sparkles },
  },
  appearance: {
    primary: { label: "Gerar prompt", icon: Sparkles },
    secondary: { label: "Editar aparência", icon: Pencil },
  },
  environments: {
    primary: { label: "Adicionar ambiente", icon: Plus },
    secondary: { label: "Editar ambientes", icon: Pencil },
  },
  looks: {
    primary: { label: "Adicionar look", icon: Plus },
    secondary: { label: "Editar look library", icon: FileEdit },
  },
  voice: {
    primary: { label: "Adicionar tom de voz", icon: Plus },
    secondary: { label: "Editar tom de voz", icon: Pencil },
  },
};

export default function CreatorDetailClient({
  creator,
  organizationId,
}: {
  creator: CreatorDetail;
  organizationId: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [reactivating, setReactivating] = useState(false);
  const [voiceEditModalOpen, setVoiceEditModalOpen] = useState(false);
  const actions = tabActions[activeTab];

  async function handleReativar() {
    setReactivating(true);
    const result = await updateCreator(organizationId, creator.id, { isActive: true });
    setReactivating(false);
    if (result.ok) router.refresh();
  }

  return (
    <div className="hubia-fade-in flex flex-col gap-5">
      {/* Creator inativa: banner de aviso */}
      {!creator.isActive && (
        <div
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4"
          style={{ borderColor: "#D9D9D4", background: "#FFFFFF" }}
        >
          <p className="font-semibold" style={{ fontSize: "14px", color: "#0E0F10" }}>
            Creator inativa
          </p>
          <button
            type="button"
            onClick={handleReativar}
            disabled={reactivating}
            className="rounded-full font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "#D7FF00", color: "#0E0F10", fontSize: "13px", padding: "8px 20px" }}
          >
            {reactivating ? "Reativando…" : "Reativar"}
          </button>
        </div>
      )}

      {/* Cabeçalho: breadcrumb + botões por aba */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex items-center gap-1.5" style={{ fontSize: "14px", color: "#A9AAA5" }}>
          <AnimatedLink href="/creators" className="transition-colors hover:text-[#0E0F10]" style={{ color: "#A9AAA5" }}>
            Creators
          </AnimatedLink>
          <span aria-hidden style={{ color: "#D9D9D4" }}>›</span>
          <span className="font-semibold" style={{ color: "#0E0F10" }}>{creator.name}</span>
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          {actions?.secondary && (
            <button
              type="button"
              onClick={() => activeTab === "voice" && setVoiceEditModalOpen(true)}
              className="flex items-center gap-2 rounded-full border font-semibold transition-colors duration-200 hover:bg-[#EEEFE9]"
              style={{
                borderColor: "#D9D9D4",
                color: "#0E0F10",
                fontSize: "13px",
                padding: "9px 18px",
                background: "transparent",
              }}
            >
              <actions.secondary.icon size={14} />
              {actions.secondary.label}
            </button>
          )}
          {actions?.primary && (
            <button
              type="button"
              className="flex items-center gap-2 rounded-full font-bold transition-opacity hover:opacity-90 active:scale-95"
              style={{ background: "#D7FF00", color: "#0E0F10", fontSize: "13px", padding: "9px 18px" }}
            >
              <actions.primary.icon size={14} />
              {actions.primary.label}
            </button>
          )}
        </div>
      </div>

      {/* Tabs — com ícones, fundo surface, ativa em Limão */}
      <div
        className="inline-flex items-center gap-1 rounded-[20px] p-1.5"
        style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(14,15,16,0.06)" }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 rounded-2xl transition-all duration-200"
              style={{
                fontSize: "13px",
                padding: "8px 18px",
                background: isActive ? "#D7FF00" : "transparent",
                color: isActive ? "#0E0F10" : "#A9AAA5",
                fontWeight: isActive ? 700 : 500,
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Conteúdo da aba */}
      <div className="min-h-[200px]">
        {activeTab === "overview" && (
          <CreatorOverviewTab creator={creator} organizationId={organizationId} />
        )}
        {activeTab === "appearance" && (
          <CreatorAppearanceTab creator={creator} organizationId={organizationId} />
        )}
        {activeTab === "environments" && (
          <CreatorEnvironmentsTab creator={creator} organizationId={organizationId} />
        )}
        {activeTab === "looks" && (
          <CreatorLooksTab creator={creator} organizationId={organizationId} />
        )}
        {activeTab === "voice" && (
          <CreatorVoiceTab
            creator={creator}
            organizationId={organizationId}
            voiceEditModalOpen={voiceEditModalOpen}
            onCloseVoiceEdit={() => setVoiceEditModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
