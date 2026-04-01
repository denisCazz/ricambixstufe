"use client";

import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useLocale } from "@/lib/locale-context";
import { useUser } from "@/lib/user-context";

export default function AddToCartButton({
  product,
}: {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    weight?: number | null;
    stockQuantity?: number;
  };
}) {
  const { addItem } = useCart();
  const { t } = useLocale();
  const { dealerDiscount } = useUser();
  const [added, setAdded] = useState(false);

  const outOfStock = product.stockQuantity !== undefined && product.stockQuantity <= 0;

  const finalPrice = dealerDiscount
    ? product.price * (1 - dealerDiscount / 100)
    : product.price;

  function handleClick() {
    if (outOfStock) return;
    addItem({ ...product, price: finalPrice });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  if (outOfStock) {
    return (
      <button
        disabled
        className="flex-1 py-3 px-6 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400 font-semibold cursor-not-allowed flex items-center justify-center gap-2"
      >
        Esaurito
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-2"
    >
      {added ? (
        <>
          <Check className="w-5 h-5" />
          {t("product.added")}
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5" />
          {t("product.add_to_cart")}
        </>
      )}
    </button>
  );
}
