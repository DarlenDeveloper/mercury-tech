import Image from "next/image";
import Link from "next/link";

type Tile = {
  label: string;
  sub: string;
  href: string;
  image: string;
  big?: boolean;
};

// The client's focused 6 departments, arranged as a bento grid (2 large + 4 small).
const TILES: Tile[] = [
  { label: "Laptops", sub: "Lenovo, HP, Dell & more", href: "/category/laptops", image: "/cat-laptops.png", big: true },
  { label: "UPS & Power", sub: "Backup & protection", href: "/category/ups-power", image: "/cat-ups.png" },
  { label: "Printers & Office", sub: "Print, scan & supplies", href: "/category/printers-office", image: "/cat-printers.png" },
  { label: "Desktops", sub: "Towers & all-in-ones", href: "/category/desktops", image: "/cat-desktops.png", big: true },
  { label: "Networking & Security", sub: "Routers & cameras", href: "/category/networking-security", image: "/cat-networking.png" },
  { label: "Software", sub: "Genuine licenses", href: "/category/software", image: "/cat-software.png" },
];

export default function CategoryShowcase() {
  return (
    <section>
      <h2 className="mb-5 text-xl font-bold tracking-tight text-ink">Shop by category</h2>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:h-[160px] md:grid-cols-none md:grid-flow-col md:grid-rows-2 md:auto-cols-fr">
        {TILES.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className={`group relative overflow-hidden rounded-2xl bg-[#F1F2F4] p-4 shadow-[0_2px_10px_rgba(16,24,40,0.06)] ring-1 ring-black/[0.04] transition duration-300 hover:-translate-y-1 hover:bg-[#EDEFF2] hover:shadow-[0_18px_36px_-12px_rgba(16,24,40,0.22)] ${
              t.big
                ? "col-span-2 min-h-[168px] md:col-span-1 md:row-span-2 md:min-h-0"
                : "min-h-[132px] md:min-h-0"
            }`}
          >
            {/* Image — anchored bottom-right, ~2x larger */}
            <div
              className={`pointer-events-none absolute bottom-0 right-0 z-0 ${
                t.big ? "h-[92%] w-[82%]" : "h-[94%] w-[88%]"
              }`}
            >
              <Image
                src={t.image}
                alt={t.label}
                fill
                sizes="(max-width: 768px) 60vw, 320px"
                className="object-contain object-right-bottom transition duration-300 group-hover:scale-[1.05]"
              />
            </div>

            {/* Left-fading scrim so the text stays legible over the image */}
            <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[#F1F2F4] via-[#F1F2F4]/80 to-transparent" />

            {/* Text */}
            <div className="relative z-10 max-w-[55%] sm:max-w-[52%]">
              <h3 className={`font-bold leading-tight tracking-tight text-mercury ${t.big ? "text-base sm:text-lg" : "text-sm sm:text-[15px]"}`}>
                {t.label}
              </h3>
              <p className="mt-0.5 text-[11px] leading-snug text-muted sm:text-[11.5px]">{t.sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
