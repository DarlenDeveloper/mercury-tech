import Image from "next/image";

export default function AppDownloadSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#0f1b4d] via-mercury to-[#2a52c9]">
      {/* Decorative geometric pattern */}
      <div className="absolute inset-0 opacity-[0.07]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 41px),
              repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 41px)
            `,
          }}
        />
      </div>

      {/* Accent border top */}
      <div className="h-1 w-full bg-mercury-accent" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-14 md:flex-row md:gap-12 md:py-20 lg:px-6">
        {/* Text content */}
        <div className="flex-1 text-center md:text-left">
          <p className="text-sm font-medium uppercase tracking-wider text-white/60">
            Now available on iOS & Android
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-white md:text-4xl lg:text-[2.75rem]">
            Download the Mercury App today!
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-white/75 md:text-lg">
            Take control of your tech shopping with ease — anywhere, anytime.
            Browse hundreds of products, track your orders, and enjoy exclusive app-only deals.
          </p>

          {/* Store badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:justify-start">
            <a
              href="https://apps.apple.com/us/app/mercury-store/id6790326695"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 items-center gap-2.5 rounded-xl bg-black px-5 shadow-lg transition hover:scale-105 hover:shadow-xl"
            >
              <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <div className="text-left">
                <span className="block text-[10px] leading-none text-white/80">Download on the</span>
                <span className="block text-base font-semibold leading-tight text-white">App Store</span>
              </div>
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.mercurytech.mercury_tech&pcampaignid=web_share"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 items-center gap-2.5 rounded-xl bg-black px-5 shadow-lg transition hover:scale-105 hover:shadow-xl"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6">
                <path fill="#34A853" d="M3.18 2.04c-.27.29-.43.7-.43 1.2v17.52c0 .5.16.91.43 1.2l.06.06L13.4 12.3v-.14-.14L3.24 1.98l-.06.06z" />
                <path fill="#FBBC04" d="M16.81 15.72l-3.4-3.42v-.14-.14l3.4-3.42.08.04 4.03 2.29c1.15.65 1.15 1.72 0 2.38l-4.03 2.29-.08.04z" />
                <path fill="#EA4335" d="M16.89 15.68L13.4 12.16 3.18 22.04c.38.4 1 .45 1.71.05l11.99-6.41z" />
                <path fill="#4285F4" d="M16.89 8.48L4.9 2.07c-.71-.4-1.33-.35-1.71.05L13.4 12.16l3.49-3.68z" />
              </svg>
              <div className="text-left">
                <span className="block text-[10px] leading-none text-white/80">Download on</span>
                <span className="block text-base font-semibold leading-tight text-white">Google Play</span>
              </div>
            </a>
          </div>
        </div>

        {/* Phone mockup image */}
        <div className="relative h-72 w-52 shrink-0 md:h-[22rem] md:w-64 lg:h-[26rem] lg:w-72">
          <Image
            src="/mercuryappmockup.png"
            alt="Mercury App - hand holding phone showing the Mercury store"
            fill
            className="object-contain object-bottom drop-shadow-2xl"
            sizes="(max-width: 768px) 208px, (max-width: 1024px) 256px, 288px"
          />
        </div>
      </div>
    </section>
  );
}
