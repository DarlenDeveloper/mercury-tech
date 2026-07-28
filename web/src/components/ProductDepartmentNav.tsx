import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DEPARTMENTS } from "@/lib/departments";

export default function ProductDepartmentNav() {
  return (
    <nav aria-label="Product departments" className="border-b border-line bg-white px-4 pb-12 pt-10 lg:px-6 lg:pb-14 lg:pt-12">
      <div className="mb-5 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          Find what you need
        </p>
        <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-mercury-accent">
          Shop by Department
        </h2>
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-3 lg:grid lg:grid-cols-6 lg:overflow-visible">
        {DEPARTMENTS.map((department) => (
          <div key={department.href} className="group relative min-w-[225px] lg:min-w-0">
            <Link
              href={department.href}
              className="flex min-h-[72px] items-center justify-between rounded-2xl border border-mercury/30 bg-white px-5 text-[15px] font-semibold text-ink transition hover:border-mercury hover:bg-mercury hover:text-white hover:shadow-[0_12px_30px_-16px_rgba(36,69,159,0.75)]"
            >
              <span>{department.label}</span>
              <ChevronRight size={23} strokeWidth={2.2} className="shrink-0 transition group-hover:translate-x-1" />
            </Link>

            {department.children.length > 0 && (
              <div className="invisible absolute left-0 right-0 top-full z-50 hidden pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 lg:block">
                <div className="rounded-2xl border border-line bg-white p-2 shadow-xl">
                  {department.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block rounded-xl px-3 py-2.5 text-[12px] text-ink transition hover:bg-mercury/5 hover:text-mercury"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
