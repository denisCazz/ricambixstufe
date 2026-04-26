"use server";

import { and, or, ilike, eq, asc, getTableColumns } from "drizzle-orm";
import { getDb } from "@/db";
import { products, categories } from "@/db/schema";

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
  const term = `%${query.trim()}%`;
  const db = getDb();
  const p = getTableColumns(products);
  const rows = await db
    .select({
      id: p.id,
      nameIt: p.nameIt,
      slug: p.slug,
      price: p.price,
      imageUrl: p.imageUrl,
      catName: categories.nameIt,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(
        eq(products.active, true),
        or(
          ilike(products.nameIt, term),
          ilike(products.sku, term),
          ilike(products.descriptionIt, term)
        )
      )
    )
    .orderBy(asc(products.id))
    .limit(8);

  return rows.map((row) => ({
    id: row.id,
    name: row.nameIt,
    slug: row.slug,
    price: Number(row.price),
    image: row.imageUrl,
    category: row.catName,
  }));
}
