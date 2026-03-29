"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import ProductGrid from "@/components/ProductGrid";
import Sidebar from "@/components/Sidebar";
import type { Product } from "@/data/products";
import type { Category } from "@/data/categories";
import { useLocale } from "@/lib/locale-context";

function getCategoryName(cat: Category, locale: string): string {
  const key = `name_${locale}` as keyof Category;
  return (cat[key] as string) || cat.name_it || cat.name;
}

export default function CategoryPageClient({
  category,
  products,
  categories,
}: {
  category: Category;
  products: Product[];
  categories: Category[];
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { locale } = useLocale();
  const categoryName = getCategoryName(category, locale);

  return (
    <>
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted mb-6">
          <Link href="/" className="hover:text-accent transition-colors">Home</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{categoryName}</span>
        </nav>

        <h1 className="text-2xl font-bold text-foreground mb-2">{categoryName}</h1>
        <p className="text-muted text-sm mb-8">
          {products.length} prodott{products.length === 1 ? "o" : "i"} disponibil{products.length === 1 ? "e" : "i"}
        </p>

        <div className="flex gap-8">
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            activeCategory={category.slug}
            onSelect={() => {}}
            categories={categories}
            products={products}
          />
          <ProductGrid activeCategory={null} products={products} />
        </div>
      </main>
    </>
  );
}
