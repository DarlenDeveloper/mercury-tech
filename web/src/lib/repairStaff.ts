import { doc, getDoc } from "firebase/firestore";
import { db } from "./firestore";
import { STAFF_ROLES, type AdminEntry } from "./adminAccess";
import type { RepairAssignee } from "./repairAssignment";
import { fetchAdminProfiles } from "./adminProfiles";
import { fetchTechnicians } from "./technicians";

export async function fetchRepairStaff(): Promise<RepairAssignee[]> {
  const [config, technicians] = await Promise.all([getDoc(doc(db, "config", "admins")), fetchTechnicians()]);
  const entries: AdminEntry[] = config.data()?.admins || [];
  const profiles = await fetchAdminProfiles(entries.map(entry => entry.email));
  const names = new Map(profiles.map(profile => [profile.email.toLowerCase(), profile.name]));
  const staff = new Map<string, RepairAssignee>();
  for (const entry of entries) {
    if (!entry.jobRole || !STAFF_ROLES.includes(entry.jobRole)) continue;
    const email = entry.email.toLowerCase();
    staff.set(email, { id: email, email, name: names.get(email) || email, role: entry.jobRole });
  }
  for (const technician of technicians.filter(item => item.active)) {
    staff.set(`technician:${technician.id}`, { id: technician.id, email: technician.email, name: technician.name, role: "Technician", phone: technician.phone, authUid: technician.authUid });
  }
  return [...staff.values()].sort((a, b) => a.name.localeCompare(b.name));
}
