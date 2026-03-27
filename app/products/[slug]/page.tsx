import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { createBuildClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import ProductDetailClient from "./ProductDetailClient";
import AddToCartButton from "@/components/AddToCartButton";
import PriceDisplay from "@/components/PriceDisplay";
import TranslatedText from "@/components/TranslatedText";

export async function generateStaticParams() {
  const supabase = createBuildClient();
  const { data } = await supabase.from("products").select("slug").eq("active", true);
  return (data || []).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Prodotto non trovato" };
  return {
    title: `${product.name} | Ricambi X Stufe`,
    description: product.descriptionShort || product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.categoryId, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <ProductDetailClient>
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted mb-8">
            <Link href="/" className="hover:text-accent transition-colors"><TranslatedText k="breadcrumb.home" /></Link>
            <span>/</span>
            <Link href={`/categories/${product.categorySlug}`} className="hover:text-accent transition-colors">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Image */}
            <div className="relative aspect-square bg-gradient-to-br from-stone-50 to-orange-50/30 rounded-2xl border border-border overflow-hidden">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain p-8"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-muted/20">{product.name.charAt(0)}</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <span className="inline-block px-3 py-1 rounded-lg bg-orange-50 text-accent text-xs font-medium mb-3">
                {product.category}
              </span>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                {product.name}
              </h1>
              <p className="text-muted leading-relaxed mb-6 whitespace-pre-line">
                {product.description || product.descriptionShort}
              </p>

              <div className="border-t border-border pt-6 mb-6">
                <div className="text-3xl font-bold text-accent mb-1">
                  <PriceDisplay price={product.price} />
                </div>
                <p className="text-xs text-muted"><TranslatedText k="product.vat" /></p>
              </div>

              <div className="flex gap-3">
                <AddToCartButton
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: product.price,
                    image: product.image,
                  }}
                />
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <TranslatedText k="product.available" />
                </div>
                <div className="flex items-center gap-3 text-sm text-muted">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <TranslatedText k="product.warranty" />
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <section className="mt-16">
              <TranslatedText k="product.related" as="h2" className="text-xl font-bold text-foreground mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {related.map((rp) => (
                  <Link
                    key={rp.id}
                    href={`/products/${rp.slug}`}
                    className="group bg-white border border-border rounded-2xl overflow-hidden hover:border-accent/30 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300"
                  >
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-stone-50 to-orange-50/30">
                      {rp.image ? (
                        <Image
                          src={rp.image}
                          alt={rp.name}
                          fill
                          sizes="(max-width: 640px) 100vw, 25vw"
                          className="object-contain p-4"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-muted/20">{rp.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-accent transition-colors">
                        {rp.name}
                      </h3>
                      <PriceDisplay price={rp.price} className="text-accent font-bold text-sm mt-1 block" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
      </ProductDetailClient>
      <Footer />
    </div>
  );
}
