import { onRequest } from "firebase-functions/v2/https";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { authenticateRequest } from "./lib-apikeys.js";

/**
 * Public REST API (key-authenticated) for Mercury Computers.
 *
 * Base URL (after deploy):
 *   https://<region>-<project>.cloudfunctions.net/api
 *
 * Auth: send the key as `Authorization: Bearer <key>` or `x-api-key: <key>`.
 * Scopes: each route requires `<resource>:read` or `<resource>:write`.
 *
 * Routes (prefix /v1 optional):
 *   GET    /v1/:resource          list       (?limit=, ?status=)
 *   GET    /v1/:resource/:id      get one
 *   POST   /v1/:resource          create
 *   PATCH  /v1/:resource/:id      update
 *   DELETE /v1/:resource/:id      delete
 */

// Public API resource name -> Firestore collection.
const RESOURCES = {
  products: "products",
  orders: "orders",
  quotations: "quotations",
  repairs: "repair_tickets",
};

// Recursively convert Firestore Timestamps to ISO strings for JSON output.
function serialize(value) {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = serialize(v);
    return out;
  }
  return value;
}

function sendJson(res, status, body) {
  res.status(status).json(body);
}

// Fields the API must never let clients set directly.
const PROTECTED_FIELDS = ["id", "createdAt", "updatedAt"];

function sanitizeBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const clean = { ...body };
  for (const f of PROTECTED_FIELDS) delete clean[f];
  return clean;
}

export const api = onRequest({ cors: true }, async (req, res) => {
  const db = getFirestore();

  // Normalize path: strip leading slash and optional "v1/" prefix.
  let path = req.path.replace(/^\/+/, "");
  path = path.replace(/^v1\//, "").replace(/^v1$/, "");
  const segments = path.split("/").filter(Boolean);
  const method = req.method.toUpperCase();

  // Best-effort request logging (powers the admin usage graphs + logs).
  // Fires once the response is sent, so it captures the final status code.
  const startedAt = Date.now();
  const logCtx = { keyId: null, keyLabel: null, resource: segments[0] || null, scope: null };
  res.on("finish", () => {
    db.collection("apiLogs")
      .add({
        keyId: logCtx.keyId,
        keyLabel: logCtx.keyLabel,
        method,
        resource: logCtx.resource,
        path: req.path,
        status: res.statusCode,
        scope: logCtx.scope,
        ip: (req.headers["x-forwarded-for"] || req.ip || "").toString().split(",")[0] || null,
        durationMs: Date.now() - startedAt,
        timestamp: FieldValue.serverTimestamp(),
      })
      .catch(() => {});
  });

  if (segments.length === 0) {
    return sendJson(res, 200, {
      service: "Mercury Computers API",
      version: "v1",
      resources: Object.keys(RESOURCES),
    });
  }

  const [resource, id, ...rest] = segments;
  const collection = RESOURCES[resource];

  if (!collection || rest.length > 0) {
    return sendJson(res, 404, { error: "Unknown endpoint." });
  }

  const isWrite = method !== "GET";
  const requiredScope = `${resource}:${isWrite ? "write" : "read"}`;
  logCtx.scope = requiredScope;

  // Authenticate + authorize.
  const auth = await authenticateRequest(req, db, requiredScope);
  if (!auth.ok) {
    return sendJson(res, auth.status, { error: auth.error });
  }
  logCtx.keyId = auth.keyId;
  logCtx.keyLabel = auth.data?.label || null;

  try {
    switch (method) {
      case "GET": {
        if (id) {
          const doc = await db.collection(collection).doc(id).get();
          if (!doc.exists) return sendJson(res, 404, { error: "Not found." });
          return sendJson(res, 200, { data: serialize({ id: doc.id, ...doc.data() }) });
        }
        // List with optional filters.
        let query = db.collection(collection);
        const status = req.query.status;
        if (typeof status === "string" && status) {
          query = query.where("status", "==", status);
        }
        const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
        const snap = await query.limit(limit).get();
        const data = snap.docs.map((d) => serialize({ id: d.id, ...d.data() }));
        return sendJson(res, 200, { data, count: data.length });
      }

      case "POST": {
        if (id) return sendJson(res, 405, { error: "POST not allowed on an item." });
        const clean = sanitizeBody(req.body);
        if (!clean) return sendJson(res, 400, { error: "Request body must be a JSON object." });
        const ref = await db.collection(collection).add({
          ...clean,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        const created = await ref.get();
        return sendJson(res, 201, { data: serialize({ id: ref.id, ...created.data() }) });
      }

      case "PATCH":
      case "PUT": {
        if (!id) return sendJson(res, 400, { error: "An item id is required." });
        const clean = sanitizeBody(req.body);
        if (!clean) return sendJson(res, 400, { error: "Request body must be a JSON object." });
        const ref = db.collection(collection).doc(id);
        const existing = await ref.get();
        if (!existing.exists) return sendJson(res, 404, { error: "Not found." });
        await ref.update({ ...clean, updatedAt: FieldValue.serverTimestamp() });
        const updated = await ref.get();
        return sendJson(res, 200, { data: serialize({ id: ref.id, ...updated.data() }) });
      }

      case "DELETE": {
        if (!id) return sendJson(res, 400, { error: "An item id is required." });
        const ref = db.collection(collection).doc(id);
        const existing = await ref.get();
        if (!existing.exists) return sendJson(res, 404, { error: "Not found." });
        await ref.delete();
        return sendJson(res, 200, { data: { id, deleted: true } });
      }

      default:
        return sendJson(res, 405, { error: `Method ${method} not allowed.` });
    }
  } catch (err) {
    console.error("API error:", err);
    return sendJson(res, 500, { error: "Internal error." });
  }
});
