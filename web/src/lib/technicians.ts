import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseApp } from "./firebase";

export type Technician = {
  id: string;
  name: string;
  phone: string;
  normalizedPhone: string;
  email: string;
  speciality: string;
  notes: string;
  active: boolean;
  authUid: string;
  accountLinkStatus: "unlinked" | "pending" | "linked" | "conflict";
  pendingAuthEmail: string;
};

const functions = () => getFunctions(firebaseApp);

export function technicianErrorMessage(error: unknown, fallback: string) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  if (["functions/internal", "functions/not-found", "functions/unavailable"].includes(code)) {
    return "The technician service is not available yet. Deploy the latest workshop backend, then refresh this page.";
  }
  return error instanceof Error && error.message && error.message !== "internal" ? error.message : fallback;
}

export async function fetchTechnicians(): Promise<Technician[]> {
  const response = await httpsCallable<Record<string, never>, { technicians: Technician[] }>(functions(), "listTechnicians")({});
  return response.data.technicians;
}

export async function saveTechnician(fields: {
  id?: string;
  name: string;
  phone: string;
  email: string;
  speciality: string;
  notes: string;
  active?: boolean;
}) {
  const response = await httpsCallable<typeof fields & { action: "create" | "update" }, { ok: true; id: string }>(functions(), "manageTechnician")({
    ...fields,
    action: fields.id ? "update" : "create",
  });
  return response.data.id;
}

export async function deactivateTechnician(id: string) {
  await httpsCallable(functions(), "manageTechnician")({ action: "deactivate", id });
}

export async function approveTechnicianLink(id: string) {
  await httpsCallable(functions(), "manageTechnician")({ action: "approve_link", id });
}

