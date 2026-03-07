"use client";

import { useState, useRef, useEffect } from "react";
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
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className="flex h-[36px] w-[36px] items-center justify-center rounded-button text-base-700 transition-colors duration-200 hover:bg-base-500 hover:text-ink-500 disabled:opacity-50"
      >
        <MoreHorizontal size={18} />
      </button>
      {error && (
        <p className="text-body-sm font-medium text-red-600">{error}</p>
      )}
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 min-w-[160px] rounded-card border border-base-600 bg-surface-500 py-1 shadow-lg">
          <p className="px-3 py-1 text-label-sm text-base-700">
            Alterar para
          </p>
          {roles.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => handleChangeRole(role)}
              disabled={role === memberRole}
              className="w-full px-3 py-2 text-left text-body-sm text-ink-500 hover:bg-base-500 disabled:opacity-50"
            >
              {roleLabels[role]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
