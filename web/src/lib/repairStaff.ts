import { doc, getDoc } from "firebase/firestore";
import { db } from "./firestore";
import { STAFF_ROLES, type AdminEntry } from "./adminAccess";
import type { RepairAssignee } from "./repairAssignment";
import { fetchAdminProfiles } from "./adminProfiles";
import { fetchTechnicians } from "./technicians";

export async function fetchRepairStaff(requireTechnicianDirectory = false): Promise<RepairAssignee[]> {
  const [config, technicianResult] = await Promise.all([getDoc(doc(db, "config", "admins")), fetchTechnicians().then(data => ({ data, error: false }), () => ({ data: [], error: true }))]);
  const technicians = technicianResult.data;
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
    staff.set(`technician:${technician.id}`, { id: technician.id, email: technician.email, name: technician.name, role: "Technician", phone: technician.phone, authUid: technician.authUid, directory: true });
  }
  if (technicianResult.error && (requireTechnicianDirectory || !staff.size)) throw new Error("Could not load the technician directory.");
  return [...staff.values()].sort((a, b) => a.name.localeCompare(b.name));
}
