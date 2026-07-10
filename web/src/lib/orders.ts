import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firestore";
import type { CartItem } from "./cart";

export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  totalUsd: number;
  paymentMethod: string;
  deliveryAddress: string;
  status: string;
  createdAt: Date | null;
};

/** Place a new order. */
export async function placeOrder(
  uid: string,
  items: CartItem[],
  totalUsd: number,
  paymentMethod: string,
  deliveryAddress?: string
): Promise<string> {
  const ref = await addDoc(collection(db, "orders"), {
    userId: uid,
    items: items.map((i) => ({
      productId: i.productId,
      name: i.name,
      category: i.category,
      priceUsd: i.priceUsd,
      qty: i.qty,
      image: i.image ?? null,
    })),
    totalUsd,
    paymentMethod,
    deliveryAddress: deliveryAddress?.trim() || "Kampala, Uganda",
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Get all orders for a user, most recent first. */
export async function getUserOrders(uid: string): Promise<Order[]> {
  const q = query(
    collection(db, "orders"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      userId: data.userId,
      items: data.items ?? [],
      totalUsd: data.totalUsd ?? 0,
      paymentMethod: data.paymentMethod ?? "",
      deliveryAddress: data.deliveryAddress ?? "",
      status: data.status ?? "pending",
      createdAt: data.createdAt?.toDate?.() ?? null,
    } as Order;
  });
}
