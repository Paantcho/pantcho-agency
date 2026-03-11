"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, FolderKanban, ClipboardList, ExternalLink, TrendingUp,
  CheckSquare, FileText, Rocket, CheckCircle2, Square, Lightbulb,
  BarChart3, Code2, Globe, GitBranch, Users, Brain, ShieldCheck,
  History, Puzzle, Zap, Eye, Edit3, Save, X, Plus,
  CalendarDays, Tag, Star, AlertTriangle, Activity, Layers,
  Database, Link2, Settings, Package, ChevronDown,
  Bot, User, Clock, Hash, Flag, Lock, AlertCircle, BookOpen,
  Wrench, Target, Megaphone,
  // ícones para tabs
  LayoutGrid, AlignLeft, Boxes, ListChecks, FolderOpen, Cpu,
  StickyNote, Cog, Wifi, MapPin, Palette, Mic, Monitor,
  BarChart2, GitMerge, FlaskConical, PenTool, Globe2, Flame,
} from "lucide-react";
import { HubiaSelect } from "@/components/ui/hubia-select";
import { SlidingTabs } from "@/components/ui/sliding-tabs";
import { toast } from "@/components/ui/hubia-toast";
import { updateProjetoStatus, updateProjetoMetadata } from "../actions";
import type { ProjetoDetail } from "../actions";
import type { ProjetoStatus, ProjetoTipo } from "@prisma/client";

// ─── Tipos de dado internos ───────────────────────────────────────────────────

type Tarefa = { id: number; titulo: string; concluido: boolean; prioridade?: "baixa" | "media" | "alta" };
type MemoriaEntry = {
  id: number;
  tipo: "working" | "longterm" | "decision" | "lesson";
  texto: string;
  data?: string;
  autor?: string;
};
type Rule = {
  id: number;
  titulo: string;
  descricao?: string;
  categoria: "branding" | "linguagem" | "tecnica" | "escopo" | "seguranca" | "entrega" | "juridico" | "operacional";
  prioridade: "critica" | "alta" | "media" | "baixa";
  bloqueante: boolean;
  origem?: string;
  data?: string;
};
type LogEntry = {
  id: number;
  acao: string;
  modulo?: string;
  agente?: string;
  squad?: string;
  autor?: string;
  data?: string;
  versao?: string;
  impacto?: string;
};
type Modulo = { nome: string; status: "completo" | "andamento" | "bloqueado" | "vazio"; obrigatorio: boolean };
type Conector = { nome: string; tipo: string; url?: string; status: "ativo" | "inativo" | "pendente" };

// ─── Tipo Config completo ─────────────────────────────────────────────────────

type TipoConfig = {
  label: string;
  cor: string;
  pillBg: string;
  pillText: string;
  squad: string;
  icone: React.ElementType;
  modulosBase: Omit<Modulo, "status">[];
  conectoresBase: Omit<Conector, "status">[];
  progressoPesos: string[];
};

const TIPO_CONFIG: Record<ProjetoTipo, TipoConfig> = {
  creator: {
    label: "Creator", cor: "#7C6AF7", pillBg: "#EEEAFF", pillText: "#4B3FC7",
    squad: "Audiovisual Squad", icone: User,
    modulosBase: [
      { nome: "Identidade", obrigatorio: true },
      { nome: "Aparência", obrigatorio: true },
      { nome: "Tom de Voz", obrigatorio: true },
      { nome: "Ambientes", obrigatorio: false },
      { nome: "Rules de Linguagem", obrigatorio: true },
      { nome: "Plataformas", obrigatorio: false },
      { nome: "Conteúdo Vinculado", obrigatorio: false },
      { nome: "Operação", obrigatorio: false },
      { nome: "Assets", obrigatorio: false },
    ],
    conectoresBase: [
      { nome: "Figma", tipo: "design" },
      { nome: "Storage de Assets", tipo: "storage" },
    ],
    progressoPesos: ["identidade", "aparencia", "tom_de_voz", "ambientes", "rules", "operacao", "calendario", "conteudo"],
  },
  landing_page: {
    label: "Landing Page", cor: "#0288D1", pillBg: "#E1F4FE", pillText: "#01579B",
    squad: "Dev Squad", icone: Globe,
    modulosBase: [
      { nome: "Brief", obrigatorio: true },
      { nome: "PRD", obrigatorio: true },
      { nome: "Brand", obrigatorio: false },
      { nome: "Copy", obrigatorio: true },
      { nome: "Wireframe", obrigatorio: false },
      { nome: "Design", obrigatorio: true },
      { nome: "Dev", obrigatorio: true },
      { nome: "QA", obrigatorio: false },
      { nome: "Deploy", obrigatorio: true },
    ],
    conectoresBase: [
      { nome: "Figma", tipo: "design" },
      { nome: "GitHub", tipo: "repositorio" },
      { nome: "Vercel", tipo: "deploy" },
      { nome: "Analytics", tipo: "monitoring" },
    ],
    progressoPesos: ["contexto", "prd", "design", "dev", "deploy"],
  },
  hotsite: {
    label: "Hotsite", cor: "#0288D1", pillBg: "#E1F4FE", pillText: "#01579B",
    squad: "Dev Squad", icone: Globe,
    modulosBase: [
      { nome: "Brief", obrigatorio: true },
      { nome: "Design", obrigatorio: true },
      { nome: "Dev", obrigatorio: true },
      { nome: "Deploy", obrigatorio: true },
    ],
    conectoresBase: [{ nome: "Figma", tipo: "design" }, { nome: "Vercel", tipo: "deploy" }],
    progressoPesos: ["contexto", "design", "dev", "deploy"],
  },
  microsite: {
    label: "Microsite", cor: "#0288D1", pillBg: "#E1F4FE", pillText: "#01579B",
    squad: "Dev Squad", icone: Globe,
    modulosBase: [
      { nome: "Brief", obrigatorio: true },
      { nome: "Arquitetura", obrigatorio: true },
      { nome: "Dev", obrigatorio: true },
      { nome: "Deploy", obrigatorio: true },
    ],
    conectoresBase: [{ nome: "Figma", tipo: "design" }, { nome: "Vercel", tipo: "deploy" }],
    progressoPesos: ["contexto", "arquitetura", "dev", "deploy"],
  },
  app: {
    label: "App", cor: "#1565C0", pillBg: "#E3EEFF", pillText: "#0D47A1",
    squad: "Dev Squad", icone: Puzzle,
    modulosBase: [
      { nome: "Descoberta", obrigatorio: true },
      { nome: "PRD", obrigatorio: true },
      { nome: "Fluxos UX", obrigatorio: true },
      { nome: "Arquitetura", obrigatorio: true },
      { nome: "Design", obrigatorio: true },
      { nome: "Frontend", obrigatorio: true },
      { nome: "Backend", obrigatorio: true },
      { nome: "QA", obrigatorio: true },
      { nome: "Deploy", obrigatorio: true },
    ],
    conectoresBase: [
      { nome: "Figma", tipo: "design" },
      { nome: "GitHub", tipo: "repositorio" },
      { nome: "Supabase", tipo: "banco" },
      { nome: "Vercel", tipo: "deploy" },
    ],
    progressoPesos: ["contexto", "prd", "arquitetura", "design", "dev", "qa", "deploy"],
  },
  saas: {
    label: "SaaS", cor: "#1565C0", pillBg: "#E3EEFF", pillText: "#0D47A1",
    squad: "Dev Squad", icone: Zap,
    modulosBase: [
      { nome: "Contexto", obrigatorio: true },
      { nome: "PRD", obrigatorio: true },
      { nome: "Fluxos", obrigatorio: true },
      { nome: "Arquitetura", obrigatorio: true },
      { nome: "Design", obrigatorio: true },
      { nome: "Banco de Dados", obrigatorio: true },
      { nome: "Auth", obrigatorio: true },
      { nome: "Frontend", obrigatorio: true },
      { nome: "Backend", obrigatorio: true },
      { nome: "Integrações", obrigatorio: false },
      { nome: "Deploy", obrigatorio: true },
      { nome: "Observabilidade", obrigatorio: false },
    ],
    conectoresBase: [
      { nome: "Figma", tipo: "design" },
      { nome: "GitHub", tipo: "repositorio" },
      { nome: "Supabase", tipo: "banco" },
      { nome: "Vercel", tipo: "deploy" },
      { nome: "Stripe", tipo: "pagamento" },
      { nome: "Analytics", tipo: "monitoring" },
    ],
    progressoPesos: ["contexto", "prd", "arquitetura", "design", "banco_notas", "dev", "deploy"],
  },
  sistema: {
    label: "Sistema Web", cor: "#1565C0", pillBg: "#E3EEFF", pillText: "#0D47A1",
    squad: "Dev Squad", icone: Code2,
    modulosBase: [
      { nome: "PRD", obrigatorio: true },
      { nome: "Arquitetura", obrigatorio: true },
      { nome: "Banco", obrigatorio: true },
      { nome: "Frontend", obrigatorio: true },
      { nome: "Backend", obrigatorio: true },
      { nome: "Deploy", obrigatorio: true },
    ],
    conectoresBase: [
      { nome: "GitHub", tipo: "repositorio" },
      { nome: "Supabase", tipo: "banco" },
      { nome: "Vercel", tipo: "deploy" },
    ],
    progressoPesos: ["prd", "arquitetura", "dev", "deploy"],
  },
  ferramenta: {
    label: "Ferramenta", cor: "#37474F", pillBg: "#ECEFF1", pillText: "#263238",
    squad: "Dev Squad", icone: Wrench,
    modulosBase: [
      { nome: "Contexto", obrigatorio: true },
      { nome: "Requisitos", obrigatorio: true },
      { nome: "Desenvolvimento", obrigatorio: true },
      { nome: "Documentação", obrigatorio: true },
    ],
    conectoresBase: [{ nome: "GitHub", tipo: "repositorio" }],
    progressoPesos: ["contexto", "requisitos"],
  },
  conteudo: {
    label: "Grade de Conteúdo", cor: "#00897B", pillBg: "#E0F5F3", pillText: "#00695C",
    squad: "Audiovisual Squad", icone: CalendarDays,
    modulosBase: [
      { nome: "Estratégia", obrigatorio: true },
      { nome: "Pilares", obrigatorio: true },
      { nome: "Calendário", obrigatorio: true },
      { nome: "Roteiros", obrigatorio: false },
      { nome: "Assets", obrigatorio: false },
      { nome: "Aprovações", obrigatorio: false },
      { nome: "Publicações", obrigatorio: false },
      { nome: "Performance", obrigatorio: false },
    ],
    conectoresBase: [
      { nome: "Figma", tipo: "design" },
      { nome: "Storage", tipo: "storage" },
    ],
    progressoPesos: ["conceito", "calendario", "pecas"],
  },
  campanha: {
    label: "Campanha", cor: "#E91E8C", pillBg: "#FCE4F3", pillText: "#AD1570",
    squad: "Audiovisual Squad", icone: Megaphone,
    modulosBase: [
      { nome: "Brief", obrigatorio: true },
      { nome: "Conceito", obrigatorio: true },
      { nome: "Público", obrigatorio: true },
      { nome: "Peças", obrigatorio: true },
      { nome: "Copies", obrigatorio: true },
      { nome: "Aprovações", obrigatorio: false },
    ],
    conectoresBase: [
      { nome: "Figma", tipo: "design" },
      { nome: "Storage", tipo: "storage" },
    ],
    progressoPesos: ["conceito", "pecas"],
  },
  branding: {
    label: "Branding", cor: "#FF6D00", pillBg: "#FFF0E2", pillText: "#BF360C",
    squad: "Audiovisual Squad", icone: Tag,
    modulosBase: [
      { nome: "Diagnóstico", obrigatorio: true },
      { nome: "Estratégia", obrigatorio: true },
      { nome: "Moodboard", obrigatorio: true },
      { nome: "Marca", obrigatorio: true },
      { nome: "Sistema Visual", obrigatorio: true },
      { nome: "Aplicações", obrigatorio: false },
      { nome: "Assets", obrigatorio: false },
      { nome: "Handoff", obrigatorio: false },
    ],
    conectoresBase: [
      { nome: "Figma", tipo: "design" },
      { nome: "Storage", tipo: "storage" },
    ],
    progressoPesos: ["conceito", "exploracao", "assets"],
  },
  mockup: {
    label: "Visual / Assets", cor: "#8D6E63", pillBg: "#F3ECE9", pillText: "#5D4037",
    squad: "Audiovisual Squad", icone: Eye,
    modulosBase: [
      { nome: "Contexto", obrigatorio: true },
      { nome: "Referências", obrigatorio: false },
      { nome: "Exploração", obrigatorio: true },
      { nome: "Assets", obrigatorio: false },
    ],
    conectoresBase: [
      { nome: "Figma", tipo: "design" },
      { nome: "Storage", tipo: "storage" },
    ],
    progressoPesos: ["contexto", "exploracao", "assets"],
  },
  documentacao: {
    label: "Documentação", cor: "#546E7A", pillBg: "#EEF2F4", pillText: "#37474F",
    squad: "Dev Squad", icone: FileText,
    modulosBase: [
      { nome: "Contexto", obrigatorio: true },
      { nome: "Estrutura", obrigatorio: true },
      { nome: "Documentos", obrigatorio: true },
      { nome: "Versionamento", obrigatorio: false },
    ],
    conectoresBase: [],
    progressoPesos: ["contexto", "estrutura"],
  },
  operacao: {
    label: "Multi-Squad", cor: "#7C6AF7", pillBg: "#EEEAFF", pillText: "#4B3FC7",
    squad: "Multi-Squad", icone: Layers,
    modulosBase: [
      { nome: "Contexto", obrigatorio: true },
      { nome: "Estrutura", obrigatorio: true },
      { nome: "Tarefas", obrigatorio: true },
      { nome: "Times", obrigatorio: true },
      { nome: "Aprovações", obrigatorio: false },
      { nome: "Memória", obrigatorio: true },
      { nome: "Log", obrigatorio: true },
    ],
    conectoresBase: [],
    progressoPesos: ["contexto", "tarefas"],
  },
  outro: {
    label: "Outro", cor: "#A9AAA5", pillBg: "#EEEFE9", pillText: "#5E5E5F",
    squad: "A definir", icone: FolderKanban,
    modulosBase: [
      { nome: "Visão Geral", obrigatorio: true },
      { nome: "Tarefas", obrigatorio: false },
      { nome: "Memória", obrigatorio: false },
      { nome: "Log", obrigatorio: false },
    ],
    conectoresBase: [],
    progressoPesos: ["contexto", "tarefas"],
  },
};

// ─── Tabs por tipo ────────────────────────────────────────────────────────────

const TABS_FIXAS: { id: string; label: string; icon: React.ElementType }[] = [
  { id: "geral",        label: "Visão Geral",     icon: LayoutGrid },
  { id: "contexto",     label: "Contexto",         icon: AlignLeft },
  { id: "modulos",      label: "Módulos",          icon: Boxes },
  { id: "tarefas",      label: "Tarefas",          icon: ListChecks },
  { id: "subprojetos",  label: "Subprojetos",      icon: FolderOpen },
  { id: "itens",        label: "Itens Vinculados", icon: Link2 },
  { id: "memoria",      label: "Memória",          icon: Brain },
  { id: "rules",        label: "Rules",            icon: ShieldCheck },
  { id: "log",          label: "Log",              icon: History },
  { id: "conectores",   label: "Conectores",       icon: Wifi },
];

const TABS_DINAMICAS: Record<ProjetoTipo, { id: string; label: string; icon: React.ElementType }[]> = {
  creator: [
    { id: "identidade",   label: "Identidade",  icon: User },
    { id: "aparencia",    label: "Aparência",   icon: Palette },
    { id: "voz",          label: "Tom de Voz",  icon: Mic },
    { id: "ambientes",    label: "Ambientes",   icon: MapPin },
    { id: "plataformas",  label: "Plataformas", icon: Monitor },
    { id: "conteudo_tab", label: "Conteúdo",    icon: FileText },
    { id: "operacao_tab", label: "Operação",    icon: Settings },
    { id: "assets_tab",   label: "Assets",      icon: Package },
  ],
  landing_page: [
    { id: "prd",         label: "PRD",         icon: FileText },
    { id: "copy",        label: "Copy",        icon: PenTool },
    { id: "design",      label: "Design",      icon: Palette },
    { id: "arquitetura", label: "Arquitetura", icon: GitMerge },
    { id: "deploy",      label: "Deploy",      icon: Rocket },
    { id: "analytics",   label: "Analytics",   icon: BarChart2 },
  ],
  hotsite: [
    { id: "design", label: "Design", icon: Palette },
    { id: "deploy", label: "Deploy", icon: Rocket },
  ],
  microsite: [
    { id: "arquitetura", label: "Arquitetura", icon: GitMerge },
    { id: "design",      label: "Design",      icon: Palette },
    { id: "deploy",      label: "Deploy",      icon: Rocket },
  ],
  app: [
    { id: "prd",         label: "PRD",         icon: FileText },
    { id: "fluxos",      label: "Fluxos",      icon: GitMerge },
    { id: "arquitetura", label: "Arquitetura", icon: Cpu },
    { id: "design",      label: "Design",      icon: Palette },
    { id: "banco",       label: "Banco",       icon: Database },
    { id: "deploy",      label: "Deploy",      icon: Rocket },
  ],
  saas: [
    { id: "prd",         label: "PRD",         icon: FileText },
    { id: "fluxos",      label: "Fluxos",      icon: GitMerge },
    { id: "arquitetura", label: "Arquitetura", icon: Cpu },
    { id: "design",      label: "Design",      icon: Palette },
    { id: "banco",       label: "Banco",       icon: Database },
    { id: "integracoes", label: "Integrações", icon: Link2 },
    { id: "deploy",      label: "Deploy",      icon: Rocket },
  ],
  sistema: [
    { id: "prd",         label: "PRD",         icon: FileText },
    { id: "arquitetura", label: "Arquitetura", icon: Cpu },
    { id: "banco",       label: "Banco",       icon: Database },
    { id: "deploy",      label: "Deploy",      icon: Rocket },
  ],
  ferramenta: [
    { id: "requisitos",  label: "Requisitos",  icon: ListChecks },
    { id: "arquitetura", label: "Arquitetura", icon: Cpu },
  ],
  conteudo: [
    { id: "estrategia", label: "Estratégia", icon: Target },
    { id: "pilares",    label: "Pilares",    icon: Layers },
    { id: "calendario", label: "Calendário", icon: CalendarDays },
    { id: "roteiros",   label: "Roteiros",   icon: PenTool },
    { id: "pecas",      label: "Peças",      icon: Package },
  ],
  campanha: [
    { id: "conceito", label: "Conceito", icon: Lightbulb },
    { id: "publico",  label: "Público",  icon: Users },
    { id: "pecas",    label: "Peças",    icon: Package },
  ],
  branding: [
    { id: "diagnostico",    label: "Diagnóstico",    icon: FlaskConical },
    { id: "estrategia",     label: "Estratégia",     icon: Target },
    { id: "conceito",       label: "Moodboard",      icon: Palette },
    { id: "marca",          label: "Marca",          icon: Tag },
    { id: "sistema_visual", label: "Sistema Visual", icon: Globe2 },
    { id: "assets_tab",     label: "Assets",         icon: Package },
    { id: "handoff",        label: "Handoff",        icon: Zap },
  ],
  mockup: [
    { id: "conceito",   label: "Conceito",   icon: Lightbulb },
    { id: "exploracao", label: "Exploração", icon: Eye },
    { id: "assets_tab", label: "Assets",     icon: Package },
  ],
  documentacao: [
    { id: "estrutura",      label: "Estrutura",  icon: AlignLeft },
    { id: "documentos_tab", label: "Documentos", icon: FileText },
  ],
  operacao: [
    { id: "times",      label: "Times",      icon: Users },
    { id: "aprovacoes", label: "Aprovações", icon: ShieldCheck },
    { id: "milestones", label: "Milestones", icon: Flag },
  ],
  outro: [],
};

function getTabsParaTipo(tipo: ProjetoTipo) {
  const dinamicas = TABS_DINAMICAS[tipo] ?? [];
  return [TABS_FIXAS[0], ...dinamicas, ...TABS_FIXAS.slice(1)];
}

// ─── Paletas ──────────────────────────────────────────────────────────────────

const STATUS_PALETTE: Record<ProjetoStatus, { bg: string; text: string; dot: string; label: string }> = {
  ativo:     { bg: "#F0FF80", text: "#5A6600", dot: "#A8C800", label: "Ativo" },
  pausado:   { bg: "#FFF0E0", text: "#A05500", dot: "#FB8C00", label: "Pausado" },
  concluido: { bg: "#E6F4EA", text: "#2E7D32", dot: "#43A047", label: "Concluído" },
  cancelado: { bg: "#FDECEA", text: "#C62828", dot: "#E53935", label: "Cancelado" },
};

const PEDIDO_STATUS_PALETTE: Record<string, { bg: string; text: string; dot: string }> = {
  rascunho:     { bg: "#F0F0EE", text: "#6B6C68", dot: "#A9AAA5" },
  aguardando:   { bg: "#F0EFFF", text: "#5B52C7", dot: "#7C6AF7" },
  em_andamento: { bg: "#F0FF80", text: "#5A6600", dot: "#A8C800" },
  revisao:      { bg: "#FFF0E0", text: "#A05500", dot: "#FB8C00" },
  aprovado:     { bg: "#E6F4EA", text: "#2E7D32", dot: "#43A047" },
  entregue:     { bg: "#E8E8E8", text: "#0E0F10", dot: "#0E0F10" },
  cancelado:    { bg: "#FDECEA", text: "#C62828", dot: "#E53935" },
};

const PEDIDO_STATUS_LABELS: Record<string, string> = {
  rascunho: "Backlog", aguardando: "Aguardando", em_andamento: "Em Progresso",
  revisao: "Revisão", aprovado: "Aprovado", entregue: "Concluído", cancelado: "Cancelado",
};

const RULE_CATEGORIAS: Record<Rule["categoria"], { label: string; cor: string; bg: string }> = {
  branding:     { label: "Branding",      cor: "#FB8C00", bg: "#FFF3E0" },
  linguagem:    { label: "Linguagem",     cor: "#7C6AF7", bg: "#F0EFFF" },
  tecnica:      { label: "Técnica",       cor: "#1565C0", bg: "#E3F2FD" },
  escopo:       { label: "Escopo",        cor: "#5E5E5F", bg: "#EEEFE9" },
  seguranca:    { label: "Segurança",     cor: "#C62828", bg: "#FDECEA" },
  entrega:      { label: "Entrega",       cor: "#43A047", bg: "#E6F4EA" },
  juridico:     { label: "Jurídico",      cor: "#0E0F10", bg: "#F5F5F5" },
  operacional:  { label: "Operacional",   cor: "#A05500", bg: "#FFF0E0" },
};

const MEMORIA_TIPOS: Record<MemoriaEntry["tipo"], { label: string; cor: string; bg: string; icone: React.ElementType }> = {
  working:  { label: "Working Memory",  cor: "#1565C0", bg: "#E3F2FD", icone: Activity },
  longterm: { label: "Long-term",       cor: "#7C6AF7", bg: "#F0EFFF", icone: Brain },
  decision: { label: "Decisão",         cor: "#FB8C00", bg: "#FFF3E0", icone: Lightbulb },
  lesson:   { label: "Aprendizado",     cor: "#43A047", bg: "#E6F4EA", icone: BookOpen },
};

const CONECTOR_ICONS: Record<string, React.ElementType> = {
  design:      Globe,
  repositorio: GitBranch,
  deploy:      Rocket,
  banco:       Database,
  storage:     Package,
  monitoring:  Activity,
  pagamento:   Star,
  default:     Link2,
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProjetoDetailClient({
  projeto: initial,
  organizationId,
}: {
  projeto: ProjetoDetail;
  organizationId: string;
}) {
  const router = useRouter();
  const [projeto, setProjeto] = useState(initial);

  const tipo = projeto.tipo as ProjetoTipo;
  const tipoConfig = TIPO_CONFIG[tipo] ?? TIPO_CONFIG.outro;
  const meta = (projeto.metadata ?? {}) as Record<string, unknown>;
  const tabs = getTabsParaTipo(tipo);

  const [activeTab, setActiveTab] = useState(tabs[0].id);

  // Garantir que activeTab seja válida se tabs mudarem
  useEffect(() => {
    if (!tabs.find(t => t.id === activeTab)) setActiveTab(tabs[0].id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo]);

  const handleStatus = async (status: ProjetoStatus) => {
    const result = await updateProjetoStatus(organizationId, projeto.id, status);
    if (!result.ok) { toast.error(result.error ?? "Erro"); return; }
    setProjeto((p) => ({ ...p, status }));
    toast.success("Status atualizado.");
  };

  const handleMetaUpdate = async (section: string, value: unknown) => {
    const result = await updateProjetoMetadata(organizationId, projeto.id, section, value);
    if (!result.ok) { toast.error(result.error ?? "Erro"); return; }
    setProjeto((p) => ({ ...p, metadata: { ...((p.metadata ?? {}) as Record<string, unknown>), [section]: value } }));
  };

  // Dados derivados
  const tarefas: Tarefa[] = Array.isArray(meta.tarefas) ? meta.tarefas as Tarefa[] : [];
  const tarefasConcluidas = tarefas.filter((t) => t.concluido).length;
  const memoria: MemoriaEntry[] = Array.isArray(meta.memoria) ? meta.memoria as MemoriaEntry[] : [];
  const rules: Rule[] = Array.isArray(meta.rules) ? meta.rules as Rule[] : [];
  const log: LogEntry[] = Array.isArray(meta.log) ? meta.log as LogEntry[] : [];
  const modulosData: Modulo[] = Array.isArray(meta.modulos_status)
    ? meta.modulos_status as Modulo[]
    : tipoConfig.modulosBase.map(m => ({ ...m, status: "vazio" as const }));
  const conectores: Conector[] = Array.isArray(meta.conectores)
    ? meta.conectores as Conector[]
    : tipoConfig.conectoresBase.map(c => ({ ...c, status: "pendente" as const }));
  const stack: string[] = Array.isArray(meta.stack) ? meta.stack as string[] : [];

  // Subprojetos — armazenados em metadata.subprojetos
  type Subprojeto = { id: string; nome: string; tipo: string; status: string; descricao?: string; progresso?: number };
  const subprojetos: Subprojeto[] = Array.isArray(meta.subprojetos) ? meta.subprojetos as Subprojeto[] : [];

  const progresso = typeof meta.progresso === "number"
    ? meta.progresso
    : tarefas.length > 0
    ? Math.round((tarefasConcluidas / tarefas.length) * 100)
    : 0;

  const healthStatus: "ok" | "risco" | "critico" | "indefinido" = (() => {
    if (meta.health === "critico") return "critico";
    if (meta.health === "risco") return "risco";
    if (meta.health === "ok") return "ok";
    return "indefinido";
  })();

  const rulesBlockers = rules.filter(r => r.bloqueante).length;
  const modulosCompletos = modulosData.filter(m => m.status === "completo").length;

  const kpis = [
    { label: "Progresso",  value: `${progresso}%`,                              icon: TrendingUp,   bg: "#F5FFB8", cor: "#5A6600" },
    { label: "Tarefas",    value: `${tarefasConcluidas}/${tarefas.length || "?"}`,icon: CheckSquare, bg: "#E6F4EA", cor: "#2E7D32" },
    { label: "Pedidos",    value: String(projeto.pedidosCount),                  icon: ClipboardList, bg: "#F3F0FF", cor: "#5B52C7" },
    { label: "Módulos",    value: `${modulosCompletos}/${modulosData.length}`,   icon: Layers,       bg: "#E3F2FD", cor: "#0277BD" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <motion.button onClick={() => router.push("/projetos")}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-base-700"
          whileHover={{ color: "#0E0F10", x: -2 }} whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}>
          <ArrowLeft size={14} /> Projetos
        </motion.button>
        <span className="text-[#D4D5D6]">/</span>
        <span className="text-[13px] font-semibold text-ink-500 truncate max-w-[280px]">{projeto.nome}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        {/* ─── Coluna principal ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Header card */}
          <div className="rounded-[30px] bg-white p-6">
            <div className="flex items-start gap-4 mb-5">
              <div
                className="flex-shrink-0 h-12 w-12 rounded-[16px] flex items-center justify-center"
                style={{ backgroundColor: tipoConfig.pillBg, color: tipoConfig.pillText }}
              >
                <tipoConfig.icone size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                    style={{ backgroundColor: tipoConfig.pillBg, color: tipoConfig.pillText }}>
                    <tipoConfig.icone size={10} />
                    {tipoConfig.label}
                  </span>
                  <span className="text-[11px] text-base-700">· {tipoConfig.squad}</span>
                  {!!meta.prazo && (
                    <span className="text-[11px] text-base-700 flex items-center gap-1">
                      · <CalendarDays size={10} /> {String(meta.prazo)}
                    </span>
                  )}
                  {rulesBlockers > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-[5px] bg-[#FDECEA] px-1.5 py-0.5 text-[9px] font-bold text-[#C62828]">
                      <Lock size={8} /> {rulesBlockers} bloqueio{rulesBlockers !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <h1 className="text-[24px] font-bold text-ink-500 leading-tight">{projeto.nome}</h1>
                {projeto.descricao && (
                  <p className="mt-0.5 text-[13px] text-ink-400 leading-relaxed">{projeto.descricao}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <StatusBadge status={projeto.status} />
                <HealthBadge health={healthStatus} />
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              {kpis.map((kpi, i) => (
                <motion.div key={kpi.label}
                  className="rounded-[16px] p-4"
                  style={{ backgroundColor: kpi.bg }}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <kpi.icon size={13} style={{ color: kpi.cor }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: kpi.cor }}>{kpi.label}</span>
                  </div>
                  <span className="text-[28px] font-bold leading-none text-ink-500">{kpi.value}</span>
                  {kpi.label === "Progresso" && (
                    <div className="mt-2.5 h-1.5 rounded-full bg-white/60 overflow-hidden">
                      <motion.div className="h-full rounded-full"
                        style={{ backgroundColor: progresso >= 80 ? "#43A047" : progresso >= 40 ? "#A8C800" : "#FB8C00" }}
                        initial={{ width: 0 }} animate={{ width: `${progresso}%` }}
                        transition={{ duration: 0.9, ease: [0, 0, 0.2, 1], delay: 0.4 }} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Tabs — usando SlidingTabs padrão do sistema */}
          <div className="rounded-[30px] bg-white overflow-hidden">
            <div className="px-4 pt-4 pb-0 overflow-x-auto scrollbar-none">
              <SlidingTabs
                tabs={tabs.map(t => ({ id: t.id, label: t.label, icon: t.icon }))}
                activeId={activeTab}
                onChange={setActiveTab}
              />
            </div>
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div key={activeTab}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}>
                  <TabConteudo
                    tab={activeTab} tipo={tipo} projeto={projeto} meta={meta}
                    tarefas={tarefas} tarefasConcluidas={tarefasConcluidas}
                    stack={stack} memoria={memoria} rules={rules} log={log}
                    modulosData={modulosData} conectores={conectores}
                    subprojetos={subprojetos}
                    progresso={progresso}
                    onNavigatePedido={(id) => router.push(`/pedidos/${id}`)}
                    onMetaUpdate={handleMetaUpdate}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ─── Sidebar lateral direita ───────────────────────────────── */}
        <Sidebar
          projeto={projeto}
          tipoConfig={tipoConfig}
          meta={meta}
          progresso={progresso}
          tarefas={tarefas}
          tarefasConcluidas={tarefasConcluidas}
          modulosData={modulosData}
          conectores={conectores}
          rules={rules}
          log={log}
          stack={stack}
          healthStatus={healthStatus}
          onStatusChange={handleStatus}
        />
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  projeto, tipoConfig, meta, progresso, tarefas, tarefasConcluidas,
  modulosData, conectores, rules, log, stack, healthStatus, onStatusChange,
}: {
  projeto: ProjetoDetail;
  tipoConfig: TipoConfig;
  meta: Record<string, unknown>;
  progresso: number;
  tarefas: Tarefa[];
  tarefasConcluidas: number;
  modulosData: Modulo[];
  conectores: Conector[];
  rules: Rule[];
  log: LogEntry[];
  stack: string[];
  healthStatus: "ok" | "risco" | "critico" | "indefinido";
  onStatusChange: (s: ProjetoStatus) => Promise<void>;
}) {
  const tipo = projeto.tipo as ProjetoTipo;
  const rulesBlockers = rules.filter(r => r.bloqueante).length;
  const alertas = [
    ...(rulesBlockers > 0 ? [`${rulesBlockers} rule bloqueante`] : []),
    ...((meta.health === "risco" || meta.health === "critico") ? ["Projeto em risco"] : []),
  ];
  const ultimoLog = log[log.length - 1];
  const proxAcoes: string[] = Array.isArray(meta.proximas_acoes) ? meta.proximas_acoes as string[] : [];

  const conectorAtivos = conectores.filter(c => c.status === "ativo").length;

  return (
    <div className="flex flex-col gap-3">
      {/* Status */}
      <div className="rounded-[16px] bg-white p-5 flex flex-col gap-3">
        <p className="text-[11px] font-bold text-base-700 uppercase tracking-wide">Status</p>
        <HubiaSelect
          value={projeto.status}
          onChange={(v) => onStatusChange(v as ProjetoStatus)}
          options={Object.entries(STATUS_PALETTE).map(([v, p]) => ({ value: v, label: p.label }))}
        />
      </div>

      {/* Resumo executivo */}
      <div className="rounded-[16px] bg-white p-5 flex flex-col gap-3.5">
        <p className="text-[11px] font-bold text-base-700 uppercase tracking-wide">Resumo Executivo</p>

        <MetaRow label="Tipo" value={
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: tipoConfig.pillBg, color: tipoConfig.pillText }}>
            <tipoConfig.icone size={10} />
            {tipoConfig.label}
          </span>
        } />
        <MetaRow label="Squad" value={<span className="text-[13px] font-semibold text-ink-500">{tipoConfig.squad}</span>} />
        <MetaRow label="Health" value={<HealthBadge health={healthStatus} size="sm" />} />
        {!!meta.prazo && <MetaRow label="Prazo" value={String(meta.prazo)} />}
        {!!meta.objetivo && (
          <div>
            <p className="text-[11px] text-base-700 mb-1">Objetivo</p>
            <p className="text-[12px] text-ink-500 leading-relaxed">{String(meta.objetivo)}</p>
          </div>
        )}
        {!!meta.cliente && <MetaRow label="Cliente" value={String(meta.cliente)} />}
        {!!meta.owner && <MetaRow label="Owner" value={String(meta.owner)} />}
        <MetaRow label="Criado em" value={new Date(projeto.createdAt).toLocaleDateString("pt-BR")} />
        {ultimoLog && (
          <MetaRow label="Última ação" value={
            <span className="text-[11px] text-right text-base-700 max-w-[140px] truncate">{ultimoLog.acao}</span>
          } />
        )}
      </div>

      {/* Progresso */}
      <div className="rounded-[16px] bg-white p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-base-700 uppercase tracking-wide flex items-center gap-1.5">
            <BarChart3 size={11} /> Progresso
          </p>
          <span className="text-[13px] font-bold text-ink-500">{progresso}%</span>
        </div>
        <div className="h-2 rounded-full bg-base-500 overflow-hidden">
          <motion.div className="h-full rounded-full"
            style={{ backgroundColor: progresso >= 80 ? "#43A047" : progresso >= 40 ? "#A8C800" : "#FB8C00" }}
            initial={{ width: 0 }} animate={{ width: `${progresso}%` }}
            transition={{ duration: 0.9, ease: [0, 0, 0.2, 1] }} />
        </div>
        <div className="flex items-center justify-between">
          {tarefas.length > 0 ? (
            <p className="text-[11px] text-base-700">{tarefasConcluidas}/{tarefas.length} tarefas</p>
          ) : <span />}
          <p className="text-[11px] text-base-700">{modulosData.filter(m => m.status === "completo").length}/{modulosData.length} módulos</p>
        </div>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="rounded-[16px] bg-[#FDECEA] p-4 flex flex-col gap-2">
          <p className="text-[11px] font-bold text-[#C62828] uppercase tracking-wide flex items-center gap-1.5">
            <AlertTriangle size={11} /> Alertas
          </p>
          {alertas.map((a, i) => (
            <p key={i} className="text-[12px] text-[#C62828]">· {a}</p>
          ))}
        </div>
      )}

      {/* Próximas ações */}
      {proxAcoes.length > 0 && (
        <div className="rounded-[16px] bg-white p-5 flex flex-col gap-2.5">
          <p className="text-[11px] font-bold text-base-700 uppercase tracking-wide flex items-center gap-1.5">
            <Target size={11} /> Próximas Ações
          </p>
          {proxAcoes.map((a, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-limao-500" />
              <p className="text-[12px] text-ink-500">{a}</p>
            </div>
          ))}
        </div>
      )}

      {/* Conectores */}
      {conectores.length > 0 && (
        <div className="rounded-[16px] bg-white p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-base-700 uppercase tracking-wide flex items-center gap-1.5">
              <Link2 size={11} /> Conectores
            </p>
            <span className="text-[10px] font-bold text-ink-400">{conectorAtivos} ativo{conectorAtivos !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {conectores.map((c, i) => {
              const Icon = CONECTOR_ICONS[c.tipo] ?? CONECTOR_ICONS.default;
              const statusCor = c.status === "ativo" ? "#43A047" : c.status === "inativo" ? "#C62828" : "#FB8C00";
              return (
                <div key={i} className="flex items-center justify-between rounded-[12px] bg-[#FAFAFA] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Icon size={13} color="#5E5E5F" />
                    <span className="text-[12px] font-semibold text-ink-500">{c.nome}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {c.url && (
                      <motion.a href={c.url} target="_blank" rel="noopener noreferrer"
                        className="text-base-700"
                        whileHover={{ color: "#0E0F10", scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <ExternalLink size={10} />
                      </motion.a>
                    )}
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusCor }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stack (se dev) */}
      {stack.length > 0 && (
        <div className="rounded-[16px] bg-white p-5 flex flex-col gap-3">
          <p className="text-[11px] font-bold text-base-700 uppercase tracking-wide flex items-center gap-1.5">
            <Code2 size={11} /> Stack
          </p>
          <div className="flex flex-wrap gap-1.5">
            {stack.map((tech) => (
              <span key={tech} className="rounded-[7px] bg-ink-500 px-2.5 py-1 text-[11px] font-bold text-limao-500">{tech}</span>
            ))}
          </div>
        </div>
      )}

      {/* Módulos resumo */}
      <div className="rounded-[16px] bg-white p-5 flex flex-col gap-3">
        <p className="text-[11px] font-bold text-base-700 uppercase tracking-wide flex items-center gap-1.5">
          <Puzzle size={11} /> Módulos
        </p>
        <div className="flex flex-col gap-1.5">
          {modulosData.map((m, i) => {
            const statusInfo = {
              completo:  { cor: "#43A047", label: "✓" },
              andamento: { cor: "#A8C800", label: "…" },
              bloqueado: { cor: "#E53935", label: "!" },
              vazio:     { cor: "#D5D2C9", label: "·" },
            }[m.status];
            return (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[12px] font-bold w-4 text-center flex-shrink-0"
                    style={{ color: statusInfo.cor }}>{statusInfo.label}</span>
                  <span className="text-[12px] font-semibold text-ink-500 truncate">{m.nome}</span>
                </div>
                {m.obrigatorio && (
                  <span className="text-[8px] font-bold text-base-700 uppercase flex-shrink-0">req</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Figma link */}
      {!!meta.figmaUrl ? (
        <motion.a href={String(meta.figmaUrl)} target="_blank" rel="noopener noreferrer"
          className="rounded-[16px] bg-white p-4 flex items-center gap-3"
          whileHover={{ backgroundColor: "#EEEFE9" }} whileTap={{ scale: 0.99 }}>
          <div className="h-8 w-8 rounded-[12px] bg-[#1E1E1E] flex items-center justify-center flex-shrink-0">
            <Globe size={15} color="#FFFFFF" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-ink-500">Figma</p>
            <p className="text-[10px] text-base-700 truncate">Abrir design</p>
          </div>
          <ExternalLink size={12} color="#A9AAA5" />
        </motion.a>
      ) : null}
    </div>
  );
}

// ─── TabConteudo Adaptativo ───────────────────────────────────────────────────

function TabConteudo({
  tab, tipo, projeto, meta, tarefas, tarefasConcluidas, stack,
  memoria, rules, log, modulosData, conectores, subprojetos, progresso,
  onNavigatePedido, onMetaUpdate,
}: {
  tab: string; tipo: ProjetoTipo; projeto: ProjetoDetail; meta: Record<string, unknown>;
  tarefas: Tarefa[]; tarefasConcluidas: number; stack: string[];
  memoria: MemoriaEntry[]; rules: Rule[]; log: LogEntry[];
  modulosData: Modulo[]; conectores: Conector[];
  subprojetos: { id: string; nome: string; tipo: string; status: string; descricao?: string; progresso?: number }[];
  progresso: number;
  onNavigatePedido: (id: string) => void;
  onMetaUpdate: (section: string, value: unknown) => Promise<void>;
}) {
  const tipoConfig = TIPO_CONFIG[tipo] ?? TIPO_CONFIG.outro;

  // ── Visão Geral ──────────────────────────────────────────────────────────
  if (tab === "geral") {
    const decisoes = memoria.filter(m => m.tipo === "decision");
    return (
      <div className="flex flex-col gap-6">
        {!!meta.objetivo && (
          <div>
            <SectionLabel>Objetivo Principal</SectionLabel>
            <p className="text-[14px] text-ink-500 leading-relaxed">{String(meta.objetivo)}</p>
          </div>
        )}

        {/* Progresso por módulos */}
        <div>
          <SectionLabel>Progresso dos Módulos</SectionLabel>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {modulosData.map((m, i) => {
              const statusCfg = {
                completo:  { bg: "#E6F4EA", text: "#2E7D32", label: "Completo" },
                andamento: { bg: "#F0FF80", text: "#5A6600", label: "Em andamento" },
                bloqueado: { bg: "#FDECEA", text: "#C62828", label: "Bloqueado" },
                vazio:     { bg: "#F7F7F5", text: "#A9AAA5", label: "Não iniciado" },
              }[m.status];
              return (
                <motion.div key={i}
                  className="rounded-[12px] px-3 py-2.5"
                  style={{ backgroundColor: statusCfg.bg }}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}>
                  <p className="text-[12px] font-semibold" style={{ color: statusCfg.text }}>{m.nome}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: statusCfg.text, opacity: 0.75 }}>{statusCfg.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {stack.length > 0 && (
          <div>
            <SectionLabel>Stack</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {stack.map((tech) => (
                <span key={tech} className="rounded-[8px] bg-ink-500 px-3 py-1.5 text-[12px] font-bold text-limao-500">{tech}</span>
              ))}
            </div>
          </div>
        )}

        {decisoes.length > 0 && (
          <div>
            <SectionLabel>Decisões recentes</SectionLabel>
            <div className="flex flex-col gap-2">
              {decisoes.slice(0, 3).map((dec, i) => (
                <motion.div key={i}
                  className="rounded-[12px] bg-[#FFF3E0] p-3.5 flex items-start gap-2"
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}>
                  <Lightbulb size={13} color="#FB8C00" className="mt-0.5 flex-shrink-0" />
                  <p className="text-[13px] text-ink-500 leading-relaxed">{dec.texto}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {projeto.pedidosCount > 0 && (
          <div>
            <SectionLabel>Pedidos por status</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {Object.entries(projeto.pedidosPorStatus).map(([s, c]) => {
                const p = PEDIDO_STATUS_PALETTE[s] ?? { bg: "#EEEFE9", text: "#5E5E5F", dot: "#A9AAA5" };
                return (
                  <span key={s} className="inline-flex items-center gap-1 rounded-[8px] px-2.5 py-1 text-[12px] font-semibold"
                    style={{ backgroundColor: p.bg, color: p.text }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.dot }} />
                    {c} {PEDIDO_STATUS_LABELS[s] ?? s}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {!meta.objetivo && modulosData.every(m => m.status === "vazio") && (
          <EmptyState icon={FolderKanban} text="Configure o contexto e adicione tarefas para começar." />
        )}
      </div>
    );
  }

  // ── Subprojetos ──────────────────────────────────────────────────────────
  if (tab === "subprojetos") {
    return (
      <SubprojetosTab
        subprojetos={subprojetos}
        onSave={(updated) => onMetaUpdate("subprojetos", updated)}
      />
    );
  }

  // ── Contexto ─────────────────────────────────────────────────────────────
  if (tab === "contexto") {
    return (
      <EditableTextSection
        title="Contexto do Projeto"
        fieldKey="contexto"
        value={meta.contexto as string ?? ""}
        placeholder="O que é, por que existe, objetivo de negócio, público-alvo, riscos, restrições..."
        onSave={onMetaUpdate}
      />
    );
  }

  // ── Módulos ───────────────────────────────────────────────────────────────
  if (tab === "modulos") {
    return (
      <ModulosTab
        modulosData={modulosData}
        tipoConfig={tipoConfig}
        onSave={(m) => onMetaUpdate("modulos_status", m)}
      />
    );
  }

  // ── Tarefas ──────────────────────────────────────────────────────────────
  if (tab === "tarefas") {
    return (
      <TarefasTab
        tarefas={tarefas}
        tarefasConcluidas={tarefasConcluidas}
        onSave={(t) => onMetaUpdate("tarefas", t)}
      />
    );
  }

  // ── Itens Vinculados ─────────────────────────────────────────────────────
  if (tab === "itens") {
    if (projeto.pedidos.length === 0) {
      return <EmptyState icon={ClipboardList} text="Nenhum item vinculado a este projeto ainda. Pedidos vinculados aparecem aqui automaticamente." />;
    }
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between mb-3">
          <SectionLabel>Pedidos vinculados</SectionLabel>
          <span className="text-[11px] text-base-700">{projeto.pedidos.length} no total</span>
        </div>
        {projeto.pedidos.map((p, i) => {
          const palette = PEDIDO_STATUS_PALETTE[p.status] ?? { bg: "#EEEFE9", text: "#5E5E5F", dot: "#A9AAA5" };
          return (
            <motion.div key={p.id}
              className="cursor-pointer rounded-[14px] bg-[#FAFAFA] px-4 py-3.5 flex items-center gap-3"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.25) }}
              whileHover={{ backgroundColor: "#F3F3F1", y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onNavigatePedido(p.id)}>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-ink-500 truncate">{p.titulo}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-base-700">{p.tipo.replace("_", " ")}</span>
                  {p.creator && <span className="text-[11px] text-base-700">· {p.creator.name}</span>}
                  {p.dueAt && <span className="text-[11px] text-base-700">· {new Date(p.dueAt).toLocaleDateString("pt-BR")}</span>}
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-[6px] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide flex-shrink-0"
                style={{ backgroundColor: palette.bg, color: palette.text }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: palette.dot }} />
                {PEDIDO_STATUS_LABELS[p.status] ?? p.status}
              </span>
              <ExternalLink size={12} color="#A9AAA5" className="flex-shrink-0" />
            </motion.div>
          );
        })}
      </div>
    );
  }

  // ── Memória ──────────────────────────────────────────────────────────────
  if (tab === "memoria") {
    return (
      <MemoriaTab
        memoria={memoria}
        onSave={(m) => onMetaUpdate("memoria", m)}
      />
    );
  }

  // ── Rules ────────────────────────────────────────────────────────────────
  if (tab === "rules") {
    return (
      <RulesTab
        rules={rules}
        onSave={(r) => onMetaUpdate("rules", r)}
      />
    );
  }

  // ── Log ──────────────────────────────────────────────────────────────────
  if (tab === "log") {
    return (
      <LogTab log={log} />
    );
  }

  // ── Conectores ───────────────────────────────────────────────────────────
  if (tab === "conectores") {
    return (
      <ConectoresTab
        conectores={conectores}
        tipoConfig={tipoConfig}
        meta={meta}
        onSave={(c) => onMetaUpdate("conectores", c)}
      />
    );
  }

  // ── Abas dinâmicas (texto editável padrão) ───────────────────────────────
  const dynamicTabsMap: Record<string, { title: string; fieldKey: string; placeholder: string }> = {
    prd:           { title: "Documento de Requisitos (PRD)",       fieldKey: "prd",           placeholder: "Visão do produto, casos de uso, requisitos funcionais e não funcionais, critérios de aceite..." },
    arquitetura:   { title: "Notas de Arquitetura",                fieldKey: "arquitetura_notas", placeholder: "Decisões de arquitetura, diagramas, padrões, serviços, fluxos..." },
    design:        { title: "Notas de Design",                     fieldKey: "design_notas",  placeholder: "Decisões visuais, componentes, guidelines, referências..." },
    identidade:    { title: "Identidade da Creator",               fieldKey: "identidade",    placeholder: "Quem é, personalidade, valores, história, missão narrativa..." },
    aparencia:     { title: "Aparência e Diretrizes Visuais",      fieldKey: "aparencia",     placeholder: "Características físicas, estilo, looks, paleta de cores, diretrizes..." },
    voz:           { title: "Tom de Voz",                          fieldKey: "tom_de_voz",    placeholder: "Como fala, linguagem, expressões, o que nunca diz, estilo narrativo..." },
    ambientes:     { title: "Ambientes Visuais",                   fieldKey: "ambientes",     placeholder: "Cenários, locações, estética de fundo, contextos visuais recorrentes..." },
    plataformas:   { title: "Plataformas",                         fieldKey: "plataformas",   placeholder: "Quais plataformas, frequência, tipo de conteúdo por plataforma..." },
    conceito:      { title: "Conceito Criativo",                   fieldKey: "conceito",      placeholder: "Ideia central, defesa conceitual, moodboard, referências criativas..." },
    fluxos:        { title: "Fluxos de Usuário",                   fieldKey: "fluxos",        placeholder: "Jornadas, fluxos de navegação, estados, edge cases..." },
    banco:         { title: "Banco de Dados",                      fieldKey: "banco_notas",   placeholder: "Entidades, relações, RLS, migrations, estratégia de dados..." },
    integracoes:   { title: "Integrações",                         fieldKey: "integracoes_notas", placeholder: "APIs externas, webhooks, credenciais, status de cada integração..." },
    deploy:        { title: "Notas de Deploy",                     fieldKey: "deploy_notas",  placeholder: "Plataforma, variáveis de ambiente, domínio, CI/CD, processo de release..." },
    analytics:     { title: "Analytics e Métricas",                fieldKey: "analytics",     placeholder: "KPIs, ferramentas de tracking, eventos, metas de conversão..." },
    copy:          { title: "Copy",                                fieldKey: "copy",          placeholder: "Headlines, CTAs, textos das seções, tom editorial..." },
    estrategia:    { title: "Estratégia de Conteúdo",              fieldKey: "estrategia",    placeholder: "Posicionamento, objetivos, métricas, canais prioritários..." },
    pilares:       { title: "Pilares de Conteúdo",                 fieldKey: "pilares",       placeholder: "Temas, categorias, proporção de cada tipo de conteúdo..." },
    roteiros:      { title: "Roteiros",                            fieldKey: "roteiros",      placeholder: "Templates, roteiros base, estrutura de vídeo, storytelling..." },
    diagnostico:   { title: "Diagnóstico de Marca",                fieldKey: "diagnostico",   placeholder: "Análise da marca atual, percepção, pontos de melhoria, benchmark..." },
    marca:         { title: "Marca",                               fieldKey: "marca",         placeholder: "Nome, símbolo, tipografia, cores, slogan, manifesto..." },
    sistema_visual:{ title: "Sistema Visual",                      fieldKey: "sistema_visual", placeholder: "Grid, espaçamento, hierarquia tipográfica, uso de elementos, tom visual..." },
    handoff:       { title: "Handoff",                             fieldKey: "handoff",       placeholder: "O que foi entregue, formatos, como usar, contato para dúvidas..." },
    requisitos:    { title: "Requisitos",                          fieldKey: "requisitos",    placeholder: "O que precisa fazer, entradas/saídas, casos de uso, limitações..." },
    estrutura:     { title: "Estrutura",                           fieldKey: "estrutura",     placeholder: "Sumário, hierarquia, público-alvo, formato de entrega..." },
    publico:       { title: "Público-Alvo",                        fieldKey: "publico",       placeholder: "Perfil demográfico, dores, desejos, comportamento, persona..." },
    milestones:    { title: "Milestones",                          fieldKey: "milestones",    placeholder: "Marcos do projeto, datas, entregáveis por fase, responsáveis..." },
  };

  // Abas que precisam de tratamento especial como empty state
  const emptyStateMap: Record<string, { icon: React.ElementType; text: string }> = {
    calendario:    { icon: CalendarDays, text: "Calendário de conteúdo. Alimentado pelos pedidos vinculados." },
    pecas:         { icon: Package, text: "Peças do projeto. Criadas a partir dos pedidos vinculados." },
    conteudo_tab:  { icon: FileText, text: "Conteúdo vinculado. Aparece aqui conforme pedidos são criados." },
    operacao_tab:  { icon: Settings, text: "Configuração de operação do creator — frequência, processos, responsáveis." },
    assets_tab:    { icon: Package, text: "Assets do projeto. Use o Supabase Storage para uploads (configuração pendente)." },
    documentos_tab:{ icon: FileText, text: "Documentos estruturados. Será implementado com o módulo Conhecimento." },
    exploracao:    { icon: Eye, text: "Área de exploração visual. Vincule assets e referências nos arquivos." },
    times:         { icon: Users, text: "Times e squads envolvidos, listados conforme pedidos são vinculados." },
    aprovacoes:    { icon: ShieldCheck, text: "Fluxo de aprovação gerado conforme pedidos avançam para Revisão." },
  };

  if (emptyStateMap[tab]) {
    const em = emptyStateMap[tab];
    return <EmptyState icon={em.icon} text={em.text} />;
  }

  if (dynamicTabsMap[tab]) {
    const cfg = dynamicTabsMap[tab];
    return (
      <EditableTextSection
        title={cfg.title}
        fieldKey={cfg.fieldKey}
        value={meta[cfg.fieldKey] as string ?? ""}
        placeholder={cfg.placeholder}
        onSave={onMetaUpdate}
      />
    );
  }

  return <EmptyState icon={Rocket} text="Esta etapa será preenchida conforme o projeto avança." />;
}

// ─── SubprojetosTab ─────────────────────────────────────────────────────────

type SubprojetoItem = { id: string; nome: string; tipo: string; status: string; descricao?: string; progresso?: number };

const STATUS_SUBPROJETO: Record<string, { dot: string; text: string; label: string; bg: string }> = {
  ativo:     { dot: "#A8C800", text: "#5A6600", label: "Ativo",     bg: "#F0FF80" },
  pausado:   { dot: "#FB8C00", text: "#A05500", label: "Pausado",   bg: "#FFF0E0" },
  concluido: { dot: "#43A047", text: "#2E7D32", label: "Concluído", bg: "#E6F4EA" },
  cancelado: { dot: "#E53935", text: "#C62828", label: "Cancelado", bg: "#FDECEA" },
};

function SubprojetosTab({ subprojetos, onSave }: {
  subprojetos: SubprojetoItem[];
  onSave: (updated: SubprojetoItem[]) => Promise<void>;
}) {
  const [lista, setLista] = useState<SubprojetoItem[]>(subprojetos);
  const [criando, setCriando] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoTipo, setNovoTipo] = useState<ProjetoTipo>("outro");
  const [novaDesc, setNovaDesc] = useState("");
  const [saving, setSaving] = useState(false);

  async function adicionar() {
    if (!novoNome.trim()) return;
    const novo: SubprojetoItem = {
      id: Date.now().toString(),
      nome: novoNome.trim(),
      tipo: novoTipo,
      status: "ativo",
      descricao: novaDesc.trim() || undefined,
      progresso: 0,
    };
    const atualizado = [...lista, novo];
    setSaving(true);
    await onSave(atualizado);
    setLista(atualizado);
    setNovoNome("");
    setNovaDesc("");
    setNovoTipo("outro");
    setCriando(false);
    setSaving(false);
  }

  async function remover(id: string) {
    const atualizado = lista.filter(s => s.id !== id);
    await onSave(atualizado);
    setLista(atualizado);
  }

  async function mudarStatus(id: string, status: string) {
    const atualizado = lista.map(s => s.id === id ? { ...s, status } : s);
    await onSave(atualizado);
    setLista(atualizado);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-bold text-ink-500">Subprojetos</h3>
          <p className="text-[12px] text-base-700 mt-0.5">
            Projetos filhos contidos dentro deste projeto principal.
          </p>
        </div>
        <motion.button
          onClick={() => setCriando(true)}
          className="flex items-center gap-1.5 rounded-[14px] px-3.5 py-2 text-[13px] font-semibold text-ink-500"
          initial="rest" animate="rest" whileHover="hovered" whileTap={{ scale: 0.96 }}
          variants={{ rest: { backgroundColor: "#D7FF00" }, hovered: { backgroundColor: "#DFFF33" } }}
          transition={{ duration: 0.15 }}
        >
          <motion.span variants={{ rest: { scale: 1 }, hovered: { scale: 1.2 } }}><Plus size={14} /></motion.span>
          Novo subprojeto
        </motion.button>
      </div>

      {/* Form de criação */}
      <AnimatePresence>
        {criando && (
          <motion.div
            className="rounded-[16px] border border-limao-500 bg-[#FAFFF0] p-4 flex flex-col gap-3"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-ink-400 mb-1 uppercase tracking-wide">Nome</label>
                <input
                  value={novoNome}
                  onChange={e => setNovoNome(e.target.value)}
                  placeholder="Ex: Módulo de Pagamentos"
                  className="w-full h-10 rounded-[12px] bg-white border border-transparent px-3 text-[14px] text-ink-500 outline-none focus:border-ink-500 focus:ring-2 focus:ring-ink-500/10 transition-[border-color] duration-150"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-ink-400 mb-1 uppercase tracking-wide">Tipo</label>
                <select
                  value={novoTipo}
                  onChange={e => setNovoTipo(e.target.value as ProjetoTipo)}
                  className="w-full h-10 rounded-[12px] bg-white border border-transparent px-3 text-[13px] text-ink-500 outline-none focus:border-ink-500 transition-[border-color] duration-150"
                >
                  {Object.entries(TIPO_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-ink-400 mb-1 uppercase tracking-wide">Descrição curta</label>
                <input
                  value={novaDesc}
                  onChange={e => setNovaDesc(e.target.value)}
                  placeholder="Opcional"
                  className="w-full h-10 rounded-[12px] bg-white border border-transparent px-3 text-[13px] text-ink-500 outline-none focus:border-ink-500 transition-[border-color] duration-150"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <motion.button
                onClick={() => setCriando(false)}
                className="h-9 rounded-[12px] bg-[#F0F0EE] px-4 text-[13px] font-semibold text-ink-400"
                whileHover={{ backgroundColor: "#E5E5E2" }} whileTap={{ scale: 0.97 }}
              >
                Cancelar
              </motion.button>
              <motion.button
                onClick={adicionar}
                disabled={!novoNome.trim() || saving}
                className="h-9 rounded-[12px] bg-ink-500 px-4 text-[13px] font-semibold text-white disabled:opacity-40"
                whileHover={{ backgroundColor: "#2A2B2C" }} whileTap={{ scale: 0.97 }}
              >
                {saving ? "Salvando..." : "Adicionar"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de subprojetos */}
      {lista.length === 0 && !criando && (
        <EmptyState
          icon={FolderKanban}
          text="Nenhum subprojeto ainda. Subprojetos são projetos filhos contidos dentro deste projeto."
        />
      )}

      <div className="flex flex-col gap-2">
        {lista.map((s, idx) => {
          const sp = STATUS_SUBPROJETO[s.status] ?? STATUS_SUBPROJETO.ativo;
          const tipoLabel = TIPO_CONFIG[s.tipo as ProjetoTipo]?.label ?? s.tipo;
          const tipoCor = TIPO_CONFIG[s.tipo as ProjetoTipo]?.cor ?? "#5E5E5F";
          const progresso = s.progresso ?? 0;
          const corBarra = progresso >= 75 ? "#D7FF00" : progresso >= 40 ? "#A8C800" : "#FB8C00";

          return (
            <motion.div
              key={s.id}
              className="rounded-[16px] bg-[#FAFAFA] border border-[#F0F0EE] p-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ borderColor: "#E0E0DC" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Nome + tipo */}
                  <div className="flex items-center gap-2 mb-1">
                    <FolderOpen size={14} color="#A9AAA5" />
                    <h4 className="text-[15px] font-bold text-ink-500 truncate">{s.nome}</h4>
                  </div>
                  {s.descricao && (
                    <p className="text-[12px] text-base-700 mb-2 line-clamp-1">{s.descricao}</p>
                  )}
                  {/* Meta */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-[5px]"
                      style={{ backgroundColor: `${tipoCor}12`, color: tipoCor }}>
                      {tipoLabel}
                    </span>
                    <select
                      value={s.status}
                      onChange={e => mudarStatus(s.id, e.target.value)}
                      className="text-[10px] font-bold rounded-[5px] px-2 py-0.5 outline-none border-none cursor-pointer"
                      style={{ backgroundColor: sp.bg, color: sp.text }}
                    >
                      {Object.entries(STATUS_SUBPROJETO).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                  {/* Barra de progresso */}
                  {progresso > 0 && (
                    <div className="mt-2.5">
                      <div className="h-1 w-full rounded-full bg-base-500 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: corBarra }}
                          initial={{ width: 0 }}
                          animate={{ width: `${progresso}%` }}
                          transition={{ duration: 0.7, ease: [0, 0, 0.2, 1] }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                {/* Ações */}
                <motion.button
                  onClick={() => remover(s.id)}
                  className="flex-shrink-0 rounded-[8px] p-1.5 text-base-700"
                  whileHover={{ backgroundColor: "#FDECEA", color: "#C62828", scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                >
                  <X size={13} />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ModulosTab({ modulosData, tipoConfig, onSave }: {
  modulosData: Modulo[];
  tipoConfig: TipoConfig;
  onSave: (m: Modulo[]) => Promise<void>;
}) {
  const [lista, setLista] = useState<Modulo[]>(modulosData);
  const [saving, setSaving] = useState(false);

  const updateStatus = async (idx: number, novoStatus: Modulo["status"]) => {
    const novaLista = lista.map((m, i) => i === idx ? { ...m, status: novoStatus } : m);
    setLista(novaLista);
    setSaving(true);
    await onSave(novaLista);
    setSaving(false);
  };

  const statusOpts: Modulo["status"][] = ["vazio", "andamento", "bloqueado", "completo"];
  const statusConfig: Record<Modulo["status"], { label: string; cor: string; bg: string }> = {
    completo:  { label: "Completo",       cor: "#2E7D32", bg: "#E6F4EA" },
    andamento: { label: "Em andamento",   cor: "#5A6600", bg: "#F0FF80" },
    bloqueado: { label: "Bloqueado",      cor: "#C62828", bg: "#FDECEA" },
    vazio:     { label: "Não iniciado",   cor: "#A9AAA5", bg: "#F7F7F5" },
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <SectionLabel>Módulos do Projeto</SectionLabel>
        <div className="flex items-center gap-3">
          {saving && <span className="text-[11px] text-base-700">Salvando...</span>}
          <span className="text-[12px] text-base-700">
            {lista.filter(m => m.status === "completo").length}/{lista.length} completos
          </span>
        </div>
      </div>

      <p className="text-[12px] text-base-700 leading-relaxed">
        Estes são os módulos estruturais deste projeto. Módulos marcados como <strong>req</strong> são obrigatórios pelo tipo.
      </p>

      <div className="flex flex-col gap-2">
        {lista.map((m, i) => {
          const sCfg = statusConfig[m.status];
          return (
            <motion.div key={i}
              className="flex items-center gap-3 rounded-[14px] border border-base-500 bg-white px-4 py-3"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold text-ink-500">{m.nome}</p>
                  {m.obrigatorio && (
                    <span className="text-[8px] font-bold text-white bg-ink-500 px-1.5 py-0.5 rounded-[4px] uppercase">req</span>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                {statusOpts.map((s) => (
                  <motion.button key={s}
                    onClick={() => updateStatus(i, s)}
                    className="rounded-[8px] px-2 py-1 text-[10px] font-bold"
                    animate={{
                      backgroundColor: m.status === s ? statusConfig[s].bg : "#FAFAFA",
                      color: m.status === s ? statusConfig[s].cor : "#A9AAA5",
                    }}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.15 }}>
                    {statusConfig[s].label === "Não iniciado" ? "Vazio" : statusConfig[s].label.split(" ")[0]}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Adicionar módulo extra */}
      <AdicionarModulo onAdd={async (nome) => {
        const novaLista = [...lista, { nome, status: "vazio" as const, obrigatorio: false }];
        setLista(novaLista);
        setSaving(true);
        await onSave(novaLista);
        setSaving(false);
      }} />
    </div>
  );
}

function AdicionarModulo({ onAdd }: { onAdd: (nome: string) => Promise<void> }) {
  const [novo, setNovo] = useState("");
  return (
    <div className="flex gap-2 pt-2 border-t border-base-500">
      <input
        value={novo} onChange={(e) => setNovo(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && novo.trim()) { onAdd(novo.trim()); setNovo(""); } }}
        placeholder="Adicionar módulo extra..."
        className="flex-1 h-9 rounded-[12px] border border-transparent bg-base-500 px-3 text-[13px] text-ink-500 outline-none placeholder:text-base-700 focus:border-ink-500 focus:ring-2 focus:ring-ink-500/10 transition-[border-color] duration-150"
      />
      <motion.button onClick={() => { if (novo.trim()) { onAdd(novo.trim()); setNovo(""); } }} disabled={!novo.trim()}
        className="h-9 w-9 rounded-[12px] bg-ink-500 flex items-center justify-center disabled:opacity-40"
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Plus size={14} color="#D7FF00" />
      </motion.button>
    </div>
  );
}

// ─── MemoriaTab estruturada ───────────────────────────────────────────────────

function MemoriaTab({ memoria, onSave }: {
  memoria: MemoriaEntry[];
  onSave: (m: MemoriaEntry[]) => Promise<void>;
}) {
  const [lista, setLista] = useState<MemoriaEntry[]>(memoria);
  const [novo, setNovo] = useState("");
  const [novoTipo, setNovoTipo] = useState<MemoriaEntry["tipo"]>("working");
  const [saving, setSaving] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<MemoriaEntry["tipo"] | "todos">("todos");

  const adicionar = async () => {
    if (!novo.trim()) return;
    const entry: MemoriaEntry = {
      id: Date.now(),
      tipo: novoTipo,
      texto: novo.trim(),
      data: new Date().toLocaleDateString("pt-BR"),
    };
    const novaLista = [entry, ...lista];
    setLista(novaLista);
    setNovo("");
    setSaving(true);
    await onSave(novaLista);
    setSaving(false);
    toast.success("Adicionado à memória.");
  };

  const remover = async (id: number) => {
    const novaLista = lista.filter(m => m.id !== id);
    setLista(novaLista);
    setSaving(true);
    await onSave(novaLista);
    setSaving(false);
  };

  const listaFiltrada = filtroTipo === "todos" ? lista : lista.filter(m => m.tipo === filtroTipo);

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-[14px] bg-[#F0EFFF] p-4">
        <p className="text-[12px] text-[#5B52C7] leading-relaxed font-semibold mb-1">Camadas de Memória</p>
        <p className="text-[12px] text-[#5B52C7] leading-relaxed">
          Working Memory → contexto da sessão atual. Long-term → memória permanente do projeto.
          Decisões → escolhas importantes registradas. Aprendizados → lições que não podem se perder.
        </p>
      </div>

      {/* Adicionar */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          {(["working", "longterm", "decision", "lesson"] as const).map((t) => {
            const cfg = MEMORIA_TIPOS[t];
            return (
              <motion.button key={t}
                onClick={() => setNovoTipo(t)}
                className="flex-1 rounded-[12px] py-1.5 text-[11px] font-bold"
                animate={{
                  backgroundColor: novoTipo === t ? cfg.bg : "#FAFAFA",
                  color: novoTipo === t ? cfg.cor : "#A9AAA5",
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}>
                {cfg.label}
              </motion.button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <input
            value={novo} onChange={(e) => setNovo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && adicionar()}
            placeholder={`Adicionar à ${MEMORIA_TIPOS[novoTipo].label}...`}
            className="flex-1 h-9 rounded-[12px] border border-transparent bg-base-500 px-3 text-[13px] text-ink-500 outline-none placeholder:text-base-700 focus:border-ink-500 focus:ring-2 focus:ring-ink-500/10 transition-[border-color] duration-150"
          />
          <motion.button onClick={adicionar} disabled={!novo.trim() || saving}
            className="h-9 px-4 rounded-[12px] bg-ink-500 text-[12px] font-semibold text-limao-500 disabled:opacity-40"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
            {saving ? "…" : <Plus size={13} />}
          </motion.button>
        </div>
      </div>

      {/* Filtro por tipo */}
      {lista.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {(["todos", "working", "longterm", "decision", "lesson"] as const).map((t) => (
            <motion.button key={t}
              onClick={() => setFiltroTipo(t)}
              className="rounded-[8px] px-2.5 py-1 text-[11px] font-semibold"
              animate={{
                backgroundColor: filtroTipo === t ? "#0E0F10" : "#EEEFE9",
                color: filtroTipo === t ? "#D7FF00" : "#A9AAA5",
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}>
              {t === "todos" ? "Todos" : MEMORIA_TIPOS[t].label}
            </motion.button>
          ))}
        </div>
      )}

      {/* Lista */}
      <div className="flex flex-col gap-2">
        {listaFiltrada.length === 0 ? (
          <EmptyState icon={Brain} text="Nenhuma memória registrada. Adicione contexto que os agentes devem lembrar." />
        ) : listaFiltrada.map((m) => {
          const cfg = MEMORIA_TIPOS[m.tipo];
          const Icon = cfg.icone;
          return (
            <motion.div key={m.id}
              className="rounded-[12px] p-3.5 flex items-start gap-3"
              style={{ backgroundColor: cfg.bg }}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}>
              <Icon size={13} style={{ color: cfg.cor }} className="mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: cfg.cor }}>{cfg.label}</span>
                  {m.data && <span className="text-[10px] text-base-700">{m.data}</span>}
                </div>
                <p className="text-[13px] text-ink-500 leading-relaxed">{m.texto}</p>
              </div>
              <motion.button onClick={() => remover(m.id)}
                className="flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${cfg.cor}20` }}
                whileHover={{ scale: 1.1, backgroundColor: `${cfg.cor}35` }} whileTap={{ scale: 0.9 }}>
                <X size={9} style={{ color: cfg.cor }} />
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── RulesTab estruturado ─────────────────────────────────────────────────────

function RulesTab({ rules, onSave }: {
  rules: Rule[];
  onSave: (r: Rule[]) => Promise<void>;
}) {
  const [lista, setLista] = useState<Rule[]>(rules);
  const [saving, setSaving] = useState(false);
  const [expandido, setExpandido] = useState<number | null>(null);
  const [adicionando, setAdicionando] = useState(false);

  // Form nova rule
  const [novaTitulo, setNovaTitulo] = useState("");
  const [novaDesc, setNovaDesc] = useState("");
  const [novaCateg, setNovaCateg] = useState<Rule["categoria"]>("branding");
  const [novaPrio, setNovaPrio] = useState<Rule["prioridade"]>("media");
  const [novaBloq, setNovaBloq] = useState(false);

  const adicionar = async () => {
    if (!novaTitulo.trim()) return;
    const rule: Rule = {
      id: Date.now(),
      titulo: novaTitulo.trim(),
      descricao: novaDesc.trim() || undefined,
      categoria: novaCateg,
      prioridade: novaPrio,
      bloqueante: novaBloq,
      data: new Date().toLocaleDateString("pt-BR"),
    };
    const novaLista = [...lista, rule];
    setLista(novaLista);
    setNovaTitulo(""); setNovaDesc(""); setAdicionando(false);
    setSaving(true);
    await onSave(novaLista);
    setSaving(false);
    toast.success("Rule adicionada.");
  };

  const remover = async (id: number) => {
    const novaLista = lista.filter(r => r.id !== id);
    setLista(novaLista);
    setSaving(true);
    await onSave(novaLista);
    setSaving(false);
  };

  const prioConfig: Record<Rule["prioridade"], { cor: string; label: string }> = {
    critica: { cor: "#C62828", label: "Crítica" },
    alta:    { cor: "#E53935", label: "Alta" },
    media:   { cor: "#FB8C00", label: "Média" },
    baixa:   { cor: "#A9AAA5", label: "Baixa" },
  };

  // Agrupar por categoria
  const categorias = Object.keys(RULE_CATEGORIAS) as Rule["categoria"][];
  const porCategoria = categorias.reduce<Record<Rule["categoria"], Rule[]>>((acc, cat) => {
    acc[cat] = lista.filter(r => r.categoria === cat);
    return acc;
  }, {} as Record<Rule["categoria"], Rule[]>);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <SectionLabel>Rules do Projeto</SectionLabel>
          <p className="text-[12px] text-base-700 mt-0.5">
            Restrições e diretrizes invioláveis. {lista.filter(r => r.bloqueante).length} bloqueante{lista.filter(r => r.bloqueante).length !== 1 ? "s" : ""}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saving && <span className="text-[11px] text-base-700">Salvando...</span>}
          <motion.button onClick={() => setAdicionando(v => !v)}
            className="flex items-center gap-1.5 rounded-[12px] bg-ink-500 px-3 py-1.5 text-[12px] font-semibold text-limao-500"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
            <Plus size={12} /> Nova Rule
          </motion.button>
        </div>
      </div>

      {/* Formulário de nova rule */}
      <AnimatePresence>
        {adicionando && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
            className="overflow-hidden">
            <div className="rounded-[16px] border-2 border-limao-500 bg-[#FFFDE7] p-5 flex flex-col gap-3">
              <p className="text-[11px] font-bold text-[#5A6600] uppercase tracking-wide">Nova Rule</p>
              <input
                autoFocus value={novaTitulo} onChange={(e) => setNovaTitulo(e.target.value)}
                placeholder="Título da rule *"
                className="h-10 w-full rounded-[12px] border border-transparent bg-white px-3 text-[13px] text-ink-500 outline-none placeholder:text-base-700 focus:border-ink-500 focus:ring-2 focus:ring-ink-500/10 transition-[border-color] duration-150"
              />
              <textarea
                value={novaDesc} onChange={(e) => setNovaDesc(e.target.value)}
                placeholder="Descrição (opcional)"
                rows={2}
                className="w-full rounded-[12px] border border-transparent bg-white px-3 py-2 text-[13px] text-ink-500 outline-none placeholder:text-base-700 resize-none focus:border-ink-500 focus:ring-2 focus:ring-ink-500/10 transition-[border-color] duration-150"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase text-base-700">Categoria</label>
                  <select
                    value={novaCateg} onChange={(e) => setNovaCateg(e.target.value as Rule["categoria"])}
                    className="h-9 w-full rounded-[12px] border border-transparent bg-white px-2 text-[12px] text-ink-500 outline-none focus:border-ink-500 transition-[border-color] duration-150">
                    {Object.entries(RULE_CATEGORIAS).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase text-base-700">Prioridade</label>
                  <select
                    value={novaPrio} onChange={(e) => setNovaPrio(e.target.value as Rule["prioridade"])}
                    className="h-9 w-full rounded-[12px] border border-transparent bg-white px-2 text-[12px] text-ink-500 outline-none focus:border-ink-500 transition-[border-color] duration-150">
                    {Object.entries(prioConfig).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={novaBloq} onChange={(e) => setNovaBloq(e.target.checked)}
                  className="h-4 w-4 rounded border-[#D4D5D6] accent-[#E53935]" />
                <span className="text-[12px] font-semibold text-[#C62828]">Esta rule é bloqueante</span>
              </label>
              <div className="flex gap-2">
                <motion.button onClick={() => setAdicionando(false)}
                  className="flex-1 rounded-[12px] bg-white py-2 text-[13px] font-semibold text-ink-400"
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>Cancelar</motion.button>
                <motion.button onClick={adicionar} disabled={!novaTitulo.trim()}
                  className="flex-1 rounded-[12px] bg-ink-500 py-2 text-[13px] font-semibold text-limao-500 disabled:opacity-40"
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>Salvar Rule</motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules agrupadas por categoria */}
      {lista.length === 0 ? (
        <EmptyState icon={ShieldCheck} text="Nenhuma rule definida. Adicione restrições obrigatórias para este projeto." />
      ) : (
        <div className="flex flex-col gap-4">
          {categorias.map((cat) => {
            const catRules = porCategoria[cat];
            if (catRules.length === 0) return null;
            const catCfg = RULE_CATEGORIAS[cat];
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-[5px]"
                    style={{ backgroundColor: catCfg.bg, color: catCfg.cor }}>{catCfg.label}</span>
                  <span className="text-[11px] text-base-700">{catRules.length} rule{catRules.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {catRules.map((r) => {
                    const pCfg = prioConfig[r.prioridade ?? "media"];
                    return (
                      <motion.div key={r.id}
                        className="rounded-[12px] border border-[#F0F0EE] bg-white overflow-hidden"
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                        <div
                          className="flex items-start gap-3 px-4 py-3 cursor-pointer"
                          onClick={() => setExpandido(expandido === r.id ? null : r.id)}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {r.bloqueante && (
                                <span className="inline-flex items-center gap-1 rounded-[4px] bg-[#FDECEA] px-1.5 py-0.5 text-[8px] font-bold text-[#C62828]">
                                  <Lock size={7} /> BLOQUEANTE
                                </span>
                              )}
                              <span className="text-[13px] font-semibold text-ink-500">{r.titulo}</span>
                            </div>
                            {r.descricao && expandido !== r.id && (
                              <p className="text-[12px] text-base-700 mt-0.5 truncate">{r.descricao}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[9px] font-bold" style={{ color: pCfg.cor }}>{pCfg.label}</span>
                            <motion.div animate={{ rotate: expandido === r.id ? 180 : 0 }} transition={{ duration: 0.2 }}>
                              <ChevronDown size={12} color="#A9AAA5" />
                            </motion.div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandido === r.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
                              className="overflow-hidden">
                              <div className="px-4 pb-3 flex flex-col gap-2 border-t border-[#F0F0EE] pt-3">
                                {r.descricao && (
                                  <p className="text-[13px] text-ink-400 leading-relaxed">{r.descricao}</p>
                                )}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {r.data && <span className="text-[11px] text-base-700">{r.data}</span>}
                                    {r.origem && <span className="text-[11px] text-base-700">· {r.origem}</span>}
                                  </div>
                                  <motion.button onClick={() => remover(r.id)}
                                    className="flex items-center gap-1 rounded-[8px] bg-[#FDECEA] px-2.5 py-1 text-[11px] font-semibold text-[#C62828]"
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
                                    <X size={10} /> Remover
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── LogTab forense ───────────────────────────────────────────────────────────

function LogTab({ log }: { log: LogEntry[] }) {
  const [filtroAgente, setFiltroAgente] = useState<boolean>(false);
  const agentes = [...new Set(log.filter(l => l.agente).map(l => l.agente!))];
  const listaFiltrada = filtroAgente ? log.filter(l => !!l.agente) : log;

  if (log.length === 0) {
    return <EmptyState icon={History} text="O histórico de eventos será registrado automaticamente conforme o projeto evolui." />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <SectionLabel>Histórico de Eventos</SectionLabel>
        <div className="flex items-center gap-2">
          {agentes.length > 0 && (
            <motion.button onClick={() => setFiltroAgente(v => !v)}
              className="rounded-[8px] px-2.5 py-1 text-[11px] font-semibold"
              animate={{
                backgroundColor: filtroAgente ? "#0E0F10" : "#EEEFE9",
                color: filtroAgente ? "#D7FF00" : "#A9AAA5",
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}>
              <Bot size={11} className="inline mr-1" />
              Só agentes
            </motion.button>
          )}
          <span className="text-[11px] text-base-700">{listaFiltrada.length} evento{listaFiltrada.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {listaFiltrada.map((entry, i) => (
          <motion.div key={entry.id ?? i}
            className="flex items-start gap-3 rounded-[14px] bg-[#FAFAFA] px-4 py-3"
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}>
            <div className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: entry.agente ? "#F0EFFF" : "#EEEFE9" }}>
              {entry.agente ? <Bot size={12} color="#7C6AF7" /> : <History size={12} color="#A9AAA5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-ink-500">{entry.acao}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {entry.agente && (
                  <span className="text-[10px] font-bold text-[#7C6AF7] bg-[#F0EFFF] px-1.5 py-0.5 rounded-[4px]">
                    {entry.agente}
                  </span>
                )}
                {entry.squad && (
                  <span className="text-[10px] text-base-700">{entry.squad}</span>
                )}
                {entry.modulo && (
                  <span className="text-[10px] text-base-700">· {entry.modulo}</span>
                )}
                {entry.versao && (
                  <span className="text-[10px] font-bold text-ink-400 bg-base-500 px-1.5 py-0.5 rounded-[4px]">
                    v{entry.versao}
                  </span>
                )}
                {entry.data && (
                  <span className="text-[10px] text-base-700">{entry.data}</span>
                )}
              </div>
              {entry.impacto && (
                <p className="text-[11px] text-ink-400 mt-1 italic">{entry.impacto}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── ConectoresTab ────────────────────────────────────────────────────────────

function ConectoresTab({ conectores, tipoConfig, meta, onSave }: {
  conectores: Conector[];
  tipoConfig: TipoConfig;
  meta: Record<string, unknown>;
  onSave: (c: Conector[]) => Promise<void>;
}) {
  const [lista, setLista] = useState<Conector[]>(conectores);
  const [saving, setSaving] = useState(false);

  const updateStatus = async (idx: number, status: Conector["status"]) => {
    const novaLista = lista.map((c, i) => i === idx ? { ...c, status } : c);
    setLista(novaLista);
    setSaving(true);
    await onSave(novaLista);
    setSaving(false);
  };

  const updateUrl = async (idx: number, url: string) => {
    const novaLista = lista.map((c, i) => i === idx ? { ...c, url } : c);
    setLista(novaLista);
    setSaving(true);
    await onSave(novaLista);
    setSaving(false);
  };

  const statusConfig: Record<Conector["status"], { cor: string; label: string; bg: string }> = {
    ativo:    { cor: "#43A047", label: "Ativo",    bg: "#E6F4EA" },
    inativo:  { cor: "#C62828", label: "Inativo",  bg: "#FDECEA" },
    pendente: { cor: "#FB8C00", label: "Pendente", bg: "#FFF0E0" },
  };

  // Campos de infraestrutura rápida
  const infraFields: { label: string; key: string; placeholder: string }[] = [
    { label: "URL de Produção",  key: "deploy_url",   placeholder: "https://..." },
    { label: "URL de Staging",   key: "staging_url",  placeholder: "https://staging..." },
    { label: "Repositório",      key: "github_url",   placeholder: "https://github.com/..." },
    { label: "Figma",            key: "figmaUrl",     placeholder: "https://figma.com/..." },
    { label: "Domínio",          key: "dominio",      placeholder: "meusite.com" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Infraestrutura rápida */}
      <div>
        <SectionLabel>Infraestrutura</SectionLabel>
        <div className="flex flex-col gap-2 mt-2">
          {infraFields.map(({ label, key, placeholder }) => {
            const val = (meta[key] as string) ?? "";
            return (
              <div key={key} className="flex items-center gap-3 rounded-[12px] bg-[#FAFAFA] px-4 py-2.5">
                <span className="text-[12px] text-base-700 w-[120px] flex-shrink-0">{label}</span>
                {val ? (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <a href={val.startsWith("http") ? val : `https://${val}`} target="_blank" rel="noopener noreferrer"
                      className="text-[12px] font-semibold text-ink-500 hover:underline truncate">{val}</a>
                    <ExternalLink size={11} color="#A9AAA5" className="flex-shrink-0" />
                  </div>
                ) : (
                  <span className="text-[12px] text-sand-600 italic">{placeholder}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Conectores */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionLabel>Conectores ativos</SectionLabel>
          {saving && <span className="text-[11px] text-base-700">Salvando...</span>}
        </div>
        <div className="flex flex-col gap-2">
          {lista.map((c, i) => {
            const Icon = CONECTOR_ICONS[c.tipo] ?? CONECTOR_ICONS.default;
            const sCfg = statusConfig[c.status];
            return (
              <motion.div key={i}
                className="rounded-[14px] border border-[#F0F0EE] bg-white p-4"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 rounded-[12px] bg-base-500 flex items-center justify-center flex-shrink-0">
                    <Icon size={15} color="#5E5E5F" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-ink-500">{c.nome}</p>
                    <span className="text-[10px] text-base-700 uppercase">{c.tipo}</span>
                  </div>
                  <div className="flex gap-1">
                    {(["ativo", "pendente", "inativo"] as const).map((s) => (
                      <motion.button key={s}
                        onClick={() => updateStatus(i, s)}
                        className="rounded-[7px] px-2 py-0.5 text-[10px] font-bold"
                        animate={{
                          backgroundColor: c.status === s ? statusConfig[s].bg : "#FAFAFA",
                          color: c.status === s ? statusConfig[s].cor : "#A9AAA5",
                        }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.15 }}>
                        {statusConfig[s].label}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <input
                  value={c.url ?? ""}
                  onChange={(e) => updateUrl(i, e.target.value)}
                  placeholder="URL ou identificador..."
                  className="h-8 w-full rounded-[8px] border border-transparent bg-[#FAFAFA] px-3 text-[12px] text-ink-500 outline-none placeholder:text-sand-600 focus:border-[#D9D9D4] transition-[border-color] duration-150"
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── TarefasTab ────────────────────────────────────────────────────────────────

function TarefasTab({ tarefas, tarefasConcluidas, onSave }: {
  tarefas: Tarefa[];
  tarefasConcluidas: number;
  onSave: (tarefas: unknown) => Promise<void>;
}) {
  const [lista, setLista] = useState<Tarefa[]>(tarefas);
  const [novaTarefa, setNovaTarefa] = useState("");
  const [novaPrio, setNovaPrio] = useState<Tarefa["prioridade"]>("media");
  const [saving, setSaving] = useState(false);

  const toggleTarefa = async (id: number) => {
    const novaLista = lista.map((t) => t.id === id ? { ...t, concluido: !t.concluido } : t);
    setLista(novaLista);
    setSaving(true);
    await onSave(novaLista);
    setSaving(false);
  };

  const adicionarTarefa = async () => {
    if (!novaTarefa.trim()) return;
    const novaLista = [...lista, { id: Date.now(), titulo: novaTarefa.trim(), concluido: false, prioridade: novaPrio }];
    setLista(novaLista);
    setNovaTarefa("");
    setSaving(true);
    await onSave(novaLista);
    setSaving(false);
  };

  const prioConfig: Record<NonNullable<Tarefa["prioridade"]>, { cor: string; label: string }> = {
    alta:  { cor: "#E53935", label: "Alta" },
    media: { cor: "#FB8C00", label: "Média" },
    baixa: { cor: "#A9AAA5", label: "Baixa" },
  };

  const pendentes = lista.filter(t => !t.concluido);
  const concluidas = lista.filter(t => t.concluido);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <SectionLabel>Tarefas</SectionLabel>
          {lista.length > 0 && (
            <p className="text-[12px] text-base-700 mt-0.5">{tarefasConcluidas} de {lista.length} concluídas</p>
          )}
        </div>
        {saving && <span className="text-[11px] text-base-700">Salvando...</span>}
      </div>

      {/* Pendentes */}
      {pendentes.length > 0 && (
        <div className="flex flex-col gap-1.5 mb-4">
          {pendentes.map((t, i) => {
            const pCfg = t.prioridade ? prioConfig[t.prioridade] : null;
            return (
              <motion.div key={t.id}
                className="flex items-center gap-3 rounded-[12px] bg-[#FAFAFA] px-3 py-2.5 cursor-pointer"
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ backgroundColor: "#F3F3F1" }}
                whileTap={{ scale: 0.99 }}
                onClick={() => toggleTarefa(t.id)}>
                <Square size={16} color="#A9AAA5" className="flex-shrink-0" />
                <span className="text-[13px] font-semibold text-ink-500 flex-1">{t.titulo}</span>
                {pCfg && (
                  <span className="text-[9px] font-bold" style={{ color: pCfg.cor }}>{pCfg.label}</span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Concluídas */}
      {concluidas.length > 0 && (
        <div className="flex flex-col gap-1.5 mb-4">
          <p className="text-[10px] font-bold uppercase text-base-700 mb-1">Concluídas</p>
          {concluidas.map((t, i) => (
            <motion.div key={t.id}
              className="flex items-center gap-3 rounded-[12px] bg-[#E6F4EA] px-3 py-2.5 cursor-pointer"
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ backgroundColor: "#DDF0E0" }}
              whileTap={{ scale: 0.99 }}
              onClick={() => toggleTarefa(t.id)}>
              <CheckCircle2 size={16} color="#43A047" className="flex-shrink-0" />
              <span className="text-[13px] font-semibold text-[#2E7D32] flex-1 line-through">{t.titulo}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Input nova tarefa */}
      <div className="flex gap-2 items-center mt-2">
        <div className="flex gap-1">
          {(["alta", "media", "baixa"] as const).map((p) => (
            <motion.button key={p}
              onClick={() => setNovaPrio(p)}
              className="rounded-[7px] px-2 py-1 text-[10px] font-bold"
              animate={{
                backgroundColor: novaPrio === p ? prioConfig[p].cor + "20" : "#FAFAFA",
                color: novaPrio === p ? prioConfig[p].cor : "#A9AAA5",
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}>
              {prioConfig[p].label}
            </motion.button>
          ))}
        </div>
        <input
          value={novaTarefa}
          onChange={(e) => setNovaTarefa(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && adicionarTarefa()}
          placeholder="Nova tarefa..."
          className="flex-1 h-9 rounded-[12px] border border-transparent bg-base-500 px-3 text-[13px] text-ink-500 outline-none placeholder:text-base-700 focus:border-ink-500 focus:ring-2 focus:ring-ink-500/10 transition-[border-color] duration-150"
        />
        <motion.button onClick={adicionarTarefa} disabled={!novaTarefa.trim()}
          className="h-9 w-9 rounded-[12px] bg-ink-500 flex items-center justify-center disabled:opacity-40"
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Plus size={14} color="#D7FF00" />
        </motion.button>
      </div>
    </div>
  );
}

// ─── EditableTextSection ──────────────────────────────────────────────────────

function EditableTextSection({ title, fieldKey, value, placeholder, onSave }: {
  title: string; fieldKey: string; value: string; placeholder: string;
  onSave: (key: string, value: unknown) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(fieldKey, draft);
    setSaving(false);
    setEditing(false);
    toast.success("Salvo.");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <SectionLabel>{title}</SectionLabel>
        {!editing ? (
          <motion.button onClick={() => setEditing(true)}
            className="flex items-center gap-1 rounded-[8px] bg-base-500 px-2.5 py-1 text-[11px] font-semibold text-ink-400"
            whileHover={{ backgroundColor: "#D9D9D4", color: "#0E0F10", scale: 1.02 }}
            whileTap={{ scale: 0.97 }}>
            <Edit3 size={10} /> Editar
          </motion.button>
        ) : (
          <div className="flex items-center gap-2">
            <motion.button onClick={() => { setEditing(false); setDraft(value); }}
              className="flex items-center gap-1 rounded-[8px] bg-base-500 px-2.5 py-1 text-[11px] font-semibold text-ink-400"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <X size={10} /> Cancelar
            </motion.button>
            <motion.button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1 rounded-[8px] bg-ink-500 px-2.5 py-1 text-[11px] font-semibold text-white"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Save size={10} /> {saving ? "Salvando..." : "Salvar"}
            </motion.button>
          </div>
        )}
      </div>
      <AnimatePresence mode="wait">
        {!editing ? (
          <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}>
            {draft ? (
              <p className="text-[14px] text-ink-500 leading-relaxed whitespace-pre-wrap">{draft}</p>
            ) : (
              <p className="text-[13px] text-base-700 italic">{placeholder}</p>
            )}
          </motion.div>
        ) : (
          <motion.textarea
            key="edit"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            rows={8}
            className="w-full rounded-[12px] border border-transparent bg-base-500 px-4 py-3 text-[14px] text-ink-500 outline-none placeholder:text-base-700 resize-none focus:border-ink-500 focus:ring-2 focus:ring-ink-500/10 transition-[border-color] duration-150"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-bold uppercase tracking-wide text-base-700">{children}</p>;
}

function StatusBadge({ status }: { status: ProjetoStatus }) {
  const p = STATUS_PALETTE[status];
  return (
    <span className="inline-flex items-center gap-1 rounded-[6px] font-bold uppercase tracking-wide flex-shrink-0"
      style={{ backgroundColor: p.bg, color: p.text, fontSize: 10, padding: "3px 9px" }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.dot }} />
      {p.label}
    </span>
  );
}

function HealthBadge({ health, size = "default" }: {
  health: "ok" | "risco" | "critico" | "indefinido";
  size?: "default" | "sm";
}) {
  const cfg: Record<string, { bg: string; text: string; label: string; icon: React.ElementType }> = {
    ok:         { bg: "#E6F4EA", text: "#2E7D32",  label: "Saudável",   icon: Activity },
    risco:      { bg: "#FFF0E0", text: "#A05500",  label: "Em risco",   icon: AlertTriangle },
    critico:    { bg: "#FDECEA", text: "#C62828",  label: "Crítico",    icon: AlertCircle },
    indefinido: { bg: "#F7F7F5", text: "#A9AAA5",  label: "Indefinido", icon: Hash },
  };
  const c = cfg[health];
  const Icon = c.icon;
  const fs = size === "sm" ? 9 : 10;
  const iconSize = size === "sm" ? 9 : 10;
  const pad = size === "sm" ? "2px 7px" : "3px 9px";
  return (
    <span className="inline-flex items-center gap-1 rounded-[6px] font-bold uppercase tracking-wide"
      style={{ backgroundColor: c.bg, color: c.text, fontSize: fs, padding: pad }}>
      <Icon size={iconSize} />
      {c.label}
    </span>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[12px] text-base-700 flex-shrink-0">{label}</span>
      {typeof value === "string"
        ? <span className="text-[13px] font-semibold text-ink-500 capitalize text-right">{value}</span>
        : value
      }
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <Icon size={24} color="#A9AAA5" />
      <p className="text-[13px] text-base-700 max-w-[280px] leading-relaxed">{text}</p>
    </div>
  );
}
