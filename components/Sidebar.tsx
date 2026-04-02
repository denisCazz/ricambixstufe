"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Category } from "@/data/categories";
import type { Product } from "@/data/products";
import {
  Cog, Wind, Fan, Zap, Monitor, Cpu, Flame,
  Thermometer, CircleDot, RotateCw, Home, Package, Gauge, Wrench, X,
  Globe, ChevronDown, Headphones,
} from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import { locales, type Locale } from "@/lib/i18n";
import Link from "next/link";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Cog, Wind, Fan, Zap, Monitor, Cpu, Flame,
  Thermometer, CircleDot, RotateCw, Home, Package, Gauge, Wrench,
};

function getCategoryName(cat: Category, locale: string): string {
  const key = `name_${locale}` as keyof Category;
  return (cat[key] as string) || cat.name_it || cat.name;
}

export default function Sidebar({
  open,
  onClose,
  activeCategory,
  onSelect,
  categories,
  products,
}: {
  open: boolean;
  onClose: () => void;
  activeCategory: string | null;
  onSelect: (slug: string | null) => void;
  categories: Category[];
  products: Product[];
}) {
  const { t, locale, setLocale, currency, setCurrencyCode, currencies } = useLocale();
  const [langOpen, setLangOpen] = useState(false);
  const [currOpen, setCurrOpen] = useState(false);
  function getCategoryCount(slug: string): number {
    return products.filter((p) => p.categorySlug === slug).length;
  }
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const categoryList = (mobile: boolean) =>
    categories.map((cat) => {
      const Icon = iconMap[cat.icon];
      const count = getCategoryCount(cat.slug);
      const isActive = activeCategory === cat.slug;
      return (
        <button
          key={cat.id}
          onClick={() => { onSelect(isActive ? null : cat.slug); if (mobile) onClose(); }}
          className={`w-full flex items-center gap-3 px-3 ${mobile ? "py-3" : "py-2.5"} rounded-xl text-sm transition-all duration-200 group ${
            isActive
              ? "bg-orange-50 dark:bg-orange-950/40 text-accent font-medium"
              : "text-muted hover:bg-surface-hover hover:text-foreground"
          }`}
        >
          {Icon && (
            <Icon className={`w-4 h-4 shrink-0 transition-colors ${
              isActive ? "text-accent" : "text-muted/50 group-hover:text-foreground"
            }`} />
          )}
          <span className="truncate text-left flex-1">{getCategoryName(cat, locale)}</span>
          {count > 0 && !mobile && (
            <span className={`text-[11px] tabular-nums px-1.5 py-0.5 rounded-md ${
              isActive ? "bg-orange-100 text-accent" : "bg-background text-muted/50"
            }`}>
              {count}
            </span>
          )}
        </button>
      );
    });

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-[85vw] max-w-sm z-50 lg:hidden bg-surface border-r border-border shadow-xl"
            >
              <div className="h-full p-5 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-foreground">{t("sidebar.categories")}</h3>
                  <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-hover transition-colors" aria-label={t("sidebar.close")}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-0.5">{categoryList(true)}</nav>

                {/* Divider */}
                <div className="border-t border-border/60 my-4" />

                {/* Assistenza link */}
                <Link
                  href="/assistenza"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-muted hover:bg-surface-hover hover:text-foreground transition-all duration-200"
                >
                  <Headphones className="w-4 h-4 text-muted/50" />
                  <span>{t("sidebar.assistenza")}</span>
                </Link>

                {/* Language selector */}
                <div className="mt-2">
                  <button
                    onClick={() => setLangOpen(!langOpen)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-muted hover:bg-surface-hover hover:text-foreground transition-all"
                  >
                    <Globe className="w-4 h-4 text-muted/50" />
                    <span className="flex-1 text-left">{t("sidebar.language")}: <span className="font-semibold text-foreground uppercase">{locale}</span></span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${langOpen ? "rotate-180" : ""}`} />
                  </button>
                  {langOpen && (
                    <div className="ml-10 mt-1 space-y-0.5">
                      {locales.map((l) => (
                        <button
                          key={l}
                          onClick={() => { setLocale(l as Locale); setLangOpen(false); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                            locale === l ? "text-accent font-semibold bg-orange-50 dark:bg-orange-950/40" : "text-foreground hover:bg-surface-hover"
                          }`}
                        >
                          {l.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Currency selector */}
                <div className="mt-1">
                  <button
                    onClick={() => setCurrOpen(!currOpen)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-muted hover:bg-surface-hover hover:text-foreground transition-all"
                  >
                    <span className="w-4 h-4 flex items-center justify-center text-muted/50 font-bold text-xs">{currency.symbol}</span>
                    <span className="flex-1 text-left">{t("sidebar.currency")}: <span className="font-semibold text-foreground">{currency.code}</span></span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${currOpen ? "rotate-180" : ""}`} />
                  </button>
                  {currOpen && (
                    <div className="ml-10 mt-1 space-y-0.5">
                      {currencies.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => { setCurrencyCode(c.code); setCurrOpen(false); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                            currency.code === c.code ? "text-accent font-semibold bg-orange-50 dark:bg-orange-950/40" : "text-foreground hover:bg-surface-hover"
                          }`}
                        >
                          {c.symbol} {c.code}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside className="hidden lg:block w-64 shrink-0 sticky top-24 self-start z-10">
        <div className="bg-surface border border-border rounded-2xl p-4 shadow-sm">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-widest mb-4 px-2">
            {t("sidebar.categories")}
          </h3>
          <nav className="space-y-0.5">{categoryList(false)}</nav>
        </div>
      </aside>
    </>
  );
}
