import test from "node:test";
import assert from "node:assert/strict";
import {
  KacyberWhatsAppError,
  buildRepairWhatsAppMessage,
  normalizeWhatsAppMsisdn,
  repairWhatsAppCopy,
  repairWhatsAppIdempotencyKey,
  sendKacyberWhatsApp,
} from "../kacyber-whatsapp.js";

test("normalizes local and international WhatsApp numbers", () => {
  assert.equal(normalizeWhatsAppMsisdn("0785 157 237"), "256785157237");
  assert.equal(normalizeWhatsAppMsisdn("+256 785 157 237"), "256785157237");
  assert.equal(normalizeWhatsAppMsisdn("00256 785 157 237"), "256785157237");
  assert.equal(normalizeWhatsAppMsisdn("785157"), null);
});

test("builds a single-line repair update within the utility-template limit", () => {
  const message = buildRepairWhatsAppMessage("ticket-1", {
    userName: "Albert Ocen",
    trackingReference: "REP-1042",
    device: "Lenovo ThinkPad L470",
  }, {
    title: "Repair in progress",
    body: "Our technicians have started working on your device.",
  });

  assert.match(message, /^Hello Albert, Repair in progress\./);
  assert.match(message, /Repair reference: REP-1042\./);
  assert.match(message, /mercurycomputerslimited\.com\/repair-status$/);
  assert.equal(message.includes("\n"), false);
  assert.ok(message.length <= 1024);
});

test("creates a stable idempotency key for trigger retries", () => {
  const first = repairWhatsAppIdempotencyKey("event-1", "ticket-1", "completed");
  const second = repairWhatsAppIdempotencyKey("event-1", "ticket-1", "completed");
  assert.equal(first, second);
  assert.equal(first.length, 64);
  assert.notEqual(first, repairWhatsAppIdempotencyKey("event-2", "ticket-1", "completed"));
});

test("uses specific text updates for LPOs, payments, assignments and pickup", () => {
  assert.deepEqual(
    repairWhatsAppCopy(
      { status: "awaiting_payment", billingType: "lpo", billingReference: "LPO-104", amountDue: 250000, totalPaid: 0 },
      { status: "received", totalPaid: 0 },
    ),
    { title: "LPO sent", body: "Your LPO LPO-104 for UGX 250,000 has been sent. Payment is pending." },
  );

  assert.deepEqual(
    repairWhatsAppCopy(
      { status: "awaiting_payment", amountDue: 250000, totalPaid: 100000 },
      { status: "awaiting_payment", amountDue: 250000, totalPaid: 0 },
    ),
    { title: "Payment received", body: "We have confirmed UGX 100,000 for your repair. Remaining balance: UGX 150,000." },
  );

  assert.equal(
    repairWhatsAppCopy(
      { status: "ready_for_assignment", amountDue: 250000, totalPaid: 250000 },
      { status: "awaiting_payment", amountDue: 250000, totalPaid: 100000 },
    ).title,
    "Payment confirmed",
  );

  assert.equal(
    repairWhatsAppCopy(
      { status: "ready_for_assignment", technicianEmails: ["tech@mercury.test"] },
      { status: "ready_for_assignment", technicianEmails: [] },
    ).title,
    "Technician assigned",
  );

  assert.equal(
    repairWhatsAppCopy({ status: "collected" }, { status: "completed" }).title,
    "Device picked up",
  );
});

test("sends the documented KaCyberPay text payload and credentials", async () => {
  let captured;
  const result = await sendKacyberWhatsApp({
    appId: "app-id",
    apiKey: "api-key",
    to: "256785157237",
    text: "Repair received.",
    idempotencyKey: "stable-key",
    fetchImpl: async (url, options) => {
      captured = { url, options };
      return {
        ok: true,
        status: 201,
        text: async () => JSON.stringify({ messageId: "message-1", status: "accepted", fee: 25, currency: "UGX" }),
      };
    },
  });

  assert.equal(captured.url, "https://kacyberpay.com/api/v1/whatsapp/messages");
  assert.equal(captured.options.headers["X-app-id"], "app-id");
  assert.equal(captured.options.headers["X-API-Key"], "api-key");
  assert.deepEqual(JSON.parse(captured.options.body), {
    to: "256785157237",
    type: "text",
    text: "Repair received.",
    idempotencyKey: "stable-key",
  });
  assert.equal(result.status, "accepted");
});

test("marks server errors retryable and balance errors permanent", async () => {
  for (const [status, retryable] of [[500, true], [402, false]]) {
    await assert.rejects(
      sendKacyberWhatsApp({
        appId: "app-id",
        apiKey: "api-key",
        to: "256785157237",
        text: "Repair update.",
        idempotencyKey: "stable-key",
        fetchImpl: async () => ({ ok: false, status, text: async () => "provider error" }),
      }),
      error => error instanceof KacyberWhatsAppError && error.status === status && error.retryable === retryable,
    );
  }
});
