import HomeClient from "./HomeClient";
import { getProducts } from "@/lib/products";
import { getCategories } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ products: dbProducts }, dbCategories] = await Promise.all([
    getProducts(),
    getCategories(),
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
  }));

  const categories = dbCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon || "Package",
  }));

  return <HomeClient products={products} categories={categories} />;
}
