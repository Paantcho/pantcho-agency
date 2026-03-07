"use client";

import { useEffect } from "react";

const DEFAULT_PRIMARY = "#D7FF00";
const DEFAULT_PRIMARY_HOVER = "#DFFF33";

/**
 * Aplica as cores do tenant (branding) como variáveis CSS no documento.
 * Deve ser usado dentro do layout do dashboard, com colorPrimary vindo do banco.
 */
export function ThemeProvider({
  colorPrimary,
  colorPrimaryHover,
  children,
}: {
  colorPrimary?: string | null;
  colorPrimaryHover?: string | null;
  children: React.ReactNode;
}) {
  const primary = colorPrimary ?? DEFAULT_PRIMARY;
  const hover = colorPrimaryHover ?? DEFAULT_PRIMARY_HOVER;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--hubia-limao-500", primary);
    root.style.setProperty("--hubia-limao-400", hover);
    return () => {
      root.style.removeProperty("--hubia-limao-500");
      root.style.removeProperty("--hubia-limao-400");
    };
  }, [primary, hover]);

  return <>{children}</>;
}
