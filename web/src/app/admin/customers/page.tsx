import { Search, ListFilter, Download, ChevronRight } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  ADMIN_CUSTOMERS,
  CUSTOMER_SUMMARY,
  type AdminCustomer,
} from "@/lib/adminData";

const STATUS_STYLES: Record<AdminCustomer["status"], string> = {
  Active: "bg-[#e7f6ee] text-[#16a34a]",
  New: "bg-[#e8eefc] text-mercury",
  Inactive: "bg-surface-soft text-muted",
};

const TABS = ["All", "Active", "New", "Inactive"];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("");
}

export default function CustomersPage() {
  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="Customers"
        subtitle="View shoppers, orders and spending"
        action={
          <button className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black">
            <Download size={16} />
            Export
          </button>
        }
      />

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {CUSTOMER_SUMMARY.map((s) => (
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
                  : "bg-white text-muted hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex h-10 flex-1 items-center gap-2 rounded-full bg-white px-4">
          <Search size={16} className="text-muted" />
          <input
            placeholder="Search customers by name or email"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          />
        </div>
        <button className="flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-ink transition hover:text-mercury">
          <ListFilter size={15} />
          Filters
        </button>
      </div>

      {/* Table */}
      <section className="admin-card mt-5 p-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-[12px] font-medium text-muted">
                <th className="pb-3 pl-1 font-medium">Customer</th>
                <th className="pb-3 font-medium">Location</th>
                <th className="pb-3 font-medium">Orders</th>
                <th className="pb-3 font-medium">Total Spent</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Joined</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {ADMIN_CUSTOMERS.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-line/70 text-sm last:border-0"
                >
                  <td className="py-3 pl-1">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold text-white"
                        style={{ backgroundColor: c.color }}
                      >
                        {initials(c.name)}
                      </span>
                      <div>
                        <p className="font-medium text-ink">{c.name}</p>
                        <p className="text-[11px] text-muted">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-muted">{c.location}</td>
                  <td className="py-3 text-ink">{c.orders}</td>
                  <td className="py-3 font-semibold text-ink">{c.spent}</td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[c.status]}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 text-muted">{c.joined}</td>
                  <td className="py-3 text-right">
                    <button
                      aria-label="View customer"
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-mercury transition hover:bg-surface-soft"
                    >
                      Details
                      <ChevronRight size={14} />
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
