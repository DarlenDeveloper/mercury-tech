import { Search, ListFilter, Download, MoreHorizontal } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  ADMIN_ORDERS,
  ORDER_SUMMARY,
  type OrderStatus,
} from "@/lib/adminData";

const STATUS_STYLES: Record<OrderStatus, string> = {
  Completed: "bg-[#e7f6ee] text-[#16a34a]",
  Processing: "bg-[#e8eefc] text-mercury",
  Pending: "bg-[#fff3dc] text-[#b45309]",
  Cancelled: "bg-[#fde8ea] text-[#e11d48]",
};

const TABS: (OrderStatus | "All")[] = [
  "All",
  "Pending",
  "Processing",
  "Completed",
  "Cancelled",
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

export default function OrdersPage() {
  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="Orders"
        subtitle="Track and manage customer orders"
        action={
          <button className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black">
            <Download size={16} />
            Export
          </button>
        }
      />

      {/* Summary chips */}
      <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {ORDER_SUMMARY.map((s) => (
          <div key={s.label} className="admin-card p-5">
            <p className="text-[13px] text-muted">{s.label}</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-ink">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
          {TABS.map((t, i) => (
            <button
              key={t}
              className={`whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition ${
                i === 0
                  ? "bg-ink text-white"
                  : "bg-white text-muted shadow-sm hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex h-10 flex-1 items-center gap-2 rounded-full bg-white px-4 shadow-sm">
          <Search size={16} className="text-muted" />
          <input
            placeholder="Search by order ID or customer"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          />
        </div>
        <button className="flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-ink shadow-sm transition hover:text-mercury">
          <ListFilter size={15} />
          Filters
        </button>
      </div>

      {/* Orders table */}
      <section className="admin-card mt-5 p-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-[12px] font-medium text-muted">
                <th className="pb-3 pl-1 font-medium">Order ID</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Items</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {ADMIN_ORDERS.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-line/70 text-sm last:border-0"
                >
                  <td className="py-3 pl-1 font-semibold text-ink">{o.id}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mercury text-[11px] font-bold text-white">
                        {initials(o.customer)}
                      </span>
                      <div>
                        <p className="font-medium text-ink">{o.customer}</p>
                        <p className="text-[11px] text-muted">{o.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-muted">{o.date}</td>
                  <td className="py-3 text-ink">{o.items}</td>
                  <td className="py-3 font-semibold text-ink">{o.total}</td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[o.status]}`}
                    >
                      {o.status}
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
