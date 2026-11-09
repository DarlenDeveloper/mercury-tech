"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Download, Phone, Search, Trash2, User, X, Wrench } from "@/components/admin/WorkspaceIcons";
import RepairIntake from "@/components/admin/RepairIntake";
import AdminHeader from "@/components/admin/AdminHeader";
import { allowedRepairStatuses, collectRepairTicket, deleteRepairTicket, downloadRepairJobCard, fetchRepairTickets, openPdfBase64, pickupRepairTicket, saveJobCardIntakeDraft, updateRepairTicket, type JobCardIntake, type RepairTicket, type RepairStatus, REPAIR_STATUS_LABELS, paymentLabel } from "@/lib/repairs";
import { fetchRepairStaff } from "@/lib/repairStaff";
import { type RepairAssignee } from "@/lib/repairAssignment";
import { uploadRepairCollectionProof } from "@/lib/storage";

import { logAudit } from "@/lib/auditLog";
import { useAuth } from "@/components/AuthProvider";
import { useAdminAccess } from "@/components/admin/AdminGuard";
import { isSuperAdmin } from "@/lib/adminAccess";

const STATUS_STYLES: Record<RepairStatus, string> = {
  request_submitted: "bg-surface-soft text-muted",
  under_diagnosis: "bg-cyan-50 text-cyan-700",
  quotation_sent: "bg-violet-50 text-violet-700",
  approved_for_repair: "bg-teal-50 text-teal-700",
  received: "bg-surface-soft text-muted",
  awaiting_payment: "bg-amber-50 text-amber-700",
  ready_for_assignment: "bg-teal-50 text-teal-700",
  collected: "bg-slate-100 text-slate-600",
  in_progress: "bg-[#e8eefc] text-mercury",
  awaiting_parts: "bg-[#fff3dc] text-[#b45309]",
  completed: "bg-[#e7f6ee] text-[#16a34a]",
  completed_awaiting_payment: "bg-amber-50 text-amber-700",
  ready_for_collection: "bg-[#e7f6ee] text-[#16a34a]",
};

const STATUS_LABELS = REPAIR_STATUS_LABELS;
const V2_STATUS_ORDER: RepairStatus[] = ["request_submitted", "under_diagnosis", "quotation_sent", "approved_for_repair", "in_progress", "awaiting_parts", "completed_awaiting_payment", "ready_for_collection", "collected"];
const LEGACY_STATUS_ORDER: RepairStatus[] = ["received", "awaiting_payment", "ready_for_assignment", "in_progress", "awaiting_parts", "completed", "collected"];
const TABS: ("all" | RepairStatus)[] = ["all", ...V2_STATUS_ORDER, "received", "awaiting_payment", "ready_for_assignment", "completed"];

function statusOptionsFor(ticket: RepairTicket): RepairStatus[] {
  if (ticket.workflowVersion && ticket.workflowVersion >= 2) {
    const transitions: Partial<Record<RepairStatus, RepairStatus[]>> = {
      in_progress: ["in_progress", "awaiting_parts", "completed_awaiting_payment"],
      awaiting_parts: ["awaiting_parts", "in_progress", "completed_awaiting_payment"],
      ready_for_collection: ["ready_for_collection", "collected"],
    };
    return transitions[ticket.status] || [ticket.status];
  }
  const valid = new Set(allowedRepairStatuses(ticket.status));
  return LEGACY_STATUS_ORDER.filter(status => valid.has(status));
}

function statusGuidance(ticket: RepairTicket) {
  if (["request_submitted", "received"].includes(ticket.status)) return "Use the pickup and job-card action above to begin diagnosis.";
  if (ticket.status === "under_diagnosis") return "Complete diagnosis and send the quotation from Payments.";
  if (ticket.status === "quotation_sent") return "Record the customer's approval from Payments.";
  if (ticket.status === "approved_for_repair") return "Assign a lead technician below. WhatsApp-only technicians start automatically; linked technicians press Start.";
  if (ticket.status === "completed_awaiting_payment") return "The job is complete. Record payment before collection.";
  if (ticket.status === "ready_for_collection") return "Payment is complete. Select Collected only after verifying the original job card.";
  return "Only valid next steps are shown.";
}

function assignmentGuidance(ticket: RepairTicket): { title: string; detail: string; next: "pickup" | "payments" | "assign" | "done" } {
  if (["request_submitted", "received"].includes(ticket.status)) return { title: "First, receive the device", detail: "Create the job card at pickup. That starts the 24–48 hour diagnosis window.", next: "pickup" };
  if (ticket.status === "under_diagnosis") return { title: "Diagnosis comes next", detail: "Record the findings and send a quotation. The customer gets the amount before work begins.", next: "payments" };
  if (ticket.status === "quotation_sent") return { title: "Waiting for customer approval", detail: "Record their approval on the Payments page, then assign a technician here.", next: "payments" };
  if (ticket.status === "approved_for_repair") return { title: "Ready to assign", detail: "Choose at least one technician and a lead, then save the assignment. Payment is due after work is completed.", next: "assign" };
  if (["completed_awaiting_payment", "ready_for_collection", "completed", "collected"].includes(ticket.status)) return { title: "Repair work is complete", detail: "Technician assignment is closed. Record payment after completion, then verify the original card at collection.", next: "done" };
  return { title: "Work is underway", detail: "You can update the assigned team while this job is in progress.", next: "assign" };
}

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
  const [editStatus, setEditStatus] = useState<RepairStatus>("request_submitted");
  const [editAssignee, setEditAssignee] = useState("");
  const [leadTechnicianId, setLeadTechnicianId] = useState("");
  const [staff, setStaff] = useState<RepairAssignee[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState("");
  const [error, setError] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [collectorName, setCollectorName] = useState("");
  const [collectorPhone, setCollectorPhone] = useState("");
  const [collectionNotes, setCollectionNotes] = useState("");
  const [jobCardPresented, setJobCardPresented] = useState(false);
  const [presentedJobCardNumber, setPresentedJobCardNumber] = useState("");
  const [jobCardIntake, setJobCardIntake] = useState<JobCardIntake>({ serialNumber: "", specification: "", intakeRemarks: "", warrantyType: "", chargeable: null, amc: null, proofOfPurchase: null, accessories: { keyboard: false, battery: false, adapter: false, bag: false, storage: false, other: "" } });
  const [intakeSaveState, setIntakeSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const intakeSaveQueue = useRef<Promise<unknown>>(Promise.resolve());
  const openTicketId = useRef("");
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
    openTicketId.current = t.id;
    setSelected(t);
    setEditStatus(t.status);
    setEditAssignee(t.coordinatorEmail || (["Sales", "Support"].includes(t.assigneeRole || "") ? t.assigneeEmail || "" : ""));
    setEditTechnicians(t.workflowVersion && t.workflowVersion >= 2 ? t.technicianIds || [] : t.technicianEmails || []);
    setLeadTechnicianId(t.leadTechnicianId || t.technicianIds?.[0] || "");
    setError("");
    setStaffError("");
    setStaffLoading(true);
    fetchRepairStaff(!!t.workflowVersion && t.workflowVersion >= 2).then(setStaff).catch(() => setStaffError("Could not load the technician directory. Check your connection and reopen this ticket to retry.")).finally(() => setStaffLoading(false));
    setEditNotes(t.notes);
    setCollectorName(t.collectorName || "");
    setCollectorPhone(t.collectorPhone || "");
    setCollectionNotes(t.collectionNotes || "");
    setJobCardPresented(false);
    setPresentedJobCardNumber("");
    setJobCardIntake({ serialNumber: t.serialNumber || "", specification: t.specification || "", intakeRemarks: t.intakeRemarks || "", warrantyType: "", chargeable: null, amc: null, proofOfPurchase: null, accessories: { keyboard: !!t.accessories?.keyboard, battery: !!t.accessories?.battery, adapter: !!t.accessories?.adapter, bag: !!t.accessories?.bag, storage: !!t.accessories?.storage, other: t.accessories?.other || "" } });
    setIntakeSaveState("idle");
    setProofFile(null);
    setProofPreview("");
    setUploadedProof(null);
  };

  const saveIntake = (ticketId: string, intake: JobCardIntake) => {
    if (openTicketId.current === ticketId) setIntakeSaveState("saving");
    const save = intakeSaveQueue.current.catch(() => {}).then(async () => {
      await saveJobCardIntakeDraft(ticketId, intake);
      setTickets(previous => previous.map(ticket => ticket.id === ticketId ? { ...ticket, serialNumber: intake.serialNumber, specification: intake.specification, intakeRemarks: intake.intakeRemarks, accessories: { ...intake.accessories } } : ticket));
      if (openTicketId.current === ticketId) setIntakeSaveState("saved");
    }).catch(cause => {
      if (openTicketId.current === ticketId) setIntakeSaveState("error");
      throw cause;
    });
    intakeSaveQueue.current = save;
    return save;
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
      const collecting = ["completed", "ready_for_collection"].includes(selected.status) && editStatus === "collected";
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
          jobCardPresented,
          presentedJobCardNumber: presentedJobCardNumber.trim(),
        });
      } else {
        await updateRepairTicket(selected.id, {
          status: editStatus,
          coordinatorEmail: editAssignee,
          ...(selected.workflowVersion && selected.workflowVersion >= 2 ? { technicianIds: editTechnicians, leadTechnicianId } : { technicianEmails: editTechnicians }),
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

  const handlePickup = async () => {
    if (!selected || busy) return;
    setBusy(true); setError("");
    try {
      await saveIntake(selected.id, jobCardIntake);
      const result = await pickupRepairTicket(selected.id, jobCardIntake);
      openPdfBase64(result.pdfBase64, `${result.jobCardNumber}.pdf`);
      setSelected(null); await load();
    } catch (error) { setError(error instanceof Error ? error.message : "Could not create the job card."); }
    finally { setBusy(false); }
  };

  const handleJobCardDownload = async () => {
    if (!selected || busy) return;
    const hadJobCard = !!selected.jobCardNumber;
    setBusy(true); setError("");
    try {
      const result = await downloadRepairJobCard(selected.id);
      openPdfBase64(result.pdfBase64, result.fileName);
      if (!hadJobCard) { setSelected(null); await load(); }
    }
    catch (error) { setError(error instanceof Error ? error.message : "Could not download the job card."); }
    finally { setBusy(false); }
  };

  const handleTicketJobCard = async (ticket: RepairTicket) => {
    if (busy) return;
    if (!ticket.jobCardNumber && ["request_submitted", "received"].includes(ticket.status)) {
      openDetail(ticket);
      return;
    }
    setBusy(true); setError("");
    try {
      const result = await downloadRepairJobCard(ticket.id);
      openPdfBase64(result.pdfBase64, result.fileName);
      await load();
    } catch (error) { setError(error instanceof Error ? error.message : "Could not download the job card."); }
    finally { setBusy(false); }
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

  const collecting = !!selected && ["completed", "ready_for_collection"].includes(selected.status) && editStatus === "collected";
  const collectorPhoneDigits = collectorPhone.replace(/\D/g, "");
  const collectorIdentityValid = !!collectorName.trim() && collectorPhoneDigits.length >= 9 && collectorPhoneDigits.length <= 15;
  const collectionReady = selected?.workflowVersion && selected.workflowVersion >= 2
    ? jobCardPresented && presentedJobCardNumber.trim().toUpperCase() === selected.jobCardNumber?.toUpperCase() && collectorIdentityValid
    : !!proofFile || !!uploadedProof || collectorIdentityValid;
  const statusOptions = selected ? statusOptionsFor(selected) : [];
  const assignmentHelp = selected ? assignmentGuidance(selected) : null;
  const technicianAssignmentLocked = !!selected && (selected.workflowVersion && selected.workflowVersion >= 2 ? !["approved_for_repair", "in_progress", "awaiting_parts"].includes(selected.status) : !["awaiting_payment", "ready_for_assignment", "in_progress", "awaiting_parts"].includes(selected.status));
  const assignmentChanged = !!selected && (selected.workflowVersion && selected.workflowVersion >= 2
    ? [...editTechnicians].sort().join("|") !== [...(selected.technicianIds || [])].sort().join("|") || leadTechnicianId !== (selected.leadTechnicianId || selected.technicianIds?.[0] || "")
    : [...editTechnicians].sort().join("|") !== [...(selected.technicianEmails || [])].sort().join("|"));
  const selectableTechnicians = staff.filter(person => person.role === "Technician" && (selected?.workflowVersion && selected.workflowVersion >= 2 ? person.directory : !person.directory));

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
    request_submitted: tickets.filter(t => t.status === "request_submitted").length,
    under_diagnosis: tickets.filter(t => t.status === "under_diagnosis").length,
    quotation_sent: tickets.filter(t => t.status === "quotation_sent").length,
    approved_for_repair: tickets.filter(t => t.status === "approved_for_repair").length,
    awaiting_payment: tickets.filter(t => t.status === "awaiting_payment").length,
    ready_for_assignment: tickets.filter(t => t.status === "ready_for_assignment").length,
    collected: tickets.filter(t => t.status === "collected").length,
    all: tickets.length,
    received: tickets.filter((t) => t.status === "received").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    awaiting_parts: tickets.filter((t) => t.status === "awaiting_parts").length,
    completed: tickets.filter((t) => t.status === "completed").length,
    completed_awaiting_payment: tickets.filter(t => t.status === "completed_awaiting_payment").length,
    ready_for_collection: tickets.filter(t => t.status === "ready_for_collection").length,
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
        <StatCard label="Submitted" value={counts.request_submitted + counts.received} color="gray" />
        <StatCard label="In Progress" value={counts.in_progress} color="blue" />
        <StatCard label="Ready to collect" value={counts.ready_for_collection + counts.completed} color="green" />
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
            <table className="w-full min-w-[1160px] table-fixed border-collapse text-left">
              <colgroup><col className="w-[18%]" /><col className="w-[13%]" /><col className="w-[17%]" /><col className="w-[15%]" /><col className="w-[10%]" /><col className="w-[11%]" /><col className="w-[7%]" /><col className="w-[9%]" /></colgroup>
              <thead>
                <tr className="border-b border-line text-[12px] font-medium text-muted">
                  <th className="pb-3 pl-1 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Device</th>
                  <th className="pb-3 font-medium">Issue</th>
                  <th className="pb-3 font-medium">Assigned to</th>
                  <th className="pb-3 font-medium">Payment</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 text-right font-medium">Job card</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => openDetail(t)}
                    className="cursor-pointer border-b border-line/70 text-sm last:border-0 transition hover:bg-surface-soft"
                  >
                    <td className="py-4 pl-1 pr-4 align-top">
                      <p className="break-words font-semibold leading-5 text-ink">{t.userName || t.userEmail}</p>
                      <p className="mt-1 text-xs text-muted">{t.userPhone || t.userEmail}</p>
                      <p className="mt-1 truncate text-[11px] text-muted" title={t.trackingReference || t.id}>{t.trackingReference || t.id}</p>
                      {t.jobCardNumber && <p className="mt-1 truncate text-[11px] font-semibold text-cyan-700" title={t.jobCardNumber}>Card {t.jobCardNumber}</p>}
                    </td>
                    <td className="py-4 pr-4 align-top font-medium leading-5 text-ink">{t.device}</td>
                    <td className="py-4 pr-4 align-top text-muted"><p className="line-clamp-2 leading-5" title={t.issue}>{t.issue}</p></td>
                    <td className="py-4 pr-4 align-top text-muted">
                      <p className="break-words leading-5">{t.technicianSnapshots?.map(item => item.name).join(", ") || t.technicianEmails?.join(", ") || t.coordinatorEmail || t.technician || "Unassigned"}</p>
                      {t.assigneeRole && <p className="mt-1 text-[11px] text-mercury">{t.assigneeRole}</p>}
                      {t.assignedBy && <p className="mt-1.5 inline-flex rounded-full bg-mercury/10 px-2 py-0.5 text-[10px] font-semibold text-mercury">Assigned by {t.assignedBy}</p>}
                    </td>
                    <td className="py-4 pr-3 align-top text-xs leading-5 text-muted">{paymentLabel(t)}</td>
                    <td className="py-4 pr-3 align-top">
                      <span className={`inline-block rounded-lg px-2.5 py-1 text-[11px] font-semibold leading-4 ${STATUS_STYLES[t.status]}`}>
                        {STATUS_LABELS[t.status]}
                      </span>
                    </td>
                    <td className="py-4 align-top text-[12px] text-muted">
                      {t.createdAt.toLocaleDateString("en-UG", { month: "short", day: "numeric" })}
                    </td>
                    <td className="py-4 text-right align-top">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={(event) => { event.stopPropagation(); void handleTicketJobCard(t); }}
                          disabled={busy}
                          aria-label={`${t.jobCardNumber ? "Download" : "Create"} job card for ${t.trackingReference || t.id}`}
                          title={t.jobCardNumber ? "Download job card" : "Create job card"}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white text-mercury transition hover:border-mercury disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Download size={16} />
                        </button>
                        {canDelete && (
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
                        )}
                      </div>
                    </td>
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
              {selected.diagnosisDueAt && <Row label="Diagnosis due" value={`${selected.diagnosisDueAt.toLocaleString("en-UG")}${selected.status === "under_diagnosis" && selected.diagnosisDueAt.getTime() < Date.now() ? " · Overdue" : ""}`} />}
            </div>

            <div className="mt-5 flex flex-col gap-3">
              {["request_submitted", "received"].includes(selected.status) && !selected.jobCardNumber && (
                <section className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
                  <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-ink">Device pickup &amp; job card</p><p className="mt-1 text-xs leading-5 text-muted">Intake details save automatically. Creating the card moves this repair into the 24–48 hour diagnosis stage.</p></div><Download size={20} className="shrink-0 text-cyan-700" /></div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-semibold">Serial number<input value={jobCardIntake.serialNumber} onChange={event => setJobCardIntake(previous => ({ ...previous, serialNumber: event.target.value }))} onBlur={() => { void saveIntake(selected.id, jobCardIntake).catch(() => {}); }} className="mt-1.5 h-10 w-full rounded-xl border border-line bg-white px-3 text-sm font-normal outline-none focus:border-mercury" /></label>
                    <label className="text-xs font-semibold">Specification<input value={jobCardIntake.specification} onChange={event => setJobCardIntake(previous => ({ ...previous, specification: event.target.value }))} onBlur={() => { void saveIntake(selected.id, jobCardIntake).catch(() => {}); }} className="mt-1.5 h-10 w-full rounded-xl border border-line bg-white px-3 text-sm font-normal outline-none focus:border-mercury" placeholder="RAM, storage, CPU…" /></label>
                    <label className="text-xs font-semibold sm:col-span-2">Intake remarks<textarea value={jobCardIntake.intakeRemarks} onChange={event => setJobCardIntake(previous => ({ ...previous, intakeRemarks: event.target.value }))} onBlur={() => { void saveIntake(selected.id, jobCardIntake).catch(() => {}); }} rows={2} className="mt-1.5 w-full resize-none rounded-xl border border-line bg-white px-3 py-2 text-sm font-normal outline-none focus:border-mercury" placeholder="Physical condition or visible damage" /></label>
                  </div>
                  <fieldset className="mt-3"><legend className="text-xs font-semibold">Accessories received</legend><div className="mt-2 flex flex-wrap gap-2">{(["keyboard", "battery", "adapter", "bag", "storage"] as const).map(key => <label key={key} className="flex items-center gap-2 rounded-full border border-cyan-100 bg-white px-3 py-2 text-xs capitalize"><input type="checkbox" checked={Boolean(jobCardIntake.accessories[key])} onChange={event => { const next = { ...jobCardIntake, accessories: { ...jobCardIntake.accessories, [key]: event.target.checked } }; setJobCardIntake(next); void saveIntake(selected.id, next).catch(() => {}); }} />{key}</label>)}</div></fieldset>
                  <p role="status" className={`mt-3 text-[11px] ${intakeSaveState === "error" ? "text-red-700" : "text-cyan-800"}`}>{intakeSaveState === "saving" ? "Saving intake…" : intakeSaveState === "saved" ? "Intake saved to Firestore" : intakeSaveState === "error" ? "Could not save intake. Switch fields to retry." : "Changes save when you switch fields."}</p>
                  <button disabled={busy} onClick={handlePickup} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"><Download size={17} />{busy ? "Creating job card…" : "Mark picked up & download job card"}</button>
                </section>
              )}
              {(selected.jobCardNumber || !["request_submitted", "received"].includes(selected.status)) && <section className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-slate-50 p-4"><div><p className="text-xs font-semibold uppercase tracking-[0.13em] text-muted">Job card</p><p className="mt-1 font-mono text-sm font-semibold text-ink">{selected.jobCardNumber || "Not generated yet"}</p></div><button disabled={busy} onClick={handleJobCardDownload} className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold text-mercury disabled:opacity-50"><Download size={15} />{selected.jobCardNumber ? "Download PDF" : "Create & download"}</button></section>}
              {assignmentHelp && <section className={`rounded-2xl border p-4 ${assignmentHelp.next === "assign" ? "border-teal-200 bg-teal-50/60" : "border-amber-200 bg-amber-50/60"}`} aria-label="Assignment guidance">
                <div className="flex items-start gap-3"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white ${assignmentHelp.next === "assign" ? "text-teal-700" : "text-amber-700"}`}><Wrench size={16} /></span><div><p className="text-sm font-semibold text-ink">{assignmentHelp.title}</p><p className="mt-1 text-xs leading-5 text-muted">{assignmentHelp.detail}</p></div></div>
                {assignmentHelp.next === "payments" && <Link href={`${base}/payments`} className="mt-3 inline-flex rounded-full border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-mercury hover:border-mercury">Open diagnosis &amp; approval →</Link>}
              </section>}
              <div>
                <div className="mb-1 flex items-center justify-between gap-3"><label className="block text-xs font-semibold text-ink">Workflow status</label>{selected.workflowVersion && selected.workflowVersion >= 2 && <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-cyan-700">New workflow</span>}</div>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as RepairStatus)}
                  disabled={statusOptions.length < 2}
                  className="h-11 w-full rounded-xl border border-line bg-[#FAFBFC] px-4 text-sm text-ink outline-none disabled:cursor-not-allowed disabled:text-muted"
                >
                  {statusOptions.map(value => <option key={value} value={value}>{STATUS_LABELS[value]}</option>)}
                </select>
                <div className="mt-2 flex items-start justify-between gap-3"><p className="text-[11px] leading-5 text-muted">{statusGuidance(selected)}</p>{["under_diagnosis", "quotation_sent", "completed_awaiting_payment"].includes(selected.status) && <Link href={`${base}/payments`} className="shrink-0 text-[11px] font-semibold text-mercury hover:underline">Open Payments →</Link>}</div>
              </div>
              {collecting && (
                <section className="rounded-2xl border border-mercury/20 bg-[#f6f8fd] p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-mercury shadow-sm"><Camera size={20} /></span>
                    <div>
                      <p className="text-sm font-semibold text-ink">Collection evidence</p>
                      <p className="mt-1 text-xs leading-5 text-muted">{selected.workflowVersion && selected.workflowVersion >= 2 ? "Verify the original job card and record who is collecting the device." : "Attach a photo of the job card. If no card is presented, record the collector's details."}</p>
                    </div>
                  </div>

                  {selected.workflowVersion && selected.workflowVersion >= 2 && <div className="mt-4 rounded-xl border border-cyan-100 bg-white p-3"><label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={jobCardPresented} onChange={event => setJobCardPresented(event.target.checked)} />Original physical job card presented</label><label className="mt-3 block text-xs font-semibold">Job-card number<input value={presentedJobCardNumber} onChange={event => setPresentedJobCardNumber(event.target.value)} placeholder={selected.jobCardNumber} className="mt-1.5 h-10 w-full rounded-xl border border-line px-3 font-mono text-sm font-normal uppercase outline-none focus:border-mercury" /></label></div>}

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

                  <div className="my-4 flex items-center gap-3"><span className="h-px flex-1 bg-line" /><span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Collector details</span><span className="h-px flex-1 bg-line" /></div>
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
              {technicianAssignmentLocked && <div className="group relative w-fit" tabIndex={0} aria-describedby="assignment-lock-reason"><span className="cursor-help rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">Why is technician assignment unavailable? ⓘ</span><span id="assignment-lock-reason" role="tooltip" className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 hidden w-64 rounded-xl bg-ink p-3 text-xs leading-5 text-white shadow-lg group-hover:block group-focus:block">{assignmentHelp?.detail}</span></div>}
              <fieldset disabled={technicianAssignmentLocked || staffLoading || !!staffError || busy || collecting} title={technicianAssignmentLocked ? assignmentHelp?.detail : staffLoading ? "Loading technicians" : staffError || "Select the technicians for this repair"}>
                <legend className="mb-2 text-xs font-semibold text-ink">Technicians</legend>
                <p className="mb-3 text-xs leading-5 text-muted">{technicianAssignmentLocked ? "Assignment opens after customer approval." : "WhatsApp-only lead technicians start automatically when assigned. Linked technicians press Start in My Assignments."}</p>
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-line p-3">
                  {selectableTechnicians.map(person => { const value = selected.workflowVersion && selected.workflowVersion >= 2 ? person.id : person.email; return <label key={`${person.id}-${person.email}`} className="flex items-center gap-3 text-sm"><input type="checkbox" checked={editTechnicians.includes(value)} onChange={e => { setEditTechnicians(previous => e.target.checked ? [...previous, value] : previous.filter(item => item !== value)); if (e.target.checked && !leadTechnicianId) setLeadTechnicianId(value); }} /><span className="min-w-0 flex-1">{person.name}<span className="ml-2 text-xs text-muted">{person.phone || person.email}</span></span>{selected.workflowVersion && selected.workflowVersion >= 2 && <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${person.authUid ? "bg-[#eaf1fc] text-mercury" : "bg-[#fef3e2] text-[#b45309]"}`}>{person.authUid ? "Portal" : "WhatsApp"}</span>}</label>; })}
                  {editTechnicians.filter(value => !selectableTechnicians.some(person => (selected.workflowVersion && selected.workflowVersion >= 2 ? person.id : person.email) === value)).map(value => <label key={value} className="flex items-center gap-3 text-sm"><input type="checkbox" checked onChange={() => setEditTechnicians(previous => previous.filter(item => item !== value))} />{value} (no longer available)</label>)}
                  {!staffLoading && !staffError && !selectableTechnicians.length && <p className="text-xs text-muted">No technicians available. <Link href={`${base}/technicians`} className="font-semibold text-mercury underline">Create one in Technicians</Link>.</p>}
                  {staffLoading && <p className="text-xs text-muted">Loading team…</p>}
                </div>
              </fieldset>
              {selected.workflowVersion && selected.workflowVersion >= 2 && editTechnicians.length > 0 && <label className="text-xs font-semibold">Lead technician<select value={leadTechnicianId} onChange={event => setLeadTechnicianId(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-line bg-[#fafbfc] px-3 text-sm font-normal outline-none"><option value="">Choose lead</option>{selectableTechnicians.filter(person => editTechnicians.includes(person.id)).map(person => <option key={person.id} value={person.id}>{person.name} — {person.authUid ? "portal account" : "WhatsApp only"}</option>)}</select></label>}
              {staffError && <p role="alert" className="text-xs text-red-600">{staffError}</p>}
              {!technicianAssignmentLocked && assignmentChanged && <p className="rounded-xl bg-teal-50 px-3 py-2 text-xs text-teal-800">Assignment changed. Save below to notify the technician.</p>}
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
              {busy ? (collecting ? "Recording collection…" : "Updating…") : collecting ? "Record collection & release" : assignmentChanged ? "Save technician assignment" : "Save ticket changes"}
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
