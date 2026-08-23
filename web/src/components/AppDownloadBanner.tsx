"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function AppDownloadBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show the banner after 4 seconds, but only once per session
    const dismissed = sessionStorage.getItem("app-banner-dismissed");
    if (dismissed) return;

    const timer = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem("app-banner-dismissed", "1");
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-2xl bg-gradient-to-br from-[#0f1b4d] via-mercury to-[#2a52c9] shadow-2xl">
        {/* Close button */}
        <button
          onClick={dismiss}
          aria-label="Close banner"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Decorative diamond pattern overlay */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.08) 35px, rgba(255,255,255,0.08) 36px)`,
          }} />
        </div>

        {/* Content */}
        <div className="relative flex flex-col items-center gap-6 p-8 pb-0 md:flex-row md:items-end md:gap-10 md:p-10 md:pb-0">
          {/* Text side */}
          <div className="flex-1 pb-8 text-center md:pb-10 md:text-left">
            <p className="text-sm font-medium text-white/80">
              Shop smarter on the go
            </p>
            <h2 className="mt-2 text-2xl font-bold leading-tight text-white md:text-3xl">
              Download the Mercury App today!
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Browse products, track orders, and get exclusive deals — all from your phone.
            </p>

            {/* Store badges */}
            <div className="mt-6 flex items-center justify-center gap-3 md:justify-start">
              <a
                href="https://apps.apple.com/us/app/mercury-store/id6790326695"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 items-center gap-2 rounded-lg bg-black px-4 transition hover:opacity-90"
              >
                <svg viewBox="0 0 24 24" fill="white" className="h-5 w-5">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="text-left">
                  <span className="block text-[9px] leading-none text-white/80">Download on the</span>
                  <span className="block text-sm font-semibold leading-tight text-white">App Store</span>
                </div>
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.mercurytech.mercury_tech&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 items-center gap-2 rounded-lg bg-black px-4 transition hover:opacity-90"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5">
                  <path fill="#34A853" d="M3.18 2.04c-.27.29-.43.7-.43 1.2v17.52c0 .5.16.91.43 1.2l.06.06L13.4 12.3v-.14-.14L3.24 1.98l-.06.06z" />
                  <path fill="#FBBC04" d="M16.81 15.72l-3.4-3.42v-.14-.14l3.4-3.42.08.04 4.03 2.29c1.15.65 1.15 1.72 0 2.38l-4.03 2.29-.08.04z" />
                  <path fill="#EA4335" d="M16.89 15.68L13.4 12.16 3.18 22.04c.38.4 1 .45 1.71.05l11.99-6.41z" />
                  <path fill="#4285F4" d="M16.89 8.48L4.9 2.07c-.71-.4-1.33-.35-1.71.05L13.4 12.16l3.49-3.68z" />
                </svg>
                <div className="text-left">
                  <span className="block text-[9px] leading-none text-white/80">Download on</span>
                  <span className="block text-sm font-semibold leading-tight text-white">Google Play</span>
                </div>
              </a>
            </div>
          </div>

          {/* Phone mockup - overflows top, flush at bottom */}
          <div className="relative h-64 w-44 shrink-0 md:h-80 md:w-56">
            <Image
              src="/mercuryappmockup.png"
              alt="Mercury App - hand holding phone showing the Mercury store"
              fill
              className="object-contain object-bottom"
              sizes="(max-width: 768px) 176px, 224px"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
