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
          {format(product.price)}
        </span>
        {onSale && (
          <span className="text-[10px] text-[#E11D2A] line-through">
            {format(product.oldPrice!)}
          </span>
        )}
      </div>
    </Link>
  );
}
