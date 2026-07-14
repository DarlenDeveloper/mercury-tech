"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { logAudit } from "@/lib/auditLog";

/**
 * Tracks admin page navigation and logs it to audit_logs.
 * Place this inside the admin layout (within AuthProvider + AdminGuard).
 */
export default function AuditTracker() {
  const pathname = usePathname();
  const { user } = useAuth();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    if (!user || !pathname) return;
    // Don't log the same page twice in a row
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;

    // Map pathname to a readable page name
    const pageName = getPageName(pathname);

    logAudit({
      actor: user.displayName || user.email || "Unknown",
      actorId: user.uid || "",
      action: "page_view",
      target: pageName,
      details: pathname,
    });
  }, [pathname, user]);

  return null;
}

function getPageName(path: string): string {
  const map: Record<string, string> = {
    "/u": "Dashboard",
    "/u/analytics": "Analytics",
    "/u/orders": "Orders",
    "/u/products": "Products",
    "/u/categories": "Categories",
    "/u/customers": "Customers",
    "/u/repairs": "Repairs & Services",
    "/u/user-tracking": "User Tracking",
    "/u/finance": "Financial Reports",
    "/u/website": "Website",
    "/u/customer-care": "Customer Care",
    "/u/ai": "AI",
    "/u/users": "Users & Roles",
    "/u/notifications": "Notifications",
    "/u/audit-logs": "Audit Logs",
    "/u/settings": "Settings",
    "/u/help": "Help",
  };
  return map[path] || path;
}
