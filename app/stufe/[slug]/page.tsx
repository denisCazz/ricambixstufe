import { notFound } from "next/navigation";
import { eq, asc, getTableColumns } from "drizzle-orm";
import { getDb } from "@/db";
import { stoves, productStoves, products, categories, productImages } from "@/db/schema";
import { getCategories } from "@/lib/categories";
import { getUser } from "@/lib/auth";
import Footer from "@/components/Footer";
import StovePageClient from "./StovePageClient";

export async function generateStaticParams() {
  const db = getDb();
  const rows = await db
    .select({ slug: stoves.slug })
    .from(stoves)
    .where(eq(stoves.active, true));
  return rows.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = getDb();
  const [stove] = await db
    .select({ nameIt: stoves.nameIt })
    .from(stoves)
    .where(eq(stoves.slug, slug))
    .limit(1);
  if (!stove) return { title: "Stufa non trovata" };
  return {
    title: `Ricambi compatibili ${stove.nameIt} | Ricambi X Stufe`,
    description: `Tutti i ricambi compatibili con la stufa ${stove.nameIt}. Spedizione rapida in tutta Europa.`,
  };
}

export default async function StovePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const db = getDb();
  const p = getTableColumns(products);

  const [stoveRow] = await db
    .select()
    .from(stoves)
    .where(eq(stoves.slug, slug))
    .limit(1);

  if (!stoveRow) notFound();

  const [allCategories, user, productRows] = await Promise.all([
    getCategories(),
    getUser(),
    db
      .select({
        ...p,
        catName: categories.nameIt,
        catSlug: categories.slug,
      })
      .from(productStoves)
      .innerJoin(products, eq(productStoves.productId, products.id))
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(productStoves.stoveId, stoveRow.id))
      .orderBy(asc(products.id)),
  ]);

  // Fetch extra images
  const ids = productRows.map((r) => r.id);
  const imgMap = new Map<number, { id: number; image_url: string; sort_order: number; alt_text: string | null }[]>();
  if (ids.length) {
    const { inArray } = await import("drizzle-orm");
    const imgs = await db
      .select()
      .from(productImages)
      .where(inArray(productImages.productId, ids));
    for (const i of imgs) {
      const list = imgMap.get(i.productId) || [];
      list.push({ id: i.id, image_url: i.imageUrl, sort_order: i.sortOrder, alt_text: i.altText });
      imgMap.set(i.productId, list);
    }
    for (const list of imgMap.values()) list.sort((a, b) => a.sort_order - b.sort_order);
  }

  const mappedProducts = productRows.map(({ catName, catSlug, ...r }) => ({
    id: r.id,
    name: r.nameIt,
    slug: r.slug,
    description: r.descriptionShortIt || r.descriptionIt || "",
    price: Number(r.price),
    category: catName,
    categorySlug: catSlug,
    image: imgMap.get(r.id)?.[0]?.image_url ?? null,
    weight: r.weight ? Number(r.weight) : null,
    stockQuantity: r.stockQuantity,
    name_it: r.nameIt ?? undefined,
    name_en: r.nameEn ?? undefined,
    name_fr: r.nameFr ?? undefined,
    name_es: r.nameEs ?? undefined,
    description_it: r.descriptionShortIt || r.descriptionIt || undefined,
    description_en: r.descriptionShortEn || r.descriptionEn || undefined,
    description_fr: r.descriptionShortFr || r.descriptionFr || undefined,
    description_es: r.descriptionShortEs || r.descriptionEs || undefined,
  }));

  const mappedCategories = allCategories.map((c) => ({
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
      <StovePageClient
        stove={{
          id: stoveRow.id,
          nameIt: stoveRow.nameIt,
          nameEn: stoveRow.nameEn,
          nameFr: stoveRow.nameFr,
          nameEs: stoveRow.nameEs,
          slug: stoveRow.slug,
        }}
        products={mappedProducts}
        categories={mappedCategories}
        user={user}
      />
      <Footer />
    </div>
  );
}
