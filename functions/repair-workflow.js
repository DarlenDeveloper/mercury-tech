// Pure workflow validation, shared by the callable and its regression tests.
export const REPAIR_STATUSES = [
  "received", "awaiting_payment", "ready_for_assignment", "completed",
  "request_submitted", "under_diagnosis", "quotation_sent", "approved_for_repair",
  "in_progress", "awaiting_parts", "completed_awaiting_payment", "ready_for_collection", "collected",
];
const STATUS_TRANSITIONS = {
  received: ["received"],
  awaiting_payment: ["awaiting_payment", "ready_for_assignment"],
  ready_for_assignment: ["ready_for_assignment", "in_progress"],
  in_progress: ["in_progress", "awaiting_parts", "completed"],
  awaiting_parts: ["awaiting_parts", "in_progress", "completed"],
  completed: ["completed", "in_progress", "collected"],
  collected: ["collected"],
};
const V2_STATUS_TRANSITIONS = {
  request_submitted: ["request_submitted"],
  under_diagnosis: ["under_diagnosis", "quotation_sent"],
  quotation_sent: ["quotation_sent", "approved_for_repair"],
  approved_for_repair: ["approved_for_repair", "in_progress"],
  in_progress: ["in_progress", "awaiting_parts", "completed_awaiting_payment"],
  awaiting_parts: ["awaiting_parts", "in_progress", "completed_awaiting_payment"],
  completed_awaiting_payment: ["completed_awaiting_payment", "ready_for_collection"],
  ready_for_collection: ["ready_for_collection", "collected"],
  collected: ["collected"],
};
export function paidInFull(ticket) {
  return Number.isSafeInteger(ticket.amountDue) && ticket.amountDue > 0 && (ticket.totalPaid || 0) >= ticket.amountDue;
}
export function paymentTotal(ticket, amount) {
  if (!ticket.billingReference || !["quotation", "lpo"].includes(ticket.billingType)) throw new Error("Save a quotation or LPO before recording payment.");
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("Enter a positive whole UGX amount.");
  if (!Number.isSafeInteger(ticket.amountDue) || ticket.amountDue <= 0) throw new Error("Set the amount due first.");
  const total = (ticket.totalPaid || 0) + amount;
  if (!Number.isSafeInteger(total) || total > ticket.amountDue) throw new Error("Payment exceeds the outstanding balance.");
  return total;
}
export function validateWork(ticket, status, technicians) {
  if (!REPAIR_STATUSES.includes(status)) throw new Error("Choose a valid repair status.");
  const transitions = ticket.workflowVersion >= 2 ? V2_STATUS_TRANSITIONS : STATUS_TRANSITIONS;
  if (!(transitions[ticket.status] || [ticket.status]).includes(status)) throw new Error("That status change does not follow the repair workflow.");
  if (ticket.workflowVersion >= 2) {
    if (["in_progress", "awaiting_parts", "completed_awaiting_payment", "ready_for_collection", "collected"].includes(status) && !technicians.length) throw new Error("Assign at least one technician first.");
    if (status === "ready_for_collection" && !paidInFull(ticket)) throw new Error("Full payment is required before collection.");
    return;
  }
  if (["in_progress", "awaiting_parts", "completed", "collected"].includes(status) && !technicians.length) throw new Error("Assign at least one technician first.");
  if (status === "collected" && !paidInFull(ticket)) throw new Error("Full payment is required before collection.");
}

function firebaseDownloadMatchesPath(url, path) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.hostname !== "firebasestorage.googleapis.com") return false;
    const marker = "/o/";
    const markerIndex = parsed.pathname.indexOf(marker);
    if (markerIndex < 0) return false;
    return decodeURIComponent(parsed.pathname.slice(markerIndex + marker.length)) === path;
  } catch {
    return false;
  }
}

/** Validate the evidence required before a completed repair is released. */
export function validateCollectionProof(ticketId, input = {}, requiredJobCardNumber = "") {
  const proofPath = typeof input.collectionProofPath === "string" ? input.collectionProofPath.trim() : "";
  const proofUrl = typeof input.collectionProofUrl === "string" ? input.collectionProofUrl.trim() : "";
  const collectorName = typeof input.collectorName === "string" ? input.collectorName.trim().slice(0, 150) : "";
  const collectorPhone = typeof input.collectorPhone === "string" ? input.collectorPhone.trim().slice(0, 40) : "";
  const phoneDigits = collectorPhone.replace(/\D/g, "");
  const hasPhoto = !!proofPath || !!proofUrl;

  if (requiredJobCardNumber) {
    const presentedNumber = typeof input.presentedJobCardNumber === "string" ? input.presentedJobCardNumber.trim().toUpperCase() : "";
    if (input.jobCardPresented !== true || presentedNumber !== requiredJobCardNumber.trim().toUpperCase()) {
      throw new Error("Confirm and enter the original job-card number before releasing this device.");
    }
  }

  if (hasPhoto) {
    const prefix = `repair-collection-proofs/${ticketId}/`;
    const fileName = proofPath.startsWith(prefix) ? proofPath.slice(prefix.length) : "";
    if (!proofPath || !proofUrl || !fileName || fileName.includes("/") || !/^[a-zA-Z0-9._-]{1,180}$/.test(fileName)) {
      throw new Error("Upload a valid job-card photo for this repair.");
    }
    if (!firebaseDownloadMatchesPath(proofUrl, proofPath)) {
      throw new Error("The job-card photo does not match this repair.");
    }
  }

  if (!hasPhoto && (!collectorName || phoneDigits.length < 9 || phoneDigits.length > 15)) {
    throw new Error("Attach the job card, or enter the collector's name and telephone number.");
  }
  if (collectorPhone && (phoneDigits.length < 9 || phoneDigits.length > 15)) {
    throw new Error("Enter a valid collector telephone number.");
  }

  return { proofPath, proofUrl, collectorName, collectorPhone };
}

// Only this allowlisted projection should be returned by a future public lookup.
// Do not expose raw ticket documents, internal notes, payments or staff identities.
export function publicRepairStatus(id, ticket) {
  return {
    reference: ticket.jobCardNumber || ticket.trackingReference || id,
    status: ticket.status || "received",
    history: (ticket.statusHistory || []).map(event => ({ status: event.status, at: event.at })),
    updatedAt: ticket.updatedAt || null,
  };
}

export function phoneMatches(stored, supplied) {
  const storedDigits = String(stored || "").replace(/\D/g, "");
  const suppliedDigits = String(supplied || "").replace(/\D/g, "");
  return storedDigits.length >= 9
    && suppliedDigits.length >= 9
    && storedDigits.slice(-9) === suppliedDigits.slice(-9);
}

function normalizedEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizedEmailList(values) {
  return Array.isArray(values)
    ? [...new Set(values.map(normalizedEmail).filter(Boolean))]
    : [];
}

/** Return only people newly added to a repair assignment. */
export function newRepairAssignments(before = {}, after = {}) {
  const assignments = [];
  const seen = new Set();
  const previousCoordinator = normalizedEmail(before.coordinatorEmail);
  const coordinator = normalizedEmail(after.coordinatorEmail);

  if (coordinator && coordinator !== previousCoordinator) {
    assignments.push({ email: coordinator, role: "Sales / Support" });
    seen.add(coordinator);
  }

  const previousTechnicians = new Set(normalizedEmailList(before.technicianEmails));
  for (const email of normalizedEmailList(after.technicianEmails)) {
    if (!previousTechnicians.has(email) && !seen.has(email)) {
      assignments.push({ email, role: "Technician" });
      seen.add(email);
    }
  }

  return assignments;
}
