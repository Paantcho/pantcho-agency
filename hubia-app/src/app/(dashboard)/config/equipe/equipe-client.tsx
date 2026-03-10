"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import { updateMemberRole } from "./actions";
import { MemberRole } from "@prisma/client";

const roleLabels: Record<MemberRole, string> = {
  owner: "Proprietário",
  admin: "Admin",
  editor: "Editor",
  viewer: "Visualizador",
};

export default function EquipeClient({
  organizationId,
  memberId,
  memberRole,
  canEdit,
}: {
  organizationId: string;
  memberId: string;
  memberRole: MemberRole;
  canEdit: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  async function handleChangeRole(role: MemberRole) {
    setError(null);
    setLoading(true);
    const result = await updateMemberRole(organizationId, memberId, role);
    setLoading(false);
    setOpen(false);
    if (!result.ok) setError(result.error ?? "Erro ao atualizar.");
  }

  const roles: MemberRole[] = ["admin", "editor", "viewer"];
  if (memberRole === "owner") return null;

  if (!canEdit) {
    return (
      <div className="flex h-[36px] w-[36px] items-center justify-center rounded-button text-base-700">
        <MoreHorizontal size={18} />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-end gap-1" ref={ref}>
      {/* Icon button — MoreHorizontal */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className="flex h-[36px] w-[36px] items-center justify-center rounded-button text-base-700 disabled:opacity-50"
        whileHover={{ scale: 1.12, color: "#0E0F10", backgroundColor: "rgba(14,15,16,0.04)" }}
        whileTap={{ scale: 0.90 }}
        transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <MoreHorizontal size={18} />
      </motion.button>

      {error && <p className="text-body-sm font-semibold text-red-600">{error}</p>}

      {/* Dropdown — AnimatePresence para animação de entrada/saída */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute right-0 top-full z-10 mt-1 min-w-[160px] rounded-card border border-base-600 bg-surface-500 py-1"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
          >
            <p className="px-3 py-1 text-label-sm text-base-700">Alterar para</p>
            {roles.map((role) => (
              <motion.button
                key={role}
                type="button"
                onClick={() => handleChangeRole(role)}
                disabled={role === memberRole}
                className="w-full px-3 py-2 text-left text-body-sm text-ink-500 disabled:opacity-50"
                whileHover={{ backgroundColor: "rgba(238,239,233,1)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.1 }}
              >
                {roleLabels[role]}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
