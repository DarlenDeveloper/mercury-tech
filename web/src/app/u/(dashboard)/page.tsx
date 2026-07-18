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
import { TrendingUp, TrendingDown, BadgeCheck, EyeOff } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import Sparkline from "@/components/admin/Sparkline";
import AreaChart from "@/components/admin/charts/AreaChart";
import { db } from "@/lib/firestore";
import { useAdminAccess } from "@/components/admin/AdminGuard";
import { isSuperAdmin, hasPageAccess } from "@/lib/adminAccess";

type OrderItem = {
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
  items: OrderItem[];
  totalUsd: number;
  status: string;
  createdAt: Date | null;
};

type Product = {
  id: string;
  name: string;
  category: string;
  priceUsd: number;
  stock: number;
  image?: string;
};

type Customer = {
  id: string;
  name: string;
  email: string;
  location: string;
  orderCount?: number;
  totalSpent?: number;
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

export default function AdminDashboardPage() {
  const { adminEntry } = useAdminAccess();
  const canSeeRevenue = isSuperAdmin(adminEntry) || hasPageAccess(adminEntry, "finance");

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rate, setRate] = useState(3780);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orderSnap, productSnap, userSnap, rateSnap] = await Promise.all([
        getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"))),
        getDocs(collection(db, "products")),
        getDocs(collection(db, "users")),
        getDoc(doc(db, "config", "rate")),
      ]);

      const orderList: Order[] = orderSnap.docs.map((d) => {
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
      setOrders(orderList);

      setProducts(
        productSnap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name ?? "",
            category: data.category ?? "",
            priceUsd: data.priceUsd ?? 0,
            stock: data.stock ?? 0,
            image: data.image ?? "",
          };
        })
      );

      // Build customer list with order stats
      const userMap = new Map<string, Customer>();
      userSnap.docs.forEach((d) => {
        const data = d.data();
        userMap.set(d.id, {
          id: d.id,
          name: data.name ?? "Unknown",
          email: data.email ?? "",
          location: data.location ?? "",
          orderCount: 0,
          totalSpent: 0,
        });
      });
      // Count orders per customer
      orderList.forEach((o) => {
        const c = userMap.get(o.userId);
        if (c) {
          c.orderCount = (c.orderCount ?? 0) + 1;
          c.totalSpent = (c.totalSpent ?? 0) + o.totalUsd;
        }
      });
      setCustomers(Array.from(userMap.values()));

      if (rateSnap.exists()) setRate(rateSnap.data()?.usdToUgx ?? 3780);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  // ─── Computed stats ──────────────────────────────────────────────────────────

  const completedOrders = orders.filter((o) => o.status === "completed");
  const totalRevenueUsd = completedOrders.reduce((s, o) => s + o.totalUsd, 0);

  // Monthly revenue for current year
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = Array(12).fill(0);
  completedOrders.forEach((o) => {
    if (o.createdAt && o.createdAt.getFullYear() === currentYear) {
      monthlyRevenue[o.createdAt.getMonth()] += o.totalUsd * rate;
    }
  });

  // Last 10 days sparkline
  const now = Date.now();
  const customerSpark = Array(10).fill(0);
  const revenueSpark = Array(10).fill(0);
  const orderSpark = Array(10).fill(0);
  orders.forEach((o) => {
    if (!o.createdAt) return;
    const daysAgo = Math.floor((now - o.createdAt.getTime()) / 86_400_000);
    if (daysAgo >= 0 && daysAgo < 10) {
      orderSpark[9 - daysAgo]++;
      if (o.status === "completed") revenueSpark[9 - daysAgo] += o.totalUsd;
    }
  });

  const stats = [
    {
      label: "Total Customers",
      value: customers.length.toLocaleString(),
      delta: `${orders.length} orders`,
      trend: "up" as const,
      tint: "#eaf1fc",
      spark: orderSpark,
    },
    {
      label: "Total Revenue",
      value: canSeeRevenue ? formatUgx(totalRevenueUsd, rate) : "••••••",
      delta: canSeeRevenue ? `${completedOrders.length} completed` : "Restricted",
      trend: totalRevenueUsd > 0 ? ("up" as const) : ("down" as const),
      tint: "#eef7ee",
      spark: canSeeRevenue ? revenueSpark : [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    },
    {
      label: "Total Products",
      value: products.length.toLocaleString(),
      delta: `${products.filter((p) => p.stock > 0).length} in stock`,
      trend: "up" as const,
      tint: "#f3e8ff",
      spark: orderSpark,
    },
  ];

  // Top selling products (by order frequency)
  const productSales: Record<string, { count: number; product?: Product }> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { count: 0 };
      }
      productSales[item.productId].count += item.qty;
    });
  });
  products.forEach((p) => {
    if (productSales[p.id]) productSales[p.id].product = p;
  });
  const topSelling = Object.values(productSales)
    .filter((e) => e.product)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top customers by spend
  const topCustomers = [...customers]
    .filter((c) => (c.totalSpent ?? 0) > 0)
    .sort((a, b) => (b.totalSpent ?? 0) - (a.totalSpent ?? 0))
    .slice(0, 4);

  // Recent orders (last 5)
  const recentOrders = orders.slice(0, 5);

  if (loading) {
    return (
      <div className="px-5 py-6 lg:px-8 lg:py-7">
        {/* Header skeleton */}
        <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-soft" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-surface-soft" />

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-6">
            {/* Stat cards skeleton */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-surface-soft" />
              ))}
            </div>
            {/* Chart skeleton */}
            <div className="h-72 animate-pulse rounded-2xl bg-surface-soft" />
            {/* Table skeleton */}
            <div className="h-64 animate-pulse rounded-2xl bg-surface-soft" />
          </div>
          {/* Right rail skeleton */}
          <aside className="flex flex-col gap-6">
            <div className="h-48 animate-pulse rounded-2xl bg-surface-soft" />
            <div className="h-40 animate-pulse rounded-2xl bg-surface-soft" />
            <div className="h-52 animate-pulse rounded-2xl bg-surface-soft" />
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="Welcome Back!"
        subtitle="Here's what's happening with your store today"
      />

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        {/* Center column */}
        <div className="flex flex-col gap-6">
          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {stats.map((s) => {
              const up = s.trend === "up";
              const color = up ? "#16a34a" : "#e11d48";
              return (
                <div
                  key={s.label}
                  className="rounded-2xl p-5 shadow-[0_10px_26px_-14px_rgba(16,24,40,0.22)]"
                  style={{ backgroundColor: s.tint }}
                >
                  <p className="text-3xl font-extrabold tracking-tight text-ink">{s.value}</p>
                  <p className="mt-1 text-[13px] text-muted">{s.label}</p>
                  <div className="mt-4 flex items-end justify-between">
                    <div className="flex items-center gap-1.5">
                      {up ? <TrendingUp size={15} style={{ color }} /> : <TrendingDown size={15} style={{ color }} />}
                      <span className="text-xs text-muted">{s.delta}</span>
                    </div>
                    <Sparkline data={s.spark} color={color} width={80} height={36} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Revenue chart from real data */}
          <section className="admin-card relative p-5 overflow-hidden">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-ink">Revenue</h3>
                <p className="text-xs text-muted">Monthly completed revenue (USh, millions) — {new Date().getFullYear()}</p>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-ink">
                {canSeeRevenue ? formatUgx(totalRevenueUsd, rate) : "••••••"}
              </span>
            </div>

            {canSeeRevenue ? (
              monthlyRevenue.some((v: number) => v > 0) ? (
                <AreaChart
                  months={["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"]}
                  values={monthlyRevenue.map((v: number) => v / 1_000_000)}
                  color="#1f3e97"
                  unit="M"
                  decimals={2}
                />
              ) : (
                <p className="py-16 text-center text-sm text-muted">
                  No completed revenue this year yet — chart will populate as orders complete.
                </p>
              )
            ) : (
              /* Blurred overlay for non-authorized users */
              <div className="relative">
                <div className="pointer-events-none select-none blur-md opacity-40">
                  <div className="h-56 w-full rounded-xl bg-gradient-to-t from-surface-soft to-transparent" />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-soft shadow-sm">
                    <EyeOff size={24} className="text-muted" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-muted">Revenue data is restricted</p>
                  <p className="mt-1 text-xs text-muted/70">Contact a Super Admin for access</p>
                </div>
              </div>
            )}
          </section>

          {/* Top selling products */}
          <section className="admin-card p-5">
            <h3 className="mb-4 text-lg font-bold text-ink">Top Selling Products</h3>
            {topSelling.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">No sales data yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-line text-[12px] font-medium text-muted">
                      <th className="pb-3 pl-1 font-medium">#</th>
                      <th className="pb-3 font-medium">Product</th>
                      <th className="pb-3 font-medium">Category</th>
                      <th className="pb-3 font-medium">Stock</th>
                      <th className="pb-3 font-medium">Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSelling.map((entry, i) => {
                      const p = entry.product!;
                      return (
                        <tr key={p.id} className="border-b border-line/70 last:border-0 text-sm">
                          <td className="py-3 pl-1 text-muted">{String(i + 1).padStart(2, "0")}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              {p.image && (
                                <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-surface-soft">
                                  <Image src={p.image} alt={p.name} width={36} height={36} className="h-7 w-7 object-contain" />
                                </span>
                              )}
                              <span className="font-medium text-ink">{p.name}</span>
                            </div>
                          </td>
                          <td className="py-3 text-muted">{p.category}</td>
                          <td className="py-3">
                            <span className={`text-sm font-medium ${p.stock > 0 ? "text-[#16a34a]" : "text-[#e11d48]"}`}>
                              {p.stock > 0 ? "In Stock" : "Out of Stock"}
                            </span>
                          </td>
                          <td className="py-3 font-semibold text-ink">{entry.count}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* Right rail */}
        <aside className="flex flex-col gap-6">
          {/* Top Customers */}
          <section className="admin-card p-5">
            <h3 className="text-[15px] font-bold text-ink">Top Customers</h3>
            {topCustomers.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No customer data yet</p>
            ) : (
              <ul className="mt-4 flex flex-col gap-4">
                {topCustomers.map((c, i) => (
                  <li key={c.id} className="flex items-center gap-3">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: ["#1f3e97","#0e7490","#9f1239","#b45309"][i % 4] }}
                    >
                      {initials(c.name)}
                    </span>
                    <div className="flex-1">
                      <p className="flex items-center gap-1 text-sm font-semibold text-ink">
                        {c.name}
                        <BadgeCheck size={14} className="text-mercury" />
                      </p>
                      <p className="text-[11px] text-muted">{c.orderCount} orders</p>
                    </div>
                    <span className="text-sm font-semibold text-ink">
                      {formatUgx(c.totalSpent ?? 0, rate)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Quick Actions */}
          <section className="admin-card p-5">
            <h3 className="text-[15px] font-bold text-ink">Quick Actions</h3>
            <div className="mt-4 flex flex-col gap-2">
              <a href="/u/products" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-surface-soft">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf1fc]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                </span>
                Add new product
              </a>
              <a href="/u/orders" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-surface-soft">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef7ee]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/></svg>
                </span>
                View pending orders
              </a>
              <a href="/u/customers" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-surface-soft">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3e8ff]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </span>
                Manage customers
              </a>
              <a href="/u/categories" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-surface-soft">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fef3e2]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                </span>
                Edit categories
              </a>
            </div>
          </section>

          {/* Recent Orders */}
          <section className="admin-card p-5">
            <h3 className="text-[15px] font-bold text-ink">Recent Orders</h3>
            {recentOrders.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No orders yet</p>
            ) : (
              <ul className="mt-4 flex flex-col gap-4">
                {recentOrders.map((o) => {
                  const firstItem = o.items[0];
                  const orderName = firstItem?.name ?? "Order #" + o.id.slice(0, 6);
                  const totalUgx = Math.round((o.totalUsd || 0) * rate);
                  return (
                    <li key={o.id} className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-soft">
                        {firstItem?.image ? (
                          <Image src={firstItem.image} alt={orderName} width={40} height={40} className="h-8 w-8 object-contain" />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">
                          {orderName}
                        </p>
                        <p className="text-[11px] font-medium capitalize text-muted">{o.status}</p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-ink">
                        {totalUgx > 0 ? formatUgx(o.totalUsd, rate) : "—"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
