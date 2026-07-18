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
import { TrendingUp, TrendingDown, Download, EyeOff } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import Sparkline from "@/components/admin/Sparkline";
import AreaChart from "@/components/admin/charts/AreaChart";
import BarChart from "@/components/admin/charts/BarChart";
import DonutChart from "@/components/admin/charts/DonutChart";
import { db } from "@/lib/firestore";
import { useAdminAccess } from "@/components/admin/AdminGuard";
import { isSuperAdmin, hasPageAccess } from "@/lib/adminAccess";
import type { Segment } from "@/lib/adminData";

type OrderItem = {
  productId: string;
  name: string;
  category: string;
  priceUsd: number;
  qty: number;
};

type Order = {
  id: string;
  items: OrderItem[];
  totalUsd: number;
  status: string;
  createdAt: Date | null;
};

const MONTHS = [
  "JAN","FEB","MAR","APR","MAY","JUN",
  "JUL","AUG","SEP","OCT","NOV","DEC",
];

const CAT_COLORS: Record<string, string> = {
  Computers: "#1f3e97",
  Laptops: "#1f3e97",
  Desktops: "#0e7490",
  Monitors: "#7c3aed",
  "Printers & Office": "#ff7a00",
  Printers: "#ff7a00",
  "Components & Power": "#9f1239",
  Components: "#9f1239",
  "Networking & Security": "#7c3aed",
  "Phones, TV & Audio": "#0e7490",
  Accessories: "#16a34a",
};

function formatUgx(usd: number, rate: number) {
  const ugx = Math.round(usd * rate);
  if (ugx >= 1_000_000) return `USh ${(ugx / 1_000_000).toFixed(2)}M`;
  if (ugx >= 1_000) return `USh ${(ugx / 1_000).toFixed(0)}K`;
  return `USh ${ugx.toLocaleString()}`;
}

export default function AnalyticsPage() {
  const { adminEntry } = useAdminAccess();
  const canSeeRevenue = isSuperAdmin(adminEntry) || hasPageAccess(adminEntry, "finance");

  const [orders, setOrders] = useState<Order[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
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

      setOrders(
        orderSnap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            items: data.items ?? [],
            totalUsd: data.totalUsd ?? 0,
            status: data.status ?? "pending",
            createdAt: data.createdAt?.toDate?.() ?? null,
          };
        })
      );
      setProductCount(productSnap.size);
      setCustomerCount(userSnap.size);
      if (rateSnap.exists()) setRate(rateSnap.data()?.usdToUgx ?? 3780);
    } catch (e) {
      console.error("Analytics fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  // ─── Computed metrics ────────────────────────────────────────────────────────

  const currentYear = new Date().getFullYear();
  const completedOrders = orders.filter((o) => o.status === "completed");
  const totalRevenueUsd = completedOrders.reduce((s, o) => s + o.totalUsd, 0);
  const totalOrders = orders.length;
  const avgOrderValueUsd = totalOrders > 0 ? totalRevenueUsd / completedOrders.length : 0;

  // Monthly revenue (completed) for current year
  const monthlyRevenue = Array(12).fill(0);
  completedOrders.forEach((o) => {
    if (o.createdAt && o.createdAt.getFullYear() === currentYear) {
      monthlyRevenue[o.createdAt.getMonth()] += o.totalUsd * rate;
    }
  });
  const revenueInMillions = monthlyRevenue.map((v: number) => v / 1_000_000);
  const hasRevenueData = revenueInMillions.some((v: number) => v > 0);

  // Monthly order count for current year
  const monthlyOrderCount = Array(12).fill(0);
  orders.forEach((o) => {
    if (o.createdAt && o.createdAt.getFullYear() === currentYear) {
      monthlyOrderCount[o.createdAt.getMonth()]++;
    }
  });
  const hasOrderData = monthlyOrderCount.some((v: number) => v > 0);

  // Sales by category (from order items)
  const categoryMap: Record<string, number> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      const cat = item.category || "Other";
      categoryMap[cat] = (categoryMap[cat] || 0) + item.priceUsd * item.qty;
    });
  });
  const totalCatValue = Object.values(categoryMap).reduce((s, v) => s + v, 0) || 1;
  const salesByCategory: Segment[] = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, val]) => ({
      name,
      value: Math.round((val / totalCatValue) * 100),
      color: CAT_COLORS[name] || "#6b7280",
    }));
  const topCategory = salesByCategory[0];

  // Sparkline data: last 10 days of orders
  const now = Date.now();
  const dayBuckets = Array(10).fill(0);
  orders.forEach((o) => {
    if (!o.createdAt) return;
    const daysAgo = Math.floor((now - o.createdAt.getTime()) / 86_400_000);
    if (daysAgo >= 0 && daysAgo < 10) dayBuckets[9 - daysAgo]++;
  });
  const revBuckets = Array(10).fill(0);
  completedOrders.forEach((o) => {
    if (!o.createdAt) return;
    const daysAgo = Math.floor((now - o.createdAt.getTime()) / 86_400_000);
    if (daysAgo >= 0 && daysAgo < 10) revBuckets[9 - daysAgo] += o.totalUsd;
  });

  // KPI cards
  const kpis = [
    {
      label: "Revenue",
      value: canSeeRevenue ? formatUgx(totalRevenueUsd, rate) : "••••••",
      detail: canSeeRevenue ? `${completedOrders.length} completed` : "Restricted",
      trend: "up" as const,
      spark: canSeeRevenue ? revBuckets : [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    },
    {
      label: "Orders",
      value: totalOrders.toLocaleString(),
      detail: "all time",
      trend: "up" as const,
      spark: dayBuckets,
    },
    {
      label: "Avg. Order Value",
      value: canSeeRevenue ? (avgOrderValueUsd > 0 ? formatUgx(avgOrderValueUsd, rate) : "—") : "••••••",
      detail: canSeeRevenue ? "per completed order" : "Restricted",
      trend: avgOrderValueUsd > 0 ? ("up" as const) : ("down" as const),
      spark: canSeeRevenue ? revBuckets.map((v, i) => (dayBuckets[i] > 0 ? v / dayBuckets[i] : 0)) : [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    },
    {
      label: "Products",
      value: productCount.toLocaleString(),
      detail: `${customerCount} customers`,
      trend: "up" as const,
      spark: dayBuckets,
    },
  ];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-mercury" />
      </div>
    );
  }

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="Analytics"
        subtitle="Track store performance and customer trends"
        action={
          <button
            onClick={() => {
              import("@/lib/exportCsv").then(({ exportToCsv }) => {
                exportToCsv("mercury-analytics", kpis.map((s) => ({
                  metric: s.label,
                  value: s.value,
                  detail: s.detail,
                })));
              });
            }}
            className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
          >
            <Download size={15} />
            Export
          </button>
        }
      />

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const up = k.trend === "up";
          const color = up ? "#16a34a" : "#e11d48";
          return (
            <div key={k.label} className="admin-card p-5">
              <p className="text-[13px] text-muted">{k.label}</p>
              <div className="mt-2 flex items-end justify-between">
                <div>
                  <p className="text-2xl font-extrabold tracking-tight text-ink">
                    {k.value}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    {up ? (
                      <TrendingUp size={14} style={{ color }} />
                    ) : (
                      <TrendingDown size={14} style={{ color }} />
                    )}
                    <span className="text-xs text-muted">{k.detail}</span>
                  </div>
                </div>
                <Sparkline data={k.spark} color={color} width={80} height={36} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue trend */}
      <section className="admin-card relative mt-6 p-5 overflow-hidden">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink">Revenue Overview</h3>
            <p className="text-xs text-muted">Monthly completed revenue (USh, millions) — {currentYear}</p>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-ink">
            {canSeeRevenue ? formatUgx(totalRevenueUsd, rate) : "••••••"}
          </span>
        </div>

        {canSeeRevenue ? (
          hasRevenueData ? (
            <AreaChart months={MONTHS} values={revenueInMillions} color="#1f3e97" unit="M" decimals={2} />
          ) : (
            <p className="py-16 text-center text-sm text-muted">
              No completed revenue this year yet — chart will populate with real data.
            </p>
          )
        ) : (
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

      {/* Sales by category */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="admin-card p-5">
          <h3 className="mb-4 text-lg font-bold text-ink">Sales by Category</h3>
          {salesByCategory.length > 0 ? (
            <DonutChart
              data={salesByCategory}
              centerValue={`${topCategory?.value ?? 0}%`}
              centerLabel={topCategory?.name ?? "—"}
            />
          ) : (
            <p className="py-8 text-center text-sm text-muted">No sales data yet</p>
          )}
        </section>

        <section className="admin-card p-5">
          <h3 className="mb-4 text-lg font-bold text-ink">Store Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-[#eaf1fc] p-4">
              <p className="text-[12px] text-muted">Products</p>
              <p className="text-xl font-extrabold text-ink">{productCount}</p>
            </div>
            <div className="rounded-2xl bg-[#eef7ee] p-4">
              <p className="text-[12px] text-muted">Customers</p>
              <p className="text-xl font-extrabold text-ink">{customerCount}</p>
            </div>
            <div className="rounded-2xl bg-[#fef3e2] p-4">
              <p className="text-[12px] text-muted">Total Orders</p>
              <p className="text-xl font-extrabold text-ink">{totalOrders}</p>
            </div>
            <div className="rounded-2xl bg-[#f3e8ff] p-4">
              <p className="text-[12px] text-muted">Completed</p>
              <p className="text-xl font-extrabold text-ink">{completedOrders.length}</p>
            </div>
          </div>
        </section>
      </div>

      {/* Orders by month */}
      <section className="admin-card mt-6 p-5">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink">Orders by Month</h3>
            <p className="text-xs text-muted">Total orders placed per month — {currentYear}</p>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-ink">
            {totalOrders.toLocaleString()}
          </span>
        </div>
        {hasOrderData ? (
          <BarChart labels={MONTHS} values={monthlyOrderCount} color="#1f3e97" />
        ) : (
          <p className="py-16 text-center text-sm text-muted">
            No orders this year yet — chart will populate with real data.
          </p>
        )}
      </section>
    </div>
  );
}
