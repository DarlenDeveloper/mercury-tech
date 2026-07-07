"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Search, ListFilter, MoreHorizontal } from "lucide-react";
import { doc, getDoc, updateDoc, serverTimestamp, getFirestore } from "firebase/firestore";
import { firebaseApp } from "@/lib/firebase";
import AdminHeader from "@/components/admin/AdminHeader";
import UsdRateBar from "@/components/admin/UsdRateBar";
import {
  ADMIN_PRODUCTS,
  PRODUCT_CATEGORIES,
  USD_RATE,
  type ProductStatus,
} from "@/lib/adminData";

const STATUS_STYLES: Record<ProductStatus, string> = {
  Published: "bg-[#e7f6ee] text-[#16a34a]",
  Draft: "bg-surface-soft text-muted",
  "Out of stock": "bg-[#fde8ea] text-[#e11d48]",
};

function usd(v: number) {
  return `$${v.toLocaleString()}`;
}

export default function ProductsPage() {
  const [rate, setRate] = useState(USD_RATE.value);
  const [prevRate, setPrevRate] = useState(USD_RATE.prev);

  // Load current rate from Firestore on mount.
  useEffect(() => {
    const db = getFirestore(firebaseApp);
    getDoc(doc(db, "config", "rate")).then((snap) => {
      const data = snap.data();
      if (data?.usdToUgx) {
        setRate(data.usdToUgx);
        setPrevRate(data.usdToUgx);
      }
    });
  }, []);

  const applyRate = async (value: number) => {
    setPrevRate(rate);
    setRate(value);
    const db = getFirestore(firebaseApp);
    await updateDoc(doc(db, "config", "rate"), {
      usdToUgx: value,
      updatedAt: serverTimestamp(),
    });
  };

  const approxUgx = (usdValue: number) =>
    `≈ USh ${Math.round(usdValue * rate).toLocaleString()}`;

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="Products"
        subtitle="Manage your catalog, pricing and stock"
        action={
          <button className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black">
            <Plus size={16} />
            Add Product
          </button>
        }
      />

      {/* Admin-managed USD → UGX rate */}
      <div className="mt-6">
        <UsdRateBar rate={rate} prevRate={prevRate} onApply={applyRate} />
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex h-10 flex-1 items-center gap-2 rounded-full bg-white px-4">
          <Search size={16} className="text-muted" />
          <input
            placeholder="Search products or SKU"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          />
        </div>
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
          {PRODUCT_CATEGORIES.map((c, i) => (
            <button
              key={c}
              className={`whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition ${
                i === 0
                  ? "bg-ink text-white"
                  : "bg-white text-muted hover:text-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <button className="flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-ink transition hover:text-mercury">
          <ListFilter size={15} />
          Filters
        </button>
      </div>

      {/* Products table */}
      <section className="admin-card mt-5 p-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-[12px] font-medium text-muted">
                <th className="pb-3 pl-1 font-medium">Product</th>
                <th className="pb-3 font-medium">SKU</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Price (USD)</th>
                <th className="pb-3 font-medium">Stock</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {ADMIN_PRODUCTS.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-line/70 text-sm last:border-0"
                >
                  <td className="py-3 pl-1">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-surface-soft">
                        <Image
                          src={p.image}
                          alt={p.name}
                          width={40}
                          height={40}
                          className="h-8 w-8 object-contain"
                        />
                      </span>
                      <span className="font-medium text-ink">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-muted">{p.sku}</td>
                  <td className="py-3 text-muted">{p.category}</td>
                  <td className="py-3">
                    <span className="font-semibold text-ink">
                      {usd(p.priceUsd)}
                    </span>
                    <span className="block text-[11px] text-muted">
                      {approxUgx(p.priceUsd)}
                    </span>
                  </td>
                  <td className="py-3 text-ink">{p.stock}</td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[p.status]}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      aria-label="Actions"
                      className="rounded-lg p-1.5 text-muted transition hover:bg-surface-soft hover:text-ink"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
