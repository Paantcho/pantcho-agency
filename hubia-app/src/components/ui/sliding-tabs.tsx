"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface SlideTab {
  id: string;
  label: string;
  icon?: LucideIcon;
  iconClass?: string;
}

interface SlidingTabsProps {
  tabs: SlideTab[];
  activeId: string;
  onChange: (id: string) => void;
}

/**
 * Tabs horizontais com pill spring.
 * UMA motion.div absoluta se move. Botões inativos têm hover areia + whileTap.
 */
export function SlidingTabs({ tabs, activeId, onChange }: SlidingTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>(Array(tabs.length).fill(null));

  const [pillLeft, setPillLeft] = useState(0);
  const [pillWidth, setPillWidth] = useState(0);

  useEffect(() => {
    const idx = tabs.findIndex((t) => t.id === activeId);
    const btn = btnRefs.current[idx];
    const container = containerRef.current;
    if (!btn || !container) return;
    const containerRect = container.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setPillLeft(btnRect.left - containerRect.left);
    setPillWidth(btnRect.width);
  }, [activeId, tabs]);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center rounded-[20px] p-1.5"
      style={{ background: "#FFFFFF" }}
    >
      {/* Pill deslizante spring */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute rounded-[9999px]"
        animate={{ left: pillLeft, width: pillWidth }}
        transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.8 }}
        style={{ top: 6, bottom: 6, background: "#D7FF00" }}
      />

      {tabs.map((tab, idx) => {
        const isActive = tab.id === activeId;
        const Icon = tab.icon;
        return (
          <motion.button
            key={tab.id}
            ref={(el) => { btnRefs.current[idx] = el; }}
            type="button"
            onClick={() => onChange(tab.id)}
            className="group relative z-10 flex items-center gap-2 rounded-[9999px]"
            style={{
              fontSize: "13px",
              padding: "8px 18px",
              color: isActive ? "#0E0F10" : "#A9AAA5",
              fontWeight: isActive ? 700 : 500,
              background: "transparent",
            }}
            whileHover={
              isActive
                ? {}
                : { color: "#0E0F10", backgroundColor: "rgba(213,210,201,0.35)" }
            }
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
          >
            {Icon && (
              <Icon
                size={14}
                className={`shrink-0 transition-colors duration-150 ${
                  isActive ? "" : `group-hover:text-[#0E0F10] ${tab.iconClass ?? ""}`
                }`}
              />
            )}
            {tab.label}
          </motion.button>
        );
      })}
    </div>
  );
}
