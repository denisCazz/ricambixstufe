import { NextRequest, NextResponse } from "next/server";
import { fulfillSatispayPayment } from "@/lib/satispay";

/**
 * Satispay server-to-server callback (GET).
 * Query: payment_id={uuid} — we must fetch the real status via the API.
 */
export async function GET(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get("payment_id");
  if (!paymentId) {
    return NextResponse.json({ error: "missing payment_id" }, { status: 400 });
  }

  try {
    const { outcome } = await fulfillSatispayPayment(paymentId);
    if (outcome === "not_found") {
      // Order not persisted yet — ask Satispay to retry shortly.
      return NextResponse.json({ ok: false, outcome }, { status: 404 });
    }
    return NextResponse.json({ ok: true, outcome });
  } catch (err) {
    console.error("Satispay callback error:", err);
    return NextResponse.json({ error: "callback failed" }, { status: 500 });
  }
}

export { GET as POST };
