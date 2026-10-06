// Pure workflow validation, shared by the callable and its regression tests.
export const REPAIR_STATUSES = ["received", "awaiting_payment", "ready_for_assignment", "in_progress", "awaiting_parts", "completed", "collected"];
const STATUS_TRANSITIONS = {
  received: ["received"],
  awaiting_payment: ["awaiting_payment"],
  ready_for_assignment: ["ready_for_assignment", "in_progress"],
  in_progress: ["in_progress", "awaiting_parts", "completed"],
  awaiting_parts: ["awaiting_parts", "in_progress", "completed"],
  completed: ["completed", "in_progress", "collected"],
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
  if (!(STATUS_TRANSITIONS[ticket.status] || [ticket.status]).includes(status)) throw new Error("That status change does not follow the repair workflow.");
  if ((technicians.length || ["ready_for_assignment", "in_progress", "awaiting_parts", "completed", "collected"].includes(status)) && !paidInFull(ticket)) throw new Error("Full payment is required before technician assignment or repair work.");
  if (["in_progress", "awaiting_parts", "completed", "collected"].includes(status) && !technicians.length) throw new Error("Assign at least one technician first.");
  if (status === "awaiting_payment" && (!ticket.amountDue || paidInFull(ticket))) throw new Error("Only unpaid quotations or LPOs can await payment.");
}

// Only this allowlisted projection should be returned by a future public lookup.
// Do not expose raw ticket documents, internal notes, payments or staff identities.
export function publicRepairStatus(id, ticket) {
  return {
    reference: ticket.trackingReference || id,
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
