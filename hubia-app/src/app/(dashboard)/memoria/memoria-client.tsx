"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Lightbulb, ClipboardList, GitBranch, Activity,
  Zap, Bot, CheckCircle2, Circle,
  AlertCircle, ShieldAlert, Info, Sparkles, Calendar,
  Globe, Clock, CheckSquare, Tag,
  BookOpen, Cpu, Network, RefreshCw, Plus,
  Shield, Layers, Database, Monitor, Package,
  FlaskConical, Target, Lock, Server, Code2,
  BarChart3, FolderKanban, Users, Boxes, Wifi,
  TriangleAlert, ListChecks, ChevronDown, Crosshair,
  TrendingUp, Wrench, FileCode2,
} from "lucide-react";
import { SlidingTabs } from "@/components/ui/sliding-tabs";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type EntityVersion = {
  id: string;
  entityType: string;
  entityId: string;
  version: number;
  data: Record<string, unknown>;
  changedBy: string | null;
  createdAt: string;
};

type Tarefa = {
  id: string;
  texto: string;
  feito: boolean;
  prioridade?: "alta" | "media" | "baixa";
};

// Bloco 1 — scope; Bloco 2 — type; Bloco 3 — impact; Bloco 4 — rastreabilidade
type Decisao = {
  id: string;
  titulo: string;
  resumo: string;
  motivo: string;
  scope: "global" | "organization" | "squad" | "component";
  type: "system" | "engineering" | "product" | "tenant";
  impact: "low" | "medium" | "high" | "critical";
  impactoTexto: string;
  data: string;
  created_by: string;
  origin: string;
  updated_at?: string;
  version: number;
  tags: string[];
  entidades: string[];
  related_module?: string;
  training_signal: boolean;
};

type Licao = {
  id: string;
  titulo: string;
  problema: string;
  aprendizado: string;
  recomendacao: string;
  categoria: "design" | "dev" | "ia" | "processo" | "operacao" | "motion";
  area: string;
  origin: string;
  data: string;
  recorrente: boolean;
  virouRegra: boolean;
  scope: "global" | "organization" | "squad" | "component";
  type: "system" | "engineering" | "product" | "tenant";
  impact: "low" | "medium" | "high" | "critical";
  created_by: string;
  version: number;
  training_signal: boolean;
  related_module?: string;
};

// Bloco 6 — enforced_by
type Regra = {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  categoria: "segurança" | "design" | "motion" | "dados" | "arquitetura" | "processo" | "infraestrutura" | "interface";
  severidade: "bloqueante" | "critica" | "importante" | "recomendada";
  escopo: "global" | "sistema" | "projeto" | "ui";
  origem: string;
  enforced_by: "lint" | "runtime" | "middleware" | "policy" | "manual";
  impactoAgentes: string[];
  impactoSquads: string[];
  bloqueante: boolean;
  related_module?: string;
};

type ChangelogEntry = {
  id: string;
  data: string;
  versao: string;
  arquivo: string;
  resumo: string;
  agente: string;
  tipo: "feature" | "fix" | "refactor" | "design" | "breaking";
  impacto: "alto" | "medio" | "baixo";
  origem: string;
};

// ─── Tabs config ──────────────────────────────────────────────────────────────

const TABS = [
  { id: "working",   label: "Working",   icon: Zap },
  { id: "decisoes",  label: "Decisões",  icon: Brain },
  { id: "licoes",    label: "Lições",    icon: Lightbulb },
  { id: "regras",    label: "Regras",    icon: ClipboardList },
  { id: "changelog", label: "Changelog", icon: GitBranch },
];

// ─── Mock Data ────────────────────────────────────────────────────────────────

// Bloco 5 — Working como estado operacional do sistema
const WORKING_MOCK = {
  current_focus: "Evolução da Memória como camada operacional viva",
  iniciativa: "Hubia — Plataforma SaaS multi-tenant",
  prioridade: "alta" as const,
  progresso: 78,
  ultimaAtualizacao: "2026-03-08T19:30:00Z",
  current_architecture_phase: "Fase 2 — Features principais + IA",
  active_sprint: "Sprint Conhecimento + Memória v2",
  global_focus: "Fechar loop de features principais antes de ativar camada de IA",
  contexto: "Feature de Conhecimento foi completamente refatorada. Memória está em reconstrução para se tornar uma camada operacional viva. Build limpo. TypeScript zero erros.",
  // Bloco 5 — active_agents
  active_agents: [
    { nome: "Dev Squad", papel: "Desenvolvimento de features", status: "ativo" },
    { nome: "Motion & Interação", papel: "Refinamento de microinterações", status: "ativo" },
    { nome: "QA/Review", papel: "Revisão de entregas", status: "standby" },
  ],
  // Bloco 5 — system_blockers
  system_blockers: [
    { descricao: "API Keys OpenAI/Gemini/Claude não configuradas", severidade: "alta", modulo: "IA / Conhecimento" },
  ],
  // Bloco 5 — pending_decisions
  pending_decisions: [
    { titulo: "Definir estratégia de embedding para Conhecimento", prazo: "Sprint atual" },
    { titulo: "Atualizar seed com tipos corretos nos projetos", prazo: "Próxima sprint" },
  ],
  squads: ["Dev Squad"],
  tarefas: [
    { id: "t1",  texto: "Schema Prisma Fase 2 (Pedidos, Conhecimento, Gatilhos)", feito: true,  prioridade: "alta" },
    { id: "t2",  texto: "Pedidos: Kanban DnD + Calendário + Lista",               feito: true,  prioridade: "alta" },
    { id: "t3",  texto: "Projetos: sistema de tipos, pills, subprojetos",         feito: true,  prioridade: "alta" },
    { id: "t4",  texto: "Conhecimento: refatoração completa com mock data",       feito: true,  prioridade: "alta" },
    { id: "t5",  texto: "Memória: reconstrução como camada operacional",          feito: false, prioridade: "alta" },
    { id: "t6",  texto: "Relatório: dashboard de métricas",                       feito: false, prioridade: "media" },
    { id: "t7",  texto: "Seed: atualizar tipos dos projetos mockados",            feito: false, prioridade: "baixa" },
    { id: "t8",  texto: "HubiaDatePicker: extrair para componente global",        feito: false, prioridade: "baixa" },
  ] as Tarefa[],
};

const DECISOES_MOCK: Decisao[] = [
  {
    id: "d1",
    titulo: "Framer Motion como biblioteca única de animação",
    resumo: "Todo componente React animado usa exclusivamente Framer Motion.",
    motivo: "Consistência de easing, controle fino de variantes e AnimatePresence para entradas/saídas. CSS keyframes apenas em globals.css para group-hover de ícones SVG.",
    scope: "global",
    type: "engineering",
    impact: "critical",
    impactoTexto: "Toda a codebase de UI. Bloqueante para novos componentes.",
    data: "2026-02-22",
    created_by: "Pantcho",
    origin: "Definição de stack de animação — kickoff",
    updated_at: "2026-03-07",
    version: 2,
    tags: ["motion", "ui", "obrigatório"],
    entidades: ["todos os componentes", "globals.css"],
    related_module: "ui_components",
    training_signal: true,
  },
  {
    id: "d2",
    titulo: "Flat design absoluto — zero box-shadow em UI",
    resumo: "Separação visual feita exclusivamente por diferença de cor de fundo.",
    motivo: "Identidade visual do produto. Única exceção: foco de input (shadow ring sutil).",
    scope: "global",
    type: "product",
    impact: "high",
    impactoTexto: "Design system completo. Afeta cards, modais, painéis, dropdowns.",
    data: "2026-02-22",
    created_by: "Pantcho",
    origin: "Design System — decisão de identidade visual",
    version: 1,
    tags: ["design", "identidade", "obrigatório"],
    entidades: ["design system", "todos os cards"],
    related_module: "design_system",
    training_signal: true,
  },
  {
    id: "d3",
    titulo: "SlidingTabs como padrão de tabs horizontais",
    resumo: "Todas as tabs horizontais da plataforma usam o componente SlidingTabs com pill spring.",
    motivo: "Padronização de interação. Pill com spring stiffness 420 e damping 30 para sensação física correta.",
    scope: "global",
    type: "engineering",
    impact: "medium",
    impactoTexto: "Pedidos, Projetos, Config, Criadores, Memória — toda tab da plataforma.",
    data: "2026-03-07",
    created_by: "Dev Squad",
    origin: "Refatoração de tabs em Pedidos e Projetos",
    version: 1,
    tags: ["componente", "tabs", "design system"],
    entidades: ["SlidingTabs", "pedidos", "projetos", "config"],
    related_module: "ui_components",
    training_signal: true,
  },
  {
    id: "d4",
    titulo: "HubiaPortal obrigatório em modais",
    resumo: "Todo modal usa createPortal para document.body via HubiaPortal.",
    motivo: "Sem HubiaPortal, backdrop-filter fica limitado ao bounding box do ancestral com transform criado pelo FM — quebra o blur full-screen.",
    scope: "global",
    type: "engineering",
    impact: "critical",
    impactoTexto: "Todo modal da plataforma. Bloqueante para blur de overlay funcionar.",
    data: "2026-03-07",
    created_by: "Dev Squad",
    origin: "Debug de backdrop-filter em modal de Projetos",
    version: 1,
    tags: ["modal", "portal", "obrigatório"],
    entidades: ["HubiaPortal", "HubiaModal", "todos os modais"],
    related_module: "ui_components",
    training_signal: true,
  },
  {
    id: "d5",
    titulo: "metadata JSON em Projeto para dados sem migration",
    resumo: "Campos de squad, progresso, figmaUrl, referencias e subprojetos ficam no campo metadata JSON.",
    motivo: "Flexibilidade sem migration de banco. Permite evoluir campos sem schema change.",
    scope: "organization",
    type: "engineering",
    impact: "medium",
    impactoTexto: "Feature de Projetos. Seed e seeds futuros precisam respeitar estrutura de metadata.",
    data: "2026-03-08",
    created_by: "Dev Squad",
    origin: "Evolução da feature de Projetos — subprojetos",
    version: 1,
    tags: ["prisma", "schema", "projetos"],
    entidades: ["KnowledgeEntry", "Projeto", "metadata"],
    related_module: "database",
    training_signal: false,
  },
  {
    id: "d6",
    titulo: "Prisma 7 + Supabase Pooler via prisma.config.ts",
    resumo: "url e directUrl ficam em prisma.config.ts, não no schema.prisma.",
    motivo: "Prisma 7 quebra datasource no schema.prisma. Erro P1012. Config separado é obrigatório.",
    scope: "global",
    type: "system",
    impact: "critical",
    impactoTexto: "Toda a infraestrutura de banco. Qualquer dev ou agente que rodar migrations precisa saber disso.",
    data: "2026-03-08",
    created_by: "Dev Squad",
    origin: "Upgrade Prisma 5→7 durante setup inicial",
    version: 1,
    tags: ["prisma", "supabase", "infraestrutura"],
    entidades: ["prisma.config.ts", "schema.prisma"],
    related_module: "database",
    training_signal: true,
  },
];

const LICOES_MOCK: Licao[] = [
  {
    id: "l1",
    titulo: "animate vs style em motion.* com whileHover",
    problema: "Usar style={{ background: condicional }} em motion.* com whileHover congela o background após o primeiro hover.",
    aprendizado: "Framer Motion conflita quando background é controlado por style prop e whileHover ao mesmo tempo. FM congela o valor após o primeiro evento.",
    recomendacao: "Sempre usar animate={{ backgroundColor: isActive ? X : Y }} com initial={false}. Nunca style condicional em motion.* que também tenha whileHover.",
    categoria: "motion",
    area: "UI Components",
    origin: "Debug de pill de tabs na página de Config",
    data: "2026-03-07",
    recorrente: true,
    virouRegra: true,
    scope: "global",
    type: "engineering",
    impact: "high",
    created_by: "Dev Squad",
    version: 1,
    training_signal: true,
    related_module: "ui_components",
  },
  {
    id: "l2",
    titulo: "HubiaPortal é inegociável em modais com blur",
    problema: "backdrop-filter no overlay do modal ficava limitado à área do ancestral com transform, em vez de cobrir a tela inteira.",
    aprendizado: "Qualquer elemento com transform cria um novo stacking context. FM aplica transform em todo motion.div. O portal precisa estar em document.body para o blur funcionar corretamente.",
    recomendacao: "Todo modal da plataforma usa HubiaPortal obrigatoriamente. Não existe exceção.",
    categoria: "dev",
    area: "Modais",
    origin: "Teste de modal de criação de projeto",
    data: "2026-03-07",
    recorrente: false,
    virouRegra: true,
    scope: "global",
    type: "engineering",
    impact: "critical",
    created_by: "Dev Squad",
    version: 1,
    training_signal: true,
    related_module: "ui_components",
  },
  {
    id: "l3",
    titulo: "Prisma 7 não aceita datasource no schema.prisma",
    problema: "Migrar de Prisma 5 para 7 com url/directUrl no schema.prisma gera erro P1012 na inicialização.",
    aprendizado: "Prisma 7 exige que url e directUrl fiquem em prisma.config.ts com defineConfig. O schema.prisma continua existindo mas sem datasource.",
    recomendacao: "Usar prisma.config.ts como ponto único de configuração de datasource. Documentar no README para evitar confusão de outros devs ou agentes.",
    categoria: "dev",
    area: "Infraestrutura",
    origin: "Upgrade de dependência durante setup",
    data: "2026-03-08",
    recorrente: false,
    virouRegra: false,
    scope: "global",
    type: "system",
    impact: "high",
    created_by: "Dev Squad",
    version: 1,
    training_signal: true,
    related_module: "database",
  },
  {
    id: "l4",
    titulo: "Variantes propagadas em botões com ícone",
    problema: "Usar whileHover diretamente no motion.span filho de um botão não dispara quando o hover está no pai.",
    aprendizado: "Framer Motion propaga variantes do pai para o filho automaticamente quando o pai tem initial/animate/whileHover definidos com nomes de variante (ex: 'rest', 'hovered').",
    recomendacao: "Sempre usar initial='rest' whileHover='hovered' animate='rest' no pai. Filho usa variants com as mesmas chaves. Nunca whileHover direto no filho.",
    categoria: "motion",
    area: "Botões",
    origin: "Implementação do botão primário com ícone",
    data: "2026-03-06",
    recorrente: true,
    virouRegra: true,
    scope: "global",
    type: "engineering",
    impact: "medium",
    created_by: "Dev Squad",
    version: 1,
    training_signal: true,
    related_module: "ui_components",
  },
  {
    id: "l5",
    titulo: "Briefings sem referência visual geram 3× mais retrabalho",
    problema: "Pedidos criados sem referência visual obrigatória geraram 40% dos ciclos extras nos últimos 90 dias.",
    aprendizado: "A ausência de anti-exemplo (o que o creator não quer ver) é o erro mais frequente. Paleta de cores no briefing reduz retrabalho em 60%.",
    recomendacao: "Campo de referência visual obrigatório em todo briefing de creator. Anti-exemplo como campo obrigatório no formulário de pedido.",
    categoria: "processo",
    area: "Audiovisual Squad",
    origin: "Análise de pedidos com retrabalho — Q1 2026",
    data: "2026-03-05",
    recorrente: true,
    virouRegra: false,
    scope: "organization",
    type: "product",
    impact: "high",
    created_by: "Pantcho",
    version: 1,
    training_signal: false,
    related_module: "agents",
  },
  {
    id: "l6",
    titulo: "stagger em listas é inegociável para fluência",
    problema: "Cards que aparecem todos de uma vez criam sensação mecânica e tosca na UI.",
    aprendizado: "Math.min(i * 0.06, 0.3) como delay escalonado garante máximo de 300ms total e dá sensação de entrada orgânica.",
    recomendacao: "Todo grid ou lista de cards usa delay: Math.min(i * 0.06, 0.3). Sem exceção.",
    categoria: "motion",
    area: "Cards e listas",
    origin: "Review da aba Creators",
    data: "2026-03-04",
    recorrente: false,
    virouRegra: true,
    scope: "global",
    type: "engineering",
    impact: "medium",
    created_by: "Dev Squad",
    version: 1,
    training_signal: true,
    related_module: "ui_components",
  },
];

// Bloco 6 + 7 — enforced_by + categorias expandidas
const REGRAS_MOCK: Regra[] = [
  {
    id: "r1",
    codigo: "RUC-01",
    titulo: "organization_id em todas as queries",
    descricao: "Toda query ao banco de dados deve incluir organization_id no where. Sem exceção. Garante isolamento multi-tenant.",
    categoria: "segurança",
    severidade: "bloqueante",
    escopo: "global",
    origem: "Arquitetura multi-tenant — PRD v4",
    enforced_by: "middleware",
    impactoAgentes: ["Dev Squad", "Orquestrador"],
    impactoSquads: ["Dev Squad"],
    bloqueante: true,
    related_module: "database",
  },
  {
    id: "r2",
    codigo: "RUC-02",
    titulo: "API keys sempre criptografadas",
    descricao: "Nenhuma API key pode ficar em plaintext no banco, nos logs ou em qualquer superfície da UI. Sempre criptografar antes de persistir.",
    categoria: "segurança",
    severidade: "bloqueante",
    escopo: "global",
    origem: "Requisito de segurança — PRD v4",
    enforced_by: "policy",
    impactoAgentes: ["Dev Squad"],
    impactoSquads: ["Dev Squad"],
    bloqueante: true,
    related_module: "database",
  },
  {
    id: "r3",
    codigo: "RUC-03",
    titulo: "Framer Motion para todo componente animado",
    descricao: "Animações em componentes React usam exclusivamente Framer Motion. CSS keyframes permitidos apenas em globals.css para ícones SVG via group-hover.",
    categoria: "interface",
    severidade: "critica",
    escopo: "ui",
    origem: "Lei de Motion — hubia-motion-enforcement.mdc",
    enforced_by: "manual",
    impactoAgentes: ["Dev Squad", "Motion & Interação"],
    impactoSquads: ["Dev Squad"],
    bloqueante: false,
    related_module: "ui_components",
  },
  {
    id: "r4",
    codigo: "RUC-04",
    titulo: "HubiaPortal obrigatório em modais",
    descricao: "Todo modal da plataforma usa HubiaPortal (createPortal para document.body). Sem ele, backdrop-filter não cobre a tela inteira.",
    categoria: "arquitetura",
    severidade: "critica",
    escopo: "ui",
    origem: "Lição L2 — Debug de backdrop-filter",
    enforced_by: "manual",
    impactoAgentes: ["Dev Squad", "Motion & Interação"],
    impactoSquads: ["Dev Squad"],
    bloqueante: false,
    related_module: "ui_components",
  },
  {
    id: "r5",
    codigo: "RUC-05",
    titulo: "Flat design absoluto — zero box-shadow em UI",
    descricao: "Nenhum card, modal ou painel usa box-shadow. Separação visual feita por diferença de cor de fundo. Única exceção: foco de input.",
    categoria: "interface",
    severidade: "critica",
    escopo: "ui",
    origem: "Design System — hubia-design-system.mdc",
    enforced_by: "lint",
    impactoAgentes: ["Dev Squad", "Motion & Interação"],
    impactoSquads: ["Dev Squad"],
    bloqueante: false,
    related_module: "design_system",
  },
  {
    id: "r6",
    codigo: "RUC-06",
    titulo: "RLS ativo em todas as tabelas de negócio",
    descricao: "Row Level Security habilitado no Supabase para todas as tabelas de negócio. Queries sem organization_id devem falhar silenciosamente.",
    categoria: "segurança",
    severidade: "bloqueante",
    escopo: "global",
    origem: "Arquitetura multi-tenant — PRD v4",
    enforced_by: "runtime",
    impactoAgentes: ["Dev Squad"],
    impactoSquads: ["Dev Squad"],
    bloqueante: true,
    related_module: "database",
  },
  {
    id: "r7",
    codigo: "RUC-07",
    titulo: "Cards com stagger obrigatório",
    descricao: "Todo grid ou lista de cards usa delay escalonado: Math.min(i * 0.06, 0.3). Máximo 300ms total. Nunca aparecem todos ao mesmo tempo.",
    categoria: "interface",
    severidade: "importante",
    escopo: "ui",
    origem: "Lei de Motion — motion-interactions.mdc",
    enforced_by: "manual",
    impactoAgentes: ["Dev Squad", "Motion & Interação"],
    impactoSquads: ["Dev Squad"],
    bloqueante: false,
    related_module: "ui_components",
  },
  {
    id: "r8",
    codigo: "RUC-08",
    titulo: "Urbanist como fonte exclusiva",
    descricao: "Fonte exclusiva é Urbanist (Google Fonts). Nenhum componente usa Inter, Roboto, Arial ou qualquer outra fonte.",
    categoria: "interface",
    severidade: "critica",
    escopo: "ui",
    origem: "Design System — hubia-design-system.mdc",
    enforced_by: "lint",
    impactoAgentes: ["Dev Squad"],
    impactoSquads: ["Dev Squad"],
    bloqueante: false,
    related_module: "design_system",
  },
  {
    id: "r9",
    codigo: "RUC-09",
    titulo: "animate={{ backgroundColor }} nunca style condicional",
    descricao: "Em motion.* com whileHover/whileTap, valores dinâmicos baseados em estado usam animate={{ backgroundColor: isActive ? X : Y }} com initial={false}. Nunca style prop.",
    categoria: "interface",
    severidade: "critica",
    escopo: "ui",
    origem: "Lição L1 — Debug de pill de tabs",
    enforced_by: "manual",
    impactoAgentes: ["Dev Squad", "Motion & Interação"],
    impactoSquads: ["Dev Squad"],
    bloqueante: false,
    related_module: "ui_components",
  },
  {
    id: "r10",
    codigo: "RUC-10",
    titulo: "Auto-draft em localStorage para formulários",
    descricao: "Formulários de criação salvam rascunho automático no localStorage quando o usuário fecha o modal sem submeter.",
    categoria: "processo",
    severidade: "importante",
    escopo: "ui",
    origem: "PRD v4 — UX de formulários",
    enforced_by: "manual",
    impactoAgentes: ["Dev Squad"],
    impactoSquads: ["Dev Squad"],
    bloqueante: false,
    related_module: "ui_components",
  },
];

const CHANGELOG_MOCK: ChangelogEntry[] = [
  {
    id: "c1",
    data: "2026-03-08T20:00:00Z",
    versao: "v2.5",
    arquivo: "memoria-client.tsx",
    resumo: "Reconstrução completa da Memória como camada operacional viva. 5 abas com mock data rico, SlidingTabs padronizado, Working estruturado, Decisões com metadata, Lições enriquecidas, Regras com severidade, Changelog legível.",
    agente: "Dev Squad",
    tipo: "feature",
    impacto: "alto",
    origem: "Diretriz de evolução da Memória — Pantcho",
  },
  {
    id: "c2",
    data: "2026-03-08T18:00:00Z",
    versao: "v2.4",
    arquivo: "conhecimento-client.tsx + [id]/conhecimento-item-client.tsx",
    resumo: "Lapidação visual da feature de Conhecimento. Cards compactos, hierarquia reorganizada, metadata discreta, filtros em painel white unificado, página interna com métricas clicáveis e preview de extrações na Visão Geral.",
    agente: "Dev Squad",
    tipo: "design",
    impacto: "medio",
    origem: "Lapidação solicitada por Pantcho",
  },
  {
    id: "c3",
    data: "2026-03-08T14:00:00Z",
    versao: "v2.3",
    arquivo: "conhecimento-client.tsx + actions.ts + [id]/page.tsx",
    resumo: "Refatoração completa da feature de Conhecimento. Visão macro com 4 KPIs, filtros por tipo e status, 8 itens mock realistas, cards ricos com métricas, página interna com 7 tabs e seções completas.",
    agente: "Dev Squad",
    tipo: "feature",
    impacto: "alto",
    origem: "Diretriz de evolução do Conhecimento — Pantcho",
  },
  {
    id: "c4",
    data: "2026-03-08T10:00:00Z",
    versao: "v2.2",
    arquivo: "projetos-client.tsx + projeto-detail-client.tsx + pedidos-client.tsx",
    resumo: "Sprint Projetos v3.1: pills rounded-full com cores por tipo, cards sem white box wrapper, título 22px, barra de progresso colorida, subprojetos por metadata, tabs com ícones, filtros Pedidos com SlidingTabs.",
    agente: "Dev Squad",
    tipo: "feature",
    impacto: "alto",
    origem: "Sprint Projetos v3 — Pantcho",
  },
  {
    id: "c5",
    data: "2026-03-07T22:00:00Z",
    versao: "v2.1",
    arquivo: "sliding-tabs.tsx",
    resumo: "SlidingTabs: tipo do icon alterado de LucideIcon para React.ElementType. Aceita qualquer componente como ícone, não apenas lucide-react.",
    agente: "Dev Squad",
    tipo: "fix",
    impacto: "baixo",
    origem: "TypeScript error em pedidos-client.tsx",
  },
  {
    id: "c6",
    data: "2026-03-07T18:00:00Z",
    versao: "v2.0",
    arquivo: "creators/* + agentes/* + config/*",
    resumo: "Creators: 5 tabs com pixel-perfect. Agentes: Dev + Audiovisual Squad, 17 skills. Config: Branding + Provedores + Equipe com CRUD completo. Motion: todas as 3 camadas de modal + HubiaPortal validado.",
    agente: "Dev Squad",
    tipo: "feature",
    impacto: "alto",
    origem: "Sprint completo — Pantcho",
  },
  {
    id: "c7",
    data: "2026-03-06T15:00:00Z",
    versao: "v1.5",
    arquivo: "pedidos/* + calendário + kanban",
    resumo: "Pedidos: Kanban DnD com @dnd-kit, Calendário mensal integrado, Lista, Modal 2 colunas. Filtros de squad com SlidingTabs. Página /pedidos/[id] completa com cadeia de produção.",
    agente: "Dev Squad",
    tipo: "feature",
    impacto: "alto",
    origem: "Sprint Pedidos — Pantcho",
  },
  {
    id: "c8",
    data: "2026-03-05T10:00:00Z",
    versao: "v1.0",
    arquivo: "layout + sidebar + globals.css + tailwind.config",
    resumo: "Scaffold inicial: Next.js 15 + Supabase Auth + Sidebar com pill spring + AppShell + Design Tokens completos. Urbanist configurado. Fundo #EEEFE9. Animações de ícone em globals.css.",
    agente: "Orquestrador",
    tipo: "feature",
    impacto: "alto",
    origem: "Kickoff da plataforma — Pantcho",
  },
];

// ─── Helpers de estilo ────────────────────────────────────────────────────────

const SCOPE_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  global:       { label: "Global",       bg: "#0E0F1015", text: "#0E0F10" },
  organization: { label: "Organização",  bg: "#E3EEFF",   text: "#0D47A1" },
  squad:        { label: "Squad",        bg: "#E8F5E9",   text: "#2E7D32" },
  component:    { label: "Componente",   bg: "#EDE7F6",   text: "#512DA8" },
  // legado
  projeto:      { label: "Projeto",      bg: "#E8EAF6",   text: "#283593" },
  creator:      { label: "Creator",      bg: "#FCE4EC",   text: "#AD1457" },
  sistema:      { label: "Sistema",      bg: "#FFF8E1",   text: "#F57F17" },
};

const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  system:      { label: "System",      bg: "#FFEBEE", text: "#C62828" },
  engineering: { label: "Engineering", bg: "#E8EAF6", text: "#283593" },
  product:     { label: "Product",     bg: "#E8F5E9", text: "#2E7D32" },
  tenant:      { label: "Tenant",      bg: "#FFF8E1", text: "#F57F17" },
};

const IMPACT_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  critical: { label: "Crítico",  bg: "#FFEBEE", text: "#C62828", dot: "#E53935" },
  high:     { label: "Alto",     bg: "#FFF3E0", text: "#E65100", dot: "#FB8C00" },
  medium:   { label: "Médio",    bg: "#E8F5E9", text: "#2E7D32", dot: "#43A047" },
  low:      { label: "Baixo",    bg: "#E1F4FE", text: "#0277BD", dot: "#0288D1" },
};

const ENFORCED_BY_CONFIG: Record<string, { label: string; icon: React.ElementType; bg: string; text: string }> = {
  lint:       { label: "Lint",       icon: FileCode2,    bg: "#E8EAF6", text: "#283593" },
  runtime:    { label: "Runtime",    icon: Server,       bg: "#FCE4EC", text: "#AD1457" },
  middleware: { label: "Middleware", icon: Wrench,       bg: "#FFF3E0", text: "#E65100" },
  policy:     { label: "Policy",     icon: Shield,       bg: "#FFEBEE", text: "#C62828" },
  manual:     { label: "Manual",     icon: ListChecks,   bg: "#EEEFE9", text: "#5E5E5F" },
};

const CATEGORIA_LICAO: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  design:    { label: "Design",    bg: "#FCE4EC", text: "#AD1457", icon: Tag },
  dev:       { label: "Dev",       bg: "#E1F4FE", text: "#0277BD", icon: GitBranch },
  ia:        { label: "IA",        bg: "#F3E5F5", text: "#6A1B9A", icon: Bot },
  processo:  { label: "Processo",  bg: "#E8F5E9", text: "#2E7D32", icon: Activity },
  operacao:  { label: "Operação",  bg: "#FFF8E1", text: "#F57F17", icon: Zap },
  motion:    { label: "Motion",    bg: "#EDE7F6", text: "#512DA8", icon: Sparkles },
};

const SEVERIDADE: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  bloqueante:   { label: "Bloqueante",  bg: "#FFEBEE", text: "#C62828", dot: "#E53935" },
  critica:      { label: "Crítica",     bg: "#FFF8E1", text: "#F57F17", dot: "#FF8F00" },
  importante:   { label: "Importante", bg: "#E8F5E9", text: "#2E7D32", dot: "#43A047" },
  recomendada:  { label: "Recomendada",bg: "#E1F4FE", text: "#0277BD", dot: "#0288D1" },
};

const CATEGORIA_REGRA_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  "segurança":      { label: "Segurança",      bg: "#FFEBEE", text: "#C62828", icon: Shield },
  "design":         { label: "Design",         bg: "#FCE4EC", text: "#AD1457", icon: Tag },
  "motion":         { label: "Motion",         bg: "#EDE7F6", text: "#512DA8", icon: Sparkles },
  "dados":          { label: "Dados",          bg: "#E1F4FE", text: "#0277BD", icon: Database },
  "arquitetura":    { label: "Arquitetura",    bg: "#E8EAF6", text: "#283593", icon: Network },
  "processo":       { label: "Processo",       bg: "#E8F5E9", text: "#2E7D32", icon: Activity },
  "infraestrutura": { label: "Infraestrutura", bg: "#FFF3E0", text: "#E65100", icon: Server },
  "interface":      { label: "Interface",      bg: "#F3E5F5", text: "#6A1B9A", icon: Monitor },
};

const CHANGELOG_TIPO: Record<string, { label: string; bg: string; text: string }> = {
  feature:  { label: "Feature",  bg: "#E8F5E9", text: "#2E7D32" },
  fix:      { label: "Fix",      bg: "#FFF8E1", text: "#F57F17" },
  refactor: { label: "Refactor", bg: "#E1F4FE", text: "#0277BD" },
  design:   { label: "Design",   bg: "#FCE4EC", text: "#AD1457" },
  breaking: { label: "Breaking", bg: "#FFEBEE", text: "#C62828" },
};

const IMPACTO_DOT: Record<string, string> = {
  alto:  "#E53935",
  medio: "#FB8C00",
  baixo: "#43A047",
};

const MODULE_LABELS: Record<string, string> = {
  architecture:   "Arquitetura",
  design_system:  "Design System",
  agents:         "Agentes",
  database:       "Banco de Dados",
  ui_components:  "UI Components",
};

// ─── Helper de agrupamento por timeline (Bloco 8) ────────────────────────────

function groupByTimeline<T extends { data: string }>(items: T[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const lastWeekStart = new Date(today); lastWeekStart.setDate(today.getDate() - 7);

  const groups: { label: string; items: T[] }[] = [
    { label: "Hoje", items: [] },
    { label: "Ontem", items: [] },
    { label: "Semana passada", items: [] },
    { label: "Mais antigo", items: [] },
  ];

  for (const item of items) {
    const d = new Date(item.data);
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (day.getTime() === today.getTime())          groups[0].items.push(item);
    else if (day.getTime() === yesterday.getTime()) groups[1].items.push(item);
    else if (d >= lastWeekStart)                    groups[2].items.push(item);
    else                                            groups[3].items.push(item);
  }
  return groups.filter((g) => g.items.length > 0);
}

// ─── Componente principal ──────────────────────────────────────────────────────

export default function MemoriaClient({
  organizationId,
  entityVersions,
}: {
  organizationId: string;
  entityVersions: EntityVersion[];
}) {
  const [activeTab, setActiveTab] = useState("working");

  const decisoesCriticas = DECISOES_MOCK.filter((d) => d.scope === "global").length;
  const regrasBloqueantes = REGRAS_MOCK.filter((r) => r.bloqueante).length;
  const tarefasConcluidas = WORKING_MOCK.tarefas.filter((t) => t.feito).length;
  const totalTarefas = WORKING_MOCK.tarefas.length;
  const trainingSignals = [...DECISOES_MOCK, ...LICOES_MOCK].filter((x) => x.training_signal).length;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#0E0F10]">Memória</h1>
          <p className="text-[13px] text-[#A9AAA5] mt-0.5">Camada viva de contexto, decisões, regras e rastreabilidade operacional</p>
        </div>
        <motion.button
          className="flex items-center gap-2 rounded-[18px] bg-[#EEEFE9] px-4 py-3 text-[13px] font-semibold text-[#5E5E5F]"
          whileHover={{ scale: 1.03, backgroundColor: "#D9D9D4" }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <motion.span whileHover={{ rotate: 360 }} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}>
            <RefreshCw size={13} />
          </motion.span>
          Atualizar memória
        </motion.button>
      </div>

      {/* Indicadores rápidos */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Progresso atual",    valor: `${tarefasConcluidas}/${totalTarefas}`, sublabel: "tarefas concluídas",    icon: CheckSquare, cor: "#2E7D32", bg: "#E8F5E9" },
          { label: "Decisões globais",   valor: decisoesCriticas.toString(),             sublabel: "de escopo global",       icon: Brain,       cor: "#6A1B9A", bg: "#F3E5F5" },
          { label: "Regras bloqueantes", valor: regrasBloqueantes.toString(),            sublabel: "obrigatórias",           icon: ShieldAlert, cor: "#C62828", bg: "#FFEBEE" },
          { label: "Training signals",   valor: trainingSignals.toString(),              sublabel: "ativos na base de IA",   icon: Sparkles,    cor: "#0277BD", bg: "#E1F4FE" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            className="rounded-[20px] p-4 flex flex-col gap-2.5"
            style={{ backgroundColor: card.bg }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: i * 0.06 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: card.cor, opacity: 0.6 }}>{card.label}</p>
                <p className="text-[9px] text-[#A9AAA5] mt-0.5">{card.sublabel}</p>
              </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-[7px]" style={{ backgroundColor: card.cor + "15" }}>
                <card.icon size={13} style={{ color: card.cor }} />
              </div>
            </div>
            <span className="text-[28px] font-bold leading-none" style={{ color: card.cor }}>{card.valor}</span>
          </motion.div>
        ))}
      </div>

      {/* Tabs padronizadas */}
      <SlidingTabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />

      {/* Conteúdo */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
        >
          {activeTab === "working"   && <AbaWorking />}
          {activeTab === "decisoes"  && <AbaDecisoes />}
          {activeTab === "licoes"    && <AbaLicoes />}
          {activeTab === "regras"    && <AbaRegras />}
          {activeTab === "changelog" && <AbaChangelog entityVersions={entityVersions} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Aba: Working (Bloco 5) ───────────────────────────────────────────────────

function AbaWorking() {
  const w = WORKING_MOCK;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Coluna principal */}
      <div className="lg:col-span-2 flex flex-col gap-4">

        {/* System Context — Bloco 9 */}
        <motion.div
          className="rounded-[20px] bg-white p-5 flex flex-col gap-3"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
        >
          <div className="flex items-center gap-2 mb-0.5">
            <Globe size={13} color="#A9AAA5" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#A9AAA5]">System Context</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[12px] bg-[#EEEFE9] p-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#A9AAA5] mb-1">Fase de arquitetura</p>
              <p className="text-[12px] font-semibold text-[#0E0F10]">{w.current_architecture_phase}</p>
            </div>
            <div className="rounded-[12px] bg-[#EEEFE9] p-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#A9AAA5] mb-1">Sprint ativa</p>
              <p className="text-[12px] font-semibold text-[#0E0F10]">{w.active_sprint}</p>
            </div>
          </div>
          <div className="rounded-[12px] bg-[#EEEFE9] p-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#A9AAA5] mb-1">Foco global</p>
            <p className="text-[12px] text-[#5E5E5F] leading-relaxed">{w.global_focus}</p>
          </div>
        </motion.div>

        {/* Estado atual */}
        <motion.div
          className="rounded-[20px] bg-white p-5 flex flex-col gap-4"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.04 }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#A9AAA5]">Foco atual</p>
              <h2 className="text-[18px] font-bold text-[#0E0F10] mt-1">{w.current_focus}</h2>
              <p className="text-[12px] text-[#5E5E5F] mt-0.5">{w.iniciativa}</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-[8px] bg-[#E8F5E9] px-2.5 py-1.5 text-[10px] font-bold text-[#2E7D32] uppercase tracking-wide shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2E7D32]" />
              Ativo
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wide text-[#A9AAA5]">Progresso</span>
              <span className="text-[12px] font-bold text-[#0E0F10]">{w.progresso}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#EEEFE9] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[#D7FF00]"
                initial={{ width: 0 }}
                animate={{ width: `${w.progresso}%` }}
                transition={{ duration: 0.8, ease: [0, 0, 0.2, 1], delay: 0.2 }}
              />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#A9AAA5] mb-1.5">Contexto</p>
            <p className="text-[13px] text-[#5E5E5F] leading-relaxed">{w.contexto}</p>
          </div>
        </motion.div>

        {/* Pending Decisions */}
        {w.pending_decisions.length > 0 && (
          <motion.div
            className="rounded-[20px] bg-[#FFF8E1] p-4 flex flex-col gap-3"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.07 }}
          >
            <div className="flex items-center gap-2">
              <Clock size={13} color="#F57F17" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#F57F17]">Decisões pendentes</p>
            </div>
            {w.pending_decisions.map((d, i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-[10px] bg-white/70 px-3 py-2.5">
                <p className="text-[12px] font-semibold text-[#0E0F10] leading-snug">{d.titulo}</p>
                <span className="shrink-0 rounded-[6px] bg-[#FFF8E1] border border-[#F57F17]/20 px-2 py-0.5 text-[9px] font-bold text-[#F57F17]">{d.prazo}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Checklist de tarefas */}
        <motion.div
          className="rounded-[20px] bg-white p-5 flex flex-col gap-3"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#A9AAA5]">Tarefas</p>
            <span className="text-[11px] text-[#A9AAA5]">
              {w.tarefas.filter((t) => t.feito).length}/{w.tarefas.length} concluídas
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {w.tarefas.map((tarefa, i) => (
              <motion.div
                key={tarefa.id}
                className="flex items-start gap-2.5 rounded-[10px] px-3 py-2.5"
                style={{ backgroundColor: tarefa.feito ? "#F8F8F5" : "#FFFFFF" }}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, ease: [0, 0, 0.2, 1], delay: i * 0.03 }}
              >
                {tarefa.feito ? (
                  <CheckCircle2 size={14} color="#2E7D32" className="shrink-0 mt-0.5" />
                ) : (
                  <Circle size={14} color="#D5D2C9" className="shrink-0 mt-0.5" />
                )}
                <span className={`text-[12px] leading-snug ${tarefa.feito ? "line-through text-[#A9AAA5]" : "text-[#0E0F10] font-medium"}`}>
                  {tarefa.texto}
                </span>
                {tarefa.prioridade === "alta" && !tarefa.feito && (
                  <span className="ml-auto shrink-0 rounded-[5px] bg-[#FFEBEE] px-1.5 py-0.5 text-[8px] font-bold text-[#C62828] uppercase">
                    Alta
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Sidebar lateral */}
      <div className="flex flex-col gap-3">
        {/* System Blockers */}
        {w.system_blockers.length > 0 && (
          <motion.div
            className="rounded-[20px] bg-[#FFEBEE] p-4 flex flex-col gap-2.5"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.05 }}
          >
            <div className="flex items-center gap-2">
              <AlertCircle size={13} color="#C62828" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#C62828]">System Blockers</p>
            </div>
            {w.system_blockers.map((b, i) => (
              <div key={i} className="flex flex-col gap-1">
                <p className="text-[12px] font-semibold text-[#C62828] leading-snug">{b.descricao}</p>
                <span className="text-[9px] text-[#E53935]/70 font-medium">{b.modulo}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Active Agents */}
        <motion.div
          className="rounded-[20px] bg-white p-4 flex flex-col gap-3"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.1 }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#A9AAA5]">Active Agents</p>
          <div className="flex flex-col gap-1.5">
            {w.active_agents.map((ag) => (
              <div key={ag.nome} className="flex items-start gap-2 rounded-[10px] bg-[#EEEFE9] px-3 py-2.5">
                <Bot size={11} color="#5E5E5F" className="mt-0.5 shrink-0" />
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[11px] font-semibold text-[#0E0F10] leading-tight">{ag.nome}</span>
                  <span className="text-[9px] text-[#A9AAA5] leading-tight truncate">{ag.papel}</span>
                </div>
                <span
                  className="ml-auto shrink-0 rounded-[5px] px-1.5 py-0.5 text-[8px] font-bold uppercase"
                  style={{
                    backgroundColor: ag.status === "ativo" ? "#E8F5E9" : "#EEEFE9",
                    color: ag.status === "ativo" ? "#2E7D32" : "#A9AAA5",
                  }}
                >
                  {ag.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Última atualização */}
        <motion.div
          className="rounded-[20px] bg-white p-4 flex flex-col gap-2"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.14 }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#A9AAA5]">Última atualização</p>
          <div className="flex items-center gap-1.5">
            <Clock size={12} color="#A9AAA5" />
            <span className="text-[12px] text-[#0E0F10] font-semibold">
              {new Date(w.ultimaAtualizacao).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Aba: Decisões (Blocos 1–4 + 8 + 10 + 11) ────────────────────────────────

function AbaDecisoes() {
  const groups = groupByTimeline(DECISOES_MOCK);
  let globalIdx = 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2 rounded-[16px] bg-[#F3E5F5]/50 px-4 py-3">
        <Brain size={15} color="#6A1B9A" />
        <div>
          <p className="text-[13px] font-bold text-[#6A1B9A]">{DECISOES_MOCK.length} decisões registradas</p>
          <p className="text-[10px] text-[#AB47BC]">Com scope, type e impact — rastreabilidade completa por registro</p>
        </div>
      </div>

      {/* Legenda de scope */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[9px] font-bold uppercase tracking-widest text-[#A9AAA5] mr-1">Scope:</span>
        {Object.entries(SCOPE_CONFIG).slice(0, 4).map(([key, conf]) => (
          <span key={key} className="rounded-[5px] px-2 py-0.5 text-[9px] font-bold" style={{ backgroundColor: conf.bg, color: conf.text }}>
            {conf.label}
          </span>
        ))}
      </div>

      {/* Grupos por timeline */}
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#A9AAA5]">{group.label}</span>
            <div className="flex-1 h-px bg-[#EEEFE9]" />
          </div>
          {group.items.map((d) => {
            const i = globalIdx++;
            const scopeConf = SCOPE_CONFIG[d.scope] ?? SCOPE_CONFIG.sistema;
            const typeConf  = TYPE_CONFIG[d.type] ?? TYPE_CONFIG.system;
            const impactConf = IMPACT_CONFIG[d.impact] ?? IMPACT_CONFIG.medium;
            return (
              <motion.div
                key={d.id}
                className="rounded-[20px] bg-white p-5 flex flex-col gap-3"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0, 0, 0.2, 1], delay: Math.min(i * 0.06, 0.3) }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Linha 1: scope + type + impact + data */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="rounded-[6px] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide" style={{ backgroundColor: scopeConf.bg, color: scopeConf.text }}>
                      {scopeConf.label}
                    </span>
                    <span className="rounded-[6px] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide" style={{ backgroundColor: typeConf.bg, color: typeConf.text }}>
                      {typeConf.label}
                    </span>
                    <span className="flex items-center gap-1 rounded-[6px] px-2 py-0.5 text-[9px] font-bold" style={{ backgroundColor: impactConf.bg, color: impactConf.text }}>
                      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: impactConf.dot }} />
                      {impactConf.label}
                    </span>
                    {/* Bloco 11 — training_signal */}
                    {d.training_signal && (
                      <span className="flex items-center gap-0.5 rounded-[6px] bg-[#E3EEFF] px-1.5 py-0.5 text-[9px] font-bold text-[#0D47A1]">
                        <Sparkles size={7} /> Training signal
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {d.tags.map((tag) => (
                      <span key={tag} className="text-[9px] text-[#D5D2C9] font-medium">#{tag}</span>
                    ))}
                    <span className="text-[10px] text-[#A9AAA5]">
                      {new Date(d.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>

                {/* Título */}
                <h3 className="text-[15px] font-bold text-[#0E0F10] leading-snug">{d.titulo}</h3>

                {/* Resumo */}
                <p className="text-[12px] text-[#5E5E5F] leading-relaxed">{d.resumo}</p>

                {/* Motivo + Impacto texto */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#D5D2C9] mb-1">Motivo</p>
                    <p className="text-[11px] text-[#5E5E5F] leading-snug">{d.motivo}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#D5D2C9] mb-1">Impacto</p>
                    <p className="text-[11px] text-[#5E5E5F] leading-snug">{d.impactoTexto}</p>
                  </div>
                </div>

                {/* Rodapé — rastreabilidade (Bloco 4 + 10) */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F3F3F0]">
                  <div className="flex items-center gap-2 flex-wrap">
                    {d.entidades.slice(0, 3).map((e) => (
                      <span key={e} className="rounded-[9999px] bg-[#EEEFE9] px-2 py-0.5 text-[9px] font-semibold text-[#5E5E5F]">{e}</span>
                    ))}
                    {d.related_module && (
                      <span className="rounded-[9999px] border border-[#D5D2C9] px-2 py-0.5 text-[9px] font-semibold text-[#A9AAA5]">
                        {MODULE_LABELS[d.related_module] ?? d.related_module}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-[10px] text-[#A9AAA5]">{d.created_by} · v{d.version}</span>
                    <span className="text-[9px] text-[#D5D2C9] truncate max-w-[160px]">{d.origin}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Aba: Lições (Blocos 1–4 + 8 + 10 + 11) ──────────────────────────────────

function AbaLicoes() {
  const groups = groupByTimeline(LICOES_MOCK);
  let globalIdx = 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2 rounded-[16px] bg-[#FFF3E0]/50 px-4 py-3">
        <Lightbulb size={15} color="#E65100" />
        <div>
          <p className="text-[13px] font-bold text-[#E65100]">{LICOES_MOCK.length} lições consolidadas</p>
          <p className="text-[10px] text-[#FF8A00]">Com scope, type, impact e rastreabilidade — base de aprendizado da plataforma</p>
        </div>
      </div>

      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#A9AAA5]">{group.label}</span>
            <div className="flex-1 h-px bg-[#EEEFE9]" />
          </div>
          {group.items.map((l) => {
            const i = globalIdx++;
            const catConf   = CATEGORIA_LICAO[l.categoria] ?? CATEGORIA_LICAO.processo;
            const CatIcon   = catConf.icon;
            const scopeConf = SCOPE_CONFIG[l.scope] ?? SCOPE_CONFIG.global;
            const typeConf  = TYPE_CONFIG[l.type]  ?? TYPE_CONFIG.engineering;
            const impactConf = IMPACT_CONFIG[l.impact] ?? IMPACT_CONFIG.medium;
            return (
              <motion.div
                key={l.id}
                className="rounded-[20px] bg-white p-5 flex flex-col gap-3"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0, 0, 0.2, 1], delay: Math.min(i * 0.06, 0.3) }}
              >
                {/* Linha 1: categoria + scope + type + impact + badges */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="flex items-center gap-1 rounded-[6px] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide" style={{ backgroundColor: catConf.bg, color: catConf.text }}>
                      <CatIcon size={8} />
                      {catConf.label}
                    </span>
                    <span className="rounded-[6px] px-2 py-0.5 text-[9px] font-bold uppercase" style={{ backgroundColor: scopeConf.bg, color: scopeConf.text }}>
                      {scopeConf.label}
                    </span>
                    <span className="rounded-[6px] px-2 py-0.5 text-[9px] font-bold uppercase" style={{ backgroundColor: typeConf.bg, color: typeConf.text }}>
                      {typeConf.label}
                    </span>
                    <span className="flex items-center gap-1 rounded-[6px] px-2 py-0.5 text-[9px] font-bold" style={{ backgroundColor: impactConf.bg, color: impactConf.text }}>
                      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: impactConf.dot }} />
                      {impactConf.label}
                    </span>
                    {l.virouRegra && (
                      <span className="flex items-center gap-0.5 rounded-[6px] bg-[#D7FF00]/30 px-1.5 py-0.5 text-[9px] font-bold text-[#6B7C00]">
                        <ClipboardList size={8} /> Virou regra
                      </span>
                    )}
                    {l.recorrente && (
                      <span className="rounded-[6px] bg-[#FFEBEE] px-1.5 py-0.5 text-[9px] font-bold text-[#C62828]">
                        Recorrente
                      </span>
                    )}
                    {/* Bloco 11 */}
                    {l.training_signal && (
                      <span className="flex items-center gap-0.5 rounded-[6px] bg-[#E3EEFF] px-1.5 py-0.5 text-[9px] font-bold text-[#0D47A1]">
                        <Sparkles size={7} /> Training signal
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#A9AAA5] shrink-0">
                    {new Date(l.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </span>
                </div>

                {/* Título */}
                <h3 className="text-[14px] font-bold text-[#0E0F10] leading-snug">{l.titulo}</h3>

                {/* 3 blocos */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="rounded-[12px] bg-[#FFEBEE]/50 p-3">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-[#C62828] mb-1">Problema</p>
                    <p className="text-[11px] text-[#5E5E5F] leading-relaxed">{l.problema}</p>
                  </div>
                  <div className="rounded-[12px] bg-[#E8F5E9]/50 p-3">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-[#2E7D32] mb-1">Aprendizado</p>
                    <p className="text-[11px] text-[#5E5E5F] leading-relaxed">{l.aprendizado}</p>
                  </div>
                  <div className="rounded-[12px] bg-[#E1F4FE]/50 p-3">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-[#0277BD] mb-1">Recomendação</p>
                    <p className="text-[11px] text-[#5E5E5F] leading-relaxed">{l.recomendacao}</p>
                  </div>
                </div>

                {/* Rodapé — rastreabilidade (Bloco 4 + 10) */}
                <div className="flex items-center justify-between pt-1.5 border-t border-[#F3F3F0]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-[#5E5E5F] font-semibold">{l.area}</span>
                    {l.related_module && (
                      <span className="rounded-[9999px] border border-[#D5D2C9] px-2 py-0.5 text-[9px] font-semibold text-[#A9AAA5]">
                        {MODULE_LABELS[l.related_module] ?? l.related_module}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-[10px] text-[#A9AAA5]">{l.created_by} · v{l.version}</span>
                    <span className="text-[9px] text-[#D5D2C9] truncate max-w-[180px]">{l.origin}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Aba: Regras (Blocos 6 + 7) ───────────────────────────────────────────────

function AbaRegras() {
  const bloqueantes = REGRAS_MOCK.filter((r) => r.bloqueante);
  const naoBlockeantes = REGRAS_MOCK.filter((r) => !r.bloqueante);

  // Bloco 7 — agrupar por categoria
  const categorias = Array.from(new Set(naoBlockeantes.map((r) => r.categoria)));

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2 rounded-[16px] bg-[#FFEBEE]/60 px-4 py-3">
        <ShieldAlert size={15} color="#C62828" />
        <div>
          <p className="text-[13px] font-bold text-[#C62828]">{bloqueantes.length} regras bloqueantes · {REGRAS_MOCK.length} total</p>
          <p className="text-[10px] text-[#E53935]">Com enforcement mode e agrupamento por categoria</p>
        </div>
      </div>

      {/* Legenda de enforced_by */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[9px] font-bold uppercase tracking-widest text-[#A9AAA5] mr-1">Enforcement:</span>
        {Object.entries(ENFORCED_BY_CONFIG).map(([key, conf]) => {
          const Icon = conf.icon;
          return (
            <span key={key} className="flex items-center gap-1 rounded-[6px] px-2 py-1 text-[9px] font-bold" style={{ backgroundColor: conf.bg, color: conf.text }}>
              <Icon size={9} /> {conf.label}
            </span>
          );
        })}
      </div>

      {/* Bloqueantes */}
      {bloqueantes.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#C62828] px-1">Bloqueantes</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {bloqueantes.map((r, i) => <RegraCard key={r.id} regra={r} index={i} />)}
          </div>
        </div>
      )}

      {/* Demais — agrupadas por categoria (Bloco 7) */}
      {categorias.map((cat) => {
        const regrasCategoria = naoBlockeantes.filter((r) => r.categoria === cat);
        const catConf = CATEGORIA_REGRA_CONFIG[cat] ?? CATEGORIA_REGRA_CONFIG.processo;
        const CatIcon = catConf.icon;
        return (
          <div key={cat} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span
                className="flex items-center gap-1.5 rounded-[8px] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide"
                style={{ backgroundColor: catConf.bg, color: catConf.text }}
              >
                <CatIcon size={10} />
                {catConf.label}
              </span>
              <div className="flex-1 h-px bg-[#EEEFE9]" />
              <span className="text-[9px] text-[#A9AAA5]">{regrasCategoria.length} regra{regrasCategoria.length > 1 ? "s" : ""}</span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {regrasCategoria.map((r, i) => <RegraCard key={r.id} regra={r} index={i + bloqueantes.length} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RegraCard({ regra: r, index: i }: { regra: Regra; index: number }) {
  const sevConf    = SEVERIDADE[r.severidade] ?? SEVERIDADE.importante;
  const catConf    = CATEGORIA_REGRA_CONFIG[r.categoria] ?? CATEGORIA_REGRA_CONFIG.processo;
  const enfConf    = ENFORCED_BY_CONFIG[r.enforced_by] ?? ENFORCED_BY_CONFIG.manual;
  const EnfIcon    = enfConf.icon;
  return (
    <motion.div
      className="rounded-[18px] bg-white p-4 flex flex-col gap-2.5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0, 0, 0.2, 1], delay: Math.min(i * 0.04, 0.2) }}
    >
      {/* Linha topo */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="rounded-[5px] bg-[#D7FF00] px-1.5 py-0.5 text-[9px] font-bold text-[#0E0F10] shrink-0">
            {r.codigo}
          </span>
          <span className="rounded-[5px] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide" style={{ backgroundColor: catConf.bg, color: catConf.text }}>
            {catConf.label}
          </span>
        </div>
        <span className="flex items-center gap-1 text-[9px] font-semibold" style={{ color: sevConf.text }}>
          <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: sevConf.dot }} />
          {sevConf.label}
        </span>
      </div>

      {/* Título */}
      <p className="text-[13px] font-bold text-[#0E0F10] leading-snug">{r.titulo}</p>

      {/* Descrição */}
      <p className="text-[11px] text-[#5E5E5F] leading-relaxed">{r.descricao}</p>

      {/* Rodapé — enforced_by + agentes */}
      <div className="flex items-center justify-between pt-1.5 border-t border-[#F3F3F0]">
        {/* Bloco 6 — enforced_by */}
        <span className="flex items-center gap-1 rounded-[6px] px-2 py-1 text-[9px] font-bold" style={{ backgroundColor: enfConf.bg, color: enfConf.text }}>
          <EnfIcon size={9} />
          {enfConf.label}
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {r.impactoAgentes.slice(0, 2).map((ag) => (
            <span key={ag} className="flex items-center gap-1 text-[9px] text-[#A9AAA5]">
              <Bot size={8} /> {ag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Aba: Changelog ───────────────────────────────────────────────────────────

function AbaChangelog({ entityVersions }: { entityVersions: EntityVersion[] }) {
  const hasRealData = entityVersions.length > 0;
  const entries = hasRealData
    ? entityVersions.slice(0, 20).map((v, i) => ({
        id: v.id,
        data: v.createdAt,
        versao: `v${v.version}`,
        arquivo: v.entityType,
        resumo: `${v.entityType} atualizado`,
        agente: v.changedBy ?? "Sistema",
        tipo: "feature" as const,
        impacto: "medio" as const,
        origem: "Sistema",
      }))
    : CHANGELOG_MOCK;

  // Bloco 8 — agrupar por timeline
  const groups = groupByTimeline(entries);
  let globalIdx = 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2 rounded-[16px] bg-[#E8EAF6]/50 px-4 py-3">
        <GitBranch size={15} color="#283593" />
        <div>
          <p className="text-[13px] font-bold text-[#283593]">{entries.length} entradas no histórico</p>
          <p className="text-[10px] text-[#5C6BC0]">Rastreabilidade completa agrupada por período</p>
        </div>
      </div>

      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-2">
          {/* Separador de período */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#A9AAA5]">{group.label}</span>
            <div className="flex-1 h-px bg-[#EEEFE9]" />
          </div>

          {group.items.map((entry) => {
            const i = globalIdx++;
            const tipoConf = CHANGELOG_TIPO[entry.tipo] ?? CHANGELOG_TIPO.feature;
            const impactoDot = IMPACTO_DOT[entry.impacto] ?? IMPACTO_DOT.medio;
            return (
              <motion.div
                key={entry.id}
                className="rounded-[18px] bg-white p-4 flex flex-col gap-2.5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: [0, 0, 0.2, 1], delay: Math.min(i * 0.04, 0.25) }}
              >
                {/* Linha topo */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#0E0F10]">{entry.versao}</span>
                    <span className="rounded-[5px] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide" style={{ backgroundColor: tipoConf.bg, color: tipoConf.text }}>
                      {tipoConf.label}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] text-[#A9AAA5]">
                      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: impactoDot }} />
                      Impacto {entry.impacto}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#A9AAA5] shrink-0 font-mono">
                    {new Date(entry.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>

                {/* Arquivo */}
                <div className="flex items-center gap-1.5">
                  <GitBranch size={11} color="#A9AAA5" />
                  <code className="text-[10px] text-[#5E5E5F] font-mono bg-[#EEEFE9] px-1.5 py-0.5 rounded-[4px]">
                    {entry.arquivo}
                  </code>
                </div>

                {/* Resumo */}
                <p className="text-[12px] text-[#0E0F10] leading-relaxed font-medium">{entry.resumo}</p>

                {/* Rodapé */}
                <div className="flex items-center justify-between pt-1.5 border-t border-[#F3F3F0]">
                  <span className="text-[10px] text-[#A9AAA5]">
                    <span className="font-semibold text-[#5E5E5F]">{entry.agente}</span>
                  </span>
                  <span className="text-[10px] text-[#A9AAA5]">Origem: {entry.origem}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
