"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function HubiaModal({
  open,
  onClose,
  title,
  children,
  maxWidth = "min(90vw, 480px)",
  className = "",
  showCloseButton = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
  /** Botão X no canto superior direito — padrão da plataforma (default: true) */
  showCloseButton?: boolean;
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const modalContent = (
    <div
      className="hubia-modal-overlay motion-soft"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hubia-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="hubia-modal motion-soft max-h-[min(90vh,720px)] overflow-y-auto"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2
            id="hubia-modal-title"
            className="text-heading-sm font-bold text-ink-500"
          >
            {title}
          </h2>
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="hubia-icon-button shrink-0 rounded-full bg-ink-500 text-white hover:bg-ink-400 focus:outline-none focus:ring-2 focus:ring-limao-500"
            >
              <X size={20} strokeWidth={2} />
            </button>
          )}
        </div>
        <div className={className}>{children}</div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return modalContent;
  return createPortal(modalContent, document.body);
}
