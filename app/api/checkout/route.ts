import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  calculateShippingCost,
  getShippingZone,
  COD_SURCHARGE,
} from "@/lib/shipping";
import { sendOrderConfirmationEmail, sendNewOrderAdminNotification } from "@/lib/email";
import { validateVAT } from "@/lib/vies";

interface LineItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
}

interface BillingInfo {
  company?: string;
  vatNumber?: string;
  sdiCode?: string;
  pec?: string;
  fiscalCode?: string;
  viesExempt?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, shippingInfo, billingInfo, paymentMethod, viesExempt } = body as {
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
      billingInfo?: BillingInfo;
      paymentMethod: "stripe" | "paypal" | "bank_transfer" | "cod";
      viesExempt?: boolean;
    };

    if (!items?.length) {
      return NextResponse.json({ error: "Carrello vuoto" }, { status: 400 });
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Metodo di pagamento non selezionato" },
        { status: 400 }
      );
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

    // --- Calculate shipping cost server-side ---
    const serviceSupabase = await createServiceClient();

    // Fetch product weights
    const productIds = items.map((i) => i.id);
    const { data: dbProducts } = await serviceSupabase
      .from("products")
      .select("id, weight")
      .in("id", productIds);

    const weightMap = new Map(
      (dbProducts || []).map((p) => [p.id, Number(p.weight) || 0.5])
    );

    const totalWeight = items.reduce((sum, item) => {
      const weight = weightMap.get(item.id) || 0.5;
      return sum + weight * item.quantity;
    }, 0);

    // --- Validate stock availability ---
    const { data: stockProducts } = await serviceSupabase
      .from("products")
      .select("id, stock_quantity, name_it")
      .in("id", productIds);

    if (stockProducts) {
      const outOfStock = stockProducts.filter((p) => {
        const requested = items.find((i) => i.id === p.id);
        return requested && p.stock_quantity < requested.quantity;
      });

      if (outOfStock.length > 0) {
        const names = outOfStock.map((p) => p.name_it).join(", ");
        return NextResponse.json(
          { error: `Disponibilità insufficiente per: ${names}` },
          { status: 400 }
        );
      }
    }

    const zone = getShippingZone(
      shippingInfo.country,
      shippingInfo.province
    );
    const shippingCost = calculateShippingCost(totalWeight, zone);
    const codSurcharge = paymentMethod === "cod" ? COD_SURCHARGE : 0;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
      let price = item.price;
      if (dealerDiscount > 0) {
        price = price * (1 - dealerDiscount / 100);
      }
      return sum + price * item.quantity;
    }, 0);

    // Server-side VIES verification: only allow IVA exemption for non-IT EU companies
    let isViesExempt = false;
    if (viesExempt && billingInfo?.vatNumber && shippingInfo.country !== "Italia") {
      const euCountryMap: Record<string, string> = {
        Austria: "AT", Belgio: "BE", Bulgaria: "BG", Croazia: "HR",
        Danimarca: "DK", Estonia: "EE", Finlandia: "FI", Francia: "FR",
        Germania: "DE", Grecia: "EL", Irlanda: "IE", Lettonia: "LV",
        Lituania: "LT", Lussemburgo: "LU", Malta: "MT", "Paesi Bassi": "NL",
        Polonia: "PL", Portogallo: "PT", "Repubblica Ceca": "CZ", Romania: "RO",
        Slovacchia: "SK", Slovenia: "SI", Spagna: "ES", Svezia: "SE",
        Ungheria: "HU",
      };
      const cc = euCountryMap[shippingInfo.country];
      if (cc) {
        const cleanVat = billingInfo.vatNumber.replace(/^[A-Z]{2}/i, "").trim();
        try {
          const result = await validateVAT(cc, cleanVat);
          isViesExempt = result.valid;
        } catch {
          // VIES unavailable, fallback to IVA included
          isViesExempt = false;
        }
      }
    }

    // If VIES exempt, remove 22% IVA from product prices
    const taxAdjustedSubtotal = isViesExempt
      ? Math.round((subtotal / 1.22) * 100) / 100
      : subtotal;

    const total =
      Math.round((taxAdjustedSubtotal + shippingCost + codSurcharge) * 100) / 100;

    const origin =
      req.headers.get("origin") || "https://www.ricambixstufe.it";

    // Map country names to ISO 2-letter codes
    const countryMap: Record<string, string> = {
      Italia: "IT",
      Austria: "AT",
      Belgio: "BE",
      Bulgaria: "BG",
      Croazia: "HR",
      Danimarca: "DK",
      Estonia: "EE",
      Finlandia: "FI",
      Francia: "FR",
      Germania: "DE",
      Grecia: "GR",
      Irlanda: "IE",
      Lettonia: "LV",
      Lituania: "LT",
      Lussemburgo: "LU",
      Malta: "MT",
      "Paesi Bassi": "NL",
      Polonia: "PL",
      Portogallo: "PT",
      "Repubblica Ceca": "CZ",
      Romania: "RO",
      Slovacchia: "SK",
      Slovenia: "SI",
      Spagna: "ES",
      Svezia: "SE",
      Ungheria: "HU",
      "Regno Unito": "GB",
      Svizzera: "CH",
    };
    const countryCode = countryMap[shippingInfo.country] || "IT";

    // Build shipping & billing address objects
    const shippingAddress = {
      name: shippingInfo.name,
      phone: shippingInfo.phone || "",
      address: shippingInfo.address,
      city: shippingInfo.city,
      zip: shippingInfo.zip,
      province: shippingInfo.province || "",
      country: countryCode,
    };

    const billingAddress = {
      email: shippingInfo.email,
      ...(billingInfo?.company ? { company: billingInfo.company } : {}),
      ...(billingInfo?.vatNumber
        ? { vat_number: billingInfo.vatNumber }
        : {}),
      ...(billingInfo?.sdiCode ? { sdi_code: billingInfo.sdiCode } : {}),
      ...(billingInfo?.pec ? { pec: billingInfo.pec } : {}),
      ...(billingInfo?.fiscalCode
        ? { fiscal_code: billingInfo.fiscalCode }
        : {}),
      ...(isViesExempt ? { vies_exempt: true } : {}),
    };

    // --- Handle Stripe / PayPal (redirect to Stripe Checkout) ---
    if (paymentMethod === "stripe" || paymentMethod === "paypal") {
      const line_items = items.map((item) => {
        let unitAmount = Math.round(item.price * 100);
        if (dealerDiscount > 0) {
          unitAmount = Math.round(
            unitAmount * (1 - dealerDiscount / 100)
          );
        }
        // Remove IVA for VIES-exempt orders
        if (isViesExempt) {
          unitAmount = Math.round(unitAmount / 1.22);
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

      const paymentMethodTypes: ("card" | "paypal")[] =
        paymentMethod === "paypal" ? ["paypal"] : ["card"];

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: paymentMethodTypes,
        line_items,
        customer_email: shippingInfo.email,
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: {
                amount: Math.round(shippingCost * 100),
                currency: "eur",
              },
              display_name: `Spedizione ${zone === "europe" ? "Europa" : zone === "islands_calabria" ? "Isole/Calabria" : "Italia"}`,
              delivery_estimate: {
                minimum: {
                  unit: "business_day",
                  value: zone === "europe" ? 5 : 3,
                },
                maximum: {
                  unit: "business_day",
                  value: zone === "europe" ? 10 : 7,
                },
              },
            },
          },
        ],
        metadata: {
          user_id: user?.id || "guest",
          payment_method: paymentMethod,
          shipping_name: shippingInfo.name,
          shipping_phone: shippingInfo.phone || "",
          shipping_address: shippingInfo.address,
          shipping_city: shippingInfo.city,
          shipping_zip: shippingInfo.zip,
          shipping_province: shippingInfo.province || "",
          shipping_country: countryCode,
          shipping_cost: shippingCost.toString(),
          notes: shippingInfo.notes || "",
          dealer_discount: dealerDiscount.toString(),
          vies_exempt: isViesExempt ? "true" : "false",
          billing_info: JSON.stringify(billingAddress),
          cart_items: JSON.stringify(
            items.map((i) => [i.id, i.quantity, i.price])
          ),
        },
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout`,
      });

      return NextResponse.json({ url: session.url });
    }

    // --- Handle Bank Transfer / COD (create order directly) ---
    const dbPaymentMethod =
      paymentMethod === "bank_transfer" ? "bank_transfer" : "cod";

    const { data: order, error: orderError } = await serviceSupabase
      .from("orders")
      .insert({
        user_id: user?.id || null,
        guest_email: !user ? shippingInfo.email : null,
        status: "pending" as const,
        payment_method: dbPaymentMethod,
        payment_status:
          paymentMethod === "bank_transfer"
            ? "awaiting_transfer"
            : "cod_pending",
        subtotal: Math.round(subtotal * 100) / 100,
        shipping_cost: shippingCost,
        tax_amount: 0,
        total,
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        notes: shippingInfo.notes || null,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Failed to create order:", orderError);
      return NextResponse.json(
        { error: "Errore nella creazione dell'ordine" },
        { status: 500 }
      );
    }

    // Save order items
    const { data: productDetails } = await serviceSupabase
      .from("products")
      .select("id, sku, name_it")
      .in("id", productIds);

    const productMap = new Map(
      (productDetails || []).map((p) => [p.id, p])
    );

    const rows = items.map((item) => {
      const product = productMap.get(item.id);
      const discountedPrice =
        dealerDiscount > 0
          ? item.price * (1 - dealerDiscount / 100)
          : item.price;
      return {
        order_id: order.id,
        product_id: item.id,
        product_name: product?.name_it || item.name,
        product_sku: product?.sku || null,
        quantity: item.quantity,
        unit_price: item.price,
        discount_percent: dealerDiscount,
        line_total:
          Math.round(discountedPrice * item.quantity * 100) / 100,
      };
    });

    const { error: itemsErr } = await serviceSupabase
      .from("order_items")
      .insert(rows);

    if (itemsErr) {
      console.error("Failed to save order items:", itemsErr);
    }

    // Send order confirmation emails
    const emailData = {
      orderId: order.id,
      customerEmail: shippingInfo.email,
      customerName: shippingInfo.name,
      items: rows.map((r) => ({
        product_name: r.product_name,
        product_sku: r.product_sku,
        quantity: r.quantity,
        unit_price: r.unit_price,
        discount_percent: r.discount_percent,
        line_total: r.line_total,
      })),
      subtotal: Math.round(subtotal * 100) / 100,
      shippingCost: shippingCost + codSurcharge,
      total,
      paymentMethod: dbPaymentMethod,
      shippingAddress,
      billingInfo: billingAddress,
    };
    await Promise.all([
      sendOrderConfirmationEmail(emailData),
      sendNewOrderAdminNotification(emailData),
    ]);

    return NextResponse.json({
      orderId: order.id,
      total,
      paymentMethod,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Errore durante la creazione del pagamento" },
      { status: 500 }
    );
  }
}
