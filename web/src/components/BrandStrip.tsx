import Image from "next/image";
import Link from "next/link";
import { Award, Users, BadgeCheck, Headphones } from "lucide-react";

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

  if (inHero) {
    const highlights = [
      { value: "20+", label: "Years of Experience", icon: Award },
      { value: "5,000+", label: "Happy Clients", icon: Users },
      { value: "100+", label: "Leading Brands", icon: BadgeCheck },
      { value: "24/7", label: "Expert Support", icon: Headphones },
    ];
    return (
      <section className="border-t border-white/15 bg-mercury/95 px-4 py-3 backdrop-blur-sm sm:px-8">
        <div className="mx-auto grid max-w-[1500px] grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-4">
          {highlights.map(({ value, label, icon: Icon }) => (
            <div key={label} className="flex items-center justify-center gap-3 text-white">
              <Icon size={25} strokeWidth={1.7} className="shrink-0 text-white/80" />
              <div className="leading-tight">
                <p className="text-base font-extrabold sm:text-lg">{value}</p>
                <p className="mt-0.5 text-[9px] font-medium text-white/65 sm:text-[10px]">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

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
        <div className="flex w-max animate-brand-scroll items-center gap-14 sm:gap-24">
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
                className={`w-auto object-contain ${b.big ? "h-12 sm:h-[72px]" : "h-8 sm:h-11"}`}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
