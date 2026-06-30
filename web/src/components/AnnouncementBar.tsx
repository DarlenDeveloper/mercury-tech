"use client";

import { useEffect, useState } from "react";
import {
  Truck,
  Tag,
  ShieldCheck,
  Wrench,
  Sparkles,
  Flame,
  X,
  type LucideIcon,
} from "lucide-react";

const MESSAGES: { icon: LucideIcon; text: string }[] = [
  { icon: Truck, text: "Free delivery within Kampala" },
  { icon: Tag, text: "Affordable, honest pricing — always" },
  { icon: ShieldCheck, text: "Official & brand new, guaranteed" },
  { icon: Wrench, text: "Expert repairs & IT services" },
  { icon: Sparkles, text: "17+ years of trusted service" },
];

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [index, setIndex] = useState(0);

  // Rotate the messages.
  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % MESSAGES.length),
      3500
    );
    return () => clearInterval(id);
  }, []);

  if (!visible) return null;

  const { icon: Icon, text } = MESSAGES[index];

  return (
    <div className="animate-shine relative w-full bg-[linear-gradient(110deg,#0b1437_0%,#1f3e97_38%,#4c2fb5_70%,#0b1437_100%)] text-white">
      <div className="flex h-10 w-full items-center gap-3 px-4 lg:px-6">
        {/* Pulsing "hot deals" badge. */}
        <span className="hidden shrink-0 items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-white/15 sm:flex">
          <Flame size={12} className="animate-pulse text-amber-300" />
          Hot
        </span>

        {/* Rotating message (re-keyed so it animates in on each change). */}
        <div className="flex flex-1 items-center justify-center overflow-hidden">
          <span
            key={index}
            className="animate-annc-in flex items-center gap-2 whitespace-nowrap text-xs font-semibold tracking-wide sm:text-sm"
          >
            <Icon size={15} className="animate-annc-bounce shrink-0" />
            {text}
          </span>
        </div>

        {/* CTA */}
        <a
          href="#"
          className="animate-annc-glow hidden shrink-0 rounded-full bg-white px-3.5 py-1 text-[11px] font-bold text-mercury shadow-sm transition hover:bg-white/90 lg:inline-flex"
        >
          Shop Deals
        </a>

        {/* Dismiss */}
        <button
          aria-label="Dismiss announcement"
          onClick={() => setVisible(false)}
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-white/80 transition hover:bg-white/20 hover:text-white"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
