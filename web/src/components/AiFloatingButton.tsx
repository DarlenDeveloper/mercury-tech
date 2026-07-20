"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// Routes where the floating assistant would be redundant or intrusive.
const HIDDEN_PREFIXES = ["/ai", "/u"];

export default function AiFloatingButton() {
  const pathname = usePathname();

  const hidden = HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  if (hidden) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-end gap-2 sm:bottom-5 sm:right-5">
      {/* Greeting bubble */}
      <Link
        href="/ai"
        className="animate-annc-in relative mb-0.5 block max-w-[180px] rounded-2xl bg-white px-3 py-2 shadow-[0_8px_28px_-6px_rgba(16,24,40,0.25)] sm:max-w-[200px] sm:px-3.5 sm:py-2.5"
      >
        <p className="text-[13px] font-bold leading-tight text-ink sm:text-[14px]">
          We&apos;re Online!
        </p>
        <p className="mt-0.5 text-[11.5px] leading-snug text-muted sm:text-[12px]">
          How may I help you today?
        </p>
        {/* Tail pointing to the button */}
        <span className="absolute -right-1 bottom-3 h-2.5 w-2.5 rotate-45 bg-white" />
      </Link>

      {/* AI logo button */}
      <Link
        href="/ai"
        aria-label="Chat with Mercury AI Assistant"
        className="flex h-11 w-11 shrink-0 items-center justify-center transition hover:scale-105 sm:h-12 sm:w-12"
      >
        <Image
          src="/ai-icon.png"
          alt="AI Assistant"
          width={48}
          height={48}
          className="h-full w-full object-contain"
        />
      </Link>
    </div>
  );
}
