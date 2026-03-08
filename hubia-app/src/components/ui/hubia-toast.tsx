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

// ─── Configuração visual por tipo ─────────────────────────────────
const CONFIG: Record<ToastType, { icon: React.ReactNode; accent: string }> = {
  success: { icon: <Check size={14} strokeWidth={3} />, accent: "#22c55e" },
  error:   { icon: <X size={14} strokeWidth={3} />, accent: "#ef4444" },
  warning: { icon: <AlertTriangle size={14} strokeWidth={2.5} />, accent: "#f59e0b" },
  info:    { icon: <Info size={14} strokeWidth={2.5} />, accent: "#3b82f6" },
};

// ─── Item individual ──────────────────────────────────────────────
function ToastItem({ toast: t }: { toast: Toast }) {
  const remove = useToastStore((s) => s.remove);
  const cfg = CONFIG[t.type];
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
      className="flex items-start gap-3 rounded-[16px] bg-white px-4 py-3.5 pr-3"
      style={{
        minWidth: "280px",
        maxWidth: "380px",
        boxShadow: "0 4px 24px rgba(14,15,16,0.12)",
      }}
    >
      <div
        className="mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-white"
        style={{ background: cfg.accent }}
      >
        {cfg.icon}
      </div>
      <p className="flex-1 text-[13px] font-semibold leading-[1.45]" style={{ color: "#0E0F10" }}>
        {t.message}
      </p>
      <motion.button
        type="button"
        onClick={() => remove(t.id)}
        aria-label="Fechar"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
        style={{ color: "#A9AAA5" }}
        whileHover={{ rotate: 90, scale: 1.1, color: "#0E0F10" }}
        whileTap={{ rotate: 90, scale: 0.9 }}
        transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <X size={13} strokeWidth={2.5} />
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
