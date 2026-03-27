import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createProduct } from "../../actions/products";
import ProductForm from "../ProductForm";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name_it")
    .eq("active", true)
    .order("sort_order");

  async function action(_prev: { error?: string } | null, formData: FormData) {
    "use server";
    const result = await createProduct(formData);
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
        <h1 className="text-2xl font-bold text-foreground">Nuovo Prodotto</h1>
      </div>

      <ProductForm
        categories={categories || []}
        action={action}
        submitLabel="Crea Prodotto"
      />
    </div>
  );
}
