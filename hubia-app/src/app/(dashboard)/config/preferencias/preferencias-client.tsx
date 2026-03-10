"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Calendar,
  Monitor,
  Sun,
  Moon,
  Check,
  ChevronDown,
} from "lucide-react";
import { savePreferences, type UserPreferences } from "./actions";

const idiomas = [
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "en-US", label: "English (US)" },
  { value: "es-ES", label: "Español" },
];

const formatos = [
  { value: "dd/MM/yyyy", label: "DD/MM/AAAA — 08/03/2026" },
  { value: "MM/dd/yyyy", label: "MM/DD/AAAA — 03/08/2026" },
  { value: "yyyy-MM-dd", label: "AAAA-MM-DD — 2026-03-08" },
];

const modos = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative flex flex-col gap-1.5">
      <label className="text-[13px] font-semibold text-[#5E5E5F]">{label}</label>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-full items-center justify-between rounded-[12px] border border-transparent bg-base-500 px-3.5 text-[15px] text-[#0E0F10] outline-none transition-[border-color] duration-150 hover:border-[#D4D5D6]"
        whileTap={{ scale: 0.995 }}
      >
        <span>{selected?.label ?? "Selecionar"}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-[#A9AAA5]" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute left-0 right-0 top-full z-20 mt-1 rounded-[12px] border border-[#D9D9D4] bg-white py-1.5"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
          >
            {options.map((opt) => (
              <motion.button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className="flex w-full items-center justify-between px-4 py-2.5 text-[14px] text-[#0E0F10]"
                whileHover={{ backgroundColor: "#EEEFE9" }}
                transition={{ duration: 0.1 }}
              >
                {opt.label}
                {opt.value === value && <Check size={14} className="text-[#0E0F10]" />}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PreferenciasClient({
  initialPrefs,
}: {
  initialPrefs: UserPreferences;
}) {
  const [idioma, setIdioma] = useState(initialPrefs.locale);
  const [formato, setFormato] = useState(initialPrefs.dateFormat);
  const [modo, setModo] = useState(initialPrefs.visualMode);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setLoading(true);
    setError(null);
    const result = await savePreferences({
      locale: idioma,
      dateFormat: formato,
      visualMode: modo,
    });
    setLoading(false);
    if (result.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setError(result.error ?? "Erro ao salvar");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Regional */}
      <div className="rounded-[30px] bg-white p-6">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-[#0E0F10]">
            <Globe size={15} color="#D7FF00" />
          </div>
          <h2 className="text-[15px] font-bold text-[#0E0F10]">Preferências regionais</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectField label="Idioma" value={idioma} onChange={setIdioma} options={idiomas} />
          <SelectField label="Formato de data" value={formato} onChange={setFormato} options={formatos} />
        </div>
      </div>

      {/* Modo visual */}
      <div className="rounded-[30px] bg-white p-6">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-[#0E0F10]">
            <Monitor size={15} color="#D7FF00" />
          </div>
          <h2 className="text-[15px] font-bold text-[#0E0F10]">Modo visual</h2>
        </div>

        <div className="flex gap-3">
          {modos.map((m) => {
            const Icon = m.icon;
            const isAtivo = modo === m.value;
            return (
              <motion.button
                key={m.value}
                type="button"
                onClick={() => setModo(m.value)}
                initial={false}
                animate={{
                  backgroundColor: isAtivo ? "#0E0F10" : "#EEEFE9",
                  color: isAtivo ? "#D7FF00" : "#5E5E5F",
                }}
                whileHover={!isAtivo ? { backgroundColor: "rgba(213,210,201,0.5)" } : undefined}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col items-center gap-2 rounded-[14px] px-6 py-4 text-[13px] font-semibold"
              >
                <Icon size={20} />
                {m.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Salvar */}
      <div className="flex items-center justify-end gap-3">
        {error && (
          <p className="text-[13px] font-semibold text-red-600">{error}</p>
        )}
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
          className="rounded-[18px] bg-[#D7FF00] px-6 py-3 text-[15px] font-semibold text-[#0E0F10] disabled:opacity-50"
          whileHover={{ scale: 1.03, backgroundColor: "#DFFF33" }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        >
          {loading ? "Salvando…" : "Salvar preferências"}
        </motion.button>
      </div>
    </div>
  );
}
