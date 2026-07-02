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
  {
    badge: "NEW · MERCURY APP",
    title: "The new Mercury app is here",
    subtitle:
      "Shop tech, track your orders and unlock app-only deals — all in one place.",
    cta: "Get the App",
    image: "/hero-mercury-app.png",
    bg: GREEN_GRADIENT,
    showcase: true,
    href: "#",
  },
  {
    badge: "MORE TECH. LESS SPEND.",
    title: "The smarter way to own premium tech",
    subtitle:
      "Laptops, desktops, printers and components — official, brand new and backed by warranty.",
    cta: "Shop Tech",
    image: "/hero-tech.png",
    bg: "from-[#f2d34a] via-[#9fc95f] to-[#2f9f86]",
    href: "#",
  },
  {
    badge: "TOP DEVICES. SMART PRICES.",
    title: "Your next phone starts here",
    subtitle:
      "Premium smartphones at honest prices — official, brand new and delivered free within Kampala.",
    cta: "Shop Phones",
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

  const go = useCallback((i: number) => {
    setIndex(((i % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 5500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* Sliding track */}
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {SLIDES.map((slide, i) => (
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
              i === index
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
