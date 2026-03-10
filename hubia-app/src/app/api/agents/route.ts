import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganizationId } from "@/lib/auth-organization";

export async function GET() {
  try {
    const organizationId = await getCurrentOrganizationId();
    if (!organizationId) {
      return NextResponse.json(
        { error: "Organização não encontrada" },
        { status: 401 }
      );
    }

    const agents = await prisma.agent.findMany({
      where: { organizationId },
      include: {
        skills: {
          include: { skill: { select: { id: true, name: true, slug: true } } },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(agents);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
