"use client";

import { useState } from "react";
import { ChevronDown, Truck } from "lucide-react";

const languages = [
  { code: "it", label: "Italiano" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
];

const currencies = [
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
];

export default function TopBar() {
  const [lang, setLang] = useState("it");
  const [currency, setCurrency] = useState("EUR");
  const [langOpen, setLangOpen] = useState(false);
  const [currOpen, setCurrOpen] = useState(false);

  return (
    <div className="bg-accent text-white text-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-10">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 hidden sm:block" />
          <span className="font-medium text-xs sm:text-sm">
            SPEDIAMO IN TUTTA EUROPA &mdash; CHIEDETECI UN PREVENTIVO
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => {
                setLangOpen(!langOpen);
                setCurrOpen(false);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded bg-white/20 hover:bg-white/30 transition-colors text-xs font-medium uppercase"
            >
              {lang}
              <ChevronDown className="w-3 h-3" />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 bg-neutral-900 border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 min-w-[140px]">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setLangOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-white/10 transition-colors ${
                      lang === l.code ? "text-accent font-semibold" : "text-white"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Currency selector */}
          <div className="relative">
            <button
              onClick={() => {
                setCurrOpen(!currOpen);
                setLangOpen(false);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded bg-white/20 hover:bg-white/30 transition-colors text-xs font-medium"
            >
              {currencies.find((c) => c.code === currency)?.symbol}{" "}
              {currency}
              <ChevronDown className="w-3 h-3" />
            </button>
            {currOpen && (
              <div className="absolute right-0 top-full mt-1 bg-neutral-900 border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 min-w-[100px]">
                {currencies.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCurrency(c.code);
                      setCurrOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-white/10 transition-colors ${
                      currency === c.code
                        ? "text-accent font-semibold"
                        : "text-white"
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
