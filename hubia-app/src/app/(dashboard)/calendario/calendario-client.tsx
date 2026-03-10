"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, X, ExternalLink, Flame, AlertTriangle, Clock } from "lucide-react";
import { getPedidosCalendario } from "./actions";
import type { CalendarioPedido } from "./actions";

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const URGENCIA_COLORS: Record<string, string> = {
  baixa: "#A9AAA5", media: "#5E5E5F", alta: "#FB8C00", critica: "#E53935",
};
const STATUS_COLORS: Record<string, string> = {
  rascunho: "#A9AAA5", aguardando: "#5E5E5F", em_andamento: "#D7FF00",
  revisao: "#FB8C00", aprovado: "#43A047", entregue: "#0E0F10",
};

function agruparPorDia(pedidos: CalendarioPedido[]): Record<number, CalendarioPedido[]> {
  const mapa: Record<number, CalendarioPedido[]> = {};
  for (const p of pedidos) {
    const dia = new Date(p.dueAt).getDate();
    if (!mapa[dia]) mapa[dia] = [];
    mapa[dia].push(p);
  }
  return mapa;
}

export default function CalendarioClient({
  organizationId,
  initialPedidos,
  initialAno,
  initialMes,
}: {
  organizationId: string;
  initialPedidos: CalendarioPedido[];
  initialAno: number;
  initialMes: number;
}) {
  const router = useRouter();
  const [ano, setAno] = useState(initialAno);
  const [mes, setMes] = useState(initialMes);
  const [pedidos, setPedidos] = useState(initialPedidos);
  const [loading, setLoading] = useState(false);
  const [drawerPedido, setDrawerPedido] = useState<CalendarioPedido | null>(null);

  const navegar = useCallback(async (novoAno: number, novoMes: number) => {
    setLoading(true);
    const data = await getPedidosCalendario(organizationId, novoAno, novoMes);
    setAno(novoAno);
    setMes(novoMes);
    setPedidos(data);
    setLoading(false);
  }, [organizationId]);

  const handleAnterior = () => {
    if (mes === 1) navegar(ano - 1, 12);
    else navegar(ano, mes - 1);
  };

  const handleProximo = () => {
    if (mes === 12) navegar(ano + 1, 1);
    else navegar(ano, mes + 1);
  };

  // Construir grade do mês
  const primeiroDia = new Date(ano, mes - 1, 1).getDay();
  const diasNoMes = new Date(ano, mes, 0).getDate();
  const porDia = agruparPorDia(pedidos);

  const celulas: (number | null)[] = [
    ...Array(primeiroDia).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];
  while (celulas.length % 7 !== 0) celulas.push(null);

  const hoje = new Date();
  const ehHoje = (dia: number) =>
    dia === hoje.getDate() && mes === hoje.getMonth() + 1 && ano === hoje.getFullYear();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#0E0F10]">Calendário</h1>
          <p className="text-[14px] text-[#A9AAA5] mt-0.5">
            {pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""} com prazo em {MESES[mes - 1]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button onClick={handleAnterior}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white"
            whileHover={{ scale: 1.08, backgroundColor: "#EEEFE9" }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.15 }}>
            <ChevronLeft size={16} color="#0E0F10" />
          </motion.button>
          <span className="min-w-[160px] text-center text-[16px] font-bold text-[#0E0F10]">
            {MESES[mes - 1]} {ano}
          </span>
          <motion.button onClick={handleProximo}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white"
            whileHover={{ scale: 1.08, backgroundColor: "#EEEFE9" }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.15 }}>
            <ChevronRight size={16} color="#0E0F10" />
          </motion.button>
        </div>
      </div>

      {/* Grade */}
      <motion.div
        className="rounded-[20px] bg-white overflow-hidden"
        animate={{ opacity: loading ? 0.5 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 border-b border-[#EEEFE9]">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="py-3 text-center text-[11px] font-bold text-[#A9AAA5] uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Células */}
        <div className="grid grid-cols-7">
          {celulas.map((dia, idx) => {
            const eventos = dia ? (porDia[dia] ?? []) : [];
            const isHoje = dia ? ehHoje(dia) : false;

            return (
              <div
                key={idx}
                className="min-h-[96px] border-b border-r border-[#EEEFE9] p-2 last:border-r-0"
                style={{ borderRight: (idx + 1) % 7 === 0 ? "none" : undefined }}
              >
                {dia && (
                  <>
                    <div className="flex items-center justify-center mb-1.5">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-semibold"
                        style={{
                          backgroundColor: isHoje ? "#D7FF00" : "transparent",
                          color: isHoje ? "#0E0F10" : "#5E5E5F",
                        }}
                      >
                        {dia}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {eventos.slice(0, 3).map((e) => (
                        <motion.button
                          key={e.id}
                          onClick={() => setDrawerPedido(e)}
                          className="w-full rounded-[4px] px-1.5 py-0.5 text-left text-[10px] font-semibold truncate"
                          style={{
                            backgroundColor: `${STATUS_COLORS[e.status] ?? "#A9AAA5"}22`,
                            color: STATUS_COLORS[e.status] ?? "#A9AAA5",
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          transition={{ duration: 0.1 }}
                        >
                          {e.titulo}
                        </motion.button>
                      ))}
                      {eventos.length > 3 && (
                        <span className="text-[10px] text-[#A9AAA5] pl-1">+{eventos.length - 3} mais</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Drawer lateral */}
      <AnimatePresence>
        {drawerPedido && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ backgroundColor: "rgba(14,15,16,0.70)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
              onClick={() => setDrawerPedido(null)}
            />
            <motion.div
              className="fixed right-0 top-0 bottom-0 z-50 flex w-[360px] flex-col bg-white shadow-none"
              style={{ borderRadius: "20px 0 0 20px" }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            >
              <div className="flex items-center justify-between border-b border-[#EEEFE9] p-5">
                <h2 className="text-[16px] font-bold text-[#0E0F10] truncate pr-4">{drawerPedido.titulo}</h2>
                <motion.button
                  onClick={() => setDrawerPedido(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEEFE9] flex-shrink-0"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                >
                  <X size={14} color="#0E0F10" />
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-[6px] bg-[#EEEFE9] px-2.5 py-1 text-[11px] font-semibold text-[#5E5E5F]">
                    {drawerPedido.tipo.replace("_", " ")}
                  </span>
                  <span
                    className="flex items-center gap-1 rounded-[6px] px-2.5 py-1 text-[11px] font-semibold"
                    style={{ backgroundColor: `${STATUS_COLORS[drawerPedido.status]}20`, color: STATUS_COLORS[drawerPedido.status] }}
                  >
                    {drawerPedido.status.replace("_", " ")}
                  </span>
                  <span
                    className="flex items-center gap-1 rounded-[6px] px-2.5 py-1 text-[11px] font-semibold"
                    style={{ backgroundColor: `${URGENCIA_COLORS[drawerPedido.urgencia]}18`, color: URGENCIA_COLORS[drawerPedido.urgencia] }}
                  >
                    {drawerPedido.urgencia === "critica" ? <Flame size={10} /> : drawerPedido.urgencia === "alta" ? <AlertTriangle size={10} /> : <Clock size={10} />}
                    {drawerPedido.urgencia}
                  </span>
                </div>

                {/* Prazo */}
                <div>
                  <p className="text-[11px] font-bold text-[#A9AAA5] uppercase tracking-wide mb-1">Prazo</p>
                  <p className="text-[14px] font-semibold text-[#0E0F10]">
                    {new Date(drawerPedido.dueAt).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                </div>

                {/* Creator */}
                {drawerPedido.creator && (
                  <div>
                    <p className="text-[11px] font-bold text-[#A9AAA5] uppercase tracking-wide mb-1.5">Creator</p>
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-[#EEEFE9] overflow-hidden">
                        {drawerPedido.creator.avatarUrl && (
                          <img src={drawerPedido.creator.avatarUrl} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <span className="text-[13px] font-semibold text-[#0E0F10]">{drawerPedido.creator.name}</span>
                    </div>
                  </div>
                )}

                {/* Projeto */}
                {drawerPedido.projeto && (
                  <div>
                    <p className="text-[11px] font-bold text-[#A9AAA5] uppercase tracking-wide mb-1">Projeto</p>
                    <p className="text-[13px] font-semibold text-[#0E0F10]">{drawerPedido.projeto.nome}</p>
                  </div>
                )}
              </div>

              {/* Rodapé do drawer */}
              <div className="border-t border-[#EEEFE9] p-5">
                <motion.button
                  onClick={() => router.push(`/pedidos/${drawerPedido.id}`)}
                  className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-[#D7FF00] py-3 text-[14px] font-semibold text-[#0E0F10]"
                  initial="rest"
                  animate="rest"
                  whileHover="hovered"
                  whileTap={{ scale: 0.96 }}
                  variants={{ rest: { scale: 1, backgroundColor: "#D7FF00" }, hovered: { scale: 1.02, backgroundColor: "#DFFF33" } }}
                  transition={{ duration: 0.15 }}
                >
                  <motion.span variants={{ rest: { x: 0 }, hovered: { x: 2 } }}>
                    <ExternalLink size={14} />
                  </motion.span>
                  Ver pedido completo
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
