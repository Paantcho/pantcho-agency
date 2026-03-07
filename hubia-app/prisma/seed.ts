import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // 1. Plano interno (sem limites) para a Pantcho Agency
  const planInterno = await prisma.plan.upsert({
    where: { slug: "interno" },
    update: {},
    create: {
      name: "Interno",
      slug: "interno",
      description: "Plano interno da Pantcho Agency — sem limites.",
      price: null,
      interval: null,
      limits: {
        max_creators: -1,
        max_prompts_per_month: -1,
        max_team_members: -1,
        max_ai_providers: -1,
        max_projects: -1,
      },
      features: ["all"],
      isActive: true,
      sortOrder: 0,
    },
  });

  // 2. Planos para usuários futuros (Fase 2 — criados agora para referência)
  const planFree = await prisma.plan.upsert({
    where: { slug: "free" },
    update: {},
    create: {
      name: "Free",
      slug: "free",
      description: "Plano gratuito com limites básicos.",
      price: 0,
      interval: "monthly",
      limits: {
        max_creators: 1,
        max_prompts_per_month: 50,
        max_team_members: 1,
        max_ai_providers: 1,
        max_projects: 3,
      },
      features: ["basic"],
      isActive: true,
      sortOrder: 1,
    },
  });

  const planPro = await prisma.plan.upsert({
    where: { slug: "pro" },
    update: {},
    create: {
      name: "Pro",
      slug: "pro",
      description: "Para profissionais e pequenas equipes.",
      price: 49.9,
      interval: "monthly",
      limits: {
        max_creators: 5,
        max_prompts_per_month: 500,
        max_team_members: 5,
        max_ai_providers: 3,
        max_projects: 20,
      },
      features: ["basic", "pro"],
      isActive: true,
      sortOrder: 2,
    },
  });

  const planBusiness = await prisma.plan.upsert({
    where: { slug: "business" },
    update: {},
    create: {
      name: "Business",
      slug: "business",
      description: "Para agências e empresas.",
      price: 149.9,
      interval: "monthly",
      limits: {
        max_creators: 20,
        max_prompts_per_month: 2000,
        max_team_members: 20,
        max_ai_providers: 10,
        max_projects: -1,
      },
      features: ["basic", "pro", "business"],
      isActive: true,
      sortOrder: 3,
    },
  });

  // 3. Organização seed — Pantcho Agency
  const pantchoAgency = await prisma.organization.upsert({
    where: { slug: "pantcho-agency" },
    update: {},
    create: {
      name: "Pantcho Agency",
      slug: "pantcho-agency",
      planId: planInterno.id,
      isActive: true,
      settings: {
        isSeeded: true,
        tier: "internal",
      },
    },
  });

  // 4. Branding da Pantcho Agency (Limão-500 como primária)
  await prisma.organizationBranding.upsert({
    where: { organizationId: pantchoAgency.id },
    update: {},
    create: {
      organizationId: pantchoAgency.id,
      colorPrimary: "#D7FF00",
      colorScale: {
        "50": "#FAFFCC",
        "100": "#F5FF99",
        "200": "#EDFF66",
        "300": "#E2FF33",
        "400": "#D7FF00",
        "500": "#D7FF00",
        "600": "#ACCC00",
        "700": "#819900",
        "800": "#566600",
        "900": "#2B3300",
      },
    },
  });

  // 5. Feature flags globais
  const flags = [
    { name: "ai_generation", description: "Geração de conteúdo com IA", isGlobal: true },
    { name: "video_generation", description: "Geração de vídeo (Fase 3)", isGlobal: false, planRequired: "business" },
    { name: "white_label", description: "White-label e domínio customizado (Fase 3)", isGlobal: false, planRequired: "enterprise" },
    { name: "custom_ai_providers", description: "Provedores de IA customizados", isGlobal: false, planRequired: "pro" },
  ];

  for (const flag of flags) {
    await prisma.featureFlag.upsert({
      where: { name: flag.name },
      update: {},
      create: flag,
    });
  }

  console.log("Seed completo:");
  console.log(`  - Planos: ${planInterno.name}, ${planFree.name}, ${planPro.name}, ${planBusiness.name}`);
  console.log(`  - Organização: ${pantchoAgency.name} (${pantchoAgency.slug})`);
  console.log(`  - Feature flags: ${flags.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
