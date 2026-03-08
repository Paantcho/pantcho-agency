/**
 * HUBIA — Seed de dados mockados
 *
 * Popula o banco com dados realistas para que todas as páginas
 * fiquem funcionais imediatamente, sem depender de cadastros manuais.
 *
 * Execução: npm run db:seed
 */

import path from "node:path";
import dotenv from "dotenv";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── IDs reais do banco ───────────────────────────────────────────────────────
const ORG_ID = "8d1c0aac-3e9b-44c5-b0b8-7529d5da0412"; // Pantcho Agency — já existe
const CREATOR_NINAAH_ID = "dceffb0a-ea8a-4303-9d5a-25cb2b15752e"; // Ninaah — já existe

// IDs para novos dados
const CREATOR_SOFIA_ID = "a1b2c3d4-0000-0000-0000-000000000201";
const PROJETO_HUB_ID = "a1b2c3d4-0000-0000-0000-000000000100";
const PROJETO_NINAAH_ID = "a1b2c3d4-0000-0000-0000-000000000101";
const PROJETO_PRIVACY_ID = "a1b2c3d4-0000-0000-0000-000000000102";

// Data helpers
const hoje = new Date();
const d = (offsetDays: number) => {
  const dt = new Date(hoje);
  dt.setDate(dt.getDate() + offsetDays);
  dt.setHours(12, 0, 0, 0);
  return dt;
};

async function main() {
  console.log("🌱 Iniciando seed...");
  console.log(`   Organização: ${ORG_ID}`);

  // ─── 1. Creator Sofia ────────────────────────────────────────────────────
  await prisma.creator.upsert({
    where: { id: CREATOR_SOFIA_ID },
    update: {},
    create: {
      id: CREATOR_SOFIA_ID,
      organizationId: ORG_ID,
      name: "Sofia Alves",
      slug: "sofia-alves",
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=sofia",
      bio: "Creator fitness e bem-estar.",
      isActive: true,
      metadata: {
        platforms: ["instagram", "youtube"],
        city: "Rio de Janeiro",
        age: 26,
        niche: "fitness",
      },
    },
  });

  // ─── 2. Projetos ─────────────────────────────────────────────────────────
  await prisma.projeto.upsert({
    where: { id: PROJETO_HUB_ID },
    update: { tipo: "saas" },
    create: {
      id: PROJETO_HUB_ID,
      organizationId: ORG_ID,
      nome: "Pantcho Agency Hub",
      descricao: "Sistema operacional centralizado da Pantcho Agency. 33 páginas, 8 módulos.",
      tipo: "saas",
      status: "ativo",
      metadata: {
        squad: "Dev Squad",
        prioridade: "Alta",
        progresso: 35,
        figmaUrl: "https://figma.com/file/LuXTz9U7A7dNgdOO5Vt50S",
        objetivo: "Sistema operacional centralizado da agência",
        deadline: "2026-04-15",
        version: "v1",
        stack: ["Next.js 15", "TypeScript", "Tailwind", "Supabase", "Prisma"],
        tarefas: [
          { id: 1, titulo: "PRD completo — 700+ linhas", concluido: true },
          { id: 2, titulo: "Wireframes HTML — 30 telas", concluido: true },
          { id: 3, titulo: "Design System definido", concluido: true },
          { id: 4, titulo: "Figma — 6 telas essenciais", concluido: false },
          { id: 5, titulo: "Scaffold Next.js 15", concluido: false },
          { id: 6, titulo: "Supabase schema", concluido: false },
          { id: 7, titulo: "Google Login + auth", concluido: false },
          { id: 8, titulo: "Deploy agency.paantcho.com", concluido: false },
        ],
        decisoes: [
          { titulo: "Google Login único", desc: "Simplicidade de onboarding", data: "2026-02-15" },
          { titulo: "Sidebar sem subitens aninhados", desc: "Navegação via abas internas", data: "2026-02-20" },
          { titulo: "Tema base: claro (#EEEFE9)", desc: "Com toggle dark futuro", data: "2026-02-22" },
        ],
        modulos: 7,
        telas: 30,
      },
    },
  });

  await prisma.projeto.upsert({
    where: { id: PROJETO_NINAAH_ID },
    update: { tipo: "conteudo" },
    create: {
      id: PROJETO_NINAAH_ID,
      organizationId: ORG_ID,
      nome: "Conteúdo Ninaah — Março",
      descricao: "Pack mensal de posts para a Ninaah. 30 posts + prompts.",
      tipo: "conteudo",
      status: "ativo",
      metadata: {
        squad: "Audiovisual Squad",
        prioridade: "Alta",
        progresso: 60,
        objetivo: "Produção do conteúdo mensal da creator Ninaah Dornfeld",
        deadline: "2026-03-31",
        version: "v1",
        posts: 30,
        postsConcluidos: 18,
        tarefas: [
          { id: 1, titulo: "Brief mensal aprovado", concluido: true },
          { id: 2, titulo: "Pack Piscina — 6 imagens", concluido: true },
          { id: 3, titulo: "Pack Fachada — 4 imagens", concluido: false },
          { id: 4, titulo: "Reels cozinha — 3 vídeos", concluido: false },
          { id: 5, titulo: "Stories diários — 30 templates", concluido: false },
        ],
        decisoes: [
          { titulo: "Mood elegante para março", desc: "Tons quentes, luz dourada", data: "2026-03-01" },
          { titulo: "Limite 20 fotos/seção", desc: "Para manter qualidade", data: "2026-03-02" },
        ],
        modulos: 3,
        telas: 18,
      },
    },
  });

  await prisma.projeto.upsert({
    where: { id: PROJETO_PRIVACY_ID },
    update: { tipo: "landing_page" },
    create: {
      id: PROJETO_PRIVACY_ID,
      organizationId: ORG_ID,
      nome: "Landing Page Privacy",
      descricao: "Homepage da plataforma social Privacy. Figma MCP + Next.js.",
      tipo: "landing_page",
      status: "ativo",
      metadata: {
        squad: "Dev Squad",
        prioridade: "Média",
        progresso: 40,
        objetivo: "Landing page de alta conversão para o Privacy",
        deadline: "2026-03-20",
        version: "v1",
        stack: ["Next.js 15", "Figma MCP", "Vercel"],
        tarefas: [
          { id: 1, titulo: "Briefing aprovado", concluido: true },
          { id: 2, titulo: "Design Figma — 6 telas", concluido: false },
          { id: 3, titulo: "Desenvolvimento frontend", concluido: false },
          { id: 4, titulo: "Deploy Vercel", concluido: false },
        ],
        decisoes: [
          { titulo: "Next.js + Tailwind", desc: "Stack definida", data: "2026-03-05" },
        ],
        modulos: 1,
        telas: 6,
      },
    },
  });

  // ─── 2b. Projetos adicionais por tipo ────────────────────────────────────
  await prisma.projeto.upsert({
    where: { id: "a1b2c3d4-0000-0000-0000-000000000103" },
    update: { tipo: "creator" },
    create: {
      id: "a1b2c3d4-0000-0000-0000-000000000103",
      organizationId: ORG_ID,
      nome: "Creator Ninaah Dornfeld",
      descricao: "Universo operacional completo da Ninaah. Identidade, aparência, tom de voz, ambientes e regras.",
      tipo: "creator",
      status: "ativo",
      metadata: {
        squad: "Audiovisual Squad",
        objetivo: "Construir e manter a identidade consistente da creator Ninaah Dornfeld",
        prazo: "Contínuo",
        progresso: 75,
        identidade: "Ninaah é uma criadora de conteúdo de lifestyle e gastronomia, 26 anos, com estética clean e sofisticada. Transmite praticidade com elegância.",
        tom_de_voz: "Acolhedor, sofisticado, casual mas com propósito. Nunca usa gírias excessivas. Fala em primeira pessoa.",
        aparencia: "Pele clara, cabelos castanhos lisos, estilo minimalista. Tons neutros: off-white, bege, terracota. Ambientes bem iluminados.",
        memoria: [
          { texto: "Audiência responde melhor a conteúdos de cozinha gravados no período da tarde", data: "2026-03-01" },
          { texto: "Evitar roupas com estampas muito chamativas — foca no produto", data: "2026-02-20" },
        ],
        rules: [
          { regra: "Nunca usar filtros que distorçam a aparência natural" },
          { regra: "Backgrounds devem ser limpos — máximo 2 elementos decorativos" },
          { regra: "Áudio limpo obrigatório — sem eco" },
        ],
        tarefas: [
          { id: 1, titulo: "Documento de identidade completo", concluido: true },
          { id: 2, titulo: "Guia de aparência revisado", concluido: true },
          { id: 3, titulo: "Tom de voz validado com client", concluido: true },
          { id: 4, titulo: "Pack de ambientes catalogados", concluido: false },
          { id: 5, titulo: "Guia de looks por estação", concluido: false },
        ],
        decisoes: [
          { titulo: "Estética clean-luxe", desc: "Definida em workshop criativo", data: "2026-02-10" },
          { titulo: "Paleta tons neutros", desc: "Off-white, bege, terracota como cores base", data: "2026-02-10" },
        ],
        modulos_ativos: ["Identidade", "Aparência", "Tom de Voz", "Ambientes", "Regras", "Conteúdo", "Assets", "Memória"],
        log: [
          { acao: "Projeto criado", data: "2026-02-01" },
          { acao: "Identidade concluída", data: "2026-02-15" },
          { acao: "Tom de voz validado", data: "2026-02-28" },
        ],
      },
    },
  });

  await prisma.projeto.upsert({
    where: { id: "a1b2c3d4-0000-0000-0000-000000000104" },
    update: { tipo: "branding" },
    create: {
      id: "a1b2c3d4-0000-0000-0000-000000000104",
      organizationId: ORG_ID,
      nome: "Branding Pantcho Agency",
      descricao: "Identidade visual e diretrizes de marca da agência. Logo, tipografia, paleta, mockups.",
      tipo: "branding",
      status: "pausado",
      metadata: {
        squad: "Audiovisual Squad",
        objetivo: "Criar identidade visual coesa para uso externo da agência",
        prazo: "Q2 2026",
        progresso: 30,
        conceito: "Identidade minimalista e editorial. Preto, limão e branco. Tipografia geométrica. Sensação de agência de nicho premium.",
        memoria: [
          { texto: "Cliente prefere referências de agências europeias — A-OK, Snøhetta", data: "2026-01-15" },
        ],
        rules: [
          { regra: "Cor limão #D7FF00 é exclusiva — não usar em tons degradê" },
          { regra: "Tipografia principal: Urbanist. Secundária: nenhuma" },
        ],
        tarefas: [
          { id: 1, titulo: "Moodboard aprovado", concluido: true },
          { id: 2, titulo: "Conceito criativo definido", concluido: true },
          { id: 3, titulo: "Proposta de logo", concluido: false },
          { id: 4, titulo: "Manual de marca", concluido: false },
          { id: 5, titulo: "Mockups finais", concluido: false },
        ],
        decisoes: [
          { titulo: "Preto + Limão como paleta base", desc: "Alta distinção visual no mercado", data: "2026-01-20" },
        ],
        modulos_ativos: ["Contexto", "Conceito", "Referências", "Exploração Visual", "Assets", "Apresentações"],
      },
    },
  });

  // ─── 3. Pedidos ──────────────────────────────────────────────────────────
  const pedidos = [
    {
      id: "a1b2c3d4-0000-0000-0000-000000000300",
      titulo: "Reels Ninaah Cozinha",
      descricao: "3 vídeos curtos. Creator: Ninaah. Tom: descontraído e elegante.",
      tipo: "video" as const,
      status: "rascunho" as const,
      urgencia: "media" as const,
      creatorId: CREATOR_NINAAH_ID,
      projetoId: PROJETO_NINAAH_ID,
      dueAt: d(5),
      briefing: { squad: "AUDIOVISUAL", referencias: ["@minimalistbaker"], formato: "Reels 9:16", duracao: "15-30s" },
    },
    {
      id: "a1b2c3d4-0000-0000-0000-000000000301",
      titulo: "Landing Page Privacy",
      descricao: "Homepage completa. Next.js 15. Figma MCP.",
      tipo: "landing_page" as const,
      status: "em_andamento" as const,
      urgencia: "alta" as const,
      creatorId: null as null,
      projetoId: PROJETO_PRIVACY_ID,
      dueAt: d(12),
      briefing: { squad: "DEV", stack: ["Next.js 15", "Figma MCP"], progresso: 40, fase: "Frontend" },
    },
    {
      id: "a1b2c3d4-0000-0000-0000-000000000302",
      titulo: "Pack Ninaah Piscina Março",
      descricao: "6 imagens. Mood elegante. Tarde.",
      tipo: "imagem" as const,
      status: "aguardando" as const,
      urgencia: "critica" as const,
      creatorId: CREATOR_NINAAH_ID,
      projetoId: PROJETO_NINAAH_ID,
      dueAt: d(-3),
      briefing: { squad: "AUDIOVISUAL", quantidade: 6, mood: "Elegante", horario: "Tarde", validacao: "Pendente" },
    },
    {
      id: "a1b2c3d4-0000-0000-0000-000000000303",
      titulo: "Conteúdo Ninaah Março",
      descricao: "Pack mensal. 18/30 posts concluídos.",
      tipo: "imagem" as const,
      status: "em_andamento" as const,
      urgencia: "media" as const,
      creatorId: CREATOR_NINAAH_ID,
      projetoId: PROJETO_NINAAH_ID,
      dueAt: d(23),
      briefing: { squad: "AUDIOVISUAL", total: 30, concluidos: 18, pendentes: 12 },
    },
    {
      id: "a1b2c3d4-0000-0000-0000-000000000304",
      titulo: "Agency Hub PRD Final",
      descricao: "700 linhas. Aprovação Pantcho.",
      tipo: "sistema" as const,
      status: "revisao" as const,
      urgencia: "alta" as const,
      creatorId: null as null,
      projetoId: PROJETO_HUB_ID,
      dueAt: d(3),
      briefing: { squad: "DEV", linhas: 700, aprovacaoPendente: true },
    },
    {
      id: "a1b2c3d4-0000-0000-0000-000000000305",
      titulo: "Dev Squad v2.0 Arquitetura",
      descricao: "Diagrama completo do sistema.",
      tipo: "sistema" as const,
      status: "entregue" as const,
      urgencia: "baixa" as const,
      creatorId: null as null,
      projetoId: PROJETO_HUB_ID,
      dueAt: d(-7),
      completedAt: d(-6),
      briefing: { squad: "DEV" },
    },
    {
      id: "a1b2c3d4-0000-0000-0000-000000000306",
      titulo: "APPEARANCE.md Ninaah v1.0",
      descricao: "Documento forense completo.",
      tipo: "creator" as const,
      status: "entregue" as const,
      urgencia: "baixa" as const,
      creatorId: CREATOR_NINAAH_ID,
      projetoId: PROJETO_NINAAH_ID,
      dueAt: d(-10),
      completedAt: d(-9),
      briefing: { squad: "AUDIOVISUAL" },
    },
    {
      id: "a1b2c3d4-0000-0000-0000-000000000307",
      titulo: "Blog Privacy — SEO",
      descricao: "10 artigos. Keywords definidas.",
      tipo: "site" as const,
      status: "rascunho" as const,
      urgencia: "baixa" as const,
      creatorId: null as null,
      projetoId: PROJETO_PRIVACY_ID,
      dueAt: d(15),
      briefing: { squad: "DEV", artigos: 10 },
    },
    {
      id: "a1b2c3d4-0000-0000-0000-000000000308",
      titulo: "Ninaah Fachada Pack",
      descricao: "4 imagens. Mood: Elegante.",
      tipo: "imagem" as const,
      status: "rascunho" as const,
      urgencia: "media" as const,
      creatorId: CREATOR_NINAAH_ID,
      projetoId: PROJETO_NINAAH_ID,
      dueAt: d(8),
      briefing: { squad: "AUDIOVISUAL", quantidade: 4, mood: "Elegante" },
    },
    {
      id: "a1b2c3d4-0000-0000-0000-000000000309",
      titulo: "Deploy Agency Hub v1",
      descricao: "Deploy em agency.paantcho.com via Vercel.",
      tipo: "sistema" as const,
      status: "aguardando" as const,
      urgencia: "alta" as const,
      creatorId: null as null,
      projetoId: PROJETO_HUB_ID,
      dueAt: d(28),
      briefing: { squad: "DEV", plataforma: "Vercel", dominio: "agency.paantcho.com" },
    },
    {
      id: "a1b2c3d4-0000-0000-0000-000000000310",
      titulo: "Review Dev Squad v2",
      descricao: "Revisão completa do sistema de agentes.",
      tipo: "sistema" as const,
      status: "revisao" as const,
      urgencia: "alta" as const,
      creatorId: null as null,
      projetoId: PROJETO_HUB_ID,
      dueAt: d(21),
      briefing: { squad: "DEV", escopo: "Todos os agentes" },
    },
  ];

  for (const p of pedidos) {
    const data = {
      organizationId: ORG_ID,
      titulo: p.titulo,
      descricao: p.descricao,
      tipo: p.tipo,
      status: p.status,
      urgencia: p.urgencia,
      sourceType: "manual" as const,
      creatorId: p.creatorId,
      projetoId: p.projetoId,
      dueAt: p.dueAt,
      completedAt: "completedAt" in p ? (p as { completedAt?: Date }).completedAt ?? null : null,
      briefing: p.briefing as object,
    };
    await prisma.pedido.upsert({
      where: { id: p.id },
      update: { status: p.status, urgencia: p.urgencia, dueAt: p.dueAt, briefing: p.briefing as object },
      create: { id: p.id, ...data },
    });
  }

  // ─── 4. ActivityLog ──────────────────────────────────────────────────────
  const logs = [
    { action: "pedido.criado", entityType: "pedido", entityId: "a1b2c3d4-0000-0000-0000-000000000302", metadata: { titulo: "Pack Ninaah Piscina Março" }, isAlert: true },
    { action: "pedido.status_alterado", entityType: "pedido", entityId: "a1b2c3d4-0000-0000-0000-000000000301", metadata: { de: "rascunho", para: "em_andamento" }, isAlert: true },
    { action: "projeto.criado", entityType: "projeto", entityId: PROJETO_HUB_ID, metadata: { nome: "Pantcho Agency Hub" }, isAlert: true },
    { action: "creator.criada", entityType: "creator", entityId: CREATOR_NINAAH_ID, metadata: { nome: "Ninaah Dornfeld" }, isAlert: true },
    { action: "pedido.atualizado", entityType: "pedido", entityId: "a1b2c3d4-0000-0000-0000-000000000303", metadata: { campos: ["briefing"] }, isAlert: false },
  ];

  for (const log of logs) {
    const exists = await prisma.activityLog.findFirst({
      where: { organizationId: ORG_ID, action: log.action, entityId: log.entityId },
    });
    if (!exists) {
      await prisma.activityLog.create({
        data: {
          organizationId: ORG_ID,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          metadata: log.metadata as object,
          isAlert: log.isAlert,
        },
      });
    }
  }

  console.log("✅ Seed concluído!");
  console.log(`   → 1 creator adicional (Sofia)`);
  console.log(`   → 3 projetos criados`);
  console.log(`   → ${pedidos.length} pedidos criados`);
  console.log(`   → ${logs.length} logs de atividade criados`);
}

main()
  .catch((e) => {
    console.error("❌ Seed falhou:", e.message ?? e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
