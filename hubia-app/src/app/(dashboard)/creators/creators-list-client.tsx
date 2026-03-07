"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import type { CreatorRow } from "./actions";
import { NovaCreatorModal } from "./nova-creator-modal";

/** Imagem de exemplo quando o creator não tem avatar — padrão para toda a listagem */
const PLACEHOLDER_AVATAR =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=264&fit=crop";

type Filter = "all" | "active" | "inactive";

function CreatorCard({ creator }: { creator: CreatorRow }) {
  const isInactive = !creator.isActive;
  const imageUrl = creator.avatarUrl?.trim() || PLACEHOLDER_AVATAR;
  const subtitle = creator.bio
    ? creator.bio.split("\n")[0].slice(0, 60)
    : `@${creator.slug}`;

  return (
    <Link
      href={`/creators/${creator.id}`}
      className="motion-soft group relative flex min-h-[300px] flex-col overflow-hidden rounded-card bg-ink-500 transition-shadow hover:shadow-xl"
    >
      {/* Tag Ativa/Inativa — canto superior esquerdo, pílula escura, texto Limão */}
      <span className="absolute left-4 top-4 z-10 rounded-tag bg-ink-500 px-3 py-1.5 text-label-sm font-semibold uppercase tracking-wider text-limao-500">
        {creator.isActive ? "Ativa" : "Inativa"}
      </span>
      {/* Foto: integrada ao card, hover zoom + leve movimento esquerda/cima */}
      <div
        className={`relative h-44 shrink-0 overflow-hidden bg-ink-400 ${
          isInactive ? "grayscale" : ""
        }`}
      >
        <img
          src={imageUrl}
          alt=""
          className="h-full w-full object-cover object-top transition-transform duration-300 ease-out group-hover:scale-105 group-hover:translate-x-[-2%] group-hover:translate-y-[-2%]"
        />
      </div>
      {/* Nome em Limão + subtítulo em branco */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h2 className="text-heading-sm font-bold leading-tight text-limao-500 line-clamp-2">
            {creator.name}
          </h2>
          <p className="mt-1.5 text-body-md font-medium text-white">
            {subtitle}
          </p>
        </div>
        {/* Tags rodapé: instagram, Privacy, Tiktok — pílulas fundo escuro, texto Limão */}
        <div className="mt-4 flex flex-wrap gap-2">
          {["instagram", "Privacy", "Tiktok"].map((label) => (
            <span
              key={label}
              className="rounded-tag bg-ink-500 px-2.5 py-1 text-label-sm font-medium text-limao-500"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export default function CreatorsListClient({
  creators: initialCreators,
  organizationId,
}: {
  creators: CreatorRow[];
  organizationId: string | null;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [modalOpen, setModalOpen] = useState(false);

  const creators =
    filter === "all"
      ? initialCreators
      : filter === "active"
        ? initialCreators.filter((c) => c.isActive)
        : initialCreators.filter((c) => !c.isActive);

  const ativasCount = initialCreators.filter((c) => c.isActive).length;

  return (
    <div className="hubia-fade-in flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-heading-xs text-ink-500">Creators</h1>
        <div className="flex items-center gap-4">
          <span className="text-body-md font-medium text-base-700">
            {ativasCount} {ativasCount === 1 ? "ativa" : "ativas"}
          </span>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="motion-soft hubia-pressable flex items-center gap-2 rounded-button bg-limao-500 px-4 py-2 text-label-md font-semibold text-ink-500 hover:bg-limao-400"
          >
            <Plus size={18} />
            Nova creator
          </button>
        </div>
      </div>

      {initialCreators.length > 0 && (
        <div className="inline-flex w-fit items-center gap-[4px] rounded-card bg-surface-500 p-[6px]">
          {[
            { id: "all" as const, label: "Todos" },
            { id: "active" as const, label: "Ativos" },
            { id: "inactive" as const, label: "Inativos" },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`motion-soft rounded-button px-[20px] py-[10px] text-label-md font-medium ${
                filter === id
                  ? "bg-limao-500 font-bold text-ink-500"
                  : "bg-surface-500 text-base-700 hover:bg-base-500 hover:text-ink-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {creators.map((creator) => (
          <CreatorCard key={creator.id} creator={creator} />
        ))}

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="motion-soft hubia-pressable flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed border-base-600 bg-base-500/30 transition-colors hover:border-limao-500/50 hover:bg-base-500/50"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-base-600">
            <Plus size={28} className="text-base-700" />
          </div>
          <span className="text-label-md font-bold uppercase tracking-wider text-base-700">
            Nova creator
          </span>
        </button>
      </div>

      {creators.length === 0 && initialCreators.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-card bg-surface-500 py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-base-500">
            <Users size={28} className="text-base-700" />
          </div>
          <p className="text-body-md font-medium text-base-700">
            Nenhum creator cadastrado.
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="motion-soft hubia-pressable rounded-button bg-limao-500 px-4 py-2 text-label-sm font-semibold text-ink-500 hover:bg-limao-400"
          >
            Adicionar primeiro creator
          </button>
        </div>
      )}

      {creators.length === 0 && initialCreators.length > 0 && (
        <div className="rounded-card bg-surface-500 py-12 text-center">
          <p className="text-body-md font-medium text-base-700">
            Nenhum creator com esse filtro.
          </p>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="mt-4 rounded-button border border-base-600 px-4 py-2 text-label-sm font-medium text-ink-500 hover:bg-base-500"
          >
            Ver todos
          </button>
        </div>
      )}

      {organizationId && (
        <NovaCreatorModal
          organizationId={organizationId}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
