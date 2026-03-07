"use client";

import Link from "next/link";
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
    <div className="flex flex-col gap-[24px]">
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
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-button px-[20px] py-[10px] transition-colors duration-200 ${
                isActive
                  ? "bg-limao-500 text-ink-500 text-label-md font-bold"
                  : "bg-surface-500 text-base-700 text-label-md hover:bg-base-500 hover:text-ink-500"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Tab content */}
      {children}
    </div>
  );
}
