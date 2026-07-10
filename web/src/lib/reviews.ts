import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firestore";

export type Review = {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: Date | null;
};

export type ReviewSummary = {
  average: number;
  count: number;
};

function reviewsRef(productId: string) {
  return collection(db, "products", productId, "reviews");
}

/** Fetch all reviews for a product, most recent first. */
export async function getReviews(productId: string): Promise<Review[]> {
  const q = query(reviewsRef(productId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      userId: data.userId,
      userName: data.userName ?? "Anonymous",
      rating: data.rating ?? 0,
      text: data.text ?? "",
      createdAt: data.createdAt?.toDate?.() ?? null,
    } as Review;
  });
}

/** Add a review for a product. Rating is clamped to 1–5. */
export async function addReview(
  productId: string,
  userId: string,
  userName: string,
  rating: number,
  text: string
): Promise<string> {
  const ref = await addDoc(reviewsRef(productId), {
    userId,
    userName,
    rating: Math.min(5, Math.max(1, Math.round(rating))),
    text: text.trim(),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Compute average rating and count from a list of reviews. */
export function summarize(reviews: Review[]): ReviewSummary {
  if (reviews.length === 0) return { average: 0, count: 0 };
  const total = reviews.reduce((s, r) => s + r.rating, 0);
  return {
    average: Math.round((total / reviews.length) * 10) / 10,
    count: reviews.length,
  };
}
