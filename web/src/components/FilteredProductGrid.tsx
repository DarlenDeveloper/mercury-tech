"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { type Product } from "@/lib/products";
import { useCurrency } from "@/components/CurrencyProvider";
import ProductCard from "@/components/ProductCard";

type SortOption = "relevance" | "price_asc" | "price_desc" | "name_asc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Most relevant" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "name_asc", label: "Name: A → Z" },
];

// Spec keys worth surfacing as filters (if they appear often enough)
const SPEC_KEYS_OF_INTEREST = [
  "Processor",
  "Memory (RAM)",
  "Memory",
  "RAM",
  "Storage",
  "Display",
  "Graphics",
  "Connectivity",
  "Operating System",
  "Print Technology",
  "Functions",
  "Scanner Type",
  "Screen Size",
  "Resolution",
];

const PAGE_SIZE = 24;

export default function FilteredProductGrid({
  products,
  title,
}: {
  products: Product[];
  title?: string;
}) {
  const { format } = useCurrency();
  const [sort, setSort] = useState<SortOption>("relevance");
  const [brandFilter, setBrandFilter] = useState<Set<string>>(new Set());
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [specFilters, setSpecFilters] = useState<Map<string, Set<string>>>(new Map());
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const filterRef = useRef<HTMLDivElement>(null);

  // Auto-dismiss filter panel on outside click
  useEffect(() => {
    if (!showFilters) return;
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showFilters]);

  // Derive filter options from products
  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      const b = (p.brand || "").trim();
      if (b) counts.set(b, (counts.get(b) || 0) + 1);
    }
    return [...counts.entries()]
      .filter(([, c]) => c >= 1)
      .sort((a, b) => b[1] - a[1])
      .map(([brand, count]) => ({ brand, count }));
  }, [products]);

  const priceStats = useMemo(() => {
    const prices = products.map((p) => p.price).filter((p) => p > 0);
    return { min: Math.min(...prices, 0), max: Math.max(...prices, 0) };
  }, [products]);

  // Dynamic spec filters (only show keys that have 3+ distinct values and appear in 5+ products)
  const specOptions = useMemo(() => {
    const specMap = new Map<string, Map<string, number>>();
    for (const p of products) {
      if (!p.specs) continue;
      for (const row of p.specs) {
        if (!SPEC_KEYS_OF_INTEREST.includes(row.spec)) continue;
        if (!specMap.has(row.spec)) specMap.set(row.spec, new Map());
        const valMap = specMap.get(row.spec)!;
        const val = row.details.trim();
        if (val) valMap.set(val, (valMap.get(val) || 0) + 1);
      }
    }
    const result: { key: string; values: { value: string; count: number }[] }[] = [];
    for (const [key, valMap] of specMap) {
      const values = [...valMap.entries()]
        .filter(([, c]) => c >= 2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([value, count]) => ({ value, count }));
      if (values.length >= 2) result.push({ key, values });
    }
    return result.slice(0, 4); // Max 4 spec filters
  }, [products]);

  // Apply filters + sort
  const filtered = useMemo(() => {
    let result = [...products];

    if (brandFilter.size > 0) {
      result = result.filter((p) => brandFilter.has((p.brand || "").trim()));
    }
    if (inStockOnly) {
      result = result.filter((p) => (p.stock ?? 0) > 0);
    }
    if (priceRange) {
      result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    }
    // Spec filters
    for (const [key, vals] of specFilters) {
      if (vals.size === 0) continue;
      result = result.filter((p) => {
        if (!p.specs) return false;
        const row = p.specs.find((s) => s.spec === key);
        return row ? vals.has(row.details.trim()) : false;
      });
    }

    // Sort
    switch (sort) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name_asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [products, brandFilter, inStockOnly, priceRange, specFilters, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  const activeFilterCount =
    brandFilter.size +
    (inStockOnly ? 1 : 0) +
    (priceRange ? 1 : 0) +
    [...specFilters.values()].reduce((s, v) => s + v.size, 0);

  const clearAll = () => {
    setBrandFilter(new Set());
    setInStockOnly(false);
    setPriceRange(null);
    setSpecFilters(new Map());
    setPage(1);
  };

  const toggleBrand = (brand: string) => {
    setBrandFilter((prev) => {
      const next = new Set(prev);
      next.has(brand) ? next.delete(brand) : next.add(brand);
      return next;
    });
    setPage(1);
  };

  const toggleSpec = (key: string, value: string) => {
    setSpecFilters((prev) => {
      const next = new Map(prev);
      const vals = new Set(next.get(key) || []);
      vals.has(value) ? vals.delete(value) : vals.add(value);
      next.set(key, vals);
      return next;
    });
    setPage(1);
  };

  return (
    <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
      {/* Toolbar + Filter panel wrapper */}
      <div ref={filterRef} className="contents">
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 lg:col-start-2">
        <div className="flex flex-wrap items-center gap-2.5">
          {title && (
            <h1 className="mr-1 text-2xl font-bold tracking-tight text-ink">
              {title}
            </h1>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition lg:hidden ${
              showFilters || activeFilterCount > 0
                ? "border-mercury bg-mercury/5 text-mercury"
                : "border-line bg-white text-ink hover:border-mercury"
            }`}
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-mercury px-1.5 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-xs font-medium text-muted transition hover:text-ink"
            >
              <X size={13} />
              Clear all
            </button>
          )}

          <span className={`text-sm text-muted ${title ? "border-l border-line pl-3" : ""}`}>
            {filtered.length} {filtered.length === 1 ? "product" : "products"}
          </span>
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value as SortOption); setPage(1); }}
            className="h-9 appearance-none rounded-full border border-line bg-white pl-4 pr-9 text-sm text-ink outline-none transition focus:border-mercury"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
        </div>
      </div>

      {/* Filter panel */}
      <aside
        className={`${showFilters ? "block" : "hidden"} mb-5 lg:sticky lg:top-24 lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:block lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:pr-4`}
      >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-ink">Filter products</h2>
              <p className="mt-1 text-xs text-muted">Refine your selection</p>
            </div>
            {activeFilterCount > 0 && (
              <button onClick={clearAll} className="text-xs font-semibold text-mercury hover:text-mercury-dark">
                Reset
              </button>
            )}
          </div>
          <div className="flex flex-col gap-6">
            {/* Brand */}
            {brands.length > 0 && (
              <FilterGroup title="Brand">
                <div className="flex flex-wrap gap-1.5">
                  {brands.slice(0, 12).map(({ brand, count }) => (
                    <button
                      key={brand}
                      onClick={() => toggleBrand(brand)}
                      className={`rounded-full border px-3 py-1.5 text-[12px] font-medium capitalize transition ${
                        brandFilter.has(brand)
                          ? "border-mercury bg-mercury text-white"
                          : "border-line bg-white text-ink hover:border-mercury"
                      }`}
                    >
                      {brand} ({count})
                    </button>
                  ))}
                </div>
              </FilterGroup>
            )}

            {/* Price */}
            <FilterGroup title="Price">
              <div className="mb-3 flex items-center justify-between text-xs font-medium text-ink">
                <span>{format(priceRange?.[0] ?? priceStats.min)}</span>
                <span>{format(priceRange?.[1] ?? priceStats.max)}</span>
              </div>
              <div className="space-y-2">
                <input
                  aria-label="Minimum price"
                  type="range"
                  min={priceStats.min}
                  max={priceStats.max}
                  step={Math.max(1000, Math.round((priceStats.max - priceStats.min) / 100))}
                  value={priceRange?.[0] ?? priceStats.min}
                  onChange={(e) => {
                    const min = Math.min(Number(e.target.value), priceRange?.[1] ?? priceStats.max);
                    setPriceRange([min, priceRange?.[1] ?? priceStats.max]);
                    setPage(1);
                  }}
                  className="w-full accent-mercury"
                />
                <input
                  aria-label="Maximum price"
                  type="range"
                  min={priceStats.min}
                  max={priceStats.max}
                  step={Math.max(1000, Math.round((priceStats.max - priceStats.min) / 100))}
                  value={priceRange?.[1] ?? priceStats.max}
                  onChange={(e) => {
                    const max = Math.max(Number(e.target.value), priceRange?.[0] ?? priceStats.min);
                    setPriceRange([priceRange?.[0] ?? priceStats.min, max]);
                    setPage(1);
                  }}
                  className="w-full accent-mercury"
                />
              </div>
            </FilterGroup>

            {/* In stock */}
            <FilterGroup title="Availability">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => { setInStockOnly(e.target.checked); setPage(1); }}
                  className="rounded border-line"
                />
                <span className="text-ink">In stock only</span>
              </label>
            </FilterGroup>

            {/* Dynamic spec filters */}
            {specOptions.map((spec) => (
              <FilterGroup key={spec.key} title={spec.key}>
                <div className="flex flex-wrap gap-1.5">
                  {spec.values.map(({ value, count }) => {
                    const active = specFilters.get(spec.key)?.has(value);
                    return (
                      <button
                        key={value}
                        onClick={() => toggleSpec(spec.key, value)}
                        className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition ${
                          active
                            ? "border-mercury bg-mercury text-white"
                            : "border-line bg-white text-ink hover:border-mercury"
                        }`}
                      >
                        {value.slice(0, 30)} ({count})
                      </button>
                    );
                  })}
                </div>
              </FilterGroup>
            ))}
          </div>
        </aside>
      </div>

      {/* Product grid */}
      <div className="min-w-0 lg:col-start-2">
      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-muted">No products match your filters.</p>
          <button
            onClick={clearAll}
            className="mt-3 text-sm font-semibold text-mercury transition hover:text-mercury-dark"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(172px,1fr))] gap-3">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="rounded-full border border-line bg-white px-8 py-2.5 text-sm font-semibold text-ink transition hover:border-mercury hover:text-mercury"
              >
                Load more ({filtered.length - visible.length} remaining)
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 border-t border-line pt-4 first:border-t-0 first:pt-0">
      <p className="mb-2 text-[12px] font-semibold text-ink">{title}</p>
      {children}
    </div>
  );
}
