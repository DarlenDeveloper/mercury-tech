import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseApp } from "./firebase";
import type { AdminEntry } from "./adminAccess";

const callable = () => httpsCallable<
  { action: "upsert"; entry: AdminEntry } | { action: "remove"; email: string },
  { ok: true; email: string; action: "upsert" | "remove" }
>(getFunctions(firebaseApp), "manageAdminAccess");

export async function saveAdminAccess(entry: AdminEntry) {
  await callable()({ action: "upsert", entry });
}

export async function removeAdminAccess(email: string) {
  await callable()({ action: "remove", email });
}
