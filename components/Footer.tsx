"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import ThemeToggle from "@/components/ThemeToggle";

const infoLinkKeys = [
  { key: "footer.info_how_to_buy", href: "/come-acquistare" },
  { key: "footer.info_privacy", href: "/privacy" },
  { key: "footer.info_cookie_policy", href: "/cookie-policy" },
  { key: "footer.info_contact", href: "#contatti" },
  { key: "footer.info_terms", href: "/come-acquistare" },
];

export default function Footer() {
  const { t } = useLocale();

  return (
    <footer id="contatti" className="border-t border-border bg-surface">
      <div className="max-w-7xl mx-auto px-4 py-10 lg:py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">

          {/* Colonna 1: Logo */}
          <div className="col-span-2 lg:col-span-1 flex flex-col items-start">
            <Link href="/" className="mb-4 block">
              <Image
                src="/logo_con_scritte.png"
                alt="RicambiXStufe"
                width={200}
                height={55}
                className="h-14 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-muted leading-relaxed">
              {t("footer.description")}
            </p>
          </div>

          {/* Colonna 2: Contatti */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">
              Contatti
            </h4>
            <div className="space-y-2 text-xs text-muted">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-foreground">ELETTROSERVICE snc</span>
                  <br />
                  Viale Istria 1<br />
                  31015 Conegliano (TV)
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <a href="tel:+390438035469" className="hover:text-accent transition-colors">0438 35469</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <a href="mailto:info@ricambixstufe.it" className="hover:text-accent transition-colors break-all">info@ricambixstufe.it</a>
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=ELETTROSERVICE+snc+Viale+Istria+1+Conegliano+TV"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white text-[10px] font-semibold hover:shadow-md hover:shadow-orange-500/25 transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
              >
                <MapPin className="w-3 h-3" />
                {t("footer.find_us")}
              </a>
            </div>
          </div>

          {/* Colonna 3: Link utili */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">
              {t("footer.info")}
            </h4>
            <ul className="space-y-1.5">
              {infoLinkKeys.map((link) => (
                <li key={link.key}>
                  <Link href={link.href} className="text-xs text-muted hover:text-accent transition-colors duration-200">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonna 4: Pagamenti e marchi */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">
              {t("footer.payments")}
            </h4>
            <div className="flex flex-col gap-1 mb-4">
              {["PayPal", "Contrassegno", "Bonifico bancario"].map((m) => (
                <span
                  key={m}
                  className="inline-flex items-center gap-1.5 text-xs text-muted"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/60 shrink-0" />
                  {m}
                </span>
              ))}
            </div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">
              Marchi
            </h4>
            <div className="flex items-center gap-3 flex-wrap">
              <Image src="/logo_eva_calor.png" alt="Eva Calor" width={65} height={32} className="object-contain" />
              <Image src="/punto_fuoco.png" alt="Punto Fuoco" width={65} height={32} className="object-contain" />
            </div>
          </div>

        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} Ricambi X Stufe — ELETTROSERVICE snc. {t("footer.rights")}.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted/60">
              Sito realizzato da{" "}
              <a
                href="https://www.bitora.it"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-foreground/70 hover:text-accent transition-colors"
              >
                Bitora.it
              </a>
            </span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
