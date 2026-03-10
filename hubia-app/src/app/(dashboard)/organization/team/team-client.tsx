"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Mail,
  Clock,
  RotateCw,
  X,
  MoreHorizontal,
  ShieldCheck,
} from "lucide-react";
import { MemberRole } from "@prisma/client";
import {
  updateMemberRole,
  removeMember,
  revokeInvite,
  resendInvite,
  type TeamMemberRow,
  type PendingInviteRow,
} from "@/app/(dashboard)/config/equipe/actions";
import { toast } from "@/components/ui/hubia-toast";
import InviteModal from "./invite-modal";
import { useRouter } from "next/navigation";

const roleBadge: Record<MemberRole, { bg: string; text: string; label: string }> = {
  owner: { bg: "#0E0F10", text: "#D7FF00", label: "Proprietário" },
  admin: { bg: "#D7FF00", text: "#0E0F10", label: "Admin" },
  editor: { bg: "#EEEFE9", text: "#0E0F10", label: "Editor" },
  viewer: { bg: "#EEEFE9", text: "#A9AAA5", label: "Visualizador" },
};

const roleDesc: Record<MemberRole, string> = {
  owner: "Controle total. Não pode ser alterado.",
  admin: "Pode alterar plano, branding e membros.",
  editor: "Usa todas as funcionalidades operacionais.",
  viewer: "Acesso somente leitura.",
};

function getInitials(name: string | null, email: string | null): string {
  if (name) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "??";
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatExpiry(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Expirado";
  if (days === 1) return "Expira amanhã";
  return `Expira em ${days} dias`;
}

// ── Dropdown de ações do membro ──────────────────────────────
function MemberActions({
  organizationId,
  memberId,
  memberRole,
  canEdit,
  onRefresh,
}: {
  organizationId: string;
  memberId: string;
  memberRole: MemberRole;
  canEdit: boolean;
  onRefresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (memberRole === "owner" || !canEdit) return null;

  const editableRoles: MemberRole[] = ["admin", "editor", "viewer"];

  async function handleChangeRole(role: MemberRole) {
    setLoading(true);
    setOpen(false);
    const res = await updateMemberRole(organizationId, memberId, role);
    setLoading(false);
    if (res.ok) {
      toast.success("Role atualizado");
      onRefresh();
    } else {
      toast.error(res.error ?? "Erro ao atualizar role");
    }
  }

  async function handleRemove() {
    setLoading(true);
    setOpen(false);
    const res = await removeMember(organizationId, memberId);
    setLoading(false);
    if (res.ok) {
      toast.success("Membro removido");
      onRefresh();
    } else {
      toast.error(res.error ?? "Erro ao remover membro");
    }
  }

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className="flex h-8 w-8 items-center justify-center rounded-[12px] text-base-700 disabled:opacity-40"
        whileHover={{ scale: 1.12, color: "#0E0F10", backgroundColor: "rgba(14,15,16,0.04)" }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <MoreHorizontal size={16} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute right-0 top-full z-20 mt-1 min-w-[190px] overflow-hidden rounded-[12px] border border-[#EEEFE9] bg-white py-1"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
          >
            <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-base-700">
              Alterar para
            </p>
            {editableRoles
              .filter((r) => r !== memberRole)
              .map((r) => (
                <motion.button
                  key={r}
                  type="button"
                  onClick={() => handleChangeRole(r)}
                  className="w-full px-3 py-2 text-left text-[13px] font-semibold text-ink-500"
                  whileHover={{ backgroundColor: "#EEEFE9" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                >
                  {roleBadge[r].label}
                </motion.button>
              ))}
            <div className="mx-3 my-1 h-px bg-base-500" />
            <motion.button
              type="button"
              onClick={handleRemove}
              className="w-full px-3 py-2 text-left text-[13px] font-semibold text-red-500"
              whileHover={{ backgroundColor: "#FFF0F0" }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.1 }}
            >
              Remover da organização
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────
export default function TeamClient({
  organizationId,
  members,
  pendingInvites,
  currentUserRole,
  canEdit,
}: {
  organizationId: string;
  members: TeamMemberRow[];
  pendingInvites: PendingInviteRow[];
  currentUserRole: MemberRole | null;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loadingInviteId, setLoadingInviteId] = useState<string | null>(null);

  function refresh() {
    router.refresh();
  }

  async function handleRevokeInvite(inviteId: string) {
    setLoadingInviteId(inviteId);
    const res = await revokeInvite(organizationId, inviteId);
    setLoadingInviteId(null);
    if (res.ok) {
      toast.success("Convite revogado");
      refresh();
    } else {
      toast.error(res.error ?? "Erro ao revogar convite");
    }
  }

  async function handleResendInvite(inviteId: string) {
    setLoadingInviteId(inviteId);
    const res = await resendInvite(organizationId, inviteId);
    setLoadingInviteId(null);
    if (res.ok) {
      toast.success("Convite reenviado");
      refresh();
    } else {
      toast.error(res.error ?? "Erro ao reenviar convite");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-bold text-ink-500">Membros da equipe</h2>
          <p className="mt-0.5 text-[12px] text-base-700">
            {members.length} membro{members.length !== 1 ? "s" : ""} ativo
            {members.length !== 1 ? "s" : ""}
            {pendingInvites.length > 0 &&
              ` · ${pendingInvites.length} convite${pendingInvites.length !== 1 ? "s" : ""} pendente${pendingInvites.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        {canEdit && (
          <motion.button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 rounded-[14px] bg-limao-500 px-5 py-2.5 text-[13px] font-bold text-ink-500"
            whileHover={{ scale: 1.03, backgroundColor: "#DFFF33" }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Plus size={15} strokeWidth={2.5} />
            Convidar membro
          </motion.button>
        )}
      </div>

      {/* Lista de membros ativos */}
      {members.length === 0 ? (
        <div className="rounded-[16px] border-2 border-dashed border-[#D5D2C9] p-10 text-center">
          <p className="text-[14px] text-base-700">
            {organizationId
              ? "Nenhum membro ainda. Convide alguém para começar."
              : "Você não está vinculado a nenhuma organização."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {members.map((member, i) => (
            <motion.div
              key={member.id}
              className="flex items-center gap-4 rounded-[14px] bg-white px-5 py-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.25), duration: 0.28, ease: [0, 0, 0.2, 1] }}
            >
              {/* Avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-base-500 text-[12px] font-bold text-ink-500">
                {member.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.avatarUrl}
                    alt={member.name ?? ""}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  getInitials(member.name, member.email)
                )}
              </div>

              {/* Identidade */}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[14px] font-semibold text-ink-500 truncate">
                  {member.name ?? member.email ?? `Usuário ${member.userId.slice(0, 8)}`}
                </span>
                {member.email && (
                  <span className="text-[12px] text-base-700 truncate">{member.email}</span>
                )}
                <span className="text-[11px] text-base-700">
                  Desde {formatDate(member.acceptedAt ?? member.invitedAt)}
                </span>
              </div>

              {/* Badge de role */}
              <span
                className="shrink-0 rounded-[7px] px-3 py-1 text-[11px] font-bold"
                style={{
                  backgroundColor: roleBadge[member.role].bg,
                  color: roleBadge[member.role].text,
                }}
              >
                {roleBadge[member.role].label}
              </span>

              {/* Ações */}
              <MemberActions
                organizationId={organizationId}
                memberId={member.id}
                memberRole={member.role}
                canEdit={canEdit && (member.role !== "owner" || currentUserRole === "owner")}
                onRefresh={refresh}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Convites pendentes */}
      {pendingInvites.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-base-700" />
            <p className="text-[12px] font-semibold text-base-700 uppercase tracking-wide">
              Convites pendentes
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {pendingInvites.map((inv, i) => (
              <motion.div
                key={inv.id}
                className="flex items-center gap-4 rounded-[14px] border border-dashed border-[#D5D2C9] bg-white px-5 py-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: Math.min(i * 0.05 + members.length * 0.05, 0.3),
                  duration: 0.28,
                  ease: [0, 0, 0.2, 1],
                }}
              >
                {/* Ícone de email */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-base-500">
                  <Mail size={15} className="text-base-700" />
                </div>

                {/* Info */}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[14px] font-semibold text-ink-500 truncate">
                    {inv.email}
                  </span>
                  <span className="text-[11px] text-base-700">
                    Convidado por {inv.inviterName ?? "—"} · {formatExpiry(inv.expiresAt)}
                  </span>
                </div>

                {/* Badge de role */}
                <span
                  className="shrink-0 rounded-[7px] px-3 py-1 text-[11px] font-bold opacity-60"
                  style={{
                    backgroundColor: roleBadge[inv.role].bg,
                    color: roleBadge[inv.role].text,
                  }}
                >
                  {roleBadge[inv.role].label}
                </span>

                {/* Ações do convite */}
                {canEdit && (
                  <div className="flex items-center gap-1 shrink-0">
                    <motion.button
                      type="button"
                      onClick={() => handleResendInvite(inv.id)}
                      disabled={loadingInviteId === inv.id}
                      title="Reenviar convite"
                      className="flex h-8 w-8 items-center justify-center rounded-[12px] text-base-700 disabled:opacity-40"
                      whileHover={{ scale: 1.12, color: "#0E0F10", backgroundColor: "rgba(14,15,16,0.04)" }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                    >
                      <RotateCw size={14} />
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => handleRevokeInvite(inv.id)}
                      disabled={loadingInviteId === inv.id}
                      title="Revogar convite"
                      className="flex h-8 w-8 items-center justify-center rounded-[12px] text-base-700 disabled:opacity-40"
                      whileHover={{ scale: 1.12, color: "#EF4444", backgroundColor: "rgba(239,68,68,0.08)" }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                    >
                      <X size={14} />
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Legenda de roles */}
      <div className="rounded-[16px] bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck size={13} className="text-base-700" />
          <p className="text-[12px] font-semibold text-base-700 uppercase tracking-wide">
            Permissões por role
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {(["owner", "admin", "editor", "viewer"] as MemberRole[]).map((role) => (
            <div key={role} className="rounded-[12px] bg-base-500 p-3">
              <span
                className="mb-2 inline-block rounded-[6px] px-2 py-0.5 text-[10px] font-bold"
                style={{
                  backgroundColor: roleBadge[role].bg,
                  color: roleBadge[role].text,
                }}
              >
                {roleBadge[role].label}
              </span>
              <p className="text-[11px] text-ink-400 leading-relaxed">{roleDesc[role]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de convite */}
      <AnimatePresence>
        {showInviteModal && (
          <InviteModal
            organizationId={organizationId}
            onClose={() => {
              setShowInviteModal(false);
              refresh();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
