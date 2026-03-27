"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Category } from "@/data/categories";
import type { Product } from "@/data/products";
import {
  Cog, Wind, Fan, Zap, Monitor, Cpu, Flame,
  Thermometer, CircleDot, RotateCw, Home, Package, Gauge, Wrench, X,
} from "lucide-react";
import { useLocale } from "@/lib/locale-context";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Cog, Wind, Fan, Zap, Monitor, Cpu, Flame,
  Thermometer, CircleDot, RotateCw, Home, Package, Gauge, Wrench,
};

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
  const { t } = useLocale();
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
              ? "bg-orange-50 text-accent font-medium"
              : "text-muted hover:bg-surface-hover hover:text-foreground"
          }`}
        >
          {Icon && (
            <Icon className={`w-4 h-4 shrink-0 transition-colors ${
              isActive ? "text-accent" : "text-muted/50 group-hover:text-foreground"
            }`} />
          )}
          <span className="truncate text-left flex-1">{cat.name}</span>
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
              className="fixed top-0 left-0 h-full w-72 z-50 lg:hidden bg-white border-r border-border shadow-xl"
            >
              <div className="h-full p-5 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-foreground">{t("sidebar.categories")}</h3>
                  <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-hover transition-colors" aria-label={t("sidebar.close")}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-0.5">{categoryList(true)}</nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside className="hidden lg:block w-64 shrink-0 sticky top-24 self-start">
        <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-widest mb-4 px-2">
            {t("sidebar.categories")}
          </h3>
          <nav className="space-y-0.5">{categoryList(false)}</nav>
        </div>
      </aside>
    </>
  );
}
