"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export const ADMIN_AUTH_KEY = "mercury_admin_authed";

/**
 * Auth gate for admin. Uses Firebase Auth — redirects to /login if not
 * authenticated. Also sets localStorage flag for backward compat.
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      window.localStorage.removeItem(ADMIN_AUTH_KEY);
      router.replace("/login");
      return;
    }
    window.localStorage.setItem(ADMIN_AUTH_KEY, "1");
    setReady(true);
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
