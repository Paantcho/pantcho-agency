import { getAgents } from "./actions";
import AgentesListClient from "./agentes-list-client";

export default async function AgentesPage() {
  const agents = await getAgents();

  return <AgentesListClient agents={agents} />;
}
