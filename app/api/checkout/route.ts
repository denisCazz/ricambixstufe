import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { createPayPalOrder } from "@/lib/paypal";
import { signPayload } from "@/lib/signed-payload";
import { products, orders, orderItems, profiles, dealerProfiles } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
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
      paymentMethod: "bank_transfer" | "cod" | "paypal";
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
    const session = await auth();
    const user = session?.user;
    const db = getDb();

    let dealerDiscount = 0;
    if (user?.id) {
      const profile = await db
        .select({ role: profiles.role })
        .from(profiles)
        .where(eq(profiles.id, user.id))
        .limit(1)
        .then((r) => r[0]);
      if (profile?.role === "dealer") {
        const dealer = await db
          .select({
            discountPercent: dealerProfiles.discountPercent,
            status: dealerProfiles.status,
          })
          .from(dealerProfiles)
          .where(eq(dealerProfiles.id, user.id))
          .limit(1)
          .then((r) => r[0]);
        if (dealer?.status === "approved") {
          dealerDiscount = dealer.discountPercent ?? 0;
        }
      }
    }

    // --- Calculate shipping cost server-side ---

    // Fetch product weights
    const productIds = items.map((i) => i.id);
    const dbProducts = await db
      .select({ id: products.id, weight: products.weight })
      .from(products)
      .where(inArray(products.id, productIds));

    const weightMap = new Map(
      dbProducts.map((p) => [p.id, p.weight != null ? Number(p.weight) : 0.5])
    );

    const totalWeight = items.reduce((sum, item) => {
      const weight = weightMap.get(item.id) || 0.5;
      return sum + weight * item.quantity;
    }, 0);

    // --- Validate stock availability ---
    const stockProducts = await db
      .select({
        id: products.id,
        stockQuantity: products.stockQuantity,
        nameIt: products.nameIt,
      })
      .from(products)
      .where(inArray(products.id, productIds));

    if (stockProducts.length) {
      const outOfStock = stockProducts.filter((p) => {
        const requested = items.find((i) => i.id === p.id);
        return requested && p.stockQuantity < requested.quantity;
      });

      if (outOfStock.length > 0) {
        const names = outOfStock.map((p) => p.nameIt).join(", ");
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
      province: (shippingInfo.province || "").toUpperCase().slice(0, 2) || "",
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

    // --- Handle PayPal (no DB insert yet — create order only after capture) ---
    if (paymentMethod === "paypal") {
      const siteUrl = process.env.AUTH_URL || "http://localhost:3000";

      // Fetch product details needed for order items at capture time
      const productDetails = await db
        .select({ id: products.id, sku: products.sku, nameIt: products.nameIt })
        .from(products)
        .where(inArray(products.id, productIds));
      const productMap = new Map(productDetails.map((p) => [p.id, p]));

      const orderPayload = {
        userId: user?.id || null,
        guestEmail: !user ? shippingInfo.email : null,
        dealerDiscount,
        subtotal: Math.round(taxAdjustedSubtotal * 100) / 100,
        shippingCost,
        total,
        shippingAddress,
        billingAddress,
        notes: shippingInfo.notes || null,
        items: items.map((item) => {
          const product = productMap.get(item.id);
          const discountedPrice =
            dealerDiscount > 0 ? item.price * (1 - dealerDiscount / 100) : item.price;
          return {
            productId: item.id,
            productName: product?.nameIt || item.name,
            productSku: product?.sku || null,
            quantity: item.quantity,
            unitPrice: item.price,
            discountPercent: dealerDiscount,
            lineTotal: Math.round(discountedPrice * item.quantity * 100) / 100,
          };
        }),
        expiresAt: Date.now() + 3 * 60 * 60 * 1000, // 3h (PayPal order TTL)
      };

      const signed = signPayload(orderPayload);

      const { approvalUrl } = await createPayPalOrder({
        totalEur: total,
        returnUrl: `${siteUrl}/api/paypal/capture`,
        cancelUrl: `${siteUrl}/checkout?error=paypal_cancelled`,
      });

      const response = NextResponse.json({ url: approvalUrl });
      response.cookies.set("paypal_order", signed, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 3 * 60 * 60, // 3 hours
        path: "/",
      });
      return response;
    }

    // --- Handle Bank Transfer / COD (create order directly) ---
    const dbPaymentMethod =
      paymentMethod === "bank_transfer" ? "bank_transfer" : "cod";

    const subtotalRounded = Math.round(subtotal * 100) / 100;
    let orderId: number;
    try {
      const [o] = await db
        .insert(orders)
        .values({
          userId: user?.id || null,
          guestEmail: !user ? shippingInfo.email : null,
          status: "pending",
          paymentMethod: dbPaymentMethod,
          paymentStatus:
            paymentMethod === "bank_transfer"
              ? "awaiting_transfer"
              : "cod_pending",
          subtotal: String(subtotalRounded),
          shippingCost: String(shippingCost),
          taxAmount: "0",
          total: String(total),
          shippingAddress,
          billingAddress,
          notes: shippingInfo.notes || null,
        })
        .returning({ id: orders.id });
      if (!o) throw new Error("no id");
      orderId = o.id;
    } catch (orderError) {
      console.error("Failed to create order:", orderError);
      return NextResponse.json(
        { error: "Errore nella creazione dell'ordine" },
        { status: 500 }
      );
    }

    // Save order items
    const productDetails = await db
      .select({ id: products.id, sku: products.sku, nameIt: products.nameIt })
      .from(products)
      .where(inArray(products.id, productIds));

    const productMap = new Map(productDetails.map((p) => [p.id, p]));

    const rows = items.map((item) => {
      const product = productMap.get(item.id);
      const discountedPrice =
        dealerDiscount > 0
          ? item.price * (1 - dealerDiscount / 100)
          : item.price;
      return {
        orderId: orderId,
        productId: item.id,
        productName: product?.nameIt || item.name,
        productSku: product?.sku || null,
        quantity: item.quantity,
        unitPrice: String(item.price),
        discountPercent: dealerDiscount,
        lineTotal: String(
          Math.round(discountedPrice * item.quantity * 100) / 100
        ),
      };
    });

    try {
      await db.insert(orderItems).values(
        rows.map((r) => ({
          orderId: r.orderId,
          productId: r.productId,
          productName: r.productName,
          productSku: r.productSku,
          quantity: r.quantity,
          unitPrice: r.unitPrice,
          discountPercent: r.discountPercent,
          lineTotal: r.lineTotal,
        }))
      );
    } catch (itemsErr) {
      console.error("Failed to save order items:", itemsErr);
    }

    // Send order confirmation emails
    const emailData = {
      orderId: orderId,
      customerEmail: shippingInfo.email,
      customerName: shippingInfo.name,
      items: rows.map((r) => ({
        product_name: r.productName,
        product_sku: r.productSku,
        quantity: r.quantity,
        unit_price: Number(r.unitPrice),
        discount_percent: r.discountPercent,
        line_total: Number(r.lineTotal),
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
      orderId: orderId,
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
