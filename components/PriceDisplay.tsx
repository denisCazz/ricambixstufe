"use client";

import { useLocale } from "@/lib/locale-context";
import { useUser } from "@/lib/user-context";

function netPrice(gross: number): number {
  return Math.round((gross / 1.22) * 100) / 100;
}

export default function PriceDisplay({
  price,
  className,
}: {
  price: number;
  className?: string;
}) {
  const { formatPrice, isItalianLocale } = useLocale();
  const { dealerDiscount } = useUser();

  const displayPrice = isItalianLocale ? price : netPrice(price);

  if (dealerDiscount) {
    const discounted = displayPrice * (1 - dealerDiscount / 100);
    return (
      <span className={className}>
        <span className="line-through text-muted text-sm mr-2">{formatPrice(displayPrice)}</span>
        <span className="text-green-600">{formatPrice(discounted)}</span>
      </span>
    );
  }

  return <span className={className}>{formatPrice(displayPrice)}</span>;
}
