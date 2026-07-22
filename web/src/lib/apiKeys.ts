import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseApp } from "./firebase";

const functions = getFunctions(firebaseApp);

export type ApiScope =
  | "*"
  | "products:read" | "products:write"
  | "orders:read" | "orders:write"
  | "quotations:read" | "quotations:write"
  | "repairs:read" | "repairs:write";

export type ApiKey = {
  id: string;
  label: string;
  scopes: string[];
  display: string;
  active: boolean;
  createdBy: string;
  usageCount: number;
  lastUsedAt: string | null;
  createdAt: string | null;
};

/** Create a key. The plaintext `key` is returned ONCE — surface it immediately. */
export async function createApiKey(
  label: string,
  scopes: ApiScope[]
): Promise<{ id: string; key: string; display: string; scopes: string[]; label: string }> {
  const callable = httpsCallable<
    { label: string; scopes: string[] },
    { id: string; key: string; display: string; scopes: string[]; label: string }
  >(functions, "createApiKey");
  const res = await callable({ label, scopes });
  return res.data;
}

export async function listApiKeys(): Promise<ApiKey[]> {
  const callable = httpsCallable<Record<string, never>, { keys: ApiKey[] }>(
    functions,
    "listApiKeys"
  );
  const res = await callable({});
  return res.data.keys;
}

export async function revokeApiKey(id: string): Promise<void> {
  const callable = httpsCallable<{ id: string }, { id: string; revoked: boolean }>(
    functions,
    "revokeApiKey"
  );
  await callable({ id });
}

export async function deleteApiKey(id: string): Promise<void> {
  const callable = httpsCallable<{ id: string }, { id: string; deleted: boolean }>(
    functions,
    "deleteApiKey"
  );
  await callable({ id });
}

export type ApiLogEntry = {
  id: string;
  keyLabel: string;
  method: string;
  resource: string;
  path: string;
  status: number;
  durationMs: number | null;
  ip: string | null;
  timestamp: string | null;
};

export type ApiActivity = {
  daily: { date: string; count: number }[];
  logs: ApiLogEntry[];
  totals: { total: number; success: number; errors: number };
  days: number;
};

export async function getApiActivity(days = 14, limit = 50): Promise<ApiActivity> {
  const callable = httpsCallable<{ days: number; limit: number }, ApiActivity>(
    functions,
    "getApiActivity"
  );
  const res = await callable({ days, limit });
  return res.data;
}
