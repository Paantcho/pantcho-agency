"use client";

import { AnimatedLink } from "@/components/ui/animated-link";
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

  return (
    <div className="hubia-fade-in flex flex-col gap-[24px]">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-heading-md text-ink-500">Config</h1>
      </div>

      {/* Tab navigation */}
      <div className="inline-flex w-fit items-center gap-[4px] rounded-card bg-surface-500 p-[6px]">
        {configTabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");

          return (
            <AnimatedLink
              key={tab.href}
              href={tab.href}
              className={`motion-soft rounded-button px-[20px] py-[10px] text-label-md ${
                isActive
                  ? "bg-limao-500 font-bold text-ink-500"
                  : "bg-surface-500 text-base-700 hover:bg-base-500 hover:text-ink-500"
              }`}
            >
              {tab.label}
            </AnimatedLink>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="motion-soft">{children}</div>
    </div>
  );
}
