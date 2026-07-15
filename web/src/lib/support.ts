import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firestore";

export type SupportRole = "user" | "assistant" | "admin";

export type SupportMessage = {
  role: SupportRole;
  text: string;
  at: string; // ISO timestamp
};

export type SupportConversation = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  messages: SupportMessage[];
  status: "open" | "resolved";
  intervened: boolean;
  updatedAt: Date;
};

const COL = "support_conversations";

function toConversation(id: string, data: any): SupportConversation {
  return {
    id,
    userId: data.userId || "",
    userName: data.userName || "",
    userEmail: data.userEmail || "",
    title: data.title || "New chat",
    messages: (data.messages || []) as SupportMessage[],
    status: data.status || "open",
    intervened: data.intervened || false,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
  };
}

// ─── Customer side ───────────────────────────────────────────────────────────

export function newConversationId() {
  return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Creates or updates a conversation (customer or admin). */
export async function upsertConversation(
  convId: string,
  fields: Partial<Omit<SupportConversation, "id" | "updatedAt">>
): Promise<void> {
  const firstUser = fields.messages?.find((m) => m.role === "user")?.text;
  const patch: Record<string, unknown> = { ...fields, updatedAt: serverTimestamp() };
  if (firstUser && !fields.title) patch.title = firstUser.slice(0, 60);
  await setDoc(doc(db, COL, convId), patch, { merge: true });
}

/** Appends a single message to a conversation. */
export async function appendMessage(convId: string, message: SupportMessage): Promise<void> {
  await updateDoc(doc(db, COL, convId), {
    messages: arrayUnion(message),
    updatedAt: serverTimestamp(),
  });
}

/** Real-time listener for a single conversation. */
export function watchConversation(
  convId: string,
  cb: (conv: SupportConversation | null) => void
) {
  return onSnapshot(doc(db, COL, convId), (snap) => {
    cb(snap.exists() ? toConversation(snap.id, snap.data()) : null);
  });
}

/** Lists the current user's own conversations. */
export async function listMyConversations(uid: string): Promise<SupportConversation[]> {
  const snap = await getDocs(collection(db, COL));
  return snap.docs
    .map((d) => toConversation(d.id, d.data()))
    .filter((c) => c.userId === uid)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export async function getConversation(convId: string): Promise<SupportConversation | null> {
  const snap = await getDoc(doc(db, COL, convId));
  return snap.exists() ? toConversation(snap.id, snap.data()) : null;
}

// ─── Admin side ────────────────────────────────────────────────────────────

/** Real-time listener for ALL conversations (admin). */
export function watchAllConversations(cb: (convs: SupportConversation[]) => void) {
  return onSnapshot(collection(db, COL), (snap) => {
    const convs = snap.docs
      .map((d) => toConversation(d.id, d.data()))
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    cb(convs);
  });
}

/** Admin takes over a conversation — the AI stops responding. */
export async function interveneConversation(convId: string): Promise<void> {
  await updateDoc(doc(db, COL, convId), { intervened: true, updatedAt: serverTimestamp() });
}

/** Admin resolves (and hands back / closes) a conversation. */
export async function resolveConversation(convId: string): Promise<void> {
  await updateDoc(doc(db, COL, convId), {
    status: "resolved",
    intervened: false,
    updatedAt: serverTimestamp(),
  });
}

/** Admin sends a message into a conversation. */
export async function sendAdminMessage(convId: string, text: string): Promise<void> {
  await appendMessage(convId, {
    role: "admin",
    text,
    at: new Date().toISOString(),
  });
}
