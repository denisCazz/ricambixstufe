import { createClient } from "@/lib/supabase/server";

export interface CategoryWithCount {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  productCount?: number;
}

export async function getCategories(): Promise<CategoryWithCount[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name_it, slug, icon, sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (data || []).map((cat) => ({
    id: cat.id,
    name: cat.name_it,
    slug: cat.slug,
    icon: cat.icon,
  }));
}

export async function getCategoryBySlug(
  slug: string
): Promise<CategoryWithCount | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name_it, slug, icon")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name_it,
    slug: data.slug,
    icon: data.icon,
  };
}

export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const supabase = await createClient();

  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("id, name_it, slug, icon, sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (catError) throw catError;

  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("category_id")
    .eq("active", true);

  if (prodError) throw prodError;

  const countMap = new Map<number, number>();
  for (const p of products || []) {
    countMap.set(p.category_id, (countMap.get(p.category_id) || 0) + 1);
  }

  return (categories || []).map((cat) => ({
    id: cat.id,
    name: cat.name_it,
    slug: cat.slug,
    icon: cat.icon,
    productCount: countMap.get(cat.id) || 0,
  }));
}
