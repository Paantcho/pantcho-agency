"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Lock,
  Crown,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";

const inputClass =
  "h-11 w-full rounded-[12px] border border-transparent bg-[#EEEFE9] px-3.5 text-[15px] text-[#0E0F10] outline-none placeholder:text-[#A9AAA5] transition-[border-color] duration-150 hover:border-[#D4D5D6] focus:border-[#0E0F10] focus:ring-2 focus:ring-ink-500/10 font-mono";

const dnsRecords = [
  { tipo: "CNAME", host: "www", valor: "hubia-app.vercel.app", ttl: "3600" },
  { tipo: "A", host: "@", valor: "76.76.21.21", ttl: "3600" },
];

export default function DomainClient({
  planoEnterprise,
  dominioAtual,
}: {
  planoEnterprise: boolean;
  dominioAtual: string | null;
}) {
  const [dominio, setDominio] = useState(dominioAtual ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleSave() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleCopy(valor: string) {
    navigator.clipboard.writeText(valor);
    setCopied(valor);
    setTimeout(() => setCopied(null), 1800);
  }

  if (!planoEnterprise) {
    return (
      <div className="flex flex-col gap-6">
        <div className="rounded-[30px] bg-[#0E0F10] p-8 flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D7FF00]">
            <Lock size={22} color="#0E0F10" />
          </div>
          <div>
            <p className="text-[18px] font-bold text-white">Domínio customizado</p>
            <p className="mt-2 max-w-[420px] text-[13px] text-white/50 leading-relaxed">
              Configure um domínio próprio para a sua organização. Disponível exclusivamente no plano Enterprise.
            </p>
          </div>
          <motion.button
            className="flex items-center gap-2 rounded-[14px] bg-[#D7FF00] px-6 py-3 text-[14px] font-bold text-[#0E0F10]"
            whileHover={{ scale: 1.03, backgroundColor: "#DFFF33" }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15 }}
          >
            <Crown size={16} />
            Upgrade para Enterprise
          </motion.button>
        </div>

        <div className="rounded-[30px] bg-white p-6">
          <div className="mb-3 flex items-center gap-2">
            <Globe size={15} className="text-[#A9AAA5]" />
            <p className="text-[14px] font-semibold text-[#A9AAA5]">Domínio padrão</p>
          </div>
          <p className="rounded-[12px] bg-[#EEEFE9] px-4 py-3 font-mono text-[14px] text-[#5E5E5F]">
            hubia-app.vercel.app
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Configurar domínio */}
      <div className="rounded-[30px] bg-white p-6">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-[#0E0F10]">
            <Globe size={15} color="#D7FF00" />
          </div>
          <h2 className="text-[15px] font-bold text-[#0E0F10]">Domínio customizado</h2>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#5E5E5F]">
              Seu domínio
            </label>
            <input
              type="text"
              value={dominio}
              onChange={(e) => setDominio(e.target.value)}
              placeholder="app.suaempresa.com"
              className={inputClass}
            />
            <p className="text-[11px] text-[#A9AAA5]">
              Use um subdomínio (ex: app.suaempresa.com) ou domínio raiz (suaempresa.com)
            </p>
          </div>

          {dominioAtual && (
            <div className="flex items-center gap-2 rounded-[12px] bg-[#E8F5E9] px-4 py-3">
              <CheckCircle2 size={14} color="#43A047" />
              <span className="text-[13px] font-semibold text-[#2E7D32]">
                {dominioAtual} — verificado e ativo
              </span>
              <a
                href={`https://${dominioAtual}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto"
              >
                <ExternalLink size={13} className="text-[#43A047]" />
              </a>
            </div>
          )}

          {!dominioAtual && dominio && (
            <div className="flex items-center gap-2 rounded-[12px] bg-[#FFF3CD] px-4 py-3">
              <AlertCircle size={14} color="#856404" />
              <span className="text-[13px] font-semibold text-[#856404]">
                Domínio não verificado — configure os registros DNS abaixo
              </span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <motion.button
              type="button"
              onClick={handleSave}
              disabled={loading || !dominio}
              className="flex items-center gap-2 rounded-[18px] bg-[#D7FF00] px-6 py-3 text-[15px] font-semibold text-[#0E0F10] disabled:opacity-50"
              whileHover={{ scale: 1.03, backgroundColor: "#DFFF33" }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
            >
              {loading ? "Salvando…" : "Salvar domínio"}
            </motion.button>

            <AnimatePresence>
              {saved && (
                <motion.div
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }}
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-[#43A047]"
                >
                  <Check size={14} />
                  Salvo
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Registros DNS */}
      <div className="rounded-[30px] bg-white p-6">
        <h2 className="mb-2 text-[15px] font-bold text-[#0E0F10]">
          Configuração DNS
        </h2>
        <p className="mb-4 text-[12px] text-[#A9AAA5]">
          Adicione os seguintes registros no painel DNS do seu provedor de domínio.
        </p>
        <div className="flex flex-col gap-2">
          {/* Header */}
          <div className="grid grid-cols-[80px_80px_1fr_80px_44px] gap-3 px-3 pb-1">
            {["Tipo", "Host", "Valor", "TTL", ""].map((h) => (
              <span key={h} className="text-[11px] font-bold uppercase tracking-wide text-[#A9AAA5]">
                {h}
              </span>
            ))}
          </div>
          {dnsRecords.map((rec, i) => (
            <motion.div
              key={rec.tipo + rec.host}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="grid grid-cols-[80px_80px_1fr_80px_44px] items-center gap-3 rounded-[12px] bg-[#EEEFE9] px-3 py-3"
            >
              <span className="rounded-[6px] bg-[#0E0F10] px-2 py-0.5 text-center text-[11px] font-bold text-white w-fit">
                {rec.tipo}
              </span>
              <span className="font-mono text-[13px] text-[#5E5E5F]">{rec.host}</span>
              <span className="truncate font-mono text-[13px] text-[#0E0F10]">{rec.valor}</span>
              <span className="font-mono text-[12px] text-[#A9AAA5]">{rec.ttl}</span>
              <motion.button
                type="button"
                onClick={() => handleCopy(rec.valor)}
                className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#0E0F10]"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.90 }}
                title="Copiar valor"
              >
                {copied === rec.valor ? (
                  <Check size={13} color="#D7FF00" />
                ) : (
                  <Copy size={13} color="#D7FF00" />
                )}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
