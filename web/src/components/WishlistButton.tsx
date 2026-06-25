"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

export default function WishlistButton() {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      aria-label="Add to wishlist"
      aria-pressed={on}
      onClick={() => setOn((v) => !v)}
      className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white"
    >
      <Heart
        size={16}
        className={on ? "fill-mercury text-mercury" : "text-[#6B7280]"}
      />
    </button>
  );
}
