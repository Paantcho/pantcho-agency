import { getPreferences } from "./actions";
import PreferenciasClient from "./preferencias-client";

export default async function PreferenciasPage() {
  const prefs = await getPreferences();

  return <PreferenciasClient initialPrefs={prefs} />;
}
