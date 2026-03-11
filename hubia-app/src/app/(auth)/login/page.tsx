"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "magic">("login");

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const supabase = createClient();

    if (mode === "magic") {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      });
      setLoading(false);
      if (error) {
        setError(error.message);
      } else {
        setError(null);
        setMode("login");
        setSuccess("Link mágico enviado! Verifique seu email.");
      }
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[400px] rounded-card bg-surface-500 p-[40px]">
      <h1 className="text-display-xs text-limao-500">hubia</h1>
      <p className="mt-[8px] text-body-md text-base-700">
        Entre na sua conta para continuar.
      </p>

      {error && (
        <div className="mt-[16px] rounded-card border border-red-500/30 bg-red-500/10 px-[16px] py-[12px] text-body-sm font-semibold text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-[16px] rounded-card border border-green-500/30 bg-green-500/10 px-[16px] py-[12px] text-body-sm font-semibold text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleEmailLogin} className="mt-[32px] flex flex-col gap-[16px]">
        <div className="relative">
          <Mail
            size={18}
            className="absolute left-[14px] top-1/2 -translate-y-1/2 text-base-700"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-input border border-base-600 bg-sand-100 py-[14px] pl-[42px] pr-[16px] text-body-sm text-ink-500 outline-none placeholder:text-base-700 focus:border-limao-500"
          />
        </div>

        {mode === "login" && (
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-[14px] top-1/2 -translate-y-1/2 text-base-700"
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-input border border-base-600 bg-sand-100 py-[14px] pl-[42px] pr-[16px] text-body-sm text-ink-500 outline-none placeholder:text-base-700 focus:border-limao-500"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-[8px] rounded-button bg-limao-500 px-[16px] py-[14px] text-label-md text-ink-500 transition-colors duration-200 hover:bg-limao-400 disabled:opacity-50"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {mode === "login" ? "Entrar" : "Enviar link mágico"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode(mode === "login" ? "magic" : "login")}
        className="mt-[12px] w-full text-center text-body-sm text-base-700 transition-colors hover:text-ink-500"
      >
        {mode === "login"
          ? "Entrar com link mágico"
          : "Entrar com email e senha"}
      </button>

      <div className="my-[24px] flex items-center gap-[12px]">
        <div className="h-px flex-1 bg-base-600" />
        <span className="text-body-sm text-base-700">ou</span>
        <div className="h-px flex-1 bg-base-600" />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="flex w-full items-center justify-center gap-[10px] rounded-button border border-base-600 bg-surface-500 px-[16px] py-[14px] text-label-md text-ink-500 transition-colors duration-200 hover:bg-sand-100 disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
            fill="#4285F4"
          />
          <path
            d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.26c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
            fill="#34A853"
          />
          <path
            d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
            fill="#FBBC05"
          />
          <path
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
            fill="#EA4335"
          />
        </svg>
        Entrar com Google
      </button>
    </div>
  );
}
