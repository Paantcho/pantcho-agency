/**
 * HUBIA — Feature Flags por Plano
 *
 * Define quais features estão disponíveis em cada nível de plano.
 * Usado pelo sistema de governança para controlar acesso a módulos.
 *
 * Regra do proprietário:
 *   Se o usuário for owner da organização, ele tem acesso a TUDO,
 *   independente do plano. Isso é aplicado em getOrgContext().
 */

export type Feature =
  | "creators"
  | "projects"
  | "planner"
  | "agents"
  | "memory"
  | "architecture"
  | "branding"
  | "custom_domain"
  | "team_management";

export type PlanSlug = "starter" | "profissional" | "avancado" | "enterprise";

export const ALL_FEATURES: Feature[] = [
  "creators",
  "projects",
  "planner",
  "agents",
  "memory",
  "architecture",
  "branding",
  "custom_domain",
  "team_management",
];

const PLAN_FEATURES: Record<PlanSlug, Feature[]> = {
  starter: ["creators"],
  profissional: ["creators", "projects", "planner"],
  avancado: [
    "creators",
    "projects",
    "planner",
    "agents",
    "memory",
    "architecture",
  ],
  enterprise: [
    "creators",
    "projects",
    "planner",
    "agents",
    "memory",
    "architecture",
    "branding",
    "custom_domain",
    "team_management",
  ],
};

export function getPlanFeatures(planSlug: string | null): Feature[] {
  if (!planSlug) return PLAN_FEATURES.starter;
  return PLAN_FEATURES[planSlug as PlanSlug] ?? PLAN_FEATURES.starter;
}

export function hasFeature(
  planSlug: string | null,
  feature: Feature,
  isOwner = false
): boolean {
  if (isOwner) return true;
  return getPlanFeatures(planSlug).includes(feature);
}

export function getPlanLevel(planSlug: string | null): 1 | 2 | 3 | 4 {
  switch (planSlug) {
    case "enterprise":
      return 4;
    case "avancado":
      return 3;
    case "profissional":
      return 2;
    default:
      return 1;
  }
}

export function getPlanName(planSlug: string | null): string {
  switch (planSlug) {
    case "enterprise":
      return "Enterprise";
    case "avancado":
      return "Avançado";
    case "profissional":
      return "Profissional";
    default:
      return "Básico";
  }
}
