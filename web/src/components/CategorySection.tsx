import {
  LayoutGrid,
  Laptop,
  Printer,
  Monitor,
  HardDrive,
  Search,
  TrendingUp,
  Tag,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

const SUBCATEGORIES = [
  { label: "Laptops", icon: Laptop },
  { label: "Printers", icon: Printer },
  { label: "Monitors", icon: Monitor },
  { label: "Desktops", icon: HardDrive },
];

const FILTERS = [
  { label: "New Arrival", icon: Search },
  { label: "Best Seller", icon: TrendingUp },
  { label: "On Discount", icon: Tag },
];

export default function CategorySection() {
  return (
    <section className="w-full px-4 py-10 lg:px-6">
      <div className="flex flex-col gap-8 lg:flex-row">
        <Sidebar />
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {Array.from({ length: 18 }, (_, i) => PRODUCTS[i % PRODUCTS.length]).map(
              (product, i) => (
                <ProductCard key={`${product.id}-${i}`} product={product} />
              )
            )}
          </div>
          <Pagination />
        </div>
      </div>
    </section>
  );
}

function Sidebar() {
  return (
    <aside className="w-full shrink-0 lg:w-60">
      <h2 className="mb-4 text-lg font-bold text-ink">Category</h2>

      {/* All Product (active) */}
      <button className="flex w-full items-center gap-2.5 rounded-xl bg-surface-soft px-3 py-2.5 text-sm font-semibold text-ink">
        <LayoutGrid size={18} className="text-mercury" />
        All Product
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-md bg-mercury-accent px-1 text-[11px] font-bold text-white">
          {PRODUCTS.length}
        </span>
        <ChevronDown size={16} className="text-muted" />
      </button>

      {/* Sub-categories */}
      <div className="mt-1 ml-3 flex flex-col border-l border-line pl-3">
        {SUBCATEGORIES.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className="flex items-center gap-2.5 py-2 text-sm font-medium text-muted transition hover:text-ink"
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-2 flex flex-col">
        {FILTERS.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-muted transition hover:text-ink"
          >
            <Icon size={18} />
            {label}
            <ChevronDown size={16} className="ml-auto text-muted" />
          </button>
        ))}
      </div>
    </aside>
  );
}

function Pagination() {
  const pages = [1, 2, 3, "…", 8, 9, 10];
  return (
    <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
      <button className="flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink">
        <ArrowLeft size={16} />
        Previous
      </button>

      <div className="flex items-center gap-1">
        {pages.map((page, i) =>
          page === "…" ? (
            <span key={`gap-${i}`} className="px-2 text-sm text-muted">
              …
            </span>
          ) : (
            <button
              key={page}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition ${
                page === 1
                  ? "bg-ink text-white"
                  : "text-ink hover:bg-surface-soft"
              }`}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button className="flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink">
        Next
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
