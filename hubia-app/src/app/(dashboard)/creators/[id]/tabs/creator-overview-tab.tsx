"use client";

import type { CreatorDetail } from "../../actions";

const KPI_LABELS = [
  { key: "prompts_mes", label: "PROMPTS ESTE MÊS", value: "39", sub: "↑18%" },
  { key: "taxa", label: "TAXA APROVAÇÃO", value: "64%", sub: "49/72" },
  { key: "prompts", label: "PROMPTS", value: "122", sub: null },
  { key: "ambientes", label: "AMBIENTES", value: "12", sub: null },
  { key: "moods", label: "MOODS", value: "2", sub: null },
  { key: "pedidos", label: "PEDIDOS ATIVOS", value: "7", sub: null },
] as const;

export default function CreatorOverviewTab({
  creator,
}: {
  creator: CreatorDetail;
  organizationId: string;
}) {
  const markers = Array.isArray(creator.appearance?.markers)
    ? creator.appearance.markers
    : [];
  const hasMarkers = markers.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Resumo do perfil — card escuro: avatar, nome limão, bio, tag Ativa/Inativa */}
      <div className="relative flex gap-6 overflow-hidden rounded-card bg-ink-500 p-6">
        <span className="absolute right-4 top-4 rounded-tag bg-ink-500 px-2.5 py-1 text-label-sm font-semibold text-limao-500">
          {creator.isActive ? "Ativa" : "Inativa"}
        </span>
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-ink-400">
          {creator.avatarUrl ? (
            <img
              src={creator.avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-heading-sm font-bold text-white/60">
              {creator.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 pr-20">
          <h2 className="text-heading-md font-bold text-limao-500">
            {creator.name}
          </h2>
          {creator.bio ? (
            <p className="mt-2 whitespace-pre-line text-body-md font-medium text-white/90">
              {creator.bio}
            </p>
          ) : (
            <p className="mt-2 text-body-md font-medium text-white/70">
              @{creator.slug}
            </p>
          )}
        </div>
      </div>

      {/* 6 cards de métricas — labels e valores com peso maior para leitura */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {KPI_LABELS.map((kpi) => (
          <div
            key={kpi.key}
            className="rounded-card bg-ink-500 p-4 transition-shadow hover:shadow-md"
          >
            <p className="text-label-sm font-semibold uppercase tracking-wider text-white/70">
              {kpi.label}
            </p>
            <p className="mt-1 text-heading-sm font-bold text-limao-500">
              {kpi.value}
            </p>
            {kpi.sub && (
              <p className="mt-0.5 text-body-sm font-medium text-limao-500/90">{kpi.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Marcadores de Identidade + Veículo Fixo — fontes com peso para leitura */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-card bg-surface-500 p-6">
          <h3 className="text-heading-sm font-bold text-ink-500">
            Marcadores de Identidade
          </h3>
          {hasMarkers ? (
            <ul className="mt-4 space-y-2">
              {(markers as { label?: string; description?: string }[]).map(
                (m, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-body-sm font-medium text-ink-500"
                  >
                    <span className="text-base-600">●</span>
                    <span>
                      {typeof m === "object" && m !== null && "label" in m
                        ? `${(m as { label: string }).label} — ${(m as { description?: string }).description ?? ""}`
                        : JSON.stringify(m)}
                    </span>
                  </li>
                )
              )}
            </ul>
          ) : (
            <p className="mt-4 text-body-sm font-medium text-base-700">
              ● Pintinha — Ombro direito: transição clavícula/deltoide lado
              direito nunca move.
              <br />
              □ Piercing no umbigo: discreto metálico, só aparece quando umbigo
              está visível.
              <br />
              ✲ Bronzeado sutil: leve e natural, sem marcas geométricas fortes.
            </p>
          )}
        </div>
        <div className="rounded-card bg-surface-500 p-6">
          <h3 className="text-heading-sm font-bold text-ink-500">
            Veículo Fixo
          </h3>
          <p className="mt-4 text-body-md font-semibold text-ink-500">
            BMW X2 2025
          </p>
          <p className="mt-1 text-body-sm font-medium text-base-700">
            Cape York Green metall...
          </p>
          <p className="mt-2 text-body-sm font-medium text-base-700">
            Interior premium escuro • Preto/grafite com detalhes metálicos •
            Cor não muda nunca
          </p>
        </div>
      </div>
    </div>
  );
}
