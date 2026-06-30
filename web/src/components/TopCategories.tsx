import Image from "next/image";
import { CATEGORIES } from "@/lib/categories";

export default function TopCategories() {
  return (
    <section className="w-full px-4 py-10 lg:px-6">
      <h2 className="text-xl font-bold text-ink md:text-2xl">
        Our Top Categories
      </h2>

      <div className="mt-4 border-t border-line pt-6">
        <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((category) => (
            <a
              key={category.name}
              href="#"
              className="group flex w-[120px] shrink-0 flex-col items-center gap-3"
            >
              <div className="relative h-[110px] w-full overflow-hidden rounded-2xl bg-surface-soft transition group-hover:bg-mercury/5">
                <Image
                  src={category.image}
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
                  {category.count} {category.count === 1 ? "item" : "items"}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
