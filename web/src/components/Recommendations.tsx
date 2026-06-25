"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default function Recommendations() {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    scroller.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  // Repeat the catalog so the rail has enough items to scroll through.
  const items = Array.from(
    { length: 10 },
    (_, i) => PRODUCTS[i % PRODUCTS.length]
  );

  return (
    <section className="w-full px-4 py-10 lg:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-ink md:text-3xl">
          Explore our recommendations
        </h2>
        <div className="flex items-center gap-2">
          <button
            aria-label="Previous"
            onClick={() => scrollBy(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition hover:border-mercury hover:text-mercury"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            aria-label="Next"
            onClick={() => scrollBy(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition hover:border-mercury hover:text-mercury"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Rail */}
      <div
        ref={scroller}
        className="flex gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((product, i) => (
          <div key={`${product.id}-${i}`} className="w-[300px] shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
