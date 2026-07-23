"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Check, X as XIcon, MessageSquare, MoreHorizontal, Trash2, Eye } from "lucide-react";
import { fetchQuotations, updateQuotation, deleteQuotation, type Quotation, type QuotationStatus } from "@/lib/quotations";
import { logAudit } from "@/lib/auditLog";
import { useAuth } from "@/components/AuthProvider";
import { useCurrency } from "@/components/CurrencyProvider";
import { useAdminAccess } from "@/components/admin/AdminGuard";
import { isSuperAdmin } from "@/lib/adminAccess";

const STATUS_STYLES: Record<QuotationStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  quoted: "bg-blue-50 text-blue-700",
  approved: "bg-[#e7f6ee] text-[#16a34a]",
  rejected: "bg-red-50 text-red-600",
};

export default function QuotationsPage() {
  const { user } = useAuth();
  const { format } = useCurrency();
  const { adminEntry } = useAdminAccess();
  const canDelete = isSuperAdmin(adminEntry);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | QuotationStatus>("all");
  const [selected, setSelected] = useState<Quotation | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [quotedPrice, setQuotedPrice] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    load();
  }, []);

  // Close the row options menu on outside click
  useEffect(() => {
    if (!activeMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [activeMenu]);

  const load = async () => {
    setLoading(true);
    try {
      setQuotations(await fetchQuotations());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, status: QuotationStatus) => {
    setBusy(true);
    try {
      await updateQuotation(id, {
        status,
        adminNote: adminNote.trim(),
        quotedPrice: quotedPrice ? Number(quotedPrice) : null,
      });
      logAudit({
        actor: user?.displayName || user?.email || "Unknown",
        actorId: user?.uid || "",
        action: "settings_updated",
        target: `Quotation ${id} → ${status}`,
      });
      load();
      setSelected(null);
      setAdminNote("");
      setQuotedPrice("");
    } finally {
      setBusy(false);
    }
  };

  const openDetail = (q: Quotation) => {
    setSelected(q);
    setAdminNote(q.adminNote);
    setQuotedPrice(q.quotedPrice?.toString() || "");
  };

  const handleDelete = async (q: Quotation) => {
    if (!canDelete) return; // super admins only
    if (!confirm(`Delete the quotation for "${q.productName}"? This cannot be undone.`)) return;
    setActiveMenu(null);
    try {
      await deleteQuotation(q.id);
      setQuotations((prev) => prev.filter((item) => item.id !== q.id));
      if (selected?.id === q.id) setSelected(null);
      logAudit({
        actor: user?.displayName || user?.email || "Unknown",
        actorId: user?.uid || "",
        action: "settings_updated",
        target: `Quotation deleted — ${q.productName} (${q.userName || q.userEmail})`,
      });
    } catch (e) {
      console.error("Failed to delete quotation:", e);
      alert("Could not delete the quotation. Please try again.");
    }
  };

  const filtered = quotations.filter((q) => {
    const matchStatus = filter === "all" || q.status === filter;
    const matchSearch =
      !search ||
      q.productName.toLowerCase().includes(search.toLowerCase()) ||
      q.userName.toLowerCase().includes(search.toLowerCase()) ||
      q.userEmail.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    all: quotations.length,
    pending: quotations.filter((q) => q.status === "pending").length,
    quoted: quotations.filter((q) => q.status === "quoted").length,
    approved: quotations.filter((q) => q.status === "approved").length,
    rejected: quotations.filter((q) => q.status === "rejected").length,
  };

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mercury">Sales</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink">Quotations</h1>
      <p className="mt-1 text-sm text-muted">
        {counts.pending} pending · {counts.quoted} quoted · {counts.approved} approved
      </p>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total" value={counts.all} />
        <StatCard label="Pending" value={counts.pending} color="amber" />
        <StatCard label="Quoted" value={counts.quoted} color="blue" />
        <StatCard label="Approved" value={counts.approved} color="green" />
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex h-10 flex-1 items-center gap-2 rounded-full bg-white px-4 border border-line">
          <Search size={16} className="text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product, customer..."
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(["all", "pending", "quoted", "approved", "rejected"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-medium capitalize transition ${
                filter === s ? "bg-ink text-white" : "bg-white border border-line text-ink hover:border-mercury"
              }`}
            >
              {s} ({counts[s]})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <section className="mt-5 rounded-2xl border border-line bg-white p-5">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-mercury" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted">No quotations found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-[12px] font-medium text-muted">
                  <th className="pb-3 pl-1 font-medium">Product</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Listed Price</th>
                  <th className="pb-3 font-medium">Quoted</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q) => (
                  <tr key={q.id} className="border-b border-line/70 text-sm last:border-0">
                    <td className="py-3 pl-1">
                      <p className="font-medium text-ink truncate max-w-[200px]">{q.productName}</p>
                    </td>
                    <td className="py-3">
                      <p className="text-ink">{q.userName || q.userEmail}</p>
                      <p className="text-[11px] text-muted">{q.userPhone || q.userEmail}</p>
                    </td>
                    <td className="py-3 text-ink">{format(q.productPrice)}</td>
                    <td className="py-3 text-ink font-semibold">
                      {q.quotedPrice ? format(q.quotedPrice) : "—"}
                    </td>
                    <td className="py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${STATUS_STYLES[q.status]}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3 text-muted text-[12px]">
                      {q.createdAt.toLocaleDateString("en-UG", { month: "short", day: "numeric" })}
                    </td>
                    <td className="relative py-3 text-right">
                      <button
                        onClick={() => setActiveMenu(activeMenu === q.id ? null : q.id)}
                        className="rounded-lg p-1.5 text-muted transition hover:bg-surface-soft hover:text-ink"
                        aria-label="Options"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      {activeMenu === q.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-10 z-20 w-40 rounded-xl border border-line bg-white p-1.5 shadow-lg"
                        >
                          <button
                            onClick={() => { setActiveMenu(null); openDetail(q); }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink hover:bg-surface-soft"
                          >
                            <Eye size={14} /> View / Manage
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(q)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-ink">Quote Details</h3>
              <button onClick={() => setSelected(null)} className="text-muted hover:text-ink">
                <XIcon size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <Row label="Product" value={selected.productName} />
              <Row label="Customer" value={`${selected.userName} (${selected.userEmail})`} />
              <Row label="Listed Price" value={format(selected.productPrice)} />
              {selected.message && <Row label="Customer note" value={selected.message} />}
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink">Quoted Price (UGX)</label>
                <input
                  type="number"
                  value={quotedPrice}
                  onChange={(e) => setQuotedPrice(e.target.value)}
                  placeholder="Your offered price"
                  className="h-11 w-full rounded-xl border border-line bg-[#FAFBFC] px-4 text-sm text-ink outline-none focus:border-mercury"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink">Admin Note</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Internal note or message to customer"
                  rows={2}
                  className="w-full rounded-xl border border-line bg-[#FAFBFC] px-4 py-3 text-sm text-ink outline-none resize-none focus:border-mercury"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => handleUpdate(selected.id, "rejected")}
                disabled={busy}
                className="flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-40"
              >
                <XIcon size={14} /> Reject
              </button>
              <button
                onClick={() => handleUpdate(selected.id, "quoted")}
                disabled={busy || !quotedPrice}
                className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition hover:border-mercury hover:text-mercury disabled:opacity-40"
              >
                <MessageSquare size={14} /> Send Quote
              </button>
              <button
                onClick={() => handleUpdate(selected.id, "approved")}
                disabled={busy}
                className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-40"
              >
                <Check size={14} /> Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  const bg = color === "amber" ? "#fef3e2" : color === "blue" ? "#eaf1fc" : color === "green" ? "#eef7ee" : "#f3e8ff";
  return (
    <div className="rounded-2xl border border-line bg-white p-5" style={{ backgroundColor: bg }}>
      <p className="text-[12px] text-muted">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tracking-tight text-ink">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-28 shrink-0 text-[12px] font-medium text-muted">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
