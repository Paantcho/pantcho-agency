// ============================================================
// HUBIA — Agent Engine Types
// ============================================================

export type AgentSquad = "orquestracao" | "dev-squad" | "audiovisual-squad";

export type AgentLevel = "lead" | "specialist";

export interface AgentConfig {
  squad: AgentSquad;
  level: AgentLevel;
  icon?: string;
  color?: string;
  skills?: string[];
}

export interface AgentMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ExecuteAgentInput {
  agentSlug: string;
  message: string;
  history?: AgentMessage[];
  organizationId: string;
}

export interface ExecuteAgentResult {
  content: string;
  agentSlug: string;
  model: string;
  tokensUsed?: number;
}

export interface ProviderConfig {
  type: "anthropic" | "openai" | "google" | "custom";
  apiKey: string;
  model: string;
  baseUrl?: string;
  maxTokens?: number;
}
