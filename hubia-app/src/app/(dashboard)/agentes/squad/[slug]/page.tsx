import { notFound } from "next/navigation";
import { getSquadBySlug, getAllAgents, createSquad } from "../../actions";
import SquadDetailClient from "./squad-detail-client";
import type { SquadDetail } from "../../actions";

// Squads futuros pré-configurados — criados no banco na primeira visita
const FUTURE_SQUADS: Record<string, { name: string; description: string; status: SquadDetail["status"] }> = {
  "marketing-squad": {
    name: "Marketing Squad",
    description: "Copy · SEO · Ads · Analytics",
    status: "em_breve",
  },
  "crm-squad": {
    name: "CRM Squad",
    description: "Gestão de clientes e leads",
    status: "planejado",
  },
  "social-squad": {
    name: "Social Media Squad",
    description: "Publicação · Engajamento",
    status: "planejado",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const squad = await getSquadBySlug(slug);
  const futureName = FUTURE_SQUADS[slug]?.name;
  return {
    title: squad ? `${squad.name} — Squads · Hubia` : futureName ? `${futureName} — Squads · Hubia` : "Squad não encontrado",
  };
}

export default async function SquadDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let squad = await getSquadBySlug(slug);

  // Se não existe no banco mas está nos squads futuros, cria automaticamente
  if (!squad && FUTURE_SQUADS[slug]) {
    const cfg = FUTURE_SQUADS[slug];
    const result = await createSquad({ name: cfg.name, slug, description: cfg.description, status: cfg.status });
    if (result.success) {
      squad = await getSquadBySlug(slug);
    }
  }

  if (!squad) notFound();

  const allAgents = await getAllAgents();

  return <SquadDetailClient squad={squad!} allAgents={allAgents} />;
}
