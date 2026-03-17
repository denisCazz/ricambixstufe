"use client";

import { AnimatePresence, LayoutGroup } from "framer-motion";
import ProductCard from "./ProductCard";
import { products } from "@/data/products";
import { PackageOpen } from "lucide-react";

export default function ProductGrid({
  activeCategory,
}: {
  activeCategory: string | null;
}) {
  const filtered = activeCategory
    ? products.filter((p) => p.categorySlug === activeCategory)
    : products;

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Prodotti in Vetrina</h2>
          <p className="text-sm text-muted mt-1">
            {filtered.length} prodott{filtered.length === 1 ? "o" : "i"}{" "}
            {activeCategory ? "in questa categoria" : "disponibili"}
          </p>
        </div>
      </div>

      <LayoutGroup>
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </AnimatePresence>
      </LayoutGroup>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-stone-100 border border-border flex items-center justify-center">
            <PackageOpen className="w-7 h-7 text-muted/40" />
          </div>
          <p className="text-foreground text-lg font-medium">
            Nessun prodotto in questa categoria.
          </p>
          <p className="text-muted text-sm mt-2">
            Prova a selezionare un&apos;altra categoria.
          </p>
        </div>
      )}
    </div>
  );
}
