"use client";

import { useState } from "react";
import { X, MapPin, ShieldCheck, Banknote, Store } from "lucide-react";

export type PaymentMethod = "Cash on Delivery" | "Pickup from Store";

const PAYMENT_OPTIONS: {
  method: PaymentMethod;
  subtitle: string;
  icon: typeof Banknote;
}[] = [
  { method: "Cash on Delivery", subtitle: "Pay when your order arrives", icon: Banknote },
  { method: "Pickup from Store", subtitle: "Pay & collect at Kamwokya, Kira Road", icon: Store },
];

function formatUgx(n: number) {
  return `USh ${n.toLocaleString("en-UG")}`;
}

export default function CheckoutSheet({
  totalUgx,
  placing,
  onClose,
  onPlaceOrder,
}: {
  totalUgx: number;
  placing: boolean;
  onClose: () => void;
  onPlaceOrder: (paymentMethod: PaymentMethod, deliveryAddress: string) => void;
}) {
  const [selected, setSelected] = useState<PaymentMethod>("Cash on Delivery");
  const [address, setAddress] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Order confirmation"
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-ink">Order confirmation</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-surface-soft hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        {/* Payment options */}
        <div className="mt-5 flex flex-col gap-2.5">
          {PAYMENT_OPTIONS.map((opt) => {
            const active = selected === opt.method;
            return (
              <button
                key={opt.method}
                type="button"
                onClick={() => setSelected(opt.method)}
                className={`flex items-center gap-3 rounded-2xl p-3 text-left transition ${
                  active ? "bg-[#1A2E3B] text-white" : "bg-surface-soft text-ink"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    active ? "bg-white/15" : "bg-white"
                  }`}
                >
                  <opt.icon size={20} className={active ? "text-white" : "text-ink"} />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold">{opt.method}</span>
                  <span
                    className={`block text-xs ${
                      active ? "text-white/60" : "text-muted"
                    }`}
                  >
                    {opt.subtitle}
                  </span>
                </span>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    active ? "border-white" : "border-line"
                  }`}
                >
                  {active && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                </span>
              </button>
            );
          })}
        </div>

        <hr className="my-5 border-line" />

        {/* Delivery address */}
        <label className="block">
          <span className="text-[15px] font-bold text-ink">Delivery address</span>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-soft text-ink">
              <MapPin size={20} />
            </span>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter delivery address (Kampala, Uganda)"
              className="w-full rounded-xl border border-line bg-surface-soft px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-mercury focus:bg-white"
            />
          </div>
        </label>

        {/* Estimated delivery */}
        <div className="mt-5 flex items-center justify-between">
          <span className="text-[13px] italic text-muted">
            Estimated delivery time:
          </span>
          <span className="text-sm font-bold text-ink">1-3 days</span>
        </div>

        {/* Total + place order */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted">Total price</p>
            <p className="text-xl font-extrabold text-ink">{formatUgx(totalUgx)}</p>
          </div>
          <button
            onClick={() => onPlaceOrder(selected, address)}
            disabled={placing}
            className="flex items-center gap-2 rounded-full bg-[#1A2E3B] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-black disabled:opacity-50"
          >
            <ShieldCheck size={16} />
            {placing ? "Placing order..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
