"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Truck } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import { locales, type Locale } from "@/lib/i18n";

const languageLabels: Record<Locale, string> = {
  it: "Italiano",
  en: "English",
  fr: "Français",
  es: "Español",
};

export default function TopBar() {
  const { locale, setLocale, currency, setCurrencyCode, currencies, t } = useLocale();
  const [langOpen, setLangOpen] = useState(false);
  const [currOpen, setCurrOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const currRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node))
        setLangOpen(false);
      if (currRef.current && !currRef.current.contains(e.target as Node))
        setCurrOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white text-sm relative z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between h-9 sm:h-10 gap-2">
        {/* Shipping message */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="font-medium text-[10px] sm:text-xs tracking-wide truncate">
            {t("topbar.shipping")}
          </span>
        </div>

        {/* Language + Currency selectors */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Language */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => { setLangOpen(!langOpen); setCurrOpen(false); }}
              className="flex items-center gap-0.5 sm:gap-1 px-2 py-0.5 sm:py-1 rounded-md bg-white/20 hover:bg-white/30 transition-colors text-[10px] sm:text-xs font-semibold uppercase tracking-wide"
            >
              {locale}
              <ChevronDown className={`w-2.5 h-2.5 sm:w-3 sm:h-3 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1.5 bg-white border border-border rounded-xl shadow-xl overflow-hidden z-50 min-w-[140px]">
                {locales.map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLocale(l); setLangOpen(false); }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-surface-hover transition-colors ${
                      locale === l ? "text-accent font-semibold bg-orange-50" : "text-foreground"
                    }`}
                  >
                    {languageLabels[l]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Currency */}
          <div className="relative" ref={currRef}>
            <button
              onClick={() => { setCurrOpen(!currOpen); setLangOpen(false); }}
              className="flex items-center gap-0.5 sm:gap-1 px-2 py-0.5 sm:py-1 rounded-md bg-white/20 hover:bg-white/30 transition-colors text-[10px] sm:text-xs font-semibold"
            >
              {currency.symbol}
              <ChevronDown className={`w-2.5 h-2.5 sm:w-3 sm:h-3 transition-transform duration-200 ${currOpen ? "rotate-180" : ""}`} />
            </button>
            {currOpen && (
              <div className="absolute right-0 top-full mt-1.5 bg-white border border-border rounded-xl shadow-xl overflow-hidden z-50 min-w-[100px]">
                {currencies.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => { setCurrencyCode(c.code); setCurrOpen(false); }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-surface-hover transition-colors ${
                      currency.code === c.code ? "text-accent font-semibold bg-orange-50" : "text-foreground"
                    }`}
                  >
                    {c.symbol} {c.code}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
