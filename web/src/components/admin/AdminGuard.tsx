"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firestore";
import AdminProfileSetup from "@/components/admin/AdminProfileSetup";
import { resolveAdminEntry, type AdminEntry } from "@/lib/adminAccess";

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
 * Exposes the user's AdminEntry (dashboard, access level and pages) via context.
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
    let active = true;
    let initialized = false;
    setReady(false);
    const unsubscribe = onSnapshot(doc(db, "config", "admins"), async adminSnap => {
      if (!active) return;
      const entry = adminSnap.exists() ? resolveAdminEntry(adminSnap.data(), user.email ?? "") : null;
      if (!entry) {
        window.localStorage.removeItem(ADMIN_AUTH_KEY);
        setAdminEntry(null);
        setReady(false);
        router.replace("/u/login");
        return;
      }
      setAdminEntry(entry);
      if (initialized) return;
      initialized = true;
      try {
        const profileSnap = await getDoc(doc(db, "users", user.uid));
        if (!active) return;
        if (!profileSnap.exists() || !profileSnap.data()?.name) setNeedsProfile(true);
        window.localStorage.setItem(ADMIN_AUTH_KEY, "1");
        setReady(true);
      } catch {
        if (active) router.replace("/u/login");
      }
    }, () => {
      if (active) router.replace("/u/login");
    });
    return () => {
      active = false;
      unsubscribe();
    };
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
