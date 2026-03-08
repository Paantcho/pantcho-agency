"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X, AlertTriangle, Info } from "lucide-react";
import { create } from "zustand";

// ─── Tipos ────────────────────────────────────────────────────────
export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// ─── Store global (Zustand) ───────────────────────────────────────
interface ToastStore {
  toasts: Toast[];
  add: (toast: Omit<Toast, "id">) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [{ ...toast, id }, ...s.toasts] }));
    setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      toast.duration ?? 3500,
    );
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// ─── API pública ──────────────────────────────────────────────────
export const toast = {
  success: (message: string, duration?: number) =>
    useToastStore.getState().add({ message, type: "success", duration }),
  error: (message: string, duration?: number) =>
    useToastStore.getState().add({ message, type: "error", duration }),
  warning: (message: string, duration?: number) =>
    useToastStore.getState().add({ message, type: "warning", duration }),
  info: (message: string, duration?: number) =>
    useToastStore.getState().add({ message, type: "info", duration }),
};

// ─── Paleta Hubia para toasts ─────────────────────────────────────
// success / info  → fundo #D7FF00 (limão), texto #0E0F10 (ink)
// error / warning → fundo #0E0F10 (ink), texto #FFFFFF (branco)

const TOAST_PALETTE: Record<ToastType, {
  bg: string; text: string; iconBg: string; iconColor: string; closeBg: string; icon: React.ReactNode;
}> = {
  success: {
    bg: "#D7FF00", text: "#0E0F10",
    iconBg: "#0E0F10", iconColor: "#D7FF00",
    closeBg: "rgba(14,15,16,0.12)",
    icon: <Check size={13} strokeWidth={3} />,
  },
  info: {
    bg: "#D7FF00", text: "#0E0F10",
    iconBg: "#0E0F10", iconColor: "#D7FF00",
    closeBg: "rgba(14,15,16,0.12)",
    icon: <Info size={13} strokeWidth={2.5} />,
  },
  error: {
    bg: "#0E0F10", text: "#FFFFFF",
    iconBg: "#E53935", iconColor: "#FFFFFF",
    closeBg: "rgba(255,255,255,0.12)",
    icon: <X size={13} strokeWidth={3} />,
  },
  warning: {
    bg: "#0E0F10", text: "#FFFFFF",
    iconBg: "#FB8C00", iconColor: "#FFFFFF",
    closeBg: "rgba(255,255,255,0.12)",
    icon: <AlertTriangle size={13} strokeWidth={2.5} />,
  },
};

// ─── Item individual ──────────────────────────────────────────────
function ToastItem({ toast: t }: { toast: Toast }) {
  const remove = useToastStore((s) => s.remove);
  const p = TOAST_PALETTE[t.type];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.88, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, x: 30, scale: 0.92 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
      className="flex items-center gap-3 rounded-[16px] px-4 py-3.5 pr-3"
      style={{
        backgroundColor: p.bg,
        minWidth: "260px",
        maxWidth: "380px",
      }}
    >
      {/* Ícone */}
      <div
        className="flex-shrink-0 flex h-[22px] w-[22px] items-center justify-center rounded-full"
        style={{ backgroundColor: p.iconBg, color: p.iconColor }}
      >
        {p.icon}
      </div>
      {/* Mensagem */}
      <p className="flex-1 text-[13px] font-bold leading-snug" style={{ color: p.text }}>
        {t.message}
      </p>
      {/* Fechar */}
      <motion.button
        type="button"
        onClick={() => remove(t.id)}
        aria-label="Fechar"
        className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full"
        style={{ backgroundColor: p.closeBg, color: p.text }}
        whileHover={{ rotate: 90, scale: 1.15 }}
        whileTap={{ rotate: 90, scale: 0.9 }}
        transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <X size={12} strokeWidth={2.5} />
      </motion.button>
    </motion.div>
  );
}

// ─── Container ───────────────────────────────────────────────────
function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-2"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Provider — usado no root layout ─────────────────────────────
export function HubiaToastProvider() {
  if (typeof document === "undefined") return null;
  return createPortal(<ToastContainer />, document.body);
}
