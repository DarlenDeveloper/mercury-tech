import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { DEPARTMENTS } from "@/lib/departments";

const ITEMS = [
  { label: "Laptops", href: "/category/laptops", image: "/cat-laptops.png" },
  { label: "Desktops", href: "/category/desktops", image: "/cat-desktops.png" },
  { label: "Printers", href: "/category/printers-office", image: "/cat-printers.png" },
  { label: "UPS & Power", href: "/category/ups-power", image: "/cat-ups.png" },
  { label: "Networking", href: "/category/networking-security", image: "/cat-networking.png" },
  { label: "Software", href: "/category/software", image: "/cat-software.png" },
  { label: "Accessories", href: "/category/other", image: "/cat-accessories.jpeg" },
];

export default function PopularCategoryBar() {
  return (
    <section className="border-b border-line bg-white px-4 py-9 sm:py-11 lg:px-8">
      <div className="mx-auto max-w-[1900px]">
        <div className="mb-7 text-center">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            Trusted by many, loved by all.
          </h2>
          <p className="mt-1.5 text-xl font-extrabold tracking-tight text-mercury-accent sm:text-2xl">
            Explore our Top Tech.
          </p>
        </div>

        <div className="relative">
          <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 xl:grid xl:grid-cols-7 xl:overflow-visible">
            {ITEMS.map((item) => {
              const department = DEPARTMENTS.find((entry) => entry.href === item.href);
              const children = department?.children ?? [];
              return (
                <div key={item.label} className="group relative w-[210px] shrink-0 snap-start sm:w-[240px] xl:w-auto">
                  <Link href={item.href} className="block">
                    <span className="relative block aspect-square overflow-hidden rounded-[18px] bg-[#f2f2f2]">
                      <Image
                        src={item.image}
                        alt={item.label}
                        fill
                        sizes="(min-width: 1280px) 14vw, 240px"
                        className="object-contain p-5 sm:p-7"
                      />
                    </span>
                    <span className="mt-3 flex items-center gap-1 text-left text-[13px] font-semibold text-ink sm:text-sm">
                      {item.label}
                      {children.length > 0 && <ChevronDown size={13} className="transition group-hover:rotate-180" />}
                    </span>
                  </Link>

                  {children.length > 0 && (
                    <div className="invisible absolute left-0 top-full z-50 hidden w-52 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 sm:block">
                      <div className="rounded-xl bg-white p-2 shadow-xl">
                        {children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block rounded-lg px-3 py-2 text-[12px] text-ink transition hover:bg-surface-soft hover:text-mercury"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
