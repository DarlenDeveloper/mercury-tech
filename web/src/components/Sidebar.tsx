"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";

export default function Sidebar() {
  // All categories open by default.
  const [open, setOpen] = useState<Set<string>>(
    new Set(CATEGORIES.map((c) => c.slug))
  );

  const toggle = (slug: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  return (
    <aside className="sticky top-[84px] hidden w-56 shrink-0 self-start lg:block">
      <h2 className="mb-4 text-xl font-semibold tracking-tight text-ink">
        Categories
      </h2>

      <nav className="flex flex-col gap-0.5">
        {CATEGORIES.map((category) => {
          return (
            <div key={category.slug}>
              {/* Top-level category (expand/collapse) */}
              <button
                type="button"
                aria-expanded={open.has(category.slug)}
                onClick={() => toggle(category.slug)}
                className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm font-semibold transition hover:bg-surface-soft ${
                  open.has(category.slug) ? "text-mercury" : "text-ink"
                }`}
              >
                {category.name}
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-muted transition-transform duration-200 ${
                    open.has(category.slug) ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Subcategories */}
              <div
                className={`grid transition-all duration-200 ease-out ${
                  open.has(category.slug)
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <ul className="ml-3 flex flex-col border-l border-line pl-3 pt-0.5">
                    {category.children.map((child) => (
                      <li key={child.slug}>
                        <a
                          href={`/category/${category.slug}/${child.slug}`}
                          className="block rounded-md py-1.5 text-[13px] font-medium text-muted transition hover:text-mercury"
                        >
                          {child.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
