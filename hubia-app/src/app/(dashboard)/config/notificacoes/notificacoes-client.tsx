"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, Check, Mail, Zap, FolderKanban, Users } from "lucide-react";

type NotifItem = {
  id: string;
  label: string;
  descricao: string;
  icon: React.ElementType;
  ativo: boolean;
};

const initialNotifs: NotifItem[] = [
  {
    id: "pedidos",
    label: "Pedidos",
    descricao: "Novos pedidos, mudanças de status e aprovações",
    icon: Zap,
    ativo: true,
  },
  {
    id: "projetos",
    label: "Projetos",
    descricao: "Atualizações de progresso e marcos importantes",
    icon: FolderKanban,
    ativo: true,
  },
  {
    id: "equipe",
    label: "Equipe",
    descricao: "Novos membros, mudanças de role",
    icon: Users,
    ativo: false,
  },
  {
    id: "sistema",
    label: "Sistema",
    descricao: "Atualizações da plataforma e alertas técnicos",
    icon: Bell,
    ativo: true,
  },
  {
    id: "email",
    label: "E-mail digest",
    descricao: "Resumo semanal das atividades por e-mail",
    icon: Mail,
    ativo: false,
  },
];

function Toggle({
  ativo,
  onChange,
}: {
  ativo: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={() => onChange(!ativo)}
      className="relative h-6 w-11 rounded-full flex-shrink-0"
      initial={false}
      animate={{ backgroundColor: ativo ? "#D7FF00" : "#D9D9D4" }}
      transition={{ duration: 0.2 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute top-0.5 h-5 w-5 rounded-full bg-[#0E0F10]"
        animate={{ left: ativo ? "calc(100% - 22px)" : "2px" }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
}

export default function NotificacoesClient() {
  const [notifs, setNotifs] = useState<NotifItem[]>(initialNotifs);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleNotif(id: string, valor: boolean) {
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ativo: valor } : n))
    );
  }

  const ativos = notifs.filter((n) => n.ativo).length;

  async function handleSave() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header status */}
      <div className="rounded-[20px] bg-[#0E0F10] p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#D7FF00]">
            <Bell size={15} color="#0E0F10" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-white">Notificações</p>
            <p className="text-[12px] text-white/50">
              {ativos} de {notifs.length} canais ativos
            </p>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={() => setNotifs((prev) => prev.map((n) => ({ ...n, ativo: ativos < notifs.length })))}
          className="rounded-[10px] px-4 py-2 text-[12px] font-bold"
          initial={false}
          animate={{
            backgroundColor: ativos < notifs.length ? "#D7FF00" : "rgba(255,255,255,0.1)",
            color: ativos < notifs.length ? "#0E0F10" : "#FFFFFF",
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}
        >
          {ativos < notifs.length ? "Ativar todas" : "Desativar todas"}
        </motion.button>
      </div>

      {/* Lista de notificações */}
      <div className="rounded-[20px] bg-white p-6">
        <div className="flex flex-col gap-3">
          {notifs.map((notif, i) => {
            const Icon = notif.icon;
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.06, 0.3) }}
                className="flex items-center justify-between rounded-[12px] bg-[#EEEFE9] px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
                    style={{
                      backgroundColor: notif.ativo ? "#0E0F10" : "#D9D9D4",
                    }}
                  >
                    <Icon size={15} color={notif.ativo ? "#D7FF00" : "#FFFFFF"} />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#0E0F10]">{notif.label}</p>
                    <p className="text-[12px] text-[#A9AAA5]">{notif.descricao}</p>
                  </div>
                </div>
                <Toggle ativo={notif.ativo} onChange={(v) => toggleNotif(notif.id, v)} />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Salvar */}
      <div className="flex items-center justify-end gap-3">
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-[#43A047]"
            >
              <Check size={14} />
              Salvo
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="rounded-[18px] bg-[#D7FF00] px-6 py-3 text-[15px] font-semibold text-[#0E0F10] disabled:opacity-50"
          whileHover={{ scale: 1.03, backgroundColor: "#DFFF33" }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        >
          {loading ? "Salvando…" : "Salvar notificações"}
        </motion.button>
      </div>
    </div>
  );
}
