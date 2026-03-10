"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Bot, Brain, Lightbulb, ClipboardList, Link,
  FileText, File, Image, BookMarked, Layers, FolderKanban,
  Users, Cpu, Pencil, RefreshCw, ExternalLink, Paperclip,
  Calendar, Globe, Sparkles, CheckCircle2, AlertCircle,
  LayoutGrid, AlignLeft, Activity, ChevronRight,
} from "lucide-react";
import { SlidingTabs } from "@/components/ui/sliding-tabs";
import type { KnowledgeCard, ItemStatus } from "../actions";

// ─── Configs ──────────────────────────────────────────────────────────────────

const TIPO_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  link:           { label: "Link",           bg: "#E1F4FE", text: "#0277BD", icon: Link },
  arquivo:        { label: "Arquivo",        bg: "#E8F5E9", text: "#2E7D32", icon: File },
  imagem:         { label: "Imagem",         bg: "#EDE7F6", text: "#512DA8", icon: Image },
  documento:      { label: "Documento",      bg: "#FFF8E1", text: "#F57F17", icon: FileText },
  referencia:     { label: "Referência",     bg: "#FCE4EC", text: "#AD1457", icon: BookMarked },
  aprendizado:    { label: "Aprendizado",    bg: "#F3E5F5", text: "#6A1B9A", icon: Brain },
  insight:        { label: "Insight",        bg: "#FFF3E0", text: "#E65100", icon: Lightbulb },
  regra_sugerida: { label: "Regra sugerida", bg: "#E8EAF6", text: "#283593", icon: ClipboardList },
  manual:         { label: "Manual",         bg: "#E0F7FA", text: "#00695C", icon: Layers },
  texto:          { label: "Texto",          bg: "#EEEFE9", text: "#5E5E5F", icon: FileText },
};

const STATUS_CONFIG: Record<ItemStatus, { label: string; bg: string; text: string; dot: string }> = {
  bruto:        { label: "Bruto",        bg: "#EEEFE9", text: "#5E5E5F", dot: "#A9AAA5" },
  processando:  { label: "Processando",  bg: "#FFF8E1", text: "#F57F17", dot: "#F57F17" },
  processado:   { label: "Processado",   bg: "#E8F5E9", text: "#2E7D32", dot: "#2E7D32" },
  revisado:     { label: "Revisado",     bg: "#E1F4FE", text: "#0277BD", dot: "#0277BD" },
  aplicado:     { label: "Aplicado",     bg: "#D7FF00", text: "#0E0F10", dot: "#8AB000" },
  arquivado:    { label: "Arquivado",    bg: "#EEEFE9", text: "#A9AAA5", dot: "#A9AAA5" },
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "visao-geral",    label: "Visão Geral",     icon: LayoutGrid },
  { id: "conteudo-fonte", label: "Conteúdo Fonte",  icon: AlignLeft },
  { id: "aprendizados",   label: "Aprendizados",    icon: Brain },
  { id: "licoes",         label: "Lições",          icon: Lightbulb },
  { id: "aplicacoes",     label: "Aplicações",      icon: Sparkles },
  { id: "arquivos-links", label: "Arquivos & Links", icon: Paperclip },
  { id: "log",            label: "Log",             icon: Activity },
];

// Tabs estratégicas — o coração da feature
const TABS_ESTRATEGICAS = ["aprendizados", "licoes", "aplicacoes"];

// ─── Mock de dados enriquecidos ────────────────────────────────────────────────

const MOCK_APRENDIZADOS: Record<string, string[]> = {
  "mock-1": [
    "A luz natural nas primeiras 2h após o nascer do sol cria sombreamento mais dramático para fashion outdoor.",
    "Ângulos levemente ascendentes (câmera abaixo da cintura) alongam a silhueta e dão sensação de poder.",
    "Ambientes texturizados (paredes, asfalto molhado) amplificam o contraste da peça.",
    "A paleta de cores da roupa deve ter no mínimo 60% de contraste com o fundo.",
    "Expressão do model deve ser neutro-forte, não sorridente, para editorials de alto impacto.",
    "ISO baixo + abertura média (f/4–6) preserva detalhes da textura do tecido em ambientes externos.",
    "A consistência de temperatura de cor entre shots cria unidade visual no editorial.",
  ],
  "mock-4": [
    "Briefings sem referência visual geram 3.2x mais ciclos de revisão.",
    "A ausência de um 'anti-exemplo' (o que não queremos) é o erro mais frequente.",
    "Creators com perfil mais editorial precisam de briefings com direção de fotografia explícita.",
    "Definir paleta de cores no briefing reduz o retrabalho em 60%.",
    "Incluir exemplos de posts aprovados anteriores acelera o alinhamento em 40%.",
  ],
};

const MOCK_LICOES: Record<string, { titulo: string; tipo: "fazer" | "evitar" | "manter" }[]> = {
  "mock-1": [
    { titulo: "Sempre incluir referência de horário de luz no briefing de outdoor", tipo: "fazer" },
    { titulo: "Definir temperatura de cor alvo para o editorial antes da produção", tipo: "fazer" },
    { titulo: "Evitar luz de meio-dia direta em shoots de moda (cria sombras duras indesejadas)", tipo: "evitar" },
    { titulo: "Manter banco de referências de ângulos aprovados por creator", tipo: "manter" },
  ],
  "mock-4": [
    { titulo: "Incluir campo 'referência visual obrigatória' em todo briefing de creator", tipo: "fazer" },
    { titulo: "Adicionar seção 'anti-exemplo' com o que o creator não quer ver", tipo: "fazer" },
    { titulo: "Evitar briefings sem paleta de cores definida", tipo: "evitar" },
    { titulo: "Manter biblioteca de briefings aprovados por tipo de creator", tipo: "manter" },
    { titulo: "Solicitar assinatura de aprovação do briefing antes de iniciar produção", tipo: "fazer" },
    { titulo: "Nunca iniciar sem exemplo de referência de post anterior aprovado", tipo: "evitar" },
  ],
};

const MOCK_APLICACOES: Record<string, {
  projetos: string[];
  creators: string[];
  squads: string[];
  rules: string[];
  memorias: string[];
  acoes: string[];
}> = {
  "mock-1": {
    projetos: ["Creator Ninaah", "Grade de Conteúdo Q1"],
    creators: ["Ninaah", "Layla"],
    squads: ["Audiovisual Squad"],
    rules: ["Regra de iluminação para fashion outdoor", "Padrão de ângulo por tipo de creator"],
    memorias: ["Técnicas de iluminação outdoor aprovadas", "Banco de referências editoriais"],
    acoes: ["Atualizar template de briefing com campos de luz", "Criar biblioteca de referências por creator"],
  },
  "mock-4": {
    projetos: [],
    creators: ["Ninaah", "Layla", "Maria C."],
    squads: ["Audiovisual Squad"],
    rules: ["Checklist de briefing obrigatório", "Template de anti-exemplo"],
    memorias: ["Padrões de erro em briefings", "Histórico de retrabalho por creator"],
    acoes: [
      "Revisar template de briefing com os 5 padrões encontrados",
      "Criar campo 'anti-exemplo' obrigatório no formulário de pedido",
      "Treinar equipe sobre os padrões identificados",
    ],
  },
};

const MOCK_LOG: Record<string, { data: string; evento: string; agente?: string }[]> = {
  "mock-1": [
    { data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), evento: "Item criado por ingestão manual", agente: "Pantcho" },
    { data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(), evento: "Processamento IA iniciado", agente: "Agente IA" },
    { data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 12 * 60 * 1000).toISOString(), evento: "7 aprendizados extraídos", agente: "Agente IA" },
    { data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 13 * 60 * 1000).toISOString(), evento: "4 lições geradas", agente: "Agente IA" },
    { data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(), evento: "2 regras sugeridas", agente: "Agente IA" },
    { data: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), evento: "Vínculo com projeto Creator Ninaah adicionado", agente: "Pantcho" },
    { data: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), evento: "Status alterado para Processado", agente: "Pantcho" },
  ],
  "mock-4": [
    { data: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), evento: "Análise interna criada manualmente", agente: "Pantcho" },
    { data: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 8 * 60 * 1000).toISOString(), evento: "Processamento IA concluído — 5 aprendizados, 6 lições, 3 regras", agente: "Agente IA" },
    { data: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), evento: "Revisão humana concluída", agente: "Pantcho" },
    { data: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), evento: "Regras aplicadas ao template de briefing", agente: "Pantcho" },
    { data: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), evento: "Status alterado para Aplicado", agente: "Pantcho" },
  ],
};

const DEFAULT_LOG = [{ data: new Date().toISOString(), evento: "Item criado", agente: "Sistema" }];

// ─── Componente principal ──────────────────────────────────────────────────────

export default function ConhecimentoItemClient({ item }: { item: KnowledgeCard }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("visao-geral");

  const tipoConf   = TIPO_CONFIG[item.itemTipo ?? "texto"] ?? TIPO_CONFIG.texto;
  const statusConf = STATUS_CONFIG[item.itemStatus ?? "bruto"] ?? STATUS_CONFIG.bruto;
  const TipoIcon   = tipoConf.icon;

  const aprendizados = MOCK_APRENDIZADOS[item.id] ?? [];
  const licoes       = MOCK_LICOES[item.id] ?? [];
  const aplicacoes   = MOCK_APLICACOES[item.id] ?? {
    projetos: item.projetoVinculado ? [item.projetoVinculado] : [],
    creators: item.creatorVinculado ? [item.creatorVinculado] : [],
    squads: [], rules: [], memorias: [], acoes: [],
  };
  const log = MOCK_LOG[item.id] ?? DEFAULT_LOG;

  const temMetricas =
    (item.qtdAprendizados ?? 0) > 0 ||
    (item.qtdLicoes ?? 0) > 0 ||
    (item.qtdRulesSugeridas ?? 0) > 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Voltar */}
      <motion.button
        className="flex items-center gap-1.5 text-[12px] font-semibold text-base-700 w-fit"
        onClick={() => router.push("/conhecimento")}
        whileHover={{ color: "#0E0F10", x: -2 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15 }}
      >
        <ArrowLeft size={13} />
        Conhecimento
      </motion.button>

      {/* Header */}
      <div className="rounded-[24px] bg-white p-6 flex flex-col gap-5">
        {/* Linha topo: badges + ações */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="flex items-center gap-1.5 rounded-[7px] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
              style={{ backgroundColor: tipoConf.bg, color: tipoConf.text }}
            >
              <TipoIcon size={11} />
              {tipoConf.label}
            </span>
            <span className="flex items-center gap-1.5 rounded-[7px] px-2.5 py-1 text-[11px] font-semibold"
              style={{ backgroundColor: statusConf.bg, color: statusConf.text }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusConf.dot }} />
              {statusConf.label}
            </span>
            {item.aiProcessed && (
              <span className="flex items-center gap-1 rounded-[7px] bg-limao-500/20 px-2.5 py-1 text-[10px] font-bold text-[#6B7C00] uppercase">
                <Bot size={10} /> IA
              </span>
            )}
            {item.category && (
              <span className="rounded-[7px] bg-base-500 px-2.5 py-1 text-[11px] font-semibold text-ink-400">
                {item.category}
              </span>
            )}
          </div>
          {/* Ações compactas no canto */}
          <div className="flex items-center gap-1.5 shrink-0">
            <motion.button
              className="flex items-center gap-1.5 rounded-[12px] bg-base-500 px-3 py-1.5 text-[11px] font-semibold text-ink-400"
              whileHover={{ scale: 1.03, backgroundColor: "#D9D9D4" }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
            >
              <motion.span whileHover={{ rotate: 15 }} transition={{ duration: 0.25 }}>
                <Pencil size={11} />
              </motion.span>
              Editar
            </motion.button>
            <motion.button
              className="flex items-center gap-1.5 rounded-[12px] bg-base-500 px-3 py-1.5 text-[11px] font-semibold text-ink-400"
              whileHover={{ scale: 1.03, backgroundColor: "#D9D9D4" }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
            >
              <motion.span whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                <RefreshCw size={11} />
              </motion.span>
              Reprocessar
            </motion.button>
          </div>
        </div>

        {/* Título — hierarquia principal */}
        <div>
          <h1 className="text-[22px] font-bold text-ink-500 leading-snug">{item.title}</h1>
          {/* Meta linha — discreta, abaixo do título */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="flex items-center gap-1 text-[11px] text-base-700">
              <Calendar size={11} />
              {new Date(item.createdAt).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            {item.origem && (
              <span className="flex items-center gap-1 text-[11px] text-base-700">
                <Globe size={11} />
                {item.origem}
              </span>
            )}
            {item.projetoVinculado && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-ink-400">
                <FolderKanban size={11} />
                {item.projetoVinculado}
              </span>
            )}
            {item.creatorVinculado && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-ink-400">
                <Users size={11} />
                {item.creatorVinculado}
              </span>
            )}
          </div>
        </div>

        {/* Métricas estratégicas — destaque explícito */}
        {temMetricas && (
          <div className="grid grid-cols-3 gap-2 pt-1">
            {(item.qtdAprendizados ?? 0) > 0 && (
              <motion.button
                className="flex flex-col gap-1 rounded-[14px] p-3 text-left"
                style={{ backgroundColor: "#F3E5F5" }}
                onClick={() => setActiveTab("aprendizados")}
                whileHover={{ scale: 1.02, backgroundColor: "#EDD9F5" }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
              >
                <div className="flex items-center gap-1.5">
                  <Brain size={13} color="#6A1B9A" />
                  <span className="text-[20px] font-bold leading-none" style={{ color: "#6A1B9A" }}>
                    {item.qtdAprendizados}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-[#8E24AA]">Aprendizados</span>
                <span className="text-[9px] text-[#AB47BC]">Ver na aba →</span>
              </motion.button>
            )}
            {(item.qtdLicoes ?? 0) > 0 && (
              <motion.button
                className="flex flex-col gap-1 rounded-[14px] p-3 text-left"
                style={{ backgroundColor: "#FFF3E0" }}
                onClick={() => setActiveTab("licoes")}
                whileHover={{ scale: 1.02, backgroundColor: "#FFE8CC" }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
              >
                <div className="flex items-center gap-1.5">
                  <Lightbulb size={13} color="#E65100" />
                  <span className="text-[20px] font-bold leading-none" style={{ color: "#E65100" }}>
                    {item.qtdLicoes}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-[#EF6C00]">Lições</span>
                <span className="text-[9px] text-[#FF8A00]">Ver na aba →</span>
              </motion.button>
            )}
            {(item.qtdRulesSugeridas ?? 0) > 0 && (
              <motion.button
                className="flex flex-col gap-1 rounded-[14px] p-3 text-left"
                style={{ backgroundColor: "#E8EAF6" }}
                onClick={() => setActiveTab("aplicacoes")}
                whileHover={{ scale: 1.02, backgroundColor: "#DDE0F5" }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
              >
                <div className="flex items-center gap-1.5">
                  <ClipboardList size={13} color="#283593" />
                  <span className="text-[20px] font-bold leading-none" style={{ color: "#283593" }}>
                    {item.qtdRulesSugeridas}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-[#3949AB]">Regras</span>
                <span className="text-[9px] text-[#5C6BC0]">Ver aplicações →</span>
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Tabs — com indicador visual nas estratégicas */}
      <div className="flex items-center gap-2">
        <SlidingTabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />
        {/* Indicador sutil: "coração da feature" */}
        {!TABS_ESTRATEGICAS.includes(activeTab) && temMetricas && (
          <motion.span
            className="text-[10px] text-base-700 font-semibold hidden sm:block"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            Aprendizados, Lições e Aplicações contêm o valor principal
          </motion.span>
        )}
      </div>

      {/* Conteúdo da tab */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
        >
          {activeTab === "visao-geral"    && <TabVisaoGeral item={item} onNavigate={setActiveTab} aprendizados={aprendizados} licoes={licoes} aplicacoes={aplicacoes} />}
          {activeTab === "conteudo-fonte" && <TabConteudoFonte item={item} />}
          {activeTab === "aprendizados"   && <TabAprendizados aprendizados={aprendizados} item={item} />}
          {activeTab === "licoes"         && <TabLicoes licoes={licoes} item={item} />}
          {activeTab === "aplicacoes"     && <TabAplicacoes aplicacoes={aplicacoes} item={item} />}
          {activeTab === "arquivos-links" && <TabArquivosLinks item={item} />}
          {activeTab === "log"            && <TabLog log={log} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Tab: Visão Geral ──────────────────────────────────────────────────────────

function TabVisaoGeral({
  item,
  onNavigate,
  aprendizados,
  licoes,
  aplicacoes,
}: {
  item: KnowledgeCard;
  onNavigate: (tab: string) => void;
  aprendizados: string[];
  licoes: { titulo: string; tipo: string }[];
  aplicacoes: { projetos: string[]; creators: string[]; squads: string[]; rules: string[]; memorias: string[]; acoes: string[] };
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Coluna principal */}
      <div className="lg:col-span-2 flex flex-col gap-3">

        {/* Resumo — bloco de destaque */}
        <motion.div
          className="rounded-[30px] bg-white p-5"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-base-700 mb-3">Resumo</p>
          <p className="text-[15px] text-ink-500 leading-relaxed font-semibold">
            {item.summary ?? "Sem resumo disponível."}
          </p>
        </motion.div>

        {/* Contexto + Impacto — em grid */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            className="rounded-[30px] bg-white p-4 flex flex-col gap-1.5"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.05 }}
          >
            <p className="text-[9px] font-bold uppercase tracking-widest text-sand-600">Contexto</p>
            <p className="text-[13px] text-ink-400 leading-relaxed">
              Conteúdo processado e classificado automaticamente. Integrado ao acervo de conhecimento da Hubia.
            </p>
          </motion.div>
          <motion.div
            className="rounded-[30px] bg-white p-4 flex flex-col gap-1.5"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.08 }}
          >
            <p className="text-[9px] font-bold uppercase tracking-widest text-sand-600">Impacto esperado</p>
            <p className="text-[13px] text-ink-400 leading-relaxed">
              Gerar aprendizados, lições e regras que melhorem processos futuros na plataforma.
            </p>
          </motion.div>
        </div>

        {/* Preview das tabs estratégicas */}
        {(aprendizados.length > 0 || licoes.length > 0 || aplicacoes.acoes.length > 0) && (
          <motion.div
            className="rounded-[30px] bg-white p-5 flex flex-col gap-3"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.1 }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-base-700">Extrações geradas</p>
            <div className="flex flex-col gap-2">
              {aprendizados.length > 0 && (
                <motion.button
                  className="flex items-center justify-between rounded-[12px] bg-[#F3E5F5]/60 px-4 py-2.5 text-left"
                  onClick={() => onNavigate("aprendizados")}
                  whileHover={{ backgroundColor: "#EDD9F5", scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.12 }}
                >
                  <div className="flex items-center gap-2">
                    <Brain size={13} color="#6A1B9A" />
                    <span className="text-[12px] font-semibold text-[#6A1B9A]">{aprendizados[0]}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#AB47BC] shrink-0 ml-2">
                    +{aprendizados.length - 1} mais
                    <ChevronRight size={10} />
                  </div>
                </motion.button>
              )}
              {licoes.length > 0 && (
                <motion.button
                  className="flex items-center justify-between rounded-[12px] bg-[#FFF3E0]/60 px-4 py-2.5 text-left"
                  onClick={() => onNavigate("licoes")}
                  whileHover={{ backgroundColor: "#FFE8CC", scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.12 }}
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb size={13} color="#E65100" />
                    <span className="text-[12px] font-semibold text-[#EF6C00]">{licoes[0].titulo}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#FF8A00] shrink-0 ml-2">
                    +{licoes.length - 1} mais
                    <ChevronRight size={10} />
                  </div>
                </motion.button>
              )}
              {aplicacoes.acoes.length > 0 && (
                <motion.button
                  className="flex items-center justify-between rounded-[12px] bg-[#E8EAF6]/60 px-4 py-2.5 text-left"
                  onClick={() => onNavigate("aplicacoes")}
                  whileHover={{ backgroundColor: "#DDE0F5", scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.12 }}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles size={13} color="#283593" />
                    <span className="text-[12px] font-semibold text-[#3949AB]">{aplicacoes.acoes[0]}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#5C6BC0] shrink-0 ml-2">
                    +{aplicacoes.acoes.length - 1} ações
                    <ChevronRight size={10} />
                  </div>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Lateral — síntese operacional */}
      <div className="flex flex-col gap-3">
        {/* Informações do item */}
        <motion.div
          className="rounded-[30px] bg-white p-4 flex flex-col gap-3"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.06 }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-base-700">Informações</p>
          <div className="flex flex-col gap-2">
            {[
              { label: "Categoria",  value: item.category ?? "—" },
              { label: "Origem",     value: item.origem ?? "—" },
              { label: "Adicionado", value: new Date(item.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-baseline justify-between gap-2">
                <span className="text-[10px] text-base-700 shrink-0">{label}</span>
                <span className="text-[12px] font-semibold text-ink-500 text-right truncate">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Vínculos */}
        <motion.div
          className="rounded-[30px] bg-white p-4 flex flex-col gap-3"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.1 }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-base-700">Vínculos</p>
          {item.projetoVinculado ? (
            <div className="flex items-center gap-2 rounded-[12px] bg-base-500 px-3 py-2">
              <FolderKanban size={12} color="#5E5E5F" />
              <span className="text-[12px] font-semibold text-ink-500">{item.projetoVinculado}</span>
            </div>
          ) : null}
          {item.creatorVinculado ? (
            <div className="flex items-center gap-2 rounded-[12px] bg-base-500 px-3 py-2">
              <Users size={12} color="#5E5E5F" />
              <span className="text-[12px] font-semibold text-ink-500">{item.creatorVinculado}</span>
            </div>
          ) : null}
          {!item.projetoVinculado && !item.creatorVinculado && (
            <p className="text-[11px] text-base-700">Nenhum vínculo registrado.</p>
          )}
        </motion.div>

        {/* Tags */}
        {item.tags.length > 0 && (
          <motion.div
            className="rounded-[30px] bg-white p-4 flex flex-col gap-2.5"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.14 }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-base-700">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span key={tag} className="rounded-[9999px] bg-base-500 px-2.5 py-1 text-[10px] font-semibold text-ink-400">
                  #{tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Se há link externo, mostrá-lo */}
        {item.sourceUrl && (
          <motion.div
            className="rounded-[30px] bg-white p-4 flex flex-col gap-2"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.18 }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-base-700">Fonte original</p>
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-[12px] bg-base-500 px-3 py-2 hover:bg-[#D9D9D4] transition-colors duration-150"
            >
              <ExternalLink size={12} color="#5E5E5F" />
              <span className="text-[11px] font-semibold text-ink-500 truncate">{item.sourceUrl}</span>
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Conteúdo Fonte ───────────────────────────────────────────────────────

function TabConteudoFonte({ item }: { item: KnowledgeCard }) {
  return (
    <div className="flex flex-col gap-3">
      {item.sourceUrl && (
        <motion.div
          className="rounded-[30px] bg-white p-5 flex flex-col gap-3"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-base-700">Link Original</p>
          <a href={item.sourceUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 text-[14px] text-ink-500 font-semibold hover:underline break-all">
            <ExternalLink size={14} />
            {item.sourceUrl}
          </a>
        </motion.div>
      )}
      <motion.div
        className="rounded-[30px] bg-white p-5 flex flex-col gap-3"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.05 }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-base-700">Texto Original</p>
        <p className="text-[14px] text-ink-400 leading-relaxed whitespace-pre-wrap">
          {item.summary ?? "Conteúdo não disponível para visualização direta."}
        </p>
      </motion.div>
      {item.fileUrl && (
        <motion.div
          className="rounded-[30px] bg-white p-5 flex flex-col gap-3"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.1 }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-base-700">Arquivo Associado</p>
          <div className="flex items-center gap-3 rounded-[12px] bg-base-500 p-3">
            <File size={18} color="#5E5E5F" />
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-ink-500">{item.fileUrl.split("/").pop()}</p>
              <p className="text-[11px] text-base-700">Arquivo anexado</p>
            </div>
            <motion.a href={item.fileUrl} target="_blank" rel="noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white"
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <ExternalLink size={12} color="#5E5E5F" />
            </motion.a>
          </div>
        </motion.div>
      )}
      {item.origem && (
        <motion.div
          className="rounded-[30px] bg-white p-5 flex flex-col gap-2"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.15 }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-base-700">Fonte de Origem</p>
          <div className="flex items-center gap-2">
            <Globe size={13} color="#A9AAA5" />
            <span className="text-[13px] text-ink-500">{item.origem}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Tab: Aprendizados ─────────────────────────────────────────────────────────

function TabAprendizados({ aprendizados, item }: { aprendizados: string[]; item: KnowledgeCard }) {
  if (aprendizados.length === 0) {
    return (
      <div className="rounded-[30px] bg-white p-10 flex flex-col items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#F3E5F5]">
          <Brain size={20} color="#6A1B9A" />
        </div>
        <p className="text-[13px] text-base-700">
          {item.itemStatus === "bruto" ? "Este item ainda não foi processado pela IA." : "Nenhum aprendizado extraído."}
        </p>
        {item.itemStatus === "bruto" && (
          <motion.button
            className="flex items-center gap-2 rounded-[14px] bg-limao-500 px-4 py-2.5 text-[13px] font-semibold text-ink-500"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Sparkles size={13} /> Processar com IA
          </motion.button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header da aba com contexto */}
      <div className="flex items-center gap-2 rounded-[16px] bg-[#F3E5F5]/50 px-4 py-3">
        <Brain size={15} color="#6A1B9A" />
        <div>
          <p className="text-[13px] font-bold text-[#6A1B9A]">{aprendizados.length} aprendizados extraídos</p>
          <p className="text-[10px] text-[#AB47BC]">Gerados automaticamente pela IA ao processar este item</p>
        </div>
      </div>
      {aprendizados.map((a, i) => (
        <motion.div
          key={i}
          className="rounded-[16px] bg-white p-4 flex items-start gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0, 0, 0.2, 1], delay: i * 0.04 }}
        >
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F3E5F5] mt-0.5">
            <span className="text-[9px] font-bold" style={{ color: "#6A1B9A" }}>{i + 1}</span>
          </div>
          <p className="text-[13px] text-ink-500 leading-relaxed">{a}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Tab: Lições ───────────────────────────────────────────────────────────────

function TabLicoes({ licoes, item }: { licoes: { titulo: string; tipo: "fazer" | "evitar" | "manter" }[]; item: KnowledgeCard }) {
  const licaoConfig = {
    fazer:  { label: "Fazer",  bg: "#E8F5E9", text: "#2E7D32", headerBg: "#E8F5E9", icon: CheckCircle2 },
    evitar: { label: "Evitar", bg: "#FFEBEE", text: "#C62828", headerBg: "#FFEBEE", icon: AlertCircle },
    manter: { label: "Manter", bg: "#E1F4FE", text: "#0277BD", headerBg: "#E1F4FE", icon: CheckCircle2 },
  };

  if (licoes.length === 0) {
    return (
      <div className="rounded-[30px] bg-white p-10 flex flex-col items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#FFF3E0]">
          <Lightbulb size={20} color="#E65100" />
        </div>
        <p className="text-[13px] text-base-700">Nenhuma lição gerada para este item ainda.</p>
      </div>
    );
  }

  const grupos = {
    fazer:  licoes.filter((l) => l.tipo === "fazer"),
    evitar: licoes.filter((l) => l.tipo === "evitar"),
    manter: licoes.filter((l) => l.tipo === "manter"),
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header da aba */}
      <div className="flex items-center gap-2 rounded-[16px] bg-[#FFF3E0]/50 px-4 py-3">
        <Lightbulb size={15} color="#E65100" />
        <div>
          <p className="text-[13px] font-bold text-[#E65100]">{licoes.length} lições práticas</p>
          <p className="text-[10px] text-[#FF8A00]">Aplicações práticas extraídas do conhecimento deste item</p>
        </div>
      </div>
      {(Object.entries(grupos) as [keyof typeof grupos, typeof licoes][])
        .filter(([, grupo]) => grupo.length > 0)
        .map(([tipo, grupo], gi) => {
          const conf = licaoConfig[tipo];
          const Icon = conf.icon;
          return (
            <motion.div
              key={tipo}
              className="flex flex-col gap-2"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0, 0, 0.2, 1], delay: gi * 0.07 }}
            >
              <div className="flex items-center gap-2 px-1">
                <span
                  className="flex items-center gap-1.5 rounded-[7px] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                  style={{ backgroundColor: conf.bg, color: conf.text }}
                >
                  <Icon size={10} />
                  {conf.label}
                </span>
                <span className="text-[10px] text-base-700">{grupo.length} {grupo.length === 1 ? "item" : "itens"}</span>
              </div>
              {grupo.map((l, i) => (
                <div key={i} className="rounded-[14px] bg-white p-3.5 flex items-start gap-3">
                  <div
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-0.5"
                    style={{ backgroundColor: conf.bg }}
                  >
                    <Icon size={10} style={{ color: conf.text }} />
                  </div>
                  <p className="text-[13px] text-ink-500 leading-relaxed">{l.titulo}</p>
                </div>
              ))}
            </motion.div>
          );
        })}
    </div>
  );
}

// ─── Tab: Aplicações ──────────────────────────────────────────────────────────

function TabAplicacoes({ aplicacoes, item }: {
  aplicacoes: {
    projetos: string[]; creators: string[]; squads: string[];
    rules: string[]; memorias: string[]; acoes: string[];
  };
  item: KnowledgeCard;
}) {
  const secoes = [
    { label: "Ações recomendadas",  items: aplicacoes.acoes,    icon: Sparkles,     cor: "#E65100",  bg: "#FFF3E0" },
    { label: "Regras sugeridas",    items: aplicacoes.rules,    icon: ClipboardList, cor: "#283593",  bg: "#E8EAF6" },
    { label: "Memórias geradas",    items: aplicacoes.memorias, icon: Brain,         cor: "#6A1B9A",  bg: "#F3E5F5" },
    { label: "Projetos impactados", items: aplicacoes.projetos, icon: FolderKanban,  cor: "#5E5E5F",  bg: "#EEEFE9" },
    { label: "Creators impactados", items: aplicacoes.creators, icon: Users,         cor: "#5E5E5F",  bg: "#EEEFE9" },
    { label: "Squads impactados",   items: aplicacoes.squads,   icon: Cpu,           cor: "#5E5E5F",  bg: "#EEEFE9" },
  ].filter((s) => s.items.length > 0);

  if (secoes.length === 0) {
    return (
      <div className="rounded-[30px] bg-white p-10 flex flex-col items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#E8EAF6]">
          <Sparkles size={20} color="#283593" />
        </div>
        <p className="text-[13px] text-base-700">Nenhuma aplicação registrada para este item.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2 rounded-[16px] bg-[#E8EAF6]/50 px-4 py-3">
        <Sparkles size={15} color="#283593" />
        <div>
          <p className="text-[13px] font-bold text-[#283593]">Impacto no sistema</p>
          <p className="text-[10px] text-[#5C6BC0]">Como este conhecimento propaga para outros módulos da Hubia</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {secoes.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              className="rounded-[18px] bg-white p-4 flex flex-col gap-2.5"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0, 0, 0.2, 1], delay: i * 0.05 }}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-[6px]" style={{ backgroundColor: s.bg }}>
                  <Icon size={12} style={{ color: s.cor }} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide text-base-700">{s.label}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {s.items.map((it, j) => (
                  <span key={j} className="text-[12px] text-ink-500 leading-snug font-semibold">{it}</span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab: Arquivos & Links ────────────────────────────────────────────────────

function TabArquivosLinks({ item }: { item: KnowledgeCard }) {
  const hasContent = item.fileUrl || item.sourceUrl || item.temAnexos || item.temLinks;
  if (!hasContent) {
    return (
      <div className="rounded-[30px] bg-white p-10 flex flex-col items-center gap-3">
        <Paperclip size={22} color="#A9AAA5" />
        <p className="text-[13px] text-base-700">Nenhum arquivo ou link associado.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {item.sourceUrl && (
        <motion.div className="rounded-[30px] bg-white p-5 flex flex-col gap-3"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-base-700">Links Externos</p>
          <a href={item.sourceUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 rounded-[12px] bg-base-500 p-3 hover:bg-[#D9D9D4] transition-colors duration-150">
            <ExternalLink size={14} color="#5E5E5F" />
            <span className="text-[13px] font-semibold text-ink-500 flex-1 truncate">{item.sourceUrl}</span>
          </a>
        </motion.div>
      )}
      {item.fileUrl && (
        <motion.div className="rounded-[30px] bg-white p-5 flex flex-col gap-3"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.05 }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-base-700">Documentos & Arquivos</p>
          <div className="flex items-center gap-3 rounded-[12px] bg-base-500 p-3">
            <File size={18} color="#5E5E5F" />
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-ink-500">{item.fileUrl.split("/").pop()}</p>
              <p className="text-[11px] text-base-700">Arquivo anexado</p>
            </div>
            <motion.a href={item.fileUrl} target="_blank" rel="noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white"
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <ExternalLink size={12} color="#5E5E5F" />
            </motion.a>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Tab: Log ─────────────────────────────────────────────────────────────────

function TabLog({ log }: { log: { data: string; evento: string; agente?: string }[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[11px] text-base-700 mb-0.5">{log.length} eventos registrados</p>
      {[...log].reverse().map((entry, i) => (
        <motion.div
          key={i}
          className="rounded-[14px] bg-white p-3.5 flex items-start gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0, 0, 0.2, 1], delay: i * 0.04 }}
        >
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-base-500 mt-0.5">
            <Activity size={9} color="#A9AAA5" />
          </div>
          <div className="flex-1">
            <p className="text-[12px] text-ink-500 font-semibold">{entry.evento}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-base-700">
                {new Date(entry.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                {" · "}
                {new Date(entry.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </span>
              {entry.agente && (
                <span className="text-[10px] text-base-700">· {entry.agente}</span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
