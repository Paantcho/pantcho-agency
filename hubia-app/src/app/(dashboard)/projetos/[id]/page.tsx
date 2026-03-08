import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getProjetoById } from "../actions";
import ProjetoDetailClient from "./projeto-detail-client";

export default async function ProjetoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const member = user?.id
    ? await prisma.organizationMember.findFirst({ where: { userId: user.id, isActive: true } })
    : null;

  if (!member) notFound();

  const projeto = await getProjetoById(member.organizationId, id);
  if (!projeto) notFound();

  return <ProjetoDetailClient projeto={projeto} organizationId={member.organizationId} />;
}
