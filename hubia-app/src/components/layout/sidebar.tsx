"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  ChevronDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { setCurrentOrganization } from "@/app/(dashboard)/actions";
import type { OrgOption } from "./app-shell";

interface MenuItem {
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
  iconClass?: string;
}

const menuSections: (MenuItem[] | "separator")[] = [
  [
    { label: "Dashboard", icon: LayoutDashboard, href: "/", iconClass: "icon-pulse" },
    { label: "Pedidos", icon: ClipboardList, href: "/pedidos", badge: 3, iconClass: "icon-bounce-y" },
  ],
  "separator",
  [
    { label: "Calendario", icon: Calendar, href: "/calendario", iconClass: "icon-wiggle" },
    { label: "Gerador", icon: Sparkles, href: "/gerador", iconClass: "icon-spark" },
    { label: "Projetos", icon: FolderKanban, href: "/projetos", iconClass: "icon-bounce-y" },
    { label: "Creators", icon: Users, href: "/creators", iconClass: "icon-pulse" },
    { label: "Relatorio", icon: BarChart3, href: "/relatorio", iconClass: "icon-pulse" },
  ],
  "separator",
  [
    { label: "Conhecimento", icon: BookOpen, href: "/conhecimento", iconClass: "icon-wiggle" },
    { label: "Agentes", icon: Bot, href: "/agentes", iconClass: "icon-nod" },
    { label: "Memoria", icon: Brain, href: "/memoria", iconClass: "icon-pulse-double" },
    { label: "Arquitetura", icon: Network, href: "/arquitetura", iconClass: "icon-nod" },
    { label: "Config", icon: Settings, href: "/config", iconClass: "icon-spin-partial" },
  ],
];

export function Sidebar({
  organizations,
  currentOrganizationId,
}: {
  organizations: OrgOption[];
  currentOrganizationId: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [orgOpen, setOrgOpen] = useState(false);
  const orgRef = useRef<HTMLDivElement>(null);

  // Pill deslizante — refs por href para calcular posição
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const navRef = useRef<HTMLElement>(null);
  const [pillTop, setPillTop] = useState(0);
  const [pillHeight, setPillHeight] = useState(44);

  const allItems = menuSections
    .filter((s): s is MenuItem[] => s !== "separator")
    .flat();

  useEffect(() => {
    const activeItem = allItems.find((item) => isActive(item.href));
    if (!activeItem) return;
    const el = itemRefs.current[activeItem.href];
    const nav = navRef.current;
    if (!el || !nav) return;
    const navRect = nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setPillTop(elRect.top - navRect.top + nav.scrollTop);
    setPillHeight(elRect.height);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (orgRef.current && !orgRef.current.contains(e.target as Node))
        setOrgOpen(false);
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const currentOrg =
    organizations.find((o) => o.id === currentOrganizationId) ??
    organizations[0];

  async function handleSwitchOrg(orgId: string) {
    const res = await setCurrentOrganization(orgId);
    if (res.ok) {
      setOrgOpen(false);
      router.refresh();
    }
  }

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
      <nav ref={navRef} className="relative flex-1 overflow-y-auto px-[16px]">
        {/* Pill deslizante — UMA div absoluta, move com spring */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-[16px] right-[16px] rounded-[18px] bg-limao-500"
          animate={{ top: pillTop, height: pillHeight }}
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 28,
            mass: 1,
          }}
        />

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
                    ref={(el) => { itemRefs.current[item.href] = el; }}
                    className={`group relative z-10 flex items-center gap-[14px] rounded-button px-[16px] py-[12px] text-label-md transition-[color,background-color] duration-150 ${
                      active
                        ? "text-ink-500"
                        : "text-base-700 hover:bg-[#D5D2C9]/40 hover:text-ink-500 active:bg-[#D5D2C9]/70"
                    }`}
                  >
                    <Icon
                      size={20}
                      strokeWidth={2}
                      className={`shrink-0 transition-colors duration-150 ${
                        active ? "text-ink-500" : "text-base-700 group-hover:text-ink-500"
                      } ${item.iconClass ?? ""}`}
                    />
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

      {/* Seletor de organização */}
      <div className="px-[20px] py-[24px]" ref={orgRef}>
        <div className="rounded-card bg-base-500/60 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-base-700">
            Organização
          </p>
          {organizations.length === 0 ? (
            <p className="mt-1 text-label-sm text-ink-500">—</p>
          ) : organizations.length === 1 ? (
            <p className="mt-1 truncate text-label-sm text-ink-500">
              {currentOrg?.name ?? "—"}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setOrgOpen((v) => !v)}
              className="motion-soft mt-1 flex w-full items-center justify-between gap-2 rounded-button text-left text-label-sm text-ink-500 hover:bg-base-600/50"
            >
              <span className="min-w-0 truncate">{currentOrg?.name ?? "—"}</span>
              <ChevronDown size={14} className="shrink-0" />
            </button>
          )}
          {orgOpen && organizations.length > 1 && (
            <div className="motion-soft mt-1 rounded-card border border-base-600 bg-surface-500 py-1">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => handleSwitchOrg(org.id)}
                  className={`motion-soft w-full px-3 py-2 text-left text-body-sm hover:bg-base-500 ${
                    org.id === currentOrganizationId
                      ? "font-semibold text-ink-500"
                      : "text-base-700"
                  }`}
                >
                  {org.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
