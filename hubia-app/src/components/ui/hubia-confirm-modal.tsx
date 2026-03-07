"use client";

import { HubiaModal } from "./hubia-modal";

export function HubiaConfirmModal({
  open,
  onClose,
  title,
  message,
  confirmLabel = "Excluir",
  cancelLabel = "Cancelar",
  variant = "danger",
  loading = false,
  error = null,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void | Promise<void>;
}) {
  async function handleConfirm() {
    await onConfirm();
  }

  return (
    <HubiaModal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        <p className="text-body-md text-ink-500">{message}</p>
        {error && (
          <div
            role="alert"
            className="rounded-card border border-red-500/30 bg-red-500/10 px-4 py-3 text-body-sm text-red-600"
          >
            {error}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="motion-soft rounded-button border border-base-600 bg-surface-500 px-6 py-3 text-label-md font-semibold text-ink-500 hover:bg-base-500 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`motion-soft hubia-pressable rounded-button px-6 py-3 text-label-md font-semibold disabled:opacity-50 ${
              variant === "danger"
                ? "border border-red-500/50 bg-red-500/10 text-red-600 hover:bg-red-500/20"
                : "bg-limao-500 text-ink-500 hover:bg-limao-400"
            }`}
          >
            {loading ? "Aguarde…" : confirmLabel}
          </button>
        </div>
      </div>
    </HubiaModal>
  );
}
