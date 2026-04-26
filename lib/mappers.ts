import { productImages, products } from "@/db/schema";

type P = typeof products.$inferSelect;
type Img = typeof productImages.$inferSelect;

export function productToFormData(p: P) {
  return {
    id: p.id,
    name_it: p.nameIt,
    name_en: p.nameEn,
    name_fr: p.nameFr,
    name_es: p.nameEs,
    category_id: p.categoryId,
    price: Number(p.price),
    wholesale_price: p.wholesalePrice != null ? Number(p.wholesalePrice) : null,
    stock_quantity: p.stockQuantity,
    sku: p.sku,
    ean13: p.ean13,
    brand: p.brand,
    weight: p.weight != null ? Number(p.weight) : null,
    width: p.width != null ? Number(p.width) : null,
    height: p.height != null ? Number(p.height) : null,
    depth: p.depth != null ? Number(p.depth) : null,
    description_it: p.descriptionIt,
    description_en: p.descriptionEn,
    description_short_it: p.descriptionShortIt,
    description_short_en: p.descriptionShortEn,
    image_url: p.imageUrl,
    meta_title: p.metaTitle,
    meta_description: p.metaDescription,
    active: p.active,
  };
}

export function productImagesToForm(images: Img[]) {
  return images.map((i) => ({
    id: i.id,
    image_url: i.imageUrl,
    sort_order: i.sortOrder,
    alt_text: i.altText,
  }));
}
