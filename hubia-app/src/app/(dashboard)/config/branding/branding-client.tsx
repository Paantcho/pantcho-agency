"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  Upload,
  Globe,
  Lock,
  Eye,
  Check,
  X,
  Crown,
  RefreshCw,
} from "lucide-react";
import { updateBranding } from "./actions";

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function gerarPaleta(hex: string): Record<string, string> {
  try {
    const { h, s } = hexToHSL(hex);
    return {
      "50":  hslToHex(h, Math.min(s, 100), 97),
      "100": hslToHex(h, Math.min(s, 100), 93),
      "200": hslToHex(h, Math.min(s, 100), 86),
      "300": hslToHex(h, Math.min(s, 100), 76),
      "400": hslToHex(h, Math.min(s, 100), 65),
      "500": hex,
      "600": hslToHex(h, Math.min(s, 100), 45),
      "700": hslToHex(h, Math.min(s, 100), 35),
      "800": hslToHex(h, Math.min(s, 100), 26),
      "900": hslToHex(h, Math.min(s, 100), 18),
    };
  } catch {
    return { "500": hex };
  }
}

function isValidHex(v: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(v);
}

function PaletaPreview({ cor }: { cor: string }) {
  const paleta = gerarPaleta(cor);
  return (
    <div className="flex items-end gap-1">
      {Object.entries(paleta).map(([label, hex]) => (
        <div key={label} className="flex flex-col items-center gap-1">
          <div
            className="rounded-[6px]"
            style={{ width: 32, height: label === "500" ? 44 : 32, backgroundColor: hex }}
          />
          <span className="text-[9px] text-base-700">{label}</span>
        </div>
      ))}
    </div>
  );
}

function InterfacePreview({ cor }: { cor: string }) {
  return (
    <div className="rounded-[14px] bg-base-500 p-4 flex flex-col gap-3">
      <p className="text-[11px] font-bold text-base-700 uppercase tracking-wide flex items-center gap-1.5">
        <Eye size={11} />
        Preview da interface
      </p>

      {/* Botão primário */}
      <div className="flex gap-2 flex-wrap">
        <div
          className="rounded-[18px] px-5 py-2.5 text-[13px] font-bold"
          style={{ backgroundColor: cor, color: "#0E0F10" }}
        >
          Botão primário
        </div>
        <div className="rounded-[18px] border border-[#D9D9D4] bg-white px-5 py-2.5 text-[13px] font-semibold text-ink-500">
          Secundário
        </div>
      </div>

      {/* Sidebar miniatura */}
      <div className="flex gap-2">
        <div className="flex w-20 flex-col gap-1 rounded-[12px] bg-white p-2">
          {["Inicio", "Projetos", "Config"].map((item, i) => (
            <div
              key={item}
              className="rounded-[8px] px-2 py-1.5 text-[10px] font-semibold"
              style={{
                backgroundColor: i === 0 ? cor : "transparent",
                color: i === 0 ? "#0E0F10" : "#A9AAA5",
              }}
            >
              {item}
            </div>
          ))}
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="h-6 w-3/4 rounded-[6px] bg-white" />
          <div className="h-4 w-1/2 rounded-[6px] bg-white" />
          <div
            className="mt-1 h-5 w-20 rounded-[6px] text-[10px] font-bold flex items-center justify-center"
            style={{ backgroundColor: cor, color: "#0E0F10" }}
          >
            Limão ativo
          </div>
        </div>
      </div>

      {/* Badge de status */}
      <div className="flex gap-1.5 flex-wrap">
        {["Em andamento", "Aprovado", "Concluído"].map((s, i) => (
          <div
            key={s}
            className="rounded-[6px] px-2 py-1 text-[10px] font-bold"
            style={{
              backgroundColor: i === 2 ? "#0E0F10" : i === 0 ? cor + "33" : "#E8F5E9",
              color: i === 2 ? cor : i === 0 ? "#0E0F10" : "#2E7D32",
            }}
          >
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BrandingClient({
  organizationId,
  initialColor,
  planoEnterprise,
}: {
  organizationId: string | null;
  initialColor: string;
  planoEnterprise: boolean;
}) {
  const [cor, setCor] = useState(initialColor);
  const [hexInput, setHexInput] = useState(initialColor);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const paleta = gerarPaleta(cor);

  const handleHexChange = useCallback((value: string) => {
    setHexInput(value);
    if (isValidHex(value)) setCor(value);
  }, []);

  const handleColorPicker = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setCor(v);
    setHexInput(v);
  }, []);

  async function handleSave() {
    if (!organizationId || !isValidHex(cor)) return;
    setLoading(true);
    setError(null);
    const scale = gerarPaleta(cor);
    const result = await updateBranding(organizationId, { colorPrimary: cor, colorScale: scale });
    setLoading(false);
    if (result.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setError(result.error ?? "Erro ao salvar");
    }
  }

  if (!planoEnterprise) {
    return (
      <div className="flex flex-col gap-6">
        <div className="rounded-[30px] bg-ink-500 p-8 flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-limao-500">
            <Lock size={22} color="var(--hubia-ink-500)" />
          </div>
          <div>
            <p className="text-[18px] font-bold text-white">Branding personalizado</p>
            <p className="mt-2 max-w-[400px] text-[13px] text-white/50 leading-relaxed">
              A personalização da identidade visual está disponível exclusivamente no plano Enterprise.
              Neste plano, você pode alterar logotipo, favicon e a cor primária da plataforma.
            </p>
          </div>
          <motion.button
            className="flex items-center gap-2 rounded-[14px] bg-limao-500 px-6 py-3 text-[14px] font-bold text-ink-500"
            whileHover={{ scale: 1.03, backgroundColor: "#DFFF33" }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15 }}
          >
            <Crown size={16} />
            Upgrade para Enterprise
          </motion.button>
        </div>

        <div className="rounded-[30px] bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <Globe size={15} className="text-base-700" />
            <h2 className="text-[14px] font-semibold text-base-700">
              Identidade visual atual (Hubia padrão)
            </h2>
          </div>
          <PaletaPreview cor="#D7FF00" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Cor primária */}
      <div className="rounded-[30px] bg-white p-6">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-ink-500">
            <Palette size={15} color="var(--hubia-limao-500)" />
          </div>
          <h2 className="text-[15px] font-bold text-ink-500">
            Cor primária da marca
          </h2>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-start gap-6">
            {/* Color picker + hex */}
            <div className="flex flex-col gap-3">
              <label className="text-[13px] font-semibold text-ink-400">
                Selecionar cor
              </label>
              <div className="relative">
                <input
                  type="color"
                  value={isValidHex(cor) ? cor : "#D7FF00"}
                  onChange={handleColorPicker}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <div
                  className="h-14 w-14 rounded-[14px] border-2 border-[#D9D9D4] transition-all duration-150"
                  style={{ backgroundColor: cor }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[13px] font-semibold text-ink-400">
                Código HEX
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => handleHexChange(e.target.value)}
                  placeholder="#D7FF00"
                  maxLength={7}
                  className="h-11 w-36 rounded-[12px] border border-transparent bg-base-500 px-3.5 font-mono text-[15px] text-ink-500 outline-none transition-[border-color] duration-150 hover:border-base-600 focus:border-ink-500 focus:ring-2 focus:ring-ink-500/10"
                  style={isValidHex(hexInput) ? {} : { borderColor: "#E53935" }}
                />
                <motion.button
                  type="button"
                  onClick={() => { setCor(initialColor); setHexInput(initialColor); }}
                  className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-base-500 text-base-700"
                  whileHover={{ backgroundColor: "rgba(213,210,201,0.5)", color: "#0E0F10", scale: 1.05 }}
                  whileTap={{ scale: 0.90 }}
                  title="Restaurar padrão"
                  transition={{ duration: 0.15 }}
                >
                  <RefreshCw size={15} />
                </motion.button>
              </div>
              {!isValidHex(hexInput) && hexInput.length > 0 && (
                <p className="text-[11px] text-red-500">Hex inválido — use #RRGGBB</p>
              )}
            </div>
          </div>

          {/* Paleta derivada */}
          <div>
            <p className="mb-3 text-[13px] font-semibold text-ink-400">
              Paleta derivada (gerada automaticamente)
            </p>
            <PaletaPreview cor={cor} />
          </div>

          {/* Preview da interface */}
          <div>
            <p className="mb-3 text-[13px] font-semibold text-ink-400">
              Como ficará na interface
            </p>
            <InterfacePreview cor={cor} />
          </div>
        </div>
      </div>

      {/* Logotipo */}
      <div className="rounded-[30px] bg-white p-6">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-ink-500">
            <Upload size={15} color="var(--hubia-limao-500)" />
          </div>
          <h2 className="text-[15px] font-bold text-ink-500">
            Logotipo e Favicon
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-semibold text-ink-400">
              Logotipo principal
            </p>
            <p className="text-[11px] text-base-700">
              Usado na barra lateral e nas áreas institucionais
            </p>
            <input ref={fileInputRef} type="file" accept=".png,.svg,.webp" className="hidden" />
            <motion.button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-sand-600 bg-base-500 px-6 py-8"
              whileHover={{ borderColor: "#0E0F10", backgroundColor: "rgba(238,239,233,0.6)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <Upload size={20} className="text-base-700" />
              <p className="text-[13px] font-semibold text-ink-500">
                Clique para fazer upload
              </p>
              <p className="text-[11px] text-base-700">PNG, SVG, WebP — máx. 2 MB</p>
            </motion.button>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-semibold text-ink-400">
              Favicon
            </p>
            <p className="text-[11px] text-base-700">
              Usado na aba do navegador
            </p>
            <input ref={faviconInputRef} type="file" accept=".png,.ico,.svg" className="hidden" />
            <motion.button
              type="button"
              onClick={() => faviconInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-sand-600 bg-base-500 px-6 py-8"
              whileHover={{ borderColor: "#0E0F10", backgroundColor: "rgba(238,239,233,0.6)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <Globe size={20} className="text-base-700" />
              <p className="text-[13px] font-semibold text-ink-500">
                Clique para fazer upload
              </p>
              <p className="text-[11px] text-base-700">PNG, ICO, SVG — máx. 512 KB</p>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Rodapé: Salvar */}
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
              Branding salvo
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-red-500"
            >
              <X size={14} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={handleSave}
          disabled={loading || !isValidHex(cor)}
          className="rounded-[18px] bg-limao-500 px-6 py-3 text-[15px] font-semibold text-ink-500 disabled:opacity-50"
          whileHover={{ scale: 1.03, backgroundColor: "#DFFF33" }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        >
          {loading ? "Salvando…" : "Salvar branding"}
        </motion.button>
      </div>
    </div>
  );
}
