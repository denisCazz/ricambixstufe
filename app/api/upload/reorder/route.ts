import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { images } = await req.json() as {
    images: { id: number; sort_order: number }[];
  };

  if (!images?.length) {
    return NextResponse.json({ error: "Nessuna immagine" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  for (const img of images) {
    await supabase
      .from("product_images")
      .update({ sort_order: img.sort_order })
      .eq("id", img.id);
  }

  // Update product's main image_url to the first image (sort_order = 0)
  const first = images.find((i) => i.sort_order === 0);
  if (first) {
    const { data: firstImage } = await supabase
      .from("product_images")
      .select("image_url, product_id")
      .eq("id", first.id)
      .single();

    if (firstImage) {
      await supabase
        .from("products")
        .update({ image_url: firstImage.image_url })
        .eq("id", firstImage.product_id);
    }
  }

  return NextResponse.json({ success: true });
}
