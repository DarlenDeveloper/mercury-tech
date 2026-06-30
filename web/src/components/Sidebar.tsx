import { CATEGORIES } from "@/lib/categories";

export default function Sidebar() {
  return (
    <aside className="sticky top-[84px] hidden w-44 shrink-0 self-start lg:block">
      <h2 className="text-2xl font-extrabold tracking-tight text-ink">
        Categories
      </h2>
      <nav className="mt-5 flex flex-col gap-1">
        {CATEGORIES.map((category, i) => (
          <a
            key={category.name}
            href="#"
            className={`rounded-lg py-2 text-sm transition hover:text-mercury ${
              i === 0 ? "font-semibold text-ink" : "font-medium text-muted"
            }`}
          >
            {category.name}
          </a>
        ))}
      </nav>
    </aside>
  );
}
