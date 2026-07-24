"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { DEPARTMENTS } from "@/lib/departments";

/**
 * Primary category dropdown navigation (the client's focused 6 departments).
 */
export default function CategoryNav() {
  return (
    <nav className="flex items-center justify-center gap-1">
      {DEPARTMENTS.map((item) => (
        <div key={item.label} className="group relative">
          <Link
            href={item.href}
            className="flex items-center gap-1 rounded-full px-3 py-2.5 text-[13px] font-medium text-ink transition hover:bg-surface-soft hover:text-mercury"
          >
            {item.label}
            <ChevronDown size={14} className="text-muted transition group-hover:rotate-180" />
          </Link>

          {/* Dropdown (hover) */}
          <div className="invisible absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 pt-1 opacity-0 transition group-hover:visible group-hover:opacity-100">
            <div className="rounded-2xl border border-line bg-white p-2 shadow-lg">
              {item.children.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className="block rounded-lg px-3 py-2 text-[13px] text-ink transition hover:bg-surface-soft hover:text-mercury"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ))}
    </nav>
  );
}
