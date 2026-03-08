"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Renderiza filhos diretamente no document.body, escapando qualquer
 * stacking context criado por transform/filter/will-change (ex: Framer Motion).
 * Obrigatório para modais e drawers com backdrop-filter.
 */
export function HubiaPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}
