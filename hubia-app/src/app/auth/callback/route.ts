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
        const existing = await prisma.organizationMember.findFirst({
          where: { userId: user.id, isActive: true },
        });
        if (!existing) {
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
