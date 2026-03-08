"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, RefreshCw, RotateCcw } from "lucide-react";

type EntityVersion = {
  id: string;
  entityType: string;
  entityId: string;
  version: number;
  data: Record<string, unknown>;
  changedBy: string | null;
  createdAt: string;
};

type Tab = "working" | "decisoes" | "licoes" | "regras" | "changelog";

const TABS: { id: Tab; label: string }[] = [
  { id: "working", label: "Working" },
  { id: "decisoes", label: "Decisões" },
  { id: "licoes", label: "Lições" },
  { id: "regras", label: "Regras" },
  { id: "changelog", label: "Changelog" },
];

// Conteúdo estático espelhando os arquivos de memória reais do sistema
const WORKING_CONTENT = `# WORKING.md — Estado Atual

## Projeto Ativo
Hubia — Plataforma SaaS completa. Todas as páginas construídas.

## Tarefas
- [x] Schema Prisma Fase 2 (Pedidos, Conhecimento, Gatilhos)
- [x] Webhook Telegram/API
- [x] Pedidos (Kanban + Calendário + Lista)
- [x] Calendário integrado em Pedidos
- [x] Projetos com PRD e progresso
- [x] Relatório com KPIs animados
- [x] Conhecimento (biblioteca categorizada)
- [x] Memória (5 tabs)
- [x] Arquitetura (diagrama + RUCs)
- [x] Config (Segurança + API Keys)
- [ ] Configurar API Keys (OpenAI / Gemini / Claude)
- [ ] Supabase Storage buckets
- [ ] Bot Telegram + Webhook Secret

## Próximos Passos
1. Pantcho configura API keys e buckets
2. Testar fluxo completo: Telegram → Pedido → Calendário
3. Ativar processamento IA no Conhecimento`;

const DECISOES = [
  { titulo: "Google Login único", desc: "Simplicidade de onboarding · Google OAuth via Supabase", data: "2026-02-15" },
  { titulo: "Sidebar sem subitens aninhados", desc: "Navegação interna via tabs · Flat e rápido", data: "2026-02-20" },
  { titulo: "Framer Motion obrigatório", desc: "Zero CSS keyframes em componentes React · Tudo via FM", data: "2026-02-22" },
  { titulo: "Flat design absoluto", desc: "Zero box-shadow em UI · Separação por cor de fundo", data: "2026-02-22" },
  { titulo: "Prisma 7 + Supabase Pooler", desc: "datasource via prisma.config.ts · directUrl para push", data: "2026-03-07" },
  { titulo: "metadata JSON em Projeto", desc: "squad, progresso, figmaUrl, referencias sem migration", data: "2026-03-08" },
];

const LICOES = [
  { titulo: "Framer Motion: animate vs style", desc: "Nunca usar style={{ background: condicional }} em motion.* com whileHover — usa animate={{ backgroundColor }}. Congelava após primeiro hover.", data: "2026-03-07" },
  { titulo: "Prisma 7 quebra datasource no schema", desc: "url/directUrl devem estar no prisma.config.ts, não no schema.prisma. Erro P1012.", data: "2026-03-08" },
  { titulo: "HubiaPortal é obrigatório em modais", desc: "Sem ele, backdrop-filter fica limitado ao ancestral com transform criado pelo FM.", data: "2026-03-07" },
  { titulo: "SlidingTabs usa activeId, não activeTab", desc: "Prop name é activeId e onChange, não activeTab/onTabChange.", data: "2026-03-08" },
];

const REGRAS = [
  { codigo: "RUC-01", desc: "organization_id em todas as queries — sem exceção" },
  { codigo: "RUC-02", desc: "API keys sempre criptografadas — nunca plaintext" },
  { codigo: "RUC-03", desc: "RLS ativo em todas as tabelas de negócio no Supabase" },
  { codigo: "RUC-04", desc: "Gatilhos disparam em pedido.criado e status_alterado" },
  { codigo: "RUC-05", desc: "ActivityLog registra toda ação crítica do sistema" },
  { codigo: "RUC-06", desc: "Modais: HubiaPortal + 3 camadas + AnimatePresence" },
  { codigo: "RUC-07", desc: "Framer Motion para todo componente React animado" },
  { codigo: "RUC-08", desc: "Auto-draft em localStorage para formulários" },
  { codigo: "RUC-09", desc: "Cards sempre com stagger delay: Math.min(i * 0.06, 0.3)" },
  { codigo: "RUC-10", desc: "Fonte exclusiva: Urbanist · Zero Inter/Roboto/Arial" },
];

export default function MemoriaClient({
  organizationId,
  entityVersions,
}: {
  organizationId: string;
  entityVersions: EntityVersion[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("working");

  // Pill horizontal
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pillLeft, setPillLeft] = useState(0);
  const [pillWidth, setPillWidth] = useState(0);

  useEffect(() => {
    const idx = TABS.findIndex((t) => t.id === activeTab);
    const el = tabRefs.current[idx];
    const container = containerRef.current;
    if (!el || !container) return;
    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    setPillLeft(eRect.left - cRect.left);
    setPillWidth(eRect.width);
  }, [activeTab]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold text-[#0E0F10]">Memória</h1>
        <motion.button
          className="flex items-center gap-2 rounded-[18px] bg-[#D7FF00] px-4 py-3 text-[14px] font-semibold text-[#0E0F10]"
          initial="rest" animate="rest" whileHover="hovered" whileTap={{ scale: 0.96 }}
          variants={{ rest: { scale: 1, backgroundColor: "#D7FF00" }, hovered: { scale: 1.03, backgroundColor: "#DFFF33" } }}
          transition={{ duration: 0.15 }}
          onClick={() => {}}
        >
          <motion.span variants={{ rest: { rotate: 0 }, hovered: { rotate: 360 } }} transition={{ duration: 0.5 }}>
            <Github size={15} />
          </motion.span>
          Sincronizar GitHub
        </motion.button>
      </div>

      {/* Tabs pill */}
      <div
        ref={containerRef}
        className="relative inline-flex items-center rounded-[14px] bg-white p-1 w-fit"
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute rounded-[9999px] bg-[#0E0F10]"
          animate={{ left: pillLeft, width: pillWidth }}
          transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.8 }}
          style={{ top: 4, bottom: 4 }}
        />
        {TABS.map((tab, idx) => {
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              ref={(el) => { tabRefs.current[idx] = el; }}
              onClick={() => setActiveTab(tab.id)}
              className="relative z-10 rounded-[9999px] px-4 py-2 text-[13px] font-semibold"
              animate={{ color: isActive ? "#FFFFFF" : "#A9AAA5" }}
              initial={false}
              whileHover={!isActive ? { backgroundColor: "rgba(213,210,201,0.3)" } : {}}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15 }}
            >
              {tab.label}
            </motion.button>
          );
        })}
      </div>

      {/* Conteúdo */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
        >
          {activeTab === "working" && (
            <div className="rounded-[16px] bg-[#0E0F10] p-6">
              <pre className="text-[12px] text-white/80 font-mono whitespace-pre-wrap leading-relaxed">
                {WORKING_CONTENT}
              </pre>
            </div>
          )}

          {activeTab === "decisoes" && (
            <div className="flex flex-col gap-2">
              {DECISOES.map((d, i) => (
                <motion.div
                  key={d.titulo}
                  className="rounded-[14px] bg-white p-4 flex flex-col gap-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] font-bold text-[#0E0F10]">{d.titulo}</p>
                    <span className="text-[11px] text-[#A9AAA5]">{d.data}</span>
                  </div>
                  <p className="text-[12px] text-[#5E5E5F]">{d.desc}</p>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === "licoes" && (
            <div className="flex flex-col gap-2">
              {LICOES.map((l, i) => (
                <motion.div
                  key={l.titulo}
                  className="rounded-[14px] bg-white p-4 flex flex-col gap-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] font-bold text-[#0E0F10]">{l.titulo}</p>
                    <span className="text-[11px] text-[#A9AAA5]">{l.data}</span>
                  </div>
                  <p className="text-[12px] text-[#5E5E5F]">{l.desc}</p>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === "regras" && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {REGRAS.map((r, i) => (
                <motion.div
                  key={r.codigo}
                  className="flex items-start gap-3 rounded-[12px] bg-white px-4 py-3"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <span className="rounded-[5px] bg-[#D7FF00] px-1.5 py-0.5 text-[9px] font-bold text-[#0E0F10] flex-shrink-0 mt-0.5">
                    {r.codigo}
                  </span>
                  <span className="text-[12px] text-[#5E5E5F]">{r.desc}</span>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === "changelog" && (
            <div className="rounded-[16px] bg-white overflow-hidden">
              {/* Header da tabela */}
              <div className="grid grid-cols-[140px_80px_1fr_120px] gap-4 px-5 py-3 border-b border-[#EEEFE9]">
                {["DATA/HORA", "VERSÃO", "MUDANÇA", "AGENTE"].map((h) => (
                  <span key={h} className="text-[10px] font-bold uppercase tracking-wide text-[#A9AAA5]">{h}</span>
                ))}
              </div>
              {entityVersions.length === 0 ? (
                // Registros estáticos enquanto EntityVersion não tem dados reais
                [
                  { data: "2026-03-08 05:00", versao: "v2.0", mudanca: "Plataforma completa — todas as páginas construídas", agente: "Dev Squad" },
                  { data: "2026-03-07 22:00", versao: "v1.5", mudanca: "Creators + Agentes + Config concluídos", agente: "Dev Squad" },
                  { data: "2026-03-07 14:23", versao: "v1.0", mudanca: "Scaffold Next.js + Auth + Dashboard inicial", agente: "Orquestrador" },
                ].map((row, i) => (
                  <motion.div
                    key={row.data}
                    className="grid grid-cols-[140px_80px_1fr_120px] gap-4 px-5 py-3.5 border-b border-[#EEEFE9] last:border-b-0"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ backgroundColor: "#FAFAFA" }}
                  >
                    <span className="text-[12px] text-[#A9AAA5] font-mono">{row.data}</span>
                    <span className="text-[12px] font-bold text-[#0E0F10]">{row.versao}</span>
                    <span className="text-[12px] text-[#0E0F10]">{row.mudanca}</span>
                    <span className="text-[12px] text-[#A9AAA5]">{row.agente}</span>
                  </motion.div>
                ))
              ) : (
                entityVersions.slice(0, 20).map((v, i) => (
                  <motion.div
                    key={v.id}
                    className="grid grid-cols-[140px_80px_1fr_120px] gap-4 px-5 py-3.5 border-b border-[#EEEFE9] last:border-b-0"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ backgroundColor: "#FAFAFA" }}
                  >
                    <span className="text-[12px] text-[#A9AAA5] font-mono">
                      {new Date(v.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="text-[12px] font-bold text-[#0E0F10]">v{v.version}</span>
                    <span className="text-[12px] text-[#0E0F10] capitalize">{v.entityType}</span>
                    <span className="text-[12px] text-[#A9AAA5] truncate">{v.changedBy ?? "Sistema"}</span>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
