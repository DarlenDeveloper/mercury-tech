"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

type Slide = {
  badge: string;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  bg: string; // tailwind gradient classes
  /** Dark background → white text + light CTA. */
  dark?: boolean;
  /** Render the app phone showcase (half phone) instead of a plain image. */
  showcase?: boolean;
  href?: string;
};

const GREEN_GRADIENT = "from-[#eaf4ee] via-[#e8f3df] to-[#cfe8a3]";

const SLIDES: Slide[] = [
  // App promo slide — uncomment when mobile app is released
  // {
  //   badge: "NOW AVAILABLE",
  //   title: "Shop smarter with the Mercury app",
  //   subtitle:
  //     "Browse products, track orders, and access exclusive deals — all from your pocket.",
  //   cta: "Download Now",
  //   image: "/hero-mercury-app.png",
  //   bg: GREEN_GRADIENT,
  //   showcase: true,
  //   href: "#",
  // },
  {
    badge: "TRUSTED SINCE 2007",
    title: "Premium tech. Honest prices.",
    subtitle:
      "Official laptops, desktops, printers and components — brand new, warranty-backed, delivered across Uganda.",
    cta: "Browse Catalog",
    image: "/hero-tech.png",
    bg: "from-[#FF7A00] via-[#FFB366] to-white",
    href: "#",
  },
  {
    badge: "CERTIFIED DEVICES",
    title: "Phones you can trust",
    subtitle:
      "Factory-sealed smartphones from top brands — delivered free within Kampala.",
    cta: "View Phones",
    image: "/hero-phones.png",
    bg: GREEN_GRADIENT,
    href: "#",
  },
];

const HERO_HEIGHT = "h-[300px] sm:h-[340px] lg:h-[380px]";

function AppShowcase({ image, alt }: { image: string; alt: string }) {
  return (
    <div className="relative hidden h-full w-full md:block">
      {/* Soft glow behind the phone */}
      <div className="absolute right-16 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-white/60 blur-3xl" />

      {/* Phone — enlarged and pushed down so only the upper half shows */}
      <Image
        src={image}
        alt={alt}
        fill
        priority
        sizes="50vw"
        className="z-10 translate-y-[32%] scale-[1.55] object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.25)]"
      />
    </div>
  );
}

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const totalSlides = SLIDES.length;

  // The track has an extra clone of the first slide at the end
  const extendedSlides = [...SLIDES, SLIDES[0]];

  const go = useCallback((i: number) => {
    setIsTransitioning(true);
    setIndex(i);
  }, []);

  // Auto-advance
  useEffect(() => {
    const id = setInterval(() => {
      setIsTransitioning(true);
      setIndex((i) => i + 1);
    }, 5500);
    return () => clearInterval(id);
  }, []);

  // When we land on the clone (index === totalSlides), snap back to 0
  const handleTransitionEnd = () => {
    if (index === totalSlides) {
      setIsTransitioning(false);
      setIndex(0);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* Sliding track */}
      <div
        className={`flex ${isTransitioning ? "transition-transform duration-700 ease-out" : ""}`}
        style={{ transform: `translateX(-${index * 100}%)` }}
        onTransitionEnd={handleTransitionEnd}
      >
        {extendedSlides.map((slide, i) => (
          <div
            key={i}
            className={`relative grid w-full shrink-0 grid-cols-1 items-center gap-4 overflow-hidden bg-gradient-to-r ${slide.bg} ${HERO_HEIGHT} px-6 py-6 sm:px-10 md:grid-cols-2`}
          >
            {/* Copy */}
            <div className="relative z-10 max-w-lg">
              <span
                className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  slide.dark
                    ? "bg-white/15 text-white ring-1 ring-white/25"
                    : "bg-gradient-to-r from-[#6d28d9] to-[#a855f7] text-white"
                }`}
              >
                {slide.badge}
              </span>
              <h2
                className={`mt-3 text-2xl font-extrabold leading-[1.08] tracking-tight sm:text-3xl lg:text-4xl ${
                  slide.dark ? "text-white" : "text-ink"
                }`}
              >
                {slide.title}
              </h2>
              <p
                className={`mt-2.5 max-w-md text-[13px] leading-relaxed ${
                  slide.dark ? "text-white/75" : "text-ink/70"
                }`}
              >
                {slide.subtitle}
              </p>
              <a
                href={slide.href}
                className={`mt-4 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition ${
                  slide.dark
                    ? "bg-white text-[#0b2a8f] hover:bg-white/90"
                    : "bg-[#103a34] text-white hover:bg-[#0c2b27]"
                }`}
              >
                {slide.cta}
                <ArrowRight size={16} />
              </a>
            </div>

            {/* Visual */}
            {slide.showcase ? (
              <AppShowcase image={slide.image} alt={slide.title} />
            ) : (
              <div className="relative hidden h-full w-full md:block">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  sizes="50vw"
                  className="object-contain"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="absolute inset-x-0 bottom-4 z-20 flex items-center justify-center gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => go(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index % totalSlides
                ? "w-8 bg-mercury-accent"
                : slide.dark
                  ? "w-5 bg-white/40 hover:bg-white/60"
                  : "w-5 bg-ink/25 hover:bg-ink/45"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
