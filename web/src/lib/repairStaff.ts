import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "./firestore";
import { STAFF_ROLES, type AdminEntry } from "./adminAccess";
import type { RepairAssignee } from "./repairAssignment";

export async function fetchRepairStaff(): Promise<RepairAssignee[]> {
  const [config, profiles] = await Promise.all([
    getDoc(doc(db, "config", "admins")),
    getDocs(collection(db, "users")),
  ]);
  const entries: AdminEntry[] = config.data()?.admins || [];
  const names = new Map(profiles.docs.map(profile => {
    const data = profile.data();
    return [String(data.email || "").toLowerCase(), String(data.name || "")];
  }));
  const staff = new Map<string, RepairAssignee>();
  for (const entry of entries) {
    if (!entry.jobRole || !STAFF_ROLES.includes(entry.jobRole)) continue;
    const email = entry.email.toLowerCase();
    staff.set(email, { email, name: names.get(email) || email, role: entry.jobRole });
  }
  return [...staff.values()].sort((a, b) => a.name.localeCompare(b.name));
}
