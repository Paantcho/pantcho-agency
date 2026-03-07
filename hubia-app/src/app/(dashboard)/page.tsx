import { Button } from "@/components/ui/button";
import { AnimatedLink } from "@/components/ui/animated-link";
import { Plus, TrendingUp, Globe, Code2, Clapperboard } from "lucide-react";

/* Data formatada pt-BR (servidor) */
function formatDatePtBr(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(date);
}

/* Saudação conforme hora do dia */
function getGreeting(date: Date) {
  const h = date.getHours();
  if (h >= 0 && h < 12) return "Bom dia";
  if (h >= 12 && h < 18) return "Boa tarde";
  return "Boa noite";
}

const kpiCards = [
  {
    label: "PEDIDOS ATIVOS",
    value: "32",
    sub: "↑ 3 esta semana",
    trend: "up",
    bg: "bg-ink-500",
    labelClass: "text-white/40",
    valueClass: "text-white",
    subClass: "text-white/70",
  },
  {
    label: "PROMPTS GERADOS",
    value: "136",
    sub: "este mês",
    bg: "bg-limao-500",
    labelClass: "text-ink-500/80",
    valueClass: "text-ink-500",
    subClass: "text-ink-500/70",
  },
  {
    label: "CREATORS ATIVOS",
    value: "3",
    sub: "Ninaah • Lizandra • Romeo",
    bg: "bg-orange-500",
    labelClass: "text-ink-500/80",
    valueClass: "text-ink-500",
    subClass: "text-ink-500/80",
  },
  {
    label: "AGENTES NO SISTEMA",
    value: "19",
    sub: "2 squads • 17 skills",
    bg: "bg-surface-500",
    labelClass: "text-base-700",
    valueClass: "text-ink-500",
    subClass: "text-base-700",
  },
];

const squads = [
  {
    name: "Dev Squad",
    agents: "2 agentes • 8 skills carregáveis",
    pct: 75,
    barColor: "var(--color-ink-500)",
    icon: Code2,
  },
  {
    name: "Audiovisual Squad",
    agents: "6 agentes • 9 skills carregáveis",
    pct: 62,
    barColor: "var(--color-indigo-500)",
    iconBg: "bg-indigo-50",
    iconColor: "text-ink-500",
    icon: Clapperboard,
  },
];

const emAndamento = [
  "EXEMPLO NOME NO ARQUIVO.md",
  "Teste real — Figma Integration - Dev Squad v2.0",
];

const atividadeRecente = [
  { title: "Prompt gerado - Ninaah Piscina #67", meta: "há 23 min • Audiovisual", dot: "bg-limao-500" },
  { title: "Pedido #67 aguardando validação", meta: "há 1h • Especialista em Consistência", dot: "bg-red-200" },
  { title: "APPEARANCE.md Ninaah atualizado", meta: "há 3h • Orquestrador", dot: "bg-base-600" },
  { title: "Agency Hub PRD — 700 linhas ✔", meta: "ontem • Dev Squad", dot: "bg-orange-500" },
  { title: "skill/image-prompt refinada", meta: "ontem • Eng. Prompts", dot: "bg-green-500" },
];

const pedidosPrioritarios = [
  {
    badge: "URGENTE",
    badgeClass: "bg-red-200 text-ink-500",
    id: "#67",
    title: "Pack Ninaah — Piscina Março",
    desc: "6 imagens • Mood elegante • Creator: Ninaah",
    status: "Aguardando validação forense",
    pct: 70,
  },
  {
    badge: "EM PROGRESSO",
    badgeClass: "bg-indigo-50 text-ink-500",
    id: "#66",
    title: "Landing Page Privacy",
    desc: "Next.js 15 • Figma → Código",
    status: "Dev Squad trabalhando",
    pct: 45,
  },
  {
    badge: "BACKLOG",
    badgeClass: "bg-base-500 text-ink-500",
    id: "#65",
    title: "Reels Ninaah — Cozinha",
    desc: "3 videos • 15s cada",
    status: "Aguardando início",
    pct: 0,
  },
];

export default function DashboardPage() {
  const now = new Date();
  const dataStr = formatDatePtBr(now);
  const greeting = getGreeting(now);

  return (
    <div className="hubia-fade-in flex flex-col gap-[24px]">
      {/* Header: data, saudação, botão Novo pedido */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-label-sm font-medium text-base-700">{dataStr}</p>
          <h1 className="text-heading-md font-bold text-ink-500 mt-0.5">
            {greeting}, Pantcho 👋
          </h1>
        </div>
        <Button
          variant="default"
          size="lg"
          asChild
          className="mt-2 sm:mt-0 shrink-0 h-11 min-h-11 px-6 rounded-full"
        >
          <AnimatedLink href="/pedidos" className="gap-2">
            <Plus className="size-5" />
            Novo pedido
          </AnimatedLink>
        </Button>
      </div>

      {/* 4 KPI cards — cores distintas, tipografia card-kpi */}
      <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <div
            key={kpi.label}
            className={`motion-soft rounded-card flex flex-col justify-between gap-[6px] p-5 ${kpi.bg} transition-transform duration-150 hover:opacity-95`}
          >
            <div className={`card-kpi-label ${kpi.labelClass}`}>{kpi.label}</div>
            <div className={`card-kpi-value ${kpi.valueClass}`}>{kpi.value}</div>
            {kpi.sub && (
              <div className={`card-kpi-sub ${kpi.subClass}`}>
                {kpi.trend === "up" && (
                  <TrendingUp className="size-3 shrink-0" aria-hidden />
                )}
                {kpi.sub}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Status dos Squads — um único box branco, diagramação lado a lado */}
      <div className="flex flex-col gap-3">
        <h2 className="text-heading-xs font-bold text-ink-500">Status dos Squads</h2>
        <div className="rounded-card bg-surface-500 p-6">
          <div className="flex flex-col gap-5">
            {squads.map((squad) => (
              <div
                key={squad.name}
                className="hubia-progress-row flex flex-col gap-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full ${squad.iconBg ?? "bg-ink-500"} ${squad.iconColor ?? "text-white"}`}
                    >
                      <squad.icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-label-md font-semibold text-ink-500 truncate">
                        {squad.name}
                      </p>
                      <p className="text-body-sm font-medium text-base-700">
                        {squad.agents}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-green-500">
                      Ativo
                    </span>
                    <Button variant="outline" size="sm" asChild>
                      <AnimatedLink href="/agentes" className="gap-1.5">
                        <Globe className="size-3.5" />
                        Abrir
                      </AnimatedLink>
                    </Button>
                  </div>
                </div>
                <div>
                  <div className="hubia-progress-track">
                    <div
                      className="hubia-progress-bar"
                      style={{
                        width: `${squad.pct}%`,
                        background: squad.barColor,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-body-sm font-medium text-base-700">
                    {squad.pct}% contexto livre
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Em andamento agora + Atividade recente */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Box branco; dentro dele um bloquinho com cor parecida ao fundo da página */}
          <div className="rounded-card bg-surface-500 p-6">
            <h2 className="text-heading-xs font-bold text-ink-500">
              Em andamento agora
            </h2>
            <div className="mt-4 rounded-card bg-base-500 p-4">
              <ul className="flex flex-col gap-2">
                {emAndamento.map((item) => (
                  <li
                    key={item}
                    className="text-body-md font-medium text-ink-500"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div>
          <div className="rounded-card bg-ink-500 p-6">
            <h2 className="text-heading-xs text-white">Atividade recente</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {atividadeRecente.map((a) => (
                <li key={a.title} className="flex gap-3">
                  <span
                    className={`mt-1.5 size-2 shrink-0 rounded-full ${a.dot}`}
                    aria-hidden
                  />
                  <div>
                    <p className="text-body-sm font-medium text-white">
                      {a.title}
                    </p>
                    <p className="text-body-sm text-white/60">{a.meta}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Pedidos Prioritários */}
      <div>
        <h2 className="text-heading-xs font-bold text-ink-500 mb-4">
          Pedidos Prioritários
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pedidosPrioritarios.map((pedido) => (
            <div
              key={pedido.id}
              className="motion-soft rounded-card bg-surface-500 p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${pedido.badgeClass}`}
                >
                  {pedido.badge}
                </span>
                <span className="text-label-sm text-base-700">{pedido.id}</span>
              </div>
              <h3 className="mt-3 text-label-md text-ink-500">{pedido.title}</h3>
              <p className="mt-1 text-body-sm text-base-700">{pedido.desc}</p>
              <p className="mt-2 text-body-sm text-base-700">
                {pedido.status}
              </p>
              <div className="mt-3 hubia-progress-track h-1">
                <div
                  className="hubia-progress-bar bg-ink-500"
                  style={{ width: `${pedido.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
