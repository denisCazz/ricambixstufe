import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
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

    // Save order to Supabase
    const { error } = await supabase.from("orders").insert({
      user_id: meta.user_id !== "guest" ? meta.user_id : null,
      guest_email: meta.user_id === "guest" ? session.customer_email : null,
      status: "confirmed" as const,
      payment_status: `stripe:${session.payment_intent}`,
      subtotal: total,
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
      billing_address: {
        email: session.customer_email,
      },
      notes: meta.notes || null,
    });

    if (error) {
      console.error("Failed to save order:", error);
    }
  }

  return NextResponse.json({ received: true });
}
