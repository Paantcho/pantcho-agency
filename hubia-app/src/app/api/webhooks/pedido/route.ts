/**
 * POST /api/webhooks/pedido
 *
 * Recebe pedidos de fontes externas (Telegram, API, integrações).
 * Cria o Pedido no banco com sourceType e sourcePayload registrados.
 *
 * Autenticação: header X-Webhook-Secret deve bater com WEBHOOK_SECRET do env.
 * TODO (checklist): Configurar WEBHOOK_SECRET no .env.local e no Vercel.
 *
 * Payload esperado:
 * {
 *   "organizationId": "uuid",
 *   "titulo": "Foto da Ninaah na praia",
 *   "descricao": "Creator Ninaah, praia com cachorro, luz dourada",
 *   "tipo": "imagem",         // PedidoTipo
 *   "urgencia": "media",      // PedidoUrgencia
 *   "source": "telegram",     // PedidoSourceType
 *   "sourcePayload": {},      // dados brutos da fonte
 *   "creatorSlug": "ninaah",  // opcional
 *   "dueAt": "2026-03-10"     // opcional
 * }
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dispatchTrigger } from "@/lib/triggers";

export async function POST(request: Request) {
  // Valida secret — TODO: remover o bypass quando WEBHOOK_SECRET estiver configurado
  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (webhookSecret) {
    const headerSecret = request.headers.get("x-webhook-secret");
    if (headerSecret !== webhookSecret) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { organizationId, titulo, descricao, tipo, urgencia, source, sourcePayload, creatorSlug, dueAt } = body as Record<string, string | undefined>;

  if (!organizationId || !titulo) {
    return NextResponse.json({ error: "organizationId e titulo são obrigatórios" }, { status: 400 });
  }

  const org = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!org) {
    return NextResponse.json({ error: "Organização não encontrada" }, { status: 404 });
  }

  let creatorId: string | null = null;
  if (creatorSlug) {
    const creator = await prisma.creator.findUnique({
      where: { organizationId_slug: { organizationId, slug: creatorSlug } },
    });
    creatorId = creator?.id ?? null;
  }

  const pedido = await prisma.pedido.create({
    data: {
      organizationId,
      titulo,
      descricao: descricao ?? null,
      tipo: (tipo as "imagem" | "video" | "landing_page" | "app" | "site" | "sistema" | "creator" | "skill" | "agente" | "outro") ?? "imagem",
      urgencia: (urgencia as "baixa" | "media" | "alta" | "critica") ?? "media",
      sourceType: (source as "manual" | "telegram" | "api" | "webhook") ?? "webhook",
      sourcePayload: (typeof sourcePayload === "object" && sourcePayload !== null ? sourcePayload : {}) as object,
      status: "rascunho",
      creatorId,
      dueAt: dueAt ? new Date(dueAt) : null,
    },
  });

  await dispatchTrigger({
    type: "pedido.criado",
    pedidoId: pedido.id,
    titulo: pedido.titulo,
    sourceType: pedido.sourceType,
    organizationId,
  });

  return NextResponse.json({ ok: true, pedidoId: pedido.id }, { status: 201 });
}
