import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { imageId, altText } = await req.json();
  if (!imageId) {
    return NextResponse.json({ error: "imageId richiesto" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  const { error } = await supabase
    .from("product_images")
    .update({ alt_text: altText || null })
    .eq("id", imageId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
