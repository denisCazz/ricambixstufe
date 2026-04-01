import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateProduct } from "@/app/admin/actions/products";
import ProductForm from "@/app/admin/products/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = parseInt(id);
  if (isNaN(productId)) notFound();

  const supabase = await createClient();

  const [productResult, categoriesResult, imagesResult] = await Promise.all([
    supabase.from("products").select("*").eq("id", productId).single(),
    supabase.from("categories").select("id, name_it").eq("active", true).order("sort_order"),
    supabase.from("product_images").select("*").eq("product_id", productId).order("sort_order"),
  ]);

  if (!productResult.data) notFound();
  const product = productResult.data;

  async function action(_prev: { error?: string } | null, formData: FormData) {
    "use server";
    const result = await updateProduct(productId, formData);
    return result ?? null;
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          Torna ai prodotti
        </Link>
        <h1 className="text-2xl font-bold text-foreground">
          Modifica: {product.name_it}
        </h1>
      </div>

      <ProductForm
        product={product}
        categories={categoriesResult.data || []}
        action={action}
        submitLabel="Salva Modifiche"
        productImages={imagesResult.data || []}
      />
    </div>
  );
}
