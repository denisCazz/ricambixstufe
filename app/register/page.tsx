"use client";

import { useState } from "react";
import Link from "next/link";
import { register } from "../(auth)/actions";
import { Eye, EyeOff, UserPlus, AlertCircle, ArrowLeft, Briefcase } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import FlameEffect from "@/components/FlameEffect";
import FireBackground from "@/components/FireBackground";

export default function RegisterPage() {
  const { t } = useLocale();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError(t("register.passwords_mismatch"));
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError(t("register.password_min_length"));
      setLoading(false);
      return;
    }

    const result = await register(formData);
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
            {t("register.title")}
          </h2>

          {error && (
            <div className="mb-4 flex items-start gap-2 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 p-3 rounded-lg text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-foreground/70 mb-1.5">
                  {t("register.first_name")}
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  autoComplete="given-name"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-foreground/70 mb-1.5">
                  {t("register.last_name")}
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  autoComplete="family-name"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                />
              </div>
            </div>

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
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                  placeholder={t("register.password_placeholder")}
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground/70 mb-1.5">
                {t("register.confirm_password")}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                placeholder={t("register.confirm_placeholder")}
              />
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
                  <UserPlus className="w-4 h-4" />
                  {t("register.submit")}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-foreground/60">
            {t("register.has_account")}{" "}
            <Link href="/login" className="text-accent hover:underline font-medium">
              {t("login.submit")}
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
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Torna alla Home
          </Link>
        </div>
      </div>
    </div>
  );
}
