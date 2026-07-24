/**
 * Re-tags every product's `categoryId` into the 6 focused departments
 * (+ "other"), based on the product name and current subcategory.
 *
 *   laptops · desktops (incl. monitors) · printers-office ·
 *   networking-security · ups-power · software · other
 *
 * Usage:
 *   export GOOGLE_APPLICATION_CREDENTIALS=<key.json>
 *   node retag-departments.mjs            # DRY RUN (report only)
 *   node retag-departments.mjs --confirm  # write categoryId + rebuild categories
 *
 * Only touches products' `categoryId` (keeps a `categoryIdLegacy` backup) and
 * the `categories` collection. Nothing else is changed.
 */

import admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: "mercurycomputers-tech",
});
const db = admin.firestore();
const CONFIRM = process.argv.includes("--confirm");

// ─── Classifier ──────────────────────────────────────────────────────────────
// Explicit subcategory → department map (the reliable signal).
const SUB = {
  // laptops
  "lenovo laptops": "laptops", "hp laptops": "laptops", "2 in 1 laptops": "laptops",
  "business laptops": "laptops", "lenovo gaming laptop": "laptops", "acer gaming laptop": "laptops",
  "laptops": "laptops", "dell laptops": "laptops", "gaming laptops": "laptops",
  "macbook air": "laptops", "macbook pro": "laptops", "asus gaming laptops": "laptops",
  "touch screen laptops": "laptops", "lenovo flex": "laptops",
  // desktops (incl. monitors, thin clients, servers)
  "desktops": "desktops", "dell desktops": "desktops", "hp desktops": "desktops",
  "monitors": "desktops", "24 inch monitor": "desktops", "27 inch monitors": "desktops",
  "20 inch monitor": "desktops", "hp monitors": "desktops", "hp monitor 24": "desktops",
  "lenovo monitor 24-inch": "desktops", "dell monitors": "desktops", "thin clients": "desktops",
  "servers": "desktops", "dell servers": "desktops", "hp servers": "desktops",
  // printers & office
  "hp toner cartridges": "printers-office", "black & white multifunction printers": "printers-office",
  "color laser multifunction printers": "printers-office", "compatible toner cartridge": "printers-office",
  "rexel paper shredders": "printers-office", "hp scanners": "printers-office",
  "laserjet toner cartridges": "printers-office", "multifunction / all in one printers": "printers-office",
  "a4 black & white laser printers": "printers-office", "ink tank printers": "printers-office",
  "printers": "printers-office", "color multifunction printers": "printers-office",
  "money counting machines": "printers-office", "hp ink cartridges": "printers-office",
  "ink & toner": "printers-office", "photo printers": "printers-office",
  "wireless black & white laser printers": "printers-office", "a3 black & white laser printers": "printers-office",
  "color laser printers": "printers-office", "hp toner": "printers-office", "office supplies": "printers-office",
  "hp printer toners & ink": "printers-office", "dot matrix printers": "printers-office",
  "laser printer toner cartridges": "printers-office", "laser printer toner cartridges - magenta": "printers-office",
  "a3 printers": "printers-office", "scanners": "printers-office", "printer & scanner accessories": "printers-office",
  "a4 color laser printers": "printers-office", "paper shredders": "printers-office",
  "ribbon cartridges": "printers-office", "wide format printers": "printers-office", "hp ink": "printers-office",
  // networking & security
  "networking": "networking-security", "switches": "networking-security", "hikvision cameras": "networking-security",
  "bullet cameras": "networking-security", "hikvision dvr": "networking-security", "wi-fi adapters": "networking-security",
  "security systems": "networking-security", "ubiquiti airmax devices": "networking-security",
  "sim card routers": "networking-security", "routers": "networking-security", "ip phones": "networking-security",
  "4g routers": "networking-security",
  // ups & power
  "apc ups": "ups-power", "apc smart ups": "ups-power", "apc easy ups": "ups-power",
  "ups": "ups-power", "giganet ups": "ups-power", "ups battery": "ups-power",
  // software
  "software": "software", "computer software": "software", "subscription services": "software",
  "productivity software suites": "software", "microsoft 365 family": "software",
  // accessory subcategories that must stay in "other"
  "laptop ram": "other", "laptop chargers": "other", "laptop rams": "other",
};

// Fallback for junk buckets ("Computers", "Computer & Office Electronics",
// "Accessories", none) — classify by product name keywords. Positive device
// signals win; we do NOT exclude on "RAM" because laptops list specs like
// "8GB RAM" in their names.
function byName(name) {
  const t = (name || "").toLowerCase();
  // Bare accessories (no device model token) — catch RAM modules / chargers first.
  if (/\bram\b\s*\d+\s*gb|\d+\s*gb\s+(ddr|sodimm|so-dimm)|memory module|\bsodimm\b/.test(t)
    && !/laptop|macbook|desktop|all.?in.?one|thinkpad|ideapad|elitebook|probook|thinkbook|latitude|inspiron/.test(t)) return "other";
  if (/printer|toner|cartridge|\bink\b|scanner|shredder|laserjet/.test(t)) return "printers-office";
  if (/\bups\b|uninterruptible|\bapc\b|giganet|inverter|\bavr\b/.test(t)) return "ups-power";
  if (/rack cabinet|patch panel|router|\bswitch\b|network|wi-?fi|camera|\bcctv\b|\bdvr\b|\bnvr\b|hikvision|ubiquiti|access point/.test(t)) return "networking-security";
  if (/software|kaspersky|microsoft 365|\b365\b|licen[sc]e|antivirus/.test(t)) return "software";
  if (/monitor|desktop|optiplex|all.?in.?one|\baio\b|ideacentre|thinkcentre|proone|thin client|\btower\b|\bserver\b/.test(t)) return "desktops";
  if (/laptop|macbook|notebook|thinkpad|ideapad|elitebook|probook|thinkbook|latitude|inspiron|\bnitro\b|predator|\bomen\b|victus|\brog\b|zenbook|vivobook|\benvy\b|pavilion|spectre|aspire|\bswift\b|galaxy book|\bv14\b|\bv15\b|clamshell/.test(t)) return "laptops";
  return "other";
}

export function classify(name, category) {
  const key = (category || "").trim().toLowerCase();
  if (SUB[key]) return SUB[key];
  return byName(name);
}

const DEPT_META = {
  laptops: { name: "Laptops", order: 1, image: "/cat-laptops.png" },
  desktops: { name: "Desktops", order: 2, image: "/cat-desktops.png" },
  "printers-office": { name: "Printers & Office", order: 3, image: "/cat-printers.png" },
  "networking-security": { name: "Networking & Security", order: 4, image: "/cat-networking.png" },
  "ups-power": { name: "UPS & Power", order: 5, image: "/cat-ups.png" },
  software: { name: "Software", order: 6, image: "/cat-software.png" },
  other: { name: "Other Products", order: 7, image: "/cat-accessories.jpeg" },
};

function slugify(s) {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  const snap = await db.collection("products").get();
  console.log(`Loaded ${snap.size} products\n`);

  const buckets = {};       // dept -> [{name, category}]
  const subcats = {};       // dept -> Set of subcategory names
  const updates = [];       // {ref, dept}

  for (const doc of snap.docs) {
    const p = doc.data();
    const dept = classify(p.name, p.category);
    (buckets[dept] ||= []).push({ name: p.name, category: p.category });
    (subcats[dept] ||= new Set()).add(p.category || "(none)");
    updates.push({ ref: doc.ref, dept, legacy: p.categoryIdLegacy ?? p.categoryId ?? null });
  }

  // Report
  for (const dept of Object.keys(DEPT_META)) {
    const items = buckets[dept] || [];
    console.log(`\n=== ${dept}  (${items.length}) ===`);
    items.slice(0, 6).forEach((i) => console.log(`   ${(i.name || "").slice(0, 52)}`));
    if (dept === "other") {
      console.log("   -- subcategories in OTHER:");
      console.log("   " + [...(subcats.other || [])].sort().join(", "));
    }
  }

  if (!CONFIRM) {
    console.log("\n(dry run — pass --confirm to write categoryId + rebuild categories)");
    return;
  }

  // 1) Update products' categoryId (keep legacy backup)
  let batch = db.batch();
  let n = 0;
  for (const u of updates) {
    const payload = { categoryId: u.dept };
    if (u.legacy != null) payload.categoryIdLegacy = u.legacy; // backup for reversibility
    batch.set(u.ref, payload, { merge: true });
    if (++n % 400 === 0) { await batch.commit(); batch = db.batch(); }
  }
  await batch.commit();
  console.log(`\nUpdated categoryId on ${updates.length} products`);

  // 2) Rebuild categories collection to the new departments
  const now = admin.firestore.FieldValue.serverTimestamp();
  let cbatch = db.batch();
  for (const [slug, meta] of Object.entries(DEPT_META)) {
    const children = [...(subcats[slug] || [])]
      .filter((c) => c && c !== "(none)")
      .sort()
      .map((name) => ({ name, slug: slugify(name) }));
    cbatch.set(db.collection("categories").doc(slug), {
      name: meta.name,
      slug,
      order: meta.order,
      image: meta.image,
      active: true,
      children,
      updatedAt: now,
    });
  }
  await cbatch.commit();
  console.log(`Rebuilt ${Object.keys(DEPT_META).length} category documents`);
}

import { pathToFileURL } from "url";
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
}
