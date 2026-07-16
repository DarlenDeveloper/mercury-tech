"use client";

import { useState } from "react";
import { Star, Minus, Plus, Truck, ShieldCheck, Headphones, Check } from "lucide-react";
import { type Product } from "@/lib/products";
import { useCurrency } from "@/components/CurrencyProvider";
import AddToCartButton from "@/components/AddToCartButton";
import RequestQuoteButton from "@/components/RequestQuoteButton";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < Math.round(rating);
        return (
          <Star
            key={i}
            size={14}
            className={filled ? "fill-amber-400 text-amber-400" : "text-line"}
          />
        );
      })}
    </div>
  );
}

function TrustRow({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky text-mercury">
        {icon}
      </span>
      <div>
        <p className="text-[13px] font-semibold text-ink">{title}</p>
        <p className="text-xs text-muted">{subtitle}</p>
      </div>
    </div>
  );
}

export default function ProductInfo({
  product,
  reviewAverage = 0,
  reviewCount = 0,
}: {
  product: Product;
  reviewAverage?: number;
  reviewCount?: number;
}) {
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(0);
  const { format } = useCurrency();
  const onSale = product.oldPrice != null && product.oldPrice > product.price;
  const colors = product.colors ?? [];

  // Prefer live review data; fall back to the catalog's static rating.
  const hasReviews = reviewCount > 0;
  const displayRating = hasReviews ? reviewAverage : product.rating;
  const displayReviews = hasReviews
    ? `${reviewCount} ${reviewCount === 1 ? "Review" : "Reviews"}`
    : "No reviews yet";

  return (
    <div className="flex flex-col">
      <p className="text-xs font-medium text-muted">{product.category}</p>
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink">
        {product.name}
      </h1>

      <p className="mt-2 text-sm leading-relaxed text-muted">
        {product.description}
      </p>

      {/* Rating */}
      <div className="mt-2.5 flex items-center gap-2">
        <Stars rating={displayRating} />
        <span className="text-xs text-muted">
          {hasReviews ? `${displayRating.toFixed(1)} (${displayReviews})` : displayReviews}
        </span>
      </div>

      {/* Price */}
      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <span className="text-2xl text-ink">
          <span className="font-medium">USh</span>{" "}
          <span className="font-extrabold">{Math.round(product.price).toLocaleString("en-UG")}</span>
        </span>
        {onSale && (
          <span className="text-base font-medium text-muted line-through">
            {format(product.oldPrice!)}
          </span>
        )}
        {onSale && (
          <span className="text-xs font-semibold text-mercury-accent">
            Discount only this weekend
          </span>
        )}
      </div>

      {/* Color picker (shown only when the product has colour variants). */}
      {colors.length > 0 && (
        <div className="mt-4">
          <p className="text-[13px] font-semibold text-ink">
            Pick a Color
            <span className="ml-2 font-normal text-muted">
              {colors[color].name}
            </span>
          </p>
          <div className="mt-2 flex items-center gap-2.5">
            {colors.map((c, i) => (
              <button
                key={c.name}
                type="button"
                aria-label={c.name}
                onClick={() => setColor(i)}
                style={{ backgroundColor: c.hex }}
                className={`flex h-7 w-7 items-center justify-center rounded-lg ring-2 ring-offset-2 transition ${
                  i === color ? "ring-mercury" : "ring-transparent"
                }`}
              >
                {i === color && (
                  <Check size={14} className="text-white drop-shadow" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity + stock */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-full border border-line p-1">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink transition hover:bg-surface-soft disabled:opacity-40"
            disabled={qty <= 1}
          >
            <Minus size={15} />
          </button>
          <span className="w-7 text-center text-sm font-bold text-ink tabular-nums">
            {qty}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => Math.min(product.stock ?? 99, q + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink transition hover:bg-surface-soft"
          >
            <Plus size={15} />
          </button>
        </div>

        {product.stock != null && product.stock <= 10 && (
          <span className="text-[13px] font-medium text-mercury-accent">
            Only {product.stock} items left, hurry up!
          </span>
        )}
      </div>

      {/* CTAs */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <AddToCartButton
          productId={product.id}
          name={product.name}
          category={product.category}
          priceUsd={product.price / 3780}
          image={product.image}
        />
        <RequestQuoteButton
          productId={product.id}
          productName={product.name}
          productPrice={product.price}
        />
      </div>

      {/* Trust rows */}
      <div className="mt-6 flex flex-col gap-3.5 border-t border-line pt-5">
        <TrustRow
          icon={<Truck size={16} />}
          title="Free Delivery"
          subtitle="Free delivery within Kampala on this order"
        />
        <TrustRow
          icon={<ShieldCheck size={16} />}
          title="Secure Payments"
          subtitle="Trusted, secure checkout options available"
        />
        <TrustRow
          icon={<Headphones size={16} />}
          title="24/7 Support"
          subtitle="Our support team is here to help anytime"
        />
      </div>
    </div>
  );
}
