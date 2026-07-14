"use client";

import { useState, useEffect } from "react";
import { Search, Download, RefreshCw } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { fetchAuditLogs, actionLabel, type AuditLogEntry, type AuditAction } from "@/lib/auditLog";

function initials(name: string) {
  if (!name || name === "System") return "SYS";
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-UG", { month: "short", day: "numeric", year: "numeric" });
}

function actionColor(action: AuditAction): string {
  if (action === "login" || action === "logout") return "bg-blue-50 text-blue-700";
  if (action.includes("deleted")) return "bg-red-50 text-red-600";
  if (action.includes("created")) return "bg-green-50 text-green-700";
  if (action.includes("updated") || action.includes("toggled")) return "bg-amber-50 text-amber-700";
  return "bg-gray-50 text-gray-600";
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchAuditLogs(200);
      setLogs(data);
    } catch (e) {
      console.error("Failed to load audit logs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter((l) => {
    const matchesSearch =
      search === "" ||
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.target.toLowerCase().includes(search.toLowerCase()) ||
      actionLabel(l.action).toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterAction === "all" || l.action === filterAction;
    return matchesSearch && matchesFilter;
  });

  const actionTypes: AuditAction[] = [
    "login", "logout", "page_view",
    "product_created", "product_updated", "product_deleted",
    "category_created", "category_updated", "category_deleted",
    "rate_updated", "settings_updated",
  ];

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="Audit Logs"
        subtitle="A record of all admin activity across the store"
        action={
          <button
            onClick={loadLogs}
            className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        }
      />

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="admin-card p-4" style={{ backgroundColor: "#eaf1fc" }}>
          <p className="text-[12px] text-muted">Total Logs</p>
          <p className="text-xl font-extrabold text-ink">{logs.length}</p>
        </div>
        <div className="admin-card p-4" style={{ backgroundColor: "#eef7ee" }}>
          <p className="text-[12px] text-muted">Logins</p>
          <p className="text-xl font-extrabold text-ink">
            {logs.filter((l) => l.action === "login").length}
          </p>
        </div>
        <div className="admin-card p-4" style={{ backgroundColor: "#fef3e2" }}>
          <p className="text-[12px] text-muted">Edits</p>
          <p className="text-xl font-extrabold text-ink">
            {logs.filter((l) => l.action.includes("updated") || l.action.includes("created")).length}
          </p>
        </div>
        <div className="admin-card p-4" style={{ backgroundColor: "#fde8ea" }}>
          <p className="text-[12px] text-muted">Deletions</p>
          <p className="text-xl font-extrabold text-ink">
            {logs.filter((l) => l.action.includes("deleted")).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex h-10 flex-1 items-center gap-2 rounded-full bg-white px-4">
          <Search size={16} className="text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by member, action or target"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          />
        </div>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="h-10 rounded-full bg-white px-4 text-sm text-ink outline-none"
        >
          <option value="all">All Actions</option>
          {actionTypes.map((a) => (
            <option key={a} value={a}>{actionLabel(a)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <section className="admin-card mt-5 p-5">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-mercury" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted">
            {logs.length === 0 ? "No audit logs yet. Actions will be recorded as admins use the system." : "No logs match your search."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-[12px] font-medium text-muted">
                  <th className="pb-3 pl-1 font-medium">Member</th>
                  <th className="pb-3 font-medium">Action</th>
                  <th className="pb-3 font-medium">Target</th>
                  <th className="pb-3 font-medium">Details</th>
                  <th className="pb-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-b border-line/70 text-sm last:border-0">
                    <td className="py-3 pl-1">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-soft text-[10px] font-bold text-ink">
                          {initials(l.actor)}
                        </span>
                        <span className="font-medium text-ink">{l.actor}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${actionColor(l.action)}`}>
                        {actionLabel(l.action)}
                      </span>
                    </td>
                    <td className="py-3 text-muted max-w-[200px] truncate">{l.target}</td>
                    <td className="py-3 text-[12px] text-muted max-w-[150px] truncate">{l.details}</td>
                    <td className="py-3 text-muted whitespace-nowrap">{formatTime(l.timestamp)}</td>
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
