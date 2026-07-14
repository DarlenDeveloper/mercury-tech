"use client";

import { useState } from "react";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { type Product } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";

const PAGE_SIZE = 20;

export default function Recommendations({ products }: { products?: Product[] }) {
  const catalog = products ?? [];
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
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-mercury hover:text-mercury disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>

              {getPageNumbers(page, totalPages).map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="px-1 text-sm text-muted">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition ${
                      page === p
                        ? "bg-mercury text-white"
                        : "border border-line bg-white text-ink hover:border-mercury hover:text-mercury"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-mercury hover:text-mercury disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

/** Generate page numbers with ellipsis for large page counts. */
function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [];
  pages.push(1);

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);
  return pages;
}
