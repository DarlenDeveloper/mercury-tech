"use client";

import { useState } from "react";
import type { Product } from "@/lib/products";
import ProductReviews from "./ProductReviews";

const TABS = ["Description", "Additional Information", "Reviews"] as const;
type Tab = (typeof TABS)[number];

export default function ProductTabs({ product }: { product: Product }) {
  const [tab, setTab] = useState<Tab>("Additional Information");

  return (
    <section className="mt-10">
      {/* Tab headers */}
      <div className="flex justify-center gap-8 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`relative -mb-px pb-3 text-sm font-semibold transition ${
              tab === t
                ? "text-ink"
                : "text-muted hover:text-ink"
            }`}
          >
            {t}
            {tab === t && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-mercury" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-8">
        {tab === "Description" && (
          <p className="mx-auto max-w-3xl text-center text-sm leading-relaxed text-muted">
            {product.overview ?? product.description}
          </p>
        )}

        {tab === "Additional Information" && <SpecTable product={product} />}

        {tab === "Reviews" && <ProductReviews productId={product.id} />}
      </div>
    </section>
  );
}

function SpecTable({ product }: { product: Product }) {
  const specs = product.specs ?? [];

  if (specs.length === 0) {
    return (
      <p className="text-center text-sm text-muted">
        No additional information available for this product yet.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="bg-mercury text-white">
            <th className="px-4 py-3 font-semibold">Specification</th>
            <th className="px-4 py-3 font-semibold">Details</th>
            <th className="hidden px-4 py-3 font-semibold sm:table-cell">
              More Info
            </th>
            <th className="hidden px-4 py-3 font-semibold sm:table-cell">
              Remarks
            </th>
          </tr>
        </thead>
        <tbody>
          {specs.map((row, i) => (
            <tr
              key={row.spec}
              className={i % 2 === 0 ? "bg-white" : "bg-surface-soft"}
            >
              <td className="px-4 py-3 font-medium text-ink">{row.spec}</td>
              <td className="px-4 py-3 text-muted">{row.details}</td>
              <td className="hidden px-4 py-3 text-muted sm:table-cell">
                {row.moreInfo}
              </td>
              <td className="hidden px-4 py-3 text-muted sm:table-cell">
                {row.remarks}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


