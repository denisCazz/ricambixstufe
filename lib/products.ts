import { createClient } from "@/lib/supabase/server";

export interface ProductWithCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  descriptionShort: string;
  price: number;
  wholesalePrice: number | null;
  category: string;
  categorySlug: string;
  categoryId: number;
  image: string | null;
  sku: string | null;
  ean13: string | null;
  brand: string | null;
  weight: number | null;
  stockQuantity: number;
  metaTitle: string | null;
  metaDescription: string | null;
}

function mapProduct(
  p: Record<string, unknown>,
  categoryName?: string,
  categorySlug?: string
): ProductWithCategory {
  return {
    id: p.id as number,
    name: p.name_it as string,
    slug: p.slug as string,
    description: (p.description_it as string) || "",
    descriptionShort: (p.description_short_it as string) || "",
    price: Number(p.price),
    wholesalePrice: p.wholesale_price ? Number(p.wholesale_price) : null,
    category: categoryName || "",
    categorySlug: categorySlug || "",
    categoryId: p.category_id as number,
    image: p.image_url as string | null,
    sku: p.sku as string | null,
    ean13: p.ean13 as string | null,
    brand: p.brand as string | null,
    weight: p.weight ? Number(p.weight) : null,
    stockQuantity: p.stock_quantity as number,
    metaTitle: p.meta_title as string | null,
    metaDescription: p.meta_description as string | null,
  };
}

export async function getProducts(options?: {
  categorySlug?: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<{ products: ProductWithCategory[]; total: number }> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*, categories!inner(name_it, slug)", { count: "exact" })
    .eq("active", true)
    .order("id", { ascending: true });

  if (options?.categorySlug) {
    query = query.eq("categories.slug", options.categorySlug);
  }

  if (options?.search) {
    query = query.textSearch("search_vector", options.search, {
      type: "websearch",
      config: "italian",
    });
  }

  if (options?.limit) {
    const offset = options.offset || 0;
    query = query.range(offset, offset + options.limit - 1);
  }

  const { data, count, error } = await query;
  if (error) throw error;

  const products = (data || []).map((row) => {
    const cat = row.categories as unknown as { name_it: string; slug: string };
    return mapProduct(row, cat.name_it, cat.slug);
  });

  return { products, total: count || 0 };
}

export async function getProductBySlug(
  slug: string
): Promise<ProductWithCategory | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, categories!inner(name_it, slug)")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (error || !data) return null;

  const cat = data.categories as unknown as { name_it: string; slug: string };
  return mapProduct(data, cat.name_it, cat.slug);
}

export async function getRelatedProducts(
  productId: number,
  categoryId: number,
  limit = 4
): Promise<ProductWithCategory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, categories!inner(name_it, slug)")
    .eq("category_id", categoryId)
    .eq("active", true)
    .neq("id", productId)
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => {
    const cat = row.categories as unknown as { name_it: string; slug: string };
    return mapProduct(row, cat.name_it, cat.slug);
  });
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

export function applyDealerDiscount(
  price: number,
  discountPercent: number
): number {
  return price * (1 - discountPercent / 100);
}
