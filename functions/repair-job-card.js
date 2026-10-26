import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { adminHasDashboard, adminHasPage } from "./admin-access.js";
import { renderJobCard } from "./job-card.js";

function text(value, max = 300) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }

async function requireRepairAccess(request, db) {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in first.");
  const email = text(request.auth.token.email).toLowerCase();
  const config = (await db.doc("config/admins").get()).data() || {};
  const admin = (config.admins || []).find(entry => entry.email?.toLowerCase() === email);
  const legacy = !admin && (config.emails || []).some(value => value.toLowerCase() === email);
  if (!legacy && (!admin || !adminHasDashboard(admin, "workshop") || !adminHasPage(admin, "repairs"))) {
    throw new HttpsError("permission-denied", "You need Workshop repairs access.");
  }
  return email;
}

function kampalaYear(date = new Date()) {
  return new Intl.DateTimeFormat("en", { timeZone: "Africa/Kampala", year: "numeric" }).format(date);
}

export async function prepareRepairJobCard(request, db, bucket) {
  const actorEmail = await requireRepairAccess(request, db);
  const id = text(request.data?.id, 150);
  if (!id || id.includes("/")) throw new HttpsError("invalid-argument", "A repair reference is required.");
  const ticketRef = db.collection("repair_tickets").doc(id);
  const year = kampalaYear();
  const counterRef = db.doc(`counters/repair_job_cards_${year}`);
  const prepared = await db.runTransaction(async tx => {
    const [ticketSnap, counterSnap] = await Promise.all([tx.get(ticketRef), tx.get(counterRef)]);
    if (!ticketSnap.exists) throw new HttpsError("not-found", "Repair not found.");
    const ticket = ticketSnap.data();
    if (!["request_submitted", "received"].includes(ticket.status) && !ticket.jobCardNumber) {
      throw new HttpsError("failed-precondition", "Only a submitted repair can be picked up.");
    }
    let jobCardNumber = ticket.jobCardNumber || "";
    if (!jobCardNumber) {
      const next = Number(counterSnap.data()?.value || 0) + 1;
      jobCardNumber = `JC-${year}-${String(next).padStart(6, "0")}`;
      tx.set(counterRef, { value: next, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    }
    const intake = {
      serialNumber: text(request.data?.serialNumber, 150),
      specification: text(request.data?.specification, 500),
      intakeRemarks: text(request.data?.intakeRemarks, 1000),
      accessories: request.data?.accessories && typeof request.data.accessories === "object" ? request.data.accessories : {},
      chargeable: typeof request.data?.chargeable === "boolean" ? request.data.chargeable : null,
      warrantyType: text(request.data?.warrantyType, 100),
      amc: typeof request.data?.amc === "boolean" ? request.data.amc : null,
      proofOfPurchase: typeof request.data?.proofOfPurchase === "boolean" ? request.data.proofOfPurchase : null,
    };
    tx.update(ticketRef, { jobCardNumber, jobCardGenerationStatus: "generating", ...intake, updatedAt: FieldValue.serverTimestamp() });
    return { ticket: { ...ticket, ...intake, jobCardNumber }, jobCardNumber };
  });

  const pickedUpAt = Timestamp.now();
  const receivedByName = text(request.auth.token.name, 150) || actorEmail;
  const pdf = await renderJobCard({ ...prepared.ticket, pickedUpAt });
  const path = `repair-job-cards/${id}/${prepared.jobCardNumber}.pdf`;
  await bucket.file(path).save(pdf, { resumable: false, contentType: "application/pdf", metadata: { cacheControl: "private, no-store", metadata: { ticketId: id, jobCardNumber: prepared.jobCardNumber } } });
  return { jobCardNumber: prepared.jobCardNumber, jobCardPath: path, pickedUpAt, receivedByName, pdfBase64: pdf.toString("base64") };
}

export const downloadRepairJobCard = onCall(async request => {
  const db = getFirestore();
  await requireRepairAccess(request, db);
  const id = text(request.data?.id, 150);
  const snap = await db.collection("repair_tickets").doc(id).get();
  if (!snap.exists || !snap.data().jobCardPath) throw new HttpsError("not-found", "This repair does not have a job card yet.");
  const ticket = snap.data();
  const pdf = await renderJobCard(ticket);
  await getStorage().bucket().file(ticket.jobCardPath).save(pdf, {
    resumable: false,
    contentType: "application/pdf",
    metadata: { cacheControl: "private, no-store", metadata: { ticketId: id, jobCardNumber: ticket.jobCardNumber || id } },
  });
  return { fileName: `${ticket.jobCardNumber || id}.pdf`, pdfBase64: pdf.toString("base64") };
});

