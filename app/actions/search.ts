"use server";

import { createClient } from "@/lib/supabase/server";

export interface SearchResult {
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  category: string;
}

export async function searchProducts(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const supabase = await createClient();
  const term = query.trim();

  // Try ilike partial match for short queries or if text search fails
  const { data, error } = await supabase
    .from("products")
    .select("id, name_it, slug, price, image_url, categories!inner(name_it)")
    .eq("active", true)
    .or(`name_it.ilike.%${term}%,sku.ilike.%${term}%,description_it.ilike.%${term}%`)
    .limit(8);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id as number,
    name: row.name_it as string,
    slug: row.slug as string,
    price: Number(row.price),
    image: row.image_url as string | null,
    category: (row.categories as unknown as { name_it: string }).name_it,
  }));
}
