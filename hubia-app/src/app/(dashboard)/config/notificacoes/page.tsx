import { getNotificationSettings } from "./actions";
import NotificacoesClient from "./notificacoes-client";

export default async function NotificacoesPage() {
  const settings = await getNotificationSettings();

  return <NotificacoesClient initialSettings={settings} />;
}
