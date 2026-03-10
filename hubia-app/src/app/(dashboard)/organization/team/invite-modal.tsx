"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Send } from "lucide-react";
import { HubiaPortal } from "@/components/ui/hubia-portal";
import { HubiaSelect } from "@/components/ui/hubia-select";
import { inviteMember } from "@/app/(dashboard)/config/equipe/actions";
import { toast } from "@/components/ui/hubia-toast";
import { MemberRole } from "@prisma/client";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin — gerencia membros e configurações" },
  { value: "editor", label: "Editor — acesso completo às funcionalidades" },
  { value: "viewer", label: "Visualizador — acesso somente leitura" },
];

export default function InviteModal({
  organizationId,
  onClose,
}: {
  organizationId: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("editor");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    const result = await inviteMember(organizationId, email.trim().toLowerCase(), role);
    setLoading(false);

    if (result.ok) {
      toast.success(`Convite enviado para ${email}`);
      onClose();
    } else {
      toast.error(result.error ?? "Erro ao enviar convite");
    }
  }

  return (
    <HubiaPortal>
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ backgroundColor: "rgba(14,15,16,0)" }}
          animate={{ backgroundColor: "rgba(14,15,16,0.70)", backdropFilter: "blur(12px)" }}
          exit={{ backgroundColor: "rgba(14,15,16,0)" }}
          transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="w-full max-w-[460px] rounded-[30px] bg-white p-7"
            initial={{ scale: 0.88, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 10, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-ink-500">Convidar membro</h2>
                <p className="mt-1 text-[13px] text-base-700">
                  A pessoa receberá um email com o link de acesso.
                </p>
              </div>
              <motion.button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-[12px] text-base-700"
                whileHover={{ rotate: 90, scale: 1.1, color: "var(--hubia-ink-500)" }}
                whileTap={{ rotate: 90, scale: 0.9 }}
                transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <X size={16} />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-ink-400 uppercase tracking-wide">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-700"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@empresa.com"
                    required
                    disabled={loading}
                    className="h-11 w-full rounded-[12px] border border-transparent bg-base-500 pl-10 pr-4 text-[14px] font-semibold text-ink-500 outline-none placeholder:text-base-700 focus:border-ink-500 focus:ring-2 focus:ring-ink-500/10 transition-[border-color] duration-150 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Role */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-ink-400 uppercase tracking-wide">
                  Permissão
                </label>
                <HubiaSelect
                  value={role}
                  onChange={(v) => setRole(v as MemberRole)}
                  options={ROLE_OPTIONS}
                  disabled={loading}
                />
              </div>

              {/* Info de permissão */}
              <div className="rounded-[12px] bg-base-500 p-3.5">
                {role === "admin" && (
                  <p className="text-[12px] text-ink-400 leading-relaxed">
                    <strong className="text-ink-500">Admin</strong> pode alterar plano, branding, domínio e gerenciar outros membros. Não pode alterar o proprietário.
                  </p>
                )}
                {role === "editor" && (
                  <p className="text-[12px] text-ink-400 leading-relaxed">
                    <strong className="text-ink-500">Editor</strong> tem acesso completo às funcionalidades operacionais: projetos, pedidos, creators, gerador e agentes.
                  </p>
                )}
                {role === "viewer" && (
                  <p className="text-[12px] text-ink-400 leading-relaxed">
                    <strong className="text-ink-500">Visualizador</strong> pode ver tudo mas não pode criar, editar ou deletar nada. Ideal para stakeholders externos.
                  </p>
                )}
              </div>

              {/* Botões */}
              <div className="mt-2 flex justify-end gap-3">
                <motion.button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="rounded-[14px] px-5 py-2.5 text-[13px] font-semibold text-ink-400 disabled:opacity-50"
                  whileHover={{ backgroundColor: "rgba(14,15,16,0.04)", scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="flex items-center gap-2 rounded-[14px] bg-limao-500 px-5 py-2.5 text-[13px] font-bold text-ink-500 disabled:opacity-50"
                  whileHover={{ scale: 1.03, backgroundColor: "#DFFF33" }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <Send size={14} />
                  {loading ? "Enviando..." : "Enviar convite"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </HubiaPortal>
  );
}
