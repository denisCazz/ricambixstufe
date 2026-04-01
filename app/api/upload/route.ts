import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const productId = formData.get("product_id") as string | null;

  if (!file || !productId) {
    return NextResponse.json(
      { error: "File e product_id richiesti" },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Formato non supportato. Usa JPG, PNG, WebP o GIF." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File troppo grande. Massimo 5 MB." },
      { status: 400 }
    );
  }

  // Sanitize filename
  const ext = path.extname(file.name).toLowerCase() || ".jpg";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const productDir = path.join(UPLOAD_DIR, productId);

  await mkdir(productDir, { recursive: true });

  const filePath = path.join(productDir, safeName);
  const bytes = new Uint8Array(await file.arrayBuffer());
  await writeFile(filePath, bytes);

  const imageUrl = `/uploads/products/${productId}/${safeName}`;

  // Get next sort_order
  const supabase = await createServiceClient();
  const { data: existing } = await supabase
    .from("product_images")
    .select("sort_order")
    .eq("product_id", parseInt(productId))
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = existing?.[0] ? existing[0].sort_order + 1 : 0;

  const { data: image, error } = await supabase
    .from("product_images")
    .insert({
      product_id: parseInt(productId),
      image_url: imageUrl,
      sort_order: nextOrder,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Also update product's main image_url if this is the first image
  if (nextOrder === 0) {
    await supabase
      .from("products")
      .update({ image_url: imageUrl })
      .eq("id", parseInt(productId));
  }

  return NextResponse.json({ image });
}
