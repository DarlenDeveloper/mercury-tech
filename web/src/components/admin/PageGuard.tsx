"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAdminAccess } from "@/components/admin/AdminGuard";
import { hasPageAccess } from "@/lib/adminAccess";

/**
 * Enforces page-level access control. Checks the current URL path
 * against the user's allowed pages and redirects to /u if unauthorized.
 */
export default function PageGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminEntry } = useAdminAccess();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!adminEntry) return;

    // Dashboard (/u) is always accessible
    if (pathname === "/u") {
      setAllowed(true);
      return;
    }

    // Extract page slug from pathname: /u/orders -> "orders", /u/audit-logs -> "audit-logs"
    const slug = pathname.replace("/u/", "").split("/")[0];

    if (hasPageAccess(adminEntry, slug)) {
      setAllowed(true);
    } else {
      // Redirect to dashboard with no access
      router.replace("/u");
    }
  }, [pathname, adminEntry, router]);

  if (!allowed) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-mercury" />
      </div>
    );
  }

  return <>{children}</>;
}
