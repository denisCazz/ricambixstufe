import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Map country codes to currencies
const COUNTRY_CURRENCY: Record<string, string> = {
  GB: "GBP",
  US: "USD",
  // All other countries default to EUR
};

// Map Accept-Language prefixes to our supported locales
const LANG_MAP: Record<string, string> = {
  it: "it",
  en: "en",
  fr: "fr",
  es: "es",
};

function detectLocale(acceptLang: string | null): string | null {
  if (!acceptLang) return null;
  // Parse Accept-Language header: "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7"
  const parts = acceptLang.split(",").map((p) => {
    const [lang, qStr] = p.trim().split(";q=");
    return { lang: lang.trim().toLowerCase(), q: qStr ? parseFloat(qStr) : 1 };
  });
  parts.sort((a, b) => b.q - a.q);
  for (const { lang } of parts) {
    const prefix = lang.split("-")[0];
    if (LANG_MAP[prefix]) return LANG_MAP[prefix];
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  // Only set detection cookie if user doesn't already have saved preferences
  const hasPrefs = request.cookies.has("ricambixstufe_detected");
  const hasManualPrefs = request.cookies.has("ricambixstufe_locale_set");

  if (!hasPrefs && !hasManualPrefs) {
    const acceptLang = request.headers.get("accept-language");
    const country = request.headers.get("x-vercel-ip-country") || "";

    const detectedLocale = detectLocale(acceptLang) || "it";
    const detectedCurrency = COUNTRY_CURRENCY[country] || "EUR";

    response.cookies.set("ricambixstufe_detected", JSON.stringify({
      locale: detectedLocale,
      currency: detectedCurrency,
    }), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
