import crypto from "node:crypto";

/**
 * Shared helpers for the public REST API's key-based authentication.
 *
 * Keys are shown to the admin exactly once at creation. Only a SHA-256 hash is
 * ever stored, so a Firestore leak never exposes usable keys. Lookup is by hash
 * (effectively constant-time) against the `apiKeys` collection.
 */

export const API_KEY_PREFIX = "mck_live_";

/** SHA-256 hex digest of a string. */
export function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

/**
 * Generate a new API key.
 * Returns the full plaintext key (return to caller ONCE), its hash (stored),
 * and a short display prefix used to recognize the key in the UI.
 */
export function generateApiKey() {
  const random = crypto.randomBytes(24).toString("hex"); // 48 hex chars
  const key = `${API_KEY_PREFIX}${random}`;
  return {
    key,
    keyHash: sha256(key),
    // e.g. "mck_live_9f2a1c…" — safe to store/display, not enough to reconstruct.
    display: `${API_KEY_PREFIX}${random.slice(0, 6)}…`,
  };
}

/**
 * Check whether a set of granted scopes satisfies a required scope.
 * Supports the wildcards "*" (all) and "<resource>:*".
 */
export function scopeSatisfied(grantedScopes, requiredScope) {
  if (!Array.isArray(grantedScopes)) return false;
  if (grantedScopes.includes("*")) return true;
  if (grantedScopes.includes(requiredScope)) return true;
  const resource = requiredScope.split(":")[0];
  return grantedScopes.includes(`${resource}:*`);
}

/**
 * Authenticate an incoming HTTP request against the apiKeys collection and
 * verify it carries the required scope.
 *
 * Returns { ok: true, keyId, data } on success, or
 * { ok: false, status, error } on failure.
 */
export async function authenticateRequest(req, db, requiredScope) {
  const authHeader = req.get("authorization") || "";
  const bearer = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;
  const key = bearer || req.get("x-api-key") || null;

  if (!key) {
    return { ok: false, status: 401, error: "Missing API key." };
  }

  const snap = await db
    .collection("apiKeys")
    .where("keyHash", "==", sha256(key))
    .limit(1)
    .get();

  if (snap.empty) {
    return { ok: false, status: 401, error: "Invalid API key." };
  }

  const doc = snap.docs[0];
  const data = doc.data();

  if (data.active === false) {
    return { ok: false, status: 401, error: "API key has been revoked." };
  }

  if (requiredScope && !scopeSatisfied(data.scopes, requiredScope)) {
    return {
      ok: false,
      status: 403,
      error: `API key is missing the required scope: ${requiredScope}.`,
    };
  }

  // Best-effort usage tracking (never blocks the request).
  doc.ref
    .update({
      lastUsedAt: new Date(),
      usageCount: (data.usageCount || 0) + 1,
    })
    .catch(() => {});

  return { ok: true, keyId: doc.id, data };
}

/**
 * Verify that a callable request is made by a configured admin.
 * Mirrors the app's config/admins structure (admins[].email + legacy emails[]).
 */
export async function requireAdmin(db, request) {
  const auth = request.auth;
  if (!auth) return { ok: false, error: "You must be signed in." };

  const email = (auth.token?.email || "").toLowerCase();
  if (!email) return { ok: false, error: "No email on account." };

  const snap = await db.collection("config").doc("admins").get();
  if (!snap.exists) return { ok: false, error: "No admins configured." };

  const data = snap.data() || {};
  const admins = Array.isArray(data.admins) ? data.admins : [];
  const legacy = Array.isArray(data.emails) ? data.emails : [];

  const isAdmin =
    admins.some((a) => (a.email || "").toLowerCase() === email) ||
    legacy.some((e) => (e || "").toLowerCase() === email);

  if (!isAdmin) return { ok: false, error: "Admin access required." };
  return { ok: true, email, uid: auth.uid };
}
