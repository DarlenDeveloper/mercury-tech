import { doc, getDoc } from "firebase/firestore";
import { db } from "./firestore";
import { STAFF_ROLES, type AdminEntry } from "./adminAccess";
import type { RepairAssignee } from "./repairAssignment";
import { fetchAdminProfiles } from "./adminProfiles";

export async function fetchRepairStaff(): Promise<RepairAssignee[]> {
  const config = await getDoc(doc(db, "config", "admins"));
  const entries: AdminEntry[] = config.data()?.admins || [];
  const profiles = await fetchAdminProfiles(entries.map(entry => entry.email));
  const names = new Map(profiles.map(profile => [profile.email.toLowerCase(), profile.name]));
  const staff = new Map<string, RepairAssignee>();
  for (const entry of entries) {
    if (!entry.jobRole || !STAFF_ROLES.includes(entry.jobRole)) continue;
    const email = entry.email.toLowerCase();
    staff.set(email, { email, name: names.get(email) || email, role: entry.jobRole });
  }
  return [...staff.values()].sort((a, b) => a.name.localeCompare(b.name));
}
