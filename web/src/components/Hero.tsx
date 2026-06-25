"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search, ShoppingBag, User } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", active: false },
  { label: "Tech", active: true },
  { label: "Deals", active: false },
  { label: "Brands", active: false },
  { label: "Repairs", active: false },
  { label: "Blog", active: false },
];

const SLIDES = ["/hero-1.jpg", "/hero-2.jpg", "/hero-3.jpg"];

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="px-4 pt-4 lg:px-6">
      {/* Hero image block */}
      <div className="relative h-[460px] overflow-hidden rounded-3xl">
        {/* Background carousel (sliding track) */}
        <div
          className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {SLIDES.map((src, i) => (
            <div key={src} className="relative h-full w-full shrink-0">
              <Image
                src={src}
                alt="Mercury tech showcase"
                fill
                priority={i === 0}
                quality={90}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-black/20" />

        {/* Floating navbar (pill) */}
        <nav className="absolute inset-x-4 top-4 flex items-center justify-between rounded-full bg-white/95 px-6 py-3 shadow-sm backdrop-blur">
          <a href="/" className="flex items-center gap-2">
            <Image
              src="/mercury-logo.png"
              alt="Mercury Computers"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
              priority
            />
            <span className="text-lg font-extrabold tracking-tight text-ink">
              Mercury
            </span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href="#"
                className={
                  link.active
                    ? "text-sm font-semibold text-ink"
                    : "text-sm font-medium text-muted transition hover:text-ink"
                }
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              aria-label="Search"
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-surface-soft"
            >
              <Search size={18} />
            </button>
            <button
              aria-label="Cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-surface-soft"
            >
              <ShoppingBag size={18} />
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-mercury-accent px-1 text-[10px] font-bold leading-none text-white">
                2
              </span>
            </button>
            <button
              aria-label="Account"
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-mercury text-white"
            >
              <User size={18} />
            </button>
          </div>
        </nav>

        {/* Giant watermark — large and bottom-anchored so its lower edge
            tucks behind the search card, matching the reference. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center overflow-hidden">
          <span className="translate-y-[14%] select-none text-[clamp(120px,27vw,360px)] font-extrabold leading-[0.8] tracking-tight text-white/85">
            Tech
          </span>
        </div>

        {/* Carousel dots */}
        <div className="absolute bottom-6 left-8 z-10 flex items-center gap-2">
          {SLIDES.map((src, i) => (
            <button
              key={src}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-2 bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Overlapping search card */}
      <div className="relative z-10 mx-4 -mt-12 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)] md:mx-8 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-bold text-ink md:text-2xl">
          Give All You Need
        </h2>
        <form className="relative w-full md:max-w-md" role="search">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search on Mercury"
            className="h-12 w-full rounded-full border border-line bg-surface-soft pl-11 pr-28 text-sm text-ink outline-none transition placeholder:text-muted focus:border-mercury"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
          >
            Search
          </button>
        </form>
      </div>
    </section>
  );
}
