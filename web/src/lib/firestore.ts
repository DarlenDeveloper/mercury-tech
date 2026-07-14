import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  orderBy,
  type DocumentData,
} from "firebase/firestore";
import { firebaseApp } from "./firebase";

export const db = getFirestore(firebaseApp);

// ─── Types ───────────────────────────────────────────────────────────────────

export type FirestoreProduct = {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  category: string;
  categoryId: string;
  brand?: string;
  priceUsd: number;
  oldPriceUsd?: number;
  stock?: number;
  isNew?: boolean;
  image?: string;
  images?: string[];
  specifications?: Record<string, string>;
  sourceUrl?: string;
};

export type FirestoreCategory = {
  id: string;
  name: string;
  order: number;
};

// ─── Queries ─────────────────────────────────────────────────────────────────

/** Fetch all products from Firestore. */
export async function fetchProducts(): Promise<FirestoreProduct[]> {
  const snap = await getDocs(collection(db, "products"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreProduct));
}

/** Fetch a single product by ID. */
export async function fetchProductById(
  id: string
): Promise<FirestoreProduct | null> {
  const ref = doc(db, "products", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as FirestoreProduct;
}

/** Fetch all categories, ordered by `order` field. */
export async function fetchCategories(): Promise<FirestoreCategory[]> {
  const q = query(collection(db, "categories"), orderBy("order"));
  const snap = await getDocs(q);
  return snap.docs.map(
    (d) => ({ id: d.id, ...d.data() } as FirestoreCategory)
  );
}

/** Fetch the USD → UGX exchange rate from config/rate. */
export async function fetchRate(): Promise<number> {
  const ref = doc(db, "config", "rate");
  const snap = await getDoc(ref);
  if (!snap.exists()) return 3780;
  return (snap.data()?.usdToUgx as number) ?? 3780;
}
