import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getDb } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { sendOrderConfirmationEmail, sendNewOrderAdminNotification } from "@/lib/email";
import { inArray } from "drizzle-orm";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata || {};
    const db = getDb();

    const total = (session.amount_total || 0) / 100;
    const shippingCost = parseFloat(meta.shipping_cost || "0");

    let billingAddress: Record<string, string> = {
      email: session.customer_email || "",
    };
    try {
      if (meta.billing_info) {
        billingAddress = JSON.parse(meta.billing_info);
      }
    } catch {
      // ignore
    }

    const subtotal = total - shippingCost;
    let orderId: number | undefined;
    try {
      const [o] = await db
        .insert(orders)
        .values({
          userId: meta.user_id !== "guest" ? meta.user_id! : null,
          guestEmail:
            meta.user_id === "guest" ? session.customer_email : null,
          status: "confirmed",
          paymentStatus: `stripe:${session.payment_intent ?? ""}`,
          subtotal: String(subtotal),
          shippingCost: String(shippingCost),
          total: String(total),
          taxAmount: "0",
          shippingAddress: {
            name: meta.shipping_name,
            phone: meta.shipping_phone,
            address: meta.shipping_address,
            city: meta.shipping_city,
            zip: meta.shipping_zip,
            province: meta.shipping_province,
            country: meta.shipping_country,
          },
          billingAddress,
          notes: meta.notes || null,
        })
        .returning({ id: orders.id });
      if (!o) {
        throw new Error("order insert");
      }
      orderId = o.id;
    } catch (error) {
      console.error("Failed to save order:", error);
    }

    if (orderId != null && meta.cart_items) {
      try {
        const dealerDiscount = parseInt(meta.dealer_discount || "0", 10);
        const cartItems: [number, number, number][] = JSON.parse(
          meta.cart_items
        );
        const productIds = cartItems.map(([id]) => id);
        const prods = await db
          .select({ id: products.id, sku: products.sku, nameIt: products.nameIt })
          .from(products)
          .where(inArray(products.id, productIds));
        const productMap = new Map(prods.map((p) => [p.id, p]));

        const rows = cartItems.map(([id, qty, price]) => {
          const product = productMap.get(id);
          const discountedPrice =
            dealerDiscount > 0
              ? price * (1 - dealerDiscount / 100)
              : price;
          return {
            orderId,
            productId: id,
            productName: product?.nameIt || `Product #${id}`,
            productSku: product?.sku || null,
            quantity: qty,
            unitPrice: String(price),
            discountPercent: dealerDiscount,
            lineTotal: String(
              Math.round(discountedPrice * qty * 100) / 100
            ),
          };
        });

        try {
          await db.insert(orderItems).values(rows);
        } catch (itemsErr) {
          console.error("Failed to save order items:", itemsErr);
        }

        const emailData = {
          orderId,
          customerEmail: session.customer_email || "",
          customerName: meta.shipping_name || "Cliente",
          items: rows.map((r) => ({
            product_name: r.productName,
            product_sku: r.productSku,
            quantity: r.quantity,
            unit_price: Number(r.unitPrice),
            discount_percent: r.discountPercent,
            line_total: Number(r.lineTotal),
          })),
          subtotal,
          shippingCost,
          total,
          paymentMethod: meta.payment_method || "stripe",
          shippingAddress: {
            name: meta.shipping_name,
            address: meta.shipping_address,
            city: meta.shipping_city,
            zip: meta.shipping_zip,
            province: meta.shipping_province,
            country: meta.shipping_country,
          },
          billingInfo: billingAddress,
        };
        await Promise.all([
          sendOrderConfirmationEmail(emailData),
          sendNewOrderAdminNotification(emailData),
        ]);
      } catch (e) {
        console.error("Failed to parse cart_items:", e);
      }
    }
  }

  return NextResponse.json({ received: true });
}
