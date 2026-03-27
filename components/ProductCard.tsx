"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Eye } from "lucide-react";
import { type Product } from "@/data/products";
import { useCart } from "@/lib/cart-context";
import { useLocale } from "@/lib/locale-context";
import { useUser } from "@/lib/user-context";

export default function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const [imgError, setImgError] = useState(false);
  const { addItem } = useCart();
  const { formatPrice, t } = useLocale();
  const { dealerDiscount } = useUser();

  const discountedPrice = dealerDiscount
    ? product.price * (1 - dealerDiscount / 100)
    : product.price;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: discountedPrice,
      image: product.image,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
      layout
      className="group relative bg-white border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-accent/30 hover:shadow-lg hover:shadow-orange-500/10"
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] bg-gradient-to-br from-stone-50 to-orange-50/30 overflow-hidden">
          {product.image && !imgError ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-stone-100 border border-border flex items-center justify-center">
                  <span className="text-xl font-bold text-muted/40">
                    {product.name.charAt(0)}
                  </span>
                </div>
                <p className="text-[11px] text-muted/50">{t("product.image_na")}</p>
              </div>
            </div>
          )}

          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[11px] font-medium text-muted border border-border/50 shadow-sm z-10">
            {product.category}
          </span>

          {/* Desktop hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-end justify-center pb-5 z-10">
            <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 backdrop-blur-md text-sm font-medium text-foreground border border-white/50 shadow-sm">
              <Eye className="w-4 h-4" />
              {t("product.details")}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-sm leading-snug mb-1.5 line-clamp-2 text-foreground group-hover:text-accent transition-colors duration-200">
            {product.name}
          </h3>
          <p className="text-xs text-muted line-clamp-2 mb-4 leading-relaxed">
            {product.description}
          </p>
        </div>
      </Link>

      <div className="px-4 pb-4 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          {dealerDiscount ? (
            <>
              <span className="text-xs text-muted line-through">
                {formatPrice(product.price)}
              </span>
              <span className="text-lg font-bold text-green-600 tabular-nums">
                {formatPrice(discountedPrice)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-accent tabular-nums">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shrink-0"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t("product.add")}</span>
        </button>
      </div>

      {/* Mobile: view details button */}
      <div className="px-4 pb-4 md:hidden">
        <Link
          href={`/products/${product.slug}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-accent/30 text-accent text-xs font-semibold hover:bg-accent/5 transition-colors duration-200"
        >
          <Eye className="w-3.5 h-3.5" />
          {t("product.details")}
        </Link>
      </div>
    </motion.div>
  );
}
