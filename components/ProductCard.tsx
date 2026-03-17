"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Eye } from "lucide-react";
import { type Product, formatPrice } from "@/data/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300"
    >
      {/* Image area */}
      <div className="relative aspect-square bg-gradient-to-br from-white/[0.04] to-white/[0.01] flex items-center justify-center overflow-hidden">
        <div className="text-center p-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/5 flex items-center justify-center">
            <span className="text-2xl text-muted">
              {product.name.charAt(0)}
            </span>
          </div>
          <p className="text-xs text-muted/60">Immagine prodotto</p>
        </div>

        {/* Category badge */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-medium text-muted border border-white/5">
          {product.category}
        </span>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 backdrop-blur-md text-sm font-medium hover:bg-white/25 transition-colors">
            <Eye className="w-4 h-4" />
            Dettagli
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-sm leading-snug mb-1.5 line-clamp-2 group-hover:text-accent transition-colors duration-200">
          {product.name}
        </h3>
        <p className="text-xs text-muted line-clamp-2 mb-3 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-accent">
            {formatPrice(product.price)}
          </span>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0">
            <ShoppingCart className="w-3.5 h-3.5" />
            Aggiungi
          </button>
        </div>
      </div>
    </motion.div>
  );
}
