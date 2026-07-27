import Image from "next/image";
import Link from "next/link";

type TechCard = {
  tag: string;
  headline: [string, string];
  href: string;
  image: string;
};

const TECH_CARDS: TechCard[] = [
  {
    tag: "SHOP LAPTOPS",
    headline: ["Serious Power.", "Certified Savings."],
    href: "/category/laptops",
    image: "/top-tech-laptops.png",
  },
  {
    tag: "SHOP DESKTOPS",
    headline: ["Built to Perform.", "Ready for Work."],
    href: "/category/desktops",
    image: "/cat-desktops.png",
  },
  {
    tag: "SHOP PRINTERS",
    headline: ["Work Ready.", "Always."],
    href: "/category/printers-office",
    image: "/top-tech-printers.png",
  },
  {
    tag: "SHOP NETWORKING",
    headline: ["Stay Connected.", "Stay Secure."],
    href: "/category/networking-security",
    image: "/top-tech-networking.png",
  },
  {
    tag: "SHOP UPS & POWER",
    headline: ["Reliable Power.", "Zero Interruptions."],
    href: "/category/ups-power",
    image: "/cat-ups.png",
  },
  {
    tag: "SHOP SOFTWARE",
    headline: ["Genuine Software.", "Work Smarter."],
    href: "/category/software",
    image: "/cat-software.png",
  },
];

export default function CategoryShowcase() {
  return (
    <section>
      <div className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          Trusted by many, loved by all.
        </p>
        <h2 className="mt-1.5 text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
          Explore our Top Tech.
        </h2>
      </div>

      <div className="no-scrollbar -mx-1 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2">
        {TECH_CARDS.map((card) => (
          <Link
            key={card.tag}
            href={card.href}
            className="relative h-[290px] w-[220px] shrink-0 snap-start overflow-hidden rounded-[20px] bg-[#F5F5F5] text-center sm:w-[235px]"
          >
            <div className="relative z-10 flex flex-col items-center px-4 pt-5">
              <span className="rounded-full bg-mercury px-4 py-1.5 text-[11px] font-semibold tracking-wide text-white">
                {card.tag}
              </span>
              <h3 className="mt-3 text-base font-medium leading-[1.25] text-ink">
                {card.headline[0]}
                <br />
                {card.headline[1]}
              </h3>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-[190px] bg-gradient-to-b from-transparent via-[#FF7A00]/20 to-[#FF7A00]/60" />
            <div className="absolute inset-x-2 bottom-0 h-[185px]">
              <Image
                src={card.image}
                alt={card.tag.replace("SHOP ", "")}
                fill
                sizes="235px"
                className="object-contain object-bottom"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
