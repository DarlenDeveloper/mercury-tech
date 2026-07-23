import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getCategoriesFromFirestore, CATEGORIES } from "@/lib/categories";

const TINTS = [
  "bg-sky",
  "bg-peach",
  "bg-surface-soft",
  "bg-lilac",
  "bg-mint",
  "bg-peach",
];

// Local image fallback map (keyed by slug)
const LOCAL_IMAGES: Record<string, string> = {
  computers: "/cat-computers.jpeg",
  "printers-office": "/cat-office.jpeg",
  "components-power": "/cat-components.jpeg",
  "networking-security": "/cat-networking.jpeg",
  "phones-tv-audio": "/cat-phones.jpeg",
  accessories: "/cat-accessories.jpeg",
};

// Small accent badges, mirroring the reference (-30% / New) on a few cards.
const BADGES: Record<number, { label: string; tone: string }> = {
  0: { label: "- 30%", tone: "bg-white text-ink" },
  1: { label: "New", tone: "bg-white text-ink" },
};

export default async function PopularCategories() {
  const fetched = await getCategoriesFromFirestore().catch(() => CATEGORIES);
  // Fall back to the built-in list if Firestore returns nothing, so the
  // section never renders empty.
  const categories = fetched.length > 0 ? fetched : CATEGORIES;

  return (
    <section className="mt-8">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight text-mercury">
          Explore popular categories
        </h2>
        <a
          href="#"
          className="flex items-center gap-1.5 rounded-full bg-surface-soft px-4 py-2 text-sm font-medium text-ink transition hover:bg-line"
        >
          See all
          <ArrowRight size={15} />
        </a>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((category, i) => {
          const badge = BADGES[i];
          const image = category.image || LOCAL_IMAGES[category.slug] || "/placeholder-product.svg";
          return (
            <a
              key={category.name}
              href={`/category/${category.slug}`}
              className="group relative flex w-[130px] shrink-0 flex-col sm:w-[150px]"
            >
              <div
                className={`relative flex h-32 items-center justify-center overflow-hidden rounded-2xl lg:h-40 ${TINTS[i % TINTS.length]}`}
              >
                {badge && (
                  <span
                    className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${badge.tone}`}
                  >
                    {badge.label}
                  </span>
                )}
                <Image
                  src={image}
                  alt={category.name}
                  fill
                  sizes="150px"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <p className="mt-3 text-center text-sm font-semibold text-ink">
                {category.name}
              </p>
            </a>
          );
        })}
      </div>
    </section>
  );
}
