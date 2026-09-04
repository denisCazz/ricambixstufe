import { NextRequest, NextResponse } from "next/server";
import {
  fulfillSatispayPayment,
  parseSatispayPaymentId,
  waitForSatispayPayment,
} from "@/lib/satispay";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const siteUrl = process.env.AUTH_URL || "http://localhost:3000";
  const orderIdRaw = req.nextUrl.searchParams.get("order_id");
  const orderId = orderIdRaw ? Number(orderIdRaw) : NaN;

  if (!Number.isFinite(orderId) || orderId <= 0) {
    return NextResponse.redirect(`${siteUrl}/checkout?error=satispay_cancelled`);
  }

  const db = getDb();
  const order = await db
    .select({
      id: orders.id,
      paymentMethod: orders.paymentMethod,
      paymentStatus: orders.paymentStatus,
    })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1)
    .then((r) => r[0]);

  if (!order || order.paymentMethod !== "satispay") {
    return NextResponse.redirect(`${siteUrl}/checkout?error=satispay_cancelled`);
  }

  const paymentId = parseSatispayPaymentId(order.paymentStatus);
  if (!paymentId) {
    return NextResponse.redirect(`${siteUrl}/checkout?error=satispay_cancelled`);
  }

  try {
    await waitForSatispayPayment(paymentId);
    const { outcome } = await fulfillSatispayPayment(paymentId, orderId);

    if (outcome === "confirmed" || outcome === "already_confirmed") {
      return NextResponse.redirect(`${siteUrl}/checkout/success`);
    }
    if (outcome === "canceled") {
      return NextResponse.redirect(`${siteUrl}/checkout?error=satispay_cancelled`);
    }
    if (outcome === "pending") {
      return NextResponse.redirect(`${siteUrl}/checkout?error=satispay_pending`);
    }
    return NextResponse.redirect(`${siteUrl}/checkout?error=satispay_failed`);
  } catch (err) {
    console.error("Satispay return error:", err);
    return NextResponse.redirect(`${siteUrl}/checkout?error=satispay_failed`);
  }
}
