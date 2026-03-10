"use client";

import type { CreatorDetail } from "../../actions";

const PLACEHOLDER_AVATAR =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=300&fit=crop&crop=faces";

// KPIs — valores mockados; em produção virão do banco
const KPI_LABELS = [
  { key: "prompts_mes", label: "PROMPTS ESTE MÊS", value: "39", sub: "↑ 18%" },
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

  const imageUrl = creator.avatarUrl?.trim() || PLACEHOLDER_AVATAR;

  // Parse info da bio
  const bioLines = creator.bio ? creator.bio.split("\n") : [];
  const infoLine = bioLines[0] ?? `@${creator.slug}`;

  return (
    <div className="flex flex-col gap-5">
      {/* Hero card escuro */}
      <div
        className="relative flex items-start gap-5 overflow-hidden rounded-[30px] p-6"
        style={{ background: "var(--hubia-ink-500)" }}
      >
        {/* Tag Ativa/Inativa — canto superior direito */}
        <span
          className="absolute right-5 top-5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest"
          style={{ background: "rgba(255,255,255,0.08)", color: "var(--hubia-limao-500)" }}
        >
          {creator.isActive ? "Ativa" : "Inativa"}
        </span>

        {/* Avatar — quadrado arredondado, ~88px */}
        <div
          className="shrink-0 overflow-hidden rounded-2xl"
          style={{ width: 88, height: 88, background: "#3E3F40" }}
        >
          <img
            src={imageUrl}
            alt={creator.name}
            className="h-full w-full object-cover object-top"
          />
        </div>

        {/* Info: nome, subtítulo, bio */}
        <div className="min-w-0 flex-1 pr-24">
          <h2
            className="font-bold leading-tight"
            style={{ fontSize: "28px", color: "var(--hubia-limao-500)" }}
          >
            {creator.name}
          </h2>
          <p
            className="mt-1 font-semibold"
            style={{ fontSize: "13px", color: "rgba(255,255,255,0.60)" }}
          >
            {infoLine}
          </p>
          {bioLines.slice(1).map((line, i) => (
            <p
              key={i}
              className="mt-0.5 font-semibold"
              style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)" }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* 6 KPI cards — grid 6 cols em desktop */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {KPI_LABELS.map((kpi) => (
          <div
            key={kpi.key}
            className="flex flex-col gap-1 rounded-[30px] p-4"
            style={{ background: "var(--hubia-ink-500)" }}
          >
            <p
              className="font-bold uppercase tracking-widest leading-snug"
              style={{ fontSize: "9px", color: "rgba(255,255,255,0.45)" }}
            >
              {kpi.label}
            </p>
            <p
              className="font-bold leading-none mt-1"
              style={{ fontSize: "32px", color: "var(--hubia-limao-500)" }}
            >
              {kpi.value}
            </p>
            {kpi.sub && (
              <p
                className="font-semibold"
                style={{ fontSize: "12px", color: "rgba(215,255,0,0.7)" }}
              >
                {kpi.sub}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Marcadores de Identidade + Veículo Fixo */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Marcadores */}
        <div
          className="rounded-[30px] p-6"
          style={{ background: "#FFFFFF" }}
        >
          <h3
            className="font-bold"
            style={{ fontSize: "17px", color: "var(--hubia-ink-500)" }}
          >
            Marcadores de Identidade
          </h3>

          {hasMarkers ? (
            <ul className="mt-4 flex flex-col gap-3">
              {(markers as { label?: string; description?: string; icon?: string }[]).map(
                (m, i) => (
                  <li key={i} className="flex gap-2">
                    <span style={{ color: "#A9AAA5", fontSize: "14px" }}>●</span>
                    <div>
                      <span
                        className="font-bold"
                        style={{ fontSize: "13px", color: "#0E0F10" }}
                      >
                        {typeof m === "object" && m !== null && "label" in m
                          ? (m as { label: string }).label
                          : ""}
                      </span>
                      {typeof m === "object" && m !== null && "description" in m && (
                        <p
                          className="font-semibold"
                          style={{ fontSize: "12px", color: "#A9AAA5", marginTop: "1px" }}
                        >
                          {(m as { description?: string }).description}
                        </p>
                      )}
                    </div>
                  </li>
                )
              )}
            </ul>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {[
                {
                  icon: "●",
                  label: "Pintinha — Ombro Direito",
                  desc: "Transição clavícula/deltoide · lado direito · nunca move",
                },
                {
                  icon: "□",
                  label: "Piercing no Umbigo",
                  desc: "Discreto metálico · só aparece quando umbigo está visível",
                },
                {
                  icon: "✲",
                  label: "Bronzeado Sutil",
                  desc: "Leve e natural · sem marcas geométricas fortes",
                },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-2.5">
                  <span
                    className="mt-0.5 shrink-0 font-bold"
                    style={{ fontSize: "14px", color: "#A9AAA5" }}
                  >
                    {item.icon}
                  </span>
                  <div>
                    <p
                      className="font-bold"
                      style={{ fontSize: "13px", color: "#0E0F10" }}
                    >
                      {item.label}
                    </p>
                    <p
                      className="font-semibold"
                      style={{ fontSize: "12px", color: "#A9AAA5", marginTop: "2px" }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Veículo Fixo */}
        <div
          className="rounded-[30px] p-6"
          style={{ background: "#FFFFFF" }}
        >
          <h3
            className="font-bold"
            style={{ fontSize: "17px", color: "var(--hubia-ink-500)" }}
          >
            Veículo Fixo
          </h3>

          {/* Área da imagem — placeholder cinza */}
          <div
            className="mt-4 flex h-28 items-center justify-center rounded-2xl"
            style={{ background: "#EEEFE9" }}
          >
            <span
              className="font-semibold"
              style={{ fontSize: "12px", color: "#A9AAA5" }}
            >
              imagem do veículo
            </span>
          </div>

          <p
            className="mt-4 font-bold"
            style={{ fontSize: "15px", color: "#0E0F10" }}
          >
            BMW X2 2025
          </p>
          <p
            className="font-semibold"
            style={{ fontSize: "13px", color: "#A9AAA5", marginTop: "3px" }}
          >
            Cape York Green metall...
          </p>
          <p
            className="mt-3 font-semibold leading-snug"
            style={{ fontSize: "12px", color: "#A9AAA5" }}
          >
            Interior premium escuro · Preto/grafite com detalhes metálicos ·{" "}
            <strong style={{ color: "#0E0F10" }}>Cor não muda nunca</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
