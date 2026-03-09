"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plug,
  Plus,
  ChevronRight,
  Key,
  ExternalLink,
} from "lucide-react";

type StatusIntegracao = "ativo" | "desconectado" | "erro";

type Integracao = {
  id: string;
  nome: string;
  descricao: string;
  logo: string;
  categoria: "desenvolvimento" | "ia" | "comunicacao" | "infraestrutura";
  status: StatusIntegracao;
  detalhe?: string;
  docs?: string;
};

const categorias: { id: Integracao["categoria"]; label: string }[] = [
  { id: "ia", label: "Inteligência Artificial" },
  { id: "desenvolvimento", label: "Desenvolvimento" },
  { id: "comunicacao", label: "Comunicação" },
  { id: "infraestrutura", label: "Infraestrutura" },
];

const integracoes: Integracao[] = [
  {
    id: "openai",
    nome: "OpenAI",
    descricao: "GPT-4o, DALL·E, Whisper e outros modelos da OpenAI",
    logo: "O",
    categoria: "ia",
    status: "desconectado",
    docs: "https://platform.openai.com",
  },
  {
    id: "anthropic",
    nome: "Anthropic",
    descricao: "Claude 3.5 Sonnet, Haiku e Opus para agentes avançados",
    logo: "A",
    categoria: "ia",
    status: "desconectado",
    docs: "https://console.anthropic.com",
  },
  {
    id: "google-ai",
    nome: "Google AI",
    descricao: "Gemini Pro, Vision e Speech-to-Text",
    logo: "G",
    categoria: "ia",
    status: "desconectado",
    docs: "https://ai.google.dev",
  },
  {
    id: "github",
    nome: "GitHub",
    descricao: "Repositórios, issues e pull requests via API",
    logo: "GH",
    categoria: "desenvolvimento",
    status: "desconectado",
    docs: "https://docs.github.com",
  },
  {
    id: "vercel",
    nome: "Vercel",
    descricao: "Deploys automáticos, previews e logs de build",
    logo: "V",
    categoria: "desenvolvimento",
    status: "desconectado",
    docs: "https://vercel.com/docs",
  },
  {
    id: "figma",
    nome: "Figma",
    descricao: "Leitura de componentes, tokens e assets do design",
    logo: "F",
    categoria: "desenvolvimento",
    status: "ativo",
    detalhe: "Conectado via MCP · Arquivo LuXTz9U7A7dNgdOO5Vt50S",
    docs: "https://www.figma.com/developers",
  },
  {
    id: "telegram",
    nome: "Telegram Bot",
    descricao: "Receber pedidos e notificações via bot do Telegram",
    logo: "T",
    categoria: "comunicacao",
    status: "desconectado",
    docs: "https://core.telegram.org/bots",
  },
  {
    id: "slack",
    nome: "Slack",
    descricao: "Notificações de pedidos, aprovações e alertas de projeto",
    logo: "S",
    categoria: "comunicacao",
    status: "desconectado",
    docs: "https://api.slack.com",
  },
  {
    id: "supabase",
    nome: "Supabase",
    descricao: "Banco de dados, storage e autenticação da plataforma",
    logo: "SB",
    categoria: "infraestrutura",
    status: "ativo",
    detalhe: "Ativo · Banco configurado com RLS",
    docs: "https://supabase.com/docs",
  },
  {
    id: "stripe",
    nome: "Stripe",
    descricao: "Pagamentos, assinaturas e cobrança recorrente",
    logo: "ST",
    categoria: "infraestrutura",
    status: "desconectado",
    docs: "https://stripe.com/docs",
  },
];

const statusConfig: Record<
  StatusIntegracao,
  { label: string; icon: React.ElementType; cor: string; bg: string }
> = {
  ativo: { label: "Ativo", icon: CheckCircle2, cor: "#43A047", bg: "#E8F5E9" },
  desconectado: { label: "Desconectado", icon: XCircle, cor: "#A9AAA5", bg: "#EEEFE9" },
  erro: { label: "Erro", icon: AlertCircle, cor: "#E53935", bg: "#FFEBEE" },
};

function IntegracaoCard({ item, idx }: { item: Integracao; idx: number }) {
  const [expanded, setExpanded] = useState(false);
  const s = statusConfig[item.status];
  const StatusIcon = s.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx * 0.05, 0.3) }}
      className="rounded-[16px] bg-[#EEEFE9] overflow-hidden"
    >
      <motion.button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left"
        whileHover={{ backgroundColor: "rgba(213,210,201,0.5)" }}
        whileTap={{ scale: 0.995 }}
        transition={{ duration: 0.15 }}
      >
        {/* Logo */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#0E0F10] text-[13px] font-bold text-white">
          {item.logo}
        </div>

        <div className="flex flex-1 flex-col gap-0.5">
          <p className="text-[14px] font-bold text-[#0E0F10]">{item.nome}</p>
          <p className="text-[12px] text-[#A9AAA5]">{item.descricao}</p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-[11px] font-bold"
            style={{ backgroundColor: s.bg, color: s.cor }}
          >
            <StatusIcon size={11} />
            {s.label}
          </div>

          <motion.div
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight size={16} className="text-[#A9AAA5]" />
          </motion.div>
        </div>
      </motion.button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="border-t border-[#D5D2C9] px-5 py-4 flex flex-col gap-3">
              {item.detalhe && (
                <p className="text-[12px] text-[#5E5E5F]">{item.detalhe}</p>
              )}

              <div className="flex gap-2 flex-wrap">
                {item.status === "desconectado" && (
                  <motion.button
                    className="flex items-center gap-1.5 rounded-[10px] bg-[#0E0F10] px-4 py-2 text-[12px] font-bold text-white"
                    whileHover={{ backgroundColor: "#2a2b2c", scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Plus size={13} />
                    Conectar
                  </motion.button>
                )}
                {item.status === "ativo" && (
                  <motion.button
                    className="flex items-center gap-1.5 rounded-[10px] border border-[#D5D2C9] px-4 py-2 text-[12px] font-semibold text-[#5E5E5F]"
                    whileHover={{ backgroundColor: "rgba(213,210,201,0.5)", scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Key size={13} />
                    Gerenciar chave
                  </motion.button>
                )}
                {item.docs && (
                  <motion.a
                    href={item.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-[10px] px-4 py-2 text-[12px] font-semibold text-[#A9AAA5]"
                    whileHover={{ color: "#0E0F10", backgroundColor: "rgba(213,210,201,0.3)", scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ExternalLink size={12} />
                    Documentação
                  </motion.a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function IntegracoesClient() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header info */}
      <div className="rounded-[20px] bg-[#0E0F10] p-6 flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#D7FF00] shrink-0">
          <Plug size={15} color="#0E0F10" />
        </div>
        <div>
          <p className="text-[14px] font-bold text-white">Ecossistema de integrações</p>
          <p className="mt-0.5 text-[12px] text-white/50 leading-relaxed">
            Conecte a plataforma com ferramentas externas de IA, desenvolvimento, comunicação e infraestrutura.
            Cada integração amplia as capacidades dos agentes e squads.
          </p>
        </div>
      </div>

      {/* Por categoria */}
      {categorias.map((cat) => {
        const itens = integracoes.filter((i) => i.categoria === cat.id);
        const ativos = itens.filter((i) => i.status === "ativo").length;
        let globalIdx = integracoes.findIndex((i) => i.categoria === cat.id);

        return (
          <div key={cat.id} className="rounded-[20px] bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-[#0E0F10]">
                {cat.label}
              </h2>
              <span className="rounded-[6px] bg-[#EEEFE9] px-2.5 py-1 text-[11px] font-bold text-[#A9AAA5]">
                {ativos}/{itens.length} ativos
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {itens.map((item, i) => (
                <IntegracaoCard key={item.id} item={item} idx={globalIdx + i} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
