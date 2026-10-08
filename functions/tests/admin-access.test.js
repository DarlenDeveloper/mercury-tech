import test from "node:test";
import assert from "node:assert/strict";
import {
  adminHasDashboard,
  handleManageAdminAccess,
  normalizeAdminEntry,
} from "../admin-access.js";
import { requireAdmin } from "../lib-apikeys.js";

function database(config) {
  const docs = new Map([["config/admins", config]]);
  const audits = [];
  return {
    docs,
    audits,
    doc: path => ({ path }),
    collection: name => ({ add: async data => { audits.push({ name, data }); } }),
    async runTransaction(callback) {
      const pending = [];
      const result = await callback({
        get: async ref => ({ data: () => docs.get(ref.path) }),
        set: (ref, data) => pending.push(() => docs.set(ref.path, data)),
      });
      pending.forEach(write => write());
      return result;
    },
  };
}

const request = (data, email = "owner@example.com") => ({
  auth: { uid: email, token: { email } },
  data,
});

test("legacy staff retain both dashboards until explicitly edited", () => {
  assert.equal(adminHasDashboard({ email: "old@example.com", access: "admin", pages: [] }, "sales"), true);
  assert.equal(adminHasDashboard({ email: "old@example.com", access: "admin", pages: [] }, "workshop"), true);
  assert.equal(adminHasDashboard({ email: "new@example.com", access: "admin", pages: [], dashboards: ["sales"] }, "workshop"), false);
});

test("normalization rejects pages outside the selected dashboard", () => {
  assert.throws(() => normalizeAdminEntry({
    email: "sales@example.com",
    access: "admin",
    dashboards: ["sales"],
    pages: ["orders", "repairs"],
  }), /valid pages/);
  assert.deepEqual(normalizeAdminEntry({
    email: "SALES@example.com",
    access: "admin",
    jobRole: "Sales",
    dashboards: ["sales"],
    pages: ["orders", "customers"],
  }), {
    email: "sales@example.com",
    access: "admin",
    jobRole: "Sales",
    dashboards: ["sales"],
    pages: ["orders", "customers"],
  });
});

test("only a super admin can save dashboard access", async () => {
  const db = database({
    admins: [
      { email: "owner@example.com", access: "super_admin", pages: ["*"] },
      { email: "staff@example.com", access: "admin", pages: ["users"], dashboards: ["sales"] },
    ],
    emails: ["owner@example.com", "staff@example.com"],
  });
  const entry = { email: "tech@example.com", access: "admin", jobRole: "Technician", dashboards: ["workshop"], pages: ["repairs"] };
  await assert.rejects(handleManageAdminAccess(request({ action: "upsert", entry }, "staff@example.com"), db), /Only super admins/);
  await handleManageAdminAccess(request({ action: "upsert", entry }), db);
  assert.deepEqual(db.docs.get("config/admins").admins.find(item => item.email === "tech@example.com").dashboards, ["workshop"]);
  assert.equal(db.audits.length, 1);
});

test("legacy super admins are retained and the last super admin cannot be removed", async () => {
  const legacy = database({ admins: [], emails: ["owner@example.com"] });
  await handleManageAdminAccess(request({
    action: "upsert",
    entry: { email: "staff@example.com", access: "admin", dashboards: ["sales"], pages: ["orders"] },
  }), legacy);
  assert.equal(legacy.docs.get("config/admins").admins.some(entry => entry.email === "owner@example.com" && entry.access === "super_admin"), true);

  const onlyOwner = database({ admins: [{ email: "owner@example.com", access: "super_admin", dashboards: ["sales", "workshop"], pages: ["*"] }], emails: ["owner@example.com"] });
  await assert.rejects(handleManageAdminAccess(request({ action: "remove", email: "owner@example.com" }), onlyOwner), /At least one super admin/);
});

test("sales-only callables reject staff assigned only to Workshop", async () => {
  const config = {
    admins: [{ email: "owner@example.com", access: "super_admin", dashboards: ["workshop"], pages: ["*"] }],
    emails: ["owner@example.com"],
  };
  const db = {
    collection: () => ({
      doc: () => ({
        get: async () => ({ exists: true, data: () => config }),
      }),
    }),
  };
  const result = await requireAdmin(db, request({}, "owner@example.com"), { dashboard: "sales", page: "api-keys" });
  assert.deepEqual(result, { ok: false, error: "Sales dashboard access required." });
});
