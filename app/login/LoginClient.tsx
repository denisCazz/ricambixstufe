"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { login, resendVerificationEmail } from "@/app/(auth)/actions";
import { Eye, EyeOff, LogIn, AlertCircle, CheckCircle, ArrowLeft, Briefcase, MailWarning, RefreshCw, Headphones } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import FlameEffect from "@/components/FlameEffect";
import FireBackground from "@/components/FireBackground";

function LoginForm() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const registered = searchParams.get("registered");
  const dealerRegistered = searchParams.get("dealer_registered");
  const verified = searchParams.get("verified");
  const verifyError = searchParams.get("verify_error");

  const [error, setError] = useState<string | null>(null);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setEmailNotVerified(false);
    setResendSent(false);

    const formData = new FormData(e.currentTarget);
    formData.set("redirectTo", redirectTo);

    const result = await login(formData);
    if (result?.error) {
      if (result.error === "email_not_verified") {
        setPendingEmail(formData.get("email") as string);
        setEmailNotVerified(true);
      } else {
        setError(result.error);
      }
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!pendingEmail) return;
    setResendLoading(true);
    await resendVerificationEmail(pendingEmail);
    setResendLoading(false);
    setResendSent(true);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <FireBackground variant="full" />
      <div className="w-full max-w-md md:max-w-3xl relative z-10">
        {/* Flame Effect */}
        <div className="flex justify-center mb-6">
          <FlameEffect />
        </div>

        <div className="md:grid md:grid-cols-2 md:gap-6 md:items-start">

        <div className="bg-surface rounded-2xl shadow-lg shadow-black/5 border border-border p-8">
          <h2 className="text-xl font-bold text-foreground mb-6 text-center">
            {t("login.title")}
          </h2>

          {/* Success messages */}
          {verified && (
            <div className="mb-4 flex items-start gap-2 bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300 p-3 rounded-lg text-sm">
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{t("login.email_verified_success")}</span>
            </div>
          )}
          {verifyError && (
            <div className="mb-4 flex items-start gap-2 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 p-3 rounded-lg text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>
                {verifyError === "expired"
                  ? t("login.verify_link_expired")
                  : t("login.verify_link_invalid")}
              </span>
            </div>
          )}
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

          {/* Email not verified banner */}
          {emailNotVerified && (
            <div className="mb-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 p-4 rounded-lg text-sm">
              <div className="flex items-start gap-2 mb-3">
                <MailWarning className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <span>{t("login.email_not_verified")}</span>
              </div>
              {resendSent ? (
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  {t("login.resend_sent")}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-medium hover:underline disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${resendLoading ? "animate-spin" : ""}`} />
                  {t("login.resend_verification")}
                </button>
              )}
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
              <div className="mt-1.5 text-right">
                <Link href="/recupera-password" className="text-xs text-muted hover:text-accent transition-colors">
                  Password dimenticata?
                </Link>
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

        {/* Right column: Centro Assistenza / Rivenditori */}
        <div className="mt-4 md:mt-0 flex flex-col gap-4">

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 text-center shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-blue-900 dark:text-blue-200">Sei un Centro Assistenza?</h3>
          </div>
          <p className="text-sm text-blue-700/80 dark:text-blue-300/80 mb-5 leading-relaxed">
            I centri di assistenza e i rivenditori autorizzati hanno accesso a prezzi riservati e un&apos;area dedicata.
          </p>
          <Link
            href="/register/dealer"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            <Briefcase className="w-4 h-4" />
            Registrati come rivenditore
          </Link>
        </div>

        </div>{/* end right column */}

        </div>{/* end grid */}

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
