"use client";

import { useState } from "react";
import { Send, Mail } from "lucide-react";
import { HubiaModal } from "@/components/ui/hubia-modal";
import { HubiaPageAction } from "@/components/ui/hubia-page-action";
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
    <HubiaModal open onClose={onClose} title="Convidar membro" maxWidth="min(90vw, 460px)">
      <p className="text-[13px] text-base-700">
        A pessoa receberá um email com o link de acesso.
      </p>

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
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full border border-base-600 px-6 py-2.5 text-[13px] font-semibold text-ink-500 transition-colors hover:bg-base-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          <HubiaPageAction
            type="submit"
            icon={Send}
            iconSize={14}
            iconRotate={false}
            disabled={loading || !email.trim()}
            loading={loading}
            loadingText="Enviando..."
          >
            Enviar convite
          </HubiaPageAction>
        </div>
      </form>
    </HubiaModal>
  );
}
