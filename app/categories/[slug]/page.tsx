import { notFound } from "next/navigation";
import { getProducts } from "@/lib/products";
import { getCategories, getCategoryBySlug } from "@/lib/categories";
import { createBuildClient } from "@/lib/supabase/server";
import Footer from "@/components/Footer";
import CategoryPageClient from "./CategoryPageClient";

export async function generateStaticParams() {
  const supabase = createBuildClient();
  const { data } = await supabase.from("categories").select("slug").eq("active", true);
  return (data || []).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Categoria non trovata" };
  return {
    title: `${category.name} | Ricambi X Stufe`,
    description: `Ricambi per stufe a pellet: ${category.name}. Spedizione rapida in tutta Europa.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, allCategories, { products: catProducts }] = await Promise.all([
    getCategoryBySlug(slug),
    getCategories(),
    getProducts({ categorySlug: slug }),
  ]);

  if (!category) notFound();

  const products = catProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.descriptionShort || p.description,
    price: p.price,
    category: p.category,
    categorySlug: p.categorySlug,
    image: p.image,
  }));

  const categories = allCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon || "Package",
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <CategoryPageClient
        category={{ ...category, icon: category.icon || "Package" }}
        products={products}
        categories={categories}
      />
      <Footer />
    </div>
  );
}
