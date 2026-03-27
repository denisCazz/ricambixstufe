"use client";

import { useState } from "react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryPills from "@/components/CategoryPills";
import Sidebar from "@/components/Sidebar";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import type { Product } from "@/data/products";
import type { Category } from "@/data/categories";
import type { AuthUser } from "@/lib/auth";

export default function HomeClient({
  products,
  categories,
  user,
}: {
  products: Product[];
  categories: Category[];
  user: AuthUser | null;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        user={user}
      />

      <Hero />

      <section className="max-w-7xl mx-auto w-full px-4 pt-8 pb-4">
        <CategoryPills
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
          categories={categories}
        />
      </section>

      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <main id="prodotti" className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="flex gap-8">
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
            categories={categories}
            products={products}
          />
          <ProductGrid activeCategory={activeCategory} products={products} />
        </div>
      </main>

      <Footer />
      <CookieBanner />
    </div>
  );
}
