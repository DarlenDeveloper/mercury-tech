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

      <div className="grid grid-cols-2 gap-3 md:h-[300px] md:grid-cols-none md:grid-flow-col md:grid-rows-2 md:auto-cols-fr md:gap-3">
        {TILES.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className={`group relative overflow-hidden rounded-2xl bg-[#F1F2F4] p-4 shadow-[0_2px_10px_rgba(16,24,40,0.06)] ring-1 ring-black/[0.04] transition duration-300 hover:-translate-y-1 hover:bg-[#EDEFF2] hover:shadow-[0_18px_36px_-12px_rgba(16,24,40,0.22)] ${
              t.big
                ? "col-span-2 min-h-[150px] md:col-span-1 md:row-span-2 md:min-h-0"
                : "min-h-[110px] md:min-h-0"
            }`}
          >
            {/* Text */}
            <div className="relative z-10 max-w-[62%]">
              <h3 className={`font-bold tracking-tight text-ink ${t.big ? "text-lg" : "text-[15px]"}`}>
                {t.label}
              </h3>
              <p className="mt-0.5 text-[11.5px] text-muted">{t.sub}</p>
            </div>

            {/* Image bottom-right */}
            <Image
              src={t.image}
              alt={t.label}
              width={320}
              height={320}
              className={`absolute bottom-1 right-1 object-contain transition duration-300 group-hover:scale-[1.05] ${
                t.big ? "h-44 w-44 lg:h-60 lg:w-60" : "h-32 w-32 lg:h-40 lg:w-40"
              }`}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
