"use client";

import { useRef, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";

export interface SlideTab {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface SlidingTabsProps {
  tabs: SlideTab[];
  activeId: string;
  onChange: (id: string) => void;
}

/**
 * Tabs horizontais com pill deslizante — mesmo princípio da sidebar.
 * UMA <div> absoluta se move via left + width calculados do ref do botão ativo.
 * Transição: left/width 300ms cubic-bezier(0.2, 0, 0.0, 1) — ease-emp igual à sidebar.
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
      {/* Pill deslizante */}
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-[14px]"
        style={{
          left: pillLeft,
          width: pillWidth,
          top: 6,
          bottom: 6,
          background: "#D7FF00",
          transition:
            "left 300ms cubic-bezier(0.2, 0, 0.0, 1), width 300ms cubic-bezier(0.2, 0, 0.0, 1)",
        }}
      />

      {tabs.map((tab, idx) => {
        const isActive = tab.id === activeId;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            ref={(el) => { btnRefs.current[idx] = el; }}
            type="button"
            onClick={() => onChange(tab.id)}
            className="relative z-10 flex items-center gap-2 rounded-[14px]"
            style={{
              fontSize: "13px",
              padding: "8px 18px",
              color: isActive ? "#0E0F10" : "#A9AAA5",
              fontWeight: isActive ? 700 : 500,
              transition: "color 150ms cubic-bezier(0.4, 0, 0.2, 1)",
              background: "transparent",
            }}
          >
            {Icon && <Icon size={14} />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
