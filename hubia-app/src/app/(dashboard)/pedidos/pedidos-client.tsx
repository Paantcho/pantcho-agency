"use client";

import { useState, useTransition } from "react";
import {
  ClipboardList,
  Plus,
  X,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Trash2,
  ChevronRight,
  Image,
  Video,
  Globe,
  Smartphone,
  Monitor,
  Settings,
  MoreHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PedidoRow } from "./actions";
import {
  createPedido,
  updatePedidoStatus,
  deletePedido,
} from "./actions";

// ============================================================
// Constants
// ============================================================

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: LucideIcon }
> = {
  rascunho: {
    label: "Rascunho",
    color: "var(--hubia-bg-base-700)",
    bg: "#EEEFE9",
    icon: Circle,
  },
  aguardando: {
    label: "Aguardando",
    color: "#F59E0B",
    bg: "#FEF3C7",
    icon: Clock,
  },
  em_andamento: {
    label: "Em andamento",
    color: "#3B82F6",
    bg: "#DBEAFE",
    icon: ChevronRight,
  },
  revisao: {
    label: "Em revisão",
    color: "#8B5CF6",
    bg: "#EDE9FE",
    icon: AlertTriangle,
  },
  aprovado: {
    label: "Aprovado",
    color: "#10B981",
    bg: "#D1FAE5",
    icon: CheckCircle2,
  },
  entregue: {
    label: "Entregue",
    color: "#059669",
    bg: "#A7F3D0",
    icon: CheckCircle2,
  },
  cancelado: {
    label: "Cancelado",
    color: "#EF4444",
    bg: "#FEE2E2",
    icon: X,
  },
};

const URGENCIA_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  baixa: { label: "Baixa", color: "var(--hubia-bg-base-700)", bg: "#EEEFE9" },
  media: { label: "Média", color: "#3B82F6", bg: "#DBEAFE" },
  alta: { label: "Alta", color: "#F59E0B", bg: "#FEF3C7" },
  critica: { label: "Crítica", color: "#EF4444", bg: "#FEE2E2" },
};

const TIPO_ICONS: Record<string, LucideIcon> = {
  imagem: Image,
  video: Video,
  landing_page: Globe,
  app: Smartphone,
  site: Monitor,
  sistema: Settings,
  outro: MoreHorizontal,
};

const TIPO_LABELS: Record<string, string> = {
  imagem: "Imagem",
  video: "Vídeo",
  landing_page: "Landing Page",
  app: "App",
  site: "Site",
  sistema: "Sistema",
  outro: "Outro",
};

// ============================================================
// Component
// ============================================================

export default function PedidosClient({
  pedidos: initialPedidos,
  creators,
}: {
  pedidos: PedidoRow[];
  creators: { id: string; name: string }[];
}) {
  const [pedidos, setPedidos] = useState(initialPedidos);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // Form state
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("imagem");
  const [urgencia, setUrgencia] = useState("media");
  const [creatorId, setCreatorId] = useState("");
  const [dueAt, setDueAt] = useState("");

  const filtered = statusFilter
    ? pedidos.filter((p) => p.status === statusFilter)
    : pedidos;

  // Count by status
  const statusCounts: Record<string, number> = {};
  for (const p of pedidos) {
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
  }

  async function handleCreate() {
    if (!titulo.trim()) return;
    startTransition(async () => {
      const result = await createPedido({
        titulo,
        descricao,
        tipo,
        urgencia,
        creatorId: creatorId || undefined,
        dueAt: dueAt || undefined,
      });
      if (result.ok) {
        setTitulo("");
        setDescricao("");
        setTipo("imagem");
        setUrgencia("media");
        setCreatorId("");
        setDueAt("");
        setShowForm(false);
        window.location.reload();
      }
    });
  }

  async function handleStatusChange(id: string, newStatus: string) {
    setMenuOpen(null);
    startTransition(async () => {
      const result = await updatePedidoStatus(id, newStatus);
      if (result.ok) {
        setPedidos((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, status: newStatus } : p
          )
        );
      }
    });
  }

  async function handleDelete(id: string) {
    setMenuOpen(null);
    startTransition(async () => {
      const result = await deletePedido(id);
      if (result.ok) {
        setPedidos((prev) => prev.filter((p) => p.id !== id));
      }
    });
  }

  return (
    <div className="hubia-fade-in flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1
          className="font-bold"
          style={{ fontSize: "28px", color: "var(--hubia-ink-500)" }}
        >
          Pedidos
        </h1>
        <div className="flex items-center gap-3">
          <span
            className="font-semibold"
            style={{ fontSize: "14px", color: "var(--hubia-bg-base-700)" }}
          >
            {pedidos.length} {pedidos.length === 1 ? "pedido" : "pedidos"}
          </span>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-full font-bold transition-colors duration-200 hover:opacity-90 active:scale-95"
            style={{
              background: "#D7FF00",
              color: "var(--hubia-ink-500)",
              fontSize: "14px",
              padding: "10px 22px",
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            Novo Pedido
          </button>
        </div>
      </div>

      {/* Status pills filter */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter(null)}
          className="rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors"
          style={{
            background: statusFilter === null ? "#0E0F10" : "#EEEFE9",
            color: statusFilter === null ? "#D7FF00" : "#A9AAA5",
          }}
        >
          Todos ({pedidos.length})
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = statusCounts[key] || 0;
          if (count === 0 && key !== "rascunho" && key !== "em_andamento")
            return null;
          return (
            <button
              key={key}
              type="button"
              onClick={() =>
                setStatusFilter(statusFilter === key ? null : key)
              }
              className="rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors"
              style={{
                background: statusFilter === key ? cfg.color : cfg.bg,
                color: statusFilter === key ? "#FFFFFF" : cfg.color,
              }}
            >
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* New pedido form */}
      {showForm && (
        <div className="rounded-[30px] bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3
              className="font-bold"
              style={{ fontSize: "16px", color: "var(--hubia-ink-500)" }}
            >
              Novo Pedido
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg p-1.5 hover:bg-base-500"
            >
              <X size={18} style={{ color: "var(--hubia-bg-base-700)" }} />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título do pedido"
              className="rounded-xl border border-base-500 bg-[#F5F5F3] px-4 py-3 text-[14px] text-ink-500 placeholder-base-700 outline-none focus:border-limao-500"
            />
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição / briefing..."
              rows={3}
              className="resize-none rounded-xl border border-base-500 bg-[#F5F5F3] px-4 py-3 text-[14px] text-ink-500 placeholder-base-700 outline-none focus:border-limao-500"
            />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="rounded-xl border border-base-500 bg-[#F5F5F3] px-4 py-3 text-[14px] text-ink-500 outline-none focus:border-limao-500"
              >
                {Object.entries(TIPO_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                value={urgencia}
                onChange={(e) => setUrgencia(e.target.value)}
                className="rounded-xl border border-base-500 bg-[#F5F5F3] px-4 py-3 text-[14px] text-ink-500 outline-none focus:border-limao-500"
              >
                {Object.entries(URGENCIA_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.label}
                  </option>
                ))}
              </select>
              <select
                value={creatorId}
                onChange={(e) => setCreatorId(e.target.value)}
                className="rounded-xl border border-base-500 bg-[#F5F5F3] px-4 py-3 text-[14px] text-ink-500 outline-none focus:border-limao-500"
              >
                <option value="">Sem creator</option>
                {creators.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="rounded-xl border border-base-500 bg-[#F5F5F3] px-4 py-3 text-[14px] text-ink-500 outline-none focus:border-limao-500"
              />
            </div>
            <button
              type="button"
              onClick={handleCreate}
              disabled={!titulo.trim() || isPending}
              className="self-end rounded-full font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{
                background: "#D7FF00",
                color: "var(--hubia-ink-500)",
                fontSize: "13px",
                padding: "10px 22px",
              }}
            >
              {isPending ? "Criando..." : "Criar Pedido"}
            </button>
          </div>
        </div>
      )}

      {/* Pedidos list */}
      <div className="flex flex-col gap-3">
        {filtered.map((pedido) => {
          const statusCfg = STATUS_CONFIG[pedido.status] || STATUS_CONFIG.rascunho;
          const urgCfg = URGENCIA_CONFIG[pedido.urgencia] || URGENCIA_CONFIG.media;
          const TipoIcon = TIPO_ICONS[pedido.tipo] || MoreHorizontal;
          const StatusIcon = statusCfg.icon;

          return (
            <div
              key={pedido.id}
              className="group flex items-center gap-4 rounded-[30px] bg-white px-5 py-4"
            >
              {/* Tipo icon */}
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "#EEEFE9" }}
              >
                <TipoIcon size={18} style={{ color: "var(--hubia-ink-500)" }} />
              </div>

              {/* Main content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3
                    className="truncate font-bold"
                    style={{ fontSize: "15px", color: "var(--hubia-ink-500)" }}
                  >
                    {pedido.titulo}
                  </h3>
                  {pedido.creatorName && (
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{
                        background: "#EC489920",
                        color: "#EC4899",
                      }}
                    >
                      {pedido.creatorName}
                    </span>
                  )}
                </div>
                {pedido.descricao && (
                  <p
                    className="mt-0.5 truncate font-semibold"
                    style={{ fontSize: "12px", color: "var(--hubia-bg-base-700)" }}
                  >
                    {pedido.descricao}
                  </p>
                )}
              </div>

              {/* Urgência */}
              <span
                className="hidden sm:inline-block shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{ background: urgCfg.bg, color: urgCfg.color }}
              >
                {urgCfg.label}
              </span>

              {/* Status */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setMenuOpen(menuOpen === pedido.id ? null : pedido.id)
                  }
                  className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors hover:opacity-80"
                  style={{
                    background: statusCfg.bg,
                    color: statusCfg.color,
                  }}
                >
                  <StatusIcon size={12} />
                  {statusCfg.label}
                </button>

                {/* Status dropdown */}
                {menuOpen === pedido.id && (
                  <div
                    className="absolute right-0 top-full z-20 mt-1 min-w-[160px] rounded-xl border bg-white p-1"
                    style={{ borderColor: "#EEEFE9" }}
                  >
                    {Object.entries(STATUS_CONFIG).map(
                      ([key, cfg]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            handleStatusChange(pedido.id, key)
                          }
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] font-semibold transition-colors hover:bg-[#F5F5F3]"
                          style={{
                            color:
                              pedido.status === key
                                ? cfg.color
                                : "#0E0F10",
                          }}
                        >
                          <cfg.icon size={13} style={{ color: cfg.color }} />
                          {cfg.label}
                        </button>
                      )
                    )}
                    <div className="my-1 h-px bg-base-500" />
                    <button
                      type="button"
                      onClick={() => handleDelete(pedido.id)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] font-semibold text-red-500 transition-colors hover:bg-red-50"
                    >
                      <Trash2 size={13} />
                      Excluir
                    </button>
                  </div>
                )}
              </div>

              {/* Due date */}
              {pedido.dueAt && (
                <span
                  className="hidden lg:inline-block shrink-0 text-[11px] font-semibold"
                  style={{ color: "#C8C9C3" }}
                >
                  {new Date(pedido.dueAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div
          className="flex flex-col items-center justify-center gap-4 rounded-[30px] py-16"
          style={{ background: "#FFFFFF" }}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: "#EEEFE9" }}
          >
            <ClipboardList size={28} style={{ color: "var(--hubia-bg-base-700)" }} />
          </div>
          <p
            className="font-semibold"
            style={{ fontSize: "15px", color: "var(--hubia-bg-base-700)" }}
          >
            {pedidos.length === 0
              ? "Nenhum pedido cadastrado."
              : "Nenhum pedido com este filtro."}
          </p>
          {pedidos.length === 0 && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="rounded-full font-bold transition-opacity hover:opacity-90"
              style={{
                background: "#D7FF00",
                color: "var(--hubia-ink-500)",
                fontSize: "13px",
                padding: "10px 22px",
              }}
            >
              Criar primeiro pedido
            </button>
          )}
        </div>
      )}
    </div>
  );
}
