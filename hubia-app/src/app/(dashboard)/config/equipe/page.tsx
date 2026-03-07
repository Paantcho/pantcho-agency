import { Plus, MoreHorizontal } from "lucide-react";

type Role = "OWNER" | "ADMIN" | "MEMBER";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  invitedAt: string;
}

const mockMembers: TeamMember[] = [
  {
    id: "1",
    name: "Pantcho Silva",
    email: "pantcho@pantcho.agency",
    role: "OWNER",
    invitedAt: "2025-01-15",
  },
  {
    id: "2",
    name: "Ana Costa",
    email: "ana@pantcho.agency",
    role: "ADMIN",
    invitedAt: "2025-02-10",
  },
  {
    id: "3",
    name: "Lucas Mendes",
    email: "lucas@pantcho.agency",
    role: "MEMBER",
    invitedAt: "2025-03-01",
  },
  {
    id: "4",
    name: "Maria Oliveira",
    email: "maria@pantcho.agency",
    role: "MEMBER",
    invitedAt: "2025-03-05",
  },
];

const roleBadgeStyles: Record<Role, string> = {
  OWNER: "bg-ink-500 text-limao-500",
  ADMIN: "bg-limao-500 text-ink-500",
  MEMBER: "bg-sand-100 text-ink-500",
};

const roleLabels: Record<Role, string> = {
  OWNER: "Proprietario",
  ADMIN: "Admin",
  MEMBER: "Membro",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function EquipePage() {
  return (
    <div className="flex flex-col gap-[20px]">
      {/* Subheader */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading-xs text-ink-500">Equipe</h2>
          <p className="mt-[4px] text-body-sm text-base-700">
            Gerencie os membros da sua organizacao e suas permissoes.
          </p>
        </div>
        <button className="flex items-center gap-[8px] rounded-button bg-limao-500 px-[16px] py-[12px] text-label-lg text-ink-500 transition-colors duration-200 hover:bg-limao-400">
          <Plus size={20} strokeWidth={2} />
          Convidar membro
        </button>
      </div>

      {/* Members list */}
      <div className="flex flex-col gap-[8px]">
        {mockMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-[16px] rounded-card bg-surface-500 px-[24px] py-[18px]"
          >
            {/* Avatar */}
            <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-base-500 text-label-sm text-ink-500">
              {getInitials(member.name)}
            </div>

            {/* Name & email */}
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-label-md text-ink-500 truncate">
                {member.name}
              </span>
              <span className="text-body-sm text-base-700 truncate">
                {member.email}
              </span>
            </div>

            {/* Role badge */}
            <span
              className={`rounded-tag px-[12px] py-[4px] text-label-sm ${roleBadgeStyles[member.role]}`}
            >
              {roleLabels[member.role]}
            </span>

            {/* Invited date */}
            <span className="hidden text-body-sm text-base-700 sm:block min-w-[120px] text-right">
              {formatDate(member.invitedAt)}
            </span>

            {/* Actions */}
            <button className="flex h-[36px] w-[36px] items-center justify-center rounded-button text-base-700 transition-colors duration-200 hover:bg-base-500 hover:text-ink-500">
              <MoreHorizontal size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
