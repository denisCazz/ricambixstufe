"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { login } from "../(auth)/actions";
import { Eye, EyeOff, LogIn, AlertCircle, CheckCircle } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const registered = searchParams.get("registered");
  const dealerRegistered = searchParams.get("dealer_registered");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("redirectTo", redirectTo);

    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
              Ricambi<span className="text-[var(--color-accent)]">X</span>Stufe
            </h1>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-[var(--color-muted)]/30 p-8">
          <h2 className="text-xl font-bold text-[var(--color-foreground)] mb-6 text-center">
            Accedi al tuo account
          </h2>

          {/* Success messages */}
          {registered && (
            <div className="mb-4 flex items-start gap-2 bg-green-50 text-green-800 p-3 rounded-lg text-sm">
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>Registrazione completata! Controlla la tua email per confermare l&apos;account.</span>
            </div>
          )}
          {dealerRegistered && (
            <div className="mb-4 flex items-start gap-2 bg-blue-50 text-blue-800 p-3 rounded-lg text-sm">
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>Richiesta dealer inviata! Riceverai un&apos;email dopo l&apos;approvazione dell&apos;amministratore.</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-start gap-2 bg-red-50 text-red-800 p-3 rounded-lg text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--color-foreground)]/70 mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-muted)]/40 bg-[var(--color-background)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition"
                placeholder="il.tuo@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--color-foreground)]/70 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border border-[var(--color-muted)]/40 bg-[var(--color-background)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-foreground)]/40 hover:text-[var(--color-foreground)]/60"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-[var(--color-accent)] text-white font-medium hover:bg-[var(--color-accent)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Accedi
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--color-foreground)]/60">
            Non hai un account?{" "}
            <Link href="/register" className="text-[var(--color-accent)] hover:underline font-medium">
              Registrati
            </Link>
          </div>

          <div className="mt-3 text-center text-sm text-[var(--color-foreground)]/60">
            Sei un rivenditore?{" "}
            <Link href="/register/dealer" className="text-[var(--color-accent)] hover:underline font-medium">
              Registrazione Dealer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
