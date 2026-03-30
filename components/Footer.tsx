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
      <div className="max-w-7xl mx-auto px-4 py-14 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-8">
          {/* Company info */}
          <div>
            <div className="mb-5">
              <Link href="/">
                <Image
                  src="/logo_con_scritte.png"
                  alt="RicambiXStufe"
                  width={300}
                  height={75}
                  className="h-25 sm:h-30 w-auto object-contain"
                />
              </Link>
            </div>
            <p className="text-sm text-muted leading-relaxed mb-5">
              {t("footer.description")}
            </p>
            <div className="space-y-2.5 text-sm text-muted">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-foreground">ELETTROSERVICE snc</span>
                  <br />
                  Viale Istria 1 | 31015 Conegliano (TV)
                  <br />
                  REA nr. TV 297485
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <a href="tel:+390438035469" className="hover:text-accent transition-colors">0438 35469</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <a href="mailto:info@ricambixstufe.it" className="hover:text-accent transition-colors">info@ricambixstufe.it</a>
              </div>
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=ELETTROSERVICE+snc+Viale+Istria+1+Conegliano+TV"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
            >
              <MapPin className="w-4 h-4" />
              {t("footer.find_us")}
            </a>
          </div>

          {/* Info links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted mb-5">
              {t("footer.info")}
            </h4>
            <ul className="space-y-2">
              {infoLinkKeys.map((link) => (
                <li key={link.key}>
                  <Link href={link.href} className="text-sm text-muted hover:text-accent transition-colors duration-200">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment methods */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted mb-5">
              {t("footer.payments")}
            </h4>
            <div className="flex items-center gap-3 flex-wrap">
              <Image src="/logo_eva_calor.png" alt="Eva Calor" width={80} height={40} className="object-contain" />
              <Image src="/punto_fuoco.png" alt="Punto Fuoco" width={80} height={40} className="object-contain" />
            </div>
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              {["Stripe", "Visa", "Mastercard", "Amex", "Apple Pay", "Google Pay"].map((m) => (
                <span
                  key={m}
                  className="px-2.5 py-1 rounded-md bg-stone-50 dark:bg-stone-800/50 border border-border text-[10px] font-medium text-muted"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} Ricambi X Stufe — ELETTROSERVICE snc. {t("footer.rights")}.
          </p>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <p className="text-xs text-muted/60">
              P.IVA 03771060260
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 text-center">
          <p className="text-xs text-muted/60">
            Sito realizzato da{" "}
            <a
              href="https://www.bitora.it"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground/70 hover:text-accent transition-colors"
            >
              Bitora.it
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
