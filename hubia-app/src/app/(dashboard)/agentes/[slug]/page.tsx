import { getAgentBySlug, hasProviderConfigured } from "../actions";
import { notFound } from "next/navigation";
import AgentDetailClient from "./agent-detail-client";

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);
  if (!agent) notFound();

  const providerReady = await hasProviderConfigured();

  return (
    <AgentDetailClient
      agent={{
        id: agent.id,
        name: agent.name,
        slug: agent.slug,
        description: agent.description,
        systemPrompt: agent.systemPrompt,
        status: agent.status,
        config: agent.config as Record<string, unknown>,
        skills: agent.skills.map((as: { skill: { id: string; name: string; slug: string; description: string | null } }) => ({
          id: as.skill.id,
          name: as.skill.name,
          slug: as.skill.slug,
          description: as.skill.description,
        })),
      }}
      providerReady={providerReady}
    />
  );
}
