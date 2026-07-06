import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminGuard from "@/components/admin/AdminGuard";

export const metadata: Metadata = {
  title: "Mercury Admin — Dashboard",
  description: "Mercury Computers store admin dashboard.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen w-full bg-[#f6f7f9] text-ink">
        {/* Sticky full-height sidebar */}
        <div className="sticky top-0 hidden h-screen lg:block">
          <AdminSidebar />
        </div>

        {/* Main content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </AdminGuard>
  );
}
