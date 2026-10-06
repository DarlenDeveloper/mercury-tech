import { collection, getDocs, query, where, type DocumentData } from "firebase/firestore";
import { db } from "./firestore";

export type AdminProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  createdAt: Date | null;
};

const FIRESTORE_IN_LIMIT = 30;

export function adminEmailQueryChunks(emails: string[]): string[][] {
  const values = [...new Set(
    emails.flatMap(email => {
      const trimmed = email.trim();
      return trimmed ? [trimmed, trimmed.toLowerCase()] : [];
    })
  )];
  const chunks: string[][] = [];
  for (let index = 0; index < values.length; index += FIRESTORE_IN_LIMIT) {
    chunks.push(values.slice(index, index + FIRESTORE_IN_LIMIT));
  }
  return chunks;
}

function toProfile(id: string, data: DocumentData): AdminProfile {
  return {
    id,
    name: data.name || "Unknown",
    email: data.email || "",
    phone: data.phone || "",
    location: data.location || "",
    role: data.role || "Admin",
    createdAt: data.createdAt?.toDate?.() ?? null,
  };
}

/** Load only profiles whose emails are present in the admin configuration. */
export async function fetchAdminProfiles(emails: string[]): Promise<AdminProfile[]> {
  const chunks = adminEmailQueryChunks(emails);
  if (chunks.length === 0) return [];

  const snapshots = await Promise.all(
    chunks.map(values => getDocs(query(collection(db, "users"), where("email", "in", values))))
  );
  const profiles = new Map<string, AdminProfile>();
  for (const snapshot of snapshots) {
    for (const profile of snapshot.docs) {
      profiles.set(profile.id, toProfile(profile.id, profile.data()));
    }
  }
  return [...profiles.values()];
}
