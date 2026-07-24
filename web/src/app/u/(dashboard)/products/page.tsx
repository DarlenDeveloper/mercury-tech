"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  X,
  Trash2,
  Pencil,
  Star,
} from "lucide-react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import AdminHeader from "@/components/admin/AdminHeader";
import UsdRateBar from "@/components/admin/UsdRateBar";
import { db } from "@/lib/firestore";
import { logAudit } from "@/lib/auditLog";
import { useAuth } from "@/components/AuthProvider";

type Product = {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  category: string;
  categoryId: string;
  subcategory?: string;
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

type ImageItem = {
  id: string;
  url?: string; // final download URL (set once upload completes)
  preview: string; // object URL (while uploading) or remote URL
  progress: number; // 0–100
  status: "uploading" | "done" | "error";
};

type SubCategory = { name: string; slug: string };

type Category = {
  id: string;
  name: string;
  slug: string;
  children: SubCategory[];
};

function approxUgx(usd: number, rate: number) {
  return `≈ USh ${Math.round(usd * rate).toLocaleString()}`;
}

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [rate, setRate] = useState(3780);
  const [prevRate, setPrevRate] = useState(3780);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodSnap, rateSnap, catSnap] = await Promise.all([
        getDocs(collection(db, "products")),
        getDoc(doc(db, "config", "rate")),
        getDocs(collection(db, "categories")),
      ]);

      setProducts(
        prodSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Product))
      );

      setCategoryList(
        catSnap.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              name: data.name ?? "",
              slug: data.slug ?? d.id,
              children: (data.children ?? []) as SubCategory[],
            } as Category;
          })
          .sort((a, b) => a.name.localeCompare(b.name))
      );

      if (rateSnap.exists()) {
        const r = rateSnap.data()?.usdToUgx ?? 3780;
        setRate(r);
        setPrevRate(r);
      }
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const applyRate = async (value: number) => {
    setPrevRate(rate);
    setRate(value);
    await updateDoc(doc(db, "config", "rate"), {
      usdToUgx: value,
      updatedAt: serverTimestamp(),
    });
    logAudit({
      actor: user?.displayName || user?.email || "Unknown",
      actorId: user?.uid || "",
      action: "rate_updated",
      target: `1 USD = ${value.toLocaleString()} UGX`,
      details: `Changed from ${prevRate} to ${value}`,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const product = products.find((p) => p.id === id);
    await deleteDoc(doc(db, "products", id));
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setActiveMenu(null);
    logAudit({
      actor: user?.displayName || user?.email || "Unknown",
      actorId: user?.uid || "",
      action: "product_deleted",
      target: product?.name || id,
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
    setActiveMenu(null);
  };

  const filtered = products.filter(
    (p) =>
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = ["All", ...new Set(products.map((p) => p.category))];
  const [activeCategory, setActiveCategory] = useState("All");

  const displayed =
    activeCategory === "All"
      ? filtered
      : filtered.filter((p) => p.category === activeCategory);

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="Products"
        subtitle="Manage your catalog, pricing and stock"
        action={
          <button
            onClick={() => { setEditingProduct(null); setShowForm(true); }}
            className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
          >
            <Plus size={16} />
            Add Product
          </button>
        }
      />

      {/* USD Rate */}
      <div className="mt-6">
        <UsdRateBar rate={rate} prevRate={prevRate} onApply={applyRate} />
      </div>

      {/* Summary */}
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="admin-card p-4" style={{ backgroundColor: "#eaf1fc" }}>
          <p className="text-[12px] text-muted">Total Products</p>
          <p className="text-xl font-extrabold text-ink">{products.length}</p>
        </div>
        <div className="admin-card p-4" style={{ backgroundColor: "#eef7ee" }}>
          <p className="text-[12px] text-muted">In Stock</p>
          <p className="text-xl font-extrabold text-ink">
            {products.filter((p) => (p.stock ?? 0) > 0).length}
          </p>
        </div>
        <div className="admin-card p-4" style={{ backgroundColor: "#fef3e2" }}>
          <p className="text-[12px] text-muted">New Items</p>
          <p className="text-xl font-extrabold text-ink">
            {products.filter((p) => p.isNew).length}
          </p>
        </div>
        <div className="admin-card p-4" style={{ backgroundColor: "#f3e8ff" }}>
          <p className="text-[12px] text-muted">Categories</p>
          <p className="text-xl font-extrabold text-ink">
            {new Set(products.map((p) => p.category)).size}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex h-10 flex-1 items-center gap-2 rounded-full bg-white px-4">
          <Search size={16} className="text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          />
        </div>
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition ${
                activeCategory === c
                  ? "bg-ink text-white"
                  : "bg-white text-muted hover:text-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <section className="admin-card mt-5 p-5">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-mercury" />
          </div>
        ) : displayed.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted">No products found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-[12px] font-medium text-muted">
                  <th className="pb-3 pl-1 font-medium">Product</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Price (USD)</th>
                  <th className="pb-3 font-medium">Stock</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((p) => (
                  <tr key={p.id} className="border-b border-line/70 text-sm last:border-0">
                    <td className="py-3 pl-1">
                      <div>
                        <p className="font-medium text-ink">{p.name}</p>
                        <p className="text-[11px] text-muted truncate max-w-[240px]">
                          {p.shortDescription || p.description}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 text-muted">{p.category}</td>
                    <td className="py-3">
                      <span className="font-semibold text-ink">
                        ${p.priceUsd}
                      </span>
                      <span className="block text-[11px] text-muted">
                        {approxUgx(p.priceUsd, rate)}
                      </span>
                    </td>
                    <td className="py-3 text-ink">{p.stock ?? "—"}</td>
                    <td className="py-3">
                      {(p.stock ?? 0) > 0 ? (
                        <span className="rounded-full bg-[#e7f6ee] px-2.5 py-1 text-[11px] font-semibold text-[#16a34a]">
                          In Stock
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#fde8ea] px-2.5 py-1 text-[11px] font-semibold text-[#e11d48]">
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="relative py-3 text-right">
                      <button
                        onClick={() => setActiveMenu(activeMenu === p.id ? null : p.id)}
                        className="rounded-lg p-1.5 text-muted transition hover:bg-surface-soft hover:text-ink"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      {activeMenu === p.id && (
                        <div className="absolute right-0 top-10 z-20 w-36 rounded-xl border border-line bg-white p-1.5 shadow-lg">
                          <button
                            onClick={() => handleEdit(p)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink hover:bg-surface-soft"
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Add/Edit Product Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          user={user}
          categoryList={categoryList}
          onClose={() => { setShowForm(false); setEditingProduct(null); }}
          onSaved={() => { setShowForm(false); setEditingProduct(null); fetchData(); }}
        />
      )}
    </div>
  );
}

function ProductForm({
  product,
  user,
  categoryList,
  onClose,
  onSaved,
}: {
  product: Product | null;
  user: any;
  categoryList: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = product !== null;
  const [step, setStep] = useState(1);

  // Step 1: Basic info
  const [name, setName] = useState(product?.name ?? "");
  const [shortDescription, setShortDescription] = useState(product?.shortDescription ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const slugify = (val: string) =>
    val.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/(^-|-$)/g, "");

  // Resolve the product's existing parent category (matched by stored categoryId slug)
  // and subcategory (matched by the slugified category label) so edits pre-select correctly.
  const initialParent =
    categoryList.find((c) => c.slug === product?.categoryId) ??
    categoryList.find((c) => c.name === product?.category);
  const initialSub =
    initialParent?.children.find(
      (s) => s.name === (product?.subcategory ?? product?.category)
    ) ?? null;

  const [parentCatId, setParentCatId] = useState<string>(initialParent?.id ?? "");
  const [subSlug, setSubSlug] = useState<string>(initialSub?.slug ?? "");

  const selectedParent = categoryList.find((c) => c.id === parentCatId) ?? null;
  const subOptions = selectedParent?.children ?? [];

  // Step 2: Pricing & stock
  const [priceUsd, setPriceUsd] = useState(product?.priceUsd?.toString() ?? "");
  const [oldPriceUsd, setOldPriceUsd] = useState(product?.oldPriceUsd?.toString() ?? "");
  const [stock, setStock] = useState(product?.stock?.toString() ?? "");
  const [isNew, setIsNew] = useState(product?.isNew ?? false);
  const [status, setStatus] = useState((product as any)?.status ?? "published");

  // Step 3: Media & details — supports multiple images with live upload progress
  const [images, setImages] = useState<ImageItem[]>(() => {
    const existing =
      product?.images && product.images.length > 0
        ? product.images
        : product?.image
        ? [product.image]
        : [];
    return existing.map((url, i) => ({
      id: `existing-${i}`,
      url,
      preview: url,
      progress: 100,
      status: "done" as const,
    }));
  });
  // Stable folder id for this upload session (download URLs work regardless of path).
  const [uploadId] = useState(
    () => product?.id ?? `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );
  const [description, setDescription] = useState(product?.description ?? "");

  const anyUploading = images.some((i) => i.status === "uploading");

  // Step 4: Specifications
  const [specs, setSpecs] = useState(
    product?.specifications
      ? Object.entries(product.specifications).map(([k, v]) => ({ key: k, value: v }))
      : [{ key: "", value: "" }]
  );

  const [busy, setBusy] = useState(false);

  const addSpec = () => setSpecs([...specs, { key: "", value: "" }]);
  const removeSpec = (i: number) => setSpecs(specs.filter((_, idx) => idx !== i));
  const updateSpec = (i: number, field: "key" | "value", v: string) => {
    const copy = [...specs];
    copy[i][field] = v;
    setSpecs(copy);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // reset so the same file can be re-selected later
    if (files.length === 0) return;

    const { uploadProductImageWithProgress } = await import("@/lib/storage");

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`"${file.name}" is larger than 5MB and was skipped.`);
        continue;
      }
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const preview = URL.createObjectURL(file);
      setImages((prev) => [
        ...prev,
        { id, preview, progress: 0, status: "uploading" },
      ]);

      try {
        const url = await uploadProductImageWithProgress(file, uploadId, (pct) => {
          setImages((prev) =>
            prev.map((it) => (it.id === id ? { ...it, progress: pct } : it))
          );
        });
        setImages((prev) =>
          prev.map((it) =>
            it.id === id ? { ...it, url, progress: 100, status: "done" } : it
          )
        );
      } catch (err) {
        console.error("Image upload failed:", err);
        setImages((prev) =>
          prev.map((it) => (it.id === id ? { ...it, status: "error" } : it))
        );
      }
    }
  };

  const removeImage = (id: string) =>
    setImages((prev) => prev.filter((it) => it.id !== id));

  // Choose the primary image: move it to the front. The first gallery URL is
  // saved as `image` (the storefront thumbnail), so front == primary.
  const makePrimary = (id: string) =>
    setImages((prev) => {
      const idx = prev.findIndex((it) => it.id === id);
      if (idx <= 0) return prev;
      const copy = [...prev];
      const [chosen] = copy.splice(idx, 1);
      copy.unshift(chosen);
      return copy;
    });

  const canNext = () => {
    if (step === 1) return name.trim() && parentCatId;
    if (step === 2) return priceUsd;
    return true;
  };

  const handleSubmit = async () => {
    setBusy(true);

    const productId = isEdit
      ? product!.id
      : name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // All images are uploaded on selection; collect the finished URLs here.
    const galleryUrls = images
      .filter((i) => i.status === "done" && i.url)
      .map((i) => i.url!);

    const specifications: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specifications[s.key.trim()] = s.value.trim();
      }
    });

    const parent = categoryList.find((c) => c.id === parentCatId) ?? null;
    const sub = parent?.children.find((s) => s.slug === subSlug) ?? null;
    // Storefront contract:
    //  - categoryId  = parent category slug  (used by /category/[slug])
    //  - category    = the display label; subcategory name when chosen,
    //                  otherwise the parent name (its slug matches /category/[slug]/[sub])
    const categoryLabel = sub?.name ?? parent?.name ?? "";
    const parentSlug = parent?.slug ?? slugify(categoryLabel);

    const data: any = {
      name: name.trim(),
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      category: categoryLabel,
      categoryId: parentSlug,
      subcategory: sub?.name ?? "",
      brand: brand.trim(),
      priceUsd: parseFloat(priceUsd),
      stock: stock ? parseInt(stock) : 0,
      isNew,
      status,
      specifications,
    };
    if (oldPriceUsd) data.oldPriceUsd = parseFloat(oldPriceUsd);
    data.images = galleryUrls;
    if (galleryUrls.length > 0) data.image = galleryUrls[0];

    try {
      if (isEdit) {
        await updateDoc(doc(db, "products", product!.id), data);
        logAudit({
          actor: user?.displayName || user?.email || "Unknown",
          actorId: user?.uid || "",
          action: "product_updated",
          target: name.trim(),
        });
      } else {
        await setDoc(doc(db, "products", productId), data);
        logAudit({
          actor: user?.displayName || user?.email || "Unknown",
          actorId: user?.uid || "",
          action: "product_created",
          target: name.trim(),
        });
      }
      onSaved();
    } catch (e) {
      console.error("Save product error:", e);
    } finally {
      setBusy(false);
    }
  };

  const steps = [
    { num: 1, label: "Basic Info" },
    { num: 2, label: "Pricing" },
    { num: 3, label: "Media" },
    { num: 4, label: "Specs" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="flex w-full max-w-4xl max-h-[95vh] rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Sidebar stepper */}
        <div className="hidden w-52 shrink-0 bg-[#f8fafb] p-6 sm:block">
          <h3 className="text-lg font-bold text-ink">
            {isEdit ? "Edit Product" : "New Product"}
          </h3>
          <nav className="mt-6 flex flex-col gap-1">
            {steps.map((s) => (
              <button
                key={s.num}
                onClick={() => setStep(s.num)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  step === s.num
                    ? "bg-white text-ink shadow-sm"
                    : "text-muted hover:text-ink"
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    step > s.num
                      ? "bg-[#16a34a] text-white"
                      : step === s.num
                      ? "bg-ink text-white"
                      : "bg-[#E5E7EB] text-muted"
                  }`}
                >
                  {step > s.num ? "✓" : s.num}
                </span>
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col overflow-y-auto p-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center justify-between sm:hidden">
            <h3 className="text-lg font-bold text-ink">
              Step {step}: {steps[step - 1].label}
            </h3>
            <button onClick={onClose} className="text-muted hover:text-ink">
              <X size={20} />
            </button>
          </div>
          <div className="hidden items-center justify-between sm:flex">
            <h3 className="text-lg font-bold text-ink">{steps[step - 1].label}</h3>
            <button onClick={onClose} className="text-muted hover:text-ink">
              <X size={20} />
            </button>
          </div>

          <div className="mt-6 flex-1">
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <Field label="Product Name" value={name} onChange={setName} placeholder="e.g. HP 250 G9 Laptop" />
                <Field label="Short Description" value={shortDescription} onChange={setShortDescription} placeholder="Brief product summary" />
                <Field label="Brand" value={brand} onChange={setBrand} placeholder="e.g. hp, lenovo, dell" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-ink">Category</label>
                    <select
                      value={parentCatId}
                      onChange={(e) => { setParentCatId(e.target.value); setSubSlug(""); }}
                      className="h-11 w-full rounded-full bg-[#F4F5F8] px-4 text-sm text-ink outline-none"
                    >
                      <option value="">Select a category…</option>
                      {categoryList.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {categoryList.length === 0 && (
                      <p className="mt-1.5 text-[11px] text-red-500">
                        No categories found. Add categories under the Categories page first.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-ink">
                      Subcategory <span className="font-normal text-muted">(optional)</span>
                    </label>
                    <select
                      value={subSlug}
                      onChange={(e) => setSubSlug(e.target.value)}
                      disabled={!selectedParent || subOptions.length === 0}
                      className="h-11 w-full rounded-full bg-[#F4F5F8] px-4 text-sm text-ink outline-none disabled:opacity-50"
                    >
                      <option value="">
                        {subOptions.length === 0 ? "No subcategories" : "None"}
                      </option>
                      {subOptions.map((s) => (
                        <option key={s.slug} value={s.slug}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Price (USD)" value={priceUsd} onChange={setPriceUsd} placeholder="350" type="number" />
                  <Field label="Old Price (USD)" value={oldPriceUsd} onChange={setOldPriceUsd} placeholder="Optional" type="number" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Stock Quantity" value={stock} onChange={setStock} placeholder="0" type="number" />
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-ink">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="h-11 w-full rounded-full bg-[#F4F5F8] px-4 text-sm text-ink outline-none"
                    >
                      <option value="published">Published</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-sm cursor-pointer hover:border-mercury w-fit">
                  <input
                    type="checkbox"
                    checked={isNew}
                    onChange={(e) => setIsNew(e.target.checked)}
                    className="rounded"
                  />
                  Mark as New Arrival
                </label>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-4">
                {/* Image upload — multiple images with live progress */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="block text-xs font-semibold text-ink">
                      Product Images
                    </label>
                    <span className="text-[11px] text-muted">
                      {images.filter((i) => i.status === "done").length} added · PNG, JPG up to 5MB
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {images.map((img, idx) => (
                      <div
                        key={img.id}
                        className="group relative aspect-square overflow-hidden rounded-2xl border border-line bg-[#f8fafb]"
                      >
                        <img
                          src={img.preview}
                          alt="Product"
                          className="h-full w-full object-cover"
                        />

                        {/* Uploading overlay with progress */}
                        {img.status === "uploading" && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/55 text-white">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            <span className="text-[11px] font-semibold">
                              Uploading… {img.progress}%
                            </span>
                            <div className="mt-0.5 h-1 w-4/5 overflow-hidden rounded-full bg-white/30">
                              <div
                                className="h-full rounded-full bg-white transition-all"
                                style={{ width: `${img.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Error overlay */}
                        {img.status === "error" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-500/70 px-1 text-center text-[10px] font-semibold text-white">
                            Upload failed
                          </div>
                        )}

                        {/* Primary badge */}
                        {img.status === "done" && idx === 0 && (
                          <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-mercury px-2 py-0.5 text-[9px] font-semibold text-white">
                            <Star size={9} className="fill-white" />
                            Primary
                          </span>
                        )}

                        {/* Set as primary (non-primary done images) */}
                        {img.status === "done" && idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => makePrimary(img.id)}
                            className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[9px] font-semibold text-ink opacity-0 shadow transition hover:bg-white group-hover:opacity-100"
                          >
                            <Star size={9} />
                            Set as primary
                          </button>
                        )}

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => removeImage(img.id)}
                          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow transition hover:bg-white group-hover:opacity-100"
                          aria-label="Remove image"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}

                    {/* Add tile */}
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-line bg-[#f8fafb] text-muted transition hover:border-mercury hover:text-mercury">
                      <Plus size={22} />
                      <span className="text-[11px] font-medium">Add image</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <p className="mt-2 text-[11px] text-muted">
                    The primary image is the storefront thumbnail. Hover any other
                    image and click &quot;Set as primary&quot; to make it the main one.
                  </p>
                </div>

                {/* Overview */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-ink">Detailed Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Full product description, features, marketing copy, key selling points..."
                    rows={5}
                    className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none placeholder:text-muted resize-none focus:border-mercury"
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted">Add key product specifications</p>
                  <button
                    type="button"
                    onClick={addSpec}
                    className="text-sm font-semibold text-mercury hover:text-mercury-dark"
                  >
                    + Add Row
                  </button>
                </div>
                {specs.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={s.key}
                      onChange={(e) => updateSpec(i, "key", e.target.value)}
                      placeholder="e.g. Processor"
                      className="h-10 flex-1 rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-mercury"
                    />
                    <input
                      value={s.value}
                      onChange={(e) => updateSpec(i, "value", e.target.value)}
                      placeholder="e.g. Intel Core i5"
                      className="h-10 flex-1 rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-mercury"
                    />
                    {specs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSpec(i)}
                        className="text-muted hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer nav */}
          <div className="mt-8 flex items-center justify-between border-t border-line pt-5">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
              className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition hover:border-ink"
            >
              {step === 1 ? "Cancel" : "Back"}
            </button>

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canNext()}
                className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-40"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={busy || anyUploading || !name.trim() || !priceUsd}
                className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-40"
              >
                {anyUploading
                  ? "Uploading images…"
                  : busy
                  ? "Saving..."
                  : isEdit
                  ? "Update Product"
                  : "Add Product"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-ink">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-full bg-[#F4F5F8] px-4 text-sm text-ink outline-none placeholder:text-muted"
      />
    </div>
  );
}
