import { type Product } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default function Recommendations({ products }: { products?: Product[] }) {
  const catalog = products ?? [];
  if (catalog.length === 0) return null;

  return (
    <section className="mt-8">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight text-mercury">
          Explore our recommendations
        </h2>
        <a
          href="#"
          className="text-sm font-medium text-mercury transition hover:text-mercury-dark"
        >
          See all
        </a>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(172px,1fr))] gap-3">
        {catalog.map((product, i) => (
          <ProductCard key={`${product.id}-${i}`} product={product} />
        ))}
      </div>
    </section>
  );
}
