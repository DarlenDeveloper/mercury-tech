import { createHash } from "node:crypto";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { adminHasDashboard, adminHasPage } from "./admin-access.js";
import { normalizeWhatsAppMsisdn } from "./kacyber-whatsapp.js";

function text(value, max = 320) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
function normalizedEmail(value) { return text(value).toLowerCase(); }
function fail(message) { throw new HttpsError("failed-precondition", message); }

export function normalizeTechnicianPhone(value) {
  return normalizeWhatsAppMsisdn(value) || "";
}

export function technicianIdentityKey(kind, value) {
  return createHash("sha256").update(`${kind}:${value}`).digest("hex");
}

function actorFromConfig(config, email) {
  const admin = (config.admins || []).find(entry => entry.email?.toLowerCase() === email);
  const legacy = !admin && (config.emails || []).some(value => value.toLowerCase() === email);
  return admin || (legacy ? { email, access: "super_admin", dashboards: ["workshop"], pages: ["*"] } : null);
}

async function requireTechnicianManager(request, db) {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in first.");
  const email = normalizedEmail(request.auth.token.email);
  const config = (await db.doc("config/admins").get()).data() || {};
  const actor = actorFromConfig(config, email);
  if (!actor || !adminHasDashboard(actor, "workshop") || (!adminHasPage(actor, "users") && !adminHasPage(actor, "repairs"))) {
    throw new HttpsError("permission-denied", "You need Workshop technician-management access.");
  }
  return { actor, email, config };
}

export async function handleManageTechnician(request, db) {
  const { email: actorEmail } = await requireTechnicianManager(request, db);
  const input = request.data || {};
  const action = input.action;
  if (!['create', 'update', 'deactivate', 'approve_link'].includes(action)) throw new HttpsError("invalid-argument", "Choose a valid technician action.");
  const suppliedId = text(input.id, 150);
  const technicianRef = suppliedId ? db.collection("technicians").doc(suppliedId) : db.collection("technicians").doc();
  const now = FieldValue.serverTimestamp();

  const result = await db.runTransaction(async tx => {
    const existingSnap = await tx.get(technicianRef);
    const existing = existingSnap.exists ? existingSnap.data() : null;
    if (action !== "create" && !existing) throw new HttpsError("not-found", "Technician not found.");

    if (action === "deactivate") {
      tx.update(technicianRef, { active: false, updatedAt: now, updatedBy: actorEmail });
      return { ok: true, id: technicianRef.id };
    }

    if (action === "approve_link") {
      if (!existing.pendingAuthUid) fail("There is no pending account match for this technician.");
      const [userSnap, configSnap] = await Promise.all([
        tx.get(db.collection("users").doc(existing.pendingAuthUid)),
        tx.get(db.doc("config/admins")),
      ]);
      const accountEmail = normalizedEmail(existing.pendingAuthEmail || userSnap.data()?.email);
      if (!accountEmail) fail("The matching account has no email identity.");
      const config = configSnap.data() || {};
      const admins = [...(config.admins || [])];
      const adminIndex = admins.findIndex(entry => normalizedEmail(entry.email) === accountEmail);
      if (adminIndex >= 0) {
        const current = admins[adminIndex];
        admins[adminIndex] = {
          ...current,
          jobRole: "Technician",
          dashboards: [...new Set([...(current.dashboards || []), "workshop"])],
          pages: current.pages?.includes("*") ? ["*"] : [...new Set([...(current.pages || []), "assignments"])],
        };
      } else {
        admins.push({ email: accountEmail, access: "admin", jobRole: "Technician", dashboards: ["workshop"], pages: ["assignments"] });
      }
      tx.update(technicianRef, {
        authUid: existing.pendingAuthUid,
        authEmail: existing.pendingAuthEmail || "",
        pendingAuthUid: FieldValue.delete(),
        pendingAuthEmail: FieldValue.delete(),
        accountLinkStatus: "linked",
        linkedAt: now,
        linkedBy: actorEmail,
        updatedAt: now,
      });
      tx.set(db.doc("config/admins"), { ...config, admins, emails: admins.map(entry => entry.email) });
      return { ok: true, id: technicianRef.id, authUid: existing.pendingAuthUid, authEmail: accountEmail };
    }

    const name = text(input.name, 150);
    const phone = normalizeTechnicianPhone(input.phone);
    const email = normalizedEmail(input.email);
    if (!name) fail("Enter the technician's name.");
    if (!phone) fail("Enter a valid WhatsApp number.");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("Enter a valid email address or leave it blank.");

    const phoneKey = technicianIdentityKey("phone", phone);
    const phoneRef = db.collection("technician_identity_keys").doc(phoneKey);
    const phoneSnap = await tx.get(phoneRef);
    if (phoneSnap.exists && phoneSnap.data().technicianId !== technicianRef.id) fail("A technician with this WhatsApp number already exists.");
    let emailRef = null;
    if (email) {
      emailRef = db.collection("technician_identity_keys").doc(technicianIdentityKey("email", email));
      const emailSnap = await tx.get(emailRef);
      if (emailSnap.exists && emailSnap.data().technicianId !== technicianRef.id) fail("A technician with this email address already exists.");
    }

    if (existing?.normalizedPhone && existing.normalizedPhone !== phone) {
      tx.delete(db.collection("technician_identity_keys").doc(technicianIdentityKey("phone", existing.normalizedPhone)));
    }
    if (existing?.normalizedEmail && existing.normalizedEmail !== email) {
      tx.delete(db.collection("technician_identity_keys").doc(technicianIdentityKey("email", existing.normalizedEmail)));
    }
    tx.set(phoneRef, { technicianId: technicianRef.id, kind: "phone", updatedAt: now });
    if (emailRef) tx.set(emailRef, { technicianId: technicianRef.id, kind: "email", updatedAt: now });

    const data = {
      name,
      phone: text(input.phone, 40),
      normalizedPhone: phone,
      email,
      normalizedEmail: email,
      speciality: text(input.speciality, 120),
      notes: text(input.notes, 1000),
      active: input.active !== false,
      updatedAt: now,
      updatedBy: actorEmail,
      ...(existing ? {} : { authUid: "", accountLinkStatus: "unlinked", createdAt: now, createdBy: actorEmail }),
    };
    existing ? tx.update(technicianRef, data) : tx.create(technicianRef, data);
    return { ok: true, id: technicianRef.id };
  });

  await db.collection("audit_logs").add({
    actor: actorEmail,
    actorId: request.auth.uid,
    action: `technician_${action}`,
    target: `Technician ${result.id}`,
    details: action,
    timestamp: FieldValue.serverTimestamp(),
  });
  if (action === "approve_link" && result.authUid) {
    const assigned = await db.collection("repair_tickets").where("technicianIds", "array-contains", result.id).get();
    const batch = db.batch();
    for (const document of assigned.docs) {
      const ticket = document.data();
      const snapshots = (ticket.technicianSnapshots || []).map(item => item.id === result.id ? { ...item, authUid: result.authUid, email: result.authEmail || item.email || "" } : item);
      const authUids = [...new Set(snapshots.map(item => item.authUid).filter(Boolean))];
      batch.update(document.ref, { technicianSnapshots: snapshots, technicianAuthUids: authUids, updatedAt: FieldValue.serverTimestamp() });
    }
    if (!assigned.empty) await batch.commit();
  }
  return result;
}

export const manageTechnician = onCall(request => handleManageTechnician(request, getFirestore()));

export const listTechnicians = onCall(async request => {
  const db = getFirestore();
  await requireTechnicianManager(request, db);
  const snap = await db.collection("technicians").get();
  return {
    technicians: snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        phone: data.phone || "",
        normalizedPhone: data.normalizedPhone || "",
        email: data.email || "",
        speciality: data.speciality || "",
        notes: data.notes || "",
        active: data.active !== false,
        authUid: data.authUid || "",
        accountLinkStatus: data.accountLinkStatus || "unlinked",
        pendingAuthEmail: data.pendingAuthEmail || "",
      };
    }).sort((a, b) => a.name.localeCompare(b.name)),
  };
});

function candidateIdentities(user = {}) {
  const candidates = [];
  const email = normalizedEmail(user.email);
  if (email) candidates.push(["email", email]);
  const phoneFromEmail = email.endsWith("@mercury.phone") ? email.slice(0, -"@mercury.phone".length) : "";
  const phone = normalizeTechnicianPhone(user.phone || phoneFromEmail);
  if (phone) candidates.push(["phone", phone]);
  return candidates;
}

/** Flag a safe, reviewable link when an existing technician later creates an account. */
export const onUserTechnicianMatch = onDocumentWritten("users/{uid}", async event => {
  const user = event.data?.after.data();
  if (!user) return;
  const db = getFirestore();
  const identities = candidateIdentities(user);
  if (!identities.length) return;
  const keys = await Promise.all(identities.map(async ([kind, value]) => {
    const snap = await db.collection("technician_identity_keys").doc(technicianIdentityKey(kind, value)).get();
    return snap.exists ? snap.data().technicianId : "";
  }));
  const matches = [...new Set(keys.filter(Boolean))];
  if (matches.length !== 1) return;
  const ref = db.collection("technicians").doc(matches[0]);
  await db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) return;
    const technician = snap.data();
    if (technician.authUid === event.params.uid) return;
    tx.update(ref, technician.authUid && technician.authUid !== event.params.uid ? {
      accountLinkStatus: "conflict",
      pendingAuthUid: event.params.uid,
      pendingAuthEmail: normalizedEmail(user.email),
      updatedAt: FieldValue.serverTimestamp(),
    } : {
      accountLinkStatus: "pending",
      pendingAuthUid: event.params.uid,
      pendingAuthEmail: normalizedEmail(user.email),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
});

