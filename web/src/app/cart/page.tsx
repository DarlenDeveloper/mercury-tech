"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
import {
  getCart,
  updateCartQty,
  removeFromCart,
  clearCart,
  type CartItem,
} from "@/lib/cart";
import { placeOrder } from "@/lib/orders";
import CheckoutSheet, { type PaymentMethod } from "@/components/CheckoutSheet";

export default function CartPage() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const rate = 3780;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setFetching(false);
      return;
    }
    getCart(user.uid).then((c) => {
      setItems(c);
      setFetching(false);
    });
  }, [user, loading]);

  const totalUsd = items.reduce((s, i) => s + i.priceUsd * i.qty, 0);
  const totalUgx = Math.round(totalUsd * rate);

  const formatUgx = (n: number) =>
    `USh ${n.toLocaleString("en-UG")}`;

  const handleQty = async (productId: string, newQty: number) => {
    if (!user) return;
    if (newQty <= 0) {
      await removeFromCart(user.uid, productId);
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    } else {
      await updateCartQty(user.uid, productId, newQty);
      setItems((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, qty: newQty } : i))
      );
    }
  };

  const handleRemove = async (productId: string) => {
    if (!user) return;
    await removeFromCart(user.uid, productId);
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handlePlaceOrder = async (
    paymentMethod: PaymentMethod,
    deliveryAddress: string
  ) => {
    if (!user || items.length === 0) return;
    setPlacing(true);
    try {
      await placeOrder(user.uid, items, totalUsd, paymentMethod, deliveryAddress);
      await clearCart(user.uid);
      setItems([]);
      setShowCheckout(false);
      setOrderPlaced(true);
    } catch (e) {
      console.error("Order error:", e);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 lg:px-6">
        <h1 className="mb-6 text-2xl font-bold text-ink">Shopping Cart</h1>

        {loading || fetching ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-mercury" />
          </div>
        ) : !user ? (
          <div className="flex flex-col items-center py-20">
            <ShoppingBag size={48} className="text-muted/40" />
            <p className="mt-4 text-muted">Sign in to view your cart.</p>
            <Link
              href="/signup"
              className="mt-4 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-black"
            >
              Sign Up
            </Link>
          </div>
        ) : orderPlaced ? (
          <div className="flex flex-col items-center py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <ShoppingBag size={28} className="text-green-600" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-ink">
              Order placed successfully!
            </h2>
            <p className="mt-1 text-sm text-muted">
              We&apos;ll process your order shortly.
            </p>
            <Link
              href="/"
              className="mt-6 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-black"
            >
              Continue Shopping
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <ShoppingBag size={48} className="text-muted/40" />
            <p className="mt-4 text-muted">Your cart is empty.</p>
            <Link
              href="/"
              className="mt-4 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-black"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* Items */}
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F0F1F4]">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-ink">
                          {item.name}
                        </h3>
                        <p className="text-xs text-muted">{item.category}</p>
                      </div>
                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="text-muted transition hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <span className="text-sm font-bold text-ink">
                        {formatUgx(Math.round(item.priceUsd * rate * item.qty))}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQty(item.productId, item.qty - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-muted hover:text-ink"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => handleQty(item.productId, item.qty + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="h-fit rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-ink">Order Summary</h2>
              <div className="mt-4 flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">
                    Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)
                  </span>
                  <span className="font-medium text-ink">
                    {formatUgx(totalUgx)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Delivery</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <hr className="my-2 border-line" />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{formatUgx(totalUgx)}</span>
                </div>
              </div>
              <button
                onClick={() => setShowCheckout(true)}
                disabled={placing}
                className="mt-6 w-full rounded-full bg-mercury py-3 text-sm font-semibold text-white transition hover:bg-mercury/90 disabled:opacity-50"
              >
                Checkout
              </button>
              <p className="mt-3 text-center text-xs text-muted">
                Free delivery within Kampala Central
              </p>
            </div>
          </div>
        )}
      </main>

      {showCheckout && (
        <CheckoutSheet
          totalUgx={totalUgx}
          placing={placing}
          onClose={() => setShowCheckout(false)}
          onPlaceOrder={handlePlaceOrder}
        />
      )}

      <Footer />
    </>
  );
}
