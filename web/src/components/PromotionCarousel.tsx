"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

export default function PromotionCarousel({ starlinkWhatsAppNumber }: { starlinkWhatsAppNumber: string }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const slides = [
    {
      name: "ASUS ExpertBook flash sale",
      src: "/asus-expertbook-flash-sale.jpeg",
      alt: "ASUS ExpertBook B1 B1503CBA: USh 2,200,000 with backpack, 15.6-inch FHD display, 8GB DDR5 RAM, 256GB SSD, Windows 11 Home, Microsoft Office and 3-year warranty included.",
      number: "256704823800",
      message: "Hi Mercury, I'm interested in the ASUS ExpertBook B1 flash sale with backpack for USh 2,200,000. Is it available?",
    },
    {
      name: "Starlink waitlist",
      src: "/starlink-waitlist-wide.png",
      alt: "Starlink by Mercury Computers Limited. Join the waitlist — register your interest today.",
      number: starlinkWhatsAppNumber,
      message: "Hi Mercury, I'd like to join the Starlink waitlist. Please share more details.",
    },
  ];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 7000);
    return () => window.clearInterval(timer);
  }, [playing, slides.length]);

  function selectSlide(index: number) {
    setActive((index + slides.length) % slides.length);
  }

  return (
    <section
      aria-label="Featured offers"
      aria-roledescription="carousel"
      className="px-4 pt-8 lg:px-6 lg:pt-10"
    >
      <div className="relative aspect-[2145/733] overflow-hidden rounded-2xl bg-slate-100" aria-live={playing ? "off" : "polite"}>
        {slides.map((slide, index) => (
          <div key={slide.src} hidden={active !== index} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}: ${slide.name}`}>
            <a
              href={`https://wa.me/${slide.number}?text=${encodeURIComponent(slide.message)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${slide.name}: enquire on WhatsApp (opens in a new tab)`}
              className="absolute inset-0 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-mercury"
            >
              <Image src={slide.src} alt={slide.alt} fill sizes="(min-width: 1024px) calc(100vw - 48px), calc(100vw - 32px)" className="object-contain" />
            </a>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-2">
        <button type="button" onClick={() => selectSlide(active - 1)} aria-label="Previous offer" className="flex h-11 w-11 items-center justify-center rounded-full border border-line hover:bg-slate-100"><ChevronLeft size={20} /></button>
        {slides.map((slide, index) => (
          <button key={slide.src} type="button" onClick={() => selectSlide(index)} aria-label={`Show ${slide.name}`} aria-current={active === index ? "true" : undefined} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-slate-100">
            <span className={`h-2.5 rounded-full ${active === index ? "w-6 bg-mercury" : "w-2.5 bg-slate-300"}`} />
          </button>
        ))}
        <button type="button" onClick={() => selectSlide(active + 1)} aria-label="Next offer" className="flex h-11 w-11 items-center justify-center rounded-full border border-line hover:bg-slate-100"><ChevronRight size={20} /></button>
        <button type="button" onClick={() => setPlaying(!playing)} aria-label={playing ? "Pause slideshow" : "Play slideshow"} className="flex h-11 w-11 items-center justify-center rounded-full border border-line hover:bg-slate-100">{playing ? <Pause size={16} /> : <Play size={16} />}</button>
      </div>
    </section>
  );
}
