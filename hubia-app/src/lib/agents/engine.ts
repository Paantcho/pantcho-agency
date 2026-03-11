// ============================================================
// HUBIA — Agent Execution Engine
// Motor principal: recebe config → monta prompt → chama LLM → streaming
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { resolveProvider } from "./provider";
import { buildSystemPrompt } from "./prompt-builder";
import type {
  AgentMessage,
  ExecuteAgentInput,
  ExecuteAgentResult,
  ProviderConfig,
} from "./types";

/**
 * Executa um agente de forma síncrona (não-streaming).
 * Retorna a resposta completa.
 */
export async function executeAgent(
  input: ExecuteAgentInput
): Promise<ExecuteAgentResult> {
  const { agentSlug, message, history = [], organizationId } = input;

  // 1. Buscar agente no banco
  const agent = await prisma.agent.findFirst({
    where: { slug: agentSlug, organizationId, status: "ativo" },
  });
  if (!agent) {
    throw new Error(`Agente "${agentSlug}" não encontrado ou inativo`);
  }

  // 2. Resolver provider
  const provider = await resolveProvider(organizationId);
  if (!provider) {
    throw new Error(
      "Nenhum provedor de IA configurado. Vá em Config > Provedores e adicione uma chave de API."
    );
  }

  // 3. Montar system prompt
  const systemPrompt = await buildSystemPrompt(agent.id, organizationId);

  // 4. Chamar LLM
  const result = await callLLM(provider, systemPrompt, history, message);

  // 5. Log de atividade
  await prisma.activityLog.create({
    data: {
      organizationId,
      action: "agent_execute",
      entityType: "agent",
      entityId: agent.id,
      metadata: {
        agentSlug,
        model: provider.model,
        messagePreview: message.slice(0, 100),
      },
    },
  });

  return {
    content: result,
    agentSlug,
    model: provider.model,
  };
}

/**
 * Cria um stream de execução do agente.
 * Retorna um ReadableStream para SSE.
 */
export async function executeAgentStream(
  input: ExecuteAgentInput
): Promise<{ stream: ReadableStream; model: string }> {
  const { agentSlug, message, history = [], organizationId } = input;

  const agent = await prisma.agent.findFirst({
    where: { slug: agentSlug, organizationId, status: "ativo" },
  });
  if (!agent) {
    throw new Error(`Agente "${agentSlug}" não encontrado ou inativo`);
  }

  const provider = await resolveProvider(organizationId);
  if (!provider) {
    throw new Error(
      "Nenhum provedor de IA configurado. Vá em Config > Provedores e adicione uma chave de API."
    );
  }

  const systemPrompt = await buildSystemPrompt(agent.id, organizationId);

  const stream = createLLMStream(provider, systemPrompt, history, message);

  // Log assíncrono
  prisma.activityLog
    .create({
      data: {
        organizationId,
        action: "agent_stream",
        entityType: "agent",
        entityId: agent.id,
        metadata: {
          agentSlug,
          model: provider.model,
          messagePreview: message.slice(0, 100),
        },
      },
    })
    .catch(() => {});

  return { stream, model: provider.model };
}

// ============================================================
// LLM Callers
// ============================================================

async function callLLM(
  provider: ProviderConfig,
  systemPrompt: string,
  history: AgentMessage[],
  message: string
): Promise<string> {
  switch (provider.type) {
    case "anthropic":
      return callAnthropic(provider, systemPrompt, history, message);
    case "openai":
      return callOpenAI(provider, systemPrompt, history, message);
    default:
      return callOpenAI(provider, systemPrompt, history, message);
  }
}

async function callAnthropic(
  provider: ProviderConfig,
  systemPrompt: string,
  history: AgentMessage[],
  message: string
): Promise<string> {
  const client = new Anthropic({ apiKey: provider.apiKey });

  const messages: Anthropic.MessageParam[] = [
    ...history
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    { role: "user", content: message },
  ];

  const response = await client.messages.create({
    model: provider.model,
    max_tokens: provider.maxTokens || 4096,
    system: systemPrompt,
    messages,
  });

  return response.content
    .filter((block) => block.type === "text")
    .map((block) => {
      if (block.type === "text") return block.text;
      return "";
    })
    .join("");
}

async function callOpenAI(
  provider: ProviderConfig,
  systemPrompt: string,
  history: AgentMessage[],
  message: string
): Promise<string> {
  const client = new OpenAI({
    apiKey: provider.apiKey,
    baseURL: provider.baseUrl,
  });

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({
      role: m.role as "system" | "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  const response = await client.chat.completions.create({
    model: provider.model,
    max_tokens: provider.maxTokens || 4096,
    messages,
  });

  return response.choices[0]?.message?.content || "";
}

// ============================================================
// Streaming
// ============================================================

function createLLMStream(
  provider: ProviderConfig,
  systemPrompt: string,
  history: AgentMessage[],
  message: string
): ReadableStream {
  switch (provider.type) {
    case "anthropic":
      return createAnthropicStream(provider, systemPrompt, history, message);
    case "openai":
      return createOpenAIStream(provider, systemPrompt, history, message);
    default:
      return createOpenAIStream(provider, systemPrompt, history, message);
  }
}

function createAnthropicStream(
  provider: ProviderConfig,
  systemPrompt: string,
  history: AgentMessage[],
  message: string
): ReadableStream {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const client = new Anthropic({ apiKey: provider.apiKey });

        const messages: Anthropic.MessageParam[] = [
          ...history
            .filter((m) => m.role !== "system")
            .map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
          { role: "user", content: message },
        ];

        const stream = client.messages.stream({
          model: provider.model,
          max_tokens: provider.maxTokens || 4096,
          system: systemPrompt,
          messages,
        });

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const data = JSON.stringify({ text: event.delta.text });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "Erro desconhecido";
        const data = JSON.stringify({ error: msg });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        controller.close();
      }
    },
  });
}

function createOpenAIStream(
  provider: ProviderConfig,
  systemPrompt: string,
  history: AgentMessage[],
  message: string
): ReadableStream {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const client = new OpenAI({
          apiKey: provider.apiKey,
          baseURL: provider.baseUrl,
        });

        const messages: OpenAI.ChatCompletionMessageParam[] = [
          { role: "system", content: systemPrompt },
          ...history.map((m) => ({
            role: m.role as "system" | "user" | "assistant",
            content: m.content,
          })),
          { role: "user", content: message },
        ];

        const stream = await client.chat.completions.create({
          model: provider.model,
          max_tokens: provider.maxTokens || 4096,
          messages,
          stream: true,
        });

        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) {
            const data = JSON.stringify({ text });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "Erro desconhecido";
        const data = JSON.stringify({ error: msg });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        controller.close();
      }
    },
  });
}
