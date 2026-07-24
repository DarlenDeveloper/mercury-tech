/**
 * Targeted, explicit fix of mis-filed products found during the category-by-category
 * audit. Each entry is an exact doc id -> correct categoryId. Read-then-write, batched.
 *
 *   node fix-misfiled.mjs            # dry run (shows before -> after)
 *   node fix-misfiled.mjs --confirm  # writes categoryId on the listed docs
 */
import admin from "firebase-admin";
admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: "mercurycomputers-tech" });
const db = admin.firestore();
const CONFIRM = process.argv.includes("--confirm");

const FIXES = {
  // phones & tablets wrongly under Networking & Security -> other
  "apple-iphone-15-128gb": "other",
  "apple-iphone-15-pro": "other",
  "samsung-galaxy-tab-a9-8-7-wi-fi-tablet-128gb-8gb-ram-enhanced-storage-smooth-performance": "other",
  "samsung-galaxy-tab-a9-8-7-wi-fi-tablet-64gb-mediatek-helio-g99-compact-powerful": "other",
  "samsung-galaxy-tab-a9-10-5-wi-fi-tablet-128gb-8gb-ram-powerful-performance-vivid-display": "other",
  "samsung-galaxy-tab-s9-fe-10-9-inch-wi-fi-tablet-with-s-pen-128gb-gray": "other",
  "samsung-galaxy-tab-s9-256gb-wi-fi-tablet-with-s-pen-12-4-inch-dynamic-amoled-2x-display": "other",
  // headset wrongly under Laptops -> other
  "logitech-h111": "other",
  // consistency: rack with the other server racks; thin client with the other thin client
  "4u-wall-mount-server-rack-cabinet-600mm-wide-450mm-deep": "networking-security",
  "ncomputing-l300-thin-client-vspace-virtual-desktop": "desktops",
};

const batch = db.batch();
let n = 0;
for (const [id, dept] of Object.entries(FIXES)) {
  const ref = db.collection("products").doc(id);
  const snap = await ref.get();
  if (!snap.exists) { console.log(`MISSING  ${id}`); continue; }
  const cur = snap.data().categoryId;
  console.log(`${cur}  ->  ${dept}   ${id}`);
  if (cur !== dept) { batch.set(ref, { categoryId: dept }, { merge: true }); n++; }
}

if (!CONFIRM) { console.log(`\n(dry run — ${n} would change; pass --confirm to write)`); process.exit(0); }
await batch.commit();
console.log(`\nUpdated ${n} products`);
process.exit(0);
