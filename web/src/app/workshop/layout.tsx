import type { Metadata } from "next";
import AdminGuard from "@/components/admin/AdminGuard";
import PageGuard from "@/components/admin/PageGuard";
import WorkshopNav from "@/components/admin/WorkshopNav";
import AuditTracker from "@/components/admin/AuditTracker";
export const metadata: Metadata = { title: "Workshop — Mercury", robots: { index: false, follow: false } };
export default function WorkshopLayout({ children }: { children: React.ReactNode }) {
 return <AdminGuard><AuditTracker /><div className="flex min-h-screen flex-col bg-[#f6f7f9] text-ink lg:flex-row"><WorkshopNav /><main className="min-w-0 flex-1"><PageGuard>{children}</PageGuard></main></div></AdminGuard>;
}
