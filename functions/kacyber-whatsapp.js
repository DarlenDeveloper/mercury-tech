import { createHash } from "node:crypto";
import { defineSecret } from "firebase-functions/params";

export const KACYBER_APP_ID = defineSecret("KACYBER_APP_ID");
export const KACYBER_API_KEY = defineSecret("KACYBER_API_KEY");

const KACYBER_MESSAGES_URL = "https://kacyberpay.com/api/v1/whatsapp/messages";
const TRACKING_URL = "https://www.mercurycomputerslimited.com/repair-status";

const REPAIR_STATUS_COPY = {
  received: { title: "Repair checked in", body: "We have received your device and opened your repair ticket." },
  awaiting_payment: { title: "Repair awaiting payment", body: "Your repair document is ready and payment is pending." },
  ready_for_assignment: { title: "Payment confirmed", body: "We have confirmed full payment and your repair is ready for technician assignment." },
  in_progress: { title: "Repair started", body: "A technician has started working on your device." },
  awaiting_parts: { title: "Repair awaiting parts", body: "Your repair is paused while we arrange the required parts." },
  completed: { title: "Ready for pickup", body: "Your device repair is complete and ready for pickup." },
  collected: { title: "Device picked up", body: "Your device has been picked up. Thank you for choosing Mercury Computers." },
};

export class KacyberWhatsAppError extends Error {
  constructor(message, { status = 0, retryable = false, details = "" } = {}) {
    super(message);
    this.name = "KacyberWhatsAppError";
    this.status = status;
    this.retryable = retryable;
    this.details = details;
  }
}

/** Return an E.164-style MSISDN without a leading plus, as required by KaCyberPay. */
export function normalizeWhatsAppMsisdn(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (/^0\d{9}$/.test(digits)) digits = `256${digits.slice(1)}`;
  if (!/^[1-9]\d{9,14}$/.test(digits)) return null;
  return digits;
}

function ugx(value) {
  return `UGX ${Math.max(0, Number(value) || 0).toLocaleString("en-US")}`;
}

function changedTechnicians(before, after) {
  const previous = new Set(Array.isArray(before?.technicianEmails) ? before.technicianEmails : []);
  const current = Array.isArray(after?.technicianEmails) ? after.technicianEmails : [];
  return current.some(email => !previous.has(email));
}

/** Choose specific customer copy for each repair workflow event. */
export function repairWhatsAppCopy(after, before = null) {
  const statusChanged = before && before.status !== after.status;
  const billingChanged = before && (
    before.billingType !== after.billingType
    || before.billingReference !== after.billingReference
    || before.amountDue !== after.amountDue
  );
  const previousPaid = Number(before?.totalPaid) || 0;
  const currentPaid = Number(after.totalPaid) || 0;
  const paymentAdded = before && currentPaid > previousPaid;
  const assignmentAdded = before && changedTechnicians(before, after);

  if (before && !statusChanged && !billingChanged && !paymentAdded && !assignmentAdded) return null;

  if (statusChanged || !before) {
    if (after.status === "awaiting_payment" && after.billingType) {
      const documentName = after.billingType === "lpo" ? "LPO" : "Quotation";
      const documentLabel = after.billingType === "lpo" ? "LPO" : "quotation";
      const reference = after.billingReference ? ` ${after.billingReference}` : "";
      const amount = after.amountDue ? ` for ${ugx(after.amountDue)}` : "";
      return {
        title: `${documentName} sent`,
        body: `Your ${documentLabel}${reference}${amount} has been sent. Payment is pending.`,
      };
    }
    return REPAIR_STATUS_COPY[after.status] || null;
  }

  if (paymentAdded) {
    const amountReceived = currentPaid - previousPaid;
    const amountDue = Number(after.amountDue) || 0;
    const balance = Math.max(0, amountDue - currentPaid);
    if (amountDue > 0 && balance === 0) return REPAIR_STATUS_COPY.ready_for_assignment;
    return {
      title: "Payment received",
      body: `We have confirmed ${ugx(amountReceived)} for your repair. Remaining balance: ${ugx(balance)}.`,
    };
  }

  if (billingChanged && after.billingType) {
    const documentName = after.billingType === "lpo" ? "LPO" : "Quotation";
    const documentLabel = after.billingType === "lpo" ? "LPO" : "quotation";
    const reference = after.billingReference ? ` ${after.billingReference}` : "";
    const amount = after.amountDue ? ` for ${ugx(after.amountDue)}` : "";
    return {
      title: `${documentName} sent`,
      body: `Your ${documentLabel}${reference}${amount} has been sent. Payment is pending.`,
    };
  }

  if (assignmentAdded) {
    return {
      title: "Technician assigned",
      body: "Your repair has been assigned to our workshop team and is queued for work.",
    };
  }

  return null;
}

/** Keep repair updates within the 1,024-character utility-template wrapper limit. */
export function buildRepairWhatsAppMessage(ticketId, ticket, copy) {
  const reference = ticket.trackingReference || ticketId;
  const firstName = String(ticket.userName || "").trim().split(/\s+/)[0];
  const greeting = firstName ? `Hello ${firstName}, ` : "";
  const device = ticket.device ? ` Device: ${ticket.device}.` : "";
  return `${greeting}${copy.title}. ${copy.body} Repair reference: ${reference}.${device} Track your repair: ${TRACKING_URL}`
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1024);
}

/** Stable across CloudEvent retries, so a retried trigger cannot double-send. */
export function repairWhatsAppIdempotencyKey(eventId, ticketId, status) {
  return createHash("sha256")
    .update(`${eventId}|${ticketId}|${status}`)
    .digest("hex");
}

export async function sendKacyberWhatsApp({ appId, apiKey, to, text, idempotencyKey, fetchImpl = fetch }) {
  if (!appId || !apiKey) {
    throw new KacyberWhatsAppError("KaCyberPay credentials are not configured.", { details: "missing_credentials" });
  }

  let response;
  try {
    response = await fetchImpl(KACYBER_MESSAGES_URL, {
      method: "POST",
      headers: {
        "X-app-id": appId,
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to, type: "text", text, idempotencyKey }),
    });
  } catch (error) {
    throw new KacyberWhatsAppError("Could not reach KaCyberPay.", {
      retryable: true,
      details: String(error?.message || error).slice(0, 500),
    });
  }

  const raw = await response.text();
  let data = {};
  try { data = raw ? JSON.parse(raw) : {}; } catch { data = { raw: raw.slice(0, 500) }; }

  if (!response.ok) {
    const retryable = response.status === 408 || response.status === 429 || response.status >= 500;
    throw new KacyberWhatsAppError(`KaCyberPay rejected the message with HTTP ${response.status}.`, {
      status: response.status,
      retryable,
      details: raw.slice(0, 500),
    });
  }

  return data;
}
