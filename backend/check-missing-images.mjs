import admin from "firebase-admin";
import fs from "fs";
import path from "path";
admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: "mercurycomputers-tech" });
const db = admin.firestore();
const IMG_DIR = path.join(process.cwd(), "product-images");

const snap = await db.collection("products").get();
let hasLocal = 0, noLocal = 0;
const noLocalList = [];
for (const doc of snap.docs) {
  const p = doc.data();
  const missing = (!Array.isArray(p.images) || p.images.length === 0) && !p.image
    || (Array.isArray(p.images) && p.images.length === 0);
  if (!missing) continue;
  const dir = path.join(IMG_DIR, doc.id);
  let files = [];
  if (fs.existsSync(dir)) files = fs.readdirSync(dir).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
  if (files.length) { hasLocal++; console.log(`LOCAL(${files.length})  ${doc.id}`); }
  else { noLocal++; noLocalList.push(doc.id); }
}
console.log(`\nWith local images available: ${hasLocal}`);
console.log(`No local images anywhere: ${noLocal}`);
console.log("\n-- NO LOCAL IMAGES --");
noLocalList.forEach((s) => console.log("  " + s));
process.exit(0);
