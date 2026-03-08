"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "./sidebar";

export type OrgOption = { id: string; name: string };

function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: [0.0, 0.0, 0.2, 1] }}
        style={{
          background: "#EEEFE9",
          minHeight: "100%",
          willChange: "transform, opacity",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function AppShell({
  children,
  organizations,
  currentOrganizationId,
}: {
  children: React.ReactNode;
  organizations: OrgOption[];
  currentOrganizationId: string | null;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        organizations={organizations}
        currentOrganizationId={currentOrganizationId}
      />
      <main
        id="hubia-main"
        style={{
          flex: 1,
          marginLeft: "280px",
          padding: "30px",
          background: "#EEEFE9",
          overflow: "hidden",
        }}
      >
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
