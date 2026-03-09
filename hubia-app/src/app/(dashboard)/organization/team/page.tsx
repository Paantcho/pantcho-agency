import { getCurrentOrganizationId } from "@/lib/auth-organization";
import {
  getCurrentUserRoleInOrg,
  getMembers,
  getPendingInvites,
  type TeamMemberRow,
  type PendingInviteRow,
} from "@/app/(dashboard)/config/equipe/actions";
import { MemberRole } from "@prisma/client";
import TeamClient from "./team-client";

export default async function TeamPage() {
  const organizationId = await getCurrentOrganizationId();
  const currentUserRole = organizationId
    ? await getCurrentUserRoleInOrg(organizationId)
    : null;

  const [members, pendingInvites]: [TeamMemberRow[], PendingInviteRow[]] =
    organizationId
      ? await Promise.all([
          getMembers(organizationId),
          getPendingInvites(organizationId),
        ])
      : [[], []];

  const canEdit = currentUserRole === "owner" || currentUserRole === "admin";

  return (
    <TeamClient
      organizationId={organizationId ?? ""}
      members={members}
      pendingInvites={pendingInvites}
      currentUserRole={currentUserRole}
      canEdit={canEdit}
    />
  );
}
