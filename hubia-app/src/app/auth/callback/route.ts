import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.id) {
        // 1. Upsert UserProfile — garante nome e email salvos na nossa DB
        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          null;

        const avatarUrl =
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          null;

        await prisma.userProfile.upsert({
          where: { id: user.id },
          update: {
            email: user.email!,
            name: name ?? undefined,
            avatarUrl: avatarUrl ?? undefined,
            lastActiveAt: new Date(),
          },
          create: {
            id: user.id,
            email: user.email!,
            name,
            avatarUrl,
            lastActiveAt: new Date(),
          },
        });

        // 2. Verificar se existe convite pendente para este email
        const pendingInvite = await prisma.invite.findFirst({
          where: {
            email: user.email!,
            acceptedAt: null,
            revokedAt: null,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: "desc" },
        });

        if (pendingInvite) {
          // Processar convite: criar membro na org e marcar como aceito
          await prisma.$transaction([
            prisma.organizationMember.upsert({
              where: {
                organizationId_userId: {
                  organizationId: pendingInvite.organizationId,
                  userId: user.id,
                },
              },
              update: {
                role: pendingInvite.role,
                isActive: true,
                acceptedAt: new Date(),
              },
              create: {
                organizationId: pendingInvite.organizationId,
                userId: user.id,
                role: pendingInvite.role,
                invitedBy: pendingInvite.invitedBy,
                invitedAt: pendingInvite.createdAt,
                acceptedAt: new Date(),
                isActive: true,
              },
            }),
            prisma.invite.update({
              where: { id: pendingInvite.id },
              data: { acceptedAt: new Date() },
            }),
          ]);

          // Redirecionar para a org que convidou
          return NextResponse.redirect(`${origin}/`);
        }

        // 3. Sem convite — garantir que o usuário esteja em pelo menos uma org
        const existingMember = await prisma.organizationMember.findFirst({
          where: { userId: user.id, isActive: true },
        });

        if (!existingMember) {
          const firstOrg = await prisma.organization.findFirst({
            where: { isActive: true },
            orderBy: { createdAt: "asc" },
          });
          if (firstOrg) {
            await prisma.organizationMember.create({
              data: {
                organizationId: firstOrg.id,
                userId: user.id,
                role: "viewer",
                isActive: true,
                acceptedAt: new Date(),
              },
            });
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
