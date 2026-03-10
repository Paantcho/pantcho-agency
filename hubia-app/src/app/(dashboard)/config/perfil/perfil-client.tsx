"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Camera, Check } from "lucide-react";

const inputClass =
  "h-11 w-full rounded-[12px] border border-transparent bg-base-500 px-3.5 text-[15px] text-ink-500 outline-none placeholder:text-base-700 transition-[border-color] duration-150 hover:border-[#D4D5D6] focus:border-[#0E0F10] focus:ring-2 focus:ring-ink-500/10";

export default function PerfilClient({
  nome: initialNome,
  email: initialEmail,
}: {
  nome: string;
  email: string;
}) {
  const [nome, setNome] = useState(initialNome);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const initials = nome
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      {/* Avatar */}
      <div className="rounded-[30px] bg-white p-6">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-[#0E0F10]">
            <User size={15} color="#D7FF00" />
          </div>
          <h2 className="text-[15px] font-bold text-ink-500">Perfil</h2>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0E0F10] text-[18px] font-bold text-[#D7FF00]">
              {initials || "HU"}
            </div>
            <motion.button
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-limao-500"
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.90 }}
              transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
              title="Alterar foto"
            >
              <Camera size={13} color="#0E0F10" />
            </motion.button>
          </div>

          <div>
            <p className="text-[15px] font-bold text-ink-500">{nome || "Usuário"}</p>
            <p className="text-[13px] text-base-700">{initialEmail}</p>
          </div>
        </div>
      </div>

      {/* Campos */}
      <div className="rounded-[30px] bg-white p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ink-400">
              Nome completo
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={inputClass}
              placeholder="Seu nome"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ink-400 flex items-center gap-1.5">
              <Mail size={13} />
              E-mail
            </label>
            <input
              type="email"
              value={initialEmail}
              readOnly
              className="h-11 w-full rounded-[12px] border border-transparent bg-base-500 px-3.5 text-[15px] text-base-700 outline-none cursor-not-allowed"
            />
            <p className="text-[11px] text-base-700">
              Gerenciado pelo provedor de autenticação
            </p>
          </div>
        </div>
      </div>

      {/* Salvar */}
      <div className="flex items-center justify-end gap-3">
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-[#43A047]"
            >
              <Check size={14} />
              Salvo
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="rounded-[18px] bg-limao-500 px-6 py-3 text-[15px] font-semibold text-ink-500 disabled:opacity-50"
          whileHover={{ scale: 1.03, backgroundColor: "#DFFF33" }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        >
          {loading ? "Salvando…" : "Salvar perfil"}
        </motion.button>
      </div>
    </div>
  );
}
