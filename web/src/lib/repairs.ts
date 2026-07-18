import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firestore";

export type RepairStatus = "received" | "in_progress" | "awaiting_parts" | "completed";

export type RepairTicket = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  device: string;
  issue: string;
  service: string;
  status: RepairStatus;
  technician: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
};

const COL = "repair_tickets";

/** Customer submits a repair request. */
export async function submitRepairRequest({
  userId,
  userName,
  userEmail,
  userPhone,
  device,
  issue,
}: {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  device: string;
  issue: string;
}): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    userId,
    userName,
    userEmail,
    userPhone,
    device,
    issue,
    service: "Repair",
    status: "received",
    technician: "",
    notes: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Fetch all repair tickets (admin). */
export async function fetchRepairTickets(): Promise<RepairTicket[]> {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      userId: data.userId || "",
      userName: data.userName || "",
      userEmail: data.userEmail || "",
      userPhone: data.userPhone || "",
      device: data.device || "",
      issue: data.issue || "",
      service: data.service || "Repair",
      status: data.status || "received",
      technician: data.technician || "",
      notes: data.notes || "",
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
    };
  });
}

/** Fetch tickets for a specific user. */
export async function fetchMyRepairTickets(userId: string): Promise<RepairTicket[]> {
  const q = query(collection(db, COL), where("userId", "==", userId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      userId: data.userId || "",
      userName: data.userName || "",
      userEmail: data.userEmail || "",
      userPhone: data.userPhone || "",
      device: data.device || "",
      issue: data.issue || "",
      service: data.service || "Repair",
      status: data.status || "received",
      technician: data.technician || "",
      notes: data.notes || "",
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
    };
  });
}

/** Admin updates a repair ticket. */
export async function updateRepairTicket(
  id: string,
  fields: { status?: RepairStatus; technician?: string; notes?: string; service?: string }
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}
