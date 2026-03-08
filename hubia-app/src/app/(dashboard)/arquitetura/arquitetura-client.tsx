"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Network, Bot, Zap, Code, Mic, ArrowRight, Star } from "lucide-react";

type AgentItem = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

type SquadItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  color: string | null;
  icon: string | null;
  agentsCount: number;
  agents: AgentItem[];
};

const SQUAD_ICONS: Record<string, React.ElementType> = {
  code: Code,
  "mic-vocal": Mic,
  default: Bot,
};

const STATUS_COLORS: Record<string, string> = {
  ativo: "#D7FF00",
  em_breve: "#FB8C00",
  planejado: "#A9AAA5",
};
const STATUS_LABELS: Record<string, string> = {
  ativo: "Ativo",
  em_breve: "Em breve",
  planejado: "Planejado",
};

// Diagrama macro de fluxo
const FLUXO_NODES = [
  { id: "entrada", label: "Input", sub: "Manual · Telegram · API", x: 0, color: "#EEEFE9", textColor: "#0E0F10" },
  { id: "orquestrador", label: "Orquestrador", sub: "CEO · Classifica · Delega", x: 1, color: "#0E0F10", textColor: "#D7FF00", highlight: true },
  { id: "squads", label: "Squads", sub: "Dev · Audiovisual · ...", x: 2, color: "#D7FF00", textColor: "#0E0F10" },
  { id: "output", label: "Output", sub: "Pedido · Conteúdo · Build", x: 3, color: "#EEEFE9", textColor: "#0E0F10" },
];

export default function ArquiteturaClient({
  squads,
}: {
  squads: SquadItem[];
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold text-[#0E0F10]">Arquitetura</h1>
        <p className="text-[14px] text-[#A9AAA5] mt-0.5">Visão macro do sistema de agentes e fluxos</p>
      </div>

      {/* Diagrama de fluxo */}
      <div className="rounded-[20px] bg-white p-8">
        <p className="text-[12px] font-bold text-[#A9AAA5] uppercase tracking-wide mb-6">Fluxo principal</p>
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {FLUXO_NODES.map((node, i) => (
            <div key={node.id} className="flex items-center gap-0 flex-shrink-0">
              <motion.div
                className="flex flex-col items-center justify-center rounded-[16px] p-5 min-w-[160px]"
                style={{ backgroundColor: node.color }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0, 0, 0.2, 1], delay: i * 0.1 }}
                whileHover={node.highlight ? { scale: 1.04 } : { scale: 1.02 }}
              >
                {node.highlight && (
                  <div className="flex items-center gap-1 mb-2">
                    <Star size={11} color="#D7FF00" />
                    <span className="text-[9px] font-bold text-[#D7FF00] uppercase tracking-widest">Core</span>
                  </div>
                )}
                <p className="text-[15px] font-bold" style={{ color: node.textColor }}>{node.label}</p>
                <p className="text-[11px] mt-1 text-center leading-snug" style={{ color: node.textColor, opacity: 0.7 }}>
                  {node.sub}
                </p>
              </motion.div>
              {i < FLUXO_NODES.length - 1 && (
                <motion.div
                  className="flex items-center px-3"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                >
                  <ArrowRight size={18} color="#A9AAA5" />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Squads ao vivo */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Network size={16} color="#0E0F10" />
          <h2 className="text-[18px] font-bold text-[#0E0F10]">Squads</h2>
          <span className="rounded-full bg-[#EEEFE9] px-2.5 py-0.5 text-[11px] font-bold text-[#5E5E5F]">
            {squads.length}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {squads.map((squad, i) => {
            const IconComponent = SQUAD_ICONS[squad.icon ?? "default"] ?? Bot;
            const isAtivo = squad.status === "ativo";

            return (
              <motion.div
                key={squad.id}
                className={`rounded-[20px] p-6 flex flex-col gap-4 ${isAtivo ? "cursor-pointer" : "opacity-60"}`}
                style={{ backgroundColor: isAtivo ? "#FFFFFF" : "#F5F5F3" }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: Math.min(i * 0.08, 0.35) }}
                whileHover={isAtivo ? { y: -4 } : {}}
                whileTap={isAtivo ? { scale: 0.98 } : {}}
                onClick={() => isAtivo && router.push(`/agentes/squad/${squad.slug}`)}
              >
                {/* Ícone + status */}
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-[12px]"
                    style={{ backgroundColor: squad.color ? `${squad.color}20` : "#EEEFE9" }}
                  >
                    <IconComponent size={20} color={squad.color ?? "#5E5E5F"} />
                  </div>
                  <span
                    className="rounded-[6px] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{
                      backgroundColor: `${STATUS_COLORS[squad.status] ?? "#A9AAA5"}20`,
                      color: STATUS_COLORS[squad.status] ?? "#A9AAA5",
                    }}
                  >
                    {STATUS_LABELS[squad.status] ?? squad.status}
                  </span>
                </div>

                {/* Info */}
                <div>
                  <h3 className="text-[16px] font-bold text-[#0E0F10]">{squad.name}</h3>
                  {squad.description && (
                    <p className="text-[12px] text-[#A9AAA5] mt-1 line-clamp-2">{squad.description}</p>
                  )}
                </div>

                {/* Agentes */}
                <div className="flex items-center justify-between pt-3 border-t border-[#EEEFE9]">
                  <div className="flex items-center gap-1.5">
                    <Bot size={13} color="#A9AAA5" />
                    <span className="text-[12px] font-semibold text-[#5E5E5F]">
                      {squad.agentsCount} agente{squad.agentsCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {isAtivo && (
                    <div className="flex items-center gap-1">
                      {squad.agents.slice(0, 3).map((agent) => (
                        <div
                          key={agent.id}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EEEFE9] text-[9px] font-bold text-[#5E5E5F]"
                          title={agent.name}
                        >
                          {agent.name.charAt(0)}
                        </div>
                      ))}
                      {squad.agentsCount > 3 && (
                        <span className="text-[10px] text-[#A9AAA5]">+{squad.agentsCount - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Dependências/RUCs */}
      <div className="rounded-[20px] bg-white p-6">
        <p className="text-[13px] font-bold text-[#0E0F10] mb-4 flex items-center gap-2">
          <Zap size={15} color="#D7FF00" />
          Regras de Uso (RUCs) ativos
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            { ruc: "RUC-01", desc: "organization_id obrigatório em todas as queries" },
            { ruc: "RUC-02", desc: "API keys sempre criptografadas — nunca plaintext" },
            { ruc: "RUC-03", desc: "RLS ativo em todas as tabelas de negócio" },
            { ruc: "RUC-04", desc: "Gatilhos disparam em pedido.criado e status_alterado" },
            { ruc: "RUC-05", desc: "ActivityLog registra toda ação crítica do sistema" },
            { ruc: "RUC-06", desc: "Modais sempre com HubiaPortal + 3 camadas obrigatórias" },
            { ruc: "RUC-07", desc: "Framer Motion para todo componente React animado" },
            { ruc: "RUC-08", desc: "Auto-draft em localStorage para formulários de criação" },
          ].map((item, i) => (
            <motion.div
              key={item.ruc}
              className="flex items-start gap-3 rounded-[10px] bg-[#EEEFE9] px-4 py-3"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.04 }}
            >
              <span className="rounded-[5px] bg-[#D7FF00] px-1.5 py-0.5 text-[9px] font-bold text-[#0E0F10] flex-shrink-0 mt-0.5">
                {item.ruc}
              </span>
              <span className="text-[12px] text-[#5E5E5F]">{item.desc}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
