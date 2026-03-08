import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import ArquiteturaClient from "./arquitetura-client";

export default async function ArquiteturaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const member = user?.id
    ? await prisma.organizationMember.findFirst({ where: { userId: user.id, isActive: true } })
    : null;

  const organizationId = member?.organizationId ?? null;

  const squads = organizationId
    ? await prisma.squad.findMany({
        where: { organizationId },
        include: {
          agents: {
            include: { agent: { select: { id: true, name: true, slug: true, status: true } } },
          },
        },
        orderBy: [{ status: "asc" }, { name: "asc" }],
      })
    : [];

  const squadsFormatados = squads.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    description: s.description,
    status: s.status,
    color: s.color,
    icon: s.icon,
    agentsCount: s.agents.length,
    agents: s.agents.map((sa) => ({
      id: sa.agent.id,
      name: sa.agent.name,
      slug: sa.agent.slug,
      status: sa.agent.status,
    })),
  }));

  return <ArquiteturaClient squads={squadsFormatados} />;
}
