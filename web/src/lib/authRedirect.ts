import { doc, getDoc } from "firebase/firestore";
import { resolveAdminEntry } from "@/lib/adminAccess";
import { db } from "@/lib/firestore";

/** Choose the default landing page after authentication based on admin access. */
export async function getDefaultAuthenticatedPath(email?: string | null): Promise<string> {
  if (!email) return "/";

  const adminSnap = await getDoc(doc(db, "config", "admins"));
  const entry = adminSnap.exists()
    ? resolveAdminEntry(adminSnap.data(), email)
    : null;

  return entry ? "/select-role" : "/";
}
