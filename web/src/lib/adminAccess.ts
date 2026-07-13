/**
 * Admin access control types and helpers.
 *
 * Schema in Firestore (config/admins):
 * {
 *   emails: string[],           // legacy flat whitelist
 *   admins: AdminEntry[],       // new access-based list
 * }
 *
 * AdminEntry:
 * {
 *   email: string,
 *   access: "super_admin" | "admin",
 *   pages: string[]             // ["*"] for all, or specific page slugs
 * }
 *
 * Page slugs match sidebar hrefs without /u/ prefix:
 *   "analytics", "orders", "products", "categories", "customers",
 *   "repairs", "user-tracking", "finance", "website", "users",
 *   "notifications", "audit-logs", "settings", "help"
 *
 * The dashboard ("/u") is always accessible to any admin.
 */

export type AccessLevel = "super_admin" | "admin";

export type AdminEntry = {
  email: string;
  access: AccessLevel;
  pages: string[]; // ["*"] = all pages
};

export const ALL_PAGES = [
  "analytics",
  "orders",
  "products",
  "categories",
  "customers",
  "repairs",
  "user-tracking",
  "finance",
  "website",
  "quotations",
  "customer-care",
  "ai",
  "users",
  "notifications",
  "audit-logs",
  "settings",
  "help",
];

/** Check if a user has access to a specific page slug. */
export function hasPageAccess(entry: AdminEntry | null, pageSlug: string): boolean {
  if (!entry) return false;
  if (entry.access === "super_admin") return true;
  if (entry.pages.includes("*")) return true;
  return entry.pages.includes(pageSlug);
}

/** Check if user is a super admin. */
export function isSuperAdmin(entry: AdminEntry | null): boolean {
  return entry?.access === "super_admin";
}
