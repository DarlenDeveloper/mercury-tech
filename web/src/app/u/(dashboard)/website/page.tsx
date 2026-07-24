"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  X,
  Save,
  ArrowUp,
  ArrowDown,
  Zap,
} from "lucide-react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import AdminHeader from "@/components/admin/AdminHeader";
import { db } from "@/lib/firestore";
import { logAudit } from "@/lib/auditLog";
import { useAuth } from "@/components/AuthProvider";

type Product = {
  id: string;
  name: string;
  image?: string;
  images?: string[];
  priceUsd?: number;
  categoryId?: string;
  category?: string;
};

type FlashEntry = { id: string; salePriceUsd: number };

const usd = (n?: number) =>
  n == null ? "—" : `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function WebsitePage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [flashTitle, setFlashTitle] = useState("Flash Sale");
  const [flash, setFlash] = useState<FlashEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Add-price dialog state
  const [pending, setPending] = useState<Product | null>(null);
  const [pendingPrice, setPendingPrice] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [prodSnap, cfgSnap] = await Promise.all([
          getDocs(collection(db, "products")),
          getDoc(doc(db, "config", "homepage")),
        ]);
        setProducts(prodSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Product)));
        if (cfgSnap.exists()) {
          const d = cfgSnap.data();
          const entries: FlashEntry[] = Array.isArray(d.flashSale)
            ? d.flashSale
                .map((e: any) => ({ id: String(e?.id ?? ""), salePriceUsd: Number(e?.salePriceUsd) }))
                .filter((e: FlashEntry) => e.id && Number.isFinite(e.salePriceUsd))
            : [];
          setFlash(entries);
          setFlashTitle(d.flashSaleTitle || "Flash Sale");
        }
      } catch (e) {
        console.error("Website config fetch error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const selectedIds = useMemo(() => new Set(flash.map((f) => f.id)), [flash]);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => p.name?.toLowerCase().includes(q))
      .filter((p) => !selectedIds.has(p.id))
      .slice(0, 12);
  }, [search, products, selectedIds]);

  const imgOf = (p?: Product) =>
    p?.image || (p?.images && p.images[0]) || "/placeholder-product.svg";

  // Add flow: open the price dialog prefilled with the current price.
  const openAdd = (p: Product) => {
    setPending(p);
    setPendingPrice(p.priceUsd != null ? String(p.priceUsd) : "");
  };
  const confirmAdd = () => {
    if (!pending) return;
    const price = parseFloat(pendingPrice);
    if (!Number.isFinite(price) || price <= 0) {
      alert("Enter a valid sale price greater than 0.");
      return;
    }
    setFlash((prev) => [...prev, { id: pending.id, salePriceUsd: price }]);
    setPending(null);
    setPendingPrice("");
    setSearch("");
  };

  const remove = (id: string) => setFlash((prev) => prev.filter((f) => f.id !== id));
  const setPrice = (id: string, val: string) =>
    setFlash((prev) => prev.map((f) => (f.id === id ? { ...f, salePriceUsd: parseFloat(val) || 0 } : f)));
  const move = (idx: number, dir: -1 | 1) =>
    setFlash((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });

  const save = async () => {
    // Guard against zero/invalid prices sneaking through.
    const clean = flash.filter((f) => Number.isFinite(f.salePriceUsd) && f.salePriceUsd > 0);
    setSaving(true);
    try {
      await setDoc(
        doc(db, "config", "homepage"),
        {
          flashSale: clean,
          flashSaleTitle: flashTitle.trim() || "Flash Sale",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      logAudit({
        actor: user?.displayName || user?.email || "Unknown",
        actorId: user?.uid || "",
        action: "homepage_updated",
        target: `Flash sale (${clean.length} products)`,
      });
      setSavedAt(Date.now());
    } catch (e) {
      console.error("Save failed:", e);
      alert("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="Website"
        subtitle="Curate what shows on the storefront homepage"
        action={
          <button
            onClick={save}
            disabled={saving || loading}
            className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Saving…" : "Save changes"}
          </button>
        }
      />

      {savedAt && (
        <p className="mt-3 text-[13px] font-medium text-green-600">
          Saved. The homepage updates within a few minutes.
        </p>
      )}

      {/* Flash sale */}
      <div className="mt-6 admin-card p-5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fff0e6] text-mercury">
            <Zap size={16} />
          </span>
          <div>
            <h3 className="text-[15px] font-bold text-ink">Flash Sale</h3>
            <p className="text-[12px] text-muted">
              Pick products and set a sale price for each. The sale price only
              lives here, it never changes the product itself.
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="mt-4 max-w-sm">
          <label className="mb-1.5 block text-xs font-semibold text-ink">Row title</label>
          <input
            value={flashTitle}
            onChange={(e) => setFlashTitle(e.target.value)}
            placeholder="Flash Sale"
            className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-mercury"
          />
        </div>

        {/* Search to add */}
        <div className="mt-5">
          <label className="mb-1.5 block text-xs font-semibold text-ink">Add products</label>
          <div className="flex h-10 items-center gap-2 rounded-full border border-line bg-white px-4">
            <Search size={16} className="text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name…"
              className="h-full flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear">
                <X size={15} className="text-muted" />
              </button>
            )}
          </div>

          {results.length > 0 && (
            <div className="mt-2 grid gap-1.5 rounded-2xl border border-line bg-white p-2">
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => openAdd(p)}
                  className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-surface-soft"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgOf(p)} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">{p.name}</span>
                  <span className="shrink-0 text-xs text-muted">{usd(p.priceUsd)}</span>
                  <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-mercury">
                    <Plus size={14} /> Add
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected list */}
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold text-ink">Selected ({flash.length})</p>
          {flash.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line bg-[#f8fafb] px-4 py-6 text-center text-sm text-muted">
              No products selected yet. Search above to add some.
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {flash.map((f, idx) => {
                const p = byId.get(f.id);
                const original = p?.priceUsd;
                const discount =
                  original && original > 0 && f.salePriceUsd > 0
                    ? Math.round((1 - f.salePriceUsd / original) * 100)
                    : 0;
                return (
                  <li
                    key={f.id}
                    className="flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2"
                  >
                    <span className="w-5 shrink-0 text-center text-xs font-bold text-muted">
                      {idx + 1}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgOf(p)} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink">{p?.name ?? f.id}</p>
                      <p className="text-[11px] text-muted">
                        Was <span className="line-through">{usd(original)}</span>
                        {discount > 0 && (
                          <span className="ml-1.5 font-semibold text-green-600">-{discount}%</span>
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <span className="text-xs text-muted">Sale $</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={f.salePriceUsd || ""}
                        onChange={(e) => setPrice(f.id, e.target.value)}
                        className="w-20 rounded-lg border border-line bg-white px-2 py-1 text-sm text-ink outline-none focus:border-mercury"
                      />
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => move(idx, -1)}
                        disabled={idx === 0}
                        aria-label="Move up"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition hover:bg-surface-soft disabled:opacity-30"
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        onClick={() => move(idx, 1)}
                        disabled={idx === flash.length - 1}
                        aria-label="Move down"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition hover:bg-surface-soft disabled:opacity-30"
                      >
                        <ArrowDown size={15} />
                      </button>
                      <button
                        onClick={() => remove(f.id)}
                        aria-label="Remove"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Category rows note */}
      <div className="mt-5 admin-card p-5">
        <h3 className="text-[15px] font-bold text-ink">Category rows</h3>
        <p className="mt-1 text-[13px] text-muted">
          Below the flash sale, the homepage automatically shows one scrolling row
          for each main department (Laptops, Desktops, Printers &amp; Office,
          Networking &amp; Security, UPS &amp; Power, Software), each with a
          &quot;View all&quot; link. These update automatically from your catalog.
        </p>
      </div>

      {/* Add-price dialog */}
      {pending && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setPending(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgOf(pending)} alt="" className="h-12 w-12 rounded-lg object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{pending.name}</p>
                <p className="text-[12px] text-muted">Current price {usd(pending.priceUsd)}</p>
              </div>
            </div>

            <label className="mt-4 mb-1.5 block text-xs font-semibold text-ink">
              Sale price (USD)
            </label>
            <input
              autoFocus
              type="number"
              min="0"
              step="0.01"
              value={pendingPrice}
              onChange={(e) => setPendingPrice(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmAdd()}
              placeholder="e.g. 899.00"
              className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-mercury"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setPending(null)}
                className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface-soft"
              >
                Cancel
              </button>
              <button
                onClick={confirmAdd}
                className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
              >
                <Plus size={15} />
                Add to flash sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
