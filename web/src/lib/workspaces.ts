export const SHARED_WORKSPACE_PAGES = [
  "customers",
  "customer-care",
  "quotations",
  "payments",
  "users",
];

export const SALES_ONLY_PAGES = [
  "analytics",
  "orders",
  "products",
  "categories",
  "website",
  "user-tracking",
  "finance",
  "ai",
  "notifications",
  "audit-logs",
  "settings",
  "api-keys",
  "help",
];

export const WORKSHOP_ONLY_PAGES = ["repairs", "assignments", "reminders"];

export const SALES_PAGES = [...SHARED_WORKSPACE_PAGES, ...SALES_ONLY_PAGES];
export const WORKSHOP_PAGES = [...SHARED_WORKSPACE_PAGES, ...WORKSHOP_ONLY_PAGES];
