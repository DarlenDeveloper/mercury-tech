/**
 * Uploads downloaded product images to Firebase Storage and updates
 * Firestore product docs with the image URLs.
 *
 * ONLY updates the `image` and `images` fields — no other product data is touched.
 *
 * Usage:
 *   export GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
 *   node upload-images.mjs [--batch=50] [--start=0]
 *
 * Reads from: ./product-images/{slug}/1.jpg, 2.jpg
 * Uploads to: gs://mercurycomputers-tech.firebasestorage.app/products/{slug}/1.jpg
 * Updates Firestore: products/{slug}.image + products/{slug}.images
 */

import admin from "firebase-admin";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, extname } from "path";

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: "mercurycomputers-tech",
  storageBucket: "mercurycomputers-tech.firebasestorage.app",
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

const BATCH_SIZE = parseInt(process.argv.find(a => a.startsWith("--batch="))?.split("=")[1] || "50");
const START = parseInt(process.argv.find(a => a.startsWith("--start="))?.split("=")[1] || "0");
const IMG_DIR = "./product-images";

async function uploadFile(localPath, remotePath, contentType) {
  const file = bucket.file(remotePath);
  const buffer = readFileSync(localPath);
  await file.save(buffer, {
    metadata: { contentType },
    public: true,
  });
  return `https://storage.googleapis.com/${bucket.name}/${remotePath}`;
}

function getContentType(ext) {
  const map = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif" };
  return map[ext.toLowerCase()] || "image/jpeg";
}

async function main() {
  if (!existsSync(IMG_DIR)) {
    console.error("❌ No product-images directory found. Run download-images.mjs first.");
    process.exit(1);
  }

  const folders = readdirSync(IMG_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();

  console.log(`📦 Found ${folders.length} product image folders\n`);

  const end = Math.min(START + BATCH_SIZE, folders.length);
  console.log(`🚀 Uploading images for products ${START + 1} to ${end}...\n`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = START; i < end; i++) {
    const slug = folders[i];
    const folderPath = join(IMG_DIR, slug);
    const files = readdirSync(folderPath).filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f)).sort();

    if (files.length === 0) {
      skipped++;
      continue;
    }

    try {
      const imageUrls = [];

      for (const file of files) {
        const localPath = join(folderPath, file);
        const remotePath = `products/${slug}/${file}`;
        const ext = extname(file);
        const url = await uploadFile(localPath, remotePath, getContentType(ext));
        imageUrls.push(url);
      }

      // Update Firestore: only image + images fields
      const docRef = db.collection("products").doc(slug);
      const doc = await docRef.get();

      if (doc.exists) {
        await docRef.update({
          image: imageUrls[0],
          images: imageUrls,
        });
        uploaded++;
        console.log(`  [${i + 1}/${end}] ✅ ${slug} — ${imageUrls.length} image(s)`);
      } else {
        // Product doc doesn't exist with this slug — skip
        skipped++;
        console.log(`  [${i + 1}/${end}] ⚠️  ${slug} — no Firestore doc found`);
      }
    } catch (e) {
      failed++;
      console.log(`  [${i + 1}/${end}] ❌ ${slug} — ${e.message}`);
    }
  }

  console.log(`\n🎉 Batch done!`);
  console.log(`   Uploaded: ${uploaded}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Failed: ${failed}`);

  if (end < folders.length) {
    console.log(`\n   Next batch: node upload-images.mjs --start=${end} --batch=${BATCH_SIZE}`);
  } else {
    console.log(`\n   ✅ All done!`);
  }
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.error("Fatal:", e);
    process.exit(1);
  });
