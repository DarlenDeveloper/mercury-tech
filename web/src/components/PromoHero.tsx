import Image from "next/image";

export default function PromoHero() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
      {/* Big banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky via-lilac to-peach p-8">
        <div className="relative z-10 max-w-[55%]">
          <h2 className="text-4xl font-extrabold leading-none tracking-tight text-ink md:text-5xl">
            BIG SALE!
          </h2>
          <p className="mt-3 text-sm font-medium text-muted">
            Brand new laptops &amp; PCs
            <br />
            with free delivery.
          </p>
          <a
            href="#"
            className="mt-6 inline-flex items-center rounded-full bg-mercury-accent px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
          >
            Shop Laptops
          </a>
        </div>

        <div className="pointer-events-none absolute -right-4 top-1/2 h-[115%] w-[55%] -translate-y-1/2">
          <Image
            src="/promo-laptop.png"
            alt="Laptop on sale"
            fill
            sizes="(max-width: 1024px) 50vw, 480px"
            className="object-contain drop-shadow-xl"
            priority
          />
        </div>
      </div>

      {/* Side promo cards */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-1 items-center rounded-3xl bg-gradient-to-br from-peach to-peach-deep p-6">
          <p className="text-xl font-extrabold leading-snug tracking-tight text-ink">
            Get up to <span className="text-mercury-accent">20%</span>
            <br />
            OFF Components
          </p>
        </div>

        <div className="relative flex flex-1 items-center overflow-hidden rounded-3xl bg-gradient-to-br from-sky to-sky-deep p-6">
          <div className="relative z-10">
            <p className="text-lg font-bold tracking-tight text-ink">
              HP Smart Tank 581
            </p>
            <a
              href="#"
              className="mt-3 inline-flex items-center rounded-full bg-ink px-5 py-2 text-xs font-semibold text-white transition hover:bg-black"
            >
              Shop now
            </a>
          </div>
          <div className="pointer-events-none absolute -right-2 bottom-0 h-[90%] w-[45%]">
            <Image
              src="/promo-printer.png"
              alt="HP Smart Tank 581"
              fill
              sizes="200px"
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
