import { notFound } from "next/navigation";
import { getProducts } from "@/lib/products";
import { getCategories, getCategoryBySlug } from "@/lib/categories";
import { createBuildClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
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
  const [category, allCategories, { products: catProducts }, user] = await Promise.all([
    getCategoryBySlug(slug),
    getCategories(),
    getProducts({ categorySlug: slug }),
    getUser(),
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
    name_it: p.name_it,
    name_en: p.name_en,
    name_fr: p.name_fr,
    name_es: p.name_es,
    description_it: p.descriptionShort_it || p.description_it,
    description_en: p.descriptionShort_en || p.description_en,
    description_fr: p.descriptionShort_fr || p.description_fr,
    description_es: p.descriptionShort_es || p.description_es,
  }));

  const categories = allCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon || "Package",
    name_it: c.name_it,
    name_en: c.name_en,
    name_fr: c.name_fr,
    name_es: c.name_es,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <CategoryPageClient
        category={{ ...category, icon: category.icon || "Package", name_it: category.name_it, name_en: category.name_en, name_fr: category.name_fr, name_es: category.name_es }}
        products={products}
        categories={categories}
        user={user}
      />
      <Footer />
    </div>
  );
}
