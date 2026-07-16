"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

export default function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const shots = images.length > 0 ? images : ["/mercury-logo.png"];
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const goNext = useCallback(() => {
    setActive((i) => (i + 1) % shots.length);
  }, [shots.length]);

  const goPrev = useCallback(() => {
    setActive((i) => (i - 1 + shots.length) % shots.length);
  }, [shots.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main image with swipe + arrows */}
      <div
        className="relative aspect-square w-full overflow-hidden rounded-2xl border border-line bg-white"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={shots[active]}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 420px"
          className="object-contain p-4"
        />

        {/* Dots indicator (only show if multiple images) */}
        {shots.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {shots.map((_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === active ? "w-5 bg-mercury" : "w-2 bg-black/20"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {shots.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto">
          {shots.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              aria-label={`View image ${i + 1}`}
              onClick={() => setActive(i)}
              className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl border bg-white transition ${
                i === active
                  ? "border-mercury ring-2 ring-mercury/30"
                  : "border-line hover:border-mercury/50"
              }`}
            >
              <Image
                src={src}
                alt={`${alt} thumbnail ${i + 1}`}
                fill
                sizes="64px"
                className="object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
