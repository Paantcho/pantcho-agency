"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  Download,
  CheckCircle2,
  Clock,
  Server,
  GitBranch,
  Activity,
  Package,
  FileText,
  Loader2,
  Info,
} from "lucide-react";

type TipoSnapshot =
  | "completo"
  | "creators"
  | "agentes"
  | "projetos"
  | "configuracoes";

type Snapshot = {
  id: string;
  tipo: TipoSnapshot;
  tamanho: string;
  usuario: string;
  criadoEm: string;
};

const tiposSnapshot: {
  id: TipoSnapshot;
  label: string;
  descricao: string;
  icon: React.ElementType;
  inclui: string[];
}[] = [
  {
    id: "completo",
    label: "Snapshot completo",
    descricao: "Exportação total da organização",
    icon: Database,
    inclui: [
      "Memória da plataforma",
      "Agentes e Squads",
      "Creators",
      "Projetos e Pedidos",
      "Configurações",
      "Logs de atividade",
    ],
  },
  {
    id: "creators",
    label: "Creators",
    descricao: "Perfis, aparência, voz e ambientes",
    icon: Package,
    inclui: ["Perfis de creator", "Aparência e looks", "Tom de voz", "Ambientes"],
  },
  {
    id: "agentes",
    label: "Agentes & Squads",
    descricao: "Configurações dos agentes e squads",
    icon: Activity,
    inclui: ["Agentes e system prompts", "Squads e vínculos", "Skills"],
  },
  {
    id: "projetos",
    label: "Projetos & Pedidos",
    descricao: "Histórico completo de produção",
    icon: FileText,
    inclui: ["Projetos com subprojetos", "Pedidos e briefings", "Prompts gerados"],
  },
  {
    id: "configuracoes",
    label: "Configurações",
    descricao: "Plano, branding e integrações",
    icon: GitBranch,
    inclui: ["Branding da org", "Integrações configuradas", "Permissões da equipe"],
  },
];

const historicoMock: Snapshot[] = [
  {
    id: "1",
    tipo: "completo",
    tamanho: "2.4 MB",
    usuario: "admin",
    criadoEm: "08/03/2026 às 14:22",
  },
  {
    id: "2",
    tipo: "creators",
    tamanho: "840 KB",
    usuario: "admin",
    criadoEm: "01/03/2026 às 09:10",
  },
  {
    id: "3",
    tipo: "agentes",
    tamanho: "312 KB",
    usuario: "admin",
    criadoEm: "22/02/2026 às 16:45",
  },
];

const tipoLabel: Record<TipoSnapshot, string> = {
  completo: "Snapshot completo",
  creators: "Creators",
  agentes: "Agentes & Squads",
  projetos: "Projetos & Pedidos",
  configuracoes: "Configurações",
};

export default function DadosClient() {
  const [selecionado, setSelecionado] = useState<TipoSnapshot>("completo");
  const [gerando, setGerando] = useState(false);
  const [historico, setHistorico] = useState<Snapshot[]>(historicoMock);
  const [gerado, setGerado] = useState(false);

  async function handleGerar() {
    setGerando(true);
    setGerado(false);
    await new Promise((r) => setTimeout(r, 1800));
    const novoSnapshot: Snapshot = {
      id: Date.now().toString(),
      tipo: selecionado,
      tamanho: selecionado === "completo" ? "2.6 MB" : "560 KB",
      usuario: "admin",
      criadoEm: new Date().toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setHistorico((prev) => [novoSnapshot, ...prev]);
    setGerando(false);
    setGerado(true);
    setTimeout(() => setGerado(false), 3000);
  }

  const tipoAtual = tiposSnapshot.find((t) => t.id === selecionado)!;

  return (
    <div className="flex flex-col gap-6">
      {/* Gerar snapshot */}
      <div className="rounded-[30px] bg-white p-6">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-ink-500">
            <Download size={15} color="var(--hubia-limao-500)" />
          </div>
          <h2 className="text-[15px] font-bold text-ink-500">
            Exportar snapshot
          </h2>
        </div>

        <div className="flex flex-col gap-5">
          {/* Seleção do tipo */}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {tiposSnapshot.map((t, i) => {
              const Icon = t.icon;
              const isAtivo = selecionado === t.id;
              return (
                <motion.button
                  key={t.id}
                  type="button"
                  onClick={() => setSelecionado(t.id)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.06, 0.3) }}
                  className="flex items-start gap-3 rounded-[14px] p-4 text-left"
                  style={{
                    backgroundColor: isAtivo ? "var(--hubia-ink-500)" : "var(--hubia-bg-base-500)",
                    border: isAtivo ? "2px solid var(--hubia-ink-500)" : "2px solid transparent",
                  }}
                  whileHover={!isAtivo ? { backgroundColor: "rgba(213,210,201,0.6)" } : undefined}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px]"
                    style={{
                      backgroundColor: isAtivo ? "var(--hubia-limao-500)" : "var(--hubia-ink-500)",
                    }}
                  >
                    <Icon size={15} color={isAtivo ? "var(--hubia-ink-500)" : "var(--hubia-limao-500)"} />
                  </div>
                  <div>
                    <p
                      className="text-[13px] font-bold"
                      style={{ color: isAtivo ? "#FFFFFF" : "var(--hubia-ink-500)" }}
                    >
                      {t.label}
                    </p>
                    <p
                      className="mt-0.5 text-[11px]"
                      style={{ color: isAtivo ? "rgba(255,255,255,0.5)" : "var(--hubia-bg-base-700)" }}
                    >
                      {t.descricao}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* O que está incluído */}
          <div className="rounded-[12px] bg-base-500 p-4">
            <p className="mb-2 text-[12px] font-bold text-ink-400 uppercase tracking-wide">
              Inclui
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-1.5">
              {tipoAtual.inclui.map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} color="#43A047" />
                  <span className="text-[12px] font-semibold text-ink-500">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Botão gerar */}
          <div className="flex items-center gap-3">
            <motion.button
              type="button"
              onClick={handleGerar}
              disabled={gerando}
              className="flex items-center gap-2 rounded-[18px] bg-limao-500 px-6 py-3 text-[15px] font-semibold text-ink-500 disabled:opacity-50"
              whileHover={{ scale: 1.03, backgroundColor: "#DFFF33" }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
            >
              {gerando ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Gerando…
                </>
              ) : (
                <>
                  <Download size={16} />
                  Gerar e baixar
                </>
              )}
            </motion.button>

            <AnimatePresence>
              {gerado && (
                <motion.div
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }}
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-[#43A047]"
                >
                  <CheckCircle2 size={14} />
                  Snapshot gerado e registrado
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Histórico de backups */}
      <div className="rounded-[30px] bg-white p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-ink-500">
            <Clock size={15} color="var(--hubia-limao-500)" />
          </div>
          <h2 className="text-[15px] font-bold text-ink-500">
            Histórico de backups
          </h2>
        </div>

        {historico.length === 0 ? (
          <div className="rounded-[12px] border-2 border-dashed border-sand-600 p-8 text-center">
            <Database size={20} color="var(--hubia-bg-base-700)" className="mx-auto mb-2" />
            <p className="text-[13px] text-base-700">Nenhum snapshot gerado ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {historico.map((snap, i) => (
              <motion.div
                key={snap.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
                className="flex items-center gap-4 rounded-[12px] bg-base-500 px-4 py-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-ink-500">
                  <Database size={14} color="var(--hubia-limao-500)" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-ink-500">
                    {tipoLabel[snap.tipo]}
                  </p>
                  <p className="text-[11px] text-base-700">
                    {snap.criadoEm} · por {snap.usuario} · {snap.tamanho}
                  </p>
                </div>
                <motion.button
                  className="flex items-center gap-1.5 rounded-[8px] bg-ink-500 px-3 py-1.5 text-[11px] font-bold text-white"
                  whileHover={{ backgroundColor: "#2a2b2c", scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.12 }}
                >
                  <Download size={11} />
                  Baixar
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Informações do sistema */}
      <div className="rounded-[30px] bg-white p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-ink-500">
            <Server size={15} color="var(--hubia-limao-500)" />
          </div>
          <h2 className="text-[15px] font-bold text-ink-500">
            Informações do sistema
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {[
            { label: "Versão da plataforma", valor: "Hubia v1.0.0", status: "ok" },
            { label: "Framework", valor: "Next.js 15", status: "ok" },
            { label: "Banco de dados", valor: "PostgreSQL via Supabase", status: "ok" },
            { label: "Ambiente", valor: process.env.NODE_ENV ?? "production", status: "ok" },
            { label: "ORM", valor: "Prisma 7", status: "ok" },
            { label: "Deploy", valor: "Vercel", status: "ok" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
              className="flex items-center justify-between rounded-[12px] bg-base-500 px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <Info size={13} className="text-base-700" />
                <span className="text-[13px] font-semibold text-ink-500">
                  {item.label}
                </span>
              </div>
              <span className="text-[12px] font-semibold text-ink-400">
                {item.valor}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
