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

export const deleteApiKey = onCall(async (request) => {
  const db = getFirestore();
  const admin = await requireAdmin(db, request);
  if (!admin.ok) throw new HttpsError("permission-denied", admin.error);

  const id = String(request.data?.id || "").trim();
  if (!id) throw new HttpsError("invalid-argument", "A key id is required.");

  await db.collection("apiKeys").doc(id).delete();
  return { id, deleted: true };
});
