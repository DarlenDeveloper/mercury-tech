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

const PAGE_SIZE = 24;

type SimpleFilterGroup = {
  key: string;
  values: string[];
  classify: (product: Product) => string;
};

export default function FilteredProductGrid({
  products,
  title,
  categorySlug,
}: {
  products: Product[];
  title?: string;
  categorySlug?: string;
}) {
  const { format } = useCurrency();
  const [sort, setSort] = useState<SortOption>("relevance");
  const [brandFilter, setBrandFilter] = useState<Set<string>>(new Set());
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

  // Keep the brand order stable while the counts react to the other filters.
  const brandNames = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      const b = (p.brand || "").trim();
      if (b) counts.set(b, (counts.get(b) || 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([brand]) => brand);
  }, [products]);

  const priceStats = useMemo(() => {
    const prices = products.map((p) => p.price).filter((p) => p > 0);
    return { min: Math.min(...prices, 0), max: Math.max(...prices, 0) };
  }, [products]);

  const simpleFilterGroups = useMemo(
    () => getSimpleFilterGroups(categorySlug, products),
    [categorySlug, products],
  );

  const brands = useMemo(() => brandNames.map((brand) => ({
    brand,
    count: products.filter((product) =>
      matchesFilters(product, brandFilter, priceRange, specFilters, simpleFilterGroups, "Brand") &&
      (product.brand || "").trim() === brand,
    ).length,
  })), [brandNames, products, brandFilter, priceRange, specFilters, simpleFilterGroups]);

  // Faceted counts apply every active filter except the group being counted.
  const specOptions = useMemo(() => {
    return simpleFilterGroups.map((group) => ({
      key: group.key,
      values: group.values
        .map((value) => ({
          value,
          count: products.filter((product) =>
            matchesFilters(product, brandFilter, priceRange, specFilters, simpleFilterGroups, group.key) &&
            group.classify(product) === value,
          ).length,
        })),
    }));
  }, [products, brandFilter, priceRange, specFilters, simpleFilterGroups]);

  // Apply filters + sort
  const filtered = useMemo(() => {
    const result = products.filter((product) =>
      matchesFilters(product, brandFilter, priceRange, specFilters, simpleFilterGroups),
    );

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
  }, [products, brandFilter, priceRange, specFilters, sort, simpleFilterGroups]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  const activeFilterCount =
    brandFilter.size +
    (priceRange ? 1 : 0) +
    [...specFilters.values()].reduce((s, v) => s + v.size, 0);

  const clearAll = () => {
    setBrandFilter(new Set());
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
                      disabled={count === 0 && !brandFilter.has(brand)}
                      className={`rounded-full border px-3 py-1.5 text-[12px] font-medium capitalize transition ${
                        brandFilter.has(brand)
                          ? "border-mercury bg-mercury text-white"
                          : count === 0
                            ? "cursor-not-allowed border-line bg-white text-muted opacity-50"
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

            {/* Simple, category-specific filters */}
            {specOptions.map((spec) => (
              <FilterGroup key={spec.key} title={spec.key}>
                <div className="flex flex-wrap gap-1.5">
                  {spec.values.map(({ value, count }) => {
                    const active = specFilters.get(spec.key)?.has(value);
                    return (
                      <button
                        key={value}
                        onClick={() => toggleSpec(spec.key, value)}
                        disabled={count === 0 && !active}
                        className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition ${
                          active
                            ? "border-mercury bg-mercury text-white"
                            : count === 0
                              ? "cursor-not-allowed border-line bg-white text-muted opacity-50"
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

function matchesFilters(
  product: Product,
  brandFilter: Set<string>,
  priceRange: [number, number] | null,
  specFilters: Map<string, Set<string>>,
  groups: SimpleFilterGroup[],
  omittedGroup?: string,
) {
  if (
    omittedGroup !== "Brand" &&
    brandFilter.size > 0 &&
    !brandFilter.has((product.brand || "").trim())
  ) {
    return false;
  }

  if (priceRange && (product.price < priceRange[0] || product.price > priceRange[1])) {
    return false;
  }

  for (const [key, values] of specFilters) {
    if (key === omittedGroup || values.size === 0) continue;
    const group = groups.find((item) => item.key === key);
    if (group && !values.has(group.classify(product))) return false;
  }

  return true;
}

function productText(product: Product) {
  const specs = product.specs
    ?.map((row) => `${row.spec} ${row.details} ${row.moreInfo} ${row.remarks}`)
    .join(" ") ?? "";
  return `${product.name} ${product.description} ${product.category} ${specs}`.toLowerCase();
}

function bucketByPatterns(text: string, buckets: [string, RegExp][], fallback = "Other") {
  return buckets.find(([, pattern]) => pattern.test(text))?.[0] ?? fallback;
}

function memoryBucket(product: Product) {
  const text = productText(product);
  return bucketByPatterns(text, [
    ["32GB", /\b32\s*gb\b/i],
    ["16GB", /\b16\s*gb\b/i],
    ["8GB", /\b8\s*gb\b/i],
    ["4GB", /\b4\s*gb\b/i],
  ]);
}

function storageBucket(product: Product) {
  const text = productText(product);
  return bucketByPatterns(text, [
    ["1TB", /\b1\s*tb\b|\b1000\s*gb\b/i],
    ["512GB", /\b512\s*gb\b/i],
    ["256GB", /\b256\s*gb\b/i],
  ]);
}

function displayBucket(product: Product) {
  const text = productText(product);
  return bucketByPatterns(text, [
    ["13.6", /\b13[.]6[- ]*(?:inch|inches|in|\")?/i],
    ["13", /\b13(?:[.]0)?[- ]*(?:inch|inches|in|\")/i],
    ["15.6", /\b15[.]6[- ]*(?:inch|inches|in|\")?/i],
    ["14", /\b14(?:[.]0)?[- ]*(?:inch|inches|in|\")/i],
    ["16", /\b16(?:[.]0)?[- ]*(?:inch|inches|in|\")/i],
  ]);
}

function getSimpleFilterGroups(categorySlug: string | undefined, products: Product[]): SimpleFilterGroup[] {
  const slug = (categorySlug || commonCategory(products)).toLowerCase();

  if (slug === "laptops" || slug.includes("laptop")) {
    return [
      { key: "Display", values: ["13", "13.6", "14", "15.6", "16", "Other"], classify: displayBucket },
      { key: "Storage", values: ["256GB", "512GB", "1TB", "Other"], classify: storageBucket },
      { key: "Memory", values: ["4GB", "8GB", "16GB", "32GB", "Other"], classify: memoryBucket },
      {
        key: "Capabilities",
        values: ["Touch screen", "Non-touch screen"],
        classify: (product) => {
          const text = productText(product);
          return /\b(?:touchscreen|touch[ -]?screen|touch display|2-in-1|convertible)\b/i.test(text) &&
            !/\bnon[ -]?touch\b/i.test(text)
            ? "Touch screen"
            : "Non-touch screen";
        },
      },
    ];
  }

  if (slug === "desktops" || slug.includes("desktop") || slug.includes("monitor")) {
    return [
      {
        key: "Type",
        values: ["Desktop", "All-in-One", "Monitor", "Other"],
        classify: (product) => bucketByPatterns(productText(product), [
          ["All-in-One", /\ball[ -]?in[ -]?one\b|\baio\b|\bproone\b/i],
          ["Monitor", /\bmonitor\b|\bdisplay\b/i],
          ["Desktop", /\bdesktop\b|\boptiplex\b|\bprodesk\b|\btower\b|\bsff\b/i],
        ]),
      },
      { key: "Memory", values: ["4GB", "8GB", "16GB", "32GB", "Other"], classify: memoryBucket },
      { key: "Storage", values: ["256GB", "512GB", "1TB", "Other"], classify: storageBucket },
    ];
  }

  if (slug === "printers-office" || slug.includes("printer") || slug.includes("scanner")) {
    return [
      {
        key: "Type",
        values: ["Ink Tank", "Laser", "Inkjet", "Scanner", "Other"],
        classify: (product) => bucketByPatterns(productText(product), [
          ["Ink Tank", /\bink[ -]?tank\b|\becotank\b|\bsmart tank\b/i],
          ["Laser", /\blaser(?:jet)?\b/i],
          ["Inkjet", /\binkjet\b|\bdeskjet\b|\bofficejet\b|\bpixma\b/i],
          ["Scanner", /\bscanner\b|\bscanjet\b/i],
        ]),
      },
      {
        key: "Functions",
        values: ["Print only", "Multifunction"],
        classify: (product) => /\b(?:all[ -]?in[ -]?one|multifunction|mfp|scan|copy)\b/i.test(productText(product))
          ? "Multifunction"
          : "Print only",
      },
      {
        key: "Output",
        values: ["Colour", "Black & white", "Other"],
        classify: (product) => bucketByPatterns(productText(product), [
          ["Black & white", /\bblack[ -]?(?:and|&)\s*white\b|\bmonochrome\b|\bmono\b/i],
          ["Colour", /\bcolou?r\b/i],
        ]),
      },
    ];
  }

  if (slug === "networking-security" || slug.includes("network") || slug.includes("router")) {
    return [{
      key: "Type",
      values: ["Router", "Switch", "Security camera", "Wi-Fi adapter", "Other"],
      classify: (product) => bucketByPatterns(productText(product), [
        ["Router", /\brouter\b|\baccess point\b/i],
        ["Switch", /\bswitch\b/i],
        ["Security camera", /\bcamera\b|\bcctv\b|\bnvr\b|\bdvr\b/i],
        ["Wi-Fi adapter", /\bwi-?fi adapter\b|\bwireless adapter\b/i],
      ]),
    }];
  }

  if (slug === "ups-power" || slug.includes("ups") || slug.includes("power")) {
    return [
      {
        key: "Type",
        values: ["Standard UPS", "Smart UPS", "UPS battery", "Other"],
        classify: (product) => bucketByPatterns(productText(product), [
          ["UPS battery", /\b(?:ups )?battery\b/i],
          ["Smart UPS", /\bsmart-?ups\b|\bonline ups\b/i],
          ["Standard UPS", /\bups\b|uninterruptible/i],
        ]),
      },
      {
        key: "Capacity",
        values: ["650VA", "1000VA", "1500VA", "2000VA+", "Other"],
        classify: (product) => bucketByPatterns(productText(product), [
          ["650VA", /\b650\s*va\b/i],
          ["1000VA", /\b(?:1000\s*va|1\s*kva)\b/i],
          ["1500VA", /\b(?:1500\s*va|1[.]5\s*kva)\b/i],
          ["2000VA+", /\b(?:2(?:000)?|3(?:000)?|5(?:000)?|10(?:000)?)\s*(?:k?va)\b/i],
        ]),
      },
    ];
  }

  if (slug === "software" || slug.includes("software")) {
    return [{
      key: "Type",
      values: ["Microsoft 365", "Windows", "Security", "Other"],
      classify: (product) => bucketByPatterns(productText(product), [
        ["Microsoft 365", /\b(?:microsoft|office) 365\b/i],
        ["Windows", /\bwindows\b/i],
        ["Security", /\bantivirus\b|\bsecurity\b|\bkaspersky\b|\bnorton\b/i],
      ]),
    }];
  }

  return [];
}

function commonCategory(products: Product[]) {
  const categories = new Set(products.map((product) => product.categoryId).filter(Boolean));
  return categories.size === 1 ? [...categories][0] ?? "" : "";
}
