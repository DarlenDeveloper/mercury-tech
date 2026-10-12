import { createHash } from "node:crypto";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { adminHasDashboard } from "./admin-access.js";

const ACTIVE_STATUSES = ["ready_for_assignment", "in_progress", "awaiting_parts"];
const CHANNEL_ID = "mercury_notifications";

export function kampalaDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Kampala",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function technicianReminderCopy(ticket, ticketId) {
  const serviceId = ticket.trackingReference || ticketId;
  if (ticket.status === "ready_for_assignment") {
    return { title: "Repair ready to start", body: `${serviceId} is assigned to you and ready to start.` };
  }
  if (ticket.status === "awaiting_parts") {
    return { title: "Repair awaiting parts", body: `${serviceId} is awaiting parts. Review it and update the team if anything changes.` };
  }
  return { title: "Repair job reminder", body: `${serviceId} is still in progress. Please update or complete the job.` };
}

export function technicianReminderId(date, ticketId, uid) {
  return `repair-reminder-${createHash("sha256").update(`${date}|${ticketId}|${uid}`).digest("hex").slice(0, 32)}`;
}

function isAlreadyExists(error) {
  return error?.code === 6 || error?.code === "already-exists" || String(error?.message || "").toLowerCase().includes("already exists");
}

export async function runTechnicianRepairReminders({
  db = getFirestore(),
  auth = getAuth(),
  messaging = getMessaging(),
  now = new Date(),
} = {}) {
  const [ticketsSnap, configSnap] = await Promise.all([
    db.collection("repair_tickets").where("status", "in", ACTIVE_STATUSES).get(),
    db.doc("config/admins").get(),
  ]);
  const currentTechnicians = new Set((configSnap.data()?.admins || [])
    .filter(entry => entry.jobRole === "Technician" && adminHasDashboard(entry, "workshop"))
    .map(entry => String(entry.email || "").trim().toLowerCase())
    .filter(Boolean));
  const date = kampalaDate(now);
  const accounts = new Map();
  let created = 0;
  let skipped = 0;

  for (const ticketDoc of ticketsSnap.docs) {
    const ticket = ticketDoc.data();
    const emails = [...new Set((ticket.technicianEmails || [])
      .map(value => String(value || "").trim().toLowerCase())
      .filter(email => currentTechnicians.has(email)))];

    for (const email of emails) {
      try {
        let account = accounts.get(email);
        if (account === undefined) {
          const user = await auth.getUserByEmail(email);
          const userSnap = await db.collection("users").doc(user.uid).get();
          account = userSnap.data()?.notificationPrefs?.repairAssignments === false ? null : user;
          accounts.set(email, account);
        }
        if (!account) { skipped += 1; continue; }

        const copy = technicianReminderCopy(ticket, ticketDoc.id);
        const notificationId = technicianReminderId(date, ticketDoc.id, account.uid);
        const notificationRef = db.collection("users").doc(account.uid).collection("notifications").doc(notificationId);
        try {
          await notificationRef.create({
            title: copy.title,
            body: copy.body,
            type: "repair_assignment_reminder",
            data: {
              ticketId: ticketDoc.id,
              serviceId: ticket.trackingReference || ticketDoc.id,
              status: ticket.status,
              href: "/workshop/assignments",
            },
            reminderDate: date,
            read: false,
            createdAt: FieldValue.serverTimestamp(),
          });
        } catch (error) {
          if (isAlreadyExists(error)) { skipped += 1; continue; }
          throw error;
        }

        created += 1;
        try {
          await messaging.send({
            topic: `user_${account.uid}`,
            notification: copy,
            data: {
              type: "repair_assignment_reminder",
              ticketId: ticketDoc.id,
              serviceId: String(ticket.trackingReference || ticketDoc.id),
              status: String(ticket.status),
              href: "/workshop/assignments",
            },
            android: { priority: "high", notification: { channelId: CHANNEL_ID } },
            apns: { payload: { aps: { sound: "default", badge: 1 } } },
          });
        } catch (error) {
          console.error(`Technician reminder push failed for ${email}`, error?.message || error);
        }
      } catch (error) {
        skipped += 1;
        console.error(`Technician reminder failed for ${email}`, error?.message || error);
      }
    }
  }

  console.log(`Technician reminders: ${created} created, ${skipped} skipped for ${date}.`);
  return { created, skipped, date };
}

export const sendTechnicianRepairReminders = onSchedule({
  schedule: "0 8 * * *",
  timeZone: "Africa/Kampala",
  retryCount: 1,
}, () => runTechnicianRepairReminders());
