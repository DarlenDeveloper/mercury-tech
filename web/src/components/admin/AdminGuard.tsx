"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firestore";

export const ADMIN_AUTH_KEY = "mercury_admin_authed";

/**
 * Auth gate for admin. Checks Firebase Auth + admin whitelist stored
 * in Firestore at config/admins. Only listed emails can access.
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      window.localStorage.removeItem(ADMIN_AUTH_KEY);
      router.replace("/u/login");
      return;
    }

    // Check Firestore for admin access
    const checkAdmin = async () => {
      try {
        const ref = doc(db, "config", "admins");
        const snap = await getDoc(ref);
        const emails: string[] = snap.exists()
          ? (snap.data()?.emails ?? [])
          : [];

        if (!emails.includes(user.email ?? "")) {
          window.localStorage.removeItem(ADMIN_AUTH_KEY);
          router.replace("/u/login");
          return;
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

  return <>{children}</>;
}
