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
