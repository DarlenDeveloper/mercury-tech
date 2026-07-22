import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "./firestore";

export type QuotationStatus = "pending" | "quoted" | "approved" | "rejected";

export type Quotation = {
  id: string;
  productId: string;
  productName: string;
  productPrice: number; // UGX listed price
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  message: string; // optional note from customer
  status: QuotationStatus;
  adminNote: string;
  quotedPrice: number | null; // admin's offered price
  createdAt: Date;
  updatedAt: Date;
};

const COL = "quotations";

/** Customer submits a quote request. */
export async function requestQuote({
  productId,
  productName,
  productPrice,
  userId,
  userName,
  userEmail,
  userPhone,
  message,
}: {
  productId: string;
  productName: string;
  productPrice: number;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  message: string;
}): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    productId,
    productName,
    productPrice,
    userId,
    userName,
    userEmail,
    userPhone,
    message,
    status: "pending",
    adminNote: "",
    quotedPrice: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Admin fetches all quotations. */
export async function fetchQuotations(): Promise<Quotation[]> {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      productId: data.productId || "",
      productName: data.productName || "",
      productPrice: data.productPrice || 0,
      userId: data.userId || "",
      userName: data.userName || "",
      userEmail: data.userEmail || "",
      userPhone: data.userPhone || "",
      message: data.message || "",
      status: data.status || "pending",
      adminNote: data.adminNote || "",
      quotedPrice: data.quotedPrice ?? null,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
    };
  });
}

/** Admin updates a quotation (status, note, quoted price). */
export async function updateQuotation(
  id: string,
  fields: { status?: QuotationStatus; adminNote?: string; quotedPrice?: number | null }
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}

/** Admin permanently deletes a quotation. */
export async function deleteQuotation(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
