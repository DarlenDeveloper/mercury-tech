import BrandStrip from "@/components/BrandStrip";

const HERO_HEIGHT = "h-[340px] sm:h-[420px] lg:h-[500px]";

export default function Hero() {
  return (
    <div className={`relative overflow-hidden ${HERO_HEIGHT}`}>
      <video
        className="absolute inset-0 h-full w-full bg-black object-cover object-center"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/newcarouselimg.png"
        aria-label="Mercury Computers product showcase"
      >
        <source src="/carousel-optimized.m4v" type="video/mp4" />
      </video>

      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/55 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/45 to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-24 pt-6 sm:px-10 sm:pb-28 lg:px-14">
        <div className="max-w-3xl">
          <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white ring-1 ring-white/25 backdrop-blur-sm">
            Products &amp; Business Solutions
          </span>
          <h2 className="mt-4 text-2xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-sm sm:text-3xl lg:text-4xl">
            Everything you need to work, connect and grow
          </h2>
          <p className="mt-2.5 max-w-md text-[12.5px] leading-relaxed text-white/85 sm:mt-3 sm:text-sm">
            Shop genuine computers, printers and business technology, with expert IT, networking, security and AI solutions delivered by Mercury.
          </p>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20">
        <BrandStrip variant="hero" />
      </div>
    </div>
  );
}
