import { createClient } from "@/lib/supabase/server";

export interface CategoryWithCount {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  productCount?: number;
  name_it?: string;
  name_en?: string;
  name_fr?: string;
  name_es?: string;
}

export async function getCategories(): Promise<CategoryWithCount[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name_it, name_en, name_fr, name_es, slug, icon, sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (data || []).map((cat) => ({
    id: cat.id,
    name: cat.name_it,
    slug: cat.slug,
    icon: cat.icon,
    name_it: cat.name_it ?? undefined,
    name_en: cat.name_en ?? undefined,
    name_fr: cat.name_fr ?? undefined,
    name_es: cat.name_es ?? undefined,
  }));
}

export async function getCategoryBySlug(
  slug: string
): Promise<CategoryWithCount | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name_it, name_en, name_fr, name_es, slug, icon")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name_it,
    slug: data.slug,
    icon: data.icon,
    name_it: data.name_it ?? undefined,
    name_en: data.name_en ?? undefined,
    name_fr: data.name_fr ?? undefined,
    name_es: data.name_es ?? undefined,
  };
}

export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const supabase = await createClient();

  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("id, name_it, name_en, name_fr, name_es, slug, icon, sort_order")
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
    name_it: cat.name_it ?? undefined,
    name_en: cat.name_en ?? undefined,
    name_fr: cat.name_fr ?? undefined,
    name_es: cat.name_es ?? undefined,
  }));
}
