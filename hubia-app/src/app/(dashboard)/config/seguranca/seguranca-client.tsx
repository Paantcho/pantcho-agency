"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Shield, Key, Users, CheckCircle2, AlertCircle,
  ExternalLink, Lock, Eye, EyeOff,
} from "lucide-react";

type Provider = {
  id: string;
  name: string;
  type: string;
  isDefault: boolean;
  isActive: boolean;
  updatedAt: string;
};

export default function SegurancaClient({
  organizationId,
  providers,
  totalMembros,
}: {
  organizationId: string;
  providers: Provider[];
  totalMembros: number;
}) {
  const router = useRouter();

  const checklistItems = [
    {
      id: "rls",
      label: "Row Level Security (RLS)",
      desc: "Ativo em todas as tabelas do banco",
      status: "ok",
    },
    {
      id: "api-keys",
      label: "API Keys criptografadas",
      desc: `${providers.length} provedor${providers.length !== 1 ? "es" : ""} com chaves armazenadas de forma segura`,
      status: providers.length > 0 ? "ok" : "pendente",
    },
    {
      id: "multi-tenant",
      label: "Isolamento multi-tenant",
      desc: "organization_id enforçado em todas as queries",
      status: "ok",
    },
    {
      id: "webhook-secret",
      label: "Webhook Secret",
      desc: "WEBHOOK_SECRET ainda não configurado no .env",
      status: "pendente",
      actionLabel: "Ver checklist",
    },
    {
      id: "storage",
      label: "Supabase Storage",
      desc: "Bucket de uploads não configurado",
      status: "pendente",
    },
    {
      id: "oauth",
      label: "OAuth Google",
      desc: "Configurado via Supabase Auth",
      status: "ok",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header de contexto */}
      <div className="rounded-[16px] bg-[#0E0F10] p-5 flex items-start gap-3">
        <Shield size={18} color="#D7FF00" className="mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-[13px] font-bold text-[#D7FF00]">Visão de segurança</p>
          <p className="text-[12px] text-white/60 mt-0.5">
            Checklist de configurações críticas para operação segura da plataforma.
          </p>
        </div>
      </div>

      {/* Checklist de segurança */}
      <div className="rounded-[30px] bg-white p-6">
        <h2 className="text-[15px] font-bold text-[#0E0F10] mb-4 flex items-center gap-2">
          <Lock size={14} />
          Checklist de segurança
        </h2>
        <div className="flex flex-col gap-3">
          {checklistItems.map((item, i) => (
            <motion.div
              key={item.id}
              className="flex items-center justify-between rounded-[12px] bg-base-500 px-4 py-3"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="flex items-start gap-3">
                {item.status === "ok" ? (
                  <CheckCircle2 size={16} color="#43A047" className="mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle size={16} color="#FB8C00" className="mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <p className="text-[13px] font-semibold text-[#0E0F10]">{item.label}</p>
                  <p className="text-[11px] text-[#A9AAA5] mt-0.5">{item.desc}</p>
                </div>
              </div>
              <span
                className="rounded-[6px] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide flex-shrink-0 ml-4"
                style={{
                  backgroundColor: item.status === "ok" ? "#43A04718" : "#FB8C0018",
                  color: item.status === "ok" ? "#43A047" : "#FB8C00",
                }}
              >
                {item.status === "ok" ? "OK" : "Pendente"}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Provedores de IA */}
      <div className="rounded-[30px] bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-[#0E0F10] flex items-center gap-2">
            <Key size={14} />
            API Keys ativas
          </h2>
          <motion.button
            onClick={() => router.push("/organization/provedores")}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-[#A9AAA5]"
            whileHover={{ color: "#0E0F10" }}
            whileTap={{ scale: 0.97 }}
          >
            <ExternalLink size={12} />
            Gerenciar
          </motion.button>
        </div>

        {providers.length === 0 ? (
          <div className="rounded-[12px] border-2 border-dashed border-[#D5D2C9] p-8 text-center">
            <Key size={20} color="#A9AAA5" className="mx-auto mb-2" />
            <p className="text-[13px] text-[#A9AAA5]">Nenhum provedor de IA configurado.</p>
            <motion.button
              onClick={() => router.push("/organization/provedores")}
              className="mt-3 text-[12px] font-semibold text-[#0E0F10] underline"
              whileHover={{ opacity: 0.7 }}
            >
              Configurar agora
            </motion.button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {providers.map((p, i) => (
              <motion.div
                key={p.id}
                className="flex items-center gap-3 rounded-[12px] bg-base-500 px-4 py-3"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#0E0F10]">
                  <Key size={13} color="#D7FF00" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-[#0E0F10]">{p.name}</p>
                  <p className="text-[11px] text-[#A9AAA5]">{p.type} · atualizado {new Date(p.updatedAt).toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="flex items-center gap-2">
                  {p.isDefault && (
                    <span className="rounded-[5px] bg-[#D7FF00] px-1.5 py-0.5 text-[9px] font-bold text-[#0E0F10] uppercase">
                      Default
                    </span>
                  )}
                  <div className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: p.isActive ? "#43A047" : "#E53935" }}>
                    <EyeOff size={11} />
                    ••••••••
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Membros */}
      <div className="rounded-[30px] bg-white p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-bold text-[#0E0F10] flex items-center gap-2">
            <Users size={14} />
            Membros da organização
          </h2>
          <span className="text-[13px] font-semibold text-[#A9AAA5]">{totalMembros} ativo{totalMembros !== 1 ? "s" : ""}</span>
        </div>
        <motion.button
          onClick={() => router.push("/config/equipe")}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-[#A9AAA5]"
          whileHover={{ color: "#0E0F10" }}
          whileTap={{ scale: 0.97 }}
        >
          <ExternalLink size={12} />
          Gerenciar equipe
        </motion.button>
      </div>
    </div>
  );
}
