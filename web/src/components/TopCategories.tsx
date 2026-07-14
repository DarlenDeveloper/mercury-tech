import Image from "next/image";
import { getCategoriesFromFirestore, CATEGORIES } from "@/lib/categories";

// Local image fallback map (keyed by slug)
const LOCAL_IMAGES: Record<string, string> = {
  computers: "/cat-computers.jpeg",
  "printers-office": "/cat-office.jpeg",
  "components-power": "/cat-components.jpeg",
  "networking-security": "/cat-networking.jpeg",
  "phones-tv-audio": "/cat-phones.jpeg",
  accessories: "/cat-accessories.jpeg",
};

export default async function TopCategories() {
  const categories = await getCategoriesFromFirestore().catch(() => CATEGORIES);

  return (
    <section className="w-full px-4 py-10 lg:px-6">
      <h2 className="text-xl font-bold text-ink md:text-2xl">
        Our Top Categories
      </h2>

      <div className="mt-4 border-t border-line pt-6">
        <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => {
            const image = category.image || LOCAL_IMAGES[category.slug] || "/placeholder-product.svg";
            return (
              <a
                key={category.name}
                href={`/category/${category.slug}`}
                className="group flex w-[120px] shrink-0 flex-col items-center gap-3"
              >
                <div className="relative h-[110px] w-full overflow-hidden rounded-2xl bg-surface-soft transition group-hover:bg-mercury/5">
                  <Image
                    src={image}
                    alt={category.name}
                    fill
                    sizes="120px"
                    className="object-cover transition group-hover:scale-105"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-ink">
                    {category.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {category.children.length}{" "}
                    {category.children.length === 1 ? "category" : "categories"}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
