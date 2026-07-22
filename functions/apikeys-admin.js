import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { generateApiKey, requireAdmin } from "./lib-apikeys.js";

/**
 * Admin-only callable functions to manage API keys.
 * The raw key is generated server-side and returned exactly ONCE (on create);
 * only its hash is persisted.
 */

const VALID_RESOURCES = ["products", "orders", "quotations", "repairs"];
const VALID_ACTIONS = ["read", "write"];

// Expand a scope list, validating each entry. Accepts "*", "<res>:*",
// "<res>:read", "<res>:write".
function validateScopes(scopes) {
  if (!Array.isArray(scopes) || scopes.length === 0) return null;
  const clean = [];
  for (const s of scopes) {
    if (typeof s !== "string") return null;
    if (s === "*") { clean.push(s); continue; }
    const [res, action] = s.split(":");
    if (!VALID_RESOURCES.includes(res)) return null;
    if (action !== "*" && !VALID_ACTIONS.includes(action)) return null;
    clean.push(s);
  }
  return Array.from(new Set(clean));
}

export const createApiKey = onCall(async (request) => {
  const db = getFirestore();
  const admin = await requireAdmin(db, request);
  if (!admin.ok) throw new HttpsError("permission-denied", admin.error);

  const label = String(request.data?.label || "").trim();
  const scopes = validateScopes(request.data?.scopes);

  if (!label) throw new HttpsError("invalid-argument", "A label is required.");
  if (!scopes) {
    throw new HttpsError(
      "invalid-argument",
      "Provide at least one valid scope, e.g. products:read, orders:write, or *."
    );
  }

  const { key, keyHash, display } = generateApiKey();

  const ref = await db.collection("apiKeys").add({
    label,
    scopes,
    keyHash,
    display,
    active: true,
    createdBy: admin.email,
    createdByUid: admin.uid,
    usageCount: 0,
    lastUsedAt: null,
    createdAt: FieldValue.serverTimestamp(),
  });

  // `key` is returned only here and never stored in plaintext.
  return { id: ref.id, key, display, scopes, label };
});

export const listApiKeys = onCall(async (request) => {
  const db = getFirestore();
  const admin = await requireAdmin(db, request);
  if (!admin.ok) throw new HttpsError("permission-denied", admin.error);

  const snap = await db.collection("apiKeys").orderBy("createdAt", "desc").get();
  const keys = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      label: data.label || "",
      scopes: data.scopes || [],
      display: data.display || "",
      active: data.active !== false,
      createdBy: data.createdBy || "",
      usageCount: data.usageCount || 0,
      lastUsedAt: data.lastUsedAt?.toDate?.()?.toISOString?.() || null,
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
    };
  });
  return { keys };
});

export const revokeApiKey = onCall(async (request) => {
  const db = getFirestore();
  const admin = await requireAdmin(db, request);
  if (!admin.ok) throw new HttpsError("permission-denied", admin.error);

  const id = String(request.data?.id || "").trim();
  if (!id) throw new HttpsError("invalid-argument", "A key id is required.");

  await db.collection("apiKeys").doc(id).update({
    active: false,
    revokedAt: FieldValue.serverTimestamp(),
    revokedBy: admin.email,
  });
  return { id, revoked: true };
});

/**
 * Returns API usage data for the dashboard: recent request logs, per-day call
 * counts for the last N days, and success/error totals.
 */
export const getApiActivity = onCall(async (request) => {
  const db = getFirestore();
  const admin = await requireAdmin(db, request);
  if (!admin.ok) throw new HttpsError("permission-denied", admin.error);

  const days = Math.min(Math.max(parseInt(request.data?.days, 10) || 14, 1), 90);
  const logLimit = Math.min(Math.max(parseInt(request.data?.limit, 10) || 50, 1), 200);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (days - 1));
  cutoff.setHours(0, 0, 0, 0);

  const snap = await db
    .collection("apiLogs")
    .where("timestamp", ">=", cutoff)
    .orderBy("timestamp", "desc")
    .limit(3000)
    .get();

  // Seed a bucket per day so the graph shows empty days too.
  const buckets = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(cutoff);
    d.setDate(cutoff.getDate() + i);
    buckets[d.toISOString().slice(0, 10)] = 0;
  }

  let total = 0;
  let success = 0;
  let errors = 0;
  const logs = [];

  snap.docs.forEach((doc) => {
    const data = doc.data();
    const ts = data.timestamp?.toDate?.() || null;
    total += 1;
    const status = data.status || 0;
    if (status >= 200 && status < 400) success += 1;
    else if (status >= 400) errors += 1;

    if (ts) {
      const day = ts.toISOString().slice(0, 10);
      if (day in buckets) buckets[day] += 1;
    }

    if (logs.length < logLimit) {
      logs.push({
        id: doc.id,
        keyLabel: data.keyLabel || "—",
        method: data.method || "",
        resource: data.resource || "",
        path: data.path || "",
        status,
        durationMs: data.durationMs ?? null,
        ip: data.ip || null,
        timestamp: ts ? ts.toISOString() : null,
      });
    }
  });

  const daily = Object.entries(buckets).map(([date, count]) => ({ date, count }));

  return { daily, logs, totals: { total, success, errors }, days };
});

export const deleteApiKey = onCall(async (request) => {
  const db = getFirestore();
  const admin = await requireAdmin(db, request);
  if (!admin.ok) throw new HttpsError("permission-denied", admin.error);

  const id = String(request.data?.id || "").trim();
  if (!id) throw new HttpsError("invalid-argument", "A key id is required.");

  await db.collection("apiKeys").doc(id).delete();
  return { id, deleted: true };
});
