"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookie_consent");
    if (!accepted) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-2xl mx-auto bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/40">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
            <Cookie className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground leading-relaxed mb-1">
              Utilizziamo i cookie per personalizzare contenuti e annunci,
              fornire le funzioni dei social media e analizzare il traffico.
            </p>
            <p className="text-xs text-muted leading-relaxed">
              Proseguendo la navigazione accetti l&apos;utilizzo dei cookie.{" "}
              <a href="#" className="text-accent hover:underline">
                Maggiori informazioni
              </a>
            </p>
          </div>
          <button
            onClick={accept}
            className="shrink-0 hidden sm:block"
            aria-label="Chiudi"
          >
            <X className="w-4 h-4 text-muted hover:text-foreground transition-colors" />
          </button>
        </div>
        <div className="flex gap-3 mt-4 ml-14">
          <button
            onClick={accept}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all"
          >
            Accetto
          </button>
          <a
            href="#"
            className="px-5 py-2 rounded-xl border border-white/10 text-sm font-medium text-muted hover:bg-white/5 hover:text-foreground transition-all"
          >
            Pi&ugrave; info
          </a>
        </div>
      </div>
    </div>
  );
}
