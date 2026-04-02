import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const user = await getUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const supabase = await createServiceClient();

  const { productId, imageUrl, altText, sortOrder } = await request.json();

  if (!productId || !imageUrl) {
    return NextResponse.json(
      { error: "productId e imageUrl sono obbligatori" },
      { status: 400 }
    );
  }

  // Validate URL is from our R2 bucket
  const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "";
  if (R2_PUBLIC_URL && !imageUrl.startsWith(R2_PUBLIC_URL)) {
    return NextResponse.json(
      { error: "URL immagine non valido" },
      { status: 400 }
    );
  }

  // Check if already assigned
  const { data: existing } = await supabase
    .from("product_images")
    .select("id")
    .eq("product_id", productId)
    .eq("image_url", imageUrl)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Immagine già associata a questo prodotto" },
      { status: 409 }
    );
  }

  // Insert into product_images
  const { data: image, error } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      image_url: imageUrl,
      alt_text: altText || null,
      sort_order: sortOrder ?? 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update products.image_url if first image
  const { count } = await supabase
    .from("product_images")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId);

  if (count === 1) {
    await supabase
      .from("products")
      .update({ image_url: imageUrl })
      .eq("id", productId);
  }

  return NextResponse.json({ success: true, image });
}
