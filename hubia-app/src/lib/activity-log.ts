import { prisma } from "@/lib/prisma";

type LogAction =
  // Pedidos
  | "pedido.criado"
  | "pedido.status_alterado"
  | "pedido.creator_vinculado"
  | "pedido.projeto_vinculado"
  | "pedido.atualizado"
  | "pedido.deletado"
  // Projetos
  | "projeto.criado"
  | "projeto.atualizado"
  | "projeto.editado"
  | "projeto.status_alterado"
  | "projeto.deletado"
  // Creators
  | "creator.criada"
  | "creator.atualizada"
  | "creator.desativada"
  // Conhecimento
  | "conhecimento.entrada_criada"
  | "conhecimento.entrada_atualizada"
  | "conhecimento.ai_processado"
  // Agentes
  | "agente.criado"
  | "agente.atualizado"
  | "squad.criado"
  | "squad.atualizado"
  // Sistema
  | "config.branding_atualizado"
  | "config.provedor_adicionado"
  | "config.membro_convidado";

const ALERT_ACTIONS: LogAction[] = [
  "pedido.criado",
  "pedido.status_alterado",
  "creator.criada",
  "conhecimento.ai_processado",
];

export async function logActivity(params: {
  organizationId: string;
  userId?: string;
  action: LogAction;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  const isAlert = ALERT_ACTIONS.includes(params.action);

  await prisma.activityLog.create({
    data: {
      organizationId: params.organizationId,
      userId: params.userId ?? null,
      action: params.action,
      entityType: params.entityType ?? null,
      entityId: params.entityId ?? null,
      metadata: (params.metadata ?? {}) as object,
      isAlert,
    },
  });
}
