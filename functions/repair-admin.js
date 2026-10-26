import { createHash } from "node:crypto";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { paidInFull, paymentTotal, phoneMatches, publicRepairStatus, validateCollectionProof, validateWork } from "./repair-workflow.js";
import { adminHasAnyDashboard, adminHasDashboard, adminHasPage } from "./admin-access.js";
import { prepareRepairJobCard } from "./repair-job-card.js";

function text(value, max = 300) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
function fail(message) { throw new HttpsError("failed-precondition", message); }

export async function handleRepairRequest(request, db) {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in first.");
  const input = request.data || {};
  const id = text(input.id, 150);
  if (!id || id.includes("/")) throw new HttpsError("invalid-argument", "A repair reference is required.");
  const action = input.action;
  if (!["create", "pickup", "billing", "approve", "payment", "update", "technician_update", "collect", "delete"].includes(action)) throw new HttpsError("invalid-argument", "Unknown action.");
  const email = text(request.auth.token.email).toLowerCase();
  const ref = db.collection("repair_tickets").doc(id);
  return db.runTransaction(async tx => {
    const [configSnap, ticketSnap] = await Promise.all([tx.get(db.doc("config/admins")), tx.get(ref)]);
    const config = configSnap.data() || {};
    const entries = config.admins || [];
    const admin = entries.find(entry => entry.email?.toLowerCase() === email);
    const legacy = !admin && (config.emails || []).some(item => item.toLowerCase() === email);
    const repairAction = ["create", "pickup", "approve", "update", "collect", "delete"].includes(action);
    const page = repairAction ? "repairs" : "payments";
    if (action === "technician_update") {
      if (!admin || admin.jobRole !== "Technician" || !adminHasDashboard(admin, "workshop")) throw new HttpsError("permission-denied", "Only assigned technicians with Workshop access can update this job.");
    } else if (!legacy && (!admin || !adminHasPage(admin, page) || (repairAction ? !adminHasDashboard(admin, "workshop") : !adminHasAnyDashboard(admin)))) {
      throw new HttpsError("permission-denied", `You need ${page} access.`);
    }
    if (action === "delete" && !legacy && admin?.access !== "super_admin") {
      throw new HttpsError("permission-denied", "Only super admins can delete repair tickets.");
    }
    if (action === "create") {
      if (ticketSnap.exists) return { ok: true, duplicate: true };
      if (!text(input.userName) || !text(input.userPhone) || !text(input.device) || !text(input.issue, 3000)) fail("Enter the customer name, phone, device and issue.");
      const now = Timestamp.now();
      tx.create(ref, { userId: "", userName: text(input.userName), userPhone: text(input.userPhone), userEmail: text(input.userEmail), device: text(input.device), issue: text(input.issue, 3000), service: text(input.service) || "Repair", status: "request_submitted", technician: "", technicianIds: [], technicianEmails: [], coordinatorEmail: "", notes: "", totalPaid: 0, workflowVersion: 2, trackingReference: id, createdAt: now, updatedAt: now, statusHistory: [{ status: "request_submitted", at: now }] });
      tx.create(db.collection("audit_logs").doc(), { actor: email, actorId: request.auth.uid, action: "repair_created", target: `Repair ${id}`, details: "Walk-in repair intake", timestamp: now });
      return { ok: true, id };
    }
    if (!ticketSnap.exists) throw new HttpsError("not-found", "Repair not found.");
    const ticket = ticketSnap.data();
    const now = Timestamp.now();
    if (action === "delete") {
      tx.delete(ref);
      tx.create(db.collection("audit_logs").doc(), {
        actor: email,
        actorId: request.auth.uid,
        action: "repair_deleted",
        target: `Repair ${ticket.trackingReference || id}`,
        details: `${text(ticket.userName, 150) || text(ticket.userEmail, 320) || "Customer"} · ${text(ticket.device, 300) || "Device"}`,
        timestamp: now,
      });
      return { ok: true, deleted: true };
    }
    const patch = { updatedAt: FieldValue.serverTimestamp(), trackingReference: ticket.trackingReference || id, workflowVersion: ticket.workflowVersion || 1 };
    if (action === "pickup") {
      if (!input._trustedJobCard || !text(input.jobCardNumber) || !text(input.jobCardPath)) fail("Generate the job card before marking this device as picked up.");
      if (!["request_submitted", "received"].includes(ticket.status)) {
        if (ticket.status === "under_diagnosis" && ticket.jobCardNumber === input.jobCardNumber) return { ok: true, duplicate: true };
        fail("Only a submitted repair can be marked as picked up.");
      }
      const pickedUpAt = input.pickedUpAt instanceof Timestamp ? input.pickedUpAt : now;
      Object.assign(patch, {
        status: "under_diagnosis",
        workflowVersion: 2,
        jobCardNumber: text(input.jobCardNumber),
        jobCardPath: text(input.jobCardPath, 500),
        jobCardGenerationStatus: "ready",
        jobCardGeneratedAt: now,
        pickedUpAt,
        pickedUpBy: text(input.receivedByName, 150) || email,
        diagnosisStartedAt: pickedUpAt,
        diagnosisDueAt: Timestamp.fromMillis(pickedUpAt.toMillis() + 48 * 60 * 60 * 1000),
      });
    }
    if (action === "billing") {
      if ((ticket.totalPaid || 0) > 0) fail("The quotation/LPO is locked after the first payment.");
      const v2 = ticket.workflowVersion >= 2;
      if (!(v2 ? ["under_diagnosis", "quotation_sent"] : ["received", "awaiting_payment"]).includes(ticket.status)) fail(v2 ? "Complete diagnosis before sending the quotation." : "Billing can only be set before repair work begins.");
      if (!["quotation", "lpo"].includes(input.billingType) || !text(input.billingReference)) fail("Choose a quotation or LPO and enter its reference.");
      if (!Number.isSafeInteger(input.amountDue) || input.amountDue <= 0) fail("Enter a positive whole UGX amount.");
      Object.assign(patch, {
        billingType: input.billingType,
        billingReference: text(input.billingReference),
        amountDue: input.amountDue,
        totalPaid: ticket.totalPaid || 0,
        currency: "UGX",
        diagnosisSummary: text(input.diagnosisSummary, 3000),
        recommendedWork: text(input.recommendedWork, 3000),
        diagnosedAt: ticket.diagnosedAt || now,
        diagnosedBy: ticket.diagnosedBy || text(request.auth.token.name, 150) || email,
        status: v2 ? "quotation_sent" : "awaiting_payment",
      });
    }
    if (action === "approve") {
      if (ticket.workflowVersion < 2 || ticket.status !== "quotation_sent" || !ticket.amountDue) fail("Send the diagnosed quotation before recording approval.");
      Object.assign(patch, { status: "approved_for_repair", customerApprovalStatus: "approved", approvedAt: now, approvedBy: text(request.auth.token.name, 150) || email, approvalReference: text(input.approvalReference, 300) });
    }
    if (action === "payment") {
      const paymentStatuses = ticket.workflowVersion >= 2 ? ["completed_awaiting_payment", "ready_for_collection"] : ["completed"];
      if (!paymentStatuses.includes(ticket.status)) fail("Payment can only be recorded after the repair is completed.");
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
      Object.assign(patch, { totalPaid: total, status: ticket.workflowVersion >= 2 ? (total === ticket.amountDue ? "ready_for_collection" : "completed_awaiting_payment") : "completed" });
    }
    if (action === "update") {
      const v2 = ticket.workflowVersion >= 2;
      let technicians = [];
      if (v2) {
        const technicianIds = input.technicianIds;
        if (!Array.isArray(technicianIds) || technicianIds.length > 20 || technicianIds.some(value => typeof value !== "string" || !value || value.includes("/"))) fail("Choose up to 20 technicians.");
        for (const technicianId of [...new Set(technicianIds)]) {
          const technicianSnap = await tx.get(db.collection("technicians").doc(technicianId));
          const technician = technicianSnap.data();
          if (!technicianSnap.exists || technician.active === false) fail("A selected technician is no longer available. Reload and try again.");
          technicians.push({ id: technicianId, name: text(technician.name, 150), phone: text(technician.phone, 40), authUid: text(technician.authUid, 150), email: text(technician.email).toLowerCase(), role: "Technician" });
        }
      } else {
        const technicianEmails = input.technicianEmails;
        if (!Array.isArray(technicianEmails) || technicianEmails.length > 20 || technicianEmails.some(value => typeof value !== "string")) fail("Choose up to 20 technicians.");
        technicians = [...new Set(technicianEmails.map(value => value.toLowerCase()))].map(value => {
          const entry = entries.find(item => item.email?.toLowerCase() === value && item.jobRole === "Technician");
          if (!entry) fail("A selected technician is no longer tagged as Technician. Reload and try again.");
          return { email: value, role: "Technician" };
        });
      }
      const coordinatorEmail = text(input.coordinatorEmail).toLowerCase();
      if (coordinatorEmail && !entries.some(item => item.email?.toLowerCase() === coordinatorEmail && ["Sales", "Support"].includes(item.jobRole))) fail("Choose a current Sales or Support coordinator.");
      const previousTechnicians = v2 ? [...new Set(ticket.technicianIds || [])].sort() : [...new Set((ticket.technicianEmails || []).map(value => text(value).toLowerCase()).filter(Boolean))].sort();
      const nextTechnicians = technicians.map(item => v2 ? item.id : item.email).sort();
      const assignmentsChanged = text(ticket.coordinatorEmail).toLowerCase() !== coordinatorEmail
        || previousTechnicians.join("|") !== nextTechnicians.join("|");
      if (input.status === "collected" && ticket.status !== "collected") {
        fail("Record collection proof before marking this repair as collected.");
      }
      const leadTechnicianId = v2 ? text(input.leadTechnicianId, 150) || technicians[0]?.id || "" : "";
      if (v2 && leadTechnicianId && !technicians.some(item => item.id === leadTechnicianId)) fail("Choose a lead technician from the assigned team.");
      const lead = technicians.find(item => item.id === leadTechnicianId);
      let nextStatus = input.status;
      if (!v2 && ticket.status === "awaiting_payment" && nextStatus === "awaiting_payment" && technicians.length) nextStatus = "ready_for_assignment";
      const autoStarted = v2 && ticket.status === "approved_for_repair" && nextStatus === "approved_for_repair" && assignmentsChanged && lead && !lead.authUid;
      if (autoStarted) nextStatus = "in_progress";
      if (v2 && nextStatus !== ticket.status && !autoStarted) {
        const coordinatorTransitions = {
          in_progress: ["awaiting_parts", "completed_awaiting_payment"],
          awaiting_parts: ["in_progress", "completed_awaiting_payment"],
        };
        if (!(coordinatorTransitions[ticket.status] || []).includes(nextStatus)) {
          fail("Use the dedicated pickup, diagnosis, approval, payment or collection action for this status change.");
        }
      }
      // Legacy tickets may keep their old status/names while notes are edited.
      const unchangedLegacy = !ticket.workflowVersion && !technicians.length && input.status === ticket.status;
      if (!unchangedLegacy) { try { validateWork(ticket, nextStatus, technicians); } catch (error) { fail(error.message); } }
      Object.assign(patch, { status: nextStatus, coordinatorEmail, notes: text(input.notes, 10000) });
      if (v2) Object.assign(patch, {
        technicianIds: technicians.map(item => item.id),
        leadTechnicianId,
        technicianSnapshots: technicians.map(item => ({ id: item.id, name: item.name, phone: item.phone, authUid: item.authUid, email: item.email })),
        technicianAuthUids: technicians.map(item => item.authUid).filter(Boolean),
        technicianEmails: technicians.map(item => item.email).filter(Boolean),
      });
      else patch.technicianEmails = technicians.map(item => item.email);
      if (assignmentsChanged) {
        const hasAssignees = !!coordinatorEmail || technicians.length > 0;
        Object.assign(patch, {
          assignedBy: hasAssignees ? text(request.auth.token.name, 150) || email : "",
          assignedByEmail: hasAssignees ? email : "",
          assignedAt: hasAssignees ? now : null,
        });
      }
      if (technicians.length || ticket.workflowVersion) Object.assign(patch, {
        technician: technicians.length === 1 ? (technicians[0].name || "Technician assigned") : technicians.length > 1 ? `${technicians.length} technicians assigned` : "",
        assigneeEmail: "",
        assigneeRole: technicians.length ? "Technician" : "",
      });
      if (autoStarted) Object.assign(patch, { startedAt: now, startedBy: lead.name, startedByTechnicianId: lead.id, startedByMode: "automatic_assignment" });
      if (unchangedLegacy) delete patch.workflowVersion;
    }
    if (action === "collect") {
      let proof;
      try { proof = validateCollectionProof(id, input, ticket.workflowVersion >= 2 ? ticket.jobCardNumber : ""); } catch (error) { fail(error.message); }
      if (ticket.status === "collected") {
        const sameEvidence = (ticket.collectionProofPath || "") === proof.proofPath
          && (ticket.collectorName || "") === proof.collectorName
          && (ticket.collectorPhone || "") === proof.collectorPhone;
        if (sameEvidence) return { ok: true, duplicate: true };
        fail("This repair has already been collected.");
      }
      const collectionReadyStatus = ticket.workflowVersion >= 2 ? "ready_for_collection" : "completed";
      if (ticket.status !== collectionReadyStatus) fail(ticket.workflowVersion >= 2 ? "Complete payment before releasing this repair." : "Only a completed repair can be marked as collected.");
      const assigned = ticket.workflowVersion >= 2 ? (ticket.technicianIds || []).map(id => ({ id })) : (ticket.technicianEmails || []).map(email => ({ email }));
      try { validateWork(ticket, "collected", assigned); } catch (error) { fail(error.message); }
      Object.assign(patch, {
        status: "collected",
        notes: text(input.notes, 10000),
        collectionProofPath: proof.proofPath,
        collectionProofUrl: proof.proofUrl,
        collectorName: proof.collectorName,
        collectorPhone: proof.collectorPhone,
        jobCardPresented: ticket.workflowVersion >= 2 ? true : !!input.jobCardPresented,
        presentedJobCardNumber: ticket.workflowVersion >= 2 ? ticket.jobCardNumber : text(input.presentedJobCardNumber),
        collectionNotes: text(input.collectionNotes, 3000),
        collectionRecordedBy: text(request.auth.token.name, 150) || email,
        collectionRecordedByEmail: email,
        collectedAt: now,
      });
    }
    if (action === "technician_update") {
      const v2 = ticket.workflowVersion >= 2;
      const assignedTechnicians = (ticket.technicianEmails || []).map(value => text(value).toLowerCase());
      const assignedAccount = (ticket.technicianSnapshots || []).some(item => item.authUid === request.auth.uid || text(item.email).toLowerCase() === email);
      if (!(v2 ? assignedAccount : assignedTechnicians.includes(email))) throw new HttpsError("permission-denied", "This job is not assigned to you.");
      const jobAction = input.jobAction;
      const actorName = text(request.auth.token.name, 150) || email;
      if (jobAction === "start") {
        if (ticket.status !== (v2 ? "approved_for_repair" : "ready_for_assignment")) fail("This job is not ready to start.");
        Object.assign(patch, {
          status: "in_progress",
          startedBy: actorName,
          startedByEmail: email,
          startedAt: now,
        });
      } else if (jobAction === "complete") {
        if (!["in_progress", "awaiting_parts"].includes(ticket.status)) fail("Start this job before completing it.");
        Object.assign(patch, {
          status: v2 ? "completed_awaiting_payment" : "completed",
          completionNotes: text(input.notes, 3000),
          completedBy: actorName,
          completedByEmail: email,
          completedAt: now,
        });
      } else {
        throw new HttpsError("invalid-argument", "Choose start or complete.");
      }
    }
    if (patch.status !== ticket.status) {
      patch.statusHistory = [...(ticket.statusHistory || [{ status: ticket.status || "received", at: ticket.createdAt || now }]), { status: patch.status, at: now }];
    }
    tx.update(ref, patch);
    const auditAction = action === "technician_update" ? `repair_job_${input.jobAction}` : action === "collect" ? "repair_collected" : "repair_updated";
    const auditDetails = action === "payment"
      ? `Recorded UGX ${input.amount} (${text(input.reference)})`
      : action === "technician_update" && input.jobAction === "complete"
        ? text(input.notes, 3000) ? "Completed job with a note" : "Completed job"
        : action === "collect"
          ? input.collectionProofPath ? "Released with job-card photo" : `Released to ${text(input.collectorName, 150)}`
          : action;
    tx.create(db.collection("audit_logs").doc(), { actor: email, actorId: request.auth.uid, action: auditAction, target: `Repair ${id}`, details: auditDetails, timestamp: now });
    return { ok: true };
  });
}

export const manageRepair = onCall(async request => {
  if (request.data?.action === "pickup") {
    const db = getFirestore();
    const prepared = await prepareRepairJobCard(request, db, getStorage().bucket());
    const result = await handleRepairRequest({ ...request, data: { ...request.data, ...prepared, _trustedJobCard: true } }, db);
    return { ...result, jobCardNumber: prepared.jobCardNumber, pdfBase64: prepared.pdfBase64 };
  }
  if (request.data?.action === "collect" && request.data?.collectionProofPath) {
    const id = text(request.data?.id, 150);
    let proof;
    try { proof = validateCollectionProof(id, request.data); } catch (error) { fail(error.message); }
    const [exists] = await getStorage().bucket().file(proof.proofPath).exists();
    if (!exists) fail("The job-card photo could not be found. Upload it again.");
  }
  return handleRepairRequest(request, getFirestore());
});

async function requirePage(request, page) {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in first.");
  const email = text(request.auth.token.email).toLowerCase();
  const snap = await getFirestore().doc("config/admins").get();
  const config = snap.data() || {};
  const admin = (config.admins || []).find(entry => entry.email?.toLowerCase() === email);
  const legacy = !admin && (config.emails || []).some(item => item.toLowerCase() === email);
  if (!legacy && (!admin || !adminHasPage(admin, page) || !adminHasAnyDashboard(admin))) {
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
  if (!/^[A-Za-z0-9_-]{8,150}$/.test(reference) || phoneDigits.length < 9) {
    throw new HttpsError("invalid-argument", "Enter a valid repair reference and phone number.");
  }
  const repairs = getFirestore().collection("repair_tickets");
  let snap = await repairs.doc(reference).get();
  if (!snap.exists) {
    const byJobCard = await repairs.where("jobCardNumber", "==", reference.toUpperCase()).limit(1).get();
    if (!byJobCard.empty) snap = byJobCard.docs[0];
  }
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
