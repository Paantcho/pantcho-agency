"use client";

import { AnimatePresence, motion } from "framer-motion";

const tabVariants = {
  initial: (dir: number) => ({
    opacity: 0,
    x: dir * 24,
  }),
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.22,
      ease: [0.0, 0.0, 0.2, 1] as number[],
    },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir * -16,
    transition: {
      duration: 0.16,
      ease: [0.4, 0.0, 1.0, 1] as number[],
    },
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
        style={{ willChange: "transform, opacity" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
