import test from "node:test";
import assert from "node:assert/strict";
import { handleRepairRequest } from "../repair-admin.js";

function database() {
  const docs = new Map([
    ["config/admins", { admins: [
      { email: "sales@example.com", access: "admin", pages: ["repairs", "payments"], jobRole: "Sales" },
      { email: "tech@example.com", access: "admin", pages: ["repairs"], jobRole: "Technician" },
      { email: "tech2@example.com", access: "admin", pages: ["repairs"], jobRole: "Technician" },
    ], emails: [] }],
    ["repair_tickets/ticket-1", { userName: "Customer", status: "received", totalPaid: 0, workflowVersion: 1, technicianEmails: [] }],
  ]);
  let counter = 0;
  let queue = Promise.resolve();
  const db = {
    docs,
    doc: path => ({ path }),
    collection: name => ({ doc: id => ({ path: `${name}/${id || `generated-${++counter}`}` }) }),
    runTransaction(callback) {
      const run = queue.then(async () => {
        const pending = [];
        const result = await callback({
          get: async ref => ({ exists: docs.has(ref.path), data: () => docs.get(ref.path) }),
          create: (ref, data) => pending.push(() => { assert.equal(docs.has(ref.path), false); docs.set(ref.path, data); }),
          update: (ref, data) => pending.push(() => docs.set(ref.path, { ...docs.get(ref.path), ...data })),
        });
        pending.forEach(write => write());
        return result;
      });
      queue = run.catch(() => {});
      return run;
    },
  };
  return db;
}
const request = (action, data = {}, email = "sales@example.com") => ({ auth: { uid: email, token: { email } }, data: { action, id: "ticket-1", ...data } });
async function billed(db) { await handleRepairRequest(request("billing", { billingType: "lpo", billingReference: "LPO-1", amountDue: 100000 }), db); }
const receipt = (amount, paymentId = "payment-request-0001", reference = "RECEIPT-1") => request("payment", { amount, paymentId, reference, method: "cash" });
test("payment permission is separate from repair permission", async () => {
  const db = database();
  await assert.rejects(handleRepairRequest(request("billing", { amountDue: 100 }, "tech@example.com"), db), /payments access/);
  await assert.rejects(handleRepairRequest({ data: {} }, db), /Sign in/);
});
test("receipt retries are idempotent, including a new request ID with the same receipt", async () => {
  const db = database(); await billed(db);
  await handleRepairRequest(receipt(40000), db);
  await handleRepairRequest(receipt(40000), db);
  assert.equal(db.docs.get("repair_tickets/ticket-1").totalPaid, 40000);
  await assert.rejects(handleRepairRequest(receipt(40000, "payment-request-0002"), db), /already recorded/);
  assert.equal([...db.docs.keys()].filter(key => key.startsWith("repair_payments/")).length, 1);
});
test("competing payments cannot exceed the outstanding balance", async () => {
  const db = database(); await billed(db);
  const results = await Promise.allSettled([handleRepairRequest(receipt(70000), db), handleRepairRequest(receipt(70000, "payment-request-0002", "RECEIPT-2"), db)]);
  assert.equal(results.filter(result => result.status === "fulfilled").length, 1);
  assert.equal(db.docs.get("repair_tickets/ticket-1").totalPaid, 70000);
});
test("coordinator before payment, multiple validated technicians after payment", async () => {
  const db = database();
  await handleRepairRequest(request("update", { status: "received", coordinatorEmail: "sales@example.com", technicianEmails: [], notes: "Private" }), db);
  assert.equal(db.docs.get("repair_tickets/ticket-1").assignedBy, "sales@example.com");
  assert.equal(db.docs.get("repair_tickets/ticket-1").assignedByEmail, "sales@example.com");
  await assert.rejects(handleRepairRequest(request("update", { status: "in_progress", technicianEmails: ["tech@example.com"] }), db), /workflow|Full payment/);
  await billed(db); await handleRepairRequest(receipt(100000), db);
  await handleRepairRequest(request("update", { status: "in_progress", technicianEmails: ["tech@example.com", "tech2@example.com"], coordinatorEmail: "sales@example.com" }), db);
  const ticket = db.docs.get("repair_tickets/ticket-1");
  assert.equal(ticket.status, "in_progress");
  assert.equal(ticket.technicianEmails.length, 2);
  assert.equal(ticket.technician, "2 technicians assigned");
  assert.equal(ticket.assigneeEmail, "");
  assert.deepEqual(ticket.statusHistory.map(event => event.status), ["received", "awaiting_payment", "ready_for_assignment", "in_progress"]);
  await assert.rejects(handleRepairRequest(request("update", { status: "in_progress", technicianEmails: ["sales@example.com"] }), db), /no longer tagged/);
  await assert.rejects(handleRepairRequest(request("billing", { billingType: "lpo", billingReference: "LPO-2", amountDue: 1 }), db), /locked/);
});
test("legacy technician names survive a notes-only edit", async () => {
  const db = database(); db.docs.set("repair_tickets/ticket-1", { status: "in_progress", technician: "Existing technician" });
  await handleRepairRequest(request("update", { status: "in_progress", technicianEmails: [], notes: "Updated note" }), db);
  assert.equal(db.docs.get("repair_tickets/ticket-1").technician, "Existing technician");
  assert.equal(db.docs.get("repair_tickets/ticket-1").notes, "Updated note");
});
test("walk-in intake starts unpaid and returns the tracking reference", async () => {
  const db = database();
  const data = request("create", { id: "walk-in-1", userName: "Pat", userPhone: "0700000000", device: "Laptop", issue: "Broken screen" });
  await handleRepairRequest(data, db);
  const ticket = db.docs.get("repair_tickets/walk-in-1");
  assert.equal(ticket.totalPaid, 0); assert.equal(ticket.trackingReference, "walk-in-1"); assert.equal(ticket.status, "received");
});
test("only an assigned technician can start and complete a paid job", async () => {
  const db = database();
  await billed(db); await handleRepairRequest(receipt(100000), db);
  await handleRepairRequest(request("update", { status: "ready_for_assignment", coordinatorEmail: "sales@example.com", technicianEmails: ["tech@example.com"], notes: "" }), db);

  await assert.rejects(
    handleRepairRequest(request("technician_update", { jobAction: "start" }, "tech2@example.com"), db),
    /not assigned/,
  );
  await assert.rejects(
    handleRepairRequest(request("technician_update", { jobAction: "start" }, "sales@example.com"), db),
    /Only assigned technicians/,
  );

  await handleRepairRequest(request("technician_update", { jobAction: "start" }, "tech@example.com"), db);
  let ticket = db.docs.get("repair_tickets/ticket-1");
  assert.equal(ticket.status, "in_progress");
  assert.equal(ticket.startedByEmail, "tech@example.com");

  await handleRepairRequest(request("technician_update", { jobAction: "complete", notes: "Replaced the damaged display." }, "tech@example.com"), db);
  ticket = db.docs.get("repair_tickets/ticket-1");
  assert.equal(ticket.status, "completed");
  assert.equal(ticket.completionNotes, "Replaced the damaged display.");
  assert.equal(ticket.completedByEmail, "tech@example.com");
  assert.deepEqual(ticket.statusHistory.map(event => event.status), ["received", "awaiting_payment", "ready_for_assignment", "in_progress", "completed"]);
});
