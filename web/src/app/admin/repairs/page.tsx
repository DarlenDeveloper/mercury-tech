import { Plus, Search, ListFilter } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  REPAIR_SUMMARY,
  REPAIR_TICKETS,
  type RepairStatus,
} from "@/lib/adminData";

const STATUS_STYLES: Record<RepairStatus, string> = {
  Received: "bg-surface-soft text-muted",
  "In Progress": "bg-[#e8eefc] text-mercury",
  "Awaiting Parts": "bg-[#fff3dc] text-[#b45309]",
  Completed: "bg-[#e7f6ee] text-[#16a34a]",
};

const TABS = ["All", "Received", "In Progress", "Awaiting Parts", "Completed"];

export default function RepairsPage() {
  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="Repairs & Services"
        subtitle="Track repair tickets and on-site service jobs"
        action={
          <button className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black">
            <Plus size={16} />
            New Ticket
          </button>
        }
      />

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {REPAIR_SUMMARY.map((s) => (
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
            placeholder="Search tickets or customers"
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
                <th className="pb-3 pl-1 font-medium">Ticket</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Device</th>
                <th className="pb-3 font-medium">Service</th>
                <th className="pb-3 font-medium">Technician</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {REPAIR_TICKETS.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-line/70 text-sm last:border-0"
                >
                  <td className="py-3 pl-1 font-semibold text-ink">{t.id}</td>
                  <td className="py-3 text-ink">{t.customer}</td>
                  <td className="py-3 text-muted">{t.device}</td>
                  <td className="py-3 text-muted">{t.service}</td>
                  <td className="py-3 text-muted">{t.technician}</td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[t.status]}`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 text-muted">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
