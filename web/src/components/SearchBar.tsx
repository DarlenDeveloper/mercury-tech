"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X, TrendingUp } from "lucide-react";
import { fetchProducts, type FirestoreProduct } from "@/lib/firestore";
import { searchProducts } from "@/lib/search";
import { type Product } from "@/lib/products";
import { useCurrency } from "@/components/CurrencyProvider";

const POPULAR = ["Laptops", "Printers", "iPhone", "Monitors", "UPS", "Toner"];
const MAX_SUGGESTIONS = 6;

// Module-level cache so we only hit Firestore once per session.
let productCache: Product[] | null = null;

export default function SearchBar({
  variant = "desktop",
  onNavigate,
}: {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const { format } = useCurrency();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(productCache ?? []);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load products once (cached across mounts)
  useEffect(() => {
    if (productCache) {
      setProducts(productCache);
      return;
    }
    fetchProducts()
      .then((fsProducts: FirestoreProduct[]) => {
        const mapped: Product[] = fsProducts.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.shortDescription || p.description || "",
          category: p.category,
          categoryId: p.categoryId,
          price: p.priceUsd * 3780,
          rating: 4.5,
          reviews: "0 Reviews",
          image: p.image ?? "/placeholder-product.svg",
          brand: p.brand,
          stock: p.stock,
        }));
        productCache = mapped;
        setProducts(mapped);
      })
      .catch(() => {});
  }, []);

  // Compute live suggestions
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return searchProducts(products, query).slice(0, MAX_SUGGESTIONS);
  }, [query, products]);

  // Dismiss on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const goToSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setOpen(false);
    setActiveIndex(-1);
    onNavigate?.();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const goToProduct = (id: string) => {
    setOpen(false);
    setActiveIndex(-1);
    onNavigate?.();
    router.push(`/product/${id}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      goToProduct(suggestions[activeIndex].id);
    } else {
      goToSearch(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const isMobile = variant === "mobile";

  return (
    <div className="relative w-full" ref={containerRef}>
      <form className="relative" role="search" onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={isMobile ? "Search products, brands..." : "Search for products, brands and more"}
          autoFocus={isMobile}
          className={
            isMobile
              ? "h-10 w-full rounded-full border border-line bg-surface-soft pl-4 pr-12 text-sm text-ink outline-none placeholder:text-muted focus:border-mercury"
              : "h-11 w-full rounded-full border border-line bg-white pl-5 pr-14 text-sm text-ink outline-none transition placeholder:text-muted focus:border-mercury"
          }
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); setOpen(false); }}
            aria-label="Clear"
            className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center text-muted transition hover:text-ink ${isMobile ? "right-11" : "right-14"}`}
          >
            <X size={15} />
          </button>
        )}
        <button
          type="submit"
          aria-label="Search"
          className={
            isMobile
              ? "absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-mercury text-white"
              : "absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-mercury text-white transition hover:bg-mercury-dark"
          }
        >
          <Search size={isMobile ? 14 : 16} />
        </button>
      </form>

      {/* Suggestions dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-line bg-white shadow-xl">
          {query.trim() === "" ? (
            /* Popular searches when empty */
            <div className="p-3">
              <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2 px-2 pb-1">
                {POPULAR.map((term) => (
                  <button
                    key={term}
                    onClick={() => goToSearch(term)}
                    className="flex items-center gap-1.5 rounded-full bg-surface-soft px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-mercury hover:text-white"
                  >
                    <TrendingUp size={12} />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted">
              No matches for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <>
              <ul className="max-h-[400px] overflow-y-auto py-1.5">
                {suggestions.map((product, i) => (
                  <li key={product.id}>
                    <button
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => goToProduct(product.id)}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left transition ${
                        activeIndex === i ? "bg-surface-soft" : "hover:bg-surface-soft"
                      }`}
                    >
                      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-line bg-[#F0F1F4]">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-ink">
                          {product.name}
                        </span>
                        <span className="block truncate text-[11px] text-muted">
                          {product.category}
                          {product.brand ? ` · ${product.brand}` : ""}
                        </span>
                      </span>
                      <span className="shrink-0 text-[12px] font-semibold text-ink">
                        {format(product.price)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {/* See all results */}
              <button
                onClick={() => goToSearch(query)}
                className="flex w-full items-center justify-center gap-1.5 border-t border-line px-4 py-2.5 text-[13px] font-semibold text-mercury transition hover:bg-surface-soft"
              >
                <Search size={14} />
                See all results for &ldquo;{query}&rdquo;
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
