import { onDocumentUpdated, onDocumentCreated } from "firebase-functions/v2/firestore";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

/**
 * Transactional (per-user) notifications for order, quotation and repair
 * status changes.
 *
 * Delivery model:
 *  - Each device subscribes to the FCM topic `user_<uid>` on login (mobile).
 *  - We also write an in-app feed document at `users/<uid>/notifications/*`
 *    so the notification centre has history even when push is missed.
 *  - The user's `notificationPrefs` map (set in the app's settings screen) is
 *    honoured: if the relevant toggle is explicitly off, we skip entirely.
 *
 * Message copy contains NO emojis by request.
 */

const CHANNEL_ID = "mercury_notifications";

/** Firestore-safe topic for a single user. */
function userTopic(uid) {
  return `user_${uid}`;
}

/**
 * Send a notification to one user: honour prefs, write the in-app feed doc,
 * and push to their topic. `prefKey` maps to the app's notificationPrefs map.
 */
async function notifyUser(uid, { title, body, type, prefKey, data = {} }) {
  if (!uid) return;
  const db = getFirestore();

  // Honour the user's notification preference (default on when unset).
  if (prefKey) {
    try {
      const userSnap = await db.collection("users").doc(uid).get();
      const prefs = userSnap.data()?.notificationPrefs || {};
      if (prefs[prefKey] === false) return; // explicitly disabled
    } catch (e) {
      console.error("notifyUser: prefs read failed", e);
    }
  }

  // 1. In-app feed document (history + notification centre).
  try {
    await db.collection("users").doc(uid).collection("notifications").add({
      title,
      body,
      type: type || "general",
      data,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (e) {
    console.error("notifyUser: feed write failed", e);
  }

  // 2. Push via the user's topic (best-effort).
  try {
    await getMessaging().send({
      topic: userTopic(uid),
      notification: { title, body },
      data: { type: type || "general", ...stringifyData(data) },
      android: { priority: "high", notification: { channelId: CHANNEL_ID } },
      apns: { payload: { aps: { sound: "default", badge: 1 } } },
    });
  } catch (e) {
    // A topic with no subscribers throws; that's fine.
    console.error("notifyUser: push failed", e?.message || e);
  }
}

/** FCM data payload values must all be strings. */
function stringifyData(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    out[k] = v == null ? "" : String(v);
  }
  return out;
}

// ─── Orders ──────────────────────────────────────────────────────────────────

const ORDER_STATUS_COPY = {
  pending: { title: "Order received", body: "We have received your order and it is now pending." },
  processing: { title: "Order update", body: "Your order is now being processed." },
  completed: { title: "Order completed", body: "Your order is complete. Thank you for shopping with Mercury." },
  cancelled: { title: "Order cancelled", body: "Your order has been cancelled. Contact us if this is unexpected." },
};

export const onOrderStatusChanged = onDocumentUpdated("orders/{orderId}", async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (!before || !after) return;
  if (before.status === after.status) return;

  const copy = ORDER_STATUS_COPY[after.status];
  if (!copy) return;

  await notifyUser(after.userId, {
    title: copy.title,
    body: copy.body,
    type: "order",
    prefKey: "orderUpdates",
    data: { orderId: event.params.orderId, status: after.status },
  });
});

// ─── Quotations ────────────────────────────────────────────────────────────

export const onQuotationStatusChanged = onDocumentUpdated("quotations/{quoteId}", async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (!before || !after) return;

  const statusChanged = before.status !== after.status;
  const priceAdded = !before.quotedPrice && after.quotedPrice;
  if (!statusChanged && !priceAdded) return;

  const product = after.productName || "your item";
  let title = "Quotation update";
  let body = `There is an update on your quote request for ${product}.`;

  if (after.status === "quoted" || priceAdded) {
    title = "Quote ready";
    body = after.quotedPrice
      ? `We have sent a price for ${product}. Open the app to view it.`
      : `We have responded to your quote request for ${product}.`;
  } else if (after.status === "approved") {
    title = "Quotation approved";
    body = `Your quotation for ${product} has been approved.`;
  } else if (after.status === "rejected") {
    title = "Quotation update";
    body = `Your quotation request for ${product} was not approved. Contact us for options.`;
  } else if (!statusChanged) {
    return;
  }

  await notifyUser(after.userId, {
    title,
    body,
    type: "quotation",
    prefKey: "quoteReplies",
    data: { quoteId: event.params.quoteId, status: after.status },
  });
});

// ─── Repair tickets ──────────────────────────────────────────────────────────

const REPAIR_STATUS_COPY = {
  received: { title: "Repair received", body: "We have received your device and logged your repair ticket." },
  in_progress: { title: "Repair in progress", body: "Our technicians have started working on your device." },
  awaiting_parts: { title: "Repair on hold", body: "Your repair is awaiting parts. We will resume shortly." },
  completed: { title: "Repair completed", body: "Your device repair is complete and ready for collection." },
};

export const onRepairStatusChanged = onDocumentUpdated("repair_tickets/{ticketId}", async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (!before || !after) return;
  if (before.status === after.status) return;

  const copy = REPAIR_STATUS_COPY[after.status];
  if (!copy) return;

  const device = after.device ? ` (${after.device})` : "";
  await notifyUser(after.userId, {
    title: copy.title,
    body: `${copy.body}${device}`,
    type: "repair",
    prefKey: "repairUpdates",
    data: { ticketId: event.params.ticketId, status: after.status },
  });
});

// ─── Admin alerts: new order / new repair / new quotation ────────────────────
// These publish to the `admins` topic (admin devices subscribe to it) so staff
// are alerted to incoming activity. No in-app customer feed entry is written.

async function notifyAdmins({ title, body, type, data = {} }) {
  try {
    await getMessaging().send({
      topic: "admins",
      notification: { title, body },
      data: { type: type || "admin", ...stringifyData(data) },
      android: { priority: "high", notification: { channelId: CHANNEL_ID } },
      apns: { payload: { aps: { sound: "default", badge: 1 } } },
    });
  } catch (e) {
    console.error("notifyAdmins: push failed", e?.message || e);
  }
}

export const onOrderCreatedNotifyAdmins = onDocumentCreated("orders/{orderId}", async (event) => {
  const data = event.data?.data();
  if (!data) return;
  await notifyAdmins({
    title: "New order",
    body: `A new order has been placed${data.userName ? ` by ${data.userName}` : ""}.`,
    type: "admin_order",
    data: { orderId: event.params.orderId },
  });
});

export const onRepairCreatedNotifyAdmins = onDocumentCreated("repair_tickets/{ticketId}", async (event) => {
  const data = event.data?.data();
  if (!data) return;
  await notifyAdmins({
    title: "New repair ticket",
    body: `A new repair request has come in${data.device ? ` for ${data.device}` : ""}.`,
    type: "admin_repair",
    data: { ticketId: event.params.ticketId },
  });
});

export const onQuotationCreatedNotifyAdmins = onDocumentCreated("quotations/{quoteId}", async (event) => {
  const data = event.data?.data();
  if (!data) return;
  await notifyAdmins({
    title: "New quote request",
    body: `A customer requested a quote${data.productName ? ` for ${data.productName}` : ""}.`,
    type: "admin_quote",
    data: { quoteId: event.params.quoteId },
  });
});
