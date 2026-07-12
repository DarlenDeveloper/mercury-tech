"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  orderBy,
} from "firebase/firestore";
import Image from "next/image";
import {
  TrendingUp,
  TrendingDown,
  Heart,
  ShoppingCart,
  CreditCard,
  Package,
  X,
  type LucideIcon,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { db } from "@/lib/firestore";

type CartItem = {
  productId: string;
  name: string;
  category: string;
  priceUsd: number;
  qty: number;
  image?: string;
};

type Order = {
  id: string;
  userId: string;
  items: { productId: string; name: string; priceUsd: number; qty: number }[];
  totalUsd: number;
  status: string;
  createdAt: Date | null;
};

type AbandonedCart = {
  userId: string;
  userName: string;
  email: string;
  phone: string;
  location: string;
  items: CartItem[];
  totalUsd: number;
};

type ActivityEntry = {
  user: string;
  action: string;
  product: string;
  time: string;
  type: "order" | "wishlist" | "cart";
};

function formatUgx(usd: number, rate: number) {
  const ugx = Math.round(usd * rate);
  if (ugx >= 1_000_000) return `USh ${(ugx / 1_000_000).toFixed(2)}M`;
  if (ugx >= 1_000) return `USh ${(ugx / 1_000).toFixed(0)}K`;
  return `USh ${ugx.toLocaleString()}`;
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function timeAgo(date: Date | null) {
  if (!date) return "—";
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const ACTION_META: Record<string, { icon: LucideIcon; tint: string; color: string }> = {
  wishlist: { icon: Heart, tint: "bg-[#fde8ea]", color: "#e11d48" },
  cart: { icon: ShoppingCart, tint: "bg-[#e8eefc]", color: "#1f3e97" },
  order: { icon: CreditCard, tint: "bg-[#e7f6ee]", color: "#16a34a" },
};

export default function UserTrackingPage() {
  const [loading, setLoading] = useState(true);
  const [rate, setRate] = useState(3780);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [mostWishlisted, setMostWishlisted] = useState<{ name: string; image: string; count: number }[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null);
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersSnap, ordersSnap, productsSnap, rateSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"))),
        getDocs(collection(db, "products")),
        getDoc(doc(db, "config", "rate")),
      ]);

      if (rateSnap.exists()) setRate(rateSnap.data()?.usdToUgx ?? 3780);

      const users = usersSnap.docs.map((d) => ({
        id: d.id,
        name: (d.data().name as string) || "Unknown",
        email: (d.data().email as string) || "",
        phone: (d.data().phone as string) || "",
        location: (d.data().location as string) || "",
      }));
      setUserCount(users.length);

      const orders: Order[] = ordersSnap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userId: data.userId ?? "",
          items: data.items ?? [],
          totalUsd: data.totalUsd ?? 0,
          status: data.status ?? "pending",
          createdAt: data.createdAt?.toDate?.() ?? null,
        };
      });
      setOrderCount(orders.length);

      const productMap: Record<string, { name: string; image: string }> = {};
      productsSnap.docs.forEach((d) => {
        const data = d.data();
        productMap[d.id] = { name: data.name ?? d.id, image: data.image ?? "" };
      });

      // Fetch wishlists and carts per user
      const wishlistProducts: Record<string, number> = {};
      let totalWishlists = 0;
      const abandoned: AbandonedCart[] = [];

      for (const user of users) {
        const favSnap = await getDocs(collection(db, "users", user.id, "favorites"));
        totalWishlists += favSnap.size;
        favSnap.docs.forEach((d) => {
          wishlistProducts[d.id] = (wishlistProducts[d.id] || 0) + 1;
        });

        const cartSnap = await getDocs(collection(db, "users", user.id, "cart"));
        if (cartSnap.size > 0) {
          const cartItems: CartItem[] = cartSnap.docs.map((d) => ({ productId: d.id, ...d.data() } as CartItem));
          const hasCompleted = orders.some((o) => o.userId === user.id && o.status === "completed");
          if (!hasCompleted) {
            const total = cartItems.reduce((s, i) => s + i.priceUsd * i.qty, 0);
            abandoned.push({
              userId: user.id,
              userName: user.name,
              email: user.email,
              phone: user.phone,
              location: user.location,
              items: cartItems,
              totalUsd: total,
            });
          }
        }
      }

      setWishlistCount(totalWishlists);
      setAbandonedCarts(abandoned.slice(0, 5));

      // Most wishlisted
      const wishlisted = Object.entries(wishlistProducts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([pid, count]) => ({
          name: productMap[pid]?.name ?? pid,
          image: productMap[pid]?.image ?? "",
          count,
        }));
      setMostWishlisted(wishlisted);

      // Activity feed from orders
      const feed: ActivityEntry[] = orders.slice(0, 8).map((o) => {
        const user = users.find((u) => u.id === o.userId);
        return {
          user: user?.name ?? "Unknown",
          action: o.status === "completed" ? "purchased" : "ordered",
          product: o.items[0]?.name ?? "an item",
          time: timeAgo(o.createdAt),
          type: "order" as const,
        };
      });
      setActivity(feed);
    } catch (e) {
      console.error("User tracking fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const kpis = [
    { label: "Wishlist Saves", value: wishlistCount.toLocaleString(), trend: "up" as const, detail: "total favorites" },
    { label: "Abandoned Carts", value: abandonedCarts.length.toLocaleString(), trend: abandonedCarts.length > 0 ? ("down" as const) : ("up" as const), detail: "users with items" },
    { label: "Total Orders", value: orderCount.toLocaleString(), trend: "up" as const, detail: "all time" },
    { label: "Registered Users", value: userCount.toLocaleString(), trend: "up" as const, detail: "total accounts" },
  ];

  if (loading) {
    return (
      <div className="px-5 py-6 lg:px-8 lg:py-7">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-soft" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-surface-soft" />
        <div className="mt-6 grid grid-cols-2 gap-5 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (<div key={i} className="h-24 animate-pulse rounded-2xl bg-surface-soft" />))}
        </div>
        <div className="mt-6 h-72 animate-pulse rounded-2xl bg-surface-soft" />
      </div>
    );
  }

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader title="User Tracking" subtitle="Wishlist saves, cart activity and order behavior" />

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-2 gap-5 xl:grid-cols-4">
        {kpis.map((k) => {
          const up = k.trend === "up";
          const color = up ? "#16a34a" : "#e11d48";
          return (
            <div key={k.label} className="admin-card p-5">
              <p className="text-[13px] text-muted">{k.label}</p>
              <p className="mt-1 text-2xl font-extrabold tracking-tight text-ink">{k.value}</p>
              <div className="mt-1 flex items-center gap-1.5">
                {up ? <TrendingUp size={14} style={{ color }} /> : <TrendingDown size={14} style={{ color }} />}
                <span className="text-xs text-muted">{k.detail}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
        {/* Activity feed */}
        <section className="admin-card p-5">
          <h3 className="mb-4 text-lg font-bold text-ink">Recent Activity</h3>
          {activity.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">No recent activity</p>
          ) : (
            <ul className="flex flex-col">
              {activity.map((a, i) => {
                const meta = ACTION_META[a.type];
                const Icon = meta.icon;
                return (
                  <li key={i} className="flex items-center gap-3 border-b border-line/70 py-3 last:border-0">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mercury text-[11px] font-bold text-white">
                      {initials(a.user)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-ink">
                        <span className="font-semibold">{a.user}</span>{" "}
                        <span className="text-muted">{a.action}</span>{" "}
                        <span className="font-medium">{a.product}</span>
                      </p>
                      <p className="text-[11px] text-muted">{a.time}</p>
                    </div>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.tint}`} style={{ color: meta.color }}>
                      <Icon size={15} />
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Right column */}
        <aside className="flex flex-col gap-6">
          {/* Most wishlisted */}
          <section className="admin-card p-5">
            <h3 className="mb-4 text-[15px] font-bold text-ink">Most Wishlisted</h3>
            {mostWishlisted.length === 0 ? (
              <p className="text-sm text-muted">No wishlist data yet</p>
            ) : (
              <ul className="flex flex-col gap-4">
                {mostWishlisted.map((p) => (
                  <li key={p.name} className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-surface-soft">
                      {p.image ? (
                        <Image src={p.image} alt={p.name} width={40} height={40} className="h-8 w-8 object-contain" />
                      ) : (
                        <Package size={18} className="text-muted" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{p.name}</span>
                    <span className="flex items-center gap-1 text-sm font-semibold text-ink">
                      <Heart size={13} className="fill-[#e11d48] text-[#e11d48]" />
                      {p.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Abandoned carts */}
          <section className="admin-card p-5">
            <h3 className="mb-4 text-[15px] font-bold text-ink">Abandoned Carts</h3>
            {abandonedCarts.length === 0 ? (
              <p className="text-sm text-muted">No abandoned carts</p>
            ) : (
              <ul className="flex flex-col gap-4">
                {abandonedCarts.map((c) => (
                  <li
                    key={c.userId}
                    className="flex cursor-pointer items-center gap-3 rounded-xl p-2 transition hover:bg-surface-soft"
                    onClick={() => setSelectedCart(c)}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fef3e2] text-[11px] font-bold text-[#b45309]">
                      {initials(c.userName)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{c.userName}</p>
                      <p className="text-[11px] text-muted">{c.items.length} items in cart</p>
                    </div>
                    <span className="text-sm font-semibold text-ink">{formatUgx(c.totalUsd, rate)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      {/* Cart Detail Popup */}
      {selectedCart && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedCart(null)}
        >
          <div
            className="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-ink">{selectedCart.userName}</h2>
                <p className="text-sm text-muted">Abandoned cart details</p>
              </div>
              <button onClick={() => setSelectedCart(null)} className="text-muted transition hover:text-ink">
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              {/* User profile details */}
              <div className="rounded-xl bg-surface-soft p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Contact Info</p>
                <div className="mt-2 flex flex-col gap-1.5">
                  {selectedCart.email && (
                    <p className="text-sm text-ink">
                      <span className="text-muted">Email:</span> {selectedCart.email}
                    </p>
                  )}
                  {selectedCart.phone && (
                    <p className="text-sm text-ink">
                      <span className="text-muted">Phone:</span> {selectedCart.phone}
                    </p>
                  )}
                  {selectedCart.location && (
                    <p className="text-sm text-ink">
                      <span className="text-muted">Location:</span> {selectedCart.location}
                    </p>
                  )}
                  {!selectedCart.email && !selectedCart.phone && !selectedCart.location && (
                    <p className="text-sm text-muted">No contact info available</p>
                  )}
                </div>
              </div>

              {/* Cart items */}
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted">Cart Items</p>
              {selectedCart.items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 rounded-xl border border-line p-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-soft">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} width={40} height={40} className="h-8 w-8 object-contain" />
                    ) : (
                      <Package size={18} className="text-muted" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                    <p className="text-[11px] text-muted">{item.category} · Qty: {item.qty}</p>
                  </div>
                  <span className="text-sm font-semibold text-ink">{formatUgx(item.priceUsd * item.qty, rate)}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
              <span className="text-sm text-muted">Total value</span>
              <span className="text-lg font-extrabold text-ink">{formatUgx(selectedCart.totalUsd, rate)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
