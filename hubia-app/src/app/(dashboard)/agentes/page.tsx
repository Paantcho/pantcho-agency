import { getSquadsWithAgents, getSkillsBySquad } from "./actions";
import { AgentesClient } from "./agentes-client";

export const metadata = { title: "Agentes — Hubia" };

export default async function AgentesPage() {
  const [squads, skillsBySquad] = await Promise.all([
    getSquadsWithAgents(),
    getSkillsBySquad(),
  ]);

  return <AgentesClient squads={squads} skillsBySquad={skillsBySquad} />;
}
