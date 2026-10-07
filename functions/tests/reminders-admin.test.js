import test from "node:test";
import assert from "node:assert/strict";
import { projectReminder, reminderOutcome } from "../reminders-admin.js";

test("provider statuses are grouped into completed, failed and pending outcomes", () => {
  for (const status of ["accepted", "sent", "delivered", "read"]) {
    assert.equal(reminderOutcome(status), "completed");
  }
  for (const status of ["failed", "skipped"]) {
    assert.equal(reminderOutcome(status), "failed");
  }
  assert.equal(reminderOutcome("queued"), "pending");
});

test("reminder projections include useful staff fields without leaking event internals", () => {
  const reminder = projectReminder("log-1", {
    ticketId: "repair-1",
    providerStatus: "failed",
    recipient: "256700000000",
    failureReason: "invalid_or_missing_phone",
    httpStatus: 400,
    retryable: false,
    eventId: "private-event-id",
    updatedAt: new Date("2026-10-07T08:30:00.000Z"),
  }, {
    trackingReference: "MC-1001",
    userName: "Customer Name",
    device: "Laptop",
  });

  assert.equal(reminder.outcome, "failed");
  assert.equal(reminder.trackingReference, "MC-1001");
  assert.equal(reminder.customerName, "Customer Name");
  assert.equal(reminder.updatedAt, "2026-10-07T08:30:00.000Z");
  assert.equal("eventId" in reminder, false);
});
