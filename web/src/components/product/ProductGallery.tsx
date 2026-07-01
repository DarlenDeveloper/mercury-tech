"use client";

import { useState } from "react";
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

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-line bg-white">
        <Image
          src={shots[active]}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 420px"
          className="object-contain p-4"
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2.5">
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
    </div>
  );
}
