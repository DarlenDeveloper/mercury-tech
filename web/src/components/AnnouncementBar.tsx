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
        {/* Rotating message (re-keyed so it animates in on each change). */}
        <div className="flex flex-1 items-center justify-center overflow-hidden">
          <span
            key={index}
            className="animate-annc-in flex items-center gap-2 whitespace-nowrap text-xs font-semibold tracking-wide sm:text-sm"
          >
            {text}
          </span>
        </div>

        {/* CTA — removed */}

        {/* Dismiss — removed */}
      </div>
    </div>
  );
}
