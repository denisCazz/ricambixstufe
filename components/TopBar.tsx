"use client";

import { useState, useRef, useEffect } from "react";
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
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-10">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 hidden sm:block" />
          <span className="font-medium text-xs sm:text-sm tracking-wide">
            SPEDIAMO IN TUTTA EUROPA &mdash; CHIEDETECI UN PREVENTIVO
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative" ref={langRef}>
            <button
              onClick={() => { setLangOpen(!langOpen); setCurrOpen(false); }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/20 hover:bg-white/30 transition-colors text-xs font-semibold uppercase tracking-wide"
            >
              {lang}
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1.5 bg-white border border-border rounded-xl shadow-xl overflow-hidden z-50 min-w-[150px]">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-xs hover:bg-surface-hover transition-colors ${
                      lang === l.code ? "text-accent font-semibold bg-orange-50" : "text-foreground"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={currRef}>
            <button
              onClick={() => { setCurrOpen(!currOpen); setLangOpen(false); }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/20 hover:bg-white/30 transition-colors text-xs font-semibold"
            >
              {currencies.find((c) => c.code === currency)?.symbol} {currency}
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${currOpen ? "rotate-180" : ""}`} />
            </button>
            {currOpen && (
              <div className="absolute right-0 top-full mt-1.5 bg-white border border-border rounded-xl shadow-xl overflow-hidden z-50 min-w-[110px]">
                {currencies.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => { setCurrency(c.code); setCurrOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-xs hover:bg-surface-hover transition-colors ${
                      currency === c.code ? "text-accent font-semibold bg-orange-50" : "text-foreground"
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
