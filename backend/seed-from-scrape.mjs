/**
 * Seeds Firestore with products from the old Mercury website (via raw Supabase API data).
 *
 * Usage:
 *   export GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
 *   node seed-from-scrape.mjs
 *
 * This script will:
 *   1. Delete ALL existing products in Firestore
 *   2. Write 560 products from scraped-api-raw.json (with proper categories)
 *   3. Update the 6 top-level categories
 */

import admin from "firebase-admin";
import { readFileSync } from "fs";

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: "mercurycomputers-tech",
});

const db = admin.firestore();

// ─── Category mapping ───────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "computers", name: "Computers", order: 1 },
  { id: "printers-office", name: "Printers & Office", order: 2 },
  { id: "components-power", name: "Components & Power", order: 3 },
  { id: "networking-security", name: "Networking & Security", order: 4 },
  { id: "phones-tv-audio", name: "Phones, TV & Audio", order: 5 },
  { id: "accessories", name: "Accessories", order: 6 },
];

// Map subcategory slugs → top-level categoryId
const CATEGORY_MAP = {
  // Computers
  "lenovo-laptops": "computers",
  "hp-laptops": "computers",
  "dell-laptops": "computers",
  "gaming-laptops": "computers",
  "asus-gaming-laptops": "computers",
  "acer-gaming-laptop": "computers",
  "lenovo-gaming-laptop": "computers",
  "2-in-1-laptops": "computers",
  "business-laptops": "computers",
  "touch-screen-laptops": "computers",
  "macbook-air": "computers",
  "macbook-pro": "computers",
  "lenovo-flex": "computers",
  laptops: "computers",
  desktops: "computers",
  "dell-desktops": "computers",
  "hp-desktops": "computers",
  computers: "computers",
  monitors: "computers",
  "hp-monitors": "computers",
  "dell-monitors": "computers",
  "20-inch-monitor": "computers",
  "24-inch-monitor": "computers",
  "27-inch-monitors": "computers",
  "lenovo-monitor-24-inch": "computers",
  "hp-monitor-24": "computers",
  "samsung-tablets": "computers",
  "lenovo-tablets": "computers",
  "cost-effective-tablets": "computers",
  servers: "computers",
  "dell-servers": "computers",
  "hp-servers": "computers",
  "thin-clients": "computers",
  // Printers & Office
  printers: "printers-office",
  "color-multifunction-printers": "printers-office",
  "black-white-multifunction-printers": "printers-office",
  "multifunction-all-in-one-printers": "printers-office",
  "ink-tank-printers": "printers-office",
  "color-laser-multifunction-printers": "printers-office",
  "photo-printers": "printers-office",
  "wide-format-printers": "printers-office",
  "a4-black-white-laser-printers": "printers-office",
  "a3-black-white-laser-printers": "printers-office",
  "wireless-black-white-laser-printers": "printers-office",
  "color-laser-printers": "printers-office",
  "a4-color-laser-printers": "printers-office",
  "dot-matrix-printers": "printers-office",
  "a3-printers": "printers-office",
  scanners: "printers-office",
  "hp-scanners": "printers-office",
  "hp-toner": "printers-office",
  "hp-toner-cartridges": "printers-office",
  "hp-ink-cartridges": "printers-office",
  "hp-ink": "printers-office",
  "hp-printer-toners-and-ink": "printers-office",
  "laser-printer-toner-cartridges": "printers-office",
  "laser-printer-toner-cartridges-magenta": "printers-office",
  "laserjet-toner-cartridges": "printers-office",
  "compatible-toner-cartridge": "printers-office",
  "ribbon-cartridges": "printers-office",
  "ink-and-toner": "printers-office",
  "printer-and-scanner-accessories": "printers-office",
  "paper-shredders": "printers-office",
  "rexel-paper-shredders": "printers-office",
  "office-supplies": "printers-office",
  "money-counting-machines": "printers-office",
  // Components & Power
  "computer-components": "components-power",
  "computer-office-electronics": "components-power",
  ups: "components-power",
  "apc-ups": "components-power",
  "apc-smart-ups": "components-power",
  "apc-easy-ups": "components-power",
  "giganet-ups": "components-power",
  "ups-battery": "components-power",
  storage: "components-power",
  "portable-ssd": "components-power",
  "laptop-ram": "components-power",
  // Networking & Security
  networking: "networking-security",
  routers: "networking-security",
  "4g-routers": "networking-security",
  "sim-card-routers": "networking-security",
  "wi-fi-adapters": "networking-security",
  switches: "networking-security",
  "ubiquiti-airmax-devices": "networking-security",
  "hikvision-cameras": "networking-security",
  "hikvision-dvr": "networking-security",
  "bullet-cameras": "networking-security",
  "security-systems": "networking-security",
  // Phones, TV & Audio
  "mobile-phones": "phones-tv-audio",
  "apple-iphone": "phones-tv-audio",
  "nokia-phones": "phones-tv-audio",
  "smart-tv": "phones-tv-audio",
  speakers: "phones-tv-audio",
  "portable-bluetooth-speakers": "phones-tv-audio",
  headphones: "phones-tv-audio",
  headsets: "phones-tv-audio",
  "computer-headsets": "phones-tv-audio",
  "apple-airpods": "phones-tv-audio",
  "galaxy-buds": "phones-tv-audio",
  "epson-projector": "phones-tv-audio",
  "acer-projector": "phones-tv-audio",
  "google-chromecast": "phones-tv-audio",
  "jabra-speakerphone": "phones-tv-audio",
  "jabra-headsets": "phones-tv-audio",
  "jabra-wired-headset": "phones-tv-audio",
  "jabra-table-stand": "phones-tv-audio",
  "jabra-remote-control": "phones-tv-audio",
  "jabra-usb-adapter": "phones-tv-audio",
  "jabra-wall-mount": "phones-tv-audio",
  "ip-phones": "phones-tv-audio",
  "conference-camera": "phones-tv-audio",
  // Accessories
  accessories: "accessories",
  "gaming-consoles": "accessories",
  "laptop-chargers": "accessories",
  webcams: "accessories",
  "wireless-mouse": "accessories",
  "wired-mouse": "accessories",
  "microsoft-licensing": "accessories",
  "microsoft-365-family": "accessories",
  "computer-software": "accessories",
  software: "accessories",
  "productivity-software-suites": "accessories",
  "subscription-services": "accessories",
};

function mapCategorySlug(slug) {
  if (!slug) return "accessories";
  return CATEGORY_MAP[slug] || "accessories";
}

function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

// UGX → USD conversion (approximate)
const UGX_TO_USD_RATE = 3780;
function ugxToUsd(ugx) {
  if (!ugx) return 0;
  return Math.round((ugx / UGX_TO_USD_RATE) * 100) / 100;
}

// ─── Delete all documents in a collection ───────────────────────────────────
async function deleteCollection(collectionPath, batchSize = 400) {
  const collectionRef = db.collection(collectionPath);
  let totalDeleted = 0;

  while (true) {
    const snapshot = await collectionRef.limit(batchSize).get();
    if (snapshot.empty) break;

    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    totalDeleted += snapshot.size;
    console.log(`   Deleted ${totalDeleted} docs from ${collectionPath}...`);
  }

  return totalDeleted;
}

// ─── Build specifications from scraped-products.json ────────────────────────
function loadScrapedSpecs() {
  try {
    const raw = JSON.parse(readFileSync("./scraped-products.json", "utf-8"));
    const map = {};
    for (const p of raw.products) {
      if (p.slug && p.specifications && Object.keys(p.specifications).length > 0) {
        map[p.slug] = p.specifications;
      }
    }
    return map;
  } catch {
    return {};
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Seeding Firestore from raw API data...\n");

  // Load raw API data
  const rawData = JSON.parse(readFileSync("./scraped-api-raw.json", "utf-8"));
  const full = rawData.filter((p) => p.name && p.price);
  const products = [...new Map(full.map((p) => [p.id, p])).values()];
  console.log(`📦 Loaded ${products.length} unique products from scraped-api-raw.json`);

  // Load specs from scraped-products.json (more reliable specs extraction)
  const specsMap = loadScrapedSpecs();
  console.log(`📋 Loaded specs for ${Object.keys(specsMap).length} products\n`);

  // Step 1: Delete all existing products
  console.log("🗑️  Deleting all existing products...");
  const deleted = await deleteCollection("products");
  console.log(`   ✅ Deleted ${deleted} existing products\n`);

  // Step 2: Seed categories
  console.log("📂 Seeding categories...");
  const now = admin.firestore.FieldValue.serverTimestamp();
  let batch = db.batch();

  for (const c of CATEGORIES) {
    batch.set(
      db.collection("categories").doc(c.id),
      { ...c, active: true, updatedAt: now },
      { merge: true }
    );
  }
  await batch.commit();
  console.log(`   ✅ Seeded ${CATEGORIES.length} categories\n`);

  // Step 3: Seed products in batches
  console.log("📦 Seeding products...");
  const BATCH_SIZE = 400;
  let totalWritten = 0;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const chunk = products.slice(i, i + BATCH_SIZE);
    batch = db.batch();

    for (const p of chunk) {
      const catSlug = p.categories?.slug || "";
      const categoryId = mapCategorySlug(catSlug);
      const docId = p.slug || slugify(p.name);

      // Get specs: prefer scraped HTML specs, fall back to short_description parsing
      let specifications = specsMap[p.slug] || {};

      // If no specs from scraping, try parsing short_description
      if (Object.keys(specifications).length === 0 && p.short_description) {
        const parts = p.short_description.split("|||").filter(Boolean);
        for (const part of parts) {
          const colonIdx = part.indexOf(":");
          if (colonIdx > 0) {
            const key = part.slice(0, colonIdx).trim();
            const val = part.slice(colonIdx + 1).trim();
            if (key && val) specifications[key] = val;
          }
        }
      }

      // Use the original price (p.price) converted to USD
      const priceUsd = ugxToUsd(p.price);

      const doc = {
        name: p.name,
        description: stripHtml(p.description || ""),
        shortDescription: p.short_description
          ? p.short_description
              .split("|||")
              .filter(Boolean)
              .join(" | ")
          : "",
        category: p.categories?.name || "",
        categoryId,
        brand: p.brands?.name || "",
        priceUsd: priceUsd || 0,
        stock: p.stock_quantity || 0,
        isNew: false,
        images: [],
        specifications,
        sourceUrl: `https://mercurycomputerslimited.com/product/${p.slug}`,
        status: p.is_active ? "published" : "out_of_stock",
        currency: "USD",
        updatedAt: now,
      };

      batch.set(db.collection("products").doc(docId), doc, { merge: true });
    }

    await batch.commit();
    totalWritten += chunk.length;
    console.log(`   Written ${totalWritten}/${products.length} products...`);
  }

  console.log(`\n🎉 Done! Seeded ${totalWritten} products and ${CATEGORIES.length} categories.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  });
