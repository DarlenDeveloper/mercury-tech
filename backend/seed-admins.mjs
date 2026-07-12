// Seeds the admin whitelist into Firestore.
// Run: node seed-admins.mjs
import admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: "mercurycomputers-tech",
});

const db = admin.firestore();

await db.doc("config/admins").set({
  // Legacy field kept for backward compat during migration
  emails: ["devadmin@togashi.com", "knl.conrad@gmail.com"],
  // New access-based system
  admins: [
    {
      email: "devadmin@togashi.com",
      access: "super_admin",
      pages: ["*"],
    },
    {
      email: "knl.conrad@gmail.com",
      access: "super_admin",
      pages: ["*"],
    },
  ],
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
});

console.log("✓ Admin whitelist saved to config/admins (with access control)");
process.exit(0);
