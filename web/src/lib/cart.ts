import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "./firestore";

export type CartItem = {
  productId: string;
  name: string;
  category: string;
  priceUsd: number;
  qty: number;
  image?: string;
};

function cartRef(uid: string) {
  return collection(db, "users", uid, "cart");
}

/** Get all cart items for a user. */
export async function getCart(uid: string): Promise<CartItem[]> {
  const snap = await getDocs(cartRef(uid));
  return snap.docs.map((d) => ({ productId: d.id, ...d.data() } as CartItem));
}

/** Add item to cart or increment quantity if already exists. */
export async function addToCart(uid: string, item: CartItem) {
  const ref = doc(db, "users", uid, "cart", item.productId);
  await setDoc(
    ref,
    {
      productId: item.productId,
      name: item.name,
      category: item.category,
      priceUsd: item.priceUsd,
      qty: increment(item.qty),
      image: item.image ?? null,
    },
    { merge: true }
  );
}

/** Update quantity for a cart item. */
export async function updateCartQty(
  uid: string,
  productId: string,
  qty: number
) {
  const ref = doc(db, "users", uid, "cart", productId);
  if (qty <= 0) {
    await deleteDoc(ref);
  } else {
    await updateDoc(ref, { qty });
  }
}

/** Remove item from cart. */
export async function removeFromCart(uid: string, productId: string) {
  await deleteDoc(doc(db, "users", uid, "cart", productId));
}

/** Clear entire cart. */
export async function clearCart(uid: string) {
  const snap = await getDocs(cartRef(uid));
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}
