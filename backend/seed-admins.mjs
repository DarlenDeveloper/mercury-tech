// Seeds the admin whitelist into Firestore.
// Run: node seed-admins.mjs
import admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: "mercurycomputers-tech",
});

const db = admin.firestore();

await db.doc("config/admins").set({
  emails: ["devadmin@togashi.com"],
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
});

console.log("✓ Admin whitelist saved to config/admins");
process.exit(0);
