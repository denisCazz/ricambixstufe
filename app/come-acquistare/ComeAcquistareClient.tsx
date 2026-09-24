"use client";

import Link from "next/link";
import { ArrowLeft, CreditCard, Truck, Clock, Shield, Headphones, Package } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import type { ShippingPriceTier, ShippingZone } from "@/lib/shipping";

function fill(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template
  );
}

export default function ComeAcquistareClient({
  zones,
  codSurcharge,
}: {
  zones: {
    zone: ShippingZone;
    includesIva: boolean;
    tiers: ShippingPriceTier[];
  }[];
  codSurcharge: number;
}) {
  const { t, formatPrice } = useLocale();

  const shippingLines = zones.map((zone) => {
    const parts = zone.tiers.map((tier, index) => {
      const price = formatPrice(tier.price);
      const range =
        index === 0
          ? fill(t("how_to_buy.shipping_up_to"), { kg: String(tier.maxKg) })
          : fill(t("how_to_buy.shipping_between"), {
              from: String(tier.fromKg),
              kg: String(tier.maxKg),
            });
      return `${price} ${range}`;
    });
    const iva = zone.includesIva ? ` (${t("how_to_buy.shipping_iva_included")})` : "";
    return `${t(`how_to_buy.zone_${zone.zone}`)}: ${parts.join(" — ")}${iva}`;
  });

  const codLine = fill(t("how_to_buy.payment_cod"), {
    amount: formatPrice(codSurcharge),
  });

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-foreground)]/60 hover:text-[var(--color-accent)] transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("checkout.back_shop")}
        </Link>

        <h1 className="text-3xl font-bold text-[var(--color-foreground)] mb-8">
          {t("footer.info_how_to_buy")}
        </h1>

        <div className="space-y-8">
          <section className="bg-surface rounded-2xl border border-[var(--color-muted)]/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[var(--color-accent)]" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                {t("how_to_buy.payment_title")}
              </h2>
            </div>
            <div className="text-sm text-[var(--color-foreground)]/70 leading-relaxed space-y-2">
              <p>{t("how_to_buy.payment_intro")}</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{t("how_to_buy.payment_card")}</li>
                <li>{t("how_to_buy.payment_satispay")}</li>
                <li>{t("how_to_buy.payment_transfer")}</li>
                <li>{codLine}</li>
              </ul>
              <p>{t("how_to_buy.payment_note")}</p>
            </div>
          </section>

          <section className="bg-surface rounded-2xl border border-[var(--color-muted)]/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center">
                <Truck className="w-5 h-5 text-[var(--color-accent)]" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                {t("how_to_buy.shipping_title")}
              </h2>
            </div>
            <div className="text-sm text-[var(--color-foreground)]/70 leading-relaxed space-y-2">
              <p>{t("how_to_buy.shipping_intro")}</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                {shippingLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
                <li>{t("how_to_buy.shipping_fragile")}</li>
              </ul>
            </div>
          </section>

          <section className="bg-surface rounded-2xl border border-[var(--color-muted)]/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-[var(--color-accent)]" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                {t("how_to_buy.pickup_title")}
              </h2>
            </div>
            <div className="text-sm text-[var(--color-foreground)]/70 leading-relaxed space-y-2">
              <p>{t("how_to_buy.pickup_text")}</p>
              <p className="font-medium text-[var(--color-foreground)]">
                ELETTROSERVICE snc — Viale Istria 1, 31015 Conegliano (TV)
              </p>
            </div>
          </section>

          <section className="bg-surface rounded-2xl border border-[var(--color-muted)]/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[var(--color-accent)]" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                {t("how_to_buy.delivery_title")}
              </h2>
            </div>
            <div className="text-sm text-[var(--color-foreground)]/70 leading-relaxed space-y-2">
              <p>{t("how_to_buy.delivery_text")}</p>
            </div>
          </section>

          <section className="bg-surface rounded-2xl border border-[var(--color-muted)]/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[var(--color-accent)]" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                {t("how_to_buy.warranty_title")}
              </h2>
            </div>
            <div className="text-sm text-[var(--color-foreground)]/70 leading-relaxed space-y-2">
              <p>{t("how_to_buy.warranty_text")}</p>
            </div>
          </section>

          <section className="bg-surface rounded-2xl border border-[var(--color-muted)]/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center">
                <Headphones className="w-5 h-5 text-[var(--color-accent)]" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                {t("how_to_buy.support_title")}
              </h2>
            </div>
            <div className="text-sm text-[var(--color-foreground)]/70 leading-relaxed space-y-2">
              <p>{t("how_to_buy.support_text")}</p>
              <p>Email: <a href="mailto:info@ricambixstufe.it" className="text-[var(--color-accent)] hover:underline">info@ricambixstufe.it</a></p>
              <p>Tel: <a href="tel:+390438035469" className="text-[var(--color-accent)] hover:underline">0438 35469</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
