import { Plus, MoreHorizontal } from "lucide-react";
import {
  getOrganizationIdForCurrentUser,
  getCurrentUserRoleInOrg,
  getMembers,
  type TeamMemberRow,
} from "./actions";
import { MemberRole } from "@prisma/client";
import EquipeClient from "./equipe-client";

const roleBadgeStyles: Record<MemberRole, string> = {
  owner: "bg-ink-500 text-limao-500",
  admin: "bg-limao-500 text-ink-500",
  editor: "bg-sand-100 text-ink-500",
  viewer: "bg-sand-100 text-ink-500",
};

const roleLabels: Record<MemberRole, string> = {
  owner: "Proprietário",
  admin: "Admin",
  editor: "Editor",
  viewer: "Visualizador",
};

function getInitials(userId: string): string {
  return userId.slice(0, 2).toUpperCase();
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function EquipePage() {
  const organizationId = await getOrganizationIdForCurrentUser();
  const currentUserRole = organizationId
    ? await getCurrentUserRoleInOrg(organizationId)
    : null;
  const members: TeamMemberRow[] = organizationId
    ? await getMembers(organizationId)
    : [];
  const canEdit =
    currentUserRole === "owner" || currentUserRole === "admin";

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading-xs text-ink-500">Equipe</h2>
          <p className="mt-[4px] text-body-sm text-base-700">
            Gerencie os membros da sua organização e suas permissões.
          </p>
        </div>
        <button className="flex items-center gap-[8px] rounded-button bg-limao-500 px-[16px] py-[12px] text-label-lg text-ink-500 transition-colors duration-200 hover:bg-limao-400">
          <Plus size={20} strokeWidth={2} />
          Convidar membro
        </button>
      </div>

      {members.length === 0 ? (
        <div className="rounded-card bg-surface-500 px-[24px] py-[32px] text-center text-body-md text-base-700">
          {organizationId
            ? "Nenhum membro na organização. Use “Convidar membro” quando estiver disponível."
            : "Você ainda não está em nenhuma organização. Entre em contato com o administrador."}
        </div>
      ) : (
        <div className="flex flex-col gap-[8px]">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-[16px] rounded-card bg-surface-500 px-[24px] py-[18px]"
            >
              <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-base-500 text-label-sm text-ink-500">
                {getInitials(member.userId)}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-label-md text-ink-500 truncate">
                  Usuário {member.userId.slice(0, 8)}…
                </span>
                <span className="text-body-sm text-base-700 truncate">
                  (email no Auth — configure Supabase Admin para exibir)
                </span>
              </div>
              <span
                className={`rounded-tag px-[12px] py-[4px] text-label-sm ${roleBadgeStyles[member.role]}`}
              >
                {roleLabels[member.role]}
              </span>
              <span className="hidden min-w-[120px] text-right text-body-sm text-base-700 sm:block">
                {formatDate(member.invitedAt)}
              </span>
              <EquipeClient
                organizationId={organizationId!}
                memberId={member.id}
                memberRole={member.role}
                canEdit={canEdit && (member.role !== "owner" || currentUserRole === "owner")}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
