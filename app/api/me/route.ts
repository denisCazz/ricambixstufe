import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ dealerDiscount: null });
  }
  return NextResponse.json({ dealerDiscount: user.dealerDiscount });
}
