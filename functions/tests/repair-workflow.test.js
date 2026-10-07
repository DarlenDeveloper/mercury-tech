import test from "node:test";
import assert from "node:assert/strict";
import { newRepairAssignments, paidInFull, paymentTotal, phoneMatches, validateWork, publicRepairStatus } from "../repair-workflow.js";
const ticket = { billingType: "quotation", billingReference: "Q-1", amountDue: 100000, totalPaid: 0, status: "awaiting_payment" };
test("requires a document and accepts partial payments without unlocking work", () => {
  assert.throws(() => paymentTotal({ ...ticket, billingReference: "" }, 50000));
  const totalPaid = paymentTotal(ticket, 50000);
  assert.equal(totalPaid, 50000);
  assert.equal(paidInFull({ ...ticket, totalPaid }), false);
  assert.throws(() => validateWork({ ...ticket, totalPaid }, "in_progress", [{ email: "tech@example.com" }]));
});
test("full payment unlocks multiple technicians for quotation and LPO", () => {
  for (const billingType of ["quotation", "lpo"]) {
    const totalPaid = paymentTotal({ ...ticket, billingType, totalPaid: 40000 }, 60000);
    assert.equal(paidInFull({ ...ticket, totalPaid }), true);
    assert.doesNotThrow(() => validateWork({ ...ticket, status: "ready_for_assignment", totalPaid }, "in_progress", [{ email: "a@example.com" }, { email: "b@example.com" }]));
  }
});
test("rejects invalid money and overpayments", () => {
  for (const amount of [0, -1, 1.5, NaN, Infinity, "50", 100001]) assert.throws(() => paymentTotal(ticket, amount));
});
test("unpaid repairs cannot skip to technical stages", () => {
  for (const status of ["ready_for_assignment", "in_progress", "awaiting_parts", "completed", "collected"]) assert.throws(() => validateWork(ticket, status, []));
  assert.throws(() => validateWork(ticket, "received", [{ email: "tech@example.com" }]));
});
test("work requires technicians and collection follows completion", () => {
  const paid = { ...ticket, status: "ready_for_assignment", totalPaid: 100000 };
  assert.throws(() => validateWork(paid, "in_progress", []));
  assert.throws(() => validateWork(paid, "collected", [{}]));
  assert.doesNotThrow(() => validateWork({ ...paid, status: "completed" }, "collected", [{}]));
  assert.throws(() => validateWork({ ...paid, status: "collected" }, "in_progress", [{}]));
});
test("status transitions follow the repair workflow", () => {
  const paid = { ...ticket, status: "ready_for_assignment", totalPaid: 100000 };
  assert.throws(() => validateWork(paid, "completed", [{}]));
  assert.doesNotThrow(() => validateWork(paid, "in_progress", [{}]));
  assert.doesNotThrow(() => validateWork({ ...paid, status: "in_progress" }, "awaiting_parts", [{}]));
  assert.doesNotThrow(() => validateWork({ ...paid, status: "awaiting_parts" }, "completed", [{}]));
  assert.doesNotThrow(() => validateWork({ ...paid, status: "completed" }, "collected", [{}]));
});
test("future public status excludes private customer, financial and staff data", () => {
  assert.deepEqual(publicRepairStatus("random-reference", { ...ticket, userPhone: "private", userEmail: "private", notes: "private", technicianEmails: ["private"], statusHistory: [{ status: "received", at: 123, actor: "private" }] }), {
    reference: "random-reference", status: "awaiting_payment", history: [{ status: "received", at: 123 }], updatedAt: null,
  });
});
test("public phone verification handles Uganda formats without accepting short suffixes", () => {
  assert.equal(phoneMatches("0704 823 800", "+256 704 823800"), true);
  assert.equal(phoneMatches("+256704823800", "0704823800"), true);
  assert.equal(phoneMatches("+256704823800", "823800"), false);
  assert.equal(phoneMatches("+256704823800", "+256704823801"), false);
});
test("assignment notifications include only newly assigned staff", () => {
  assert.deepEqual(newRepairAssignments(
    { coordinatorEmail: "old-sales@example.com", technicianEmails: ["existing@example.com"] },
    { coordinatorEmail: "new-sales@example.com", technicianEmails: ["existing@example.com", "NEW-TECH@example.com", "new-tech@example.com"] },
  ), [
    { email: "new-sales@example.com", role: "Sales / Support" },
    { email: "new-tech@example.com", role: "Technician" },
  ]);
  assert.deepEqual(newRepairAssignments(
    { coordinatorEmail: "sales@example.com", technicianEmails: ["tech@example.com"] },
    { coordinatorEmail: "SALES@example.com", technicianEmails: ["TECH@example.com"] },
  ), []);
});
