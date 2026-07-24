/**
 * Read-only audit of the live products collection. Flags real data-quality
 * issues against the actual schema (priceUsd, images[], categoryId, category,
 * name, description, shortDescription, specifications, status, stock). Writes nothing.
 */
import admin from "firebase-admin";
admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: "mercurycomputers-tech" });
const db = admin.firestore();

const VALID_DEPTS = new Set([
  "laptops", "desktops", "printers-office", "networking-security", "ups-power", "software", "other",
]);

const snap = await db.collection("products").get();
console.log(`Loaded ${snap.size} products\n`);

const issues = { critical: [], warn: [] };
const add = (level, id, name, msg) => issues[level].push({ id, name: (name || "").slice(0, 46), msg });
const names = new Map();

for (const doc of snap.docs) {
  const p = doc.data();
  const id = doc.id;
  const nm = p.name;

  // name
  if (!nm || typeof nm !== "string" || !nm.trim()) add("critical", id, id, "missing/empty name");
  else {
    names.set(nm, [...(names.get(nm) || []), id]);
    if (/&amp;|&#\d+;|&quot;|&lt;|&gt;|Â|Ã|â€/.test(nm)) add("warn", id, nm, "encoding junk in name");
    if (/<[^>]+>/.test(nm)) add("warn", id, nm, "HTML tag in name");
    if (/\s{2,}/.test(nm)) add("warn", id, nm, "double spaces in name");
  }

  // price (priceUsd)
  const price = p.priceUsd;
  if (price == null || typeof price !== "number" || Number.isNaN(price)) add("critical", id, nm, `invalid priceUsd: ${JSON.stringify(price)}`);
  else if (price <= 0) add("critical", id, nm, `priceUsd <= 0: ${price}`);
  else if (price < 1) add("warn", id, nm, `suspiciously low priceUsd: ${price}`);

  // categoryId
  if (!p.categoryId) add("critical", id, nm, "missing categoryId");
  else if (!VALID_DEPTS.has(p.categoryId)) add("critical", id, nm, `unknown categoryId: ${p.categoryId}`);

  // category (subcategory)
  if (!p.category || !String(p.category).trim()) add("warn", id, nm, "missing category (subcategory)");

  // images
  const imgs = p.images;
  if (!Array.isArray(imgs) || imgs.length === 0) {
    if (!p.image) add("critical", id, nm, "no images at all");
    else add("warn", id, nm, "has `image` but empty images[]");
  } else {
    const bad = imgs.filter((u) => typeof u !== "string" || !/^https?:\/\//.test(u));
    if (bad.length) add("critical", id, nm, `${bad.length} invalid image URL(s)`);
  }

  // description
  if (!p.description || !String(p.description).trim()) add("warn", id, nm, "missing description");

  // status
  if (p.status && !["published", "draft", "archived"].includes(p.status)) add("warn", id, nm, `odd status: ${p.status}`);

  // stock
  if (p.stock != null && (typeof p.stock !== "number" || p.stock < 0)) add("warn", id, nm, `odd stock: ${p.stock}`);
}

for (const [nm, ids] of names) if (ids.length > 1) add("warn", ids[0], nm, `duplicate name (${ids.length}x)`);

const report = (level) => {
  const list = issues[level];
  console.log(`\n===== ${level.toUpperCase()} (${list.length}) =====`);
  for (const i of list) console.log(`  [${i.id}]\n      ${i.name}  →  ${i.msg}`);
};
report("critical");
report("warn");
console.log(`\nDONE. critical=${issues.critical.length} warn=${issues.warn.length}`);
process.exit(0);
