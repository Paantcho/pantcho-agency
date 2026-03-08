import { getCreatorsForGerador } from "./actions";
import { GeradorClient } from "./gerador-client";

export const metadata = {
  title: "Gerador de Prompt — Hubia",
};

export default async function GeradorPage() {
  const creators = await getCreatorsForGerador();

  return <GeradorClient creators={creators} />;
}
