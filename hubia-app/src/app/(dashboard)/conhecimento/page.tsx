import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import ConhecimentoClient from "./conhecimento-client";
import { getKnowledgeEntries, getCategorias } from "./actions";

export default async function ConhecimentoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const member = user?.id
    ? await prisma.organizationMember.findFirst({ where: { userId: user.id, isActive: true } })
    : null;

  const organizationId = member?.organizationId ?? null;

  const [entradas, categorias] = organizationId
    ? await Promise.all([getKnowledgeEntries(organizationId), getCategorias(organizationId)])
    : [[], []];

  return (
    <ConhecimentoClient
      organizationId={organizationId ?? ""}
      initialEntradas={entradas}
      initialCategorias={categorias}
    />
  );
}
