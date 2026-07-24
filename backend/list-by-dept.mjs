import admin from "firebase-admin";
admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: "mercurycomputers-tech" });
const db = admin.firestore();

const ORDER = ["laptops", "desktops", "printers-office", "networking-security", "ups-power", "software", "other"];
const only = process.argv[2]; // optional: single dept

const snap = await db.collection("products").get();
const byDept = {};
for (const doc of snap.docs) {
  const p = doc.data();
  (byDept[p.categoryId] ||= []).push({ id: doc.id, name: p.name, cat: p.category });
}

for (const dept of ORDER) {
  if (only && dept !== only) continue;
  const items = (byDept[dept] || []).sort((a, b) => (a.cat || "").localeCompare(b.cat || "") || a.name.localeCompare(b.name));
  console.log(`\n######## ${dept}  (${items.length}) ########`);
  for (const i of items) console.log(`  ${i.id}\n     cat="${i.cat}"  |  ${i.name}`);
}
process.exit(0);
