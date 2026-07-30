import { NextRequest, NextResponse } from "next/server";
import { verifyPayload } from "@/lib/signed-payload";

interface PendingOrderItem {
  productId: number;
  productName: string;
  quantity: number;
  cartSlug?: string;
  cartPrice?: number;
  cartLineKey?: string;
}

interface PendingOrderPayload {
  items?: PendingOrderItem[];
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

  if (!payload.items?.length) {
    return NextResponse.json({ items: null }, { status: 404 });
  }

  const items = payload.items.flatMap((item) => {
    if (
      typeof item.productId !== "number" ||
      typeof item.productName !== "string" ||
      typeof item.cartPrice !== "number" ||
      typeof item.quantity !== "number"
    ) {
      return [];
    }

    const [name, ...noteLines] = item.productName.split("\n");
    return [{
      id: item.productId,
      name: name || "Prodotto",
      slug: item.cartSlug || "",
      price: item.cartPrice,
      image: null,
      quantity: item.quantity,
      lineKey: item.cartLineKey,
      lineNotes: noteLines.length ? noteLines.join("\n") : null,
    }];
  });

  if (!items.length) {
    return NextResponse.json({ items: null }, { status: 404 });
  }

  return NextResponse.json({ items });
}
