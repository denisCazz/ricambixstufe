"use client";

import { useLocale } from "@/lib/locale-context";

export default function PriceDisplay({
  price,
  className,
}: {
  price: number;
  className?: string;
}) {
  const { formatPrice } = useLocale();
  return <span className={className}>{formatPrice(price)}</span>;
}
