import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

export const DASHBOARDS = ["sales", "workshop"];
export const STAFF_ROLES = ["Sales", "Technician", "Support", "Developer"];
export const SHARED_PAGES = ["customers", "customer-care", "quotations", "payments", "users"];
export const SALES_PAGES = [
  ...SHARED_PAGES,
  "analytics", "orders", "products", "categories", "website", "user-tracking",
  "finance", "ai", "notifications", "audit-logs", "settings", "api-keys", "help",
];
export const WORKSHOP_PAGES = [...SHARED_PAGES, "repairs", "assignments", "reminders"];

function text(value, max = 320) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function dashboardsForAdmin(entry) {
  if (!entry) return [];
  if (!Array.isArray(entry.dashboards)) return [...DASHBOARDS];
  return DASHBOARDS.filter(dashboard => entry.dashboards.includes(dashboard));
}

export function adminHasDashboard(entry, dashboard) {
  return dashboardsForAdmin(entry).includes(dashboard);
}

export function adminHasAnyDashboard(entry) {
  return dashboardsForAdmin(entry).length > 0;
}

export function adminHasPage(entry, page) {
  return entry?.access === "super_admin" || entry?.pages?.some(value => value === "*" || value === page) || false;
}

export function normalizeAdminEntry(input) {
  const email = text(input?.email).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpsError("invalid-argument", "Enter a valid staff email address.");
  const access = input?.access;
  if (!["admin", "super_admin"].includes(access)) throw new HttpsError("invalid-argument", "Choose a valid access level.");
  const jobRole = text(input?.jobRole, 40);
  if (jobRole && !STAFF_ROLES.includes(jobRole)) throw new HttpsError("invalid-argument", "Choose a valid job role.");
  if (!Array.isArray(input?.dashboards)) throw new HttpsError("invalid-argument", "Choose at least one dashboard.");
  const dashboards = [...new Set(input.dashboards.filter(value => DASHBOARDS.includes(value)))];
  if (!dashboards.length || dashboards.length !== input.dashboards.length) throw new HttpsError("invalid-argument", "Choose at least one valid dashboard.");

  if (access === "super_admin") return { email, access, jobRole, dashboards, pages: ["*"] };
  if (!Array.isArray(input?.pages)) throw new HttpsError("invalid-argument", "Choose at least one page.");
  const allowedPages = new Set(dashboards.flatMap(dashboard => dashboard === "sales" ? SALES_PAGES : WORKSHOP_PAGES));
  const pages = [...new Set(input.pages.filter(page => typeof page === "string" && allowedPages.has(page)))];
  if (!pages.length || pages.length !== input.pages.length) throw new HttpsError("invalid-argument", "Choose valid pages for the selected dashboards.");
  return { email, access, jobRole, dashboards, pages };
}

function findAdmin(config, email) {
  const admin = (config.admins || []).find(entry => entry.email?.toLowerCase() === email);
  const legacy = !admin && (config.emails || []).some(value => value.toLowerCase() === email);
  return admin || (legacy ? { email, access: "super_admin", pages: ["*"] } : null);
}

export async function handleManageAdminAccess(request, db) {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in first.");
  const actorEmail = text(request.auth.token.email).toLowerCase();
  const action = request.data?.action;
  if (!["upsert", "remove"].includes(action)) throw new HttpsError("invalid-argument", "Choose a valid admin action.");
  const targetEmail = action === "upsert" ? text(request.data?.entry?.email).toLowerCase() : text(request.data?.email).toLowerCase();
  if (!targetEmail) throw new HttpsError("invalid-argument", "A staff email is required.");

  const configRef = db.doc("config/admins");
  const result = await db.runTransaction(async transaction => {
    const snapshot = await transaction.get(configRef);
    const config = snapshot.data() || {};
    const actor = findAdmin(config, actorEmail);
    if (!actor || actor.access !== "super_admin") throw new HttpsError("permission-denied", "Only super admins can change staff access.");

    const entries = [...(config.admins || [])];
    for (const legacyEmail of config.emails || []) {
      const normalizedLegacyEmail = text(legacyEmail).toLowerCase();
      if (normalizedLegacyEmail && !entries.some(entry => entry.email?.toLowerCase() === normalizedLegacyEmail)) {
        entries.push({ email: normalizedLegacyEmail, access: "super_admin", dashboards: [...DASHBOARDS], pages: ["*"] });
      }
    }
    const index = entries.findIndex(entry => entry.email?.toLowerCase() === targetEmail);
    let updated;
    if (action === "upsert") {
      const nextEntry = normalizeAdminEntry(request.data.entry);
      updated = index >= 0
        ? entries.map((entry, position) => position === index ? nextEntry : entry)
        : [...entries, nextEntry];
    } else {
      if (index < 0) throw new HttpsError("not-found", "This staff member no longer has admin access.");
      updated = entries.filter((_, position) => position !== index);
    }

    if (!updated.some(entry => entry.access === "super_admin")) {
      throw new HttpsError("failed-precondition", "At least one super admin must remain.");
    }
    transaction.set(configRef, {
      ...config,
      admins: updated,
      emails: updated.map(entry => entry.email),
    });
    return { ok: true, email: targetEmail, action };
  });

  try {
    await db.collection("audit_logs").add({
      actor: actorEmail,
      actorId: request.auth.uid,
      action: action === "upsert" ? "admin_access_saved" : "admin_access_removed",
      target: targetEmail,
      details: action === "upsert" ? "Updated dashboard and page access" : "Removed staff access",
      timestamp: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Admin access audit write failed", error?.message || error);
  }
  return result;
}

export const manageAdminAccess = onCall(request => handleManageAdminAccess(request, getFirestore()));
