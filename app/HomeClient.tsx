"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ProductGrid from "@/components/ProductGrid";
import CategoryPills from "@/components/CategoryPills";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import FireBackground from "@/components/FireBackground";
import type { Product } from "@/data/products";
import type { Category } from "@/data/categories";
import type { AuthUser } from "@/lib/auth";
import type { StoveFilter } from "@/lib/types";

export type { StoveFilter };

export default function HomeClient({
  products,
  categories,
  user,
  stoves = [],
}: {
  products: Product[];
  categories: Category[];
  user: AuthUser | null;
  stoves?: StoveFilter[];
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeStoveId, setActiveStoveId] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col relative">
      <FireBackground variant="subtle" />
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        user={user}
      />

      <main id="prodotti" className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="lg:hidden mb-4">
          <CategoryPills
            activeCategory={activeCategory}
            onSelect={(slug) => { setActiveCategory(slug); setActiveStoveId(null); }}
            categories={categories}
          />
        </div>
        <div className="flex gap-8">
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            activeCategory={activeCategory}
            onSelect={(slug) => { setActiveCategory(slug); setActiveStoveId(null); }}
            categories={categories}
            products={products}
            stoves={stoves}
            activeStoveId={activeStoveId}
            onSelectStove={(id) => { setActiveStoveId(id); setActiveCategory(null); }}
          />
          <ProductGrid activeCategory={activeCategory} activeStoveId={activeStoveId} products={products} />
        </div>
      </main>

      <Footer />
      <CookieBanner />
    </div>
  );
}
