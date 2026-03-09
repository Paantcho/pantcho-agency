import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import PerfilClient from "./perfil-client";

export default async function PerfilPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const nome = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Usuário";
  const email = user?.email ?? "";

  return <PerfilClient nome={nome} email={email} />;
}
