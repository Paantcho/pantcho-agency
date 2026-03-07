import {
  Plus,
  Bot,
  Key,
  AlertCircle,
  CheckCircle2,
  Pencil,
} from "lucide-react";

/* ── Mock data ──────────────────────────────────────────────── */

type ProviderStatus = "connected" | "error";
type ProviderType = "TEXT_IMAGE" | "TEXT" | "IMAGE";

interface Provider {
  id: string;
  name: string;
  type: ProviderType;
  status: ProviderStatus;
  maskedKey: string;
  models: string;
}

const providers: Provider[] = [
  {
    id: "1",
    name: "OpenAI",
    type: "TEXT_IMAGE",
    status: "connected",
    maskedKey: "sk-...W4xQ",
    models: "GPT-4o, DALL-E 3",
  },
  {
    id: "2",
    name: "Anthropic",
    type: "TEXT",
    status: "connected",
    maskedKey: "sk-ant-...9kLm",
    models: "Claude 3.5 Sonnet",
  },
  {
    id: "3",
    name: "Midjourney",
    type: "IMAGE",
    status: "error",
    maskedKey: "mj-...pR7d",
    models: "v6.1",
  },
];

/* ── Helpers ─────────────────────────────────────────────────── */

const typeLabel: Record<ProviderType, string> = {
  TEXT_IMAGE: "Texto + Imagem",
  TEXT: "Texto",
  IMAGE: "Imagem",
};

function StatusDot({ status }: { status: ProviderStatus }) {
  return (
    <span className="flex items-center gap-[6px]">
      <span
        className={`inline-block h-[8px] w-[8px] rounded-full ${
          status === "connected" ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <span
        className={`text-body-sm ${
          status === "connected" ? "text-green-500" : "text-red-500"
        }`}
      >
        {status === "connected" ? "Conectado" : "Erro na conexão"}
      </span>
    </span>
  );
}

/* ── Page ────────────────────────────────────────────────────── */

export default function ProvedoresPage() {
  return (
    <div className="flex flex-col gap-[24px]">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading-xs text-ink-500">Provedores de IA</h2>
          <p className="mt-[4px] text-body-md text-base-700">
            Gerencie as integrações com provedores de inteligência artificial.
          </p>
        </div>

        <button
          className="inline-flex items-center gap-[8px] rounded-button bg-limao-500 px-[20px] py-[12px] text-label-sm font-bold text-ink-500 transition-colors duration-200 hover:bg-limao-400"
        >
          <Plus size={18} strokeWidth={2.5} />
          Adicionar provedor
        </button>
      </div>

      {/* Provider grid */}
      <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 xl:grid-cols-3">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="flex flex-col justify-between gap-[20px] rounded-card bg-ink-500 p-[24px]"
          >
            {/* Card top */}
            <div className="flex flex-col gap-[16px]">
              {/* Name + type badge */}
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

              {/* Status */}
              <StatusDot status={provider.status} />

              {/* API key */}
              <div className="flex items-center gap-[8px]">
                <Key size={14} className="text-base-700" />
                <span className="text-body-sm text-white font-mono">
                  {provider.maskedKey}
                </span>
              </div>

              {/* Models */}
              <div>
                <span className="text-body-sm text-base-700">Modelos</span>
                <p className="mt-[2px] text-label-sm text-white">
                  {provider.models}
                </p>
              </div>
            </div>

            {/* Card bottom */}
            <button className="inline-flex w-full items-center justify-center gap-[8px] rounded-button border border-white px-[16px] py-[10px] text-label-sm text-white transition-colors duration-200 hover:bg-white/10">
              <Pencil size={14} />
              Editar
            </button>
          </div>
        ))}

        {/* Empty / Add new card */}
        <div className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center gap-[12px] rounded-card border-2 border-dashed border-sand-600 transition-colors duration-200 hover:border-limao-500 hover:bg-sand-100">
          <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-sand-300">
            <Plus size={24} className="text-base-700" />
          </div>
          <span className="text-label-md text-base-700">
            Adicionar provedor
          </span>
        </div>
      </div>
    </div>
  );
}
