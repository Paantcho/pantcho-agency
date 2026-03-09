/**
 * HUBIA — Cliente Supabase Admin
 *
 * Usa a SERVICE_ROLE_KEY para operações privilegiadas:
 *   - Enviar convites por email (auth.admin.inviteUserByEmail)
 *   - Ler dados de usuários (auth.admin.listUsers / getUserById)
 *   - Deletar usuários
 *
 * NUNCA importe este arquivo em componentes client ("use client").
 * Use apenas em Server Components, Server Actions e API Routes.
 *
 * Requer a variável SUPABASE_SERVICE_ROLE_KEY no .env.local.
 */
import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    "[hubia] SUPABASE_SERVICE_ROLE_KEY não configurada — operações de admin (convites, listagem de usuários) estarão indisponíveis."
  );
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
