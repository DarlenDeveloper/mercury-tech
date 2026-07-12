"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  MoreHorizontal,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import AdminHeader from "@/components/admin/AdminHeader";
import { db } from "@/lib/firestore";

type SubCategory = { name: string; slug: string };

type Category = {
  id: string;
  name: string;
  slug: string;
  image: string;
  order: number;
  active: boolean;
  children: SubCategory[];
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "categories"), orderBy("order"));
      const snap = await getDocs(q);
      setCategories(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name ?? "",
            slug: data.slug ?? d.id,
            image: data.image ?? "",
            order: data.order ?? 0,
            active: data.active !== false,
            children: data.children ?? [],
          } as Category;
        })
      );
    } catch (e) {
      console.error("Fetch categories error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? Products in it won't be removed.")) return;
    await deleteDoc(doc(db, "categories", id));
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setActiveMenu(null);
  };

  const handleToggleActive = async (cat: Category) => {
    const updated = !cat.active;
    await updateDoc(doc(db, "categories", cat.id), { active: updated });
    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, active: updated } : c))
    );
    setActiveMenu(null);
  };

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setShowForm(true);
    setActiveMenu(null);
  };

  const filtered = categories.filter(
    (c) =>
      search === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const totalProducts = categories.length; // placeholder count
  const activeCount = categories.filter((c) => c.active).length;

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="Categories"
        subtitle="Organize your storefront taxonomy"
        action={
          <button
            onClick={() => {
              setEditingCategory(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
          >
            <Plus size={16} />
            Add Category
          </button>
        }
      />

      {/* Summary cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="admin-card p-4" style={{ backgroundColor: "#eaf1fc" }}>
          <p className="text-[12px] text-muted">Total Categories</p>
          <p className="text-xl font-extrabold text-ink">{categories.length}</p>
        </div>
        <div className="admin-card p-4" style={{ backgroundColor: "#eef7ee" }}>
          <p className="text-[12px] text-muted">Active</p>
          <p className="text-xl font-extrabold text-ink">{activeCount}</p>
        </div>
        <div className="admin-card p-4" style={{ backgroundColor: "#fef3e2" }}>
          <p className="text-[12px] text-muted">Hidden</p>
          <p className="text-xl font-extrabold text-ink">
            {categories.length - activeCount}
          </p>
        </div>
        <div className="admin-card p-4" style={{ backgroundColor: "#f3e8ff" }}>
          <p className="text-[12px] text-muted">Total Subcategories</p>
          <p className="text-xl font-extrabold text-ink">
            {categories.reduce((sum, c) => sum + (c.children?.length ?? 0), 0)}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mt-5 flex h-10 items-center gap-2 rounded-full bg-white px-4">
        <Search size={16} className="text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="mt-8 flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-mercury" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-8 py-12 text-center text-sm text-muted">
          No categories found.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <div key={c.id} className="admin-card overflow-hidden">
              <div className="relative h-32 w-full bg-surface-soft">
                {c.image ? (
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-3xl text-muted">
                    📁
                  </div>
                )}
                <span
                  className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    c.active
                      ? "bg-white/90 text-[#16a34a]"
                      : "bg-white/90 text-muted"
                  }`}
                >
                  {c.active ? "Active" : "Hidden"}
                </span>
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-[15px] font-bold text-ink">{c.name}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {c.children?.length ?? 0} subcategories · Order: {c.order}
                  </p>
                </div>
                <div className="relative">
                  <button
                    onClick={() =>
                      setActiveMenu(activeMenu === c.id ? null : c.id)
                    }
                    className="rounded-lg p-1.5 text-muted transition hover:bg-surface-soft hover:text-ink"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                  {activeMenu === c.id && (
                    <div className="absolute right-0 top-8 z-20 w-40 rounded-xl border border-line bg-white p-1.5 shadow-lg">
                      <button
                        onClick={() => handleEdit(c)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink hover:bg-surface-soft"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(c)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink hover:bg-surface-soft"
                      >
                        {c.active ? (
                          <>
                            <EyeOff size={14} /> Hide
                          </>
                        ) : (
                          <>
                            <Eye size={14} /> Show
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <CategoryForm
          category={editingCategory}
          nextOrder={categories.length}
          onClose={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
          onSaved={() => {
            setShowForm(false);
            setEditingCategory(null);
            fetchCategories();
          }}
        />
      )}
    </div>
  );
}

// ─── Category Form Modal ────────────────────────────────────────────────────

function CategoryForm({
  category,
  nextOrder,
  onClose,
  onSaved,
}: {
  category: Category | null;
  nextOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = category !== null;

  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [image, setImage] = useState(category?.image ?? "");
  const [order, setOrder] = useState(category?.order?.toString() ?? nextOrder.toString());
  const [active, setActive] = useState(category?.active !== false);
  const [children, setChildren] = useState<SubCategory[]>(
    category?.children ?? [{ name: "", slug: "" }]
  );
  const [busy, setBusy] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(category?.image ?? "");

  const addChild = () => setChildren([...children, { name: "", slug: "" }]);
  const removeChild = (i: number) =>
    setChildren(children.filter((_, idx) => idx !== i));
  const updateChild = (i: number, field: "name" | "slug", v: string) => {
    const copy = [...children];
    copy[i] = { ...copy[i], [field]: v };
    setChildren(copy);
  };

  const autoSlug = (val: string) =>
    val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setBusy(true);

    const catId = isEdit ? category!.id : slug || autoSlug(name);

    let imageUrl = image;
    if (imageFile) {
      try {
        const { uploadProductImage } = await import("@/lib/storage");
        imageUrl = await uploadProductImage(imageFile, `category-${catId}`);
      } catch (e) {
        console.error("Image upload failed:", e);
      }
    }

    const validChildren = children.filter((c) => c.name.trim());
    const data = {
      name: name.trim(),
      slug: slug || autoSlug(name),
      image: imageUrl,
      order: parseInt(order) || 0,
      active,
      children: validChildren.map((c) => ({
        name: c.name.trim(),
        slug: c.slug || autoSlug(c.name),
      })),
      updatedAt: serverTimestamp(),
    };

    try {
      if (isEdit) {
        await updateDoc(doc(db, "categories", category!.id), data);
      } else {
        await setDoc(doc(db, "categories", catId), data);
      }
      onSaved();
    } catch (e) {
      console.error("Save category error:", e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="flex w-full max-w-2xl max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h3 className="text-lg font-bold text-ink">
            {isEdit ? "Edit Category" : "New Category"}
          </h3>
          <button
            onClick={onClose}
            className="text-muted transition hover:text-ink"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex flex-col gap-5">
            {/* Name & slug */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink">
                  Category Name
                </label>
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!isEdit && !slug) setSlug(autoSlug(e.target.value));
                  }}
                  placeholder="e.g. Computers"
                  className="h-11 w-full rounded-full bg-[#F4F5F8] px-4 text-sm text-ink outline-none placeholder:text-muted"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink">
                  Slug
                </label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="auto-generated"
                  className="h-11 w-full rounded-full bg-[#F4F5F8] px-4 text-sm text-ink outline-none placeholder:text-muted"
                />
              </div>
            </div>

            {/* Order & Active */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink">
                  Display Order
                </label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  placeholder="0"
                  className="h-11 w-full rounded-full bg-[#F4F5F8] px-4 text-sm text-ink outline-none placeholder:text-muted"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink">
                  Visibility
                </label>
                <label className="flex h-11 cursor-pointer items-center gap-2 rounded-full bg-[#F4F5F8] px-4 text-sm">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-ink">Active on storefront</span>
                </label>
              </div>
            </div>

            {/* Image */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">
                Cover Image
              </label>
              <div className="flex items-start gap-4">
                <div className="flex h-24 w-36 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-line bg-[#f8fafb]">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="text-center text-muted">
                      <p className="text-2xl">🖼️</p>
                      <p className="mt-1 text-[10px]">No image</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer rounded-full bg-ink px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-black">
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-muted">PNG, JPG up to 5MB</p>
                  {imageFile && (
                    <p className="text-[11px] font-medium text-[#16a34a]">
                      {imageFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Subcategories */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-semibold text-ink">
                  Subcategories
                </label>
                <button
                  type="button"
                  onClick={addChild}
                  className="text-sm font-semibold text-mercury hover:text-mercury-dark"
                >
                  + Add
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {children.map((child, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={child.name}
                      onChange={(e) => {
                        updateChild(i, "name", e.target.value);
                        if (!child.slug)
                          updateChild(i, "slug", autoSlug(e.target.value));
                      }}
                      placeholder="Subcategory name"
                      className="h-10 flex-1 rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-mercury"
                    />
                    <input
                      value={child.slug}
                      onChange={(e) => updateChild(i, "slug", e.target.value)}
                      placeholder="slug"
                      className="h-10 w-36 rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-mercury"
                    />
                    {children.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChild(i)}
                        className="text-muted hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-line px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition hover:border-ink"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={busy || !name.trim()}
            className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-40"
          >
            {busy ? "Saving..." : isEdit ? "Update Category" : "Add Category"}
          </button>
        </div>
      </div>
    </div>
  );
}
