"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, User, ShoppingCart, Menu, X, Flame, LogOut, Settings, Shield } from "lucide-react";
import type { AuthUser } from "@/lib/auth";
import { logout } from "@/app/(auth)/actions";
import { useCart } from "@/lib/cart-context";

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
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { totalItems, openCart } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
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

          {/* User menu / Login */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-surface-hover transition-colors"
                aria-label="Menu utente"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <span className="text-[11px] font-bold text-white leading-none">
                    {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:block text-sm font-medium text-foreground max-w-[120px] truncate">
                  {user.firstName || user.email.split("@")[0]}
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-border rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-border bg-stone-50/50">
                    <div className="text-sm font-medium text-foreground truncate">
                      {[user.firstName, user.lastName].filter(Boolean).join(" ") || user.email}
                    </div>
                    <div className="text-xs text-muted truncate">{user.email}</div>
                  </div>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-surface-hover transition-colors"
                    >
                      <Shield className="w-4 h-4 text-accent" />
                      Pannello Admin
                    </Link>
                  )}
                  <Link
                    href="/account"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-surface-hover transition-colors"
                  >
                    <Settings className="w-4 h-4 text-muted" />
                    Il mio account
                  </Link>
                  <form action={logout}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Esci
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="p-2.5 rounded-xl hover:bg-surface-hover transition-colors" aria-label="Account">
              <User className="w-5 h-5 text-foreground" />
            </Link>
          )}

          <button
            onClick={openCart}
            className="relative p-2.5 rounded-xl hover:bg-surface-hover transition-colors"
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
