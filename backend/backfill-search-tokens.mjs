/**
 * One-time backfill: adds a `searchTokens` array to every product so the
 * public API's `?q=` text search works. Tokens are lowercased, de-duped words
 * from name + brand + category + subcategory + categoryId.
 *
 *   node backfill-search-tokens.mjs            # dry run (shows samples)
 *   node backfill-search-tokens.mjs --confirm  # writes searchTokens
 *
 * Idempotent and safe to re-run.
 */
import admin from "firebase-admin";
admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: "mercurycomputers-tech" });
const db = admin.firestore();
const CONFIRM = process.argv.includes("--confirm");

function buildSearchTokens(data) {
  const text = [data.name, data.brand, data.category, data.subcategory, data.categoryId]
    .filter((v) => typeof v === "string" && v)
    .join(" ")
    .toLowerCase();
  const tokens = text.split(/[^a-z0-9]+/).filter(Boolean);
  return Array.from(new Set(tokens)).slice(0, 50);
}

const snap = await db.collection("products").get();
console.log(`Loaded ${snap.size} products\n`);

let batch = db.batch();
let n = 0;
let shown = 0;
for (const doc of snap.docs) {
  const tokens = buildSearchTokens(doc.data());
  if (shown < 5) {
    console.log(`${doc.id}\n   -> [${tokens.join(", ")}]`);
    shown++;
  }
  if (CONFIRM) {
    batch.set(doc.ref, { searchTokens: tokens }, { merge: true });
    if (++n % 400 === 0) { await batch.commit(); batch = db.batch(); }
  }
}

if (!CONFIRM) {
  console.log("\n(dry run — pass --confirm to write searchTokens to all products)");
  process.exit(0);
}
await batch.commit();
console.log(`\nWrote searchTokens to ${snap.size} products.`);
process.exit(0);
