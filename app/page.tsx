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

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      <Hero />

      {/* Category pills */}
      <section className="max-w-7xl mx-auto w-full py-6">
        <CategoryPills
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
      </section>

      {/* Main content */}
      <main
        id="prodotti"
        className="flex-1 max-w-7xl mx-auto w-full px-4 pb-16"
      >
        <div className="flex gap-8">
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
          <ProductGrid activeCategory={activeCategory} />
        </div>
      </main>

      <Footer />
      <CookieBanner />
    </div>
  );
}
