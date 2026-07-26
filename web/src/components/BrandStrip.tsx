import Image from "next/image";
import Link from "next/link";

type Brand = { name: string; slug: string; big?: boolean };

// Transparent logos live at /public/brands/<slug>.png
// `big` = icon-style marks that read small, scaled up ~2x for optical balance.
const BRANDS: Brand[] = [
  { name: "HP", slug: "hp", big: true },
  { name: "Lenovo", slug: "lenovo" },
  { name: "Dell", slug: "dell", big: true },
  { name: "Apple", slug: "apple", big: true },
  { name: "Epson", slug: "epson" },
  { name: "Canon", slug: "canon" },
  { name: "Samsung", slug: "samsung" },
  { name: "Microsoft", slug: "microsoft", big: true },
  { name: "Logitech", slug: "logitech" },
  { name: "Hikvision", slug: "hikvision" },
  { name: "APC", slug: "apc" },
  { name: "Acer", slug: "acer" },
];

export default function BrandStrip() {
  return (
    <section>
      <h2 className="mb-5 text-xl font-bold tracking-tight text-ink">Shop by brand</h2>

      {/* Continuous marquee — logos only, no containers. Edges fade out. */}
      <div
        className="group relative overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        }}
      >
        <div className="flex w-max animate-brand-scroll items-center gap-14 sm:gap-20">
          {[...BRANDS, ...BRANDS].map((b, i) => (
            <Link
              key={`${b.slug}-${i}`}
              href={`/search?q=${encodeURIComponent(b.name)}`}
              aria-label={b.name}
              className="flex shrink-0 items-center justify-center"
            >
              <Image
                src={`/brands/${b.slug}.png`}
                alt={b.name}
                width={160}
                height={64}
                className={`w-auto object-contain ${b.big ? "h-12 sm:h-16" : "h-7 sm:h-9"}`}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
