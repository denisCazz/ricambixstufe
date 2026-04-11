"use client";

import { ShoppingCart, Check, Zap } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useLocale } from "@/lib/locale-context";
import { useUser } from "@/lib/user-context";

export default function AddToCartButton({
  product,
  showBuyNow = false,
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
  showBuyNow?: boolean;
}) {
  const { addItem } = useCart();
  const { t } = useLocale();
  const { dealerDiscount } = useUser();
  const router = useRouter();
  const [added, setAdded] = useState(false);

  const outOfStock = product.stockQuantity !== undefined && product.stockQuantity <= 0;

  const finalPrice = dealerDiscount
    ? product.price * (1 - dealerDiscount / 100)
    : product.price;

  function handleAddToCart() {
    if (outOfStock) return;
    addItem({ ...product, price: finalPrice });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleBuyNow() {
    if (outOfStock) return;
    addItem({ ...product, price: finalPrice });
    router.push("/checkout");
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
    <>
      <button
        onClick={handleAddToCart}
        className={`flex-1 py-3 px-6 rounded-xl border-2 font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-2 ${
          added
            ? "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400"
            : "border-accent text-accent hover:bg-orange-50 dark:hover:bg-orange-950/20"
        }`}
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
      {showBuyNow && (
        <button
          onClick={handleBuyNow}
          className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5" />
          {t("product.buy_now")}
        </button>
      )}
    </>
  );
}
