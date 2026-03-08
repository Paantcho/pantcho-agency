"use client";

import { useRef, useState, useEffect } from "react";
import { AnimatedLink } from "@/components/ui/animated-link";
import { TabContent } from "@/components/ui/tab-content";
import { usePathname } from "next/navigation";

const configTabs = [
  { label: "Equipe", href: "/config/equipe" },
  { label: "Branding", href: "/config/branding" },
  { label: "Provedores IA", href: "/config/provedores" },
];

export default function ConfigLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const activeIdx = configTabs.findIndex(
    (t) => pathname === t.href || pathname.startsWith(t.href + "/")
  );

  // Direção para animação de conteúdo
  const prevIdxRef = useRef(activeIdx >= 0 ? activeIdx : 0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const newIdx = activeIdx >= 0 ? activeIdx : 0;
    if (newIdx !== prevIdxRef.current) {
      setDirection(newIdx > prevIdxRef.current ? 1 : -1);
      prevIdxRef.current = newIdx;
    }
  }, [activeIdx]);

  // Pill deslizante
  const containerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>(Array(configTabs.length).fill(null));
  const [pillLeft, setPillLeft] = useState(0);
  const [pillWidth, setPillWidth] = useState(0);

  useEffect(() => {
    const idx = activeIdx >= 0 ? activeIdx : 0;
    const el = linkRefs.current[idx];
    const container = containerRef.current;
    if (!el || !container) return;
    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    setPillLeft(eRect.left - cRect.left);
    setPillWidth(eRect.width);
  }, [activeIdx]);

  return (
    <div className="hubia-fade-in flex flex-col gap-[24px]">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-heading-md text-ink-500">Config</h1>
      </div>

      {/* Tab navigation — pill deslizante horizontal */}
      <div
        ref={containerRef}
        className="relative inline-flex w-fit items-center rounded-[20px] p-1.5"
        style={{ background: "#FFFFFF" }}
      >
        {/* Pill */}
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

        {configTabs.map((tab, idx) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <AnimatedLink
              key={tab.href}
              href={tab.href}
              ref={(el) => { linkRefs.current[idx] = el; }}
              className="relative z-10 rounded-[14px]"
              style={{
                fontSize: "13px",
                padding: "8px 20px",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "#0E0F10" : "#A9AAA5",
                transition: "color 150ms cubic-bezier(0.4, 0, 0.2, 1)",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              {tab.label}
            </AnimatedLink>
          );
        })}
      </div>

      {/* Tab content — animação direcional */}
      <TabContent tabKey={pathname} direction={direction}>
        {children}
      </TabContent>
    </div>
  );
}
