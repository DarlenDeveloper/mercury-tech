"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firestore";
import AdminProfileSetup from "@/components/admin/AdminProfileSetup";
import type { AdminEntry } from "@/lib/adminAccess";

export const ADMIN_AUTH_KEY = "mercury_admin_authed";

// ─── Context ─────────────────────────────────────────────────────────────────

type AdminAccessContext = {
  adminEntry: AdminEntry | null;
};

const AdminAccessCtx = createContext<AdminAccessContext>({ adminEntry: null });

export function useAdminAccess() {
  return useContext(AdminAccessCtx);
}

// ─── Guard Component ─────────────────────────────────────────────────────────

/**
 * Auth gate for admin. Checks Firebase Auth + admin whitelist stored
 * in Firestore at config/admins. Shows profile setup if no profile exists.
 * Exposes the user's AdminEntry (access level + pages) via context.
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [ready, setReady] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [adminEntry, setAdminEntry] = useState<AdminEntry | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      window.localStorage.removeItem(ADMIN_AUTH_KEY);
      router.replace("/u/login");
      return;
    }

    const checkAdmin = async () => {
      try {
        // Get admin config
        const adminRef = doc(db, "config", "admins");
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) {
          router.replace("/u/login");
          return;
        }

        const data = adminSnap.data();
        const userEmail = user.email ?? "";

        // Try new access-based system first
        const admins: AdminEntry[] = data?.admins ?? [];
        let entry = admins.find(
          (a) => a.email.toLowerCase() === userEmail.toLowerCase()
        ) ?? null;

        // Fallback to legacy emails array
        if (!entry) {
          const legacyEmails: string[] = data?.emails ?? [];
          if (legacyEmails.includes(userEmail)) {
            // Legacy admin gets full access (treated as super_admin for migration)
            entry = { email: userEmail, access: "super_admin", pages: ["*"] };
          }
        }

        if (!entry) {
          window.localStorage.removeItem(ADMIN_AUTH_KEY);
          router.replace("/u/login");
          return;
        }

        setAdminEntry(entry);

        // Check if user has a profile
        const profileRef = doc(db, "users", user.uid);
        const profileSnap = await getDoc(profileRef);

        if (!profileSnap.exists() || !profileSnap.data()?.name) {
          setNeedsProfile(true);
        }

        window.localStorage.setItem(ADMIN_AUTH_KEY, "1");
        setReady(true);
      } catch {
        router.replace("/u/login");
      }
    };

    checkAdmin();
  }, [user, loading, router]);

  if (loading || !ready) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f6f7f9]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-mercury" />
      </div>
    );
  }

  return (
    <AdminAccessCtx.Provider value={{ adminEntry }}>
      {needsProfile && user && (
        <AdminProfileSetup
          user={user}
          onComplete={() => setNeedsProfile(false)}
        />
      )}
      {children}
    </AdminAccessCtx.Provider>
  );
}
