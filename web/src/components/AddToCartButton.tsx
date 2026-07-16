"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { addToCart } from "@/lib/cart";

type Props = {
  productId: string;
  name: string;
  category: string;
  priceUsd: number;
  image?: string;
};

export default function AddToCartButton({
  productId,
  name,
  category,
  priceUsd,
  image,
}: Props) {
  const { user } = useAuth();
  const [added, setAdded] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (!user) {
      window.location.href = "/signup";
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      await addToCart(user.uid, {
        productId,
        name,
        category,
        priceUsd,
        qty: 1,
        image,
      });
      setAdded(true);
      // Signal header to refresh cart count
      window.dispatchEvent(new Event("cart-updated"));
      setTimeout(() => setAdded(false), 2000);
    } catch (e) {
      console.error("Add to cart error:", e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-mercury text-sm font-semibold text-white transition hover:bg-mercury/90 disabled:opacity-50"
    >
      {added ? (
        <>
          <Check size={18} />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingBag size={18} />
          {busy ? "Adding..." : "Add to Cart"}
        </>
      )}
    </button>
  );
}
