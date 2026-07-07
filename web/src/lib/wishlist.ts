import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firestore";

function favRef(uid: string) {
  return collection(db, "users", uid, "favorites");
}

/** Get all favorite product IDs for a user. */
export async function getFavorites(uid: string): Promise<Set<string>> {
  const snap = await getDocs(favRef(uid));
  return new Set(snap.docs.map((d) => d.id));
}

/** Toggle a product in/out of favorites. Returns new state. */
export async function toggleFavorite(
  uid: string,
  productId: string,
  currentlyFavorite: boolean
): Promise<boolean> {
  const ref = doc(db, "users", uid, "favorites", productId);
  if (currentlyFavorite) {
    await deleteDoc(ref);
    return false;
  } else {
    await setDoc(ref, { addedAt: serverTimestamp() });
    return true;
  }
}
