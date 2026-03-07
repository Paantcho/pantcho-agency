"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatedLink } from "@/components/ui/animated-link";
import {
  User,
  Palette,
  MapPin,
  Shirt,
  Mic,
  Sparkles,
  Pencil,
  Plus,
  FileEdit,
} from "lucide-react";
import type { CreatorDetail } from "../actions";
import { updateCreator } from "../actions";
import CreatorOverviewTab from "./tabs/creator-overview-tab";
import CreatorAppearanceTab from "./tabs/creator-appearance-tab";
import CreatorEnvironmentsTab from "./tabs/creator-environments-tab";
import CreatorLooksTab from "./tabs/creator-looks-tab";
import CreatorVoiceTab from "./tabs/creator-voice-tab";

const tabs = [
  { id: "overview", label: "Visão geral", icon: User },
  { id: "appearance", label: "Aparência", icon: Palette },
  { id: "environments", label: "Ambientes", icon: MapPin },
  { id: "looks", label: "Look library", icon: Shirt },
  { id: "voice", label: "Tom de voz", icon: Mic },
] as const;

type TabId = (typeof tabs)[number]["id"];

const tabActions: Record<
  TabId,
  { primary?: { label: string; icon: React.ElementType }; secondary?: { label: string; icon: React.ElementType } }
> = {
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
    <div className="hubia-fade-in flex flex-col gap-6">
      {/* Creator inativa: destaque com botão Reativar */}
      {!creator.isActive && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-base-600 bg-surface-500 p-4">
          <p className="text-label-md font-semibold text-ink-500">
            Creator inativa
          </p>
          <button
            type="button"
            onClick={handleReativar}
            disabled={reactivating}
            className="motion-soft hubia-pressable rounded-button bg-limao-500 px-4 py-2 text-label-md font-semibold text-ink-500 hover:bg-limao-400 disabled:opacity-50"
          >
            {reactivating ? "Reativando…" : "Reativar"}
          </button>
        </div>
      )}

      {/* Breadcrumb: Creators > Nome + botões por aba */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-body-md text-base-700">
          <AnimatedLink
            href="/creators"
            className="motion-soft hover:text-ink-500"
          >
            Creators
          </AnimatedLink>
          <span aria-hidden>›</span>
          <span className="font-medium text-ink-500">{creator.name}</span>
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          {actions?.secondary && (
            <button
              type="button"
              onClick={() => activeTab === "voice" && setVoiceEditModalOpen(true)}
              className="motion-soft hubia-pressable flex items-center gap-2 rounded-button border border-base-600 bg-surface-500 px-4 py-2 text-label-md text-ink-500 hover:bg-base-500"
            >
              <actions.secondary.icon size={16} />
              {actions.secondary.label}
            </button>
          )}
          {actions?.primary && (
            <button
              type="button"
              className="motion-soft hubia-pressable flex items-center gap-2 rounded-button bg-limao-500 px-4 py-2 text-label-md font-semibold text-ink-500 hover:bg-limao-400"
            >
              <actions.primary.icon size={16} />
              {actions.primary.label}
            </button>
          )}
        </div>
      </div>

      {/* Tabs: Visão geral, Aparência, Ambientes, Look library, Tom de voz */}
      <div className="inline-flex w-fit items-center gap-[4px] rounded-card bg-surface-500 p-[6px]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`motion-soft flex items-center gap-2 rounded-button px-[20px] py-[10px] text-label-md ${
                isActive
                  ? "bg-limao-500 font-bold text-ink-500"
                  : "bg-surface-500 text-base-700 hover:bg-base-500 hover:text-ink-500"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Conteúdo da aba */}
      <div className="min-h-[200px] transition-opacity duration-[200ms]">
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
