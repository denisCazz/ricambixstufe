"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Eye } from "lucide-react";
import { type Product, formatPrice } from "@/data/products";

export default function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
      layout
      className="group relative bg-white border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-accent/30 hover:shadow-lg hover:shadow-orange-500/10"
    >
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
              <p className="text-[11px] text-muted/50">Immagine non disponibile</p>
            </div>
          </div>
        )}

        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[11px] font-medium text-muted border border-border/50 shadow-sm z-10">
          {product.category}
        </span>

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-5 z-10">
          <Link
            href={`/products/${product.slug}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 backdrop-blur-md text-sm font-medium text-foreground hover:bg-white transition-colors border border-white/50 shadow-sm"
          >
            <Eye className="w-4 h-4" />
            Dettagli
          </Link>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-sm leading-snug mb-1.5 line-clamp-2 text-foreground group-hover:text-accent transition-colors duration-200">
          {product.name}
        </h3>
        <p className="text-xs text-muted line-clamp-2 mb-4 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-accent tabular-nums">
            {formatPrice(product.price)}
          </span>
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shrink-0">
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Aggiungi</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
