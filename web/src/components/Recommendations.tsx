"use client";

import { useState } from "react";
import { type Product } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";

const PAGE_SIZE = 12;

export default function Recommendations({ products }: { products?: Product[] }) {
  const catalog = products ?? [];
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const visible = catalog.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < catalog.length;

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh delay for skeleton display
    setTimeout(() => {
      setPage(1);
      setRefreshing(false);
    }, 600);
  };

  if (catalog.length === 0) return null;

  return (
    <section className="mt-8">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight text-mercury">
          Explore our recommendations
        </h2>
        <button
          onClick={handleRefresh}
          className="text-sm font-medium text-mercury transition hover:text-mercury-dark"
        >
          Refresh
        </button>
      </div>

      {/* Grid with skeleton or products */}
      {refreshing ? (
        <ProductGridSkeleton count={PAGE_SIZE} />
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(172px,1fr))] gap-3">
            {visible.map((product, i) => (
              <ProductCard key={`${product.id}-${i}`} product={product} />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="rounded-full border border-line bg-white px-8 py-2.5 text-sm font-semibold text-ink transition hover:border-mercury hover:text-mercury"
              >
                Load More ({catalog.length - visible.length} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
