import { Palette, Upload, Type } from "lucide-react";

/* ---------- mock data ---------- */
const mockColor = "#D7FF00";
const colorScale = [
  { label: "50", hex: "#FAFFD6" },
  { label: "100", hex: "#F5FFB0" },
  { label: "200", hex: "#EEFF7A" },
  { label: "300", hex: "#E7FF4D" },
  { label: "400", hex: "#DFFF33" },
  { label: "500", hex: "#D7FF00" },
  { label: "600", hex: "#B8DB00" },
  { label: "700", hex: "#96B300" },
  { label: "800", hex: "#728A00" },
  { label: "900", hex: "#4E6000" },
];

const fontWeights = [
  { weight: 400, label: "Regular" },
  { weight: 500, label: "Medium" },
  { weight: 600, label: "SemiBold" },
  { weight: 700, label: "Bold" },
  { weight: 800, label: "ExtraBold" },
];

export default function BrandingPage() {
  return (
    <div className="space-y-6">
      {/* ======== Cor Primária ======== */}
      <section className="bg-surface-500 rounded-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="h-5 w-5 text-ink-500" />
          <h2 className="text-heading-xs text-ink-500">Cor Primária</h2>
        </div>

        {/* Swatch grande + escala */}
        <div className="flex items-start gap-8">
          {/* Swatch principal */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="h-24 w-24 rounded-full border-2 border-base-600"
              style={{ backgroundColor: mockColor }}
            />
            <span className="text-label-sm text-ink-500">{mockColor}</span>
          </div>

          {/* Escala 50–900 */}
          <div className="flex-1">
            <p className="text-label-sm text-base-700 mb-3">Escala de cor</p>
            <div className="flex items-center gap-3 flex-wrap">
              {colorScale.map((c) => (
                <div key={c.label} className="flex flex-col items-center gap-1">
                  <div
                    className="h-10 w-10 rounded-full border border-base-600"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-body-sm text-base-700">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Input + botão */}
        <div className="mt-8 flex items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm text-ink-500">Código hexadecimal</label>
            <input
              type="text"
              defaultValue={mockColor}
              className="bg-sand-300 text-body-md text-ink-500 rounded-input px-4 py-3 w-48 border-none outline-none focus:ring-2 focus:ring-limao-500"
            />
          </div>
          <button className="bg-limao-500 text-ink-500 text-label-md rounded-button px-6 py-3 hover:bg-limao-400 transition-colors">
            Salvar
          </button>
        </div>
      </section>

      {/* ======== Logotipo ======== */}
      <section className="bg-surface-500 rounded-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <Upload className="h-5 w-5 text-ink-500" />
          <h2 className="text-heading-xs text-ink-500">Logotipo</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo claro */}
          <div>
            <p className="text-label-sm text-ink-500 mb-3">Logo claro</p>
            <div className="border-2 border-dashed border-sand-600 rounded-card flex flex-col items-center justify-center gap-3 py-12 px-6 bg-sand-100">
              <Upload className="h-8 w-8 text-base-700" />
              <p className="text-body-md text-base-700 text-center">
                Arraste o arquivo ou clique para fazer upload
              </p>
              <p className="text-body-sm text-base-700">PNG, SVG — máx. 2 MB</p>
            </div>
          </div>

          {/* Logo escuro */}
          <div>
            <p className="text-label-sm text-ink-500 mb-3">Logo escuro</p>
            <div className="border-2 border-dashed border-sand-600 rounded-card flex flex-col items-center justify-center gap-3 py-12 px-6 bg-ink-500">
              <Upload className="h-8 w-8 text-base-700" />
              <p className="text-body-md text-base-700 text-center">
                Arraste o arquivo ou clique para fazer upload
              </p>
              <p className="text-body-sm text-base-700">PNG, SVG — máx. 2 MB</p>
            </div>
          </div>
        </div>
      </section>

      {/* ======== Tipografia ======== */}
      <section className="bg-surface-500 rounded-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <Type className="h-5 w-5 text-ink-500" />
          <h2 className="text-heading-xs text-ink-500">Tipografia</h2>
        </div>

        <p className="text-body-md text-base-700 mb-6">
          Fonte em uso: <span className="text-label-md text-ink-500">Urbanist</span>
        </p>

        <div className="space-y-4">
          {fontWeights.map((fw) => (
            <div
              key={fw.weight}
              className="flex items-baseline gap-6 border-b border-sand-300 pb-4 last:border-none last:pb-0"
            >
              <span className="text-label-sm text-base-700 w-28 shrink-0">
                {fw.weight} {fw.label}
              </span>
              <p
                className="text-ink-500 text-[24px] leading-[32px]"
                style={{ fontWeight: fw.weight }}
              >
                Hubia — Plataforma de gestão inteligente
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
