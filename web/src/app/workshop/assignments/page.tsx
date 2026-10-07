"use client";

import { useEffect, useMemo, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { Check, Clock, FileText, Wrench, X } from "@/components/admin/WorkspaceIcons";
import { useAuth } from "@/components/AuthProvider";
import {
  fetchTechnicianAssignments,
  REPAIR_STATUS_LABELS,
  updateAssignedJob,
  type RepairTicket,
} from "@/lib/repairs";

type Filter = "active" | "completed" | "all";

const STATUS_STYLES: Record<RepairTicket["status"], string> = {
  received: "bg-slate-100 text-slate-600",
  awaiting_payment: "bg-amber-50 text-amber-700",
  ready_for_assignment: "bg-teal-50 text-teal-700",
  in_progress: "bg-[#e8eefc] text-mercury",
  awaiting_parts: "bg-[#fff3dc] text-[#b45309]",
  completed: "bg-[#e7f6ee] text-[#16845a]",
  collected: "bg-slate-100 text-slate-600",
};

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<RepairTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("active");
  const [busyId, setBusyId] = useState("");
  const [completing, setCompleting] = useState<RepairTicket | null>(null);
  const [completionNotes, setCompletionNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      setAssignments(await fetchTechnicianAssignments(user.email));
    } catch {
      setError("We could not load your assignments. Refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // The signed-in email is the assignment identity stored on repair tickets.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  const counts = useMemo(() => ({
    ready: assignments.filter(item => item.status === "ready_for_assignment").length,
    active: assignments.filter(item => ["in_progress", "awaiting_parts"].includes(item.status)).length,
    completed: assignments.filter(item => ["completed", "collected"].includes(item.status)).length,
  }), [assignments]);

  const visible = assignments.filter(item => {
    if (filter === "completed") return ["completed", "collected"].includes(item.status);
    if (filter === "active") return !["completed", "collected"].includes(item.status);
    return true;
  });

  const startJob = async (ticket: RepairTicket) => {
    setBusyId(ticket.id);
    setError("");
    setSuccess("");
    try {
      await updateAssignedJob(ticket.id, "start");
      setSuccess(`${ticket.trackingReference || ticket.id} is now in progress.`);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The job could not be started.");
    } finally {
      setBusyId("");
    }
  };

  const completeJob = async () => {
    if (!completing) return;
    setBusyId(completing.id);
    setError("");
    setSuccess("");
    try {
      await updateAssignedJob(completing.id, "complete", completionNotes.trim());
      setSuccess(`${completing.trackingReference || completing.id} has been completed.`);
      setCompleting(null);
      setCompletionNotes("");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The job could not be completed.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="My Assignments"
        subtitle="Start assigned service jobs and mark completed work as ready for collection"
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Ready to start" value={counts.ready} tone="teal" />
        <Stat label="In progress" value={counts.active} tone="blue" />
        <Stat label="Completed" value={counts.completed} tone="green" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(["active", "completed", "all"] as Filter[]).map(item => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-full px-4 py-2 text-xs font-semibold capitalize transition ${filter === item ? "bg-ink text-white" : "border border-line bg-white text-muted hover:border-mercury hover:text-mercury"}`}
          >
            {item}
          </button>
        ))}
      </div>

      {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {success && <p role="status" className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{success}</p>}

      {loading ? (
        <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-mercury" /></div>
      ) : visible.length === 0 ? (
        <section className="mt-6 rounded-3xl border border-line bg-white px-6 py-16 text-center">
          <Wrench size={42} className="mx-auto text-slate-300" />
          <h2 className="mt-4 text-lg font-semibold text-ink">No {filter === "all" ? "" : filter} assignments</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">New service jobs will appear here as soon as the workshop assigns them to you.</p>
        </section>
      ) : (
        <section className="mt-6 grid gap-4 xl:grid-cols-2">
          {visible.map(ticket => (
            <article key={ticket.id} className="rounded-3xl border border-line bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mercury">{ticket.service}</p>
                  <h2 className="mt-2 text-lg font-semibold text-ink">{ticket.device}</h2>
                  <p className="mt-1 text-xs text-muted">{ticket.trackingReference || ticket.id}</p>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${STATUS_STYLES[ticket.status]}`}>{REPAIR_STATUS_LABELS[ticket.status]}</span>
              </div>

              <div className="mt-5 rounded-2xl bg-[#f7f8fa] p-4">
                <p className="text-xs font-semibold text-ink">{ticket.userName || "Customer"}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{ticket.issue}</p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                {ticket.assignedBy && <span className="rounded-full bg-mercury/10 px-2.5 py-1 font-semibold text-mercury">Assigned by {ticket.assignedBy}</span>}
                {ticket.assignedAt && <span>Assigned {ticket.assignedAt.toLocaleDateString("en-UG", { day: "numeric", month: "short" })}</span>}
              </div>

              {ticket.startedBy && (
                <p className="mt-4 flex items-center gap-2 text-xs text-muted"><Clock size={16} />Started by {ticket.startedBy}{ticket.startedAt ? ` · ${ticket.startedAt.toLocaleString("en-UG", { dateStyle: "medium", timeStyle: "short" })}` : ""}</p>
              )}
              {ticket.completionNotes && (
                <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold text-emerald-800"><FileText size={16} />Completion note</p>
                  <p className="mt-2 text-sm leading-6 text-emerald-950">{ticket.completionNotes}</p>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                {ticket.status === "ready_for_assignment" && (
                  <button type="button" disabled={busyId === ticket.id} onClick={() => startJob(ticket)} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-mercury text-sm font-semibold text-white transition hover:bg-mercury-dark disabled:opacity-50">
                    <Clock size={18} variant="Bold" />{busyId === ticket.id ? "Starting…" : "Start job"}
                  </button>
                )}
                {["in_progress", "awaiting_parts"].includes(ticket.status) && (
                  <button type="button" disabled={busyId === ticket.id} onClick={() => { setCompleting(ticket); setCompletionNotes(""); setError(""); }} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-ink text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50">
                    <Check size={18} variant="Bold" />Complete job
                  </button>
                )}
                {["completed", "collected"].includes(ticket.status) && <p className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-50 text-sm font-semibold text-emerald-800"><Check size={18} variant="Bold" />Work completed</p>}
              </div>
            </article>
          ))}
        </section>
      )}

      {completing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm" onClick={() => !busyId && setCompleting(null)}>
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl" onClick={event => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mercury">Complete job</p>
                <h2 className="mt-2 text-xl font-semibold text-ink">{completing.device}</h2>
                <p className="mt-1 text-xs text-muted">{completing.trackingReference || completing.id}</p>
              </div>
              <button type="button" aria-label="Close" disabled={!!busyId} onClick={() => setCompleting(null)} className="rounded-full p-2 text-muted transition hover:bg-surface-soft hover:text-ink"><X size={18} /></button>
            </div>
            <label className="mt-6 block text-sm font-semibold text-ink">
              Completion notes <span className="font-normal text-muted">(optional)</span>
              <textarea
                value={completionNotes}
                maxLength={3000}
                rows={5}
                onChange={event => setCompletionNotes(event.target.value)}
                placeholder="Describe the work completed, parts fitted, or anything the collection team should know."
                className="mt-2 w-full resize-y rounded-2xl border border-line bg-[#fafbfc] px-4 py-3 text-sm font-normal text-ink outline-none transition focus:border-mercury focus:ring-2 focus:ring-mercury/10"
              />
            </label>
            <p className="mt-1 text-right text-[11px] text-muted">{completionNotes.length}/3000</p>
            {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
            <button type="button" disabled={busyId === completing.id} onClick={completeJob} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50">
              <Check size={19} variant="Bold" />{busyId === completing.id ? "Completing…" : "Complete job"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "teal" | "blue" | "green" }) {
  const colors = {
    teal: "bg-teal-50 text-teal-800",
    blue: "bg-[#eaf1fc] text-mercury",
    green: "bg-emerald-50 text-emerald-800",
  };
  return <div className={`rounded-2xl p-5 ${colors[tone]}`}><p className="text-xs opacity-75">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>;
}
