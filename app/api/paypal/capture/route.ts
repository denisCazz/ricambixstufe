import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { verifyPayload } from "@/lib/signed-payload";
import { getDb } from "@/db";
import { orders, orderItems } from "@/db/schema";
import {
  sendOrderConfirmationEmail,
  sendNewOrderAdminNotification,
} from "@/lib/email";

interface OrderItem {
  productId: number;
  productName: string;
  productSku: string | null;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  lineTotal: number;
}

interface OrderPayload {
  userId: string | null;
  guestEmail: string | null;
  dealerDiscount: number;
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: Record<string, string>;
  billingAddress: Record<string, string>;
  notes: string | null;
  items: OrderItem[];
  expiresAt: number;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const paypalToken = searchParams.get("token"); // PayPal order ID

  const siteUrl = process.env.AUTH_URL || "http://localhost:3000";

  if (!paypalToken) {
    return NextResponse.redirect(`${siteUrl}/checkout?error=paypal_cancelled`);
  }

  // Read & verify signed cookie
  const rawCookie = req.cookies.get("paypal_order")?.value;
  if (!rawCookie) {
    return NextResponse.redirect(`${siteUrl}/checkout?error=paypal_session_expired`);
  }

  const payload = verifyPayload<OrderPayload>(rawCookie);
  if (!payload) {
    return NextResponse.redirect(`${siteUrl}/checkout?error=paypal_session_invalid`);
  }

  if (Date.now() > payload.expiresAt) {
    return NextResponse.redirect(`${siteUrl}/checkout?error=paypal_session_expired`);
  }

  // 1. Capture PayPal payment FIRST — only create the DB order if this succeeds
  let captureId: string;
  try {
    const result = await capturePayPalOrder(paypalToken);
    if (result.status !== "COMPLETED") {
      console.error("PayPal capture status:", result.status);
      return NextResponse.redirect(`${siteUrl}/checkout?error=paypal_capture_failed`);
    }
    captureId = result.captureId;
  } catch (err) {
    console.error("PayPal capture error:", err);
    return NextResponse.redirect(`${siteUrl}/checkout?error=paypal_capture_failed`);
  }

  // 2. Payment confirmed — now create the DB order
  const db = getDb();

  let dbOrderId: number;
  try {
    const [o] = await db
      .insert(orders)
      .values({
        userId: payload.userId || null,
        guestEmail: payload.guestEmail || null,
        status: "confirmed",
        paymentMethod: "paypal",
        paymentStatus: `paypal:${captureId}`,
        subtotal: String(payload.subtotal),
        shippingCost: String(payload.shippingCost),
        taxAmount: "0",
        total: String(payload.total),
        shippingAddress: payload.shippingAddress,
        billingAddress: payload.billingAddress,
        notes: payload.notes || null,
      })
      .returning({ id: orders.id });
    if (!o) throw new Error("no order id returned");
    dbOrderId = o.id;
  } catch (err) {
    console.error("PayPal: failed to create DB order after capture", err);
    console.error("CRITICAL: PayPal captureId", captureId, "- manual order creation required");
    return NextResponse.redirect(`${siteUrl}/checkout?error=paypal_order_save_failed`);
  }

  // 3. Save order items
  try {
    await db.insert(orderItems).values(
      payload.items.map((item) => ({
        orderId: dbOrderId,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku || null,
        quantity: item.quantity,
        unitPrice: String(item.unitPrice),
        discountPercent: item.discountPercent,
        lineTotal: String(item.lineTotal),
      }))
    );
  } catch (err) {
    console.error("PayPal: failed to save order items for order", dbOrderId, err);
  }

  // 4. Send confirmation emails
  const shipping = payload.shippingAddress;
  const billing = payload.billingAddress;

  const emailData = {
    orderId: dbOrderId,
    customerEmail: billing.email || payload.guestEmail || "",
    customerName: shipping.name || "",
    items: payload.items.map((i) => ({
      product_name: i.productName,
      product_sku: i.productSku || null,
      quantity: i.quantity,
      unit_price: i.unitPrice,
      discount_percent: i.discountPercent,
      line_total: i.lineTotal,
    })),
    subtotal: payload.subtotal,
    shippingCost: payload.shippingCost,
    total: payload.total,
    paymentMethod: "paypal" as const,
    shippingAddress: shipping,
    billingInfo: billing,
  };

  await Promise.allSettled([
    sendOrderConfirmationEmail(emailData),
    sendNewOrderAdminNotification(emailData),
  ]);

  // 5. Clear cookie and redirect to success
  const response = NextResponse.redirect(`${siteUrl}/checkout/success`);
  response.cookies.set("paypal_order", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
