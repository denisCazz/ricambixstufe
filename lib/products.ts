import { createClient } from "@/lib/supabase/server";

export interface ProductImage {
  id: number;
  image_url: string;
  sort_order: number;
  alt_text: string | null;
}

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
  images: ProductImage[];
  sku: string | null;
  ean13: string | null;
  brand: string | null;
  weight: number | null;
  stockQuantity: number;
  metaTitle: string | null;
  metaDescription: string | null;
  name_it?: string;
  name_en?: string;
  name_fr?: string;
  name_es?: string;
  description_it?: string;
  description_en?: string;
  description_fr?: string;
  description_es?: string;
  descriptionShort_it?: string;
  descriptionShort_en?: string;
  descriptionShort_fr?: string;
  descriptionShort_es?: string;
}

function mapProduct(
  p: Record<string, unknown>,
  categoryName?: string,
  categorySlug?: string,
  images?: ProductImage[]
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
    images: images || [],
    sku: p.sku as string | null,
    ean13: p.ean13 as string | null,
    brand: p.brand as string | null,
    weight: p.weight ? Number(p.weight) : null,
    stockQuantity: p.stock_quantity as number,
    metaTitle: p.meta_title as string | null,
    metaDescription: p.meta_description as string | null,
    name_it: (p.name_it as string) || undefined,
    name_en: (p.name_en as string) || undefined,
    name_fr: (p.name_fr as string) || undefined,
    name_es: (p.name_es as string) || undefined,
    description_it: (p.description_it as string) || undefined,
    description_en: (p.description_en as string) || undefined,
    description_fr: (p.description_fr as string) || undefined,
    description_es: (p.description_es as string) || undefined,
    descriptionShort_it: (p.description_short_it as string) || undefined,
    descriptionShort_en: (p.description_short_en as string) || undefined,
    descriptionShort_fr: (p.description_short_fr as string) || undefined,
    descriptionShort_es: (p.description_short_es as string) || undefined,
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

  // Fetch product images
  const { data: images } = await supabase
    .from("product_images")
    .select("id, image_url, sort_order, alt_text")
    .eq("product_id", data.id)
    .order("sort_order", { ascending: true });

  const cat = data.categories as unknown as { name_it: string; slug: string };
  return mapProduct(data, cat.name_it, cat.slug, (images as ProductImage[]) || []);
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
