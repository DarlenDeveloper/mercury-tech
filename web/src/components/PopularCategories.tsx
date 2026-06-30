import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";

const TINTS = [
  "bg-sky",
  "bg-peach",
  "bg-surface-soft",
  "bg-lilac",
  "bg-mint",
  "bg-peach",
];

// Small accent badges, mirroring the reference (-30% / New) on a few cards.
const BADGES: Record<number, { label: string; tone: string }> = {
  0: { label: "- 30%", tone: "bg-white text-ink" },
  1: { label: "New", tone: "bg-white text-ink" },
};

export default function PopularCategories() {
  return (
    <section className="mt-8">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold tracking-tight text-ink">
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

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {CATEGORIES.map((category, i) => {
          const badge = BADGES[i];
          return (
            <a
              key={category.name}
              href="#"
              className="group relative flex flex-col"
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
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 33vw, 16vw"
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
