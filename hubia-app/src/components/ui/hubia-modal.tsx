"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
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
  showCloseButton?: boolean;
}) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const content = (
    <AnimatePresence>
      {open && (
        // Camada 1 — overlay com blur animado
        <motion.div
          key="overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="hubia-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ backgroundColor: "rgba(14,15,16,0)", backdropFilter: "blur(0px)" }}
          animate={{ backgroundColor: "rgba(14,15,16,0.70)", backdropFilter: "blur(12px)" }}
          exit={{ backgroundColor: "rgba(14,15,16,0)", backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          {/* Camada 2 — container com scale + y */}
          <motion.div
            key="container"
            className="w-full max-h-[min(90vh,720px)] overflow-y-auto rounded-[30px] bg-white p-7"
            style={{ maxWidth }}
            initial={{ scale: 0.88, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 10, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <h2
                id="hubia-modal-title"
                className="text-heading-sm font-bold text-ink-500"
              >
                {title}
              </h2>
              {/* Camada 3 — botão X com rotate no hover */}
              {showCloseButton && (
                <motion.button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-500 text-white"
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ rotate: 90, scale: 0.9 }}
                  transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <X size={16} strokeWidth={2.5} />
                </motion.button>
              )}
            </div>
            <div className={className}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === "undefined") return content;
  return createPortal(content, document.body);
}
