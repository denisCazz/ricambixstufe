import { NextRequest, NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import {
  calculateShippingCost,
  getShippingZone,
  COD_SURCHARGE,
} from "@/lib/shipping";

/**
 * POST /api/shipping
 * Calculate shipping cost for the current cart.
 * Body: { items: [{id, quantity}], country, province? }
 */
export async function POST(req: NextRequest) {
  try {
    const { items, country, province } = (await req.json()) as {
      items: { id: number; quantity: number }[];
      country: string;
      province?: string;
    };

    if (!items?.length || !country) {
      return NextResponse.json(
        { error: "items and country are required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const productIds = items.map((i) => i.id);
    const prods = await db
      .select({ id: products.id, weight: products.weight })
      .from(products)
      .where(inArray(products.id, productIds));

    const weightMap = new Map(
      prods.map((p) => [p.id, p.weight != null ? Number(p.weight) : 0.5])
    );

    const totalWeight = items.reduce((sum, item) => {
      const weight = weightMap.get(item.id) || 0.5;
      return sum + weight * item.quantity;
    }, 0);

    const zone = getShippingZone(country, province);
    const shippingCost = calculateShippingCost(totalWeight, zone);
    return NextResponse.json({ shippingCost, zone, codSurcharge: COD_SURCHARGE });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Calcolo spedizione non riuscito" },
      { status: 500 }
    );
  }
}
