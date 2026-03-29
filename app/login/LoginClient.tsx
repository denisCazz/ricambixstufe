"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { login } from "@/app/(auth)/actions";
import { Eye, EyeOff, LogIn, AlertCircle, CheckCircle, ArrowLeft, Briefcase } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import FlameEffect from "@/components/FlameEffect";
import FireBackground from "@/components/FireBackground";

function LoginForm() {
  const { t } = useLocale();
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <FireBackground variant="full" />
      <div className="w-full max-w-md relative z-10">
        {/* Flame Effect */}
        <div className="flex justify-center mb-6">
          <FlameEffect />
        </div>

        <div className="bg-surface rounded-2xl shadow-lg shadow-black/5 border border-border p-8">
          <h2 className="text-xl font-bold text-foreground mb-6 text-center">
            {t("login.title")}
          </h2>

          {/* Success messages */}
          {registered && (
            <div className="mb-4 flex items-start gap-2 bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300 p-3 rounded-lg text-sm">
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{t("login.registered_success")}</span>
            </div>
          )}
          {dealerRegistered && (
            <div className="mb-4 flex items-start gap-2 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 p-3 rounded-lg text-sm">
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{t("login.dealer_registered_success")}</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-start gap-2 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 p-3 rounded-lg text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground/70 mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                placeholder={t("login.email_placeholder")}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground/70 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/60"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  {t("login.submit")}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-foreground/60">
            {t("login.no_account")}{" "}
            <Link href="/register" className="text-accent hover:underline font-medium">
              {t("login.register_link")}
            </Link>
          </div>
        </div>

        {/* Dealer / Service Center CTA Box */}
        <div className="mt-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-5 text-center shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-blue-900 dark:text-blue-200">{t("dealer_box.title")}</h3>
          </div>
          <p className="text-sm text-blue-700/80 dark:text-blue-300/80 mb-4 leading-relaxed">
            {t("dealer_box.description")}
          </p>
          <Link
            href="/register/dealer"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            <Briefcase className="w-4 h-4" />
            {t("dealer_box.register_cta")}
          </Link>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Torna alla Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginClient() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
