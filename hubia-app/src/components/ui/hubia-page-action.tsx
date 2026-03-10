"use client";

import { forwardRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Plus, type LucideIcon } from "lucide-react";
import { AnimatedLink } from "@/components/ui/animated-link";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
 * HubiaPageAction
 * Botão primário padronizado para header de páginas.
 * pill · limão-500 · 14px bold · Plus icon · motion
 * ───────────────────────────────────────────── */

const TRANSITION = { duration: 0.15, ease: [0.34, 1.56, 0.64, 1] };
const ICON_TRANSITION = { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] };

export interface HubiaPageActionProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Ícone Lucide (default: Plus) */
  icon?: LucideIcon;
  /** Tamanho do ícone em px (default: 16) */
  iconSize?: number;
  /** Animar ícone com rotate 90° no hover (default: true) */
  iconRotate?: boolean;
  /** Texto do botão */
  children: ReactNode;
  /** Estado de loading */
  loading?: boolean;
  /** Texto exibido durante loading */
  loadingText?: string;
  /** Se fornecido, renderiza como link com transição de página */
  href?: string;
}

export const HubiaPageAction = forwardRef<
  HTMLButtonElement,
  HubiaPageActionProps
>(function HubiaPageAction(
  {
    icon: Icon = Plus,
    iconSize = 16,
    iconRotate = true,
    children,
    loading = false,
    loadingText,
    disabled,
    className,
    href,
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading;

  const classes = cn(
    "flex items-center gap-2 rounded-full bg-limao-500 px-6 py-2.5 text-[14px] font-bold text-ink-500 disabled:opacity-50",
    className,
  );

  const motionProps = {
    initial: "rest" as const,
    animate: "rest" as const,
    whileHover: isDisabled ? undefined : ("hovered" as const),
    whileTap: isDisabled ? undefined : { scale: 0.96 },
    variants: {
      rest: { scale: 1, backgroundColor: "var(--hubia-limao-500)" },
      hovered: { scale: 1.03, backgroundColor: "#DFFF33" },
    },
    transition: TRANSITION,
  };

  const iconEl = (
    <motion.span
      className="flex items-center"
      variants={
        iconRotate
          ? { rest: { scale: 1, rotate: 0 }, hovered: { scale: 1.2, rotate: 90 } }
          : { rest: { scale: 1 }, hovered: { scale: 1.2 } }
      }
      transition={ICON_TRANSITION}
    >
      <Icon size={iconSize} strokeWidth={2.5} />
    </motion.span>
  );

  const label = loading && loadingText ? loadingText : children;

  if (href) {
    const MotionLink = motion.create(AnimatedLink);
    return (
      <MotionLink
        href={href}
        className={classes}
        {...motionProps}
      >
        {iconEl}
        {label}
      </MotionLink>
    );
  }

  return (
    <motion.button
      ref={ref}
      type="button"
      disabled={isDisabled}
      className={classes}
      {...motionProps}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {iconEl}
      {label}
    </motion.button>
  );
});
