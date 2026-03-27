import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

interface LineItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, shippingInfo } = body as {
      items: LineItem[];
      shippingInfo: {
        name: string;
        email: string;
        phone?: string;
        address: string;
        city: string;
        zip: string;
        country: string;
        province?: string;
        notes?: string;
      };
    };

    if (!items?.length) {
      return NextResponse.json({ error: "Carrello vuoto" }, { status: 400 });
    }

    // Check if user is logged in for dealer discount
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let dealerDiscount = 0;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "dealer") {
        const { data: dealer } = await supabase
          .from("dealer_profiles")
          .select("discount_percent, status")
          .eq("id", user.id)
          .single();

        if (dealer?.status === "approved") {
          dealerDiscount = dealer.discount_percent ?? 0;
        }
      }
    }

    const origin = req.headers.get("origin") || "https://www.ricambixstufe.it";

    // Map country names to ISO 2-letter codes for Stripe
    const countryMap: Record<string, string> = {
      Italia: "IT", Austria: "AT", Belgio: "BE", Bulgaria: "BG",
      Croazia: "HR", Danimarca: "DK", Estonia: "EE", Finlandia: "FI",
      Francia: "FR", Germania: "DE", Grecia: "GR", Irlanda: "IE",
      Lettonia: "LV", Lituania: "LT", Lussemburgo: "LU", Malta: "MT",
      "Paesi Bassi": "NL", Polonia: "PL", Portogallo: "PT",
      "Repubblica Ceca": "CZ", Romania: "RO", Slovacchia: "SK",
      Slovenia: "SI", Spagna: "ES", Svezia: "SE", Ungheria: "HU",
      "Regno Unito": "GB", Svizzera: "CH",
    };

    const countryCode = countryMap[shippingInfo.country] || "IT";

    const line_items = items.map((item) => {
      let unitAmount = Math.round(item.price * 100);
      if (dealerDiscount > 0) {
        unitAmount = Math.round(unitAmount * (1 - dealerDiscount / 100));
      }
      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: item.name,
            ...(item.image ? { images: [item.image] } : {}),
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      customer_email: shippingInfo.email,
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 0, currency: "eur" },
            display_name: "Spedizione standard",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 3 },
              maximum: { unit: "business_day", value: 7 },
            },
          },
        },
      ],
      metadata: {
        user_id: user?.id || "guest",
        shipping_name: shippingInfo.name,
        shipping_phone: shippingInfo.phone || "",
        shipping_address: shippingInfo.address,
        shipping_city: shippingInfo.city,
        shipping_zip: shippingInfo.zip,
        shipping_province: shippingInfo.province || "",
        shipping_country: countryCode,
        notes: shippingInfo.notes || "",
        dealer_discount: dealerDiscount.toString(),
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Errore durante la creazione del pagamento" },
      { status: 500 }
    );
  }
}
