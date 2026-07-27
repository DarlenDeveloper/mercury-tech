"use client";

import { useMemo, useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import CategoryShowcase from "@/components/CategoryShowcase";
import BrandStrip from "@/components/BrandStrip";
import HomeProductRows from "@/components/HomeProductRows";
import { isProductOutOfStock, type Product } from "@/lib/products";
import { useCurrency } from "@/components/CurrencyProvider";

const SPEC_GROUPS = [
  { title: "RAM", keys: ["RAM", "Memory", "Memory (RAM)"] },
  { title: "Processor", keys: ["Processor"] },
  { title: "Storage", keys: ["Storage"] },
];

export default function HomeCatalog({
  products,
  flashSaleProducts,
  flashSaleTitle,
}: {
  products: Product[];
  flashSaleProducts: Product[];
  flashSaleTitle: string;
}) {
  const { format } = useCurrency();
  const [openMobile, setOpenMobile] = useState(false);
  const [brands, setBrands] = useState<Set<string>>(new Set());
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [specFilters, setSpecFilters] = useState<Map<string, Set<string>>>(new Map());

  const priceStats = useMemo(() => {
    const prices = products.map((product) => product.price).filter((price) => price > 0);
    return {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
    };
  }, [products]);

  const brandOptions = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((product) => {
      const brand = product.brand?.trim();
      if (brand) counts.set(brand, (counts.get(brand) ?? 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [products]);

  const specOptions = useMemo(() => SPEC_GROUPS.map((group) => {
    const counts = new Map<string, number>();
    products.forEach((product) => {
      const row = product.specs?.find((spec) => group.keys.includes(spec.spec));
      const value = row?.details.trim();
      if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
    });
    return {
      ...group,
      values: [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 7),
    };
  }).filter((group) => group.values.length > 1), [products]);

  const filteredProducts = useMemo(() => products.filter((product) => {
    if (brands.size && !brands.has(product.brand?.trim() ?? "")) return false;
    if (inStockOnly && isProductOutOfStock(product)) return false;
    if (priceRange && (product.price < priceRange[0] || product.price > priceRange[1])) return false;
    for (const group of SPEC_GROUPS) {
      const selected = specFilters.get(group.title);
      if (!selected?.size) continue;
      const row = product.specs?.find((spec) => group.keys.includes(spec.spec));
      if (!row || !selected.has(row.details.trim())) return false;
    }
    return true;
  }), [brands, inStockOnly, priceRange, products, specFilters]);

  const filteredIds = new Set(filteredProducts.map((product) => product.id));
  const filteredFlashSale = flashSaleProducts.filter((product) => filteredIds.has(product.id));
  const activeCount = brands.size + (inStockOnly ? 1 : 0) + (priceRange ? 1 : 0) +
    [...specFilters.values()].reduce((total, values) => total + values.size, 0);

  const clearAll = () => {
    setBrands(new Set());
    setInStockOnly(false);
    setPriceRange(null);
    setSpecFilters(new Map());
  };

  const toggleSpec = (group: string, value: string) => {
    setSpecFilters((current) => {
      const next = new Map(current);
      const values = new Set(next.get(group) ?? []);
      values.has(value) ? values.delete(value) : values.add(value);
      next.set(group, values);
      return next;
    });
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpenMobile((open) => !open)}
        className="mb-5 flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink lg:hidden"
      >
        <SlidersHorizontal size={16} /> Filters
        {activeCount > 0 && <span className="rounded-full bg-mercury px-2 py-0.5 text-[10px] text-white">{activeCount}</span>}
        <ChevronDown size={14} className={`transition ${openMobile ? "rotate-180" : ""}`} />
      </button>

      <div className="flex items-start gap-8">
        <aside className={`${openMobile ? "block" : "hidden"} w-full shrink-0 lg:sticky lg:top-24 lg:block lg:w-64 lg:pr-4`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-ink">Filter products</h2>
              <p className="mt-0.5 text-xs text-muted">{filteredProducts.length} matching products</p>
            </div>
            {activeCount > 0 && <button onClick={clearAll} aria-label="Clear filters" className="text-mercury"><X size={17} /></button>}
          </div>

          <FilterSection title="Brand">
            <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
              {brandOptions.map(([brand, count]) => (
                <label key={brand} className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={brands.has(brand)}
                    onChange={() => setBrands((current) => {
                      const next = new Set(current);
                      next.has(brand) ? next.delete(brand) : next.add(brand);
                      return next;
                    })}
                    className="accent-mercury"
                  />
                  <span className="min-w-0 flex-1 truncate capitalize">{brand}</span>
                  <span className="text-xs text-muted">{count}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Price range">
            <div className="mb-2 flex justify-between text-[11px] font-medium text-ink">
              <span>{format(priceRange?.[0] ?? priceStats.min)}</span>
              <span>{format(priceRange?.[1] ?? priceStats.max)}</span>
            </div>
            <input aria-label="Minimum price" type="range" min={priceStats.min} max={priceStats.max} step={Math.max(1000, Math.round((priceStats.max - priceStats.min) / 100))} value={priceRange?.[0] ?? priceStats.min} onChange={(event) => setPriceRange([Math.min(Number(event.target.value), priceRange?.[1] ?? priceStats.max), priceRange?.[1] ?? priceStats.max])} className="w-full accent-mercury" />
            <input aria-label="Maximum price" type="range" min={priceStats.min} max={priceStats.max} step={Math.max(1000, Math.round((priceStats.max - priceStats.min) / 100))} value={priceRange?.[1] ?? priceStats.max} onChange={(event) => setPriceRange([priceRange?.[0] ?? priceStats.min, Math.max(Number(event.target.value), priceRange?.[0] ?? priceStats.min)])} className="w-full accent-mercury" />
          </FilterSection>

          <FilterSection title="Availability">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={inStockOnly} onChange={(event) => setInStockOnly(event.target.checked)} className="accent-mercury" />
              In stock only
            </label>
          </FilterSection>

          {specOptions.map((group) => (
            <FilterSection key={group.title} title={group.title}>
              <div className="space-y-2">
                {group.values.map(([value, count]) => (
                  <label key={value} className="flex cursor-pointer items-start gap-2 text-xs text-ink">
                    <input type="checkbox" checked={specFilters.get(group.title)?.has(value) ?? false} onChange={() => toggleSpec(group.title, value)} className="mt-0.5 accent-mercury" />
                    <span className="min-w-0 flex-1 leading-4">{value}</span>
                    <span className="text-muted">{count}</span>
                  </label>
                ))}
              </div>
            </FilterSection>
          ))}
        </aside>

        <div className={`${openMobile ? "hidden" : "block"} min-w-0 flex-1 lg:block`}>
          <CategoryShowcase />
          <div className="mt-10"><BrandStrip /></div>
          {activeCount > 0 && (
            <div className="mt-8 flex items-center justify-between rounded-xl bg-mercury/5 px-4 py-3 text-sm">
              <span className="font-medium text-ink">Showing {filteredProducts.length} filtered products</span>
              <button onClick={clearAll} className="font-semibold text-mercury">Clear filters</button>
            </div>
          )}
          <HomeProductRows products={filteredProducts} flashSaleProducts={filteredFlashSale} flashSaleTitle={flashSaleTitle} />
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 border-t border-line pt-4">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">{title}</h3>
      {children}
    </div>
  );
}
