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

export type FirestoreSubCategory = {
  name: string;
  slug: string;
};

export type FirestoreCategory = {
  id: string;
  name: string;
  slug: string;
  order: number;
  active: boolean;
  image?: string;
  children: FirestoreSubCategory[];
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

/** Fetch all categories (with children), ordered by `order` field. */
export async function fetchCategories(): Promise<FirestoreCategory[]> {
  const q = query(collection(db, "categories"), orderBy("order"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name ?? "",
      slug: data.slug ?? d.id,
      order: data.order ?? 0,
      active: data.active !== false,
      image: data.image ?? "",
      children: data.children ?? [],
    } as FirestoreCategory;
  });
}

/** Fetch the USD → UGX exchange rate from config/rate. */
export async function fetchRate(): Promise<number> {
  const ref = doc(db, "config", "rate");
  const snap = await getDoc(ref);
  if (!snap.exists()) return 3780;
  return (snap.data()?.usdToUgx as number) ?? 3780;
}

/** A flash-sale entry: a product plus the promo price (USD) set by the admin.
 *  The sale price lives here in config, never mutating the product record. */
export type FlashSaleEntry = { id: string; salePriceUsd: number };

export type HomepageConfig = {
  flashSale: FlashSaleEntry[];
  flashSaleTitle: string;
};

/** Fetch homepage/storefront config (flash sale selection) from config/homepage. */
export async function fetchHomepageConfig(): Promise<HomepageConfig> {
  const ref = doc(db, "config", "homepage");
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : {};
  const flashSale: FlashSaleEntry[] = Array.isArray(data?.flashSale)
    ? (data.flashSale as any[])
        .map((e) => ({ id: String(e?.id ?? ""), salePriceUsd: Number(e?.salePriceUsd) }))
        .filter((e) => e.id && Number.isFinite(e.salePriceUsd) && e.salePriceUsd > 0)
    : [];
  return {
    flashSale,
    flashSaleTitle: (data?.flashSaleTitle as string) || "Flash Sale",
  };
}
