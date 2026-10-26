import test from "node:test";
import assert from "node:assert/strict";
import { newRepairAssignments, paidInFull, paymentTotal, phoneMatches, validateCollectionProof, validateWork, publicRepairStatus } from "../repair-workflow.js";
const ticket = { billingType: "quotation", billingReference: "Q-1", amountDue: 100000, totalPaid: 0, status: "awaiting_payment" };
test("requires a document and accepts valid partial payments", () => {
  assert.throws(() => paymentTotal({ ...ticket, billingReference: "" }, 50000));
  const totalPaid = paymentTotal(ticket, 50000);
  assert.equal(totalPaid, 50000);
  assert.equal(paidInFull({ ...ticket, totalPaid }), false);
  assert.doesNotThrow(() => validateWork({ ...ticket, totalPaid }, "ready_for_assignment", [{ email: "tech@example.com" }]));
});
test("repair work can start before payment for quotation and LPO", () => {
  for (const billingType of ["quotation", "lpo"]) {
    const totalPaid = paymentTotal({ ...ticket, billingType, totalPaid: 40000 }, 60000);
    assert.equal(paidInFull({ ...ticket, totalPaid }), true);
    assert.doesNotThrow(() => validateWork({ ...ticket, status: "ready_for_assignment", totalPaid: 0 }, "in_progress", [{ email: "a@example.com" }, { email: "b@example.com" }]));
  }
});
test("rejects invalid money and overpayments", () => {
  for (const amount of [0, -1, 1.5, NaN, Infinity, "50", 100001]) assert.throws(() => paymentTotal(ticket, amount));
});
test("unpaid repairs can be assigned but cannot skip workflow stages", () => {
  assert.doesNotThrow(() => validateWork(ticket, "ready_for_assignment", [{ email: "tech@example.com" }]));
  for (const status of ["in_progress", "awaiting_parts", "completed", "collected"]) assert.throws(() => validateWork(ticket, status, []));
  assert.throws(() => validateWork(ticket, "received", [{ email: "tech@example.com" }]));
});
test("work requires technicians and collection follows completion", () => {
  const assigned = { ...ticket, status: "ready_for_assignment" };
  assert.throws(() => validateWork(assigned, "in_progress", []));
  assert.throws(() => validateWork(assigned, "collected", [{}]));
  assert.throws(() => validateWork({ ...assigned, status: "completed" }, "collected", [{}]), /Full payment/);
  assert.doesNotThrow(() => validateWork({ ...assigned, status: "completed", totalPaid: 100000 }, "collected", [{}]));
  assert.throws(() => validateWork({ ...assigned, status: "collected" }, "in_progress", [{}]));
});
test("status transitions follow the repair workflow", () => {
  const paid = { ...ticket, status: "ready_for_assignment", totalPaid: 100000 };
  assert.throws(() => validateWork(paid, "completed", [{}]));
  assert.doesNotThrow(() => validateWork(paid, "in_progress", [{}]));
  assert.doesNotThrow(() => validateWork({ ...paid, status: "in_progress" }, "awaiting_parts", [{}]));
  assert.doesNotThrow(() => validateWork({ ...paid, status: "awaiting_parts" }, "completed", [{}]));
  assert.doesNotThrow(() => validateWork({ ...paid, status: "completed" }, "collected", [{}]));
});
test("version two work starts before payment and payment unlocks collection", () => {
  const approved = { workflowVersion: 2, status: "approved_for_repair", amountDue: 100000, totalPaid: 0 };
  assert.doesNotThrow(() => validateWork(approved, "in_progress", [{ id: "tech-1" }]));
  assert.doesNotThrow(() => validateWork({ ...approved, status: "in_progress" }, "completed_awaiting_payment", [{ id: "tech-1" }]));
  assert.throws(() => validateWork({ ...approved, status: "completed_awaiting_payment" }, "ready_for_collection", [{ id: "tech-1" }]), /Full payment/);
  assert.doesNotThrow(() => validateWork({ ...approved, status: "completed_awaiting_payment", totalPaid: 100000 }, "ready_for_collection", [{ id: "tech-1" }]));
});
test("version two collection requires the exact original job-card number", () => {
  assert.throws(() => validateCollectionProof("ticket-1", { collectorName: "Pat", collectorPhone: "0700000000" }, "JC-2026-000001"), /original job-card/i);
  assert.doesNotThrow(() => validateCollectionProof("ticket-1", { jobCardPresented: true, presentedJobCardNumber: "jc-2026-000001", collectorName: "Pat", collectorPhone: "0700000000" }, "JC-2026-000001"));
});
test("collection requires a matching job-card photo or collector identity", () => {
  assert.throws(() => validateCollectionProof("ticket-1", {}), /job card.*name and telephone/i);
  assert.throws(() => validateCollectionProof("ticket-1", { collectorName: "Pat", collectorPhone: "123" }), /job card.*name and telephone/i);
  assert.deepEqual(validateCollectionProof("ticket-1", { collectorName: "Pat Customer", collectorPhone: "0700 000 000" }), {
    proofPath: "", proofUrl: "", collectorName: "Pat Customer", collectorPhone: "0700 000 000",
  });
  const collectionProofPath = "repair-collection-proofs/ticket-1/card.jpg";
  const collectionProofUrl = `https://firebasestorage.googleapis.com/v0/b/example.appspot.com/o/${encodeURIComponent(collectionProofPath)}?alt=media&token=test`;
  assert.deepEqual(validateCollectionProof("ticket-1", { collectionProofPath, collectionProofUrl }), {
    proofPath: collectionProofPath, proofUrl: collectionProofUrl, collectorName: "", collectorPhone: "",
  });
  assert.throws(() => validateCollectionProof("ticket-2", { collectionProofPath, collectionProofUrl }), /valid job-card photo/i);
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
