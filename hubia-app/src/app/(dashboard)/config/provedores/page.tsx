import {
  Plus,
  Bot,
  Key,
  Pencil,
} from "lucide-react";
import {
  getOrganizationIdForCurrentUser,
  getProviders,
  type ProviderRow,
} from "./actions";
import { AiProviderType } from "@prisma/client";
import ProvedoresClient from "./provedores-client";

const typeLabel: Record<AiProviderType, string> = {
  anthropic: "Texto",
  openai: "Texto + Imagem",
  google: "Texto",
  custom: "Custom",
};

export default async function ProvedoresPage() {
  const organizationId = await getOrganizationIdForCurrentUser();
  const providers: ProviderRow[] = organizationId
    ? await getProviders(organizationId)
    : [];

  return (
    <div className="flex flex-col gap-[24px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading-xs text-ink-500">Provedores de IA</h2>
          <p className="mt-[4px] text-body-md text-base-700">
            Gerencie as integrações com provedores de inteligência artificial.
            Chaves de API são sempre criptografadas.
          </p>
        </div>
        {organizationId && (
          <ProvedoresClient organizationId={organizationId} mode="add" />
        )}
      </div>

      <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 xl:grid-cols-3">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="flex flex-col justify-between gap-[20px] rounded-card bg-ink-500 p-[24px]"
          >
            <div className="flex flex-col gap-[16px]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-[10px]">
                  <Bot size={22} className="text-limao-500" />
                  <h3 className="text-heading-xs text-limao-500">
                    {provider.name}
                  </h3>
                </div>
                <span className="rounded-tag bg-ink-400 px-[10px] py-[4px] text-[9.3px] font-extrabold uppercase tracking-wider text-limao-500">
                  {typeLabel[provider.type]}
                </span>
              </div>

              <div className="flex items-center gap-[8px]">
                <Key size={14} className="text-base-700" />
                <span className="font-mono text-body-sm text-white">
                  {provider.maskedKey}
                </span>
              </div>

              <div>
                <span className="text-body-sm text-base-700">Modelo padrão</span>
                <p className="mt-[2px] text-label-sm text-white">
                  {provider.defaultModel || "—"}
                </p>
              </div>
            </div>

            {organizationId && (
              <ProvedoresClient
                organizationId={organizationId}
                mode="edit"
                providerId={provider.id}
                providerName={provider.name}
                providerType={provider.type}
                defaultModel={provider.defaultModel}
              />
            )}
          </div>
        ))}

        {organizationId && (
          <div className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center gap-[12px] rounded-card border-2 border-dashed border-sand-600 transition-colors duration-200 hover:border-limao-500 hover:bg-sand-100">
            <ProvedoresClient organizationId={organizationId} mode="add" asCard />
          </div>
        )}
      </div>
    </div>
  );
}
