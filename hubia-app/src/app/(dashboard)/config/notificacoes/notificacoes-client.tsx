"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Mail, Zap, FolderKanban, Users } from "lucide-react";
import { HubiaPageAction } from "@/components/ui/hubia-page-action";
import { saveNotificationSettings, type NotificationSettings } from "./actions";

type NotifItem = {
  id: string;
  label: string;
  descricao: string;
  icon: React.ElementType;
};

const notifChannels: NotifItem[] = [
  {
    id: "pedidos",
    label: "Pedidos",
    descricao: "Novos pedidos, mudanças de status e aprovações",
    icon: Zap,
  },
  {
    id: "projetos",
    label: "Projetos",
    descricao: "Atualizações de progresso e marcos importantes",
    icon: FolderKanban,
  },
  {
    id: "equipe",
    label: "Equipe",
    descricao: "Novos membros, mudanças de role",
    icon: Users,
  },
  {
    id: "sistema",
    label: "Sistema",
    descricao: "Atualizações da plataforma e alertas técnicos",
    icon: Bell,
  },
  {
    id: "email",
    label: "E-mail digest",
    descricao: "Resumo semanal das atividades por e-mail",
    icon: Mail,
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
      animate={{ backgroundColor: ativo ? "var(--hubia-limao-500)" : "#D9D9D4" }}
      transition={{ duration: 0.2 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute top-0.5 h-5 w-5 rounded-full bg-ink-500"
        animate={{ left: ativo ? "calc(100% - 22px)" : "2px" }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
}

export default function NotificacoesClient({
  initialSettings,
}: {
  initialSettings: NotificationSettings;
}) {
  const [settings, setSettings] = useState<NotificationSettings>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleNotif(id: string, valor: boolean) {
    setSettings((prev) => ({ ...prev, [id]: valor }));
  }

  const ativos = Object.values(settings).filter(Boolean).length;
  const total = notifChannels.length;

  async function handleSave() {
    setLoading(true);
    setError(null);
    const result = await saveNotificationSettings(settings);
    setLoading(false);
    if (result.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setError(result.error ?? "Erro ao salvar");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header status */}
      <div className="rounded-[30px] bg-ink-500 p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-limao-500">
            <Bell size={15} color="var(--hubia-ink-500)" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-white">Notificações</p>
            <p className="text-[12px] text-white/50">
              {ativos} de {total} canais ativos
            </p>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={() => {
            const allOn = ativos < total;
            const updated: NotificationSettings = {};
            notifChannels.forEach((n) => { updated[n.id] = allOn; });
            setSettings(updated);
          }}
          className="rounded-[12px] px-4 py-2 text-[12px] font-bold"
          initial={false}
          animate={{
            backgroundColor: ativos < total ? "var(--hubia-limao-500)" : "rgba(255,255,255,0.1)",
            color: ativos < total ? "var(--hubia-ink-500)" : "#FFFFFF",
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}
        >
          {ativos < total ? "Ativar todas" : "Desativar todas"}
        </motion.button>
      </div>

      {/* Lista de notificações */}
      <div className="rounded-[30px] bg-white p-6">
        <div className="flex flex-col gap-3">
          {notifChannels.map((notif, i) => {
            const Icon = notif.icon;
            const isAtivo = settings[notif.id] ?? false;
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.06, 0.3) }}
                className="flex items-center justify-between rounded-[12px] bg-base-500 px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px]"
                    style={{
                      backgroundColor: isAtivo ? "var(--hubia-ink-500)" : "#D9D9D4",
                    }}
                  >
                    <Icon size={15} color={isAtivo ? "var(--hubia-limao-500)" : "#FFFFFF"} />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-ink-500">{notif.label}</p>
                    <p className="text-[12px] text-base-700">{notif.descricao}</p>
                  </div>
                </div>
                <Toggle ativo={isAtivo} onChange={(v) => toggleNotif(notif.id, v)} />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Salvar */}
      <div className="flex items-center justify-end gap-3">
        {error && (
          <p className="text-[13px] font-semibold text-red-600">{error}</p>
        )}
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

        <HubiaPageAction
          icon={Check}
          iconRotate={false}
          onClick={handleSave}
          disabled={loading}
          loading={loading}
          loadingText="Salvando…"
        >
          Salvar notificações
        </HubiaPageAction>
      </div>
    </div>
  );
}
