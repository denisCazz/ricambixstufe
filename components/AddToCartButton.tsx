"use client";

import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";

export default function AddToCartButton({
  product,
}: {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    image: string | null;
  };
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      onClick={handleClick}
      className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-2"
    >
      {added ? (
        <>
          <Check className="w-5 h-5" />
          Aggiunto!
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5" />
          Aggiungi al Carrello
        </>
      )}
    </button>
  );
}
