import { NextRequest, NextResponse } from "next/server";
import { verifyPayload } from "@/lib/signed-payload";

interface CartSnapshotItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  quantity: number;
  lineKey?: string;
  lineNotes?: string | null;
}

interface PendingOrderPayload {
  cartSnapshot?: CartSnapshotItem[];
  expiresAt: number;
}

/**
 * Returns the cart snapshot saved when PayPal checkout started.
 * Used to restore the browser cart after cancel / failed return
 * (localStorage is sometimes empty on mobile return).
 */
export async function GET(req: NextRequest) {
  const rawCookie = req.cookies.get("paypal_order")?.value;
  if (!rawCookie) {
    return NextResponse.json({ items: null }, { status: 404 });
  }

  const payload = verifyPayload<PendingOrderPayload>(rawCookie);
  if (!payload || Date.now() > payload.expiresAt) {
    return NextResponse.json({ items: null }, { status: 410 });
  }

  const items = payload.cartSnapshot;
  if (!items?.length) {
    return NextResponse.json({ items: null }, { status: 404 });
  }

  return NextResponse.json({ items });
}
