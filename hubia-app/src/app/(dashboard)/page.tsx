import { Button } from "@/components/ui/button";
import { AnimatedLink } from "@/components/ui/animated-link";
import { Plus, Globe, Code2, Clapperboard } from "lucide-react";
import { getCurrentOrganizationId } from "@/lib/auth-organization";
import { getDashboardData } from "./dashboard-data";
import { KpiCards, PedidosPrioritariosCards } from "./dashboard-motion";

function formatDatePtBr(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(date);
}

function getGreeting(date: Date) {
  const h = date.getHours();
  if (h >= 0 && h < 12) return "Bom dia";
  if (h >= 12 && h < 18) return "Boa tarde";
  return "Boa noite";
}

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

export default async function DashboardPage() {
  const organizationId = await getCurrentOrganizationId();
  const data = await getDashboardData(organizationId);

  const kpiCards = [
    {
      label: "PEDIDOS ATIVOS",
      value: String(data.pedidosAtivos),
      sub: "",
      trend: undefined as "up" | undefined,
      bg: "bg-ink-500",
      labelClass: "text-white/40",
      valueClass: "text-white",
      subClass: "text-white/70",
    },
    {
      label: "PROMPTS GERADOS",
      value: String(data.promptsGerados),
      sub: "total",
      bg: "bg-limao-500",
      labelClass: "text-ink-500/80",
      valueClass: "text-ink-500",
      subClass: "text-ink-500/70",
    },
    {
      label: "CREATORS ATIVOS",
      value: String(data.creatorsAtivos),
      sub: data.creatorsNomes,
      bg: "bg-orange-500",
      labelClass: "text-ink-500/80",
      valueClass: "text-ink-500",
      subClass: "text-ink-500/80",
    },
    {
      label: "AGENTES NO SISTEMA",
      value: String(data.agentesCount),
      sub: `${data.agentesCount ? "agentes" : "squads"} • ${data.skillsCount} skills`,
      bg: "bg-surface-500",
      labelClass: "text-base-700",
      valueClass: "text-ink-500",
      subClass: "text-base-700",
    },
  ];

  const now = new Date();
  const dataStr = formatDatePtBr(now);
  const greeting = getGreeting(now);

  return (
    <div className="hubia-fade-in flex flex-col gap-[24px]">
      {/* Header: data, saudação, botão Novo pedido */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-label-sm font-semibold text-base-700">{dataStr}</p>
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

      {/* 4 KPI cards — Client Component com stagger */}
      <KpiCards cards={kpiCards} />

      {/* Status dos Squads — um único box branco, diagramação lado a lado */}
      <div className="flex flex-col gap-3">
        <h2 className="text-heading-xs font-bold text-ink-500">Status dos Squads</h2>
        <div className="motion-soft rounded-card bg-surface-500 p-6">
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
                      <p className="text-body-sm font-semibold text-base-700">
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
                  <p className="mt-1 text-body-sm font-semibold text-base-700">
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
          <div className="motion-soft rounded-card bg-surface-500 p-6">
            <h2 className="text-heading-xs font-bold text-ink-500">
              Em andamento agora
            </h2>
            <div className="mt-4 rounded-card bg-base-500 p-4">
              <ul className="flex flex-col gap-2">
                {data.emAndamento.length === 0 ? (
                  <li className="text-body-md text-base-700">
                    Nenhum pedido em andamento no momento.
                  </li>
                ) : (
                  data.emAndamento.map((item) => (
                    <li key={item.titulo} className="flex flex-col gap-0.5">
                      <span className="text-body-md font-semibold text-ink-500">
                        {item.titulo}
                      </span>
                      {item.subtitulo !== "—" && (
                        <span className="text-body-sm text-base-700">
                          {item.subtitulo}
                        </span>
                      )}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
        <div>
          <div className="motion-soft rounded-card bg-ink-500 p-6">
            <h2 className="text-heading-xs text-white">Atividade recente</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {data.atividadeRecente.length === 0 ? (
                <li className="text-body-sm text-white/60">
                  Nenhuma atividade recente.
                </li>
              ) : (
                data.atividadeRecente.map((a) => (
                  <li key={`${a.title}-${a.meta}`} className="flex gap-3">
                    <span
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${a.dot}`}
                      aria-hidden
                    />
                    <div>
                      <p className="text-body-sm font-semibold text-white">
                        {a.title}
                      </p>
                      <p className="text-body-sm text-white/60">{a.meta}</p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Pedidos Prioritários — Client Component com stagger + whileHover */}
      <div>
        <h2 className="text-heading-xs font-bold text-ink-500 mb-4">Pedidos Prioritários</h2>
        <PedidosPrioritariosCards pedidos={data.pedidosPrioritarios} />
      </div>
    </div>
  );
}
