"use client";

import { AnimatePresence } from "framer-motion";
import ProductCard from "./ProductCard";
import { products } from "@/data/products";

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
          <h2 className="text-xl font-bold">Prodotti in Vetrina</h2>
          <p className="text-sm text-muted mt-1">
            {filtered.length} prodott{filtered.length === 1 ? "o" : "i"}{" "}
            {activeCategory ? "in questa categoria" : "disponibili"}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted text-lg">
            Nessun prodotto in questa categoria.
          </p>
          <p className="text-muted/60 text-sm mt-2">
            Prova a selezionare un&apos;altra categoria.
          </p>
        </div>
      )}
    </div>
  );
}
