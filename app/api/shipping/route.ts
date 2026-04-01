import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

    const supabase = await createClient();

    // Fetch product weights
    const productIds = items.map((i) => i.id);
    const { data: products } = await supabase
      .from("products")
      .select("id, weight")
      .in("id", productIds);

    const weightMap = new Map(
      (products || []).map((p) => [p.id, Number(p.weight) || 0.5])
    );

    // Calculate total weight
    const totalWeight = items.reduce((sum, item) => {
      const weight = weightMap.get(item.id) || 0.5;
      return sum + weight * item.quantity;
    }, 0);

    const zone = getShippingZone(country, province);
    const shippingCost = calculateShippingCost(totalWeight, zone);

    return NextResponse.json({
      zone,
      totalWeight: Math.round(totalWeight * 1000) / 1000,
      shippingCost,
      codSurcharge: COD_SURCHARGE,
    });
  } catch {
    return NextResponse.json(
      { error: "Errore nel calcolo della spedizione" },
      { status: 500 }
    );
  }
}
