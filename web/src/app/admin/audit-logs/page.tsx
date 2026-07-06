import { Search, Download } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { AUDIT_LOGS } from "@/lib/adminData";

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("");
}

export default function AuditLogsPage() {
  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="Audit Logs"
        subtitle="A record of admin activity across the store"
        action={
          <button className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black">
            <Download size={16} />
            Export
          </button>
        }
      />

      {/* Search */}
      <div className="mt-6 flex h-10 items-center gap-2 rounded-full bg-white px-4">
        <Search size={16} className="text-muted" />
        <input
          placeholder="Search by member, action or target"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
        />
      </div>

      {/* Table */}
      <section className="admin-card mt-5 p-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-[12px] font-medium text-muted">
                <th className="pb-3 pl-1 font-medium">Member</th>
                <th className="pb-3 font-medium">Action</th>
                <th className="pb-3 font-medium">Target</th>
                <th className="pb-3 font-medium">IP Address</th>
                <th className="pb-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {AUDIT_LOGS.map((l, i) => (
                <tr
                  key={i}
                  className="border-b border-line/70 text-sm last:border-0"
                >
                  <td className="py-3 pl-1">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-soft text-[10px] font-bold text-ink">
                        {l.actor === "System" ? "SYS" : initials(l.actor)}
                      </span>
                      <span className="font-medium text-ink">{l.actor}</span>
                    </div>
                  </td>
                  <td className="py-3 text-ink">{l.action}</td>
                  <td className="py-3 text-muted">{l.target}</td>
                  <td className="py-3 font-mono text-[12px] text-muted">{l.ip}</td>
                  <td className="py-3 text-muted">{l.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
