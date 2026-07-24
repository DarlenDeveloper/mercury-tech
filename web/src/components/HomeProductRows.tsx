import { type Product } from "@/lib/products";
import { DEPARTMENTS } from "@/lib/departments";
import ProductRow from "@/components/ProductRow";

const ROW_SIZE = 12;

/**
 * Homepage product rows: an optional flash sale row (admin-curated in
 * /u/website) followed by one horizontally scrolling row per main department,
 * each with a "View all" link to its category page.
 */
export default function HomeProductRows({
  products,
  flashSaleProducts,
  flashSaleTitle,
}: {
  products: Product[];
  flashSaleProducts: Product[];
  flashSaleTitle: string;
}) {
  return (
    <>
      {flashSaleProducts.length > 0 && (
        <ProductRow title={flashSaleTitle || "Flash Sale"} products={flashSaleProducts} accent />
      )}

      {DEPARTMENTS.map((dept) => {
        const slug = dept.href.replace("/category/", "");
        const items = products
          .filter((p) => p.categoryId === slug)
          .sort((a, b) => b.price - a.price)
          .slice(0, ROW_SIZE);
        return (
          <ProductRow
            key={slug}
            title={dept.label}
            viewAllHref={dept.href}
            products={items}
          />
        );
      })}
    </>
  );
}
