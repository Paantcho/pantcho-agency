import { Palette, Upload, Type } from "lucide-react";
import {
  getOrganizationIdForCurrentUser,
  getBranding,
  type BrandingData,
} from "./actions";
import BrandingColorForm from "./branding-color-form";

const DEFAULT_COLOR = "#D7FF00";
const DEFAULT_SCALE: Record<string, string> = {
  "50": "#FAFFD6",
  "100": "#F5FFB0",
  "200": "#EEFF7A",
  "300": "#E7FF4D",
  "400": "#DFFF33",
  "500": "#D7FF00",
  "600": "#B8DB00",
  "700": "#96B300",
  "800": "#728A00",
  "900": "#4E6000",
};

const fontWeights = [
  { weight: 400, label: "Regular" },
  { weight: 500, label: "Medium" },
  { weight: 600, label: "SemiBold" },
  { weight: 700, label: "Bold" },
  { weight: 800, label: "ExtraBold" },
];

function colorScaleToArray(scale: Record<string, string>) {
  return Object.entries(scale).map(([label, hex]) => ({ label, hex }));
}

export default async function BrandingPage() {
  const organizationId = await getOrganizationIdForCurrentUser();
  const branding: BrandingData | null = organizationId
    ? await getBranding(organizationId)
    : null;

  const colorPrimary = branding?.colorPrimary ?? DEFAULT_COLOR;
  const colorScale = branding?.colorScale ?? DEFAULT_SCALE;
  const scaleArray = colorScaleToArray(colorScale);

  return (
    <div className="space-y-6">
      <section className="rounded-card bg-surface-500 p-8">
        <div className="mb-6 flex items-center gap-3">
          <Palette className="h-5 w-5 text-ink-500" />
          <h2 className="text-heading-xs text-ink-500">Cor Primária</h2>
        </div>

        <div className="flex items-start gap-8">
          <div className="flex flex-col items-center gap-2">
            <div
              className="h-24 w-24 rounded-full border-2 border-base-600"
              style={{ backgroundColor: colorPrimary }}
            />
            <span className="text-label-sm text-ink-500">{colorPrimary}</span>
          </div>

          <div className="flex-1">
            <p className="mb-3 text-label-sm text-base-700">Escala de cor</p>
            <div className="flex flex-wrap items-center gap-3">
              {scaleArray.map((c) => (
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

        {organizationId && (
          <BrandingColorForm
            organizationId={organizationId}
            initialColor={colorPrimary}
          />
        )}
      </section>

      <section className="rounded-card bg-surface-500 p-8">
        <div className="mb-6 flex items-center gap-3">
          <Upload className="h-5 w-5 text-ink-500" />
          <h2 className="text-heading-xs text-ink-500">Logotipo</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <p className="mb-3 text-label-sm text-ink-500">Logo claro</p>
            <div className="flex flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed border-sand-600 bg-sand-100 px-6 py-12">
              <Upload className="h-8 w-8 text-base-700" />
              <p className="text-center text-body-md text-base-700">
                Arraste o arquivo ou clique para fazer upload
              </p>
              <p className="text-body-sm text-base-700">PNG, SVG — máx. 2 MB</p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-label-sm text-ink-500">Logo escuro</p>
            <div className="flex flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed border-sand-600 bg-ink-500 px-6 py-12">
              <Upload className="h-8 w-8 text-base-700" />
              <p className="text-center text-body-md text-base-700">
                Arraste o arquivo ou clique para fazer upload
              </p>
              <p className="text-body-sm text-base-700">PNG, SVG — máx. 2 MB</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-card bg-surface-500 p-8">
        <div className="mb-6 flex items-center gap-3">
          <Type className="h-5 w-5 text-ink-500" />
          <h2 className="text-heading-xs text-ink-500">Tipografia</h2>
        </div>

        <p className="mb-6 text-body-md text-base-700">
          Fonte em uso:{" "}
          <span className="text-label-md text-ink-500">Urbanist</span>
        </p>

        <div className="space-y-4">
          {fontWeights.map((fw) => (
            <div
              key={fw.weight}
              className="flex items-baseline gap-6 border-b border-sand-300 pb-4 last:border-none last:pb-0"
            >
              <span className="w-28 shrink-0 text-label-sm text-base-700">
                {fw.weight} {fw.label}
              </span>
              <p
                className="text-[24px] leading-[32px] text-ink-500"
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
