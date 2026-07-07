import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { firebaseApp } from "./firebase";

export const auth = getAuth(firebaseApp);

export type { User };

/** Sign in with email + password. */
export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

/** Create account with email + password. */
export async function signUp(
  email: string,
  password: string,
  displayName?: string
) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && cred.user) {
    await updateProfile(cred.user, { displayName });
  }
  return cred;
}

/** Sign out. */
export async function signOut() {
  return fbSignOut(auth);
}

/** Subscribe to auth state. Returns unsubscribe fn. */
export function onAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}
