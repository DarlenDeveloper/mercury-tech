"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import {
  getReviews,
  addReview,
  summarize,
  type Review,
} from "@/lib/reviews";

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-line"
          }
        />
      ))}
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ProductReviews({ productId }: { productId: string }) {
  const { user, loading } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [fetching, setFetching] = useState(true);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getReviews(productId)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setFetching(false));
  }, [productId]);

  const summary = summarize(reviews);
  const alreadyReviewed = user
    ? reviews.some((r) => r.userId === user.uid)
    : false;

  const handleSubmit = async () => {
    if (!user || !text.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const name = user.displayName || user.email?.split("@")[0] || "Anonymous";
      await addReview(productId, user.uid, name, rating, text);
      const fresh = await getReviews(productId);
      setReviews(fresh);
      setText("");
      setRating(5);
    } catch (e) {
      console.error("Review error:", e);
      setError("Could not submit your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Summary */}
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-white p-6 text-center">
        {fetching ? (
          <div className="h-6 w-32 animate-pulse rounded bg-surface-soft" />
        ) : summary.count > 0 ? (
          <>
            <p className="text-3xl font-extrabold text-ink">
              {summary.average.toFixed(1)}
            </p>
            <Stars rating={summary.average} size={18} />
            <p className="text-sm text-muted">
              Based on {summary.count}{" "}
              {summary.count === 1 ? "review" : "reviews"}
            </p>
          </>
        ) : (
          <>
            <Stars rating={0} size={18} />
            <p className="text-sm font-semibold text-ink">No reviews yet</p>
            <p className="text-sm text-muted">
              Be the first to review this product.
            </p>
          </>
        )}
      </div>

      {/* Write a review */}
      {!loading && (
        <div className="mt-6">
          {!user ? (
            <p className="text-center text-sm text-muted">
              <Link
                href="/login"
                className="font-semibold text-mercury hover:underline"
              >
                Sign in
              </Link>{" "}
              to write a review.
            </p>
          ) : alreadyReviewed ? (
            <p className="text-center text-sm text-muted">
              You&apos;ve already reviewed this product.
            </p>
          ) : (
            <div className="rounded-2xl border border-line bg-white p-5">
              <h3 className="text-sm font-bold text-ink">Write a review</h3>
              <div className="mt-3 flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => {
                  const val = i + 1;
                  const active = val <= (hover || rating);
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-label={`${val} star${val > 1 ? "s" : ""}`}
                      onClick={() => setRating(val)}
                      onMouseEnter={() => setHover(val)}
                      onMouseLeave={() => setHover(0)}
                      className="p-0.5"
                    >
                      <Star
                        size={22}
                        className={
                          active
                            ? "fill-amber-400 text-amber-400"
                            : "text-line"
                        }
                      />
                    </button>
                  );
                })}
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="Share your experience with this product..."
                className="mt-3 w-full resize-none rounded-xl border border-line bg-surface-soft px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-mercury focus:bg-white"
              />
              {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
              <button
                onClick={handleSubmit}
                disabled={submitting || !text.trim()}
                className="mt-3 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Review list */}
      {reviews.length > 0 && (
        <div className="mt-6 flex flex-col gap-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-line bg-white p-5"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mercury text-xs font-bold text-white">
                  {initials(r.userName)}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink">{r.userName}</p>
                  {r.createdAt && (
                    <p className="text-xs text-muted">
                      {r.createdAt.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
                <Stars rating={r.rating} />
              </div>
              {r.text && (
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {r.text}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
