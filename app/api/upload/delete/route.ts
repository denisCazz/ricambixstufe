import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { getUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { deleteFromR2, getR2KeyFromUrl } from "@/lib/r2";

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { imageId } = await req.json();
  if (!imageId) {
    return NextResponse.json({ error: "imageId richiesto" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  // Fetch image to get file path and product info
  const { data: image, error: fetchError } = await supabase
    .from("product_images")
    .select("*")
    .eq("id", imageId)
    .single();

  if (fetchError || !image) {
    return NextResponse.json({ error: "Immagine non trovata" }, { status: 404 });
  }

  // Delete from DB
  const { error: deleteError } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  // Try to delete file from disk or R2 (non-blocking)
  try {
    const r2Key = getR2KeyFromUrl(image.image_url);
    if (r2Key) {
      await deleteFromR2(r2Key);
    } else if (image.image_url.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", image.image_url);
      await unlink(filePath);
    }
  } catch {
    // File may not exist, ignore
  }

  // If deleted image was the main one (sort_order 0), update product's image_url
  if (image.sort_order === 0) {
    const { data: nextImage } = await supabase
      .from("product_images")
      .select("image_url")
      .eq("product_id", image.product_id)
      .order("sort_order", { ascending: true })
      .limit(1)
      .single();

    await supabase
      .from("products")
      .update({ image_url: nextImage?.image_url || null })
      .eq("id", image.product_id);
  }

  return NextResponse.json({ success: true });
}
