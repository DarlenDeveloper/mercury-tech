"use client";

import { useState } from "react";
import { FileText, X, Send } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { requestQuote } from "@/lib/quotations";

export default function RequestQuoteButton({
  productId,
  productName,
  productPrice,
}: {
  productId: string;
  productName: string;
  productPrice: number;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname);
      return;
    }
    setBusy(true);
    try {
      await requestQuote({
        productId,
        productName,
        productPrice,
        userId: user.uid,
        userName: user.displayName || "",
        userEmail: user.email || "",
        userPhone: phone.trim(),
        message: message.trim(),
      });
      setDone(true);
      setTimeout(() => {
        setOpen(false);
        setDone(false);
        setPhone("");
        setMessage("");
      }, 2000);
    } catch (e) {
      console.error("Quote request error:", e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          if (!user) {
            window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname);
            return;
          }
          setOpen(true);
        }}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-line bg-white text-sm font-semibold text-ink transition hover:border-mercury hover:text-mercury"
      >
        <FileText size={17} />
        Request Quote
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            {done ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e7f6ee]">
                  <FileText size={24} className="text-[#16a34a]" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-ink">Quote requested!</h3>
                <p className="mt-1 text-sm text-muted">
                  We'll get back to you with a custom price.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-ink">Request a Quote</h3>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-muted transition hover:text-ink"
                  >
                    <X size={20} />
                  </button>
                </div>

                <p className="mt-1 text-sm text-muted">
                  Get a custom price for <span className="font-medium text-ink">{productName}</span>
                </p>

                <div className="mt-5 flex flex-col gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-ink">
                      Phone number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+256 7XX XXX XXX"
                      className="h-11 w-full rounded-xl border border-line bg-[#FAFBFC] px-4 text-sm text-ink outline-none focus:border-mercury focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-ink">
                      Message (optional)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="e.g. I need 5 units for our office, any bulk discount?"
                      rows={3}
                      className="w-full rounded-xl border border-line bg-[#FAFBFC] px-4 py-3 text-sm text-ink outline-none resize-none focus:border-mercury focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={busy}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50"
                >
                  <Send size={16} />
                  {busy ? "Sending..." : "Submit Quote Request"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
