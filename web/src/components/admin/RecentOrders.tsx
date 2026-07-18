"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, Timestamp } from "firebase/firestore";
import { Package } from "lucide-react";
import { db } from "@/lib/firestore";

type RecentOrder = {
  id: string;
  name: string;
  status: string;
  totalUsd: number;
  createdAt: Date;
};

const STATUS_STYLES: Record<string, string> = {
  pending: "text-amber-600",
  processing: "text-blue-600",
  completed: "text-[#16a34a]",
  cancelled: "text-red-500",
};

export default function RecentOrders() {
  const [orders, setOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5));
        const snap = await getDocs(q);
        setOrders(
          snap.docs.map((d) => {
            const data = d.data();
            const items = (data.items as any[]) || [];
            const firstName = items[0]?.name || "Order";
            const itemCount = items.length;
            return {
              id: d.id,
              name: itemCount > 1 ? `${firstName} +${itemCount - 1} more` : firstName,
              status: data.status || "pending",
              totalUsd: (data.totalUsd as number) || 0,
              createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            };
          })
        );
      } catch {
        /* ignore */
      }
    };
    load();
  }, []);

  const rate = 3780;

  const formatCompact = (ugx: number) => {
    if (ugx >= 1000000) {
      const m = ugx / 1000000;
      return `USh ${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
    }
    if (ugx >= 1000) return `USh ${Math.round(ugx / 1000)}K`;
    return `USh ${ugx.toLocaleString()}`;
  };

  return (
    <section className="admin-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-ink">Recent Orders</h3>
        <a href="/u/orders" className="text-xs font-medium text-mercury transition hover:text-mercury-dark">
          See all
        </a>
      </div>

      {orders.length === 0 ? (
        <p className="mt-4 text-center text-sm text-muted">No orders yet</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3.5">
          {orders.map((o) => (
            <li key={o.id} className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-soft">
                <Package size={18} className="text-muted" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{o.name}</p>
                <p className={`text-[11px] font-medium capitalize ${STATUS_STYLES[o.status] || "text-muted"}`}>
                  {o.status}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-ink">
                {formatCompact(Math.round(o.totalUsd * rate))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
