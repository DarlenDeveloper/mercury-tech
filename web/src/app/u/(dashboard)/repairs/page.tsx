"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Phone, Search, Trash2, User, X, Wrench } from "@/components/admin/WorkspaceIcons";
import RepairIntake from "@/components/admin/RepairIntake";
import AdminHeader from "@/components/admin/AdminHeader";
import { allowedRepairStatuses, collectRepairTicket, deleteRepairTicket, fetchRepairTickets, updateRepairTicket, type RepairTicket, type RepairStatus, REPAIR_STATUS_LABELS, repairPaid, paymentLabel } from "@/lib/repairs";
import { fetchRepairStaff } from "@/lib/repairStaff";
import { type RepairAssignee } from "@/lib/repairAssignment";
import { uploadRepairCollectionProof } from "@/lib/storage";

import { logAudit } from "@/lib/auditLog";
import { useAuth } from "@/components/AuthProvider";
import { useAdminAccess } from "@/components/admin/AdminGuard";
import { isSuperAdmin } from "@/lib/adminAccess";

const STATUS_STYLES: Record<RepairStatus, string> = {
  received: "bg-surface-soft text-muted",
  awaiting_payment: "bg-amber-50 text-amber-700",
  ready_for_assignment: "bg-teal-50 text-teal-700",
  collected: "bg-slate-100 text-slate-600",
  in_progress: "bg-[#e8eefc] text-mercury",
  awaiting_parts: "bg-[#fff3dc] text-[#b45309]",
  completed: "bg-[#e7f6ee] text-[#16a34a]",
};

const STATUS_LABELS = REPAIR_STATUS_LABELS;
const TABS: ("all" | RepairStatus)[] = ["all", ...Object.keys(STATUS_LABELS) as RepairStatus[]];

export default function RepairsPage() {
  const { user } = useAuth();
  const { adminEntry } = useAdminAccess();
  const canDelete = isSuperAdmin(adminEntry);
  const base = usePathname().startsWith("/workshop") ? "/workshop" : "/u";
  const [editTechnicians, setEditTechnicians] = useState<string[]>([]);
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | RepairStatus>("all");
  const [selected, setSelected] = useState<RepairTicket | null>(null);
  const [editStatus, setEditStatus] = useState<RepairStatus>("received");
  const [editAssignee, setEditAssignee] = useState("");
  const [staff, setStaff] = useState<RepairAssignee[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState("");
  const [error, setError] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [collectorName, setCollectorName] = useState("");
  const [collectorPhone, setCollectorPhone] = useState("");
  const [collectionNotes, setCollectionNotes] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState("");
  const [uploadedProof, setUploadedProof] = useState<{ path: string; url: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => { load(); }, []);
  useEffect(() => () => { if (proofPreview) URL.revokeObjectURL(proofPreview); }, [proofPreview]);

  const load = async () => {
    setLoading(true);
    try { setTickets(await fetchRepairTickets()); } catch { setError("Could not load repairs. Please refresh to try again."); }
    finally { setLoading(false); }
  };

  const openDetail = (t: RepairTicket) => {
    setSelected(t);
    setEditStatus(t.status);
    setEditAssignee(t.coordinatorEmail || (["Sales", "Support"].includes(t.assigneeRole || "") ? t.assigneeEmail || "" : ""));
    setEditTechnicians(t.technicianEmails || []);
    setError("");
    setStaffError("");
    setStaffLoading(true);
    fetchRepairStaff().then(setStaff).catch(() => setStaffError("Could not load team members. Close and reopen this ticket to retry.")).finally(() => setStaffLoading(false));
    setEditNotes(t.notes);
    setCollectorName(t.collectorName || "");
    setCollectorPhone(t.collectorPhone || "");
    setCollectionNotes(t.collectionNotes || "");
    setProofFile(null);
    setProofPreview("");
    setUploadedProof(null);
  };

  const chooseProof = (file?: File) => {
    setError("");
    setUploadedProof(null);
    setProofFile(null);
    setProofPreview("");
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Use a JPG, PNG or WebP image for the job card.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("The job-card photo must be 8 MB or smaller.");
      return;
    }
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setError("");
    setBusy(true);
    try {
      const collecting = selected.status === "completed" && editStatus === "collected";
      if (collecting) {
        const phoneDigits = collectorPhone.replace(/\D/g, "");
        const hasCollectorIdentity = !!collectorName.trim() && phoneDigits.length >= 9 && phoneDigits.length <= 15;
        if (!proofFile && !uploadedProof && !hasCollectorIdentity) {
          throw new Error("Attach the job card, or enter the collector's name and telephone number.");
        }
        if (collectorPhone.trim() && (phoneDigits.length < 9 || phoneDigits.length > 15)) {
          throw new Error("Enter a valid collector telephone number.");
        }
        let proof = uploadedProof;
        if (!proof && proofFile) {
          proof = await uploadRepairCollectionProof(proofFile, selected.id);
          setUploadedProof(proof);
        }
        await collectRepairTicket(selected.id, {
          notes: editNotes.trim(),
          collectionProofPath: proof?.path || "",
          collectionProofUrl: proof?.url || "",
          collectorName: collectorName.trim(),
          collectorPhone: collectorPhone.trim(),
          collectionNotes: collectionNotes.trim(),
        });
      } else {
        await updateRepairTicket(selected.id, {
          status: editStatus,
          coordinatorEmail: editAssignee,
          technicianEmails: editTechnicians,
          notes: editNotes.trim(),
        });
      }
      logAudit({
        actor: user?.displayName || user?.email || "Unknown",
        actorId: user?.uid || "",
        action: "settings_updated",
        target: `Repair ${selected.id} → ${STATUS_LABELS[editStatus]}`,
        details: editStatus === "collected" ? "Collection evidence recorded" : `Coordinator: ${editAssignee || "Unassigned"}; technicians: ${editTechnicians.join(", ") || "Unassigned"}`,
      });
      setSelected(null);
      load();
    } catch (error) { setError(error instanceof Error ? error.message : "Could not update the ticket."); } finally { setBusy(false); }
  };

  const handleDelete = async (ticket: RepairTicket) => {
    if (!canDelete || deletingId) return;
    const reference = ticket.trackingReference || ticket.id;
    const customer = ticket.userName || ticket.userEmail || "this customer";
    if (!confirm(`Delete repair ${reference} for ${customer}? This removes the ticket and its public tracking access. This cannot be undone.`)) return;
    setError("");
    setDeletingId(ticket.id);
    try {
      await deleteRepairTicket(ticket.id);
      setTickets(previous => previous.filter(item => item.id !== ticket.id));
      if (selected?.id === ticket.id) setSelected(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete the repair ticket.");
    } finally {
      setDeletingId("");
    }
  };

  const collecting = selected?.status === "completed" && editStatus === "collected";
  const collectorPhoneDigits = collectorPhone.replace(/\D/g, "");
  const collectorIdentityValid = !!collectorName.trim() && collectorPhoneDigits.length >= 9 && collectorPhoneDigits.length <= 15;
  const collectionReady = !!proofFile || !!uploadedProof || collectorIdentityValid;

  const filtered = tickets.filter((t) => {
    const matchTab = tab === "all" || t.status === tab;
    const matchSearch = !search ||
      t.userName.toLowerCase().includes(search.toLowerCase()) ||
      t.device.toLowerCase().includes(search.toLowerCase()) ||
      t.issue.toLowerCase().includes(search.toLowerCase()) ||
      t.technician.toLowerCase().includes(search.toLowerCase()) ||
      (t.assigneeEmail || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.assigneeRole || "").toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const counts = {
    awaiting_payment: tickets.filter(t => t.status === "awaiting_payment").length,
    ready_for_assignment: tickets.filter(t => t.status === "ready_for_assignment").length,
    collected: tickets.filter(t => t.status === "collected").length,
    all: tickets.length,
    received: tickets.filter((t) => t.status === "received").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    awaiting_parts: tickets.filter((t) => t.status === "awaiting_parts").length,
    completed: tickets.filter((t) => t.status === "completed").length,
  };

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="Repairs & Services"
        subtitle="Track repair tickets and on-site service jobs"
        action={<RepairIntake onCreated={load} />}
      />

      <Link href={`${base}/payments`} className="mt-4 inline-block text-sm font-medium text-mercury hover:underline">Manage repair payments →</Link>
      {error && !selected && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Tickets" value={counts.all} />
        <StatCard label="Received" value={counts.received} color="gray" />
        <StatCard label="In Progress" value={counts.in_progress} color="blue" />
        <StatCard label="Completed" value={counts.completed} color="green" />
      </div>

      {/* Tabs + Search */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap rounded-full px-3.5 py-2 text-[12px] font-medium capitalize transition ${
                tab === t ? "bg-ink text-white" : "bg-white border border-line text-ink hover:border-mercury"
              }`}
            >
              {t === "all" ? "All" : STATUS_LABELS[t]} ({counts[t]})
            </button>
          ))}
        </div>
        <div className="flex h-10 flex-1 items-center gap-2 rounded-full bg-white border border-line px-4">
          <Search size={16} className="text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, device, assignee or role..."
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          />
        </div>
      </div>

      {/* Table */}
      <section className="mt-5 rounded-2xl border border-line bg-white p-5">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-mercury" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Wrench size={32} className="mx-auto text-muted/30" />
            <p className="mt-3 text-sm text-muted">No repair tickets yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-[12px] font-medium text-muted">
                  <th className="pb-3 pl-1 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Device</th>
                  <th className="pb-3 font-medium">Issue</th>
                  <th className="pb-3 font-medium">Assigned to</th>
                  <th className="pb-3 font-medium">Payment</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                  {canDelete && <th className="pb-3 text-right font-medium"><span className="sr-only">Actions</span></th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => openDetail(t)}
                    className="cursor-pointer border-b border-line/70 text-sm last:border-0 transition hover:bg-surface-soft"
                  >
                    <td className="py-3 pl-1">
                      <p className="font-medium text-ink">{t.userName || t.userEmail}</p>
                      <p className="text-[11px] text-muted">{t.userPhone || t.userEmail}</p>
                      <p className="mt-1 text-[10px] text-muted">{t.trackingReference || t.id}</p>
                    </td>
                    <td className="py-3 text-ink">{t.device}</td>
                    <td className="py-3 text-muted max-w-[180px] truncate">{t.issue}</td>
                    <td className="py-3 text-muted">
                      <p>{t.technicianEmails?.join(", ") || t.coordinatorEmail || t.technician || "Unassigned"}</p>
                      {t.assigneeRole && <p className="mt-1 text-[11px] text-mercury">{t.assigneeRole}</p>}
                      {t.assignedBy && <p className="mt-1.5 inline-flex rounded-full bg-mercury/10 px-2 py-0.5 text-[10px] font-semibold text-mercury">Assigned by {t.assignedBy}</p>}
                    </td>
                    <td className="py-3 text-xs text-muted">{paymentLabel(t)}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[t.status]}`}>
                        {STATUS_LABELS[t.status]}
                      </span>
                    </td>
                    <td className="py-3 text-[12px] text-muted">
                      {t.createdAt.toLocaleDateString("en-UG", { month: "short", day: "numeric" })}
                    </td>
                    {canDelete && (
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={(event) => { event.stopPropagation(); void handleDelete(t); }}
                          disabled={!!deletingId}
                          aria-label={`Delete repair ${t.trackingReference || t.id}`}
                          title="Delete repair"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 size={17} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Detail/Edit Modal */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => { if (!busy) setSelected(null); }}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-ink">Repair Ticket</h3>
              <button onClick={() => { if (!busy) setSelected(null); }} className="text-muted hover:text-ink"><X size={20} /></button>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <Row label="Reference" value={selected.trackingReference || selected.id} />
              <Row label="Payment" value={`${paymentLabel(selected)} · UGX ${(selected.totalPaid || 0).toLocaleString()} / ${(selected.amountDue || 0).toLocaleString()}`} />
              <Row label="Customer" value={`${selected.userName} (${selected.userEmail})`} />
              <Row label="Phone" value={selected.userPhone || "—"} />
              <Row label="Device" value={selected.device} />
              <Row label="Type" value={(selected as any).deviceType || "—"} />
              <Row label="Issue" value={selected.issue} />
              <Row label="Urgency" value={(selected as any).urgency || "Normal"} />
              <Row label="Quantity" value={String((selected as any).quantity || 1)} />
              {selected.assignedBy && <Row label="Assigned by" value={selected.assignedBy} />}
              <Row label="Submitted" value={selected.createdAt.toLocaleString("en-UG")} />
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as RepairStatus)}
                  className="h-11 w-full rounded-xl border border-line bg-[#FAFBFC] px-4 text-sm text-ink outline-none"
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value} disabled={!allowedRepairStatuses(selected.status).includes(value as RepairStatus)}>{label}</option>)}
                </select>
              </div>
              {collecting && (
                <section className="rounded-2xl border border-mercury/20 bg-[#f6f8fd] p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-mercury shadow-sm"><Camera size={20} /></span>
                    <div>
                      <p className="text-sm font-semibold text-ink">Collection evidence</p>
                      <p className="mt-1 text-xs leading-5 text-muted">Attach a photo of the job card. If no card is presented, record the name and telephone number of the person collecting.</p>
                    </div>
                  </div>

                  <label className="mt-4 block cursor-pointer rounded-2xl border border-dashed border-mercury/35 bg-white p-3 transition hover:border-mercury">
                    <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="sr-only" onChange={event => chooseProof(event.target.files?.[0])} />
                    {proofPreview ? (
                      <div className="flex items-center gap-3">
                        <img src={proofPreview} alt="Selected job card" className="h-20 w-24 rounded-xl object-cover" />
                        <div className="min-w-0"><p className="truncate text-sm font-semibold text-ink">{proofFile?.name}</p><p className="mt-1 text-xs text-muted">Tap to replace · maximum 8 MB</p></div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 py-5 text-sm font-semibold text-mercury"><Camera size={19} />Take or choose job-card photo</div>
                    )}
                  </label>

                  <div className="my-4 flex items-center gap-3"><span className="h-px flex-1 bg-line" /><span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">If there is no card</span><span className="h-px flex-1 bg-line" /></div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-xs font-semibold text-ink">Collector name
                      <span className="mt-1.5 flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-3 focus-within:border-mercury"><User size={17} className="text-muted" /><input value={collectorName} maxLength={150} onChange={event => setCollectorName(event.target.value)} placeholder="Full name" className="min-w-0 flex-1 bg-transparent text-sm font-normal outline-none" /></span>
                    </label>
                    <label className="block text-xs font-semibold text-ink">Telephone number
                      <span className="mt-1.5 flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-3 focus-within:border-mercury"><Phone size={17} className="text-muted" /><input type="tel" value={collectorPhone} maxLength={40} onChange={event => setCollectorPhone(event.target.value)} placeholder="0700 000 000" className="min-w-0 flex-1 bg-transparent text-sm font-normal outline-none" /></span>
                    </label>
                  </div>
                  <label className="mt-3 block text-xs font-semibold text-ink">Collection note <span className="font-normal text-muted">(optional)</span>
                    <textarea value={collectionNotes} maxLength={3000} rows={2} onChange={event => setCollectionNotes(event.target.value)} placeholder="Condition at handover or any useful detail" className="mt-1.5 w-full resize-none rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-mercury" />
                  </label>
                </section>
              )}
              {selected.status === "collected" && (
                <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <p className="text-sm font-semibold text-emerald-900">Collection recorded</p>
                  <div className="mt-3 space-y-2 text-xs text-emerald-950">
                    {selected.collectionProofUrl && <a href={selected.collectionProofUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-emerald-100 bg-white"><img src={selected.collectionProofUrl} alt="Job-card collection proof" className="h-40 w-full object-cover" /><span className="block px-3 py-2 font-semibold text-mercury">Open job-card photo</span></a>}
                    {selected.collectorName && <p><span className="font-semibold">Collected by:</span> {selected.collectorName}</p>}
                    {selected.collectorPhone && <p><span className="font-semibold">Telephone:</span> {selected.collectorPhone}</p>}
                    {selected.collectionNotes && <p><span className="font-semibold">Note:</span> {selected.collectionNotes}</p>}
                    {selected.collectionRecordedBy && <p><span className="font-semibold">Recorded by:</span> {selected.collectionRecordedBy}</p>}
                    {selected.collectedAt && <p><span className="font-semibold">Time:</span> {selected.collectedAt.toLocaleString("en-UG")}</p>}
                  </div>
                </section>
              )}
              <div>
                <label htmlFor="repair-assignee" className="mb-1 block text-xs font-semibold text-ink">Sales / Support coordinator</label>
                <select id="repair-assignee" value={editAssignee} onChange={e => setEditAssignee(e.target.value)} disabled={staffLoading || !!staffError || busy || collecting} className="h-11 w-full rounded-xl border border-line bg-[#FAFBFC] px-4 text-sm text-ink disabled:opacity-60">
                  <option value="">Unassigned</option>
                  {editAssignee && !staff.some(person => person.email === editAssignee) && <option value={editAssignee}>{editAssignee} (existing)</option>}
                  {staff.filter(person => ["Sales", "Support"].includes(person.role)).map(person => <option key={person.email} value={person.email}>{person.name} — {person.role}</option>)}
                </select>
              </div>
              <fieldset disabled={!repairPaid(selected) || staffLoading || !!staffError || busy || collecting}>
                <legend className="mb-2 text-xs font-semibold text-ink">Technicians</legend>
                {!repairPaid(selected) && <p className="mb-3 text-xs leading-5 text-amber-700">Record full payment in Payments before assigning technicians.</p>}
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-line p-3">
                  {staff.filter(person => person.role === "Technician").map(person => <label key={person.email} className="flex items-center gap-3 text-sm"><input type="checkbox" checked={editTechnicians.includes(person.email)} onChange={e => setEditTechnicians(previous => e.target.checked ? [...previous, person.email] : previous.filter(email => email !== person.email))} />{person.name}<span className="text-xs text-muted">{person.email}</span></label>)}
                  {editTechnicians.filter(email => !staff.some(person => person.email === email && person.role === "Technician")).map(email => <label key={email} className="flex items-center gap-3 text-sm"><input type="checkbox" checked onChange={() => setEditTechnicians(previous => previous.filter(value => value !== email))} />{email} (no longer available)</label>)}
                  {!staffLoading && !staff.some(person => person.role === "Technician") && <p className="text-xs text-muted">Tag team members as Technician in Users & Roles.</p>}
                  {staffLoading && <p className="text-xs text-muted">Loading team…</p>}
                </div>
              </fieldset>
              {staffError && <p role="alert" className="text-xs text-red-600">{staffError}</p>}
              <div className="border-t border-line pt-3"><p className="mb-2 text-xs font-semibold">Status history</p>{selected.statusHistory?.map((event, index) => <p key={index} className="py-1 text-xs text-muted">{STATUS_LABELS[event.status]} · {event.at.toLocaleString("en-UG")}</p>)}</div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink">Notes</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Internal notes about this repair"
                  rows={3}
                  className="w-full rounded-xl border border-line bg-[#FAFBFC] px-4 py-3 text-sm text-ink outline-none resize-none focus:border-mercury"
                />
              </div>
            </div>

            {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
            <button
              onClick={handleUpdate}
              disabled={busy || (collecting && !collectionReady)}
              className="mt-5 w-full rounded-full bg-ink py-3 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50"
            >
              {busy ? (collecting ? "Recording collection…" : "Updating…") : collecting ? "Record collection & release" : "Update Ticket"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  const bg = color === "blue" ? "#eaf1fc" : color === "green" ? "#eef7ee" : color === "gray" ? "#f3f4f6" : "#f3e8ff";
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
      <span className="w-24 shrink-0 text-[12px] font-medium text-muted">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
