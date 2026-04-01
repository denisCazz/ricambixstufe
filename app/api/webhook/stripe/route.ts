import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { sendOrderConfirmationEmail, sendNewOrderAdminNotification } from "@/lib/email";
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

    const supabase = await createServiceClient();

    const total = (session.amount_total || 0) / 100;
    const shippingCost = parseFloat(meta.shipping_cost || "0");

    // Parse billing info from metadata
    let billingAddress: Record<string, string> = {
      email: session.customer_email || "",
    };
    try {
      if (meta.billing_info) {
        billingAddress = JSON.parse(meta.billing_info);
      }
    } catch {
      // Fallback to email only
    }

    // Save order to Supabase
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: meta.user_id !== "guest" ? meta.user_id : null,
        guest_email: meta.user_id === "guest" ? session.customer_email : null,
        status: "confirmed" as const,
        payment_status: `stripe:${session.payment_intent}`,
        subtotal: total - shippingCost,
        shipping_cost: shippingCost,
        total,
        shipping_address: {
          name: meta.shipping_name,
          phone: meta.shipping_phone,
          address: meta.shipping_address,
          city: meta.shipping_city,
          zip: meta.shipping_zip,
          province: meta.shipping_province,
          country: meta.shipping_country,
        },
        billing_address: billingAddress,
        notes: meta.notes || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to save order:", error);
    }

    // Save order items
    if (order && meta.cart_items) {
      try {
        const dealerDiscount = parseInt(meta.dealer_discount || "0", 10);
        const cartItems: [number, number, number][] = JSON.parse(
          meta.cart_items
        );

        // Fetch product details for SKUs
        const productIds = cartItems.map(([id]) => id);
        const { data: products } = await supabase
          .from("products")
          .select("id, sku, name_it")
          .in("id", productIds);

        const productMap = new Map(
          (products || []).map((p) => [p.id, p])
        );

        const rows = cartItems.map(([id, qty, price]) => {
          const product = productMap.get(id);
          const discountedPrice =
            dealerDiscount > 0
              ? price * (1 - dealerDiscount / 100)
              : price;
          return {
            order_id: order.id,
            product_id: id,
            product_name: product?.name_it || `Product #${id}`,
            product_sku: product?.sku || null,
            quantity: qty,
            unit_price: price,
            discount_percent: dealerDiscount,
            line_total: Math.round(discountedPrice * qty * 100) / 100,
          };
        });

        const { error: itemsErr } = await supabase
          .from("order_items")
          .insert(rows);

        if (itemsErr) {
          console.error("Failed to save order items:", itemsErr);
        }

        // Send order confirmation emails
        const emailData = {
          orderId: order.id,
          customerEmail: session.customer_email || "",
          customerName: meta.shipping_name || "Cliente",
          items: rows.map((r) => ({
            product_name: r.product_name,
            product_sku: r.product_sku,
            quantity: r.quantity,
            unit_price: r.unit_price,
            discount_percent: r.discount_percent,
            line_total: r.line_total,
          })),
          subtotal: total - shippingCost,
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
