"use client";
import Link from "next/link";
import { ArrowRight, Setting2 } from "@/components/admin/WorkspaceIcons";
import AdminHeader from "@/components/admin/AdminHeader";
import { workshopLinks } from "@/components/admin/WorkshopNav";
import { useAdminAccess } from "@/components/admin/AdminGuard";
import { hasPageAccess } from "@/lib/adminAccess";
export default function WorkshopPage() {
 const { adminEntry } = useAdminAccess();
 const links = workshopLinks.filter(item => item.slug && hasPageAccess(adminEntry, item.slug));
 return <div className="mx-auto max-w-7xl p-6 lg:p-10"><AdminHeader title="Workshop" subtitle="The space to keep service moving." />
 <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 sm:p-12"><Setting2 size={48} variant="Bulk" color="#24796d" /><p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#24796d]">Service starts here</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">A little care. A big difference.</h2><p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">Look after your customers, follow up on service requests and prepare quotations. Choose a page below to get started.</p>
 <div className="mt-10 grid gap-x-10 sm:grid-cols-2">{links.map(({ slug, label, icon: Icon }) => <Link key={slug} href={`/workshop/${slug}`} className="group flex items-center gap-4 border-t border-slate-200 py-6 text-sm font-medium transition hover:text-[#24796d]"><Icon size={25} variant="Bulk" color="#24796d" /><span className="flex-1">{label}</span><ArrowRight size={20} className="transition-transform group-hover:translate-x-1" /></Link>)}</div>
 {links.length === 0 && <p className="mt-6 text-sm text-slate-500">Ask your administrator for access to workshop pages.</p>}</section></div>;
}
