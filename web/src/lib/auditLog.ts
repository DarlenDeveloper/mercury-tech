import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, where, Timestamp } from "firebase/firestore";
import { db } from "./firestore";

export type AuditAction =
  | "login"
  | "logout"
  | "page_view"
  | "product_created"
  | "product_updated"
  | "product_deleted"
  | "category_created"
  | "category_updated"
  | "category_deleted"
  | "category_toggled"
  | "rate_updated"
  | "order_updated"
  | "user_role_changed"
  | "settings_updated"
  | "homepage_updated";

export type AuditLogEntry = {
  id: string;
  actor: string;
  actorId: string;
  action: AuditAction;
  target: string;
  details?: string;
  timestamp: Date;
};

/**
 * Writes an audit log entry to Firestore.
 */
export async function logAudit({
  actor,
  actorId,
  action,
  target,
  details,
}: {
  actor: string;
  actorId: string;
  action: AuditAction;
  target: string;
  details?: string;
}) {
  try {
    await addDoc(collection(db, "audit_logs"), {
      actor,
      actorId,
      action,
      target,
      details: details || "",
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    console.error("Failed to write audit log:", e);
  }
}

/**
 * Fetches audit logs from Firestore, ordered by most recent first.
 */
export async function fetchAuditLogs(count = 100): Promise<AuditLogEntry[]> {
  const q = query(
    collection(db, "audit_logs"),
    orderBy("timestamp", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      actor: data.actor ?? "",
      actorId: data.actorId ?? "",
      action: data.action ?? "page_view",
      target: data.target ?? "",
      details: data.details ?? "",
      timestamp: data.timestamp instanceof Timestamp
        ? data.timestamp.toDate()
        : new Date(),
    };
  });
}

/**
 * Human-readable label for audit actions.
 */
export function actionLabel(action: AuditAction): string {
  const labels: Record<AuditAction, string> = {
    login: "Logged in",
    logout: "Logged out",
    page_view: "Viewed page",
    product_created: "Created product",
    product_updated: "Updated product",
    product_deleted: "Deleted product",
    category_created: "Created category",
    category_updated: "Updated category",
    category_deleted: "Deleted category",
    category_toggled: "Toggled category visibility",
    rate_updated: "Updated USD rate",
    order_updated: "Updated order",
    user_role_changed: "Changed user role",
    settings_updated: "Updated settings",
    homepage_updated: "Updated homepage",
  };
  return labels[action] || action;
}
