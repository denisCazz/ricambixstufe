import HomeClient from "./HomeClient";
import { getProducts } from "@/lib/products";
import { getCategories } from "@/lib/categories";
import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ products: dbProducts }, dbCategories, user] = await Promise.all([
    getProducts(),
    getCategories(),
    getUser(),
  ]);

  // Map to the shape components expect
  const products = dbProducts.map((p) => ({
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

  const categories = dbCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon || "Package",
    name_it: c.name_it,
    name_en: c.name_en,
    name_fr: c.name_fr,
    name_es: c.name_es,
  }));

  return <HomeClient products={products} categories={categories} user={user} />;
}
