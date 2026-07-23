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

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
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

  // Direct WhatsApp chat with an autofilled message containing product details.
  const WHATSAPP_NUMBER = "256704823800";
  const productUrl = `https://mercurycomputerslimited.com/product/${product.id}`;
  const whatsappMessage =
    `Hello Mercury Computers 👋\n\n` +
    `I'm interested in this product:\n` +
    `*${product.name}*\n` +
    `Price: ${format(product.price)}\n` +
    `${productUrl}\n\n` +
    `Is it available?`;
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

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
        <span className="text-2xl font-extrabold text-ink">
          {format(product.price)}
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

      {/* Direct WhatsApp chat */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
      >
        <WhatsAppIcon />
        Chat on WhatsApp
      </a>

      {/* Trust rows */}
      <div className="mt-6 flex flex-col gap-3.5 border-t border-line pt-5">
        <TrustRow
          icon={<Truck size={16} />}
          title="Free Delivery"
          subtitle="Free delivery within Kampala Central on this order"
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
