import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseApp } from "./firebase";

export type RepairStatus = "received" | "awaiting_payment" | "ready_for_assignment" | "completed" | "request_submitted" | "under_diagnosis" | "quotation_sent" | "approved_for_repair" | "in_progress" | "awaiting_parts" | "completed_awaiting_payment" | "ready_for_collection" | "collected";

export type RepairTicket = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  device: string;
  issue: string;
  service: string;
  status: RepairStatus;
  technician: string;
  assigneeEmail?: string;
  assigneeRole?: string;
  trackingReference?: string;
  billingType?: "quotation" | "lpo";
  billingReference?: string;
  amountDue?: number;
  totalPaid?: number;
  coordinatorEmail?: string;
  technicianEmails?: string[];
  technicianIds?: string[];
  leadTechnicianId?: string;
  technicianSnapshots?: { id: string; name: string; phone: string; authUid: string; email: string }[];
  technicianAuthUids?: string[];
  jobCardNumber?: string;
  jobCardPath?: string;
  jobCardGenerationStatus?: string;
  pickedUpAt?: Date | null;
  pickedUpBy?: string;
  diagnosisStartedAt?: Date | null;
  diagnosisDueAt?: Date | null;
  diagnosisSummary?: string;
  recommendedWork?: string;
  diagnosedAt?: Date | null;
  diagnosedBy?: string;
  customerApprovalStatus?: string;
  approvedAt?: Date | null;
  assignedBy?: string;
  assignedByEmail?: string;
  assignedAt?: Date | null;
  startedBy?: string;
  startedByEmail?: string;
  startedAt?: Date | null;
  completionNotes?: string;
  completedBy?: string;
  completedByEmail?: string;
  completedAt?: Date | null;
  collectionProofUrl?: string;
  collectionProofPath?: string;
  collectorName?: string;
  collectorPhone?: string;
  collectionNotes?: string;
  collectionRecordedBy?: string;
  collectionRecordedByEmail?: string;
  collectedAt?: Date | null;
  statusHistory?: { status: RepairStatus; at: Date }[];
  workflowVersion?: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
};

const COL = "repair_tickets";

function toRepairTicket(id: string, data: DocumentData): RepairTicket {
  return {
    id,
    userId: data.userId || "",
    userName: data.userName || "",
    userEmail: data.userEmail || "",
    userPhone: data.userPhone || "",
    device: data.device || "",
    issue: data.issue || "",
    service: data.service || "Repair",
    status: data.status || "received",
    technician: data.technician || "",
    assigneeEmail: data.assigneeEmail || "",
    assigneeRole: data.assigneeRole || "",
    trackingReference: data.trackingReference || id,
    billingType: data.billingType,
    billingReference: data.billingReference || "",
    amountDue: data.amountDue || 0,
    totalPaid: data.totalPaid || 0,
    coordinatorEmail: data.coordinatorEmail || "",
    technicianEmails: data.technicianEmails || [],
    technicianIds: data.technicianIds || [],
    leadTechnicianId: data.leadTechnicianId || "",
    technicianSnapshots: data.technicianSnapshots || [],
    technicianAuthUids: data.technicianAuthUids || [],
    jobCardNumber: data.jobCardNumber || "",
    jobCardPath: data.jobCardPath || "",
    jobCardGenerationStatus: data.jobCardGenerationStatus || "",
    pickedUpAt: data.pickedUpAt instanceof Timestamp ? data.pickedUpAt.toDate() : null,
    pickedUpBy: data.pickedUpBy || "",
    diagnosisStartedAt: data.diagnosisStartedAt instanceof Timestamp ? data.diagnosisStartedAt.toDate() : null,
    diagnosisDueAt: data.diagnosisDueAt instanceof Timestamp ? data.diagnosisDueAt.toDate() : null,
    diagnosisSummary: data.diagnosisSummary || "",
    recommendedWork: data.recommendedWork || "",
    diagnosedAt: data.diagnosedAt instanceof Timestamp ? data.diagnosedAt.toDate() : null,
    diagnosedBy: data.diagnosedBy || "",
    customerApprovalStatus: data.customerApprovalStatus || "",
    approvedAt: data.approvedAt instanceof Timestamp ? data.approvedAt.toDate() : null,
    assignedBy: data.assignedBy || "",
    assignedByEmail: data.assignedByEmail || "",
    assignedAt: data.assignedAt instanceof Timestamp ? data.assignedAt.toDate() : null,
    startedBy: data.startedBy || "",
    startedByEmail: data.startedByEmail || "",
    startedAt: data.startedAt instanceof Timestamp ? data.startedAt.toDate() : null,
    completionNotes: data.completionNotes || "",
    completedBy: data.completedBy || "",
    completedByEmail: data.completedByEmail || "",
    completedAt: data.completedAt instanceof Timestamp ? data.completedAt.toDate() : null,
    collectionProofUrl: data.collectionProofUrl || "",
    collectionProofPath: data.collectionProofPath || "",
    collectorName: data.collectorName || "",
    collectorPhone: data.collectorPhone || "",
    collectionNotes: data.collectionNotes || "",
    collectionRecordedBy: data.collectionRecordedBy || "",
    collectionRecordedByEmail: data.collectionRecordedByEmail || "",
    collectedAt: data.collectedAt instanceof Timestamp ? data.collectedAt.toDate() : null,
    workflowVersion: data.workflowVersion,
    statusHistory: (data.statusHistory || [{ status: data.status || "received", at: data.createdAt }]).map((event: { status: RepairStatus; at?: Timestamp }) => ({ status: event.status, at: event.at instanceof Timestamp ? event.at.toDate() : new Date() })),
    notes: data.notes || "",
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
  };
}

/** Customer submits a repair request. */
export async function submitRepairRequest({
  userId,
  userName,
  userEmail,
  userPhone,
  device,
  issue,
  service = "Repair",
}: {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  device: string;
  issue: string;
  service?: string;
}): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    userId,
    userName,
    userEmail,
    userPhone,
    device,
    issue,
    service,
    status: "request_submitted",
    workflowVersion: 2,
    totalPaid: 0,
    technicianEmails: [],
    technicianIds: [],
    coordinatorEmail: "",
    technician: "",
    notes: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Fetch all repair tickets (admin). */
export async function fetchRepairTickets(): Promise<RepairTicket[]> {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toRepairTicket(d.id, d.data()));
}

/** Fetch tickets for a specific user. */
export async function fetchMyRepairTickets(userId: string): Promise<RepairTicket[]> {
  const q = query(collection(db, COL), where("userId", "==", userId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toRepairTicket(d.id, d.data()));
}

/** Fetch only repair jobs assigned to one technician. */
export async function fetchTechnicianAssignments(email: string, uid = ""): Promise<RepairTicket[]> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail && !uid) return [];
  const snapshots = await Promise.all([
    normalizedEmail ? getDocs(query(collection(db, COL), where("technicianEmails", "array-contains", normalizedEmail))) : null,
    uid ? getDocs(query(collection(db, COL), where("technicianAuthUids", "array-contains", uid))) : null,
  ]);
  const docs = new Map(snapshots.flatMap(snapshot => snapshot?.docs || []).map(document => [document.id, document]));
  return [...docs.values()]
    .map((d) => toRepairTicket(d.id, d.data()))
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export const REPAIR_STATUS_LABELS: Record<RepairStatus, string> = {
  request_submitted: "Request submitted", under_diagnosis: "Under diagnosis", quotation_sent: "Quotation sent", approved_for_repair: "Approved for repair",
  received: "Received", awaiting_payment: "Awaiting payment", ready_for_assignment: "Ready for assignment",
  in_progress: "In progress", awaiting_parts: "Awaiting parts", completed: "Ready for collection", completed_awaiting_payment: "Completed — payment due", ready_for_collection: "Ready for collection", collected: "Collected",
};
const REPAIR_STATUS_TRANSITIONS: Record<RepairStatus, RepairStatus[]> = {
  request_submitted: ["request_submitted"],
  under_diagnosis: ["under_diagnosis"],
  quotation_sent: ["quotation_sent"],
  approved_for_repair: ["approved_for_repair"],
  received: ["received"],
  awaiting_payment: ["awaiting_payment", "ready_for_assignment"],
  ready_for_assignment: ["ready_for_assignment", "in_progress"],
  in_progress: ["in_progress", "awaiting_parts", "completed"],
  awaiting_parts: ["awaiting_parts", "in_progress", "completed"],
  completed_awaiting_payment: ["completed_awaiting_payment"],
  ready_for_collection: ["ready_for_collection", "collected"],
  completed: ["completed", "in_progress", "collected"],
  collected: ["collected"],
};
export function allowedRepairStatuses(status: RepairStatus) { return REPAIR_STATUS_TRANSITIONS[status]; }
export function repairPaid(ticket: RepairTicket) { return (ticket.amountDue || 0) > 0 && (ticket.totalPaid || 0) >= (ticket.amountDue || 0); }
export function paymentLabel(ticket: RepairTicket) {
  if (!ticket.amountDue) return "Needs quotation / LPO";
  if (repairPaid(ticket)) return "Paid";
  return ticket.totalPaid ? "Part paid" : "Unpaid";
}
export async function manageRepair<T = { ok: true }>(id: string, action: string, fields: Record<string, unknown>) {
  const response = await httpsCallable<Record<string, unknown>, T>(getFunctions(firebaseApp), "manageRepair")({ id, action, ...fields });
  return response.data;
}
export async function updateRepairTicket(id: string, fields: { status: RepairStatus; notes: string; coordinatorEmail: string; technicianEmails?: string[]; technicianIds?: string[]; leadTechnicianId?: string }) {
  await manageRepair(id, "update", fields);
}
export type JobCardIntake = {
  serialNumber: string;
  specification: string;
  intakeRemarks: string;
  accessories: Record<string, boolean | string>;
  chargeable: boolean | null;
  warrantyType: string;
  amc: boolean | null;
  proofOfPurchase: boolean | null;
};
export async function pickupRepairTicket(id: string, intake: JobCardIntake) {
  return manageRepair<{ ok: true; jobCardNumber: string; pdfBase64: string }>(id, "pickup", intake);
}
export async function downloadRepairJobCard(id: string) {
  const response = await httpsCallable<{ id: string }, { fileName: string; jobCardNumber: string; pdfBase64: string }>(getFunctions(firebaseApp), "downloadRepairJobCard")({ id });
  return response.data;
}
export function openPdfBase64(pdfBase64: string, fileName: string) {
  const bytes = Uint8Array.from(atob(pdfBase64), character => character.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = fileName; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
/** Super admins permanently remove a repair ticket through the audited workflow. */
export async function deleteRepairTicket(id: string): Promise<void> {
  await manageRepair(id, "delete", {});
}
export async function collectRepairTicket(id: string, fields: {
  notes: string;
  collectionProofPath: string;
  collectionProofUrl: string;
  collectorName: string;
  collectorPhone: string;
  collectionNotes: string;
  jobCardPresented?: boolean;
  presentedJobCardNumber?: string;
}) {
  await manageRepair(id, "collect", fields);
}
export async function updateAssignedJob(id: string, jobAction: "start" | "complete", notes = "") {
  await manageRepair(id, "technician_update", { jobAction, notes });
}
export type RepairPayment = { id: string; ticketId: string; amount: number; method: string; reference: string; recordedBy: string; recordedAt: Date };
export async function fetchRepairPayments(ticketId: string): Promise<RepairPayment[]> {
  const response = await httpsCallable<{ ticketId: string }, { payments: Array<Omit<RepairPayment, "recordedAt"> & { recordedAt: string | null }> }>(
    getFunctions(firebaseApp),
    "listRepairPayments"
  )({ ticketId });
  return response.data.payments
    .map(payment => ({ ...payment, recordedAt: payment.recordedAt ? new Date(payment.recordedAt) : new Date(0) }))
    .sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime());
}

export type PublicRepairStatus = {
  reference: string;
  service: string;
  device: string;
  status: RepairStatus;
  history: { status: RepairStatus; at: string | null }[];
  updatedAt: string | null;
};

export async function lookupRepairStatus(reference: string, phone: string): Promise<PublicRepairStatus> {
  const response = await httpsCallable<{ reference: string; phone: string }, PublicRepairStatus>(
    getFunctions(firebaseApp),
    "lookupRepairStatus"
  )({ reference: reference.trim(), phone: phone.trim() });
  return response.data;
}
