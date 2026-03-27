"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShoppingBag, Truck, Lock, Minus, Plus, Trash2, Loader2, CreditCard, User } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useLocale } from "@/lib/locale-context";
import { useUser } from "@/lib/user-context";

const COUNTRIES = [
  "Italia", "Austria", "Belgio", "Bulgaria", "Croazia", "Danimarca",
  "Estonia", "Finlandia", "Francia", "Germania", "Grecia", "Irlanda",
  "Lettonia", "Lituania", "Lussemburgo", "Malta", "Paesi Bassi",
  "Polonia", "Portogallo", "Repubblica Ceca", "Romania", "Slovacchia",
  "Slovenia", "Spagna", "Svezia", "Ungheria", "Regno Unito", "Svizzera",
];

const COUNTRY_TO_NAME: Record<string, string> = {
  IT: "Italia", AT: "Austria", BE: "Belgio", BG: "Bulgaria",
  HR: "Croazia", DK: "Danimarca", EE: "Estonia", FI: "Finlandia",
  FR: "Francia", DE: "Germania", GR: "Grecia", IE: "Irlanda",
  LV: "Lettonia", LT: "Lituania", LU: "Lussemburgo", MT: "Malta",
  NL: "Paesi Bassi", PL: "Polonia", PT: "Portogallo",
  CZ: "Repubblica Ceca", RO: "Romania", SK: "Slovacchia",
  SI: "Slovenia", ES: "Spagna", SE: "Svezia", HU: "Ungheria",
  GB: "Regno Unito", CH: "Svizzera",
};

interface Profile {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  vat_number: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  country: string | null;
}

export default function CheckoutClient() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { t, formatPrice } = useLocale();
  const { dealerDiscount, isDealer } = useUser();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile for pre-fill
  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) setProfile(data.profile);
      })
      .catch(() => {})
      .finally(() => setProfileLoaded(true));
  }, []);

  const discountedTotal = dealerDiscount
    ? totalPrice * (1 - dealerDiscount / 100)
    : totalPrice;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mb-4">
          <ShoppingBag className="w-9 h-9 text-muted/40" />
        </div>
        <p className="text-foreground font-semibold mb-1">{t("checkout.empty")}</p>
        <p className="text-sm text-muted mb-6">{t("cart.empty.cta")}</p>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all"
        >
          {t("checkout.empty.cta")}
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPaying(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    const shippingInfo = {
      name: form.get("name") as string,
      email: form.get("email") as string,
      phone: form.get("phone") as string,
      address: form.get("address") as string,
      city: form.get("city") as string,
      zip: form.get("zip") as string,
      province: form.get("province") as string,
      country: form.get("country") as string,
      notes: form.get("notes") as string,
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
          })),
          shippingInfo,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error || "Errore durante il pagamento");
        setPaying(false);
        return;
      }

      // Clear cart before redirecting to Stripe
      clearCart();
      window.location.href = data.url;
    } catch {
      setError("Errore di connessione. Riprova.");
      setPaying(false);
    }
  }

  // Default values from profile
  const defaults = {
    name: profile
      ? [profile.first_name, profile.last_name].filter(Boolean).join(" ")
      : "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    address: profile?.address_line1 || "",
    city: profile?.city || "",
    zip: profile?.postal_code || "",
    province: profile?.province || "",
    country: profile?.country
      ? COUNTRY_TO_NAME[profile.country] || "Italia"
      : "Italia",
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-6 sm:py-10">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("checkout.back")}
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">{t("checkout.title")}</h1>

      {/* Logged-in indicator */}
      {profile && (
        <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
          <User className="w-4 h-4" />
          Dati precompilati dal tuo profilo. Puoi modificarli se necessario.
        </div>
      )}

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form - takes 3 cols */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
          {/* Shipping info */}
          <div className="bg-white rounded-2xl border border-border p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <Truck className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-bold text-foreground">{t("checkout.shipping_info")}</h2>
            </div>

            {!profileLoaded ? (
              <div className="flex items-center justify-center py-8 text-muted">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Caricamento...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground/70 mb-1.5">
                    {t("checkout.name")} *
                  </label>
                  <input
                    required
                    type="text"
                    name="name"
                    autoComplete="name"
                    defaultValue={defaults.name}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1.5">
                    {t("checkout.email")} *
                  </label>
                  <input
                    required
                    type="email"
                    name="email"
                    autoComplete="email"
                    defaultValue={defaults.email}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1.5">
                    {t("checkout.phone")}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    defaultValue={defaults.phone}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground/70 mb-1.5">
                    {t("checkout.address")} *
                  </label>
                  <input
                    required
                    type="text"
                    name="address"
                    autoComplete="street-address"
                    defaultValue={defaults.address}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1.5">
                    {t("checkout.city")} *
                  </label>
                  <input
                    required
                    type="text"
                    name="city"
                    autoComplete="address-level2"
                    defaultValue={defaults.city}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1.5">
                    {t("checkout.zip")} *
                  </label>
                  <input
                    required
                    type="text"
                    name="zip"
                    autoComplete="postal-code"
                    defaultValue={defaults.zip}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1.5">
                    Provincia
                  </label>
                  <input
                    type="text"
                    name="province"
                    autoComplete="address-level1"
                    defaultValue={defaults.province}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1.5">
                    {t("checkout.country")} *
                  </label>
                  <select
                    required
                    name="country"
                    defaultValue={defaults.country}
                    autoComplete="country-name"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground/70 mb-1.5">
                    {t("checkout.notes")}
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Payment info */}
          <div className="bg-white rounded-2xl border border-border p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-bold text-foreground">{t("checkout.payment")}</h2>
            </div>
            <p className="text-sm text-muted">
              Verrai reindirizzato alla pagina di pagamento sicura di Stripe per completare l&apos;ordine.
            </p>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {["Visa", "Mastercard", "Amex", "Apple Pay", "Google Pay"].map((m) => (
                <span
                  key={m}
                  className="px-2.5 py-1 rounded-md bg-stone-50 border border-border text-[10px] font-medium text-muted"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={paying || !profileLoaded}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-base hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {paying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Reindirizzamento a Stripe...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                {t("checkout.place_order")} — {formatPrice(discountedTotal)}
              </>
            )}
          </button>

          <p className="text-xs text-muted text-center">
            {t("checkout.terms")}
          </p>
        </form>

        {/* Order summary - takes 2 cols */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-5">
              <ShoppingBag className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-bold text-foreground">
                {t("checkout.summary")} ({totalItems})
              </h2>
            </div>

            <div className="space-y-3 mb-5 max-h-[45vh] overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 rounded-xl bg-stone-50/60 border border-border/50"
                >
                  <Link
                    href={`/products/${item.slug}`}
                    className="relative w-16 h-16 rounded-lg bg-white border border-border overflow-hidden shrink-0"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-muted/30">{item.name.charAt(0)}</span>
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1">{item.name}</p>
                    <p className="text-sm font-bold text-accent mt-0.5">{formatPrice(item.price)}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center gap-0 border border-border rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.quantity <= 1) removeItem(item.id);
                            else updateQuantity(item.id, item.quantity - 1);
                          }}
                          className="w-7 h-7 flex items-center justify-center hover:bg-stone-100 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 h-7 flex items-center justify-center text-xs font-medium border-x border-border bg-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-stone-100 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1 rounded text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">{t("cart.subtotal")}</span>
                <span className="font-medium text-foreground">{formatPrice(totalPrice)}</span>
              </div>
              {isDealer && dealerDiscount && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Sconto dealer ({dealerDiscount}%)</span>
                  <span className="font-medium text-green-600">
                    -{formatPrice(totalPrice - discountedTotal)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted">{t("checkout.shipping")}</span>
                <span className="text-muted text-xs">{t("checkout.calculated")}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-bold text-foreground">{t("checkout.total")}</span>
                <span className="text-xl font-bold text-accent">{formatPrice(discountedTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
