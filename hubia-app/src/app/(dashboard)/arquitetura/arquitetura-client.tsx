"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Network, Bot, Zap, Code, Mic, ArrowRight, ShieldAlert, GitBranch, Brain,
  Database, Globe, Cpu, Link2, Settings, BarChart2, Webhook, CheckCircle2,
  Clock, BookOpen, Lock, Key, Activity, Server, Cloud, Layers, Building2,
  ChevronRight, RefreshCw, AlertCircle, Timer, TrendingUp, Sparkles,
  ListChecks, Lightbulb, Wrench, ClipboardList, Users, FolderKanban,
  TerminalSquare, ShieldCheck, GitMerge, MessageSquare, CreditCard,
  HeartPulse, Gauge, FlaskConical, Landmark, Circle, CheckCheck, X, Minus,
} from "lucide-react";
import { SlidingTabs } from "@/components/ui/sliding-tabs";
import { HubiaPortal } from "@/components/ui/hubia-portal";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type AgentItem = { id: string; name: string; slug: string; status: string };
type SquadItem = {
  id: string; name: string; slug: string; description: string | null;
  status: string; color: string | null; icon: string | null;
  agentsCount: number; agents: AgentItem[];
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "status",     label: "Status",        icon: HeartPulse },
  { id: "fluxo",      label: "Fluxo",         icon: GitBranch },
  { id: "squads",     label: "Squads",        icon: Network },
  { id: "memoria",    label: "Memória",       icon: Brain },
  { id: "regras",     label: "Regras",        icon: ClipboardList },
  { id: "integracoes",label: "Integrações",   icon: Link2 },
  { id: "saas",       label: "Multi-Tenant",  icon: Building2 },
  { id: "principios", label: "Princípios",    icon: Landmark },
];

// ─── Dados estáticos ──────────────────────────────────────────────────────────

const ORQUESTRADOR_COMPONENTES = [
  { id: "classify",  label: "Classify",       desc: "Analisa e classifica o tipo de pedido recebido",         icon: Sparkles,      tempo: "~120ms",  execucoes: 847,  falhas: 3   },
  { id: "context",   label: "Context Loader", desc: "Carrega memória e contexto relevante da organização",    icon: Brain,         tempo: "~85ms",   execucoes: 847,  falhas: 0   },
  { id: "routing",   label: "Squad Routing",  desc: "Identifica e delega para o squad especializado correto", icon: Network,       tempo: "~40ms",   execucoes: 844,  falhas: 2   },
  { id: "monitor",   label: "Exec Monitor",   desc: "Acompanha progresso e valida qualidade da execução",     icon: Activity,      tempo: "contínuo", execucoes: 844, falhas: 12  },
  { id: "memory",    label: "Memory Update",  desc: "Atualiza memória do sistema após cada execução",         icon: BookOpen,      tempo: "~200ms",  execucoes: 831,  falhas: 5   },
];

const SQUAD_ICONS: Record<string, React.ElementType> = {
  code: Code, "mic-vocal": Mic, default: Bot,
};

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  ativo:      { bg: "#E8F5E9", text: "#2E7D32", dot: "#43A047",  label: "Ativo"      },
  em_breve:   { bg: "#FFF8E1", text: "#F57F17", dot: "#FF8F00",  label: "Em breve"   },
  planejado:  { bg: "#EEEFE9", text: "#A9AAA5", dot: "#D5D2C9",  label: "Planejado"  },
  ocioso:     { bg: "#E8EAF6", text: "#3949AB", dot: "#5C6BC0",  label: "Ocioso"     },
};

const SQUADS_PREVISTOS = [
  { name: "Marketing Squad",  desc: "Copywriting e estratégia de conteúdo",  icon: Mic,      status: "planejado", cor: "#E91E8C" },
  { name: "Finance Squad",    desc: "Relatórios e controle financeiro",       icon: BarChart2,status: "planejado", cor: "#00897B" },
  { name: "CRM Squad",        desc: "Relacionamento e atendimento ao cliente",icon: Users,    status: "planejado", cor: "#0288D1" },
];

const MEMORIA_ARQUIVOS = [
  { arquivo: "WORKING.md",  descricao: "Estado atual — foco ativo, tarefas e próximos passos", icon: Zap,      cor: "#D7FF00", corText: "#0E0F10", agente: "Dev Squad",     atualizado: "Hoje, 20:00" },
  { arquivo: "MEMORY.md",   descricao: "Decisões estruturais e preferências consolidadas",     icon: Brain,    cor: "#F3E5F5", corText: "#6A1B9A", agente: "Orquestrador",  atualizado: "Hoje, 19:30" },
  { arquivo: "LESSONS.md",  descricao: "Lições aprendidas — erros, descobertas e sugestões",  icon: BookOpen, cor: "#FFF3E0", corText: "#E65100", agente: "QA / Review",   atualizado: "Ontem, 18:00" },
];

const REGRAS_COMPLETAS = [
  {
    codigo: "RUC-01", titulo: "organization_id obrigatório",
    desc: "Toda query ao banco inclui organization_id.",
    motivo: "Isolamento multi-tenant — sem essa regra, um tenant pode acessar dados de outro.",
    impacto: "Crítico — comprometimento total do isolamento de dados",
    enforcement: "ESLint customizado + revisão de PR obrigatória + testes de isolamento",
    categoria: "segurança", bloqueante: true,
  },
  {
    codigo: "RUC-02", titulo: "API keys criptografadas",
    desc: "Nenhuma chave em plaintext no banco, logs ou UI.",
    motivo: "Exposição de API keys é o vetor de ataque mais crítico em plataformas SaaS.",
    impacto: "Crítico — vazamento de credenciais de terceiros",
    enforcement: "Criptografia AES-256 antes de persistir + auditoria em PR",
    categoria: "segurança", bloqueante: true,
  },
  {
    codigo: "RUC-03", titulo: "RLS em todas as tabelas",
    desc: "Row Level Security ativo no Supabase para todas as tabelas de negócio.",
    motivo: "Segunda camada de proteção — mesmo que uma query esqueça o organization_id, o banco bloqueia.",
    impacto: "Crítico — última linha de defesa de isolamento",
    enforcement: "Migration obrigatória com RLS + teste automatizado na CI",
    categoria: "segurança", bloqueante: true,
  },
  {
    codigo: "RUC-04", titulo: "Gatilhos em pedido.*",
    desc: "Gatilhos disparam automaticamente em pedido.criado e pedido.status_alterado.",
    motivo: "Garante reatividade do sistema sem acoplamento direto entre módulos.",
    impacto: "Alto — automações silenciosas param de funcionar",
    enforcement: "Prisma hooks + verificação no ActivityLog",
    categoria: "dados", bloqueante: false,
  },
  {
    codigo: "RUC-05", titulo: "ActivityLog em ações críticas",
    desc: "Toda ação relevante registrada no log de atividades.",
    motivo: "Rastreabilidade completa para debug, auditoria e análise de comportamento.",
    impacto: "Médio — diagnóstico fica impossível sem logs",
    enforcement: "Wrapper logActivity() chamado em server actions",
    categoria: "dados", bloqueante: false,
  },
  {
    codigo: "RUC-06", titulo: "HubiaPortal + 3 camadas",
    desc: "Modais usam createPortal + overlay blur + container scale + botão X rotate.",
    motivo: "backdrop-filter só funciona full-screen quando renderizado no body, fora do stacking context do Framer Motion.",
    impacto: "Baixo — visual comprometido, sem risco funcional",
    enforcement: "Checklist pré-entrega + review visual obrigatório",
    categoria: "interface", bloqueante: false,
  },
  {
    codigo: "RUC-07", titulo: "Framer Motion obrigatório",
    desc: "Todo componente React animado usa Framer Motion. CSS keyframes apenas para ícones SVG.",
    motivo: "Consistência de animações e facilidade de debug — uma biblioteca, um padrão.",
    impacto: "Baixo — inconsistência visual entre telas",
    enforcement: "Regra .cursor/rules/hubia-motion-enforcement.mdc alwaysApply",
    categoria: "interface", bloqueante: false,
  },
  {
    codigo: "RUC-08", titulo: "Auto-draft em formulários",
    desc: "Formulários salvam rascunho silencioso no localStorage ao fechar.",
    motivo: "Previne perda de trabalho — especialmente em formulários longos de pedidos e projetos.",
    impacto: "Baixo — UX degradada, sem perda funcional",
    enforcement: "DRAFT_KEY padronizado + verificação em useEffect de abertura do modal",
    categoria: "interface", bloqueante: false,
  },
  {
    codigo: "RUC-09", titulo: "Urbanist exclusivo",
    desc: "Fonte exclusiva da plataforma — sem Inter, Roboto ou Arial.",
    motivo: "Identidade visual coerente — Urbanist é parte da marca Hubia.",
    impacto: "Baixo — inconsistência tipográfica",
    enforcement: "Configuração do Tailwind + regra no design system",
    categoria: "interface", bloqueante: false,
  },
  {
    codigo: "RUC-10", titulo: "Flat design — zero shadow",
    desc: "Zero box-shadow em cards, modais ou painéis.",
    motivo: "Linguagem visual própria da Hubia — separação por diferença de cor, nunca sombra.",
    impacto: "Baixo — identidade visual comprometida",
    enforcement: "ESLint regra customizada + design review",
    categoria: "interface", bloqueante: false,
  },
];

const CATEGORIAS_RUC: Record<string, { bg: string; text: string }> = {
  segurança:  { bg: "#FFEBEE", text: "#C62828" },
  dados:      { bg: "#E1F4FE", text: "#0277BD" },
  interface:  { bg: "#EDE7F6", text: "#512DA8" },
};

const INTEGRACOES = [
  { nome: "Supabase",  desc: "Banco de dados, Auth e RLS",       icon: Database, status: "conectado", cor: "#3ECF8E", papel: "infraestrutura", sincronismo: "Contínuo"   },
  { nome: "Vercel",    desc: "Deploy e CDN da plataforma",       icon: Cloud,    status: "conectado", cor: "#0E0F10", papel: "infraestrutura", sincronismo: "Por push"   },
  { nome: "Prisma",    desc: "ORM + migrations + type safety",   icon: Database, status: "conectado", cor: "#5A67D8", papel: "infraestrutura", sincronismo: "Dev-time"   },
  { nome: "Figma",     desc: "Source de verdade do design",      icon: Layers,   status: "conectado", cor: "#F24E1E", papel: "design",          sincronismo: "Manual"     },
  { nome: "GitHub",    desc: "Versionamento e CI/CD",            icon: GitBranch,status: "conectado", cor: "#24292F", papel: "infraestrutura", sincronismo: "Por commit" },
  { nome: "OpenAI",    desc: "Processamento IA — GPT-4",        icon: Cpu,      status: "pendente",  cor: "#10A37F", papel: "ia",              sincronismo: "Por chamada"},
  { nome: "Anthropic", desc: "Claude — geração e análise",       icon: Cpu,      status: "pendente",  cor: "#D4863A", papel: "ia",              sincronismo: "Por chamada"},
  { nome: "Telegram",  desc: "Bot de entrada de pedidos",        icon: Webhook,  status: "pendente",  cor: "#0088CC", papel: "comunicação",     sincronismo: "Webhook"    },
  { nome: "Stripe",    desc: "Pagamentos e assinaturas SaaS",    icon: CreditCard,status:"planejado", cor: "#635BFF", papel: "monetização",     sincronismo: "Webhook"    },
];

const INTEGRACAO_STATUS: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  conectado: { bg: "#E8F5E9", text: "#2E7D32", dot: "#43A047", label: "Conectado" },
  pendente:  { bg: "#FFF8E1", text: "#F57F17", dot: "#FF8F00", label: "Configurar" },
  planejado: { bg: "#EEEFE9", text: "#A9AAA5", dot: "#D5D2C9", label: "Planejado"  },
};

const PAPEL_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  infraestrutura: { bg: "#E8EAF6", text: "#283593", label: "Infraestrutura" },
  ia:             { bg: "#F3E5F5", text: "#6A1B9A", label: "Inteligência Artificial" },
  comunicação:    { bg: "#E1F4FE", text: "#0277BD", label: "Comunicação" },
  monetização:    { bg: "#E8F5E9", text: "#2E7D32", label: "Monetização" },
  design:         { bg: "#FFF3E0", text: "#E65100", label: "Design" },
};

const PRINCIPIOS = [
  {
    id: "multi-tenant",
    titulo: "Isolamento Multi-Tenant Obrigatório",
    icon: Lock,
    cor: "#C62828", bg: "#FFEBEE",
    desc: "Toda entidade do sistema pertence a uma organização. Nenhuma query, agente ou integração acessa dados sem organization_id. O isolamento é arquitetural — não opcional.",
    regras: ["organization_id em todas as tabelas", "RLS no Supabase", "Zero cross-tenant access"],
  },
  {
    id: "agent-first",
    titulo: "Arquitetura Orientada a Agentes",
    icon: Bot,
    cor: "#283593", bg: "#E8EAF6",
    desc: "O sistema delega tarefas especializadas a agentes com skills, memória e contexto próprios. O orquestrador não executa — ele classifica, delega e monitora.",
    regras: ["Squads como departamentos", "Skills sob demanda", "Context carregado antes da execução"],
  },
  {
    id: "memory-fed",
    titulo: "Memória Autoalimentada",
    icon: Brain,
    cor: "#6A1B9A", bg: "#F3E5F5",
    desc: "Toda execução relevante atualiza a memória compartilhada. Decisões viram lições, lições viram regras, regras alimentam agentes. O sistema aprende continuamente.",
    regras: ["WORKING, MEMORY, LESSONS sempre atualizados", "Consolidação após cada sprint", "Lições propagam para regras"],
  },
  {
    id: "delegated-exec",
    titulo: "Execução Delegada por Squads",
    icon: Network,
    cor: "#0277BD", bg: "#E1F4FE",
    desc: "Nenhum agente faz tudo. Cada squad tem escopo, ferramentas e habilidades definidas. O orquestrador carrega apenas o contexto necessário para cada execução — sem sobrecarga de contexto.",
    regras: ["40% de context window máximo", "Skills carregadas sob demanda", "Squad routing baseado em classificação"],
  },
  {
    id: "flat-design",
    titulo: "Flat Design e Consistência Visual",
    icon: Layers,
    cor: "#E65100", bg: "#FFF3E0",
    desc: "Zero sombra. Zero fonte externa. Zero improvisação. O design system da Hubia é uma linguagem — desviar é criar inconsistência que degrada a identidade do produto.",
    regras: ["Urbanist exclusivo", "Zero box-shadow", "Tokens de cor travados globalmente"],
  },
  {
    id: "traceability",
    titulo: "Rastreabilidade Total",
    icon: Activity,
    cor: "#2E7D32", bg: "#E8F5E9",
    desc: "Toda ação crítica gera log. Todo pedido tem origem, responsável e histórico. Toda mudança estrutural fica no changelog. O sistema não esquece nada relevante.",
    regras: ["ActivityLog obrigatório", "entity_versions para auditoria", "Changelog na Memória"],
  },
];

const EXECUTION_TRACES = [
  {
    id: "t1", timestamp: "Hoje, 20:14", pedido: "Landing page SaaS B2B",
    squad: "Dev Squad", agente: "Desenvolvedor Full-stack",
    integ: ["Figma", "GitHub", "Vercel"], duracao: "8min 42s", status: "concluido",
  },
  {
    id: "t2", timestamp: "Hoje, 19:58", pedido: "Roteiro de vídeo para Ninaah",
    squad: "Audiovisual Squad", agente: "Copywriter + Diretor de Cena",
    integ: ["Figma"], duracao: "3min 20s", status: "concluido",
  },
  {
    id: "t3", timestamp: "Hoje, 19:30", pedido: "Análise de brief de campanha",
    squad: "Dev Squad", agente: "QA / Review",
    integ: [], duracao: "1min 05s", status: "concluido",
  },
];

const DEVELOPER_NOTES = [
  { tipo: "decisao",   titulo: "Prisma + Supabase juntos",     nota: "Prisma gerencia schema e migrations. Supabase gerencia Auth e RLS. Prisma aponta para o connection pooler do Supabase via DATABASE_URL.",      data: "Jan 2025" },
  { tipo: "limitacao", titulo: "SlidingTabs requer useRef",     nota: "O cálculo da pill precisa de refs nos botões. Em SSR ou suspense, os refs podem ser null — sempre checar antes de calcular offsetTop.",        data: "Fev 2025" },
  { tipo: "melhoria",  titulo: "HubiaSelect precisa de portal", nota: "Em modais, o dropdown do HubiaSelect pode ficar cortado pelo overflow:hidden. Mover dropdown para portal é a solução planejada.",               data: "Mar 2025" },
  { tipo: "decisao",   titulo: "aiMetadata para campos flexíveis", nota: "Campos que ainda podem evoluir ficam no JSON aiMetadata — evita migrations frequentes. Campos consolidados migram para colunas tipadas.",   data: "Mar 2025" },
  { tipo: "limitacao", titulo: "org_id em page.tsx é manual",   nota: "getCurrentOrganizationId() deve ser usado em todas as páginas. Lookup manual via organizationMember.findFirst falha em edge cases.",           data: "Mar 2025" },
];

const NOTE_CONFIG: Record<string, { bg: string; text: string; icon: React.ElementType; label: string }> = {
  decisao:   { bg: "#E8EAF6", text: "#283593", icon: CheckCheck, label: "Decisão"   },
  limitacao: { bg: "#FFEBEE", text: "#C62828", icon: AlertCircle, label: "Limitação" },
  melhoria:  { bg: "#E8F5E9", text: "#2E7D32", icon: TrendingUp, label: "Melhoria"  },
};

// ─── Componente principal ──────────────────────────────────────────────────────

export default function ArquiteturaClient({ squads }: { squads: SquadItem[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("status");
  const [detalheNode, setDetalheNode] = useState<string | null>(null);

  const squadsAtivos   = squads.filter(s => s.status === "ativo");
  const squadsOciosos  = squads.filter(s => s.status === "ocioso");
  const totalAgentes   = squads.reduce((s, q) => s + q.agentsCount, 0);
  const integConectadas = INTEGRACOES.filter(i => i.status === "conectado").length;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#0E0F10]">Arquitetura</h1>
          <p className="text-[13px] text-[#A9AAA5] mt-0.5">Governança técnica e mapa estrutural da plataforma</p>
        </div>
        <motion.button
          className="flex items-center gap-2 rounded-[18px] bg-[#EEEFE9] px-4 py-3 text-[13px] font-semibold text-[#5E5E5F]"
          initial="rest" whileHover="hovered" whileTap={{ scale: 0.96 }} animate="rest"
          variants={{ rest: { scale: 1 }, hovered: { scale: 1.03 } }}
          transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <motion.span variants={{ rest: { rotate: 0 }, hovered: { rotate: 180 } }} transition={{ duration: 0.4 }}>
            <RefreshCw size={13} />
          </motion.span>
          Atualizar
        </motion.button>
      </div>

      {/* Indicadores macro */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Squads ativos",  valor: squadsAtivos.length,   sublabel: "em operação",       icon: Network,   cor: "#2E7D32", bg: "#E8F5E9" },
          { label: "Agentes",        valor: totalAgentes,           sublabel: "disponíveis",       icon: Bot,       cor: "#283593", bg: "#E8EAF6" },
          { label: "Regras RUC",     valor: REGRAS_COMPLETAS.length,sublabel: "enforced",          icon: ShieldCheck,cor:"#C62828", bg: "#FFEBEE" },
          { label: "Integrações",    valor: integConectadas,        sublabel: "conectadas",        icon: Link2,     cor: "#0277BD", bg: "#E1F4FE" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            className="rounded-[20px] p-4 flex flex-col gap-2.5"
            style={{ backgroundColor: card.bg }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
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

      {/* Tabs */}
      <SlidingTabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />

      {/* Conteúdo */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
        >
          {activeTab === "status"     && <BlocoStatus squads={squads} />}
          {activeTab === "fluxo"      && <BlocoFluxo onDetalhe={setDetalheNode} />}
          {activeTab === "squads"     && <BlocoSquads squads={squads} router={router} />}
          {activeTab === "memoria"    && <BlocoMemoria />}
          {activeTab === "regras"     && <BlocoRegras />}
          {activeTab === "integracoes"&& <BlocoIntegracoes />}
          {activeTab === "saas"       && <BlocoSaaS squads={squads} />}
          {activeTab === "principios" && <BlocoPrincipios />}
        </motion.div>
      </AnimatePresence>

      {/* Modal de detalhe do nó */}
      <DetalheNodeModal nodeId={detalheNode} onClose={() => setDetalheNode(null)} />
    </div>
  );
}

// ─── Bloco 0: Status da Plataforma ────────────────────────────────────────────

function BlocoStatus({ squads }: { squads: SquadItem[] }) {
  const integConectadas = INTEGRACOES.filter(i => i.status === "conectado");
  const integPendentes  = INTEGRACOES.filter(i => i.status === "pendente");

  return (
    <div className="flex flex-col gap-4">

      {/* Saúde geral */}
      <div className="rounded-[20px] p-5 flex items-center gap-4" style={{ backgroundColor: "#E8F5E9" }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#43A047]">
          <CheckCircle2 size={20} color="white" />
        </div>
        <div>
          <p className="text-[16px] font-bold text-[#1B5E20]">Sistema operacional</p>
          <p className="text-[12px] text-[#2E7D32]">Todos os serviços críticos estão funcionando normalmente · Última verificação: agora</p>
        </div>
        <motion.span
          className="ml-auto flex items-center gap-1.5 rounded-[9999px] bg-[#43A047] px-3 py-1.5 text-[11px] font-bold text-white"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          Live
        </motion.span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Orquestrador */}
          <StatusCard titulo="Core Orchestrator" subtitulo="Núcleo do sistema — classifica, delega e monitora">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Uptime",         valor: "99.8%",  icon: Gauge,     cor: "#2E7D32" },
                { label: "Pedidos hoje",   valor: "847",    icon: Activity,  cor: "#0277BD" },
                { label: "Tempo médio",    valor: "6.2min", icon: Timer,     cor: "#6A1B9A" },
                { label: "Falhas hoje",    valor: "3",      icon: AlertCircle,cor:"#C62828" },
              ].map((m) => (
                <div key={m.label} className="rounded-[12px] bg-[#EEEFE9] p-3 flex flex-col gap-1.5">
                  <m.icon size={13} style={{ color: m.cor }} />
                  <p className="text-[18px] font-bold" style={{ color: m.cor }}>{m.valor}</p>
                  <p className="text-[9px] text-[#A9AAA5] uppercase tracking-wide">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Pipeline de execução */}
            <div className="mt-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#A9AAA5] mb-2">Pipeline de execução</p>
              <div className="flex flex-col gap-1.5">
                {ORQUESTRADOR_COMPONENTES.map((comp, i) => {
                  const pct = Math.round(((comp.execucoes - comp.falhas) / comp.execucoes) * 100);
                  return (
                    <div key={comp.id} className="flex items-center gap-3">
                      <span className="w-28 text-[11px] font-semibold text-[#5E5E5F] truncate">{comp.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-[#EEEFE9] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: pct >= 99 ? "#43A047" : pct >= 95 ? "#FF8F00" : "#E53935" }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1], delay: i * 0.07 }}
                        />
                      </div>
                      <span className="w-10 text-right text-[10px] font-bold text-[#0E0F10]">{pct}%</span>
                      <span className="w-16 text-right text-[9px] text-[#A9AAA5]">{comp.tempo}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </StatusCard>

          {/* Execution Trace */}
          <StatusCard titulo="Execution Trace" subtitulo="Últimas execuções processadas pelo sistema">
            <div className="flex flex-col gap-2">
              {EXECUTION_TRACES.map((trace, i) => (
                <motion.div
                  key={trace.id}
                  className="rounded-[12px] bg-[#EEEFE9] p-3 flex flex-col gap-2"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.06 }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={12} color="#43A047" />
                      <span className="text-[12px] font-bold text-[#0E0F10] truncate">{trace.pedido}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[9px] text-[#A9AAA5]">{trace.duracao}</span>
                      <span className="text-[9px] text-[#A9AAA5]">{trace.timestamp}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-[#283593] bg-[#E8EAF6] rounded-[6px] px-2 py-0.5">
                      <Network size={9} />
                      {trace.squad}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-[#5E5E5F]">
                      <Bot size={9} />
                      {trace.agente}
                    </span>
                    {trace.integ.map(integ => (
                      <span key={integ} className="text-[9px] font-semibold bg-[#D5D2C9]/50 text-[#5E5E5F] rounded-[5px] px-1.5 py-0.5">
                        {integ}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </StatusCard>
        </div>

        {/* Lateral */}
        <div className="flex flex-col gap-3">

          {/* Squads */}
          <StatusCard titulo="Squads" subtitulo="Estado operacional">
            {squads.map((s, i) => {
              const stConf = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.planejado;
              const Icon = SQUAD_ICONS[s.icon ?? "default"] ?? Bot;
              return (
                <motion.div
                  key={s.id}
                  className="flex items-center gap-2 py-1.5 border-b border-[#F3F3F0] last:border-0"
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: stConf.dot }} />
                  <Icon size={12} color={s.color ?? "#5E5E5F"} />
                  <span className="text-[11px] font-semibold text-[#0E0F10] flex-1 truncate">{s.name}</span>
                  <span className="text-[9px]" style={{ color: stConf.text }}>{stConf.label}</span>
                </motion.div>
              );
            })}
            {squads.length === 0 && (
              <p className="text-[11px] text-[#A9AAA5]">Nenhum squad cadastrado ainda</p>
            )}
          </StatusCard>

          {/* Integrações */}
          <StatusCard titulo="Integrações" subtitulo="Status dos conectores">
            {[...integConectadas, ...integPendentes].slice(0, 6).map((integ, i) => {
              const stConf = INTEGRACAO_STATUS[integ.status];
              const Icon = integ.icon;
              return (
                <motion.div
                  key={integ.nome}
                  className="flex items-center gap-2 py-1.5 border-b border-[#F3F3F0] last:border-0"
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: stConf.dot }} />
                  <Icon size={11} style={{ color: integ.cor }} />
                  <span className="text-[11px] font-semibold text-[#0E0F10] flex-1">{integ.nome}</span>
                  <span className="text-[9px]" style={{ color: stConf.text }}>{stConf.label}</span>
                </motion.div>
              );
            })}
          </StatusCard>

          {/* Memória */}
          <StatusCard titulo="Memória" subtitulo="Última atualização">
            {MEMORIA_ARQUIVOS.map((m, i) => {
              const Icon = m.icon;
              return (
                <motion.div
                  key={m.arquivo}
                  className="flex items-center gap-2 py-1.5 border-b border-[#F3F3F0] last:border-0"
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-[4px] shrink-0" style={{ backgroundColor: m.cor }}>
                    <Icon size={9} style={{ color: m.corText }} />
                  </div>
                  <span className="text-[10px] font-semibold text-[#0E0F10] font-mono flex-1">{m.arquivo}</span>
                  <span className="text-[9px] text-[#A9AAA5]">{m.atualizado}</span>
                </motion.div>
              );
            })}
          </StatusCard>
        </div>
      </div>

      {/* Developer Notes */}
      <BlocoDevNotes />
    </div>
  );
}

function StatusCard({ titulo, subtitulo, children }: { titulo: string; subtitulo: string; children: React.ReactNode }) {
  return (
    <motion.div
      className="rounded-[20px] bg-white p-5 flex flex-col gap-3"
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
    >
      <div>
        <p className="text-[13px] font-bold text-[#0E0F10]">{titulo}</p>
        <p className="text-[10px] text-[#A9AAA5] mt-0.5">{subtitulo}</p>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Bloco 1: Fluxo do Sistema ────────────────────────────────────────────────

const FLUXO_INPUTS   = ["Interface manual", "Telegram Bot", "API REST", "Automações internas", "Webhooks externos"];
const FLUXO_OUTPUTS  = ["Pedido executado", "Conteúdo gerado", "Build de código", "Relatório", "Resposta ao usuário"];
const SQUADS_EXEMPLOS = ["Dev Squad", "Audiovisual Squad", "Marketing Squad", "Finance Squad", "CRM Squad"];

function BlocoFluxo({ onDetalhe }: { onDetalhe: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 rounded-[16px] bg-[#EEEFE9] px-4 py-3">
        <GitBranch size={14} color="#5E5E5F" />
        <p className="text-[12px] text-[#5E5E5F]">
          O sistema Hubia opera com um orquestrador central que recebe pedidos, identifica o squad correto e delega execução especializada com rastreabilidade total.
        </p>
      </div>

      {/* Diagrama principal */}
      <div className="rounded-[20px] bg-white p-6 overflow-x-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#A9AAA5] mb-5">Fluxo principal</p>
        <div className="flex items-stretch gap-0 min-w-[600px]">
          <FluxoNode delay={0} label="Input" sublabel="Fontes de entrada" cor="#EEEFE9" corText="#0E0F10" icon={Zap}>
            {FLUXO_INPUTS.map(item => (
              <span key={item} className="text-[10px] text-[#5E5E5F] font-medium flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-[#A9AAA5] shrink-0" />{item}
              </span>
            ))}
          </FluxoNode>
          <FluxoArrow delay={0.15} />
          <FluxoNode delay={0.2} label="Core Orchestrator" sublabel="Cérebro da plataforma" cor="#0E0F10" corText="#D7FF00" destaque onClick={() => onDetalhe("orquestrador")}>
            {ORQUESTRADOR_COMPONENTES.map(comp => (
              <span key={comp.id} className="text-[10px] font-semibold flex items-center gap-1" style={{ color: "rgba(215,255,0,0.7)" }}>
                <comp.icon size={8} />{comp.label}
              </span>
            ))}
          </FluxoNode>
          <FluxoArrow delay={0.35} />
          <FluxoNode delay={0.4} label="Squads" sublabel="Departamentos especializados" cor="#D7FF00" corText="#0E0F10" onClick={() => onDetalhe("squads")}>
            {SQUADS_EXEMPLOS.map(sq => (
              <span key={sq} className="text-[10px] text-[#0E0F10]/70 font-medium flex items-center gap-1">
                <Bot size={8} />{sq}
              </span>
            ))}
          </FluxoNode>
          <FluxoArrow delay={0.55} />
          <FluxoNode delay={0.6} label="Output" sublabel="Resultados produzidos" cor="#EEEFE9" corText="#0E0F10" icon={CheckCircle2}>
            {FLUXO_OUTPUTS.map(item => (
              <span key={item} className="text-[10px] text-[#5E5E5F] font-medium flex items-center gap-1">
                <CheckCircle2 size={8} color="#43A047" />{item}
              </span>
            ))}
          </FluxoNode>
        </div>
      </div>

      {/* Métricas de pipeline */}
      <div className="rounded-[20px] bg-white p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#0E0F10]">
            <Cpu size={13} color="#D7FF00" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#0E0F10]">Pipeline do Orquestrador — Métricas</p>
            <p className="text-[10px] text-[#A9AAA5]">Tempo médio, volume e taxa de sucesso por etapa</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {ORQUESTRADOR_COMPONENTES.map((comp, i) => {
            const Icon = comp.icon;
            const taxa = Math.round(((comp.execucoes - comp.falhas) / comp.execucoes) * 100);
            return (
              <motion.div
                key={comp.id}
                className="grid grid-cols-[24px_1fr_80px_60px_50px] items-center gap-3 rounded-[12px] bg-[#EEEFE9] px-4 py-3"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.06 }}
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] bg-[#0E0F10]">
                  <Icon size={11} color="#D7FF00" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#0E0F10]">{comp.label}</p>
                  <p className="text-[10px] text-[#A9AAA5]">{comp.desc}</p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-[#A9AAA5]">execuções</span>
                  <span className="text-[11px] font-bold text-[#0E0F10]">{comp.execucoes.toLocaleString("pt-BR")}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-[#A9AAA5]">tempo</span>
                  <span className="text-[11px] font-bold text-[#0E0F10]">{comp.tempo}</span>
                </div>
                <div className="flex flex-col gap-0.5 items-end">
                  <span className="text-[9px] text-[#A9AAA5]">sucesso</span>
                  <span className="text-[11px] font-bold" style={{ color: taxa >= 99 ? "#2E7D32" : taxa >= 95 ? "#E65100" : "#C62828" }}>
                    {taxa}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Bloco 2: Squads e Agentes ────────────────────────────────────────────────

function BlocoSquads({ squads, router }: { squads: SquadItem[]; router: ReturnType<typeof useRouter> }) {
  const ativos   = squads.filter(s => s.status === "ativo");
  const ociosos  = squads.filter(s => s.status === "ocioso");

  const renderGrupo = (titulo: string, cor: string, lista: SquadItem[]) => (
    lista.length > 0 && (
      <div key={titulo} className="flex flex-col gap-2">
        <p className="text-[9px] font-bold uppercase tracking-widest px-1" style={{ color: cor }}>{titulo}</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((squad, i) => {
            const Icon = SQUAD_ICONS[squad.icon ?? "default"] ?? Bot;
            const stConf = STATUS_CONFIG[squad.status] ?? STATUS_CONFIG.planejado;
            const isAtivo = squad.status === "ativo";
            return (
              <motion.div
                key={squad.id}
                className={`rounded-[20px] bg-white p-5 flex flex-col gap-3 ${isAtivo ? "cursor-pointer" : ""}`}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: Math.min(i * 0.06, 0.3) }}
                whileHover={isAtivo ? { y: -3 } : {}}
                whileTap={isAtivo ? { scale: 0.98 } : {}}
                onClick={() => isAtivo && router.push(`/agentes/squad/${squad.slug}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px]"
                    style={{ backgroundColor: squad.color ? `${squad.color}18` : "#EEEFE9" }}>
                    <Icon size={18} color={squad.color ?? "#5E5E5F"} />
                  </div>
                  <span className="flex items-center gap-1.5 rounded-[7px] px-2 py-0.5 text-[9px] font-bold uppercase"
                    style={{ backgroundColor: stConf.bg, color: stConf.text }}>
                    <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: stConf.dot }} />
                    {stConf.label}
                  </span>
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[#0E0F10]">{squad.name}</h3>
                  {squad.description && <p className="text-[11px] text-[#A9AAA5] mt-0.5 line-clamp-2">{squad.description}</p>}
                </div>
                <div className="flex items-center justify-between pt-2.5 border-t border-[#F3F3F0]">
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-[#5E5E5F]">
                    <Bot size={11} color="#A9AAA5" />
                    {squad.agentsCount} agente{squad.agentsCount !== 1 ? "s" : ""}
                  </span>
                  {isAtivo && (
                    <div className="flex items-center gap-1">
                      {squad.agents.slice(0, 3).map((agent) => (
                        <div key={agent.id}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EEEFE9] text-[9px] font-bold text-[#5E5E5F]"
                          title={agent.name}>
                          {agent.name.charAt(0)}
                        </div>
                      ))}
                      {squad.agentsCount > 3 && <span className="text-[9px] text-[#A9AAA5]">+{squad.agentsCount - 3}</span>}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    )
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Core Orchestrator */}
      <div className="rounded-[20px] p-5 flex flex-col gap-4" style={{ backgroundColor: "#0E0F10" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#D7FF00]/20">
              <Cpu size={18} color="#D7FF00" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-white">Core Orchestrator</p>
              <p className="text-[11px] text-white/50">CEO — classifica, delega e monitora</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-[8px] bg-[#D7FF00]/15 px-2.5 py-1 text-[10px] font-bold text-[#D7FF00]">
            <motion.span className="h-1.5 w-1.5 rounded-full bg-[#D7FF00]" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            Ativo
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {ORQUESTRADOR_COMPONENTES.map((comp) => {
            const Icon = comp.icon;
            return (
              <div key={comp.id} className="rounded-[10px] bg-white/5 px-3 py-2 flex flex-col gap-1">
                <Icon size={12} color="#D7FF00" />
                <p className="text-[10px] font-semibold text-white/80">{comp.label}</p>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 pt-2 border-t border-white/10">
          <span className="text-[10px] text-white/40">{squads.filter(s => s.status === "ativo").length} squads</span>
          <span className="text-[10px] text-white/20">·</span>
          <span className="text-[10px] text-white/40">{squads.reduce((s, q) => s + q.agentsCount, 0)} agentes</span>
          <span className="text-[10px] text-white/20">·</span>
          <span className="text-[10px] text-white/40">847 execuções hoje</span>
        </div>
      </div>

      {renderGrupo("Ativos", "#2E7D32", ativos)}
      {renderGrupo("Ociosos", "#3949AB", ociosos)}

      {/* Planejados */}
      <div className="flex flex-col gap-2">
        <p className="text-[9px] font-bold uppercase tracking-widest text-[#A9AAA5] px-1">Planejados</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {SQUADS_PREVISTOS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.name}
                className="rounded-[20px] bg-white p-5 flex flex-col gap-3 opacity-50"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 0.5, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.06 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px]" style={{ backgroundColor: s.cor + "18" }}>
                    <Icon size={18} style={{ color: s.cor }} />
                  </div>
                  <span className="flex items-center gap-1.5 rounded-[7px] bg-[#EEEFE9] px-2 py-0.5 text-[9px] font-bold text-[#A9AAA5]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D5D2C9]" />Planejado
                  </span>
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[#0E0F10]">{s.name}</h3>
                  <p className="text-[11px] text-[#A9AAA5] mt-0.5">{s.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Bloco 3: Memória ─────────────────────────────────────────────────────────

function BlocoMemoria() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 rounded-[16px] bg-[#F3E5F5]/50 px-4 py-3">
        <Brain size={14} color="#6A1B9A" />
        <p className="text-[12px] text-[#6A1B9A] font-medium">
          Memória compartilhada baseada em arquivos estruturados — consultada antes de agir, atualizada após execução.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {MEMORIA_ARQUIVOS.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.arquivo}
              className="rounded-[20px] bg-white p-5 flex flex-col gap-3"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0, 0, 0.2, 1], delay: i * 0.08 }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px]" style={{ backgroundColor: m.cor }}>
                <Icon size={18} style={{ color: m.corText }} />
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#0E0F10] font-mono">{m.arquivo}</p>
                <p className="text-[11px] text-[#A9AAA5] mt-1 leading-relaxed">{m.descricao}</p>
              </div>
              <div className="pt-3 border-t border-[#F3F3F0] flex flex-col gap-1.5">
                {[["Agente", m.agente], ["Atualizado", m.atualizado], ["Status", "Ativo"]].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-[9px] text-[#A9AAA5]">{k}</span>
                    <span className={`text-[10px] font-semibold ${k === "Status" ? "text-[#2E7D32]" : "text-[#0E0F10]"}`}>{v}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="rounded-[20px] bg-white p-5 flex flex-col gap-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#A9AAA5]">Ciclo de atualização</p>
        <div className="flex flex-col gap-2">
          {[
            { passo: "1", titulo: "Consulta prévia",  desc: "Agente lê WORKING.md e MEMORY.md — carrega contexto antes de qualquer ação",                    cor: "#E8EAF6", corText: "#283593" },
            { passo: "2", titulo: "Execução",         desc: "Tarefa executada com squads, pedidos, regras e histórico disponíveis",                            cor: "#D7FF00", corText: "#0E0F10" },
            { passo: "3", titulo: "Consolidação",     desc: "Lições e decisões relevantes consolidadas nos arquivos — nada é perdido",                        cor: "#E8F5E9", corText: "#2E7D32" },
            { passo: "4", titulo: "Propagação",       desc: "Memória atualizada alimenta próxima execução — sistema aprende continuamente",                   cor: "#F3E5F5", corText: "#6A1B9A" },
          ].map((etapa) => (
            <div key={etapa.passo} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                style={{ backgroundColor: etapa.cor, color: etapa.corText }}>{etapa.passo}</span>
              <div>
                <p className="text-[12px] font-bold text-[#0E0F10]">{etapa.titulo}</p>
                <p className="text-[11px] text-[#A9AAA5] leading-snug">{etapa.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Bloco 4: Regras ──────────────────────────────────────────────────────────

function BlocoRegras() {
  const [catFiltro, setCatFiltro] = useState("todas");
  const [expandido, setExpandido] = useState<string | null>(null);
  const categorias = ["todas", ...Array.from(new Set(REGRAS_COMPLETAS.map(r => r.categoria)))];
  const filtered = catFiltro === "todas" ? REGRAS_COMPLETAS : REGRAS_COMPLETAS.filter(r => r.categoria === catFiltro);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 rounded-[16px] bg-[#FFEBEE]/60 px-4 py-3">
        <ShieldAlert size={14} color="#C62828" />
        <p className="text-[12px] text-[#C62828] font-medium">
          RUCs são regras estruturais obrigatórias — cada uma existe por um motivo técnico específico e tem mecanismo de enforcement ativo.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {categorias.map((cat) => {
          const isActive = catFiltro === cat;
          const conf = CATEGORIAS_RUC[cat];
          return (
            <motion.button
              key={cat}
              onClick={() => setCatFiltro(cat)}
              className="rounded-[9999px] px-2.5 py-1 text-[11px] font-semibold capitalize"
              animate={{ backgroundColor: isActive ? (conf ? conf.bg : "#0E0F10") : "rgba(255,255,255,0.9)", color: isActive ? (conf ? conf.text : "#FFFFFF") : "#A9AAA5" }}
              initial={false}
              whileHover={!isActive ? { backgroundColor: "rgba(213,210,201,0.25)", color: "#0E0F10" } : {}}
              whileTap={{ scale: 0.95 }} transition={{ duration: 0.12 }}
            >{cat}</motion.button>
          );
        })}
      </div>

      {/* Bloqueantes */}
      {filtered.filter(r => r.bloqueante).length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#C62828] px-1">Bloqueantes</p>
          {filtered.filter(r => r.bloqueante).map((r, i) => (
            <RucCardExpandivel key={r.codigo} regra={r} index={i} expandido={expandido} setExpandido={setExpandido} />
          ))}
        </div>
      )}

      {/* Demais */}
      {filtered.filter(r => !r.bloqueante).length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#A9AAA5] px-1">
            {filtered.some(r => r.bloqueante) ? "Demais regras" : "Regras ativas"}
          </p>
          {filtered.filter(r => !r.bloqueante).map((r, i) => (
            <RucCardExpandivel key={r.codigo} regra={r} index={i + filtered.filter(r2 => r2.bloqueante).length} expandido={expandido} setExpandido={setExpandido} />
          ))}
        </div>
      )}
    </div>
  );
}

function RucCardExpandivel({ regra: r, index: i, expandido, setExpandido }: {
  regra: typeof REGRAS_COMPLETAS[number]; index: number;
  expandido: string | null; setExpandido: (id: string | null) => void;
}) {
  const isOpen = expandido === r.codigo;
  const catConf = CATEGORIAS_RUC[r.categoria] ?? CATEGORIAS_RUC.dados;
  return (
    <motion.div
      className="rounded-[16px] bg-white overflow-hidden"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0, 0, 0.2, 1], delay: Math.min(i * 0.04, 0.2) }}
    >
      <button
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
        onClick={() => setExpandido(isOpen ? null : r.codigo)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="rounded-[5px] bg-[#D7FF00] px-1.5 py-0.5 text-[9px] font-bold text-[#0E0F10] shrink-0">{r.codigo}</span>
          <span className="rounded-[5px] px-1.5 py-0.5 text-[9px] font-bold capitalize shrink-0"
            style={{ backgroundColor: catConf.bg, color: catConf.text }}>{r.categoria}</span>
          <p className="text-[12px] font-bold text-[#0E0F10] truncate">{r.titulo}</p>
          {r.bloqueante && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-[#C62828] shrink-0 ml-auto">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E53935]" />Bloqueante
            </span>
          )}
        </div>
        <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.18 }}>
          <ChevronRight size={14} color="#A9AAA5" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 flex flex-col gap-3 border-t border-[#F3F3F0] pt-3">
              <p className="text-[11px] text-[#5E5E5F]">{r.desc}</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {[
                  { label: "Motivo",       valor: r.motivo,      bg: "#FFF8E1", text: "#F57F17", icon: Lightbulb },
                  { label: "Impacto",      valor: r.impacto,     bg: "#FFEBEE", text: "#C62828", icon: AlertCircle },
                  { label: "Enforcement",  valor: r.enforcement, bg: "#E8F5E9", text: "#2E7D32", icon: Wrench },
                ].map((campo) => {
                  const Icon = campo.icon;
                  return (
                    <div key={campo.label} className="rounded-[10px] p-3 flex flex-col gap-1" style={{ backgroundColor: campo.bg }}>
                      <div className="flex items-center gap-1">
                        <Icon size={10} style={{ color: campo.text }} />
                        <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: campo.text }}>{campo.label}</span>
                      </div>
                      <p className="text-[10px] leading-relaxed" style={{ color: campo.text }}>{campo.valor}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Bloco 5: Integrações ─────────────────────────────────────────────────────

function BlocoIntegracoes() {
  const papeis = Array.from(new Set(INTEGRACOES.map(i => i.papel)));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 rounded-[16px] bg-[#E1F4FE]/60 px-4 py-3">
        <Link2 size={14} color="#0277BD" />
        <p className="text-[12px] text-[#0277BD] font-medium">
          Conectores separados por papel no ecossistema — infraestrutura, inteligência, comunicação e monetização.
        </p>
      </div>

      {papeis.map((papel) => {
        const grupo = INTEGRACOES.filter(i => i.papel === papel);
        const papelConf = PAPEL_CONFIG[papel] ?? { bg: "#EEEFE9", text: "#5E5E5F", label: papel };
        return (
          <div key={papel} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded-[7px] px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: papelConf.bg, color: papelConf.text }}>
                {papelConf.label}
              </span>
              <span className="text-[9px] text-[#A9AAA5]">{grupo.length} conector{grupo.length !== 1 ? "es" : ""}</span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {grupo.map((integ, i) => {
                const Icon = integ.icon;
                const stConf = INTEGRACAO_STATUS[integ.status];
                return (
                  <motion.div
                    key={integ.nome}
                    className="rounded-[16px] bg-white p-4 flex items-start gap-3"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: [0, 0, 0.2, 1], delay: Math.min(i * 0.05, 0.2) }}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]" style={{ backgroundColor: integ.cor + "15" }}>
                      <Icon size={16} style={{ color: integ.cor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-[13px] font-bold text-[#0E0F10] truncate">{integ.nome}</p>
                        <span className="flex items-center gap-1 text-[9px] font-semibold shrink-0" style={{ color: stConf.text }}>
                          <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: stConf.dot }} />
                          {stConf.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#A9AAA5] mt-0.5">{integ.desc}</p>
                      <span className="inline-block mt-1.5 text-[9px] text-[#A9AAA5]">Sync: {integ.sincronismo}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Bloco 6: SaaS Multi-Tenant ───────────────────────────────────────────────

function BlocoSaaS({ squads }: { squads: SquadItem[] }) {
  const entidades = [
    { nome: "organizations",        desc: "Tenant raiz — empresa ou usuário individual" },
    { nome: "organization_members", desc: "Usuários com roles e permissões por tenant" },
    { nome: "organization_branding",desc: "Logo, cores e identidade visual por tenant"  },
    { nome: "ai_providers",         desc: "API keys de IA por organização (criptografadas)" },
  ];
  const niveis = [
    { nivel: "Agência seed",       desc: "Organização principal da Pantcho Agency",        cor: "#D7FF00", corText: "#0E0F10" },
    { nivel: "Usuário individual", desc: "Pessoa física com espaço isolado",               cor: "#E8F5E9", corText: "#2E7D32" },
    { nivel: "Enterprise",         desc: "Empresa com white-label e config avançadas",    cor: "#E8EAF6", corText: "#283593" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 flex flex-col gap-4">
        <motion.div className="rounded-[20px] bg-white p-5 flex flex-col gap-4"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#A9AAA5]">Modelo de Tenant</p>
            <h2 className="text-[16px] font-bold text-[#0E0F10] mt-1">Shared Database · Shared Schema</h2>
            <p className="text-[12px] text-[#5E5E5F] mt-1 leading-relaxed">
              Múltiplas organizações no mesmo banco. Isolamento via <code className="text-[11px] bg-[#EEEFE9] px-1.5 py-0.5 rounded-[4px]">organization_id</code> em toda query.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {niveis.map((n, i) => (
              <motion.div key={n.nivel} className="flex items-start gap-3 rounded-[12px] px-4 py-3"
                style={{ backgroundColor: n.cor }}
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.07 }}>
                <Building2 size={14} style={{ color: n.corText, opacity: 0.7 }} className="mt-0.5" />
                <div>
                  <p className="text-[12px] font-bold" style={{ color: n.corText }}>{n.nivel}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: n.corText, opacity: 0.7 }}>{n.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div className="rounded-[20px] bg-white p-5 flex flex-col gap-3"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.08 }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#A9AAA5]">Entidades base</p>
          {entidades.map((e) => (
            <div key={e.nome} className="flex items-start gap-3 rounded-[10px] bg-[#EEEFE9] px-4 py-3">
              <Database size={12} color="#5E5E5F" className="mt-0.5 shrink-0" />
              <div>
                <code className="text-[11px] font-bold text-[#0E0F10]">{e.nome}</code>
                <p className="text-[10px] text-[#A9AAA5] mt-0.5">{e.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="flex flex-col gap-3">
        <motion.div className="rounded-[20px] bg-[#FFEBEE] p-4 flex flex-col gap-3"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.05 }}>
          <div className="flex items-center gap-2">
            <Lock size={13} color="#C62828" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#C62828]">Isolamento obrigatório</p>
          </div>
          {["Nenhuma query sem organization_id", "Usuários não acessam dados de outros tenants", "RLS obrigatório em todas as tabelas", "API keys nunca em plaintext"].map((r, i) => (
            <div key={i} className="flex items-start gap-2">
              <ShieldAlert size={11} color="#C62828" className="shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#C62828] leading-snug">{r}</p>
            </div>
          ))}
        </motion.div>

        <motion.div className="rounded-[20px] bg-white p-4 flex flex-col gap-3"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#A9AAA5]">Stack principal</p>
          {[["Next.js 15", "#0E0F10"], ["TypeScript", "#0277BD"], ["Supabase", "#3ECF8E"], ["Prisma 7", "#5A67D8"], ["Vercel", "#0E0F10"], ["Tailwind 4", "#0EA5E9"]].map(([nome, cor]) => (
            <div key={nome} className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#0E0F10]">{nome}</span>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cor }} />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ─── Bloco 7: Princípios + Developer Notes ────────────────────────────────────

function BlocoPrincipios() {
  return (
    <div className="flex flex-col gap-5">
      {/* Architecture Principles */}
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-[16px] font-bold text-[#0E0F10]">Architecture Principles</p>
          <p className="text-[12px] text-[#A9AAA5] mt-0.5">A constituição técnica da plataforma — princípios que não são negociáveis</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPIOS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.id}
                className="rounded-[20px] p-5 flex flex-col gap-3"
                style={{ backgroundColor: p.bg }}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: Math.min(i * 0.06, 0.3) }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px]" style={{ backgroundColor: p.cor + "20" }}>
                  <Icon size={17} style={{ color: p.cor }} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#0E0F10] leading-snug">{p.titulo}</p>
                  <p className="text-[11px] text-[#5E5E5F] mt-1 leading-relaxed">{p.desc}</p>
                </div>
                <div className="flex flex-col gap-1 pt-2 border-t border-black/5">
                  {p.regras.map((r) => (
                    <span key={r} className="flex items-center gap-1.5 text-[10px] font-medium" style={{ color: p.cor }}>
                      <span className="h-1 w-1 rounded-full shrink-0" style={{ backgroundColor: p.cor }} />
                      {r}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Developer Notes */}
      <BlocoDevNotes />
    </div>
  );
}

function BlocoDevNotes() {
  return (
    <div className="rounded-[20px] bg-white p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <TerminalSquare size={15} color="#0E0F10" />
        <div>
          <p className="text-[13px] font-bold text-[#0E0F10]">Developer Notes</p>
          <p className="text-[10px] text-[#A9AAA5]">Observações técnicas, decisões de implementação e limitações conhecidas</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {DEVELOPER_NOTES.map((note, i) => {
          const conf = NOTE_CONFIG[note.tipo];
          const Icon = conf.icon;
          return (
            <motion.div
              key={i}
              className="rounded-[12px] p-4 flex flex-col gap-1.5"
              style={{ backgroundColor: conf.bg }}
              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Icon size={11} style={{ color: conf.text }} />
                  <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: conf.text }}>{conf.label}</span>
                </div>
                <span className="text-[9px] text-[#A9AAA5]">{note.data}</span>
              </div>
              <p className="text-[12px] font-bold text-[#0E0F10]">{note.titulo}</p>
              <p className="text-[11px] leading-relaxed" style={{ color: conf.text, opacity: 0.85 }}>{note.nota}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Componentes helper do fluxo ─────────────────────────────────────────────

function FluxoNode({ label, sublabel, cor, corText, icon: Icon, destaque, delay, children, onClick }: {
  label: string; sublabel: string; cor: string; corText: string;
  icon?: React.ElementType; destaque?: boolean; delay: number;
  children?: React.ReactNode; onClick?: () => void;
}) {
  return (
    <motion.div
      className={`flex flex-col gap-3 rounded-[16px] p-5 flex-1 min-w-[150px] ${onClick ? "cursor-pointer" : ""}`}
      style={{ backgroundColor: cor }}
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0, 0, 0.2, 1], delay }}
      whileHover={onClick ? { scale: 1.03 } : { scale: 1.01 }}
      whileTap={onClick ? { scale: 0.97 } : {}}
      onClick={onClick}
    >
      {destaque && (
        <div className="flex items-center gap-1">
          <motion.span className="h-1.5 w-1.5 rounded-full bg-[#D7FF00]" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
          <span className="text-[8px] font-bold text-[#D7FF00] uppercase tracking-widest">Core</span>
        </div>
      )}
      <div>
        <p className="text-[14px] font-bold" style={{ color: corText }}>{label}</p>
        <p className="text-[10px] mt-0.5" style={{ color: corText, opacity: 0.6 }}>{sublabel}</p>
      </div>
      {children && (
        <div className="flex flex-col gap-1.5 pt-2 border-t" style={{ borderColor: corText + "15" }}>
          {children}
        </div>
      )}
      {onClick && (
        <div className="flex items-center gap-1 mt-auto pt-1">
          <span className="text-[9px] font-semibold" style={{ color: corText, opacity: 0.5 }}>Ver detalhes</span>
          <ChevronRight size={9} style={{ color: corText, opacity: 0.5 }} />
        </div>
      )}
    </motion.div>
  );
}

function FluxoArrow({ delay }: { delay: number }) {
  return (
    <motion.div className="flex items-center justify-center px-2 shrink-0"
      initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.2 }}>
      <ArrowRight size={16} color="#A9AAA5" />
    </motion.div>
  );
}

// ─── Modal de detalhe de nó ───────────────────────────────────────────────────

function DetalheNodeModal({ nodeId, onClose }: { nodeId: string | null; onClose: () => void }) {
  const conteudo: Record<string, { titulo: string; desc: string; items: string[] }> = {
    orquestrador: {
      titulo: "Core Orchestrator",
      desc: "O orquestrador é o cérebro da Hubia. Recebe qualquer pedido, analisa contexto, carrega memória e delega para o squad correto — com rastreabilidade e qualidade garantidas.",
      items: ORQUESTRADOR_COMPONENTES.map(c => `${c.label}: ${c.desc}`),
    },
    squads: {
      titulo: "Squads especializados",
      desc: "Cada squad é um departamento com agentes, skills e ferramentas próprias. O orquestrador carrega apenas o contexto necessário — sem sobrecarga de contexto.",
      items: [
        "Dev Squad: desenvolvimento de software e sistemas",
        "Audiovisual Squad: produção de conteúdo visual e prompts",
        "Marketing Squad: copywriting e estratégia (planejado)",
        "Finance Squad: relatórios e controle financeiro (planejado)",
        "CRM Squad: relacionamento com clientes (planejado)",
      ],
    },
  };
  const info = nodeId ? conteudo[nodeId] : null;

  return (
    <HubiaPortal>
      <AnimatePresence>
        {nodeId && info && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            initial={{ backgroundColor: "rgba(14,15,16,0)", backdropFilter: "blur(0px)" }}
            animate={{ backgroundColor: "rgba(14,15,16,0.70)", backdropFilter: "blur(12px)" }}
            exit={{ backgroundColor: "rgba(14,15,16,0)", backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
          >
            <motion.div
              className="w-full max-w-[480px] rounded-[20px] bg-white p-7"
              initial={{ scale: 0.88, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 10, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[18px] font-bold text-[#0E0F10]">{info.titulo}</h2>
                <motion.button
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0E0F10]"
                  onClick={onClose}
                  whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ rotate: 90, scale: 0.9 }}
                  transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <span className="text-[#D7FF00] text-[16px] leading-none font-bold">×</span>
                </motion.button>
              </div>
              <p className="text-[13px] text-[#5E5E5F] leading-relaxed mb-5">{info.desc}</p>
              <div className="flex flex-col gap-2">
                {info.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-[10px] bg-[#EEEFE9] px-3 py-2.5">
                    <CheckCircle2 size={13} color="#2E7D32" className="shrink-0 mt-0.5" />
                    <span className="text-[12px] text-[#0E0F10]">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </HubiaPortal>
  );
}
