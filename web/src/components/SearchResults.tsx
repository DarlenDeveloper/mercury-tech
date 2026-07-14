"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type Product } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

const PAGE_SIZE = 20;

export default function SearchResults({ products }: { products: Product[] }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const visible = products.slice(start, start + PAGE_SIZE);

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(172px,1fr))] gap-3">
        {visible.map((product, i) => (
          <ProductCard key={`${product.id}-${i}`} product={product} />
        ))}
      </div>

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
  );
}
