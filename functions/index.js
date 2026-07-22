import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

initializeApp();
const db = getFirestore();

// AI shopping & customer-service assistant (Gemini-backed callable function).
export { aiAgent } from "./ai-agent.js";

// Public key-authenticated REST API (products, orders, quotations, repairs).
export { api } from "./api.js";

// Admin-only callables to manage API keys.
export {
  createApiKey,
  listApiKeys,
  revokeApiKey,
  deleteApiKey,
} from "./apikeys-admin.js";

/**
 * Triggered when a new notification document is created.
 * If status is "sent", sends push notification to all users via FCM topic.
 */
export const onNotificationCreated = onDocumentCreated(
  "notifications/{notifId}",
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    // Only send if status is "sent"
    if (data.status !== "sent") return;

    await sendPushNotification(data.title, data.message, data.audience, event.params.notifId);
  }
);

/**
 * Runs every minute to check for scheduled notifications that are due.
 */
export const processScheduledNotifications = onSchedule(
  "every 1 minutes",
  async () => {
    const now = new Date();
    const snap = await db
      .collection("notifications")
      .where("status", "==", "scheduled")
      .where("scheduledAt", "<=", now)
      .get();

    if (snap.empty) return;

    const promises = snap.docs.map(async (doc) => {
      const data = doc.data();
      await sendPushNotification(data.title, data.message, data.audience, doc.id);
      await doc.ref.update({
        status: "sent",
        sentAt: FieldValue.serverTimestamp(),
      });
    });

    await Promise.all(promises);
    console.log(`Processed ${snap.size} scheduled notifications`);
  }
);

/**
 * Sends a push notification via FCM.
 * - "All customers" → sends to topic "all"
 * - Specific segment → sends to that topic
 * - Email/uid → sends to individual device token
 */
async function sendPushNotification(title, body, audience, notifId) {
  const messaging = getMessaging();

  try {
    if (audience === "All customers") {
      // Send to "all" topic — mobile app subscribes to this on login
      const result = await messaging.send({
        topic: "all",
        notification: { title, body },
        data: { notifId, type: "promo" },
        android: {
          priority: "high",
          notification: { channelId: "mercury_notifications" },
        },
        apns: {
          payload: { aps: { sound: "default", badge: 1 } },
        },
      });
      console.log(`Sent to topic "all":`, result);
    } else {
      // Try sending to a topic based on audience name (e.g. "Wishlist: Laptops" → topic "wishlist_laptops")
      const topicName = audience
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");

      const result = await messaging.send({
        topic: topicName,
        notification: { title, body },
        data: { notifId, type: "targeted" },
        android: {
          priority: "high",
          notification: { channelId: "mercury_notifications" },
        },
        apns: {
          payload: { aps: { sound: "default", badge: 1 } },
        },
      });
      console.log(`Sent to topic "${topicName}":`, result);
    }

    // Update notification doc with delivery info
    await db.doc(`notifications/${notifId}`).update({
      deliveredAt: FieldValue.serverTimestamp(),
      deliveryStatus: "delivered",
    });
  } catch (error) {
    console.error("FCM send error:", error);
    await db.doc(`notifications/${notifId}`).update({
      deliveryStatus: "failed",
      deliveryError: error.message,
    });
  }
}
