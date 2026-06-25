import Image from "next/image";
import { formatUgx, type Product } from "@/lib/products";
import WishlistButton from "@/components/WishlistButton";

export default function ProductCard({ product }: { product: Product }) {
  const onSale = product.oldPrice != null && product.oldPrice > product.price;

  return (
    <div className="flex flex-col">
      {/* Image tile */}
      <div className="relative aspect-square overflow-hidden rounded-[18px] border border-[#E3E5EA] bg-[#F0F1F4]">
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

        <div className="absolute bottom-2 right-2">
          <WishlistButton />
        </div>
      </div>

      {/* Name */}
      <h3 className="mt-2 truncate text-[13px] font-semibold text-ink">
        {product.name}
      </h3>

      {/* Description */}
      <p className="mt-0.5 truncate text-[11px] leading-snug text-muted">
        {product.description}
      </p>

      {/* Price + old price */}
      <div className="mt-1.5 flex items-end gap-1.5">
        <span className="text-[13px] font-semibold text-ink">
          {formatUgx(product.price)}
        </span>
        {onSale && (
          <span className="text-[10px] text-[#E11D2A] line-through">
            {formatUgx(product.oldPrice!)}
          </span>
        )}
      </div>
    </div>
  );
}
