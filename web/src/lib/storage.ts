import {
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { firebaseApp } from "./firebase";

const storage = getStorage(firebaseApp);

/**
 * Upload a product image to Firebase Storage.
 * Returns the public download URL.
 */
export async function uploadProductImage(
  file: File,
  productId: string
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `products/${productId}/main.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

/**
 * Upload a product image with live progress reporting. Each image is stored
 * under a unique path so multiple gallery images can coexist.
 * `onProgress` is called with an integer percentage (0–100).
 */
export function uploadProductImageWithProgress(
  file: File,
  productId: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const path = `products/${productId}/${unique}.${ext}`;
  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, file);

  return new Promise<string>((resolve, reject) => {
    task.on(
      "state_changed",
      (snap) => {
        const pct = snap.totalBytes
          ? Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
          : 0;
        onProgress?.(pct);
      },
      (err) => reject(err),
      async () => {
        try {
          resolve(await getDownloadURL(task.snapshot.ref));
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

const COLLECTION_PROOF_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Upload immutable collection evidence for a completed repair. */
export async function uploadRepairCollectionProof(
  file: File,
  ticketId: string
): Promise<{ path: string; url: string }> {
  const extension = COLLECTION_PROOF_TYPES[file.type];
  if (!extension) throw new Error("Use a JPG, PNG or WebP image for the job card.");
  if (file.size > 8 * 1024 * 1024) throw new Error("The job-card photo must be 8 MB or smaller.");
  const unique = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  const path = `repair-collection-proofs/${ticketId}/${unique}.${extension}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return { path, url: await getDownloadURL(storageRef) };
}
