"use client";

import { usePathname } from "next/navigation";
import { AnimatedLink } from "@/components/ui/animated-link";
import {
  LayoutDashboard,
  ClipboardList,
  Calendar,
  Sparkles,
  FolderKanban,
  Users,
  BarChart3,
  BookOpen,
  Bot,
  Brain,
  Network,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MenuItem {
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
}

const menuSections: (MenuItem[] | "separator")[] = [
  [
    { label: "Dashboard", icon: LayoutDashboard, href: "/" },
    { label: "Pedidos", icon: ClipboardList, href: "/pedidos", badge: 3 },
  ],
  "separator",
  [
    { label: "Calendario", icon: Calendar, href: "/calendario" },
    { label: "Gerador", icon: Sparkles, href: "/gerador" },
    { label: "Projetos", icon: FolderKanban, href: "/projetos" },
    { label: "Creators", icon: Users, href: "/creators" },
    { label: "Relatorio", icon: BarChart3, href: "/relatorio" },
  ],
  "separator",
  [
    { label: "Conhecimento", icon: BookOpen, href: "/conhecimento" },
    { label: "Agentes", icon: Bot, href: "/agentes" },
    { label: "Memoria", icon: Brain, href: "/memoria" },
    { label: "Arquitetura", icon: Network, href: "/arquitetura" },
    { label: "Config", icon: Settings, href: "/config" },
  ],
];

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[250px] flex-col bg-surface-500 rounded-tr-sidebar rounded-br-sidebar">
      {/* Logo */}
      <div className="px-[29px] pt-[30px] pb-[40px]">
        <span className="text-heading-md text-ink-500">
          hubia
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-[16px]">
        {menuSections.map((section, sectionIdx) => {
          if (section === "separator") {
            return (
              <div
                key={`sep-${sectionIdx}`}
                className="my-[8px] mx-[16px] h-px bg-base-500"
              />
            );
          }

          return (
            <div key={`section-${sectionIdx}`} className="flex flex-col gap-[2px]">
              {section.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <AnimatedLink
                    key={item.href}
                    href={item.href}
                    className={`motion-soft flex items-center gap-[14px] rounded-button px-[16px] py-[12px] text-label-md ${
                      active
                        ? "bg-limao-500 text-ink-500"
                        : "bg-surface-500 text-base-700 hover:bg-base-500 hover:text-ink-500"
                    }`}
                  >
                    <Icon size={20} strokeWidth={2} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-[8px] bg-ink-500 px-[6px] text-[11px] font-bold text-limao-500">
                        {item.badge}
                      </span>
                    )}
                  </AnimatedLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-[20px] py-[24px]">
        <div className="flex items-center gap-[12px]">
          <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-base-500 text-label-sm text-ink-500">
            P
          </div>
          <div className="flex flex-col">
            <span className="text-label-sm text-ink-500">
              Pantcho
            </span>
            <span className="text-body-sm text-base-700">
              Diretor de arte
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
