import { onRequest } from "firebase-functions/v2/https";
import { getFirestore, FieldValue, Timestamp, FieldPath } from "firebase-admin/firestore";
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
 *   GET    /v1/:resource          list
 *     ?q=            text search (name/brand/category/subcategory tokens)
 *     ?limit=        1..200 (default 50)
 *     ?cursor=       opaque; page until response.nextCursor is null
 *     ?status=       exact-match filter
 *     ?brand=        exact-match filter
 *     ?category=     exact-match filter (display label)
 *     ?categoryId=   exact-match filter (department slug)
 *     ?subcategory=  exact-match filter
 *     Response: { data, count, nextCursor, total? }  (total only on first page)
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

// A trimmed string query param, or "" when absent/blank.
function qstr(v) {
  return typeof v === "string" && v.trim() ? v.trim() : "";
}

// Opaque cursor = base64url of the last document id (pagination is by doc id,
// the only field guaranteed present on every document).
function encodeCursor(id) {
  return Buffer.from(String(id), "utf8").toString("base64url");
}
function decodeCursor(cursor) {
  try {
    const id = Buffer.from(String(cursor), "base64url").toString("utf8");
    return id || null;
  } catch {
    return null;
  }
}

/**
 * Build the lowercased, de-duplicated token list used for text search.
 * Tokens come from name, brand, category, subcategory and categoryId, split
 * on any non-alphanumeric boundary (so "networking-security" -> networking,
 * security and "24-inch" -> 24, inch).
 */
export function buildSearchTokens(data) {
  const text = [
    data.name,
    data.brand,
    data.category,
    data.subcategory,
    data.categoryId,
    ...(Array.isArray(data.subcategorySlugs) ? data.subcategorySlugs : []),
  ]
    .filter((v) => typeof v === "string" && v)
    .join(" ")
    .toLowerCase();
  const tokens = text.split(/[^a-z0-9]+/).filter(Boolean);
  return Array.from(new Set(tokens)).slice(0, 50);
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
        // ── List: text search (q), structured filters, cursor pagination ──
        const q = qstr(req.query.q);
        const structured = [];
        for (const field of ["status", "brand", "category", "categoryId", "subcategory"]) {
          const v = qstr(req.query[field]);
          if (v) structured.push([field, v]);
        }

        let query = db.collection(collection);
        let inMemoryFilters = [];

        if (q) {
          // Substring search isn't native to Firestore; match against the
          // pre-tokenized `searchTokens` array. Up to 10 tokens (Firestore cap
          // for array-contains-any). Extra structured filters are applied in
          // memory so we never need composite indexes.
          const tokens = q.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).slice(0, 10);
          if (tokens.length) query = query.where("searchTokens", "array-contains-any", tokens);
          inMemoryFilters = structured;
        } else if (structured.length > 0) {
          // A single equality filter + doc-id ordering is index-safe; any
          // additional filters are applied in memory.
          query = query.where(structured[0][0], "==", structured[0][1]);
          inMemoryFilters = structured.slice(1);
        }

        // Stable ordering by document id enables cursor pagination for every
        // doc (products have no reliable createdAt field).
        query = query.orderBy(FieldPath.documentId());

        const cursor = qstr(req.query.cursor);
        if (cursor) {
          const after = decodeCursor(cursor);
          if (!after) return sendJson(res, 400, { error: "Invalid cursor." });
          query = query.startAfter(after);
        }

        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
        const snap = await query.limit(limit).get();

        // nextCursor reflects the raw page size (before in-memory filtering) so
        // the caller keeps paging correctly until the catalog is exhausted.
        const nextCursor =
          snap.size === limit ? encodeCursor(snap.docs[snap.docs.length - 1].id) : null;

        let rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        for (const [field, value] of inMemoryFilters) {
          rows = rows.filter((r) => String(r[field] ?? "") === value);
        }
        const data = rows.map(serialize);

        const payload = { data, count: data.length, nextCursor };

        // Exact total for the current filter set — computed once (first page)
        // via Firestore aggregation so the agent can give precise counts.
        // Skipped when in-memory filters apply, since aggregation can't see
        // those (keeps `total` always exact for what it reports).
        if (!cursor && inMemoryFilters.length === 0) {
          try {
            payload.total = (await query.count().get()).data().count;
          } catch {
            /* aggregation unavailable — omit total */
          }
        }

        return sendJson(res, 200, payload);
      }

      case "POST": {
        if (id) return sendJson(res, 405, { error: "POST not allowed on an item." });
        const clean = sanitizeBody(req.body);
        if (!clean) return sendJson(res, 400, { error: "Request body must be a JSON object." });
        // Keep products searchable: (re)generate the search token index.
        if (resource === "products") clean.searchTokens = buildSearchTokens(clean);
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
        // Rebuild tokens from the merged doc so partial updates stay searchable.
        if (resource === "products") {
          clean.searchTokens = buildSearchTokens({ ...existing.data(), ...clean });
        }
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
