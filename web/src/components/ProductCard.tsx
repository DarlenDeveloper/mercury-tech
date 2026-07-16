"use client";

import Image from "next/image";
import Link from "next/link";
import { type Product } from "@/lib/products";
import { useCurrency } from "@/components/CurrencyProvider";
import WishlistButton from "@/components/WishlistButton";

export default function ProductCard({ product }: { product: Product }) {
  const { format } = useCurrency();
  const onSale = product.oldPrice != null && product.oldPrice > product.price;
  const href = `/product/${product.id}`;

  // Compact format for card display only (e.g. 1.2M, 478K, 67K)
  const formatCompact = (n: number) => {
    if (n >= 1_000_000) {
      const m = n / 1_000_000;
      return `USh ${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
    }
    if (n >= 1_000) {
      const k = n / 1_000;
      return `USh ${k % 1 === 0 ? k.toFixed(0) : k.toFixed(0)}K`;
    }
    return `USh ${n.toLocaleString("en-UG")}`;
  };

  return (
    <Link href={href} className="group flex flex-col">
      {/* Image tile */}
      <div className="relative">
        <div className="relative block aspect-square overflow-hidden rounded-[18px] border border-[#E3E5EA] bg-[#F0F1F4]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 240px"
            className="object-cover"
          />

          {onSale && (
            <span className="absolute left-2.5 top-2.5 rounded-md bg-mercury px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-white">
              SALE
            </span>
          )}
        </div>

        <div className="absolute bottom-2 right-2 z-10">
          <WishlistButton productId={product.id} />
        </div>
      </div>

      {/* Name */}
      <h3 className="mt-2 truncate text-[13px] font-semibold text-ink transition group-hover:text-mercury">
        {product.name}
      </h3>

      {/* Description */}
      <p className="mt-0.5 truncate text-[11px] leading-snug text-muted">
        {product.description}
      </p>

      {/* Price + old price */}
      <div className="mt-1.5 flex items-end gap-1.5">
        <span className="text-[13px] font-semibold text-ink">
          {formatCompact(product.price)}
        </span>
        {onSale && (
          <span className="text-[10px] text-[#E11D2A] line-through">
            {formatCompact(product.oldPrice!)}
          </span>
        )}
      </div>
    </Link>
  );
}
