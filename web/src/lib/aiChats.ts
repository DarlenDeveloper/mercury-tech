import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firestore";

export type ChatMessage = {
  text: string;
  fromUser: boolean;
};

export type ChatThread = {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: Date;
};

export type ChatSummary = {
  id: string;
  title: string;
  updatedAt: Date;
};

function chatsCol(uid: string) {
  return collection(db, "users", uid, "aiConversations");
}

/** Lists a user's conversation threads (most recent first). */
export async function listChats(uid: string): Promise<ChatSummary[]> {
  // Read all docs (no orderBy) so freshly-written docs with a pending
  // serverTimestamp are still included, then sort client-side.
  const snap = await getDocs(chatsCol(uid));
  const items = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title || "New chat",
      updatedAt:
        data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
    };
  });
  return items
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 50);
}

/** Loads a full conversation thread. */
export async function getChat(uid: string, chatId: string): Promise<ChatThread | null> {
  const snap = await getDoc(doc(chatsCol(uid), chatId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    title: data.title || "New chat",
    messages: (data.messages || []) as ChatMessage[],
    updatedAt:
      data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
  };
}

/** Creates or updates a conversation thread. */
export async function saveChat(
  uid: string,
  chatId: string,
  messages: ChatMessage[]
): Promise<void> {
  const firstUserMsg = messages.find((m) => m.fromUser)?.text || "New chat";
  const title = firstUserMsg.slice(0, 60);
  await setDoc(
    doc(chatsCol(uid), chatId),
    {
      title,
      messages,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/** Deletes a conversation thread. */
export async function deleteChat(uid: string, chatId: string): Promise<void> {
  await deleteDoc(doc(chatsCol(uid), chatId));
}

/** Generates a new chat id. */
export function newChatId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
