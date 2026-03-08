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

  // 6. Creator seed — Ninaah Dornfeld (dados da audiovisual-squad/memory/creators/ninaah/)
  const ninaah = await prisma.creator.upsert({
    where: {
      organizationId_slug: {
        organizationId: pantchoAgency.id,
        slug: "ninaah-dornfeld",
      },
    },
    update: {
      metadata: {
        city: "Pomerode",
        state: "SC",
        age: 22,
        birthdate: "16/05/2004",
        platforms: ["instagram", "privacy", "tiktok"],
      },
    },
    create: {
      organizationId: pantchoAgency.id,
      name: "Ninaah Dornfeld",
      slug: "ninaah-dornfeld",
      bio: "Creator digital. Identidade forense documentada em APPEARANCE e AMBIENTES. Santa Catarina, Brasil.",
      isActive: true,
      metadata: {
        city: "Pomerode",
        state: "SC",
        age: 22,
        birthdate: "16/05/2004",
        platforms: ["instagram", "privacy", "tiktok"],
      },
    },
  });

  await prisma.creatorAppearance.upsert({
    where: { creatorId: ninaah.id },
    update: {},
    create: {
      creatorId: ninaah.id,
      basePrompt: `Mulher, 1,63m, rosto oval, olhos amendoados castanho claro a mel, cabelo longo castanho claro a médio (liso a levemente ondulado nas pontas). Silhueta: cintura definida, proporções naturais. Pele bem cuidada, natural. Consistência forense: traços fixos, pintinha no ombro direito. Dois moods: (A) feminina elegante (B) jovem descolada toque esportivo. Localização: Pomerode, SC. Riqueza implícita, bom gosto.`,
      markers: [],
      protected: [],
    },
  });

  const envs = [
    { name: "Sala Principal", description: "Sofá contemporâneo off-white, mesa de centro, TV, tapete neutro.", prompt: "Sala de estar contemporânea, sofá grande off-white/bege, mesa de centro madeira clara, TV em painel, iluminação quente indireta, janelas amplas com cortina de linho." },
    { name: "Cozinha Gourmet", description: "Ilha grande, bancada clara, eletros embutidos.", prompt: "Cozinha gourmet integrada, ilha com banquetas, bancada quartzo/mármore claro, eletros embutidos inox, pendentes lineares, vista para jardim/piscina." },
    { name: "Quarto da Ninaah", description: "Andar superior, cama king, ripado madeira.", prompt: "Quarto andar superior, cama king roupa de cama neutra, cabeceira estofada ou ripado madeira, parede ripado com luz indireta quente, vista área arborizada SC." },
    { name: "Área da Piscina", description: "Piscina retangular, deck claro, espreguiçadeiras.", prompt: "Área da piscina, piscina retangular contemporânea, deck claro, espreguiçadeiras minimalistas, árvore âncora visível, paisagismo SC (sem palmeiral nordeste)." },
    { name: "Garagem", description: "2 vagas, BMW X2 Cape York Green.", prompt: "Garagem 2 vagas, teto luz embutida, paredes cinza claro, chão concreto polido. BMW X2 2025 Cape York Green metallic." },
  ];
  const existingEnvs = await prisma.creatorEnvironment.findMany({
    where: { creatorId: ninaah.id },
  });
  if (existingEnvs.length === 0) {
    for (const env of envs) {
      await prisma.creatorEnvironment.create({
        data: {
          creatorId: ninaah.id,
          name: env.name,
          description: env.description,
          prompt: env.prompt,
        },
      });
    }
  }

  await prisma.creatorVoice.upsert({
    where: { creatorId: ninaah.id },
    update: {},
    create: {
      creatorId: ninaah.id,
      tone: "Elegante e acessível; alterna entre polida e descolada conforme o contexto.",
      style: "Natural chic. Textos curtos e objetivos. Evitar jargões. Tom varia por plataforma (Instagram mais solto, site mais refinado).",
      rules: [],
      examples: [],
    },
  });

  console.log("Seed completo:");
  console.log(`  - Planos: ${planInterno.name}, ${planFree.name}, ${planPro.name}, ${planBusiness.name}`);
  console.log(`  - Organização: ${pantchoAgency.name} (${pantchoAgency.slug})`);
  console.log(`  - Feature flags: ${flags.length}`);
  console.log(`  - Creator: ${ninaah.name} (${ninaah.slug})`);

  // ─── SKILLS — Dev Squad ──────────────────────────────────────────────
  const devSkillsData = [
    { name: "prd", slug: "prd", description: "Requisitos — SEMPRE primeiro em projeto novo", isAlways: true },
    { name: "analise-figma", slug: "analise-figma", description: "Extração de design, tokens, componentes via MCP" },
    { name: "arquitetura", slug: "arquitetura", description: "Stack, estrutura, pastas, dependências" },
    { name: "frontend", slug: "frontend", description: "UI, componentes, responsividade" },
    { name: "backend", slug: "backend", description: "APIs, banco, autenticação" },
    { name: "qa-review", slug: "qa-review", description: "Revisão de qualidade antes de entregar" },
    { name: "seguranca", slug: "seguranca", description: "Auth, validação, OWASP Top 10" },
    { name: "nextjs-patterns", slug: "nextjs-patterns", description: "Padrões Next.js 15 App Router" },
  ];

  const devSkills: Record<string, { id: string }> = {};
  for (const s of devSkillsData) {
    const skill = await prisma.skill.upsert({
      where: { organizationId_slug: { organizationId: pantchoAgency.id, slug: s.slug } },
      update: { description: s.description },
      create: {
        organizationId: pantchoAgency.id,
        name: s.name,
        slug: s.slug,
        description: s.description,
        isActive: true,
        config: s.isAlways ? { always: true } : {},
      },
    });
    devSkills[s.slug] = { id: skill.id };
  }

  // ─── SKILLS — Audiovisual Squad ──────────────────────────────────────
  const avSkillsData = [
    { name: "creator-bible", slug: "creator-bible", description: "Identidade completa do creator — SEMPRE", isAlways: true },
    { name: "image-prompt", slug: "image-prompt", description: "Geração de prompts de imagem" },
    { name: "video-prompt", slug: "video-prompt", description: "Geração de prompts de vídeo" },
    { name: "scene-composition", slug: "scene-composition", description: "Composição técnica de cena" },
    { name: "consistency-validation", slug: "consistency-validation", description: "Checklist forense de identidade" },
    { name: "creator-voice", slug: "creator-voice", description: "Tom, vocabulário, voz da creator" },
    { name: "content-calendar", slug: "content-calendar", description: "Planejamento de semana e mês" },
    { name: "reference-deconstruction", slug: "reference-deconstruction", description: "Análise de foto de referência" },
    { name: "visual-identity", slug: "visual-identity", description: "Estética, paleta e mood" },
  ];

  const avSkills: Record<string, { id: string }> = {};
  for (const s of avSkillsData) {
    const skill = await prisma.skill.upsert({
      where: { organizationId_slug: { organizationId: pantchoAgency.id, slug: s.slug } },
      update: { description: s.description },
      create: {
        organizationId: pantchoAgency.id,
        name: s.name,
        slug: s.slug,
        description: s.description,
        isActive: true,
        config: s.isAlways ? { always: true } : {},
      },
    });
    avSkills[s.slug] = { id: skill.id };
  }

  // ─── AGENTES ─────────────────────────────────────────────────────────
  const agentsData = [
    // Dev Squad
    {
      name: "Orquestrador",
      slug: "orquestrador",
      description: "Recebe pedidos, classifica intenção e roteia para o squad correto. Ponto único de entrada.",
      status: "ativo" as const,
      squad: "dev-squad",
      tags: ["AGENTS.md", "MEMORY.md"],
      skills: [] as string[],
    },
    {
      name: "Desenvolvimento",
      slug: "desenvolvimento",
      description: "Transforma designs em código. Next.js 15, TypeScript, Shadcn, Supabase. Nível sênior+.",
      status: "ativo" as const,
      squad: "dev-squad",
      tags: ["PRD", "Frontend", "JS", "+6"],
      skills: ["prd", "analise-figma", "arquitetura", "frontend", "backend", "qa-review", "seguranca", "nextjs-patterns"],
    },
    {
      name: "Criador de Agentes",
      slug: "criador-de-agentes",
      description: "Fábrica de novos squads e agentes. Gera SOUL.md, skills e integra na memória.",
      status: "rascunho" as const,
      squad: "dev-squad",
      tags: [],
      skills: ["prd", "arquitetura"],
    },
    // Audiovisual Squad
    {
      name: "Planner",
      slug: "planner",
      description: "Cria calendário semanal. Define narrativa, ambientes, momentos e formatos.",
      status: "rascunho" as const,
      squad: "audiovisual-squad",
      tags: ["serviço X", "serviço Y", "serviço Z"],
      skills: ["content-calendar", "creator-bible"],
    },
    {
      name: "Copywriter",
      slug: "copywriter",
      description: "Escreve legendas, scripts e voz autêntica da creator. Zero copy genérico de IA.",
      status: "rascunho" as const,
      squad: "audiovisual-squad",
      tags: ["produto A", "produto B", "produto C"],
      skills: ["creator-voice", "creator-bible"],
    },
    {
      name: "Diretor de Arte",
      slug: "diretor-de-arte",
      description: "Define mood, paleta, estética visual e referências para cada post.",
      status: "rascunho" as const,
      squad: "audiovisual-squad",
      tags: [],
      skills: ["visual-identity", "creator-bible", "reference-deconstruction"],
    },
    {
      name: "Diretor de Cena",
      slug: "diretor-de-cena",
      description: "Composição técnica: câmera, lente, luz, ângulo, props e ambiente.",
      status: "rascunho" as const,
      squad: "audiovisual-squad",
      tags: [],
      skills: ["scene-composition", "creator-bible", "image-prompt"],
    },
    {
      name: "Consistência",
      slug: "consistencia",
      description: "Guarda da identidade. Poder de veto. Valida cada imagem contra APPEARANCE.md.",
      status: "ativo" as const,
      squad: "audiovisual-squad",
      tags: ["status ativo", "status inativo", "status pendente"],
      skills: ["consistency-validation", "creator-bible"],
    },
    {
      name: "Eng. de Prompts",
      slug: "eng-de-prompts",
      description: "Gera o prompt final otimizado para imagem e vídeo. Aplica regras forenses.",
      status: "ativo" as const,
      squad: "audiovisual-squad",
      tags: [],
      skills: ["image-prompt", "video-prompt", "creator-bible", "consistency-validation"],
    },
  ];

  const createdAgents: Record<string, { id: string }> = {};
  for (const a of agentsData) {
    const agent = await prisma.agent.upsert({
      where: { organizationId_slug: { organizationId: pantchoAgency.id, slug: a.slug } },
      update: { description: a.description, status: a.status, config: { tags: a.tags, squad: a.squad } },
      create: {
        organizationId: pantchoAgency.id,
        name: a.name,
        slug: a.slug,
        description: a.description,
        status: a.status,
        config: { tags: a.tags, squad: a.squad },
      },
    });
    createdAgents[a.slug] = { id: agent.id };

    // skills do agente
    const allSkills = { ...devSkills, ...avSkills };
    for (const skillSlug of a.skills) {
      const skill = allSkills[skillSlug];
      if (!skill) continue;
      await prisma.agentSkill.upsert({
        where: { agentId_skillId: { agentId: agent.id, skillId: skill.id } },
        update: {},
        create: { agentId: agent.id, skillId: skill.id },
      });
    }
  }

  // ─── SQUADS ──────────────────────────────────────────────────────────
  const squadsData = [
    {
      name: "Dev Squad",
      slug: "dev-squad",
      description: "Engenharia & Sistemas",
      icon: "code",
      color: "#D7FF00",
      status: "ativo" as const,
      tags: ["Next.js", "TypeScript", "Supabase"],
      agents: ["orquestrador", "desenvolvimento", "criador-de-agentes"],
    },
    {
      name: "Audiovisual Squad",
      slug: "audiovisual-squad",
      description: "Creators & Estúdio",
      icon: "pen-tool",
      color: "#D7FF00",
      status: "ativo" as const,
      tags: ["Imagem", "Vídeo", "Copy"],
      agents: ["planner", "copywriter", "diretor-de-arte", "diretor-de-cena", "consistencia", "eng-de-prompts"],
    },
  ];

  for (const s of squadsData) {
    const squad = await prisma.squad.upsert({
      where: { organizationId_slug: { organizationId: pantchoAgency.id, slug: s.slug } },
      update: { description: s.description, status: s.status },
      create: {
        organizationId: pantchoAgency.id,
        name: s.name,
        slug: s.slug,
        description: s.description,
        icon: s.icon,
        color: s.color,
        status: s.status,
        tags: s.tags,
      },
    });

    for (const agentSlug of s.agents) {
      const agent = createdAgents[agentSlug];
      if (!agent) continue;
      await prisma.squadAgent.upsert({
        where: { squadId_agentId: { squadId: squad.id, agentId: agent.id } },
        update: {},
        create: { squadId: squad.id, agentId: agent.id },
      });
    }
  }

  console.log(`  - Skills Dev Squad: ${devSkillsData.length}`);
  console.log(`  - Skills Audiovisual Squad: ${avSkillsData.length}`);
  console.log(`  - Agentes: ${agentsData.length}`);
  console.log(`  - Squads: ${squadsData.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
