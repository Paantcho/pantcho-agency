"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Variants } from "framer-motion";

const tabVariants: Variants = {
  initial: (dir: number) => ({
    opacity: 0,
    x: dir * 24,
  }),
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir * -16,
  }),
};

/**
 * Wrapper de conteúdo de tab com animação direcional (Material Design 3 — Shared Axis).
 * - dir > 0: conteúdo vem da direita (tab mais à direita foi clicada)
 * - dir < 0: conteúdo vem da esquerda (tab mais à esquerda foi clicada)
 */
export function TabContent({
  tabKey,
  direction,
  children,
}: {
  tabKey: string;
  direction: number;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence mode="wait" custom={direction} initial={false}>
      <motion.div
        key={tabKey}
        custom={direction}
        variants={tabVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.22, ease: [0.0, 0.0, 0.2, 1] }}
        style={{ willChange: "transform, opacity" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
