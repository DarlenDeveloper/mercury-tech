import test from "node:test";
import assert from "node:assert/strict";
import { kampalaDate, technicianReminderCopy, technicianReminderId } from "../technician-reminders.js";

test("technician reminder date follows Kampala time", () => {
  assert.equal(kampalaDate(new Date("2026-10-11T21:30:00.000Z")), "2026-10-12");
});

test("technician reminder copy points to the work that needs attention", () => {
  assert.deepEqual(technicianReminderCopy({ status: "ready_for_assignment", trackingReference: "REP-42" }, "ticket"), {
    title: "Repair ready to start",
    body: "REP-42 is assigned to you and ready to start.",
  });
  assert.match(technicianReminderCopy({ status: "in_progress" }, "ticket-1").body, /ticket-1.*still in progress/i);
  assert.match(technicianReminderCopy({ status: "awaiting_parts" }, "ticket-1").body, /awaiting parts/i);
});

test("daily reminder document IDs are deterministic per technician and job", () => {
  const first = technicianReminderId("2026-10-12", "ticket-1", "user-1");
  assert.equal(first, technicianReminderId("2026-10-12", "ticket-1", "user-1"));
  assert.notEqual(first, technicianReminderId("2026-10-13", "ticket-1", "user-1"));
  assert.notEqual(first, technicianReminderId("2026-10-12", "ticket-2", "user-1"));
});
