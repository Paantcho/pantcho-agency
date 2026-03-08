"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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

  // Pill deslizante das tabs
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabBtnRefs = useRef<(HTMLButtonElement | null)[]>(Array(TABS.length).fill(null));
  const [pillLeft, setPillLeft] = useState(0);
  const [pillWidth, setPillWidth] = useState(0);

  useEffect(() => {
    const idx = TABS.findIndex((t) => t.id === activeTab);
    const btn = tabBtnRefs.current[idx];
    const container = tabsContainerRef.current;
    if (!btn || !container) return;
    const cRect = container.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();
    setPillLeft(bRect.left - cRect.left);
    setPillWidth(bRect.width);
  }, [activeTab]);

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
          <motion.button
            type="button"
            onClick={handleReativar}
            disabled={reactivating}
            className="rounded-full font-bold disabled:opacity-50"
            style={{ background: "#D7FF00", color: "#0E0F10", fontSize: "13px", padding: "8px 20px" }}
            whileHover={{ scale: 1.03, backgroundColor: "#DFFF33" }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {reactivating ? "Reativando…" : "Reativar"}
          </motion.button>
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
            <motion.button
              type="button"
              onClick={() => activeTab === "voice" && setVoiceEditModalOpen(true)}
              className="flex items-center gap-2 rounded-full border font-semibold"
              style={{
                borderColor: "#D9D9D4",
                color: "#0E0F10",
                fontSize: "13px",
                padding: "9px 18px",
                background: "transparent",
              }}
              initial="rest"
              whileHover="hovered"
              whileTap={{ scale: 0.96 }}
              animate="rest"
              variants={{
                rest: { backgroundColor: "transparent" },
                hovered: { scale: 1.03, backgroundColor: "#EEEFE9" },
              }}
              transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <motion.span
                className="flex items-center"
                variants={{ rest: { scale: 1 }, hovered: { scale: 1.2 } }}
                transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <actions.secondary.icon size={14} />
              </motion.span>
              {actions.secondary.label}
            </motion.button>
          )}
          {actions?.primary && (
            <motion.button
              type="button"
              className="flex items-center gap-2 rounded-full font-bold"
              style={{ background: "#D7FF00", color: "#0E0F10", fontSize: "13px", padding: "9px 18px" }}
              initial="rest"
              whileHover="hovered"
              whileTap={{ scale: 0.96 }}
              animate="rest"
              variants={{
                rest: { scale: 1, backgroundColor: "#D7FF00" },
                hovered: { scale: 1.03, backgroundColor: "#DFFF33" },
              }}
              transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <motion.span
                className="flex items-center"
                variants={{ rest: { scale: 1 }, hovered: { scale: 1.2 } }}
                transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <actions.primary.icon size={14} />
              </motion.span>
              {actions.primary.label}
            </motion.button>
          )}
        </div>
      </div>

      {/* Tabs — pill deslizante com spring */}
      <div
        ref={tabsContainerRef}
        className="relative inline-flex items-center rounded-[9999px] p-1.5"
        style={{ background: "#FFFFFF" }}
      >
        {/* Pill spring */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute rounded-[9999px]"
          animate={{ left: pillLeft, width: pillWidth }}
          transition={{
            type: "spring",
            stiffness: 420,
            damping: 30,
            mass: 0.8,
          }}
          style={{ top: 6, bottom: 6, background: "#D7FF00" }}
        />

        {TABS.map((tab, idx) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              ref={(el) => { tabBtnRefs.current[idx] = el; }}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="relative z-10 flex items-center gap-2 rounded-[9999px]"
              style={{
                fontSize: "13px",
                padding: "8px 18px",
                background: "transparent",
                color: isActive ? "#0E0F10" : "#A9AAA5",
                fontWeight: isActive ? 700 : 500,
              }}
              whileHover={
                isActive
                  ? {}
                  : { color: "#0E0F10", backgroundColor: "rgba(213,210,201,0.35)" }
              }
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            >
              <Icon size={14} />
              {tab.label}
            </motion.button>
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
