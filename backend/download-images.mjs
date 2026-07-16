/**
 * Downloads product images from Supabase storage into a local folder.
 * Uses scraped-products.json (which has the actual rendered image URLs).
 *
 * Usage:
 *   node download-images.mjs [--batch=50] [--start=0]
 *
 * Output:
 *   ./product-images/{product-slug}/1.jpg, 2.jpg
 */

import { readFileSync, mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const BATCH_SIZE = parseInt(process.argv.find(a => a.startsWith("--batch="))?.split("=")[1] || "50");
const START = parseInt(process.argv.find(a => a.startsWith("--start="))?.split("=")[1] || "0");
const OUT_DIR = "./product-images";
const MAX_IMAGES = 2;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function downloadFile(url, dest) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) return false;
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("image")) return false;
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 1000) return false; // skip tiny/broken files
    writeFileSync(dest, buffer);
    return true;
  } catch {
    return false;
  }
}

function getExtension(url) {
  const match = url.match(/\.(jpe?g|png|webp|gif)/i);
  return match ? match[0].toLowerCase() : ".jpg";
}

async function main() {
  console.log("📦 Loading scraped product data...");
  const data = JSON.parse(readFileSync("./scraped-products.json", "utf-8"));
  const products = data.products;
  console.log(`   ${products.length} products total\n`);

  // Also load raw API data to map slug → product UUID (for filtering relevant images)
  const rawData = JSON.parse(readFileSync("./scraped-api-raw.json", "utf-8"));
  const full = rawData.filter(p => p.name && p.price && p.id);
  const apiProducts = new Map(full.map(p => [p.slug, p]));

  mkdirSync(OUT_DIR, { recursive: true });

  const end = Math.min(START + BATCH_SIZE, products.length);
  console.log(`🖼️  Downloading images for products ${START + 1} to ${end} (max ${MAX_IMAGES} each)...\n`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = START; i < end; i++) {
    const product = products[i];
    const slug = product.slug || `product-${i}`;
    const productDir = join(OUT_DIR, slug);

    // Skip if already downloaded
    if (existsSync(productDir)) {
      skipped++;
      continue;
    }

    // Get the product UUID to filter only its images
    const apiProduct = apiProducts.get(slug);
    const productId = apiProduct?.id || "";

    // Filter images: only keep Supabase product-images URLs that match this product's ID
    let images = (product.images || []).filter(url => {
      if (!url.includes("product-images")) return false;
      if (!url.includes("supabase.co")) return false;
      // If we have the product ID, only keep images from that folder
      if (productId && !url.includes(productId)) return false;
      // Skip render/resize URLs (use originals)
      if (url.includes("/render/image/")) return false;
      return true;
    });

    // Fallback: if no ID-matched images, take any product-images URL
    if (images.length === 0) {
      images = (product.images || []).filter(url =>
        url.includes("product-images") && url.includes("supabase.co") && !url.includes("/render/")
      );
    }

    if (images.length === 0) {
      failed++;
      console.log(`  [${i + 1}/${end}] ❌ ${slug} — no product images`);
      continue;
    }

    mkdirSync(productDir, { recursive: true });

    const toDownload = images.slice(0, MAX_IMAGES);
    let count = 0;
    for (let j = 0; j < toDownload.length; j++) {
      const url = toDownload[j];
      const ext = getExtension(url);
      const dest = join(productDir, `${j + 1}${ext}`);

      const ok = await downloadFile(url, dest);
      if (ok) count++;
      await sleep(150);
    }

    if (count > 0) {
      downloaded++;
      console.log(`  [${i + 1}/${end}] ✅ ${slug} — ${count} image(s)`);
    } else {
      failed++;
      console.log(`  [${i + 1}/${end}] ❌ ${slug} — download failed`);
    }
  }

  console.log(`\n🎉 Batch done!`);
  console.log(`   Downloaded: ${downloaded}`);
  console.log(`   Skipped (already exists): ${skipped}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Images saved to: ${OUT_DIR}/`);

  if (end < products.length) {
    console.log(`\n   Next batch: node download-images.mjs --start=${end} --batch=${BATCH_SIZE}`);
  } else {
    console.log(`\n   ✅ All products processed!`);
  }
}

main().catch(e => {
  console.error("Fatal:", e);
  process.exit(1);
});
