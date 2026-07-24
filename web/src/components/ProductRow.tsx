"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { type Product } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

/**
 * A single horizontally scrolling row of products with a title and a
 * "View all" link. Used for the flash sale and each department row on the
 * homepage. Scrolls to the right by default; arrow buttons nudge left/right.
 */
export default function ProductRow({
  title,
  viewAllHref,
  products,
  accent = false,
}: {
  title: string;
  viewAllHref?: string;
  products: Product[];
  accent?: boolean;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  if (!products || products.length === 0) return null;

  const nudge = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.85), behavior: "smooth" });
  };

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2
          className={`text-lg font-semibold tracking-tight sm:text-xl ${
            accent ? "text-mercury" : "text-ink"
          }`}
        >
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="flex items-center gap-1 text-sm font-medium text-mercury transition hover:gap-1.5"
            >
              View all
              <ArrowRight size={15} />
            </Link>
          )}
          <div className="hidden items-center gap-1.5 sm:flex">
            <button
              type="button"
              onClick={() => nudge(-1)}
              aria-label="Scroll left"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-mercury hover:text-mercury"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => nudge(1)}
              aria-label="Scroll right"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-mercury hover:text-mercury"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scroller}
        className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-1 pb-1"
      >
        {products.map((product, i) => (
          <div
            key={`${product.id}-${i}`}
            className="w-[46%] shrink-0 snap-start sm:w-[220px] lg:w-[200px]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
