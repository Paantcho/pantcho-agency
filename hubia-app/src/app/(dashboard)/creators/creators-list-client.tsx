"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Users } from "lucide-react";
import type { CreatorRow } from "./actions";
import { NovaCreatorModal } from "./nova-creator-modal";

const PLACEHOLDER_AVATAR =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=800&fit=crop&crop=faces,top";

type Filter = "all" | "active" | "inactive";

const MotionLink = motion.create(Link);

function CreatorCard({ creator, index }: { creator: CreatorRow; index: number }) {
  const imageUrl = creator.avatarUrl?.trim() || PLACEHOLDER_AVATAR;
  const meta = creator.metadata ?? {};
  const isDraft = meta.isDraft === true;

  const age = meta.age ?? null;
  const city = meta.city ?? null;
  const state = meta.state ?? null;
  const platforms: string[] = meta.platforms ?? [];

  const location =
    city && state ? `${city}, ${state}` : city ?? state ?? null;

  return (
    <MotionLink
      href={`/creators/${creator.id}`}
      className="group relative flex flex-col overflow-hidden rounded-[30px] bg-ink-500"
      style={{ aspectRatio: "3/4" }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: Math.min(index * 0.06, 0.3) }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Foto fullbleed — parallax zoom só na imagem */}
      <div className="absolute inset-0 overflow-hidden rounded-[30px]">
        <img
          src={imageUrl}
          alt={creator.name}
          className={`h-full w-full object-cover object-top transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.12] ${
            !creator.isActive ? "grayscale" : ""
          }`}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(14,15,16,0.0) 0%, rgba(14,15,16,0.1) 40%, rgba(14,15,16,0.82) 70%, rgba(14,15,16,0.97) 100%)",
          }}
        />
      </div>

      {/* Tag Ativa/Inativa */}
      <div className="absolute left-4 top-4 z-10">
        <span
          className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest"
          style={{
            background: isDraft ? "#FF8C00" : "var(--hubia-ink-500)",
            color: isDraft ? "#FFFFFF" : "var(--hubia-limao-500)",
          }}
        >
          {isDraft ? "Rascunho" : creator.isActive ? "Ativa" : "Inativa"}
        </span>
      </div>

      {/* Bloco inferior */}
      <div className="relative z-10 mt-auto flex flex-col p-5">
        <h2
          className="font-bold"
          style={{
            fontSize: "clamp(18px,1.8vw,24px)",
            color: "var(--hubia-limao-500)",
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
          }}
        >
          {creator.name}
        </h2>

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

        {platforms.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {platforms.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize"
                style={{
                  background: "rgba(14,15,16,0.65)",
                  color: "var(--hubia-limao-500)",
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
    </MotionLink>
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
          style={{ fontSize: "28px", color: "var(--hubia-ink-500)" }}
        >
          Creators
        </h1>
        <div className="flex items-center gap-4">
          <span
            className="font-semibold"
            style={{ fontSize: "14px", color: "var(--hubia-bg-base-700)" }}
          >
            {ativasCount} {ativasCount === 1 ? "ativa" : "ativas"}
          </span>
          <motion.button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-full font-bold"
            style={{
              background: "var(--hubia-limao-500)",
              color: "var(--hubia-ink-500)",
              fontSize: "14px",
              padding: "10px 22px",
            }}
            initial="rest"
            whileHover="hovered"
            whileTap={{ scale: 0.96 }}
            animate="rest"
            variants={{
              rest: { scale: 1, backgroundColor: "var(--hubia-limao-500)" },
              hovered: { scale: 1.03, backgroundColor: "#DFFF33" },
            }}
            transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <motion.span
              className="flex items-center"
              variants={{ rest: { scale: 1, rotate: 0 }, hovered: { scale: 1.2, rotate: 90 } }}
              transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <Plus size={16} strokeWidth={2.5} />
            </motion.span>
            Nova creator
          </motion.button>
        </div>
      </div>

      {/* Grid de cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {creators.map((creator, i) => (
          <CreatorCard key={creator.id} creator={creator} index={i} />
        ))}

        {/* Card "Nova creator" dashed */}
        <motion.button
          type="button"
          onClick={() => setModalOpen(true)}
          className="group flex flex-col items-center justify-center gap-3 rounded-[30px] border-2 border-dashed"
          style={{ aspectRatio: "3/4", borderColor: "var(--hubia-sand-600)" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: Math.min(creators.length * 0.06, 0.3) }}
          whileHover={{ y: -4, borderColor: "rgba(215,255,0,0.5)" }}
          whileTap={{ scale: 0.98 }}
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
        </motion.button>
      </div>

      {/* Estado vazio — sem creators cadastrados */}
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
          <motion.button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-full font-bold"
            style={{
              background: "#D7FF00",
              color: "#0E0F10",
              fontSize: "13px",
              padding: "10px 22px",
            }}
            whileHover={{ scale: 1.03, backgroundColor: "#DFFF33" }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
          >
            Adicionar primeiro creator
          </motion.button>
        </div>
      )}

      {/* Estado vazio — filtro sem resultado */}
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
          <motion.button
            type="button"
            onClick={() => setFilter("all")}
            className="mt-4 rounded-full border px-5 py-2 text-sm font-semibold"
            style={{ borderColor: "#D9D9D4", color: "#0E0F10" }}
            whileHover={{ scale: 1.03, backgroundColor: "#EEEFE9" }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
          >
            Ver todos
          </motion.button>
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
