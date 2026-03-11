import { getAgents, hasProviderConfigured } from "./actions";
import AgentesListClient from "./agentes-list-client";

export default async function AgentesPage() {
  const [agents, providerReady] = await Promise.all([
    getAgents(),
    hasProviderConfigured(),
  ]);

  return <AgentesListClient agents={agents} hasProvider={providerReady} />;
}
