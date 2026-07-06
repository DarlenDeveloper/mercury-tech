"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const ADMIN_AUTH_KEY = "mercury_admin_authed";

/**
 * Lightweight client-side auth gate. Redirects to /login unless a session
 * flag is present. Swap the localStorage check for Firebase Auth later.
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const authed =
      typeof window !== "undefined" &&
      window.localStorage.getItem(ADMIN_AUTH_KEY) === "1";
    if (!authed) {
      router.replace("/login");
      return;
    }
    setChecked(true);
  }, [router]);

  if (!checked) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f6f7f9]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-mercury" />
      </div>
    );
  }

  return <>{children}</>;
}
