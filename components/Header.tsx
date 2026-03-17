"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-neutral-950/80 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-white/5"
          : "bg-neutral-950"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-orange-500/30 transition-shadow">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold tracking-tight leading-none">
                RICAMBI<span className="text-accent">X</span>STUFE
              </h1>
              <p className="text-[10px] text-muted tracking-widest uppercase">
                Ricambi per stufe a pellet
              </p>
            </div>
          </a>
        </div>

        {/* Center: search */}
        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <div
            className={`relative transition-all duration-300 ${
              searchFocused ? "scale-[1.02]" : ""
            }`}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Cerca ricambi..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border text-sm placeholder:text-muted focus:outline-none transition-all duration-300 ${
                searchFocused
                  ? "border-accent/50 bg-white/8 shadow-lg shadow-accent/10"
                  : "border-white/10 hover:border-white/20"
              }`}
            />
          </div>
        </div>

        {/* Right: icons */}
        <div className="flex items-center gap-1">
          <button className="md:hidden p-2.5 rounded-xl hover:bg-white/10 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2.5 rounded-xl hover:bg-white/10 transition-colors">
            <User className="w-5 h-5" />
          </button>
          <button className="relative p-2.5 rounded-xl hover:bg-white/10 transition-colors">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent rounded-full text-[10px] font-bold flex items-center justify-center">
              0
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
