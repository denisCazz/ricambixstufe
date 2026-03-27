"use client";

import { useLocale } from "@/lib/locale-context";
import { useUser } from "@/lib/user-context";

export default function PriceDisplay({
  price,
  className,
}: {
  price: number;
  className?: string;
}) {
  const { formatPrice } = useLocale();
  const { dealerDiscount } = useUser();

  if (dealerDiscount) {
    const discounted = price * (1 - dealerDiscount / 100);
    return (
      <span className={className}>
        <span className="line-through text-muted text-sm mr-2">{formatPrice(price)}</span>
        <span className="text-green-600">{formatPrice(discounted)}</span>
      </span>
    );
  }

  return <span className={className}>{formatPrice(price)}</span>;
}
