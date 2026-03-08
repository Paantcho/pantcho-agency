import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import ProjetosClient from "./projetos-client";
import { getProjetos } from "./actions";

export default async function ProjetosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const member = user?.id
    ? await prisma.organizationMember.findFirst({ where: { userId: user.id, isActive: true } })
    : null;

  const organizationId = member?.organizationId ?? null;
  const projetos = organizationId ? await getProjetos(organizationId) : [];

  return <ProjetosClient organizationId={organizationId ?? ""} initialProjetos={projetos} />;
}
