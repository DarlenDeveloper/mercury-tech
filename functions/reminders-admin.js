import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";

export const COMPLETED_REMINDER_STATUSES = ["accepted", "sent", "delivered", "read"];
export const FAILED_REMINDER_STATUSES = ["failed", "skipped"];

function text(value, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function toIso(value) {
  if (!value) return null;
  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function reminderOutcome(providerStatus) {
  if (COMPLETED_REMINDER_STATUSES.includes(providerStatus)) return "completed";
  if (FAILED_REMINDER_STATUSES.includes(providerStatus)) return "failed";
  return "pending";
}

export function projectReminder(id, data = {}, ticket = {}) {
  const providerStatus = text(data.providerStatus, 40) || "unknown";
  return {
    id,
    ticketId: text(data.ticketId, 150),
    trackingReference: text(ticket.trackingReference, 150) || text(data.ticketId, 150),
    customerName: text(ticket.userName, 150) || "Customer",
    customerPhone: text(data.recipient, 40) || text(ticket.userPhone, 40),
    device: text(ticket.device, 250),
    repairStatus: text(data.repairStatus, 60) || text(ticket.status, 60),
    provider: text(data.provider, 60) || "kacyberpay",
    providerStatus,
    outcome: reminderOutcome(providerStatus),
    messageId: text(data.messageId, 180),
    kacyberReference: text(data.kacyberReference, 180),
    fee: Number.isFinite(data.fee) ? data.fee : null,
    currency: text(data.currency, 10),
    failureReason: text(data.failureReason, 500),
    httpStatus: Number.isInteger(data.httpStatus) ? data.httpStatus : null,
    retryable: typeof data.retryable === "boolean" ? data.retryable : null,
    acceptedAt: toIso(data.acceptedAt),
    updatedAt: toIso(data.updatedAt),
  };
}

async function requirePage(request, page) {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in first.");
  const email = text(request.auth.token.email, 320).toLowerCase();
  const snap = await getFirestore().doc("config/admins").get();
  const config = snap.data() || {};
  const admin = (config.admins || []).find(entry => entry.email?.toLowerCase() === email);
  const legacy = !admin && (config.emails || []).some(item => item.toLowerCase() === email);
  if (!legacy && (!admin || (admin.access !== "super_admin" && !admin.pages?.some(value => value === "*" || value === page)))) {
    throw new HttpsError("permission-denied", `You need ${page} access.`);
  }
}

async function reminderSummary(collection) {
  const [all, completed, failed] = await Promise.all([
    collection.count().get(),
    collection.where("providerStatus", "in", COMPLETED_REMINDER_STATUSES).count().get(),
    collection.where("providerStatus", "in", FAILED_REMINDER_STATUSES).count().get(),
  ]);
  const total = all.data().count;
  const completedCount = completed.data().count;
  const failedCount = failed.data().count;
  return {
    all: total,
    completed: completedCount,
    failed: failedCount,
    pending: Math.max(0, total - completedCount - failedCount),
  };
}

async function loadTickets(db, ticketIds) {
  const tickets = new Map();
  for (let start = 0; start < ticketIds.length; start += 100) {
    const refs = ticketIds.slice(start, start + 100).map(id => db.collection("repair_tickets").doc(id));
    if (!refs.length) continue;
    const snapshots = await db.getAll(...refs);
    snapshots.forEach(snapshot => {
      if (snapshot.exists) tickets.set(snapshot.id, snapshot.data());
    });
  }
  return tickets;
}

export const listRepairReminders = onCall(async request => {
  await requirePage(request, "reminders");
  const db = getFirestore();
  const collection = db.collection("repair_whatsapp_notifications");

  if (request.data?.summaryOnly === true) {
    return { summary: await reminderSummary(collection), reminders: [] };
  }

  const snapshot = await collection.get();
  const ticketIds = [...new Set(snapshot.docs.map(doc => text(doc.data().ticketId, 150)).filter(Boolean))];
  const tickets = await loadTickets(db, ticketIds);
  const reminders = snapshot.docs
    .map(doc => projectReminder(doc.id, doc.data(), tickets.get(text(doc.data().ticketId, 150)) || {}))
    .sort((a, b) => Date.parse(b.updatedAt || b.acceptedAt || "") - Date.parse(a.updatedAt || a.acceptedAt || ""));

  const summary = reminders.reduce((counts, reminder) => {
    counts.all += 1;
    counts[reminder.outcome] += 1;
    return counts;
  }, { all: 0, completed: 0, failed: 0, pending: 0 });

  return { summary, reminders };
});
