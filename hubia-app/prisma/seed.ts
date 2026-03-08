/**
 * HUBIA — Seed de dados mockados v3
 *
 * 7 projetos de tipos variados com conteúdo rico em TODAS as abas:
 * saas, landing_page, creator, conteudo, campanha, branding, app
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

// ─── IDs fixos ────────────────────────────────────────────────────────────────
const ORG_ID             = "8d1c0aac-3e9b-44c5-b0b8-7529d5da0412";
const CREATOR_NINAAH_ID  = "dceffb0a-ea8a-4303-9d5a-25cb2b15752e";
const CREATOR_SOFIA_ID   = "a1b2c3d4-0000-0000-0000-000000000201";

const P_HUB_ID      = "a1b2c3d4-0000-0000-0000-000000000100"; // SaaS
const P_NINAAH_ID   = "a1b2c3d4-0000-0000-0000-000000000101"; // Conteúdo
const P_PRIVACY_ID  = "a1b2c3d4-0000-0000-0000-000000000102"; // Landing Page
const P_CREATOR_ID  = "a1b2c3d4-0000-0000-0000-000000000103"; // Creator
const P_BRANDING_ID = "a1b2c3d4-0000-0000-0000-000000000104"; // Branding
const P_APP_ID      = "a1b2c3d4-0000-0000-0000-000000000105"; // App
const P_CAMPANHA_ID = "a1b2c3d4-0000-0000-0000-000000000106"; // Campanha

// Data helpers
const hoje = new Date();
const d = (offsetDays: number) => {
  const dt = new Date(hoje);
  dt.setDate(dt.getDate() + offsetDays);
  dt.setHours(12, 0, 0, 0);
  return dt;
};

async function main() {
  console.log("🌱 Iniciando seed v3...");

  // ─── 1. Creators ─────────────────────────────────────────────────────────
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
      metadata: { platforms: ["instagram", "youtube"], city: "Rio de Janeiro", age: 26, niche: "fitness" },
    },
  });

  // ─── 2. Projetos ─────────────────────────────────────────────────────────

  // ── 2.1 SaaS — Pantcho Agency Hub ───────────────────────────────────────
  await prisma.projeto.upsert({
    where: { id: P_HUB_ID },
    update: {
      tipo: "saas",
      metadata: {
        squad: "Dev Squad",
        prioridade: "Alta",
        progresso: 38,
        prazo: "Abril 2026",
        objetivo: "Construir o sistema operacional centralizado da Pantcho Agency — plataforma SaaS multi-tenant para gestão de creators, pedidos, projetos e agentes de IA.",
        contexto: "A Pantcho Agency é uma agência criativa que opera com criadores de conteúdo, dev squad e audiovisual squad. O Hub é a plataforma interna que centraliza todas as operações, substituindo planilhas, Notion e ferramentas dispersas. O produto precisa ser enterprise desde o primeiro deploy, com multi-tenancy, RLS, e escalabilidade para outros clientes futuros.",
        prd: "## Visão do Produto\nHub operacional para agências criativas. Cada tenant é uma agência independente.\n\n## Usuários\n- Diretor: visão full, aprovações\n- Operador: cria pedidos e projetos\n- Creator: visualiza seus próprios pedidos\n\n## Módulos\n1. Dashboard com KPIs\n2. Pedidos (Kanban + Calendário + Lista)\n3. Projetos (adaptativo por tipo)\n4. Creators (perfis + geração de prompt)\n5. Gerador de Prompt (IA)\n6. Relatório\n7. Conhecimento\n8. Memória\n9. Arquitetura\n10. Config\n\n## Requisitos não funcionais\n- Load time < 2s\n- RLS em todas as tabelas\n- Zero downtime deploy\n- Logs de auditoria em todas as ações",
        arquitetura_notas: "## Stack\nNext.js 15 (App Router) + TypeScript + Tailwind 4 + Shadcn/UI\nSupabase (Postgres + Auth + Storage) + Prisma 7 (adapter-pg)\nVercel (deploy) + Framer Motion (animations)\n\n## Arquitetura de dados\n- Multi-tenant via organization_id em todas as tabelas\n- RLS policies no Supabase\n- Server Actions para mutations\n- Server Components para fetching\n\n## Rotas\n/dashboard · /pedidos · /pedidos/[id] · /projetos · /projetos/[id]\n/creators · /creators/[slug] · /gerador · /relatorio · /conhecimento\n/memoria · /arquitetura · /agentes · /agentes/[slug] · /config",
        deploy_notas: "Vercel — produção em agency.paantcho.com\nBranch main → deploy automático\nVariáveis: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY, DIRECT_URL, WEBHOOK_SECRET",
        figmaUrl: "https://figma.com/file/LuXTz9U7A7dNgdOO5Vt50S",
        stack: ["Next.js 15", "TypeScript", "Tailwind 4", "Supabase", "Prisma 7", "Framer Motion", "Vercel"],
        tarefas: [
          { id: 1,  titulo: "PRD v4.0 — 700+ linhas",              concluido: true  },
          { id: 2,  titulo: "Design System Hubia definido",         concluido: true  },
          { id: 3,  titulo: "Schema Prisma — 19+ tabelas",          concluido: true  },
          { id: 4,  titulo: "Auth — Google OAuth + magic link",     concluido: true  },
          { id: 5,  titulo: "Dashboard + KPIs animados",            concluido: true  },
          { id: 6,  titulo: "Sidebar com pill spring",              concluido: true  },
          { id: 7,  titulo: "Pedidos — Kanban + DnD",               concluido: true  },
          { id: 8,  titulo: "Creators — lista + detalhe 5 tabs",    concluido: true  },
          { id: 9,  titulo: "Gerador de Prompt",                    concluido: true  },
          { id: 10, titulo: "Agentes — squads + detalhe",           concluido: true  },
          { id: 11, titulo: "Projetos — hub por tipo",              concluido: false },
          { id: 12, titulo: "Relatório — dashboard de métricas",    concluido: false },
          { id: 13, titulo: "Conhecimento — biblioteca",            concluido: false },
          { id: 14, titulo: "Memória — sistema de contexto",        concluido: false },
          { id: 15, titulo: "Deploy — agency.paantcho.com",         concluido: false },
        ],
        decisoes: [
          { titulo: "Google Login único", desc: "Simplicidade de onboarding. Magic link como fallback.", data: "2026-02-15" },
          { titulo: "Sidebar sem subitens aninhados", desc: "Navegação interna via tabs horizontais — mais limpo.", data: "2026-02-20" },
          { titulo: "Flat design absoluto", desc: "Zero box-shadow em UI. Profundidade via cor de fundo.", data: "2026-02-22" },
          { titulo: "Urbanist como fonte exclusiva", desc: "Bold, SemiBold, Regular. Nunca usar outra fonte.", data: "2026-02-22" },
          { titulo: "Framer Motion obrigatório", desc: "CSS keyframes só para ícones SVG via group-hover.", data: "2026-02-25" },
        ],
        memoria: [
          { texto: "Usuário é diretor de arte — não desenvolvedor. Explicar decisões em linguagem simples.", data: "2026-02-01" },
          { texto: "Toda modificação relevante deve gerar log. Sem exceção.", data: "2026-02-10" },
          { texto: "Cor limão #D7FF00 é a cor primária — nunca substituir por outro tom.", data: "2026-02-22" },
          { texto: "AppShell nunca tem white box global. Cada página gerencia seu container.", data: "2026-03-08" },
        ],
        rules: [
          { regra: "organization_id em TODAS as queries — sem exceção" },
          { regra: "RLS ativo em todas as tabelas do Supabase" },
          { regra: "Nunca usar box-shadow em componentes de UI" },
          { regra: "Nunca usar transition: all — especificar propriedades" },
          { regra: "Nunca usar input[type=date] nativo — sempre HubiaDatePicker" },
          { regra: "API keys nunca em plaintext — sempre criptografadas" },
        ],
        log: [
          { acao: "Projeto criado — PRD v1 iniciado", data: "2026-02-01" },
          { acao: "Design System definido — tokens, tipografia, cores", data: "2026-02-22" },
          { acao: "Schema Prisma 19 tabelas — db push executado", data: "2026-03-01" },
          { acao: "Dashboard, Sidebar, Auth — entregues", data: "2026-03-03" },
          { acao: "Pedidos v2 — DnD, modal 2 colunas, toasts Hubia", data: "2026-03-08" },
          { acao: "Projetos v2 — hub por tipo, 15 tipos, abas adaptativas", data: "2026-03-08" },
        ],
        modulos_ativos: ["Contexto", "PRD", "Arquitetura", "Banco", "Auth", "Frontend", "Backend", "Integrações", "Deploy", "Observabilidade", "Rules"],
        integracoes: ["Figma MCP", "GitHub", "Supabase", "Vercel", "Google OAuth", "Anthropic API", "Telegram Bot"],
      } as object,
    },
    create: {
      id: P_HUB_ID,
      organizationId: ORG_ID,
      nome: "Pantcho Agency Hub",
      descricao: "Sistema operacional centralizado da Pantcho Agency. SaaS multi-tenant, 33 páginas.",
      tipo: "saas",
      status: "ativo",
      metadata: {} as object,
    },
  });

  // ── 2.2 Conteúdo — Ninaah Março ──────────────────────────────────────────
  await prisma.projeto.upsert({
    where: { id: P_NINAAH_ID },
    update: {
      tipo: "conteudo",
      metadata: {
        squad: "Audiovisual Squad",
        prioridade: "Alta",
        progresso: 60,
        prazo: "31 Mar 2026",
        objetivo: "Produção do pack mensal de conteúdo da creator Ninaah Dornfeld para março de 2026. 30 posts + stories + reels.",
        contexto: "Ninaah Dornfeld é uma creator de lifestyle e gastronomia com ~180k seguidores no Instagram. O conteúdo de março tem como tema principal 'primeiros dias de outono' — transição de paleta para tons mais quentes, ambientes internos e receitas aconchegantes. O pack inclui 12 fotos estáticas, 6 reels curtos e 12 stories.",
        conceito: "Tema: Primeiro Outono\nPaleta: tons quentes — terracota, bege escuro, verde sálvia, marrom\nIluminação: luz dourada de fim de tarde (hora dourada)\nAmbientes: cozinha, varanda externa, sala de jantar\nEnergia: aconchegante, sofisticada, pessoal\n\nDiferencial de março: mostrar mais o rosto e a rotina real. Menos estática, mais movimento.",
        tarefas: [
          { id: 1, titulo: "Brief mensal aprovado",           concluido: true  },
          { id: 2, titulo: "Pack Cozinha — 4 fotos + 1 reel", concluido: true  },
          { id: 3, titulo: "Pack Varanda — 4 fotos",          concluido: true  },
          { id: 4, titulo: "Pack Sala de Jantar — 4 fotos",   concluido: false },
          { id: 5, titulo: "Reels — 3 vídeos restantes",      concluido: false },
          { id: 6, titulo: "Stories — 12 templates",          concluido: false },
          { id: 7, titulo: "Revisão final com cliente",       concluido: false },
          { id: 8, titulo: "Entrega e aprovação",             concluido: false },
        ],
        decisoes: [
          { titulo: "Tema: Primeiro Outono", desc: "Aprovado pelo cliente em 2026-03-01. Paleta quente.", data: "2026-03-01" },
          { titulo: "Hora dourada como padrão de luz", desc: "Todos os sets externos entre 16h-18h.", data: "2026-03-03" },
          { titulo: "Formato Reels: 15-30s", desc: "Melhor performance no Instagram atual.", data: "2026-03-03" },
        ],
        memoria: [
          { texto: "Ninaah prefere ser avisada com 48h de antecedência para shoots", data: "2026-02-15" },
          { texto: "Fundo da cozinha dela (azulejo branco) funciona muito bem para produtos", data: "2026-03-02" },
          { texto: "Reels com cozinha tiveram 3x mais alcance que fotos estáticas em fevereiro", data: "2026-03-05" },
        ],
        rules: [
          { regra: "Nunca usar filtros que alterem a cor da pele da Ninaah" },
          { regra: "Legendas sempre em primeira pessoa — nunca terceira" },
          { regra: "Hashtags: máximo 5 — sem hashtagspam" },
          { regra: "Produtos na foto: no máximo 1 por frame" },
        ],
        log: [
          { acao: "Projeto criado — brief recebido", data: "2026-03-01" },
          { acao: "Pack Cozinha entregue — 5 peças", data: "2026-03-10" },
          { acao: "Pack Varanda entregue — 4 peças", data: "2026-03-15" },
        ],
        modulos_ativos: ["Briefing", "Calendário", "Peças", "Copies", "Referências", "Aprovações"],
        posts: 30,
        postsConcluidos: 18,
      } as object,
    },
    create: {
      id: P_NINAAH_ID,
      organizationId: ORG_ID,
      nome: "Conteúdo Ninaah — Março",
      descricao: "Pack mensal de posts para a Ninaah. 30 posts + prompts.",
      tipo: "conteudo",
      status: "ativo",
      metadata: {} as object,
    },
  });

  // ── 2.3 Landing Page — Privacy ───────────────────────────────────────────
  await prisma.projeto.upsert({
    where: { id: P_PRIVACY_ID },
    update: {
      tipo: "landing_page",
      metadata: {
        squad: "Dev Squad",
        prioridade: "Média",
        progresso: 45,
        prazo: "20 Mar 2026",
        objetivo: "Landing page de alta conversão para o Privacy — plataforma social de assinaturas. Foco em CTR e signup.",
        contexto: "Privacy é uma plataforma de conteúdo exclusivo estilo OnlyFans, mas com foco em lifestyle, fitness e gastronomia. O site precisa transmitir modernidade, exclusividade e confiança. Público-alvo: creators e seus fãs entre 20-35 anos. Meta: 10% de conversão de visita para cadastro.",
        prd: "## Objetivo\nLanding page de conversão para signup de creators e assinantes.\n\n## Seções\n1. Hero — headline impactante + CTA\n2. Como funciona — 3 passos\n3. Creators em destaque — fotos\n4. Planos — tabela de preços\n5. Depoimentos\n6. FAQ\n7. Footer\n\n## KPIs de sucesso\n- Bounce rate < 40%\n- Time on page > 2min\n- Conversão > 10%",
        arquitetura_notas: "## Stack\nNext.js 15 + Tailwind + Framer Motion + Vercel\n\n## Integrações\n- Figma MCP para exportação de assets\n- Vercel Analytics para tracking\n- HubSpot para captura de leads (formulário de contato)\n\n## Performance\n- Core Web Vitals: LCP < 2.5s, CLS < 0.1\n- Imagens via next/image com lazy loading\n- Animações: reduzirem prefers-reduced-motion",
        design_notas: "Referências visuais: Linear.app, Loom.com, Notion.so\nEstilo: dark com acentos limão/branco\nFonte: Urbanist Bold para headlines\nAnimações: entrada sutil com fade+slide\nHero: vídeo loop de 10s de creators usando a plataforma",
        deploy_notas: "Vercel — privacyapp.com.br\nDomínio já registrado pelo cliente\nCI: push to main → deploy automático\nStagging: staging.privacyapp.com.br",
        figmaUrl: "https://figma.com/file/privacy-landingpage-2026",
        stack: ["Next.js 15", "Tailwind", "Framer Motion", "Vercel"],
        tarefas: [
          { id: 1, titulo: "Briefing do cliente — aprovado",   concluido: true  },
          { id: 2, titulo: "Wireframes das 7 seções",          concluido: true  },
          { id: 3, titulo: "Design Figma completo",             concluido: false },
          { id: 4, titulo: "Desenvolvimento — seções 1-3",     concluido: false },
          { id: 5, titulo: "Desenvolvimento — seções 4-7",     concluido: false },
          { id: 6, titulo: "SEO + Meta tags",                   concluido: false },
          { id: 7, titulo: "Deploy + Domínio",                  concluido: false },
        ],
        decisoes: [
          { titulo: "Next.js + Tailwind como stack", desc: "Performance e velocidade de dev.", data: "2026-03-05" },
          { titulo: "Dark mode como padrão", desc: "Melhor alinhamento com o público-alvo.", data: "2026-03-05" },
          { titulo: "CTA principal: 'Começar grátis'", desc: "Testado em A/B — 23% mais cliques.", data: "2026-03-07" },
        ],
        memoria: [
          { texto: "Cliente quer vídeo autoplay no hero — verificar impacto em mobile", data: "2026-03-06" },
          { texto: "Cor primária do cliente: #7C6AF7 (roxo). Não conflita com Hubia.", data: "2026-03-07" },
        ],
        rules: [
          { regra: "Nunca mostrar preços em dólar — apenas real brasileiro" },
          { regra: "Imagens de creators: sempre com permissão assinada" },
          { regra: "Formulários: nunca pedir CPF na landing" },
        ],
        log: [
          { acao: "Projeto criado — briefing recebido", data: "2026-03-01" },
          { acao: "Wireframes aprovados pelo cliente", data: "2026-03-07" },
        ],
        modulos_ativos: ["Briefing", "Arquitetura", "Design", "Conteúdo", "Dev", "Deploy", "Analytics"],
      } as object,
    },
    create: {
      id: P_PRIVACY_ID,
      organizationId: ORG_ID,
      nome: "Landing Page Privacy",
      descricao: "Homepage da plataforma social Privacy. Figma MCP + Next.js.",
      tipo: "landing_page",
      status: "ativo",
      metadata: {} as object,
    },
  });

  // ── 2.4 Creator — Ninaah Dornfeld ────────────────────────────────────────
  await prisma.projeto.upsert({
    where: { id: P_CREATOR_ID },
    update: {
      tipo: "creator",
      metadata: {
        squad: "Audiovisual Squad",
        prazo: "Contínuo",
        progresso: 78,
        objetivo: "Manter a identidade, consistência e operação completa da creator Ninaah Dornfeld.",
        contexto: "Ninaah Dornfeld é uma creator de conteúdo de lifestyle, gastronomia e bem-estar baseada em São Paulo. Ela opera no Instagram (@ninaah.dornfeld) e YouTube, com foco em receitas saudáveis, decoração e rotina de bem-estar. A Pantcho Agency é responsável por toda a produção de conteúdo visual e estratégia de publicação.",
        identidade: "Nome completo: Ninaah Dornfeld\nIdade: 26 anos · São Paulo, SP\nNicho: Lifestyle + Gastronomia + Bem-estar\n\nPersonalidade: Acolhedora, sofisticada, prática. Gosta de mostrar que uma vida bonita não precisa ser complicada. Acredita que a cozinha é o coração da casa.\n\nValores: autenticidade, qualidade, praticidade, bem-viver\nMissão narrativa: 'Mostrar que a vida elegante é acessível quando você sabe o que priorizar.'\n\nPlataformas:\n- Instagram: @ninaah.dornfeld — 182k seguidores\n- YouTube: Ninaah Dornfeld — 44k inscritos\n- TikTok: presença secundária",
        tom_de_voz: "## Tom Geral\nAcolhedor, inteligente, levemente íntimo. Como uma amiga que sabe o que está fazendo.\n\n## Expressões recorrentes\n- 'Deixa eu te mostrar...'\n- 'Essa é uma das minhas favoritas'\n- 'Simples, mas muda tudo'\n- 'Você vai precisar de pouco para isso'\n\n## O que nunca diz\n- Gírias excessivas ou de internet\n- Frases motivacionais vazias\n- 'Arrasa!' ou equivalentes\n- Texto em caps lock\n\n## Formato de legenda\nParágrafo curto + lista de ingredientes ou passos + CTA sutil + 5 hashtags max",
        aparencia: "## Características Físicas\nPele clara, cabelos castanhos lisos na altura dos ombros.\nEstilo pessoal: minimalista-elegante. Roupas de qualidade, sem estampas chamativas.\n\n## Paleta pessoal\nOff-white · Bege · Terracota · Verde sálvia · Marrom quente\n\n## Looks recorrentes\n- Look cozinha: avental de linho bege, blusa off-white simples\n- Look casual: calça de alfaiataria + blusa básica de qualidade\n- Look externo: estilo minimal-chic, cores neutras\n\n## Diretrizes de imagem\n- Sempre iluminação natural ou luz difusa\n- Fundos limpos — máximo 2 elementos decorativos\n- Nunca filtros que alteram a cor da pele\n- Proporção 4:5 para fotos estáticas no Instagram",
        tarefas: [
          { id: 1, titulo: "IDENTITY.md — documento completo",       concluido: true  },
          { id: 2, titulo: "APPEARANCE.md — aparência e looks",      concluido: true  },
          { id: 3, titulo: "TOM_DE_VOZ.md — linguagem validado",     concluido: true  },
          { id: 4, titulo: "Pack de ambientes catalogados",           concluido: false },
          { id: 5, titulo: "Guia de looks por estação",               concluido: false },
          { id: 6, titulo: "Banco de referências visuais",            concluido: false },
        ],
        decisoes: [
          { titulo: "Estética clean-luxe como diretriz", desc: "Definida em workshop criativo com a Ninaah", data: "2026-02-10" },
          { titulo: "Paleta de tons neutros", desc: "Off-white, bege, terracota como cores base de todos os conteúdos", data: "2026-02-10" },
          { titulo: "YouTube como canal secundário", desc: "Instagram é prioridade. YouTube recebe recortes de Reels", data: "2026-02-15" },
        ],
        memoria: [
          { texto: "Audiência responde 3x melhor a conteúdos de cozinha gravados no período da tarde", data: "2026-03-01" },
          { texto: "Evitar roupas com estampas muito chamativas — foco deve ser no produto ou comida", data: "2026-02-20" },
          { texto: "Reels com música instrumental brasileira têm melhor retenção na audiência dela", data: "2026-02-28" },
          { texto: "Horário de pico: terça e quinta entre 18h-20h", data: "2026-03-05" },
        ],
        rules: [
          { regra: "Nunca usar filtros que distorçam a aparência natural" },
          { regra: "Backgrounds devem ser limpos — máximo 2 elementos decorativos" },
          { regra: "Áudio limpo obrigatório — sem eco nem reverb" },
          { regra: "Produtos: apenas marcas pré-aprovadas pela Ninaah" },
          { regra: "Legendas em primeira pessoa — nunca terceira" },
        ],
        log: [
          { acao: "Projeto criado", data: "2026-02-01" },
          { acao: "IDENTITY.md v1.0 entregue", data: "2026-02-15" },
          { acao: "APPEARANCE.md v1.0 entregue", data: "2026-02-20" },
          { acao: "Tom de voz validado com a Ninaah", data: "2026-02-28" },
        ],
        modulos_ativos: ["Identidade", "Aparência", "Tom de Voz", "Ambientes", "Regras", "Conteúdo", "Assets", "Memória"],
      } as object,
    },
    create: {
      id: P_CREATOR_ID,
      organizationId: ORG_ID,
      nome: "Creator Ninaah Dornfeld",
      descricao: "Universo operacional da Ninaah. Identidade, aparência, tom de voz e regras.",
      tipo: "creator",
      status: "ativo",
      metadata: {} as object,
    },
  });

  // ── 2.5 Branding — Pantcho Agency ────────────────────────────────────────
  await prisma.projeto.upsert({
    where: { id: P_BRANDING_ID },
    update: {
      tipo: "branding",
      metadata: {
        squad: "Audiovisual Squad",
        prazo: "Q2 2026",
        progresso: 32,
        objetivo: "Criar a identidade visual completa da Pantcho Agency para uso externo: logo, tipografia, paleta, brand voice e aplicações.",
        contexto: "A Pantcho Agency é uma agência criativa de nicho focada em creators premium e marcas de lifestyle. A identidade visual precisa transmitir modernidade, precisão e sofisticação — como uma agência europeia de design. O logo deve ser facilmente aplicável em fundo escuro e claro. Entrega para Q2 2026.",
        conceito: "## Conceito Central\nEditorial Minimalista — a sofisticação que dispensa explicações.\n\n## Referências\n- A-OK Studio (Oslo) — rigor gráfico\n- Snøhetta — arquitetura de identidade\n- Pentagram — clareza e impacto\n\n## Mood\nPreto e limão. Sem gradientes. Sem ornamentos.\nCada elemento tem um propósito. Nada é decorativo.\n\n## Typografia\nUrbanist como fonte principal. Sem secundária.\nPeso: Bold para headlines, SemiBold para body.\n\n## Paleta\n#0E0F10 — Ink (principal)\n#D7FF00 — Limão (acento)\n#FFFFFF — Branco (superfícies)\n#EEEFE9 — Base (fundos)",
        tarefas: [
          { id: 1, titulo: "Moodboard aprovado",               concluido: true  },
          { id: 2, titulo: "Conceito criativo definido",       concluido: true  },
          { id: 3, titulo: "Exploração de logo — 5 direções",  concluido: false },
          { id: 4, titulo: "Logo final aprovado",              concluido: false },
          { id: 5, titulo: "Manual de marca v1.0",             concluido: false },
          { id: 6, titulo: "Mockups de aplicação",             concluido: false },
          { id: 7, titulo: "Brand Voice Guide",                concluido: false },
        ],
        decisoes: [
          { titulo: "Preto + Limão como paleta base", desc: "Alta distinção visual no mercado. Remete ao produto e à energia criativa.", data: "2026-01-20" },
          { titulo: "Tipografia exclusiva: Urbanist", desc: "Clareza, modernidade e exclusividade no segmento criativo.", data: "2026-01-22" },
          { titulo: "Flat design absoluto", desc: "Sem sombras, sem gradientes. Profissionalismo pelo essencial.", data: "2026-01-25" },
        ],
        memoria: [
          { texto: "Referências preferidas do cliente: A-OK, Snøhetta, Pentagram", data: "2026-01-15" },
          { texto: "Logo deve funcionar bem em avatar circular (Instagram)", data: "2026-01-18" },
          { texto: "Versão escura do logo (limão sobre preto) é a aplicação principal", data: "2026-01-25" },
        ],
        rules: [
          { regra: "Cor limão #D7FF00 é exclusiva — nunca usar em tons degradê" },
          { regra: "Tipografia principal: Urbanist. Nenhuma fonte secundária" },
          { regra: "Logo nunca em fundos coloridos — apenas preto, branco ou limão" },
          { regra: "Margens mínimas do logo: 20% da altura do símbolo em todos os lados" },
        ],
        log: [
          { acao: "Projeto criado — briefing recebido", data: "2026-01-10" },
          { acao: "Reunião de alinhamento — referências aprovadas", data: "2026-01-15" },
          { acao: "Moodboard apresentado e aprovado", data: "2026-01-20" },
          { acao: "Conceito criativo definido e documentado", data: "2026-01-25" },
        ],
        modulos_ativos: ["Contexto", "Conceito", "Referências", "Exploração Visual", "Assets", "Apresentações"],
      } as object,
    },
    create: {
      id: P_BRANDING_ID,
      organizationId: ORG_ID,
      nome: "Branding Pantcho Agency",
      descricao: "Identidade visual da agência. Logo, tipografia, paleta, manual de marca.",
      tipo: "branding",
      status: "pausado",
      metadata: {} as object,
    },
  });

  // ── 2.6 App — Hubia Mobile ────────────────────────────────────────────────
  await prisma.projeto.upsert({
    where: { id: P_APP_ID },
    update: {
      tipo: "app",
      metadata: {
        squad: "Dev Squad",
        prazo: "Q3 2026",
        progresso: 12,
        objetivo: "Versão mobile do Hub para uso dos creators — visualizar pedidos, aprovar conteúdo e comunicar com a agência diretamente pelo celular.",
        contexto: "Os creators precisam de uma forma rápida de acompanhar e aprovar conteúdo sem precisar acessar o Hub via web. O app deve ser leve, focado em aprovações e notificações. Fase 1: iOS. Fase 2: Android. Stack: React Native + Expo.",
        prd: "## Visão\nApp mobile para creators aprovarem conteúdo produzido pela agência.\n\n## Usuários\n- Creator: aprovação de peças, visualização de pedidos, chat com agência\n\n## Funcionalidades Fase 1\n1. Login com magic link\n2. Lista de pedidos do creator\n3. Visualização de imagem/vídeo\n4. Ação: Aprovar / Solicitar ajuste\n5. Comentários inline na imagem\n6. Push notification para novos pedidos\n\n## Funcionalidades Fase 2\n- Calendário de publicação\n- Dashboard de métricas\n- Chat com equipe",
        arquitetura_notas: "## Stack\nReact Native + Expo SDK 52\nNative Wind (Tailwind para RN)\nSupabase JS Client (auth + realtime)\nExpo Notifications (push)\n\n## Arquitetura\nMesmo banco Supabase do Hub\nAPI separada via Supabase Edge Functions\nSem servidor dedicado — serverless full\n\n## Auth\nMagic Link via Supabase Auth\nSessão persistida no SecureStore",
        tarefas: [
          { id: 1, titulo: "PRD Fase 1 — aprovado",                  concluido: true  },
          { id: 2, titulo: "Wireframes das 5 telas principais",       concluido: false },
          { id: 3, titulo: "Design system mobile (tokens RN)",        concluido: false },
          { id: 4, titulo: "Scaffold Expo + NativeWind",              concluido: false },
          { id: 5, titulo: "Auth — magic link + SecureStore",         concluido: false },
          { id: 6, titulo: "Lista de pedidos com status",             concluido: false },
          { id: 7, titulo: "Visualização de imagem + aprovação",      concluido: false },
          { id: 8, titulo: "Push notifications via Expo",             concluido: false },
          { id: 9, titulo: "Submissão App Store",                     concluido: false },
        ],
        decisoes: [
          { titulo: "React Native + Expo como stack", desc: "Velocidade de desenvolvimento. Mesma equipe do Hub.", data: "2026-03-01" },
          { titulo: "Fase 1 apenas iOS", desc: "Maioria dos creators usa iPhone. Android em fase 2.", data: "2026-03-01" },
          { titulo: "Serverless com Supabase Edge Functions", desc: "Zero custo de infra adicional.", data: "2026-03-05" },
        ],
        memoria: [
          { texto: "Creators reclamaram que aprovar conteúdo via WhatsApp é caótico — app resolve isso", data: "2026-02-20" },
          { texto: "Ninaah testou wireframes e pediu: 'quero ver a foto grande logo de cara'", data: "2026-03-02" },
        ],
        rules: [
          { regra: "Nunca fazer upload direto no app — sempre via Hub web" },
          { regra: "Aprovação de conteúdo é irreversível no app — confirmação obrigatória" },
          { regra: "Push notifications: máximo 2 por dia por creator" },
        ],
        log: [
          { acao: "Projeto criado — PRD iniciado", data: "2026-03-01" },
          { acao: "PRD Fase 1 concluído e aprovado", data: "2026-03-05" },
        ],
        stack: ["React Native", "Expo SDK 52", "NativeWind", "Supabase", "TypeScript"],
        modulos_ativos: ["Contexto", "PRD", "Arquitetura", "Design", "Frontend", "Backend", "Deploy", "Observabilidade"],
      } as object,
    },
    create: {
      id: P_APP_ID,
      organizationId: ORG_ID,
      nome: "Hubia Mobile — App Creator",
      descricao: "App mobile para creators aprovarem conteúdo e acompanharem pedidos.",
      tipo: "app",
      status: "ativo",
      metadata: {} as object,
    },
  });

  // ── 2.7 Campanha — Lançamento Sofia Alves ────────────────────────────────
  await prisma.projeto.upsert({
    where: { id: P_CAMPANHA_ID },
    update: {
      tipo: "campanha",
      metadata: {
        squad: "Audiovisual Squad",
        prazo: "15 Abr 2026",
        progresso: 20,
        objetivo: "Campanha de lançamento da creator Sofia Alves no Instagram. Objetivo: 10k seguidores em 30 dias.",
        contexto: "Sofia Alves é nova creator no portfólio da Pantcho Agency. Nicho: fitness e bem-estar, 26 anos, Rio de Janeiro. Conta criada do zero. A campanha de lançamento precisa criar impacto imediato e estabelecer a identidade visual e o tom de voz da Sofia antes de qualquer postagem orgânica regular.",
        conceito: "## Conceito: Movimento Próprio\nSofia não é mais uma conta de fitness. Ela é a prova de que movimento é estilo de vida, não obrigação.\n\n## Ideia central\nMostrar Sofia em movimento — no treino, na cidade, na vida real. Energia alta, autenticidade, Rio de Janeiro como cenário.\n\n## Primeiras 12 peças\n- 4 fotos: ambiente externo (praia + cidade)\n- 4 fotos: treino funcional\n- 2 reels: 'um dia com a Sofia'\n- 2 stories destaques: Sobre mim + Treinos\n\n## Meta\n10k seguidores em 30 dias via campanhas pagas + orgânico",
        tarefas: [
          { id: 1, titulo: "Brief da creator — identidade inicial",   concluido: true  },
          { id: 2, titulo: "Conceito criativo aprovado",              concluido: true  },
          { id: 3, titulo: "Roteiro do shoot de lançamento",          concluido: false },
          { id: 4, titulo: "Shoot Dia 1 — Praia",                     concluido: false },
          { id: 5, titulo: "Shoot Dia 2 — Academia",                  concluido: false },
          { id: 6, titulo: "Edição das 12 peças",                     concluido: false },
          { id: 7, titulo: "Legendas + estratégia de hashtags",       concluido: false },
          { id: 8, titulo: "Publicação + gestão primeiros 7 dias",    concluido: false },
        ],
        decisoes: [
          { titulo: "Foto externa como abertura de perfil", desc: "Praia do Arpoador como cenário de lançamento — identifica Rio imediatamente.", data: "2026-03-10" },
          { titulo: "Campanha paga desde o dia 1", desc: "R$500 de investimento nos primeiros 15 dias — meta: 5k seguidores pagos.", data: "2026-03-10" },
        ],
        memoria: [
          { texto: "Sofia prefere treinar de manhã — melhor luz natural para shoots", data: "2026-03-08" },
          { texto: "Cores favoritas: verde esmeralda e terracota — combina com a identidade fitness", data: "2026-03-09" },
          { texto: "Sofia tem cachorro golden retriever — pode aparecer nos conteúdos de lifestyle", data: "2026-03-09" },
        ],
        rules: [
          { regra: "Nunca mostrar marcas de concorrentes dos parceiros" },
          { regra: "Antes de qualquer postagem: aprovação da Sofia obrigatória" },
          { regra: "Legendas: tom animado mas não exagerado — evitar exclamações em excesso" },
        ],
        log: [
          { acao: "Projeto criado — Sofia Alves onboarding", data: "2026-03-08" },
          { acao: "Brief recebido e identidade inicial definida", data: "2026-03-09" },
          { acao: "Conceito 'Movimento Próprio' aprovado", data: "2026-03-10" },
        ],
        modulos_ativos: ["Briefing", "Conceito", "Público", "Peças", "Copies", "Aprovações"],
      } as object,
    },
    create: {
      id: P_CAMPANHA_ID,
      organizationId: ORG_ID,
      nome: "Lançamento Sofia Alves",
      descricao: "Campanha de lançamento da creator Sofia no Instagram. Meta: 10k em 30 dias.",
      tipo: "campanha",
      status: "ativo",
      metadata: {} as object,
    },
  });

  // ─── 3. Pedidos ──────────────────────────────────────────────────────────
  const pedidos = [
    {
      id: "a1b2c3d4-0000-0000-0000-000000000300",
      titulo: "Reels Ninaah Cozinha — Março",
      descricao: "3 vídeos curtos. Creator: Ninaah. Tom: descontraído e elegante.",
      tipo: "video" as const,
      status: "rascunho" as const,
      urgencia: "media" as const,
      creatorId: CREATOR_NINAAH_ID,
      projetoId: P_NINAAH_ID,
      dueAt: d(5),
      briefing: { squad: "AUDIOVISUAL", referencias: ["@minimalistbaker", "@bonappetit"], formato: "Reels 9:16", duracao: "15-30s", musica: "Instrumental brasileira", locacao: "Cozinha da Ninaah" },
    },
    {
      id: "a1b2c3d4-0000-0000-0000-000000000301",
      titulo: "Landing Page Privacy — Desenvolvimento",
      descricao: "Homepage completa. Next.js 15. Figma MCP. 7 seções.",
      tipo: "landing_page" as const,
      status: "em_andamento" as const,
      urgencia: "alta" as const,
      creatorId: null as null,
      projetoId: P_PRIVACY_ID,
      dueAt: d(12),
      briefing: { squad: "DEV", stack: ["Next.js 15", "Tailwind", "Framer Motion"], progresso: 45, fase: "Seções 1-3", figmaUrl: "https://figma.com/file/privacy-landingpage-2026" },
    },
    {
      id: "a1b2c3d4-0000-0000-0000-000000000302",
      titulo: "Pack Ninaah Sala de Jantar",
      descricao: "4 imagens. Mood outono. Hora dourada.",
      tipo: "imagem" as const,
      status: "aguardando" as const,
      urgencia: "critica" as const,
      creatorId: CREATOR_NINAAH_ID,
      projetoId: P_NINAAH_ID,
      dueAt: d(3),
      briefing: { squad: "AUDIOVISUAL", quantidade: 4, mood: "Outono quente", horario: "16h-18h", locacao: "Sala de jantar", props: ["velas", "mesa posta", "flores secas"] },
    },
    {
      id: "a1b2c3d4-0000-0000-0000-000000000303",
      titulo: "Conteúdo Ninaah — Pack Completo Março",
      descricao: "Acompanhamento do pack mensal. 18/30 peças concluídas.",
      tipo: "imagem" as const,
      status: "em_andamento" as const,
      urgencia: "media" as const,
      creatorId: CREATOR_NINAAH_ID,
      projetoId: P_NINAAH_ID,
      dueAt: d(23),
      briefing: { squad: "AUDIOVISUAL", total: 30, concluidos: 18, pendentes: 12, tema: "Primeiro Outono" },
    },
    {
      id: "a1b2c3d4-0000-0000-0000-000000000304",
      titulo: "Hub PRD v4.0 — Revisão Final",
      descricao: "700+ linhas. Aprovação Pantcho antes de iniciar dev.",
      tipo: "sistema" as const,
      status: "revisao" as const,
      urgencia: "alta" as const,
      creatorId: null as null,
      projetoId: P_HUB_ID,
      dueAt: d(3),
      briefing: { squad: "DEV", linhas: 720, aprovacaoPendente: true, revisores: ["Arquiteto", "Diretor de Arte", "Dev Lead"] },
    },
    {
      id: "a1b2c3d4-0000-0000-0000-000000000305",
      titulo: "Hub — Arquitetura de Sistema v2",
      descricao: "Diagrama completo. 19 tabelas, 8 módulos, 3 squads.",
      tipo: "sistema" as const,
      status: "entregue" as const,
      urgencia: "baixa" as const,
      creatorId: null as null,
      projetoId: P_HUB_ID,
      dueAt: d(-7),
      completedAt: d(-6),
      briefing: { squad: "DEV", entidades: 19, modulos: 8, squads: 3 },
    },
    {
      id: "a1b2c3d4-0000-0000-0000-000000000306",
      titulo: "APPEARANCE.md Ninaah v1.0",
      descricao: "Documento forense completo de aparência da creator.",
      tipo: "creator" as const,
      status: "entregue" as const,
      urgencia: "baixa" as const,
      creatorId: CREATOR_NINAAH_ID,
      projetoId: P_CREATOR_ID,
      dueAt: d(-10),
      completedAt: d(-9),
      briefing: { squad: "AUDIOVISUAL", tipo: "documento-identidade", versao: "v1.0" },
    },
    {
      id: "a1b2c3d4-0000-0000-0000-000000000307",
      titulo: "Privacy Blog — 10 Artigos SEO",
      descricao: "Blog com foco em conversão orgânica. Keywords pesquisadas.",
      tipo: "site" as const,
      status: "rascunho" as const,
      urgencia: "baixa" as const,
      creatorId: null as null,
      projetoId: P_PRIVACY_ID,
      dueAt: d(15),
      briefing: { squad: "DEV", artigos: 10, keywords: ["plataforma creators", "conteúdo exclusivo", "monetização instagram"], ferramenta: "Contentful" },
    },
    {
      id: "a1b2c3d4-0000-0000-0000-000000000308",
      titulo: "Sofia — Shoot Praia Arpoador",
      descricao: "4 fotos externas. Lançamento do perfil. RJ.",
      tipo: "imagem" as const,
      status: "rascunho" as const,
      urgencia: "alta" as const,
      creatorId: CREATOR_SOFIA_ID,
      projetoId: P_CAMPANHA_ID,
      dueAt: d(8),
      briefing: { squad: "AUDIOVISUAL", quantidade: 4, locacao: "Praia do Arpoador", horario: "Manhã — 7h-9h", mood: "Energia, movimento, Rio" },
    },
    {
      id: "a1b2c3d4-0000-0000-0000-000000000309",
      titulo: "Hub Deploy — agency.paantcho.com",
      descricao: "Deploy produção via Vercel. Domínio configurado.",
      tipo: "sistema" as const,
      status: "aguardando" as const,
      urgencia: "alta" as const,
      creatorId: null as null,
      projetoId: P_HUB_ID,
      dueAt: d(28),
      briefing: { squad: "DEV", plataforma: "Vercel", dominio: "agency.paantcho.com", envVars: ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_KEY", "DIRECT_URL"] },
    },
    {
      id: "a1b2c3d4-0000-0000-0000-000000000310",
      titulo: "Branding — Exploração de Logo",
      descricao: "5 direções de logo para a Pantcho Agency.",
      tipo: "imagem" as const,
      status: "rascunho" as const,
      urgencia: "baixa" as const,
      creatorId: null as null,
      projetoId: P_BRANDING_ID,
      dueAt: d(21),
      briefing: { squad: "AUDIOVISUAL", direcoes: 5, referencias: ["A-OK Studio", "Pentagram"], formato: "SVG + PNG", fundos: ["preto", "branco", "limão"] },
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
    { action: "pedido.criado",         entityType: "pedido",  entityId: "a1b2c3d4-0000-0000-0000-000000000302", metadata: { titulo: "Pack Ninaah Sala de Jantar" },               isAlert: true  },
    { action: "pedido.status_alterado", entityType: "pedido", entityId: "a1b2c3d4-0000-0000-0000-000000000301", metadata: { de: "rascunho", para: "em_andamento" },                isAlert: true  },
    { action: "projeto.criado",        entityType: "projeto", entityId: P_HUB_ID,                              metadata: { nome: "Pantcho Agency Hub" },                         isAlert: true  },
    { action: "creator.criada",        entityType: "creator", entityId: CREATOR_NINAAH_ID,                     metadata: { nome: "Ninaah Dornfeld" },                             isAlert: true  },
    { action: "projeto.criado",        entityType: "projeto", entityId: P_CAMPANHA_ID,                         metadata: { nome: "Lançamento Sofia Alves" },                      isAlert: true  },
    { action: "pedido.atualizado",     entityType: "pedido",  entityId: "a1b2c3d4-0000-0000-0000-000000000303", metadata: { campos: ["briefing", "status"] },                     isAlert: false },
    { action: "projeto.status_alterado",entityType:"projeto", entityId: P_BRANDING_ID,                         metadata: { de: "ativo", para: "pausado" },                        isAlert: false },
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

  console.log("✅ Seed v3 concluído!");
  console.log("   → 2 creators (Ninaah + Sofia)");
  console.log("   → 7 projetos com conteúdo rico:");
  console.log("      · SaaS — Pantcho Agency Hub");
  console.log("      · Conteúdo — Ninaah Março");
  console.log("      · Landing Page — Privacy");
  console.log("      · Creator — Ninaah Dornfeld");
  console.log("      · Branding — Pantcho Agency");
  console.log("      · App — Hubia Mobile");
  console.log("      · Campanha — Lançamento Sofia Alves");
  console.log(`   → ${pedidos.length} pedidos criados`);
  console.log(`   → ${logs.length} logs de atividade`);
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
