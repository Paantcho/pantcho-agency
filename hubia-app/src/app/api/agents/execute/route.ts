import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { executeAgentStream } from "@/lib/agents/engine";
import { getCurrentOrganizationId } from "@/lib/auth-organization";

const executeSchema = z.object({
  agentSlug: z.string().min(1),
  message: z.string().min(1),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
});

export async function POST(request: NextRequest) {
  try {
    const organizationId = await getCurrentOrganizationId();
    if (!organizationId) {
      return NextResponse.json(
        { error: "Organização não encontrada" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = executeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { agentSlug, message, history } = parsed.data;

    const { stream, model } = await executeAgentStream({
      agentSlug,
      message,
      history,
      organizationId,
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Agent-Model": model,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
