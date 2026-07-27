import Image from "next/image";
import Link from "next/link";

type Brand = { name: string; slug: string; big?: boolean; whiteOnDark?: boolean };

// Transparent logos live at /public/brands/<slug>.png
// `big` = icon-style marks that read small, scaled up ~2x for optical balance.
const BRANDS: Brand[] = [
  { name: "HP", slug: "hp", big: true, whiteOnDark: true },
  { name: "Lenovo", slug: "lenovo" },
  { name: "Dell", slug: "dell", big: true, whiteOnDark: true },
  { name: "Apple", slug: "apple", big: true, whiteOnDark: true },
  { name: "Epson", slug: "epson", whiteOnDark: true },
  { name: "Canon", slug: "canon" },
  { name: "Samsung", slug: "samsung", whiteOnDark: true },
  { name: "Microsoft", slug: "microsoft", big: true },
  { name: "Logitech", slug: "logitech", whiteOnDark: true },
  { name: "Hikvision", slug: "hikvision" },
  { name: "APC", slug: "apc" },
  { name: "Acer", slug: "acer", whiteOnDark: true },
];

export default function BrandStrip({ variant = "default" }: { variant?: "default" | "hero" }) {
  const inHero = variant === "hero";

  return (
    <section className={inHero ? "border-t border-white/15 bg-mercury/80 px-5 py-3 backdrop-blur-sm sm:px-10 lg:px-14" : ""}>
      {!inHero && (
        <h2 className="mb-5 text-xl font-bold tracking-tight text-ink">Shop by brand</h2>
      )}

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
        <div className={`flex w-max animate-brand-scroll items-center ${inHero ? "gap-12 sm:gap-20" : "gap-14 sm:gap-24"}`}>
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
                className={`w-auto object-contain ${inHero && b.whiteOnDark ? "brightness-0 invert" : ""} ${inHero ? b.big ? "h-7 sm:h-9" : "h-5 sm:h-7" : b.big ? "h-12 sm:h-[72px]" : "h-8 sm:h-11"}`}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
