import { createHash } from "node:crypto";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { paymentTotal, phoneMatches, publicRepairStatus, validateWork } from "./repair-workflow.js";

function text(value, max = 300) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
function fail(message) { throw new HttpsError("failed-precondition", message); }

export async function handleRepairRequest(request, db) {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in first.");
  const input = request.data || {};
  const id = text(input.id, 150);
  if (!id || id.includes("/")) throw new HttpsError("invalid-argument", "A repair reference is required.");
  const action = input.action;
  if (!["create", "billing", "payment", "update"].includes(action)) throw new HttpsError("invalid-argument", "Unknown action.");
  const email = text(request.auth.token.email).toLowerCase();
  const ref = db.collection("repair_tickets").doc(id);
  return db.runTransaction(async tx => {
    const [configSnap, ticketSnap] = await Promise.all([tx.get(db.doc("config/admins")), tx.get(ref)]);
    const config = configSnap.data() || {};
    const entries = config.admins || [];
    const admin = entries.find(entry => entry.email?.toLowerCase() === email);
    const legacy = !admin && (config.emails || []).some(item => item.toLowerCase() === email);
    const page = ["create", "update"].includes(action) ? "repairs" : "payments";
    if (!legacy && (!admin || (admin.access !== "super_admin" && !admin.pages?.some(p => p === "*" || p === page)))) throw new HttpsError("permission-denied", `You need ${page} access.`);
    if (action === "create") {
      if (ticketSnap.exists) return { ok: true, duplicate: true };
      if (!text(input.userName) || !text(input.userPhone) || !text(input.device) || !text(input.issue, 3000)) fail("Enter the customer name, phone, device and issue.");
      const now = Timestamp.now();
      tx.create(ref, { userId: "", userName: text(input.userName), userPhone: text(input.userPhone), userEmail: text(input.userEmail), device: text(input.device), issue: text(input.issue, 3000), service: text(input.service) || "Repair", status: "received", technician: "", technicianEmails: [], coordinatorEmail: "", notes: "", totalPaid: 0, workflowVersion: 1, trackingReference: id, createdAt: now, updatedAt: now, statusHistory: [{ status: "received", at: now }] });
      tx.create(db.collection("audit_logs").doc(), { actor: email, actorId: request.auth.uid, action: "repair_created", target: `Repair ${id}`, details: "Walk-in repair intake", timestamp: now });
      return { ok: true, id };
    }
    if (!ticketSnap.exists) throw new HttpsError("not-found", "Repair not found.");
    const ticket = ticketSnap.data();
    const patch = { updatedAt: FieldValue.serverTimestamp(), trackingReference: ticket.trackingReference || id, workflowVersion: 1 };
    const now = Timestamp.now();
    if (action === "billing") {
      if ((ticket.totalPaid || 0) > 0) fail("The quotation/LPO is locked after the first payment.");
      if (!["received", "awaiting_payment"].includes(ticket.status)) fail("Billing can only be set before repair work begins.");
      if (!["quotation", "lpo"].includes(input.billingType) || !text(input.billingReference)) fail("Choose a quotation or LPO and enter its reference.");
      if (!Number.isSafeInteger(input.amountDue) || input.amountDue <= 0) fail("Enter a positive whole UGX amount.");
      Object.assign(patch, { billingType: input.billingType, billingReference: text(input.billingReference), amountDue: input.amountDue, totalPaid: 0, currency: "UGX", status: "awaiting_payment" });
    }
    if (action === "payment") {
      const paymentId = text(input.paymentId, 80);
      if (!/^[a-zA-Z0-9-]{16,80}$/.test(paymentId)) fail("A payment request reference is required.");
      const paymentRef = db.collection("repair_payments").doc(paymentId);
      const existing = await tx.get(paymentRef);
      if (existing.exists) {
        const old = existing.data();
        if (old.ticketId !== id || old.amount !== input.amount || old.method !== input.method || old.reference !== text(input.reference)) fail("This payment reference has already been used.");
        return { ok: true, duplicate: true };
      }
      if (!["cash", "mobile_money", "bank_transfer", "card"].includes(input.method) || !text(input.reference)) fail("Choose a payment method and enter a receipt/transaction reference.");
      const receiptKey = createHash("sha256").update(`${id}|${input.method}|${text(input.reference).toLowerCase()}`).digest("hex");
      const receiptRef = db.collection("repair_payment_refs").doc(receiptKey);
      if ((await tx.get(receiptRef)).exists) fail("This receipt/transaction reference is already recorded for this repair.");
      let total;
      try { total = paymentTotal(ticket, input.amount); } catch (error) { fail(error.message); }
      tx.create(receiptRef, { paymentId, ticketId: id });
      tx.create(paymentRef, { ticketId: id, amount: input.amount, currency: "UGX", method: input.method, reference: text(input.reference), recordedBy: email, recordedAt: now });
      Object.assign(patch, { totalPaid: total, status: total === ticket.amountDue ? "ready_for_assignment" : "awaiting_payment" });
    }
    if (action === "update") {
      const technicianEmails = input.technicianEmails;
      if (!Array.isArray(technicianEmails) || technicianEmails.length > 20 || technicianEmails.some(value => typeof value !== "string")) fail("Choose up to 20 technicians.");
      const technicians = [...new Set(technicianEmails.map(value => value.toLowerCase()))].map(value => {
        const entry = entries.find(item => item.email?.toLowerCase() === value && item.jobRole === "Technician");
        if (!entry) fail("A selected technician is no longer tagged as Technician. Reload and try again.");
        return { email: value, role: "Technician" };
      });
      const coordinatorEmail = text(input.coordinatorEmail).toLowerCase();
      if (coordinatorEmail && !entries.some(item => item.email?.toLowerCase() === coordinatorEmail && ["Sales", "Support"].includes(item.jobRole))) fail("Choose a current Sales or Support coordinator.");
      const previousTechnicians = [...new Set((ticket.technicianEmails || []).map(value => text(value).toLowerCase()).filter(Boolean))].sort();
      const nextTechnicians = technicians.map(item => item.email).sort();
      const assignmentsChanged = text(ticket.coordinatorEmail).toLowerCase() !== coordinatorEmail
        || previousTechnicians.join("|") !== nextTechnicians.join("|");
      // Legacy tickets may keep their old status/names while notes are edited.
      const unchangedLegacy = !ticket.workflowVersion && !technicians.length && input.status === ticket.status;
      if (!unchangedLegacy) { try { validateWork(ticket, input.status, technicians); } catch (error) { fail(error.message); } }
      Object.assign(patch, { status: input.status, coordinatorEmail, technicianEmails: technicians.map(item => item.email), notes: text(input.notes, 10000) });
      if (assignmentsChanged) {
        const hasAssignees = !!coordinatorEmail || technicians.length > 0;
        Object.assign(patch, {
          assignedBy: hasAssignees ? text(request.auth.token.name, 150) || email : "",
          assignedByEmail: hasAssignees ? email : "",
          assignedAt: hasAssignees ? now : null,
        });
      }
      if (technicians.length || ticket.workflowVersion) Object.assign(patch, {
        technician: technicians.length === 1 ? "Technician assigned" : technicians.length > 1 ? `${technicians.length} technicians assigned` : "",
        assigneeEmail: "",
        assigneeRole: technicians.length ? "Technician" : "",
      });
      if (unchangedLegacy) delete patch.workflowVersion;
    }
    if (patch.status !== ticket.status) {
      patch.statusHistory = [...(ticket.statusHistory || [{ status: ticket.status || "received", at: ticket.createdAt || now }]), { status: patch.status, at: now }];
    }
    tx.update(ref, patch);
    tx.create(db.collection("audit_logs").doc(), { actor: email, actorId: request.auth.uid, action: "repair_updated", target: `Repair ${id}`, details: action === "payment" ? `Recorded UGX ${input.amount} (${text(input.reference)})` : action, timestamp: now });
    return { ok: true };
  });
}

export const manageRepair = onCall(request => handleRepairRequest(request, getFirestore()));

async function requirePage(request, page) {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in first.");
  const email = text(request.auth.token.email).toLowerCase();
  const snap = await getFirestore().doc("config/admins").get();
  const config = snap.data() || {};
  const admin = (config.admins || []).find(entry => entry.email?.toLowerCase() === email);
  const legacy = !admin && (config.emails || []).some(item => item.toLowerCase() === email);
  if (!legacy && (!admin || (admin.access !== "super_admin" && !admin.pages?.some(value => value === "*" || value === page)))) {
    throw new HttpsError("permission-denied", `You need ${page} access.`);
  }
}

export const listRepairPayments = onCall(async request => {
  await requirePage(request, "payments");
  const ticketId = text(request.data?.ticketId, 150);
  if (!ticketId || ticketId.includes("/")) throw new HttpsError("invalid-argument", "A repair reference is required.");
  const snap = await getFirestore().collection("repair_payments").where("ticketId", "==", ticketId).get();
  return {
    payments: snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ticketId,
        amount: data.amount || 0,
        method: data.method || "",
        reference: data.reference || "",
        recordedBy: data.recordedBy || "",
        recordedAt: data.recordedAt?.toDate?.()?.toISOString?.() || null,
      };
    }),
  };
});

export const lookupRepairStatus = onCall(async request => {
  const reference = text(request.data?.reference, 150);
  const phoneDigits = text(request.data?.phone, 40).replace(/\D/g, "");
  if (!/^[A-Za-z0-9_-]{16,150}$/.test(reference) || phoneDigits.length < 9) {
    throw new HttpsError("invalid-argument", "Enter a valid repair reference and phone number.");
  }
  const snap = await getFirestore().collection("repair_tickets").doc(reference).get();
  const ticket = snap.data();
  if (!snap.exists || !phoneMatches(ticket?.userPhone, phoneDigits)) {
    throw new HttpsError("not-found", "We could not match that repair reference and phone number.");
  }
  const publicData = publicRepairStatus(snap.id, {
    ...ticket,
    statusHistory: ticket.statusHistory?.length
      ? ticket.statusHistory
      : [{ status: ticket.status || "received", at: ticket.createdAt || null }],
  });
  return {
    reference: publicData.reference,
    service: ticket.service || "Repair",
    device: ticket.device || "Device",
    status: publicData.status,
    history: publicData.history.map(event => ({
      status: event.status,
      at: event.at?.toDate?.()?.toISOString?.() || null,
    })),
    updatedAt: publicData.updatedAt?.toDate?.()?.toISOString?.() || null,
  };
});
