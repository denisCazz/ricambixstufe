"use client";

import { categories } from "@/data/categories";
import { products } from "@/data/products";
import {
  Cog,
  Wind,
  Fan,
  Zap,
  Monitor,
  Cpu,
  Flame,
  Thermometer,
  CircleDot,
  RotateCw,
  Home,
  Package,
  Gauge,
  Wrench,
  X,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Cog,
  Wind,
  Fan,
  Zap,
  Monitor,
  Cpu,
  Flame,
  Thermometer,
  CircleDot,
  RotateCw,
  Home,
  Package,
  Gauge,
  Wrench,
};

function getCategoryCount(slug: string): number {
  return products.filter((p) => p.categorySlug === slug).length;
}

export default function Sidebar({
  open,
  onClose,
  activeCategory,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  activeCategory: string | null;
  onSelect: (slug: string | null) => void;
}) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 lg:top-20 left-0 h-full lg:h-auto w-72 lg:w-64 z-50 lg:z-0 transition-transform duration-300 lg:translate-x-0 lg:shrink-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full lg:h-auto bg-neutral-950 lg:bg-transparent p-5 lg:p-0 overflow-y-auto">
          {/* Mobile close */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h3 className="text-lg font-bold">Categorie</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4 hidden lg:block">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4 px-2">
              Categorie
            </h3>
            <nav className="space-y-0.5">
              {categories.map((cat) => {
                const Icon = iconMap[cat.icon];
                const count = getCategoryCount(cat.slug);
                const isActive = activeCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelect(isActive ? null : cat.slug)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                      isActive
                        ? "bg-accent/15 text-accent"
                        : "text-muted hover:bg-white/5 hover:text-foreground"
                    }`}
                  >
                    {Icon && (
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive
                            ? "text-accent"
                            : "text-muted group-hover:text-foreground"
                        }`}
                      />
                    )}
                    <span className="truncate text-left flex-1">
                      {cat.name}
                    </span>
                    {count > 0 && (
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-md ${
                          isActive
                            ? "bg-accent/20 text-accent"
                            : "bg-white/5 text-muted"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Mobile list */}
          <nav className="space-y-0.5 lg:hidden">
            {categories.map((cat) => {
              const Icon = iconMap[cat.icon];
              const isActive = activeCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelect(isActive ? null : cat.slug);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-accent/15 text-accent"
                      : "text-muted hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 shrink-0" />}
                  <span className="truncate text-left">{cat.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
