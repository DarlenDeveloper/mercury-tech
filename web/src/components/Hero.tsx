"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Slide = {
  badge: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  /** Background image (full-bleed). Falls back to `gradient` when absent. */
  image?: string;
  /** Tailwind gradient classes used when there is no background image. */
  gradient?: string;
};

const SLIDES: Slide[] = [
  {
    badge: "Computers & Laptops",
    title: "Brand new laptops at the best prices in Kampala",
    subtitle:
      "Shop genuine Lenovo, HP, Dell and Apple laptops at Mercury Computers. Warranty backed with free delivery.",
    cta: "Shop Laptops",
    href: "/category/laptops",
    image: "/hero-laptops.png",
  },
  {
    badge: "Printers, Office & Desktops",
    title: "Reliable gear for a hardworking office",
    subtitle:
      "Desktops, printers and office essentials from Mercury Computers. Genuine, business ready and trusted by offices across Uganda.",
    cta: "Shop Office",
    href: "/category/printers-office",
    image: "/hero-office.png",
  },
];

const HERO_HEIGHT = "h-[340px] sm:h-[420px] lg:h-[500px]";

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const totalSlides = SLIDES.length;

  // Clone the first slide at the end for a seamless forward loop.
  const extendedSlides = [...SLIDES, SLIDES[0]];

  const go = useCallback((i: number) => {
    setIsTransitioning(true);
    setIndex(i);
  }, []);

  const next = useCallback(() => {
    setIsTransitioning(true);
    setIndex((i) => i + 1);
  }, []);

  // Auto-advance (resets when the slide changes).
  useEffect(() => {
    if (index === totalSlides) return;
    const id = setTimeout(next, 6000);
    return () => clearTimeout(id);
  }, [index, totalSlides, next]);

  // Snap back from the clone to the real first slide (timer, not transitionend).
  useEffect(() => {
    if (index !== totalSlides) return;
    const t = setTimeout(() => {
      setIsTransitioning(false);
      setIndex(0);
    }, 720);
    return () => clearTimeout(t);
  }, [index, totalSlides]);

  // Re-arm the animation on the frame after an instant snap-back.
  useEffect(() => {
    if (isTransitioning) return;
    const r = requestAnimationFrame(() => setIsTransitioning(true));
    return () => cancelAnimationFrame(r);
  }, [isTransitioning]);

  return (
    <div className="group relative overflow-hidden">
      {/* Sliding track */}
      <div
        className={`flex ${isTransitioning ? "transition-transform duration-700 ease-out" : ""}`}
        style={{ transform: `translateX(-${Math.min(index, totalSlides) * 100}%)` }}
      >
        {extendedSlides.map((slide, i) => (
          <div
            key={i}
            className={`relative w-full shrink-0 overflow-hidden ${HERO_HEIGHT}`}
          >
            {/* Background: image or gradient */}
            {slide.image ? (
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`} />
            )}

            {/* Readability overlay (darkens the bottom where the copy sits) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            {/* Left emphasis so text pops over busy imagery */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/45 to-transparent" />

            {/* Copy — anchored to the bottom */}
            <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-14 pt-6 sm:px-10 sm:pb-16 lg:px-14">
              <div className="max-w-3xl">
                <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white ring-1 ring-white/25 backdrop-blur-sm">
                  {slide.badge}
                </span>
                <h2 className="mt-4 text-2xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-sm sm:text-3xl lg:text-4xl">
                  {slide.title}
                </h2>
                <p className="mt-2.5 max-w-md text-[12.5px] leading-relaxed text-white/85 sm:mt-3 sm:text-sm">
                  {slide.subtitle}
                </p>
                <Link
                  href={slide.href}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold text-ink shadow-lg transition hover:bg-white/90 active:scale-[0.98] sm:mt-6 sm:px-6 sm:py-3 sm:text-sm"
                >
                  {slide.cta}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="absolute inset-x-0 bottom-5 z-20 flex items-center justify-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => go(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index % totalSlides ? "w-8 bg-white" : "w-4 bg-white/45 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
