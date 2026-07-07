import { PRODUCTS } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default function Recommendations() {
  // Repeat the catalog so the grid has enough items to scroll through.
  const items = Array.from(
    { length: 36 },
    (_, i) => PRODUCTS[i % PRODUCTS.length]
  );

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

      {/* Grid (flows downward); cards match the mobile app's ~160px width. */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(172px,1fr))] gap-3">
        {items.map((product, i) => (
          <ProductCard key={`${product.id}-${i}`} product={product} />
        ))}
      </div>
    </section>
  );
}
