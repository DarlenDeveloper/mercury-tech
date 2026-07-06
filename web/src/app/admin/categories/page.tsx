import Image from "next/image";
import { Plus, Pencil, MoreHorizontal } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { ADMIN_CATEGORIES } from "@/lib/adminData";

export default function CategoriesPage() {
  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="Categories"
        subtitle="Organize your storefront taxonomy"
        action={
          <button className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black">
            <Plus size={16} />
            Add Category
          </button>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {ADMIN_CATEGORIES.map((c) => (
          <div key={c.name} className="admin-card overflow-hidden">
            <div className="relative h-32 w-full">
              <Image src={c.image} alt={c.name} fill className="object-cover" />
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
                  {c.products} products · {c.subcategories} subcategories
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button className="rounded-lg p-1.5 text-muted transition hover:bg-surface-soft hover:text-ink">
                  <Pencil size={16} />
                </button>
                <button className="rounded-lg p-1.5 text-muted transition hover:bg-surface-soft hover:text-ink">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
