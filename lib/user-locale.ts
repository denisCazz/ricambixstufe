import { defaultLocale, locales, type Locale } from "@/lib/i18n";

const COUNTRY_LOCALE: Record<string, Locale> = {
  IT: "it",
  SM: "it",
  VA: "it",
  ITALIA: "it",
  FR: "fr",
  MC: "fr",
  BE: "fr",
  LU: "fr",
  FRANCIA: "fr",
  BELGIO: "fr",
  LUSSEMBURGO: "fr",
  ES: "es",
  AD: "es",
  SPAGNA: "es",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

export function parseLocale(value: unknown): Locale | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase().split("-")[0];
  return isLocale(normalized) ? normalized : null;
}

/** Maps ISO country codes and checkout country names to a supported email locale. */
export function localeFromCountry(country: string | null | undefined): Locale | null {
  if (!country?.trim()) return null;
  const key = country.trim().toUpperCase();
  if (COUNTRY_LOCALE[key]) return COUNTRY_LOCALE[key];
  return "en";
}

export function resolveEmailLocale(input?: {
  locales?: Array<string | null | undefined>;
  countries?: Array<string | null | undefined>;
}): Locale {
  for (const value of input?.locales ?? []) {
    const parsed = parseLocale(value);
    if (parsed) return parsed;
  }
  for (const country of input?.countries ?? []) {
    const fromCountry = localeFromCountry(country);
    if (fromCountry) return fromCountry;
  }
  return defaultLocale;
}
