"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, User, ShoppingCart, Menu, X, LogOut, Settings, Shield, Loader2, Headphones, Globe, ChevronDown } from "lucide-react";
import type { AuthUser } from "@/lib/auth";
import { logout } from "@/app/(auth)/actions";
import { useCart } from "@/lib/cart-context";
import { useLocale } from "@/lib/locale-context";
import { searchProducts, type SearchResult } from "@/app/actions/search";
import { locales, type Locale } from "@/lib/i18n";

const languageLabels: Record<Locale, string> = {
  it: "IT",
  en: "EN",
  fr: "FR",
  es: "ES",
};

export default function Header({
  onToggleSidebar,
  sidebarOpen,
  user,
}: {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  user?: AuthUser | null;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currOpen, setCurrOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const currRef = useRef<HTMLDivElement>(null);
  const { totalItems, openCart } = useCart();
  const { locale, setLocale, currency, setCurrencyCode, currencies, t, formatPrice } = useLocale();

  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node))
        setLangOpen(false);
      if (currRef.current && !currRef.current.contains(e.target as Node))
        setCurrOpen(false);
      if (
        searchRef.current && !searchRef.current.contains(e.target as Node) &&
        mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
      if (
        !searchRef.current &&
        mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const doSearch = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }
    setSearching(true);
    setShowResults(true);
    debounceRef.current = setTimeout(async () => {
      const res = await searchProducts(value);
      setResults(res);
      setSearching(false);
    }, 300);
  }, []);

  function handleResultClick() {
    setShowResults(false);
    setQuery("");
    setMobileSearch(false);
  }

  const searchDropdown = (
    <div className="absolute left-0 right-0 top-full mt-1.5 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto">
      {searching ? (
        <div className="flex items-center justify-center gap-2 py-8 text-muted">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Ricerca...</span>
        </div>
      ) : results.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-muted">{t("search.no_results")} &ldquo;{query}&rdquo;</p>
        </div>
      ) : (
        results.map((r) => (
          <Link
            key={r.id}
            href={`/products/${r.slug}`}
            onClick={handleResultClick}
            className="flex items-center gap-3 px-4 py-3 hover:bg-surface-hover active:bg-surface-hover transition-colors border-b border-border/30 last:border-0"
          >
            <div className="relative w-12 h-12 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-border overflow-hidden shrink-0">
              {r.image ? (
                <Image src={r.image} alt={r.name} fill sizes="48px" className="object-contain p-1" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-muted/30">{r.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
              <p className="text-xs text-muted">{r.category}</p>
            </div>
            <span className="text-sm font-bold text-accent shrink-0">{formatPrice(r.price)}</span>
          </Link>
        ))
      )}
    </div>
  );

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-surface/80 backdrop-blur-xl shadow-sm" : "bg-surface"
      }`}
    >
      {/* Main navbar */}
      <div className="border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-3">
          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 min-w-0">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg hover:bg-surface-hover active:bg-surface-hover transition-colors shrink-0"
              aria-label={sidebarOpen ? "Chiudi menu" : "Apri menu"}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <a href="/" className="flex items-center group shrink-0">
              <Image
                src="/logo_senza_scritte.png"
                alt="RicambiXStufe"
                width={400}
                height={100}
                className="h-12 sm:h-16 w-auto object-contain"
                priority
              />
            </a>
            <Link
              href="/assistenza"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-accent hover:bg-surface-hover transition-colors"
            >
              <Headphones className="w-4 h-4" />
              {t("nav.assistenza")}
            </Link>

            {/* Language selector */}
            <div className="relative hidden md:block" ref={langRef}>
              <button
                onClick={() => { setLangOpen(!langOpen); setCurrOpen(false); }}
                className="flex items-center gap-0.5 p-2 rounded-lg hover:bg-surface-hover active:bg-surface-hover transition-colors text-xs font-semibold text-muted hover:text-foreground uppercase"
                aria-label="Lingua"
              >
                <Globe className="w-4 h-4" />
                <span className="ml-0.5">{locale}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
              </button>
              {langOpen && (
                <div className="absolute left-0 top-full mt-1.5 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-50 min-w-[120px]">
                  {locales.map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLocale(l); setLangOpen(false); }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-surface-hover active:bg-surface-hover transition-colors ${
                        locale === l ? "text-accent font-semibold bg-orange-50 dark:bg-orange-950/40" : "text-foreground"
                      }`}
                    >
                      {languageLabels[l]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency selector */}
            <div className="relative hidden md:block" ref={currRef}>
              <button
                onClick={() => { setCurrOpen(!currOpen); setLangOpen(false); }}
                className="flex items-center gap-0.5 p-2 rounded-lg hover:bg-surface-hover active:bg-surface-hover transition-colors text-xs font-bold text-muted hover:text-foreground"
                aria-label="Valuta"
              >
                {currency.symbol}
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${currOpen ? "rotate-180" : ""}`} />
              </button>
              {currOpen && (
                <div className="absolute left-0 top-full mt-1.5 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-50 min-w-[90px]">
                  {currencies.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => { setCurrencyCode(c.code); setCurrOpen(false); }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-surface-hover active:bg-surface-hover transition-colors ${
                        currency.code === c.code ? "text-accent font-semibold bg-orange-50 dark:bg-orange-950/40" : "text-foreground"
                      }`}
                    >
                      {c.symbol} {c.code}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: Desktop search */}
          <div className="flex-1 max-w-xl hidden md:block" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              {searching && <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted animate-spin" />}
              <input
                type="text"
                value={query}
                onChange={(e) => doSearch(e.target.value)}
                onFocus={() => { if (results.length > 0 || query.length >= 2) setShowResults(true); }}
                placeholder={t("search.placeholder")}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-background border text-sm text-foreground placeholder:text-muted focus:outline-none transition-all duration-200 border-border hover:border-border-hover focus:border-accent/50 focus:shadow-lg focus:shadow-accent/10 focus:ring-1 focus:ring-accent/20"
              />
              {showResults && query.length >= 2 && searchDropdown}
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            {/* Mobile search */}
            <button
              onClick={() => setMobileSearch(!mobileSearch)}
              className="md:hidden p-2 rounded-xl hover:bg-surface-hover active:bg-surface-hover transition-colors"
              aria-label="Cerca"
            >
              {mobileSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>

            {/* User menu / Login */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => { setUserMenuOpen(!userMenuOpen); }}
                  className="flex items-center gap-1.5 p-2 rounded-xl hover:bg-surface-hover active:bg-surface-hover transition-colors"
                  aria-label="Menu utente"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-white leading-none">
                      {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-foreground max-w-[100px] truncate">
                    {user.firstName || user.email.split("@")[0]}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-border bg-stone-50/50 dark:bg-stone-800/30">
                      <div className="text-sm font-medium text-foreground truncate">
                        {[user.firstName, user.lastName].filter(Boolean).join(" ") || user.email}
                      </div>
                      <div className="text-xs text-muted truncate">{user.email}</div>
                    </div>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-surface-hover active:bg-surface-hover transition-colors"
                      >
                        <Shield className="w-4 h-4 text-accent" />
                        {t("auth.admin")}
                      </Link>
                    )}
                    <Link
                      href="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-surface-hover active:bg-surface-hover transition-colors"
                    >
                      <Settings className="w-4 h-4 text-muted" />
                      {t("auth.account")}
                    </Link>
                    <form action={logout}>
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 active:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        {t("auth.logout")}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="p-2 rounded-xl hover:bg-surface-hover active:bg-surface-hover transition-colors" aria-label="Account">
                <User className="w-5 h-5 text-foreground" />
              </Link>
            )}

            {/* Spacer to push cart to far right */}
            <div className="w-px h-5 bg-border/60 mx-1 hidden sm:block" />

            {/* Cart — isolated far right */}
            <button
              onClick={openCart}
              className="relative p-2 rounded-xl hover:bg-surface-hover active:bg-surface-hover transition-colors"
              aria-label="Carrello"
            >
              <ShoppingCart className="w-5 h-5 text-foreground" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-accent rounded-full text-[10px] font-bold text-white flex items-center justify-center leading-none px-1">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile search expanded */}
      {mobileSearch && (
        <div className="md:hidden px-4 pb-3 border-b border-border/50bg-surface" ref={mobileSearchRef}>
          <div className="relative mt-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            {searching && <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted animate-spin" />}
            <input
              type="text"
              value={query}
              onChange={(e) => doSearch(e.target.value)}
              placeholder={t("search.placeholder.short")}
              autoFocus
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-background border border-border text-sm placeholder:text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
            />
            {showResults && query.length >= 2 && searchDropdown}
          </div>
        </div>
      )}
    </header>
  );
}
