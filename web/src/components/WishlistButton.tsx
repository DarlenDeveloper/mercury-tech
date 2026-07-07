"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { toggleFavorite } from "@/lib/wishlist";

export default function WishlistButton({ productId }: { productId?: string }) {
  const { user } = useAuth();
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (!productId) {
      setOn((v) => !v);
      return;
    }
    if (!user) {
      // Redirect to sign up if not authenticated
      window.location.href = "/signup";
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const newState = await toggleFavorite(user.uid, productId, on);
      setOn(newState);
    } catch (e) {
      console.error("Wishlist error:", e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      aria-label="Add to wishlist"
      aria-pressed={on}
      onClick={handleClick}
      className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white"
    >
      <Heart
        size={16}
        className={on ? "fill-mercury text-mercury" : "text-[#6B7280]"}
      />
    </button>
  );
}
