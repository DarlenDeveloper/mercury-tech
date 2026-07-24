"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { DEPARTMENTS } from "@/lib/departments";

// Top categories outside the focused six (shown under "Other products").
const OTHER = [
  { name: "Phones, TV & Audio", href: "/category/phones-tv-audio" },
  { name: "Accessories", href: "/category/accessories" },
];

export default function Sidebar() {
  // Laptops and Desktops expanded by default; the rest collapse until clicked.
  const [open, setOpen] = useState<Set<string>>(new Set(["Laptops", "Desktops"]));

  const toggle = (label: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <aside className="sticky top-[84px] hidden max-h-[calc(100vh-100px)] w-56 shrink-0 self-start overflow-y-auto lg:block">
      <h2 className="mb-4 text-xl font-semibold tracking-tight text-ink">
        Categories
      </h2>

      <nav className="flex flex-col gap-0.5">
        {DEPARTMENTS.map((dept) => {
          const isOpen = open.has(dept.label);
          return (
            <div key={dept.label}>
              {/* Top-level department (expand/collapse) */}
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => toggle(dept.label)}
                className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm font-semibold transition hover:bg-surface-soft ${
                  isOpen ? "text-mercury" : "text-ink"
                }`}
              >
                {dept.label}
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
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <ul className="ml-3 flex flex-col border-l border-line pl-3 pt-0.5">
                    {/* Shop-all link for the whole department */}
                    <li>
                      <Link
                        href={dept.href}
                        className="block rounded-md py-1.5 text-[13px] font-semibold text-ink transition hover:text-mercury"
                      >
                        All {dept.label}
                      </Link>
                    </li>
                    {dept.children.map((child) => (
                      <li key={child.href + child.name}>
                        <Link
                          href={child.href}
                          className="block rounded-md py-1.5 text-[13px] font-medium text-muted transition hover:text-mercury"
                        >
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}

        {/* Other products */}
        <div className="mt-4 border-t border-line pt-3">
          <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Other products
          </p>
          {OTHER.map((o) => (
            <Link
              key={o.href}
              href={o.href}
              className="block rounded-lg px-2 py-2 text-sm font-medium text-ink transition hover:bg-surface-soft hover:text-mercury"
            >
              {o.name}
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}
