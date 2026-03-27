"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, User, ShoppingCart, Menu, X, Flame } from "lucide-react";

export default function Header({
  onToggleSidebar,
  sidebarOpen,
}: {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-sm border-b border-border"
          : "bg-white border-b border-border/60"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16 gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-hover transition-colors"
            aria-label={sidebarOpen ? "Chiudi menu" : "Apri menu"}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-orange-500/30 transition-all duration-300">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold tracking-tight leading-none text-foreground">
                RICAMBI<span className="text-accent">X</span>STUFE
              </h1>
              <p className="text-[10px] text-muted tracking-[0.2em] uppercase">
                Ricambi per stufe a pellet
              </p>
            </div>
          </a>
        </div>

        <div className="flex-1 max-w-xl hidden md:block">
          <div className={`relative transition-all duration-300 ${searchFocused ? "scale-[1.02]" : ""}`}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Cerca ricambi, codici, modelli..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border text-sm text-foreground placeholder:text-muted focus:outline-none transition-all duration-300 ${
                searchFocused
                  ? "border-accent/50 shadow-lg shadow-accent/10 ring-1 ring-accent/20"
                  : "border-border hover:border-border-hover"
              }`}
            />
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setMobileSearch(!mobileSearch)}
            className="md:hidden p-2.5 rounded-xl hover:bg-surface-hover transition-colors"
            aria-label="Cerca"
          >
            {mobileSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>
          <Link href="/login" className="p-2.5 rounded-xl hover:bg-surface-hover transition-colors" aria-label="Account">
            <User className="w-5 h-5 text-foreground" />
          </Link>
          <button className="relative p-2.5 rounded-xl hover:bg-surface-hover transition-colors" aria-label="Carrello">
            <ShoppingCart className="w-5 h-5 text-foreground" />
            <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-accent rounded-full text-[10px] font-bold text-white flex items-center justify-center leading-none">
              0
            </span>
          </button>
        </div>
      </div>

      {mobileSearch && (
        <div className="md:hidden px-4 pb-3 border-t border-border/50">
          <div className="relative mt-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Cerca ricambi..."
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm placeholder:text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
            />
          </div>
        </div>
      )}
    </header>
  );
}
