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
 *   dashboards: ("sales" | "workshop")[],
 *   pages: string[]             // ["*"] for all, or specific page slugs
 * }
 *
 * Page slugs match sidebar hrefs without /u/ prefix:
 *   "analytics", "orders", "products", "categories", "customers",
 *   "repairs", "assignments", "reminders",
 *   "payments", "user-tracking", "finance", "website", "users",
 *   "notifications", "audit-logs", "settings", "help"
 *
 * Entries created before dashboard access was introduced default to both
 * workspaces until a super admin edits them.
 */

export type AccessLevel = "super_admin" | "admin";
export const DASHBOARDS = ["sales", "workshop"] as const;
export type DashboardAccess = (typeof DASHBOARDS)[number];

export const STAFF_ROLES = ["Sales", "Technician", "Support", "Developer"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export type AdminEntry = {
  jobRole?: StaffRole | "";
  email: string;
  access: AccessLevel;
  dashboards?: DashboardAccess[];
  pages: string[]; // ["*"] = all pages
};

export const ALL_PAGES = [
  "analytics",
  "orders",
  "products",
  "categories",
  "customers",
  "repairs",
  "assignments",
  "reminders",
  "payments",
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
  "api-keys",
  "help",
];

/** Check if a user has access to a specific page slug. */
export function hasPageAccess(entry: AdminEntry | null, pageSlug: string): boolean {
  if (!entry) return false;
  if (entry.access === "super_admin") return true;
  if (pageSlug === "assignments" && entry.jobRole === "Technician") return true;
  if (entry.pages?.includes("*")) return true;
  return entry.pages?.includes(pageSlug) ?? false;
}

/** Resolve workspace access, defaulting legacy entries to both dashboards. */
export function dashboardsFor(entry: AdminEntry | null): DashboardAccess[] {
  if (!entry) return [];
  if (!Array.isArray(entry.dashboards)) return [...DASHBOARDS];
  return DASHBOARDS.filter(dashboard => entry.dashboards?.includes(dashboard));
}

export function hasDashboardAccess(entry: AdminEntry | null, dashboard: DashboardAccess): boolean {
  return dashboardsFor(entry).includes(dashboard);
}

export function resolveAdminEntry(config: { admins?: AdminEntry[]; emails?: string[] }, email: string): AdminEntry | null {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return null;
  const entry = (config.admins || []).find(item => item.email?.toLowerCase() === normalizedEmail);
  if (entry) return entry;
  const legacy = (config.emails || []).some(item => item.toLowerCase() === normalizedEmail);
  return legacy ? { email: normalizedEmail, access: "super_admin", pages: ["*"] } : null;
}

/** Check if user is a super admin. */
export function isSuperAdmin(entry: AdminEntry | null): boolean {
  return entry?.access === "super_admin";
}
