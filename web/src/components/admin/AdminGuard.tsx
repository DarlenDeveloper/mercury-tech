"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firestore";
import AdminProfileSetup from "@/components/admin/AdminProfileSetup";

export const ADMIN_AUTH_KEY = "mercury_admin_authed";

/**
 * Auth gate for admin. Checks Firebase Auth + admin whitelist stored
 * in Firestore at config/admins. Shows profile setup if no profile exists.
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [ready, setReady] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      window.localStorage.removeItem(ADMIN_AUTH_KEY);
      router.replace("/u/login");
      return;
    }

    const checkAdmin = async () => {
      try {
        // Check admin whitelist
        const adminRef = doc(db, "config", "admins");
        const adminSnap = await getDoc(adminRef);
        const emails: string[] = adminSnap.exists()
          ? (adminSnap.data()?.emails ?? [])
          : [];

        if (!emails.includes(user.email ?? "")) {
          window.localStorage.removeItem(ADMIN_AUTH_KEY);
          router.replace("/u/login");
          return;
        }

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
    <>
      {needsProfile && user && (
        <AdminProfileSetup
          user={user}
          onComplete={() => setNeedsProfile(false)}
        />
      )}
      {children}
    </>
  );
}
