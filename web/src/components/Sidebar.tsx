"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";

export default function Sidebar() {
  // First category open by default.
  const [open, setOpen] = useState<string | null>(CATEGORIES[0]?.slug ?? null);

  return (
    <aside className="sticky top-[84px] hidden w-56 shrink-0 self-start lg:block">
      <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-ink">
        Categories
      </h2>

      <nav className="flex flex-col gap-0.5">
        {CATEGORIES.map((category) => {
          const isOpen = open === category.slug;
          return (
            <div key={category.slug}>
              {/* Top-level category (expand/collapse) */}
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() =>
                  setOpen((prev) =>
                    prev === category.slug ? null : category.slug
                  )
                }
                className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm font-semibold transition hover:bg-surface-soft ${
                  isOpen ? "text-mercury" : "text-ink"
                }`}
              >
                {category.name}
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-muted transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Subcategories */}
              <div
                className={`grid transition-all duration-200 ease-out ${
                  isOpen
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
