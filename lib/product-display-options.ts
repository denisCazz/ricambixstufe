/** Categoria che contiene display, cavi e telecomandi. */
export const DISPLAY_CATEGORY_SLUG = "display-cavi-telecomandi";

/** Display: richiede nota con tipo di display (modello stufa / variante). */
export function productNeedsDisplayTypeNote(p: {
  categorySlug: string;
  nameIt: string;
}): boolean {
  if (p.categorySlug !== DISPLAY_CATEGORY_SLUG) return false;
  const n = p.nameIt.toUpperCase();
  if (!n.includes("DISPLAY")) return false;
  if (n.includes("CAVO") || n.includes("TELECOMANDO")) return false;
  return true;
}
