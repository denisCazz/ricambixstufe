import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ profile: null });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "first_name, last_name, email, phone, company, vat_number, address_line1, address_line2, city, province, postal_code, country"
    )
    .eq("id", user.id)
    .single();

  return NextResponse.json({ profile });
}
