"use client";

import { useState } from "react";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { type Product } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";

const PAGE_SIZE = 20;

export default function Recommendations({ products }: { products?: Product[] }) {
  // Order by price high → low (rather than the default A–Z / doc order).
  const catalog = (products ?? []).slice().sort((a, b) => b.price - a.price);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const totalPages = Math.ceil(catalog.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const visible = catalog.slice(start, start + PAGE_SIZE);

  const handleRefresh = () => {
    setRefreshing(true);
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
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-mercury">
            Explore our recommendations
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            {catalog.length} products · Page {page} of {totalPages}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-mercury hover:text-mercury disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1.5 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink transition hover:border-mercury hover:text-mercury disabled:opacity-30"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <span className="text-sm text-muted">
                {page} / {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1.5 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink transition hover:border-mercury hover:text-mercury disabled:opacity-30"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
