import { notFound } from "next/navigation";
import { getAgentBySlug, getSquadsWithAgents } from "../actions";
import AgentDetailPageClient from "./agent-detail-client";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);
  return { title: agent ? `${agent.name} — Agentes · Hubia` : "Agente não encontrado" };
}

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [agent, squads] = await Promise.all([getAgentBySlug(slug), getSquadsWithAgents()]);
  if (!agent) notFound();

  return <AgentDetailPageClient agent={agent} squads={squads} />;
}
