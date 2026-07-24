import Image from "next/image";
import Link from "next/link";

type Brand = { name: string; slug: string };

// Transparent logos live at /public/brands/<slug>.png
const BRANDS: Brand[] = [
  { name: "HP", slug: "hp" },
  { name: "Lenovo", slug: "lenovo" },
  { name: "Dell", slug: "dell" },
  { name: "Apple", slug: "apple" },
  { name: "Epson", slug: "epson" },
  { name: "Canon", slug: "canon" },
  { name: "Samsung", slug: "samsung" },
  { name: "Microsoft", slug: "microsoft" },
  { name: "Logitech", slug: "logitech" },
  { name: "Hikvision", slug: "hikvision" },
  { name: "APC", slug: "apc" },
  { name: "Acer", slug: "acer" },
];

export default function BrandStrip() {
  return (
    <section>
      <h2 className="mb-5 text-xl font-bold tracking-tight text-ink">Shop by brand</h2>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {BRANDS.map((b) => (
          <Link
            key={b.slug}
            href={`/search?q=${encodeURIComponent(b.name)}`}
            aria-label={b.name}
            className="flex h-20 items-center justify-center rounded-2xl border border-line bg-white shadow-[0_2px_10px_rgba(16,24,40,0.05)]"
          >
            <Image
              src={`/brands/${b.slug}.png`}
              alt={b.name}
              width={140}
              height={56}
              className="h-9 w-auto object-contain"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
