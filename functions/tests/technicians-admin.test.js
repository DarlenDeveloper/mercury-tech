import test from "node:test";
import assert from "node:assert/strict";
import { normalizeTechnicianPhone, technicianIdentityKey } from "../technicians-admin.js";

test("technician phones share one Uganda identity across input formats", () => {
  assert.equal(normalizeTechnicianPhone("0704 823 800"), "256704823800");
  assert.equal(normalizeTechnicianPhone("+256 704 823800"), "256704823800");
  assert.equal(normalizeTechnicianPhone("823800"), "");
});

test("identity keys are stable without exposing the phone number", () => {
  const key = technicianIdentityKey("phone", "256704823800");
  assert.equal(key, technicianIdentityKey("phone", "256704823800"));
  assert.equal(key.length, 64);
  assert.equal(key.includes("256704823800"), false);
});
