/**
 * Sistema de Gatilhos (Triggers) da Hubia
 *
 * Quando algo acontece na plataforma, esse módulo decide:
 * 1. Se é um evento que deve gerar alerta (badge no sino, banner, etc.)
 * 2. Quais destinatários devem ser notificados (usuários, agentes)
 * 3. Como a notificação chega (in-app por ora; email/Telegram futuramente)
 *
 * INTEGRAÇÃO EXTERNA PENDENTE (ver checklist ao final do projeto):
 * - Telegram: enviar mensagem para bot do Jun
 * - Email: via Resend/SendGrid
 * - Agentes: via webhook interno ou polling de ActivityLog
 */

import { logActivity } from "./activity-log";

export type TriggerEvent =
  | { type: "pedido.criado"; pedidoId: string; titulo: string; sourceType: string; organizationId: string; userId?: string }
  | { type: "pedido.status_alterado"; pedidoId: string; titulo: string; statusAnterior: string; statusNovo: string; organizationId: string; userId?: string }
  | { type: "creator.criada"; creatorId: string; nome: string; organizationId: string; userId?: string }
  | { type: "conhecimento.ai_processado"; entradaId: string; titulo: string; organizationId: string }
  | { type: "projeto.criado"; projetoId: string; nome: string; organizationId: string; userId?: string };

/**
 * Dispara um gatilho: registra no ActivityLog e (futuramente) notifica externos.
 */
export async function dispatchTrigger(event: TriggerEvent) {
  switch (event.type) {
    case "pedido.criado":
      await logActivity({
        organizationId: event.organizationId,
        userId: event.userId,
        action: "pedido.criado",
        entityType: "pedido",
        entityId: event.pedidoId,
        metadata: { titulo: event.titulo, sourceType: event.sourceType },
      });
      break;

    case "pedido.status_alterado":
      await logActivity({
        organizationId: event.organizationId,
        userId: event.userId,
        action: "pedido.status_alterado",
        entityType: "pedido",
        entityId: event.pedidoId,
        metadata: {
          titulo: event.titulo,
          de: event.statusAnterior,
          para: event.statusNovo,
        },
      });
      break;

    case "creator.criada":
      await logActivity({
        organizationId: event.organizationId,
        userId: event.userId,
        action: "creator.criada",
        entityType: "creator",
        entityId: event.creatorId,
        metadata: { nome: event.nome },
      });
      break;

    case "conhecimento.ai_processado":
      await logActivity({
        organizationId: event.organizationId,
        action: "conhecimento.ai_processado",
        entityType: "knowledge_entry",
        entityId: event.entradaId,
        metadata: { titulo: event.titulo },
      });
      break;

    case "projeto.criado":
      await logActivity({
        organizationId: event.organizationId,
        userId: event.userId,
        action: "projeto.criado",
        entityType: "projeto",
        entityId: event.projetoId,
        metadata: { nome: event.nome },
      });
      break;
  }

  // TODO (checklist): Integrar notificações externas aqui
  // await notifyTelegram(event);
  // await notifyEmail(event);
  // await notifyAgents(event);
}
