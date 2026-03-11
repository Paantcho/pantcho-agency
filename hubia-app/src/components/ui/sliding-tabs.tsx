"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

export interface SlideTab {
  id: string;
  label: string;
  icon?: React.ElementType;
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
 * O ícone usa variante "hovered" que propaga do pai para o filho automaticamente.
 */

const iconVariants = {
  rest: { scale: 1 },
  hovered: { scale: 1.2 },
};

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
      className="relative inline-flex items-center rounded-[30px] p-1.5"
      style={{ background: "var(--hubia-surface-default-500)" }}
    >
      {/* Pill deslizante spring */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute rounded-[9999px]"
        animate={{ left: pillLeft, width: pillWidth }}
        transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.8 }}
        style={{ top: 6, bottom: 6, background: "var(--hubia-limao-500)" }}
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
            initial="rest"
            whileHover={!isActive ? "hovered" : "rest"}
            whileTap={{ scale: 0.97 }}
            animate="rest"
            className="relative z-10 flex items-center gap-2 rounded-[9999px]"
            style={{
              fontSize: "13px",
              padding: "8px 18px",
              color: isActive ? "var(--hubia-ink-500)" : "var(--hubia-bg-base-700)",
              fontWeight: isActive ? 700 : 600,
              background: "transparent",
            }}
            variants={{
              rest: { color: isActive ? "var(--hubia-ink-500)" : "var(--hubia-bg-base-700)", backgroundColor: "rgba(0,0,0,0)" },
              hovered: { color: "var(--hubia-ink-500)", backgroundColor: "rgba(213,210,201,0.35)" },
            }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
          >
            {Icon && (
              <motion.span
                className="shrink-0 flex items-center"
                variants={!isActive ? iconVariants : undefined}
                transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <Icon size={14} />
              </motion.span>
            )}
            {tab.label}
          </motion.button>
        );
      })}
    </div>
  );
}
