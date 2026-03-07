"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import type { CreatorRow } from "./actions";
import { NovaCreatorModal } from "./nova-creator-modal";

const PLACEHOLDER_AVATAR =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=800&fit=crop&crop=faces,top";

type Filter = "all" | "active" | "inactive";

function CreatorCard({ creator }: { creator: CreatorRow }) {
  const imageUrl = creator.avatarUrl?.trim() || PLACEHOLDER_AVATAR;
  const meta = creator.metadata ?? {};

  // Dados estruturados do metadata
  const age = meta.age ?? null;
  const city = meta.city ?? null;
  const state = meta.state ?? null;
  const platforms: string[] = meta.platforms ?? [];

  // Localização: "Pomerode, SC"
  const location =
    city && state ? `${city}, ${state}` : city ?? state ?? null;

  return (
    <Link
      href={`/creators/${creator.id}`}
      className="group relative flex flex-col overflow-hidden rounded-[24px] bg-[#0E0F10] transition-shadow duration-300 hover:shadow-2xl"
      style={{ aspectRatio: "3/4" }}
    >
      {/* Foto fullbleed — parallax zoom só na imagem, card não se move */}
      <div className="absolute inset-0 overflow-hidden rounded-[24px]">
        <img
          src={imageUrl}
          alt={creator.name}
          className={`h-full w-full object-cover object-top transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.12] ${
            !creator.isActive ? "grayscale" : ""
          }`}
        />
        {/* Gradiente: transparente no topo → ink escuro no rodapé */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(14,15,16,0.0) 0%, rgba(14,15,16,0.1) 40%, rgba(14,15,16,0.82) 70%, rgba(14,15,16,0.97) 100%)",
          }}
        />
      </div>

      {/* Tag Ativa/Inativa — canto superior esquerdo */}
      <div className="absolute left-4 top-4 z-10">
        <span
          className="rounded-full bg-[#0E0F10] px-3 py-1 text-[11px] font-bold uppercase tracking-widest"
          style={{ color: "#D7FF00" }}
        >
          {creator.isActive ? "Ativa" : "Inativa"}
        </span>
      </div>

      {/* Bloco inferior — sobre o gradiente */}
      <div className="relative z-10 mt-auto flex flex-col p-5">
        {/* Nome: bold, Limão, line-height apertado (1.1), pode quebrar 2 linhas */}
        <h2
          className="font-bold"
          style={{
            fontSize: "clamp(18px,1.8vw,24px)",
            color: "#D7FF00",
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
          }}
        >
          {creator.name}
        </h2>

        {/* Idade — linha separada, logo abaixo do nome */}
        {age !== null && (
          <p
            className="font-semibold"
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.75)",
              marginTop: "5px",
              lineHeight: 1.3,
            }}
          >
            {age} anos
          </p>
        )}

        {/* Cidade, Estado — linha separada */}
        {location && (
          <p
            className="font-semibold"
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.75)",
              marginTop: "1px",
              lineHeight: 1.3,
            }}
          >
            {location}
          </p>
        )}

        {/* Tags de plataformas — do metadata, não hardcoded */}
        {platforms.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {platforms.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize"
                style={{
                  background: "rgba(14,15,16,0.65)",
                  color: "#D7FF00",
                  backdropFilter: "blur(6px)",
                  border: "1px solid rgba(215,255,0,0.15)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
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
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1
          className="font-bold"
          style={{ fontSize: "28px", color: "#0E0F10" }}
        >
          Creators
        </h1>
        <div className="flex items-center gap-4">
          <span
            className="font-semibold"
            style={{ fontSize: "14px", color: "#A9AAA5" }}
          >
            {ativasCount} {ativasCount === 1 ? "ativa" : "ativas"}
          </span>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-full font-bold transition-colors duration-200 hover:opacity-90 active:scale-95"
            style={{
              background: "#D7FF00",
              color: "#0E0F10",
              fontSize: "14px",
              padding: "10px 22px",
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            Nova creator
          </button>
        </div>
      </div>

      {/* Grid de cards — mesmo tamanho dos cards da Look Library */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {creators.map((creator) => (
          <CreatorCard key={creator.id} creator={creator} />
        ))}

        {/* Card "Nova creator" com borda dashed */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="group flex flex-col items-center justify-center gap-3 rounded-[24px] border-2 border-dashed transition-all duration-300 hover:border-[#D7FF00]/50 hover:bg-[#0E0F10]/[0.04]"
          style={{
            aspectRatio: "3/4",
            borderColor: "#D9D9D4",
          }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200 group-hover:bg-[#0E0F10]/10"
            style={{ background: "#EEEFE9" }}
          >
            <Plus size={24} style={{ color: "#A9AAA5" }} />
          </div>
          <span
            className="font-bold uppercase tracking-widest"
            style={{ fontSize: "11px", color: "#A9AAA5" }}
          >
            Nova creator
          </span>
        </button>
      </div>

      {/* Estado vazio */}
      {creators.length === 0 && initialCreators.length === 0 && (
        <div
          className="flex flex-col items-center justify-center gap-4 rounded-[30px] py-20"
          style={{ background: "#FFFFFF" }}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: "#EEEFE9" }}
          >
            <Users size={28} style={{ color: "#A9AAA5" }} />
          </div>
          <p
            className="font-semibold"
            style={{ fontSize: "15px", color: "#A9AAA5" }}
          >
            Nenhum creator cadastrado.
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-full font-bold transition-opacity hover:opacity-90"
            style={{
              background: "#D7FF00",
              color: "#0E0F10",
              fontSize: "13px",
              padding: "10px 22px",
            }}
          >
            Adicionar primeiro creator
          </button>
        </div>
      )}

      {creators.length === 0 && initialCreators.length > 0 && (
        <div
          className="rounded-[30px] py-12 text-center"
          style={{ background: "#FFFFFF" }}
        >
          <p
            className="font-semibold"
            style={{ fontSize: "15px", color: "#A9AAA5" }}
          >
            Nenhum creator com esse filtro.
          </p>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="mt-4 rounded-full border px-5 py-2 text-sm font-semibold transition-colors hover:bg-[#EEEFE9]"
            style={{ borderColor: "#D9D9D4", color: "#0E0F10" }}
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
