/**
 * Danea Easyfatt product catalog import (XML spec:
 * https://www.danea.it/software/easyfatt/ecommerce/integrazione/invio-prodotti/)
 */

import { XMLParser } from "fast-xml-parser";
import { eq } from "drizzle-orm";
import type { getDb } from "@/db";
import { categories, products } from "@/db/schema";

type Db = ReturnType<typeof getDb>;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function extractText(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (typeof v === "string") {
    const t = v.trim();
    return t.length ? t : undefined;
  }
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (typeof v === "object" && "#text" in (v as object)) {
    const t = (v as { "#text": unknown })["#text"];
    if (typeof t === "string") return t.trim() || undefined;
    if (typeof t === "number" || typeof t === "boolean") return String(t);
  }
  return undefined;
}

type RawProduct = Record<string, unknown>;

function pickString(p: RawProduct, keys: string[]): string | undefined {
  for (const k of keys) {
    const t = extractText(p[k]);
    if (t) return t;
  }
  return undefined;
}

function pickDecimal(p: RawProduct, keys: string[]): string | undefined {
  for (const k of keys) {
    const t = extractText(p[k]);
    if (t === undefined) continue;
    const n = Number(t.replace(",", "."));
    if (!Number.isFinite(n)) continue;
    return n.toFixed(2);
  }
  return undefined;
}

function pickInt(p: RawProduct, keys: string[]): number | undefined {
  for (const k of keys) {
    const t = extractText(p[k]);
    if (t === undefined) continue;
    const n = parseInt(t, 10);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function buildCategoryDisplayName(p: RawProduct): string {
  const cat = pickString(p, ["Category"]) ?? "Senza categoria";
  const sub = pickString(p, ["Subcategory", "SubCategory"]);
  const extras = [2, 3, 4, 5, 6, 7, 8, 9].map((i) =>
    pickString(p, [`Subcategory${i}`, `SubCategory${i}`])
  ).filter(Boolean) as string[];
  const parts = [cat, sub, ...extras].filter(Boolean);
  return parts.join(" / ");
}

function firstGrossPrice(p: RawProduct): string | undefined {
  for (let i = 1; i <= 9; i++) {
    const v = pickDecimal(p, [`GrossPrice${i}`]);
    if (v) return v;
  }
  return undefined;
}

function firstNetPrice(p: RawProduct): string | undefined {
  for (let i = 1; i <= 9; i++) {
    const v = pickDecimal(p, [`NetPrice${i}`]);
    if (v) return v;
  }
  return undefined;
}

export interface DaneaImportStats {
  created: number;
  updated: number;
  deactivatedFull: number;
  deactivatedDeleted: number;
  skipped: number;
}

export interface DaneaImportTraceEntry {
  level: "info" | "warn" | "error";
  scope: "import" | "product" | "delete";
  code?: string;
  message: string;
}

export interface DaneaImportResult {
  ok: true;
  stats: DaneaImportStats;
  mode: "full" | "incremental" | "legacy";
  trace: DaneaImportTraceEntry[];
}

export interface DaneaImportError {
  ok: false;
  message: string;
  trace: DaneaImportTraceEntry[];
}

function normalizeProduct(row: RawProduct): {
  code: string;
  barcode?: string;
  nameIt: string;
  descriptionIt?: string;
  categoryDisplayName: string;
  price: string;
  wholesalePrice?: string;
  stockQuantity: number;
  weight?: string;
  width?: string;
  height?: string;
  depth?: string;
  brand?: string;
} | null {
  const code = pickString(row, ["Code"]);
  if (!code) return null;

  const nameIt = pickString(row, ["Description"]) ?? code;
  const descPlain = pickString(row, ["Notes"]);
  const descHtml = pickString(row, ["DescriptionHTML"]);
  const descriptionIt = descHtml ?? descPlain;

  const price =
    firstGrossPrice(row) ??
    firstNetPrice(row) ??
    "0";

  const wholesalePrice =
    pickDecimal(row, ["SupplierNetPrice"]) ?? pickDecimal(row, ["NetPrice2"]);

  const stockQuantity = pickInt(row, [
    "AvailableQty",
    "AvailableQuantity",
    "Qty",
    "Quantity",
    "Qta",
    "Stock",
    "OnHand",
  ]) ?? 0;

  const weight = pickDecimal(row, ["NetWeight"]) ?? pickDecimal(row, ["GrossWeight"]);

  const width = pickDecimal(row, ["NetSizeX"]) ?? pickDecimal(row, ["PackingSizeX"]);
  const height = pickDecimal(row, ["NetSizeY"]) ?? pickDecimal(row, ["PackingSizeY"]);
  const depth = pickDecimal(row, ["NetSizeZ"]) ?? pickDecimal(row, ["PackingSizeZ"]);

  const brand = pickString(row, ["ProducerName", "Producer", "Brand"]);

  const ean13 = pickString(row, ["Barcode", "BarCode"]);

  return {
    code,
    barcode: ean13,
    nameIt,
    descriptionIt,
    categoryDisplayName: buildCategoryDisplayName(row),
    price,
    wholesalePrice,
    stockQuantity,
    weight,
    width,
    height,
    depth,
    brand,
  };
}

function collectFromRoot(root: Record<string, unknown>): {
  mode: "full" | "incremental" | "legacy";
  toUpsert: RawProduct[];
  toDeleteCodes: string[];
} {
  const ef = root.EasyfattProducts as Record<string, unknown> | undefined;
  if (!ef || typeof ef !== "object") {
    throw new Error("Radice XML mancante o non valida: EasyfattProducts");
  }

  const modeAttr = String(ef["@_Mode"] ?? "")
    .trim()
    .toLowerCase();
  const mode: "full" | "incremental" | "legacy" =
    modeAttr === "incremental"
      ? "incremental"
      : modeAttr === "full"
        ? "full"
        : "legacy";

  const toUpsert: RawProduct[] = [];

  const pushContainer = (container: unknown) => {
    if (!container || typeof container !== "object") return;
    const c = container as Record<string, unknown>;
    const prods = c.Product;
    const arr = Array.isArray(prods) ? prods : prods ? [prods] : [];
    for (const p of arr) {
      if (p && typeof p === "object") {
        toUpsert.push(p as RawProduct);
      }
    }
  };

  pushContainer(ef.Products);
  pushContainer(ef.UpdatedProducts);

  const toDeleteCodes: string[] = [];
  const del = ef.DeletedProducts as Record<string, unknown> | undefined;
  if (del?.Product) {
    const arr = Array.isArray(del.Product) ? del.Product : [del.Product];
    for (const p of arr) {
      if (p && typeof p === "object") {
        const code = pickString(p as RawProduct, ["Code"]);
        if (code) toDeleteCodes.push(code);
      }
    }
  }

  return { mode, toUpsert, toDeleteCodes };
}

async function upsertCategoryId(db: Db, displayName: string): Promise<number> {
  const nameIt = displayName.trim() || "Senza categoria";
  const baseSlug = slugify(nameIt) || `cat-${Date.now()}`;

  const existing = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, baseSlug))
    .limit(1);

  if (existing[0]) return existing[0].id;

  const [row] = await db
    .insert(categories)
    .values({
      nameIt,
      slug: baseSlug,
      sortOrder: 0,
      active: true,
    })
    .returning({ id: categories.id });

  return row.id;
}

/** Parse Danea Easyfatt catalog XML into structured lists. */
export function parseEasyfattProductsXml(xml: string): {
  mode: "full" | "incremental" | "legacy";
  toUpsert: RawProduct[];
  toDeleteCodes: string[];
} {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    trimValues: true,
  });

  const parsed = parser.parse(xml);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("XML non valido o vuoto");
  }
  return collectFromRoot(parsed as Record<string, unknown>);
}

export async function syncEasyfattCatalog(
  db: Db,
  xml: string
): Promise<DaneaImportResult | DaneaImportError> {
  let bundle: ReturnType<typeof parseEasyfattProductsXml>;
  try {
    bundle = parseEasyfattProductsXml(xml);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Errore parse XML";
    return {
      ok: false,
      message: msg,
      trace: [{ level: "error", scope: "import", message: msg }],
    };
  }

  const { mode, toUpsert } = bundle;
  const { toDeleteCodes } = bundle;

  const stats: DaneaImportStats = {
    created: 0,
    updated: 0,
    deactivatedFull: 0,
    deactivatedDeleted: 0,
    skipped: 0,
  };
  const trace: DaneaImportTraceEntry[] = [
    {
      level: "info",
      scope: "import",
      message: `Import ricevuto: mode=${mode}, prodotti=${toUpsert.length}, eliminazioni=${toDeleteCodes.length}`,
    },
  ];

  for (const code of toDeleteCodes) {
    trace.push({
      level: "info",
      scope: "delete",
      code,
      message: "Prodotto segnalato in DeletedProducts (nessuna disattivazione automatica applicata).",
    });
  }

  try {

    for (const raw of toUpsert) {
      const n = normalizeProduct(raw);
      if (!n) {
        stats.skipped++;
        trace.push({
          level: "warn",
          scope: "product",
          message: "Prodotto saltato: codice assente o record non normalizzabile.",
        });
        continue;
      }

      const existing = await db
        .select({
          id: products.id,
          price: products.price,
          wholesalePrice: products.wholesalePrice,
          stockQuantity: products.stockQuantity,
        })
        .from(products)
        .where(eq(products.sku, n.code))
        .limit(1);

      if (!existing.length) {
        // Prodotto non presente nel catalogo: ignorato.
        // I prodotti vengono caricati manualmente dagli amministratori.
        stats.skipped++;
        trace.push({
          level: "warn",
          scope: "product",
          code: n.code,
          message: `Saltato: SKU non trovato nel catalogo locale. prezzo=${n.price}, ingrosso=${n.wholesalePrice ?? "-"}, qty=${n.stockQuantity}`,
        });
        continue;
      }

      const previous = existing[0];

      // Aggiorna solo prezzo, prezzo ingrosso e quantità disponibile.
      await db
        .update(products)
        .set({
          price: n.price,
          wholesalePrice: n.wholesalePrice ?? null,
          stockQuantity: n.stockQuantity,
          updatedAt: new Date(),
        })
        .where(eq(products.id, previous.id));
      stats.updated++;
      trace.push({
        level: "info",
        scope: "product",
        code: n.code,
        message:
          `Aggiornato: prezzo ${previous.price} -> ${n.price}, ` +
          `ingrosso ${previous.wholesalePrice ?? "-"} -> ${n.wholesalePrice ?? "-"}, ` +
          `qty ${previous.stockQuantity} -> ${n.stockQuantity}`,
      });
    }

    // La disattivazione automatica in modalità "full" è disabilitata:
    // la gestione dei prodotti avviene manualmente.

    trace.push({
      level: "info",
      scope: "import",
      message:
        `Import completato: updated=${stats.updated}, skipped=${stats.skipped}, ` +
        `deactivatedFull=${stats.deactivatedFull}, deactivatedDeleted=${stats.deactivatedDeleted}`,
    });

    return { ok: true, stats, mode, trace };
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Errore durante import catalogo";
    trace.push({
      level: "error",
      scope: "import",
      message: msg,
    });
    return { ok: false, message: msg, trace };
  }
}
