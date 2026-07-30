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
          .sort((a, b) => {
            if (slug === "printers-office") {
              const printerPriority = Number(isPrinterDevice(b)) - Number(isPrinterDevice(a));
              if (printerPriority !== 0) return printerPriority;
            }
            if (slug === "desktops") {
              const desktopPriority = Number(isDesktopDevice(b)) - Number(isDesktopDevice(a));
              if (desktopPriority !== 0) return desktopPriority;
            }
            return a.price - b.price;
          })
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

function isPrinterDevice(product: Product) {
  const text = [product.category, product.name, ...(product.subcategorySlugs ?? [])]
    .join(" ")
    .toLowerCase();
  const isSupply = /ink|toner|cartridge|ribbon|accessor|printhead|print head/.test(text);
  return !isSupply && /printer|laserjet|deskjet|officejet|smart tank/.test(text);
}

function isDesktopDevice(product: Product) {
  const text = [product.category, product.name, ...(product.subcategorySlugs ?? [])]
    .join(" ")
    .toLowerCase();
  if (/monitor|display|accessor/.test(text)) return false;
  return /desktop|optiplex|prodesk|elitedesk|thinkcentre|all-in-one/.test(text);
}
