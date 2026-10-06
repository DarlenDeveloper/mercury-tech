"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Setting2, People, Headphone, ReceiptText, ArrowSwapHorizontal, Home2, ShieldCheck, Wallet } from "@/components/admin/WorkspaceIcons";
import { useAdminAccess } from "./AdminGuard";
import { hasPageAccess } from "@/lib/adminAccess";
export const workshopLinks = [
  { slug: "", label: "Overview", icon: Home2 },
  { slug: "repairs", label: "Repairs & services", icon: Setting2 },
  { slug: "customers", label: "Customers", icon: People },
  { slug: "customer-care", label: "Customer service", icon: Headphone },
  { slug: "quotations", label: "Quotations", icon: ReceiptText },
  { slug: "payments", label: "Payments", icon: Wallet },
  { slug: "users", label: "Users & Roles", icon: ShieldCheck },
];
export default function WorkshopNav() {
 const pathname = usePathname();
 const { adminEntry } = useAdminAccess();
 return <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white p-5 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
   <Link href="/workshop" className="flex items-center gap-3 px-3 py-3"><Image src="/mercury-logo.png" alt="Mercury Computers" width={160} height={32} className="h-auto w-40" priority /></Link>
   <p className="mb-3 mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Workshop workspace</p>
   <nav aria-label="Workshop" className="flex flex-wrap gap-1 lg:flex-col">{workshopLinks.filter(item => !item.slug || hasPageAccess(adminEntry, item.slug)).map(({ slug, label, icon: Icon }) => { const href = `/workshop${slug ? `/${slug}` : ""}`; return <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${pathname === href ? "bg-[#edf5f2] font-semibold text-[#24796d]" : "text-slate-500 hover:bg-slate-50"}`}><Icon size={21} variant="Bulk" />{label}</Link>; })}</nav>
   <Link href="/select-role" className="mt-5 flex items-center gap-3 px-3 py-3 text-sm text-slate-500 hover:text-slate-900 lg:mt-auto"><ArrowSwapHorizontal size={20} />Switch role</Link>
 </aside>;
}
