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
import { TrendingUp, TrendingDown, Download } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import AreaChart from "@/components/admin/charts/AreaChart";
import BarChart from "@/components/admin/charts/BarChart";
import DonutChart from "@/components/admin/charts/DonutChart";
import { db } from "@/lib/firestore";
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
  userId: string;
  items: OrderItem[];
  totalUsd: number;
  paymentMethod: string;
  status: string;
  createdAt: Date | null;
};

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

const TXN_STATUS: Record<string, string> = {
  completed: "bg-[#e7f6ee] text-[#16a34a]",
  pending: "bg-[#fff3dc] text-[#b45309]",
  processing: "bg-[#eaf1fc] text-[#1f3e97]",
  cancelled: "bg-[#fde8ea] text-[#e11d48]",
};

const PAYMENT_COLORS: Record<string, string> = {
  "MTN Mobile Money": "#ffcc00",
  "Airtel Money": "#e11d48",
  "Card": "#0e7490",
  "Bank Transfer": "#1f3e97",
  "Cash on Delivery": "#9f1239",
};

function formatUgx(usd: number, rate: number) {
  const ugx = Math.round(usd * rate);
  if (ugx >= 1_000_000) return `USh ${(ugx / 1_000_000).toFixed(2)}M`;
  if (ugx >= 1_000) return `USh ${(ugx / 1_000).toFixed(0)}K`;
  return `USh ${ugx.toLocaleString()}`;
}

function formatDate(date: Date | null) {
  if (!date) return "—";
  return date.toLocaleDateString("en-UG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function FinancePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [rate, setRate] = useState(3780);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orderSnap, rateSnap] = await Promise.all([
        getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"))),
        getDoc(doc(db, "config", "rate")),
      ]);

      setOrders(
        orderSnap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            userId: data.userId ?? "",
            items: data.items ?? [],
            totalUsd: data.totalUsd ?? 0,
            paymentMethod: data.paymentMethod ?? "Unknown",
            status: data.status ?? "pending",
            createdAt: data.createdAt?.toDate?.() ?? null,
          } as Order;
        })
      );

      if (rateSnap.exists()) {
        setRate(rateSnap.data()?.usdToUgx ?? 3780);
      }
    } catch (e) {
      console.error("Finance fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  // ─── Computed KPIs ──────────────────────────────────────────────────────────

  const completedOrders = orders.filter((o) => o.status === "completed");
  const pendingOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "processing"
  );
  const cancelledOrders = orders.filter((o) => o.status === "cancelled");

  const grossRevenueUsd = orders.reduce((sum, o) => sum + o.totalUsd, 0);
  const netRevenueUsd = completedOrders.reduce((sum, o) => sum + o.totalUsd, 0);
  const refundsUsd = cancelledOrders.reduce((sum, o) => sum + o.totalUsd, 0);
  const outstandingUsd = pendingOrders.reduce((sum, o) => sum + o.totalUsd, 0);

  // ─── Monthly revenue (current year) ────────────────────────────────────────

  const currentYear = new Date().getFullYear();
  const monthlyRevenue = Array(12).fill(0);
  completedOrders.forEach((o) => {
    if (o.createdAt && o.createdAt.getFullYear() === currentYear) {
      monthlyRevenue[o.createdAt.getMonth()] += o.totalUsd * rate;
    }
  });
  // Convert to millions for chart — ensure at least a tiny value so charts don't get all-zeros
  const revenueInMillions = monthlyRevenue.map((v) => v / 1_000_000);
  const hasRevenueData = revenueInMillions.some((v) => v > 0);
  const safeRevenueValues = hasRevenueData
    ? revenueInMillions
    : revenueInMillions.map((_, i) => 0.001 * (i + 1)); // minimal placeholder to avoid NaN

  // ─── Monthly order count (for bar chart) ───────────────────────────────────

  const monthlyOrderCount = Array(12).fill(0);
  orders.forEach((o) => {
    if (o.createdAt && o.createdAt.getFullYear() === currentYear) {
      monthlyOrderCount[o.createdAt.getMonth()]++;
    }
  });
  const hasOrderData = monthlyOrderCount.some((v: number) => v > 0);
  const safeOrderValues = hasOrderData
    ? monthlyOrderCount
    : monthlyOrderCount.map((_: number, i: number) => 0.01 * (i + 1));

  // ─── Payment method breakdown ──────────────────────────────────────────────

  const paymentMethodMap: Record<string, number> = {};
  orders.forEach((o) => {
    const method = o.paymentMethod || "Unknown";
    paymentMethodMap[method] = (paymentMethodMap[method] || 0) + 1;
  });

  const totalOrders = orders.length || 1;
  const paymentMethods: Segment[] = Object.entries(paymentMethodMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      value: Math.round((count / totalOrders) * 100),
      color: PAYMENT_COLORS[name] || "#7c3aed",
    }));

  const topMethod = paymentMethods[0];

  // ─── KPI cards ─────────────────────────────────────────────────────────────

  const kpis = [
    {
      label: "Gross Revenue",
      value: formatUgx(grossRevenueUsd, rate),
      detail: `${orders.length} orders`,
      trend: "up" as const,
    },
    {
      label: "Net Revenue",
      value: formatUgx(netRevenueUsd, rate),
      detail: `${completedOrders.length} completed`,
      trend: "up" as const,
    },
    {
      label: "Refunds / Cancelled",
      value: formatUgx(refundsUsd, rate),
      detail: `${cancelledOrders.length} orders`,
      trend: "down" as const,
    },
    {
      label: "Outstanding",
      value: formatUgx(outstandingUsd, rate),
      detail: `${pendingOrders.length} pending`,
      trend: pendingOrders.length > 0 ? ("up" as const) : ("down" as const),
    },
  ];

  // ─── Recent transactions (show latest 10) ──────────────────────────────────

  const recentTransactions = orders.slice(0, 10);

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
        title="Financial Reports"
        subtitle="Revenue, payments and transactions from real orders"
        action={
          <button
            onClick={() => {
              import("@/lib/exportCsv").then(({ exportToCsv }) => {
                exportToCsv("mercury-financial-report", orders.map((o) => ({
                  id: o.id,
                  customer: o.userName || o.userEmail,
                  total_usd: o.totalUsd,
                  total_ugx: Math.round(o.totalUsd * rate),
                  status: o.status,
                  payment: o.paymentMethod,
                  date: o.createdAt.toISOString(),
                })));
              });
            }}
            className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
          >
            <Download size={16} />
            Export
          </button>
        }
      />

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-2 gap-5 xl:grid-cols-4">
        {kpis.map((k) => {
          const up = k.trend === "up";
          const color = up ? "#16a34a" : "#e11d48";
          return (
            <div key={k.label} className="admin-card p-5">
              <p className="text-[13px] text-muted">{k.label}</p>
              <p className="mt-1 text-2xl font-extrabold tracking-tight text-ink">
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
          );
        })}
      </div>

      {/* Revenue chart */}
      <section className="admin-card mt-6 p-5">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink">Revenue Overview</h3>
            <p className="text-xs text-muted">
              Monthly completed revenue (USh, millions) — {currentYear}
            </p>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-ink">
            {formatUgx(netRevenueUsd, rate)}
          </span>
        </div>
        {hasRevenueData ? (
          <AreaChart
            months={MONTHS}
            values={revenueInMillions}
            color="#1f3e97"
            unit="M"
            decimals={2}
          />
        ) : (
          <p className="py-16 text-center text-sm text-muted">
            No completed orders this year yet — chart will populate with real data.
          </p>
        )}
      </section>

      {/* Orders per month + Payment methods */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="admin-card p-5">
          <div className="mb-2">
            <h3 className="text-lg font-bold text-ink">Orders per Month</h3>
            <p className="text-xs text-muted">All orders — {currentYear}</p>
          </div>
          {hasOrderData ? (
            <BarChart
              labels={MONTHS}
              values={monthlyOrderCount}
              color="#0e7490"
              unit=""
            />
          ) : (
            <p className="py-16 text-center text-sm text-muted">
              No orders this year yet — chart will populate with real data.
            </p>
          )}
        </section>

        <section className="admin-card p-5">
          <h3 className="mb-4 text-lg font-bold text-ink">Payment Methods</h3>
          {paymentMethods.length > 0 ? (
            <DonutChart
              data={paymentMethods}
              centerValue={`${topMethod?.value ?? 0}%`}
              centerLabel={topMethod?.name ?? "—"}
            />
          ) : (
            <p className="py-8 text-center text-sm text-muted">No order data yet</p>
          )}
        </section>
      </div>

      {/* Transactions table */}
      <section className="admin-card mt-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink">Recent Transactions</h3>
          <span className="text-xs text-muted">{orders.length} total orders</span>
        </div>

        {recentTransactions.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted">
            No transactions yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-[12px] font-medium text-muted">
                  <th className="pb-3 pl-1 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Payment Method</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Items</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-line/70 text-sm last:border-0"
                  >
                    <td className="py-3 pl-1 font-semibold text-ink">
                      #{o.id.slice(0, 8)}
                    </td>
                    <td className="py-3 text-ink">{o.paymentMethod}</td>
                    <td className="py-3 text-muted">{formatDate(o.createdAt)}</td>
                    <td className="py-3 text-muted">
                      {o.items.reduce((s, i) => s + i.qty, 0)} items
                    </td>
                    <td className="py-3">
                      <span className="font-semibold text-ink">
                        {formatUgx(o.totalUsd, rate)}
                      </span>
                      <span className="ml-1 text-[11px] text-muted">
                        (${o.totalUsd.toFixed(0)})
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
                          TXN_STATUS[o.status] ?? "bg-surface-soft text-muted"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
