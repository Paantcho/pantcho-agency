# Hubia App

App SaaS da Pantcho Agency (Next.js 15, Supabase, Prisma). Parte do monorepo [pantcho-agency](../).

## Autenticação (Supabase Auth)

- Login: email/senha, magic link e **Google OAuth**.
- Callback: `/auth/callback` troca o `code` por sessão e redireciona para `/` (ou `?next=...`).
- Middleware: em produção protege rotas e faz refresh da sessão; rotas públicas: `/login`, `/signup`, `/auth/*`.

### Configurar Google OAuth no Supabase

1. No [Dashboard Supabase](https://supabase.com/dashboard) do projeto: **Authentication → Providers → Google**.
2. Ative o provider e preencha **Client ID** e **Client Secret** (crie em [Google Cloud Console](https://console.cloud.google.com/apis/credentials) um OAuth 2.0 Client ID do tipo “Web application”).
3. Em **Redirect URLs** do Google, adicione:  
   `https://<seu-projeto>.supabase.co/auth/v1/callback`  
   e, para desenvolvimento:  
   `http://localhost:3000/auth/callback`.
4. No Supabase, em **URL Configuration**, defina **Site URL** (ex.: `http://localhost:3000` em dev e a URL de produção depois).

Sem isso, “Entrar com Google” pode falhar com erro de redirect.

### Chave de criptografia (Config → Provedores de IA)

Para adicionar ou editar provedores de IA, as API keys são criptografadas no banco. Defina em `.env.local`:

- `ENCRYPTION_KEY` — string com pelo menos 16 caracteres (ex.: uma chave aleatória de 32 chars). Use apenas em servidor; nunca exponha no client.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
