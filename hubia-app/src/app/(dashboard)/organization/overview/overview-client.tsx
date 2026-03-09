"use client";

import { motion } from "framer-motion";
import {
  Building2,
  Users,
  Crown,
  Globe,
  Palette,
  Plug,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

type OrgOverviewProps = {
  orgName: string;
  planoNome: string;
  planoNivel: number;
  totalMembros: number;
  brandingAtivo: boolean;
  dominioCustom: string | null;
  integracoesAtivas: number;
};

const cards: {
  label: string;
  icon: React.ElementType;
  href: string;
  cor: string;
}[] = [
  { label: "Plano", icon: Crown, href: "/organization/plano", cor: "#D7FF00" },
  { label: "Branding", icon: Palette, href: "/organization/branding", cor: "#EEEAFF" },
  { label: "Domínio", icon: Globe, href: "/organization/domain", cor: "#E1F4FE" },
  { label: "Equipe", icon: Users, href: "/organization/team", cor: "#E0F5F3" },
];

export default function OverviewClient({
  orgName,
  planoNome,
  planoNivel,
  totalMembros,
  brandingAtivo,
  dominioCustom,
  integracoesAtivas,
}: OrgOverviewProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Banner identidade */}
      <div className="rounded-[20px] bg-[#0E0F10] p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#D7FF00]">
            <Building2 size={22} color="#0E0F10" />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-white/40 uppercase tracking-wide">
              Organização
            </p>
            <p className="text-[22px] font-bold text-white leading-tight">
              {orgName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-[10px] bg-[#D7FF00] px-3 py-1.5 text-[12px] font-bold text-[#0E0F10]">
            {planoNome} N{planoNivel}
          </div>
        </div>
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          {
            label: "Membros",
            valor: totalMembros,
            icon: Users,
            ok: totalMembros > 0,
          },
          {
            label: "Branding",
            valor: brandingAtivo ? "Configurado" : "Padrão",
            icon: Palette,
            ok: brandingAtivo,
          },
          {
            label: "Domínio",
            valor: dominioCustom ?? "Não configurado",
            icon: Globe,
            ok: !!dominioCustom,
          },
          {
            label: "Integrações",
            valor: `${integracoesAtivas} ativas`,
            icon: Plug,
            ok: integracoesAtivas > 0,
          },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.07, 0.3) }}
              className="flex flex-col gap-3 rounded-[16px] bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#EEEFE9]">
                  <Icon size={15} className="text-[#0E0F10]" />
                </div>
                {kpi.ok ? (
                  <CheckCircle2 size={14} color="#43A047" />
                ) : (
                  <AlertCircle size={14} color="#FB8C00" />
                )}
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#A9AAA5] uppercase tracking-wide">
                  {kpi.label}
                </p>
                <p className="mt-0.5 text-[15px] font-bold text-[#0E0F10] truncate">
                  {typeof kpi.valor === "number" ? kpi.valor : kpi.valor}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Atalhos para seções */}
      <div className="rounded-[20px] bg-white p-6">
        <h2 className="mb-4 text-[15px] font-bold text-[#0E0F10]">
          Gerenciar organização
        </h2>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.href}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.07, 0.3) }}
              >
                <Link href={card.href} className="block">
                  <motion.div
                    className="flex items-center justify-between rounded-[14px] bg-[#EEEFE9] px-5 py-4"
                    whileHover={{ backgroundColor: "rgba(213,210,201,0.6)", y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-[10px]"
                        style={{ backgroundColor: card.cor }}
                      >
                        <Icon size={16} color="#0E0F10" />
                      </div>
                      <span className="text-[14px] font-semibold text-[#0E0F10]">
                        {card.label}
                      </span>
                    </div>
                    <ArrowRight size={15} className="text-[#A9AAA5]" />
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
