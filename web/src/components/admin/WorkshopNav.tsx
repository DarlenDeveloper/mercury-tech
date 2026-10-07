"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Setting2, People, Headphone, ReceiptText, ArrowSwapHorizontal, Home2, ShieldCheck, Wallet, ClipboardList, Mail } from "@/components/admin/WorkspaceIcons";
import { useAdminAccess } from "./AdminGuard";
import { useAuth } from "@/components/AuthProvider";
import { hasPageAccess } from "@/lib/adminAccess";
import { db } from "@/lib/firestore";
import { fetchCustomerReminderSummary } from "@/lib/reminders";
export const workshopLinks = [
  { slug: "", label: "Overview", icon: Home2 },
  { slug: "assignments", label: "My assignments", icon: ClipboardList },
  { slug: "repairs", label: "Repairs & services", icon: Setting2 },
  { slug: "reminders", label: "Customer reminders", icon: Mail },
  { slug: "customers", label: "Customers", icon: People },
  { slug: "customer-care", label: "Customer service", icon: Headphone },
  { slug: "quotations", label: "Quotations", icon: ReceiptText },
  { slug: "payments", label: "Payments", icon: Wallet },
  { slug: "users", label: "Users & Roles", icon: ShieldCheck },
];
export default function WorkshopNav() {
 const pathname = usePathname();
 const { adminEntry } = useAdminAccess();
 const { user } = useAuth();
 const [badges, setBadges] = useState<Record<string, number>>({});

 useEffect(() => {
  const unsubs: (() => void)[] = [];
  const email = user?.email?.trim().toLowerCase() || "";

  if (hasPageAccess(adminEntry, "repairs") || hasPageAccess(adminEntry, "assignments") || hasPageAccess(adminEntry, "payments")) {
   const unattendedRepairs = query(
    collection(db, "repair_tickets"),
    where("status", "in", ["received", "ready_for_assignment", "awaiting_payment"])
   );
   unsubs.push(onSnapshot(unattendedRepairs, snapshot => {
    let repairs = 0;
    let assignments = 0;
    let payments = 0;
    for (const document of snapshot.docs) {
     const ticket = document.data();
     const technicians = Array.isArray(ticket.technicianEmails)
      ? ticket.technicianEmails.map((value: unknown) => String(value).toLowerCase())
      : [];
     if (ticket.status === "received" || (ticket.status === "ready_for_assignment" && technicians.length === 0)) repairs += 1;
     if (ticket.status === "ready_for_assignment" && email && technicians.includes(email)) assignments += 1;
     if (ticket.status === "awaiting_payment") payments += 1;
    }
    setBadges(previous => ({ ...previous, repairs, assignments, payments }));
   }, () => {}));
  }

  if (hasPageAccess(adminEntry, "quotations")) {
   const pendingQuotes = query(collection(db, "quotations"), where("status", "==", "pending"));
   unsubs.push(onSnapshot(pendingQuotes, snapshot => {
    setBadges(previous => ({ ...previous, quotations: snapshot.size }));
   }, () => {}));
  }

  if (hasPageAccess(adminEntry, "customer-care")) {
   const openSupport = query(collection(db, "support_conversations"), where("status", "==", "open"));
   unsubs.push(onSnapshot(openSupport, snapshot => {
    setBadges(previous => ({ ...previous, "customer-care": snapshot.size }));
   }, () => {}));
  }

  if (hasPageAccess(adminEntry, "reminders")) {
   let active = true;
   const loadReminderBadge = async () => {
    try {
     const summary = await fetchCustomerReminderSummary();
     if (active) setBadges(previous => ({ ...previous, reminders: summary.failed }));
    } catch {
     // Keep the rest of the navigation usable if reminder monitoring is unavailable.
    }
   };
   loadReminderBadge();
   const interval = window.setInterval(loadReminderBadge, 60_000);
   unsubs.push(() => { active = false; window.clearInterval(interval); });
  }

  return () => unsubs.forEach(unsubscribe => unsubscribe());
 }, [adminEntry, user?.email]);

 return <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white p-5 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
   <Link href="/workshop" className="flex items-center gap-3 px-3 py-3"><Image src="/mercury-logo.png" alt="Mercury Computers" width={160} height={32} className="h-auto w-40" priority /></Link>
   <p className="mb-3 mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Workshop workspace</p>
   <nav aria-label="Workshop" className="flex flex-wrap gap-1 lg:flex-col">{workshopLinks.filter(item => !item.slug || hasPageAccess(adminEntry, item.slug)).map(({ slug, label, icon: Icon }) => { const href = `/workshop${slug ? `/${slug}` : ""}`; const active = pathname === href; const badge = badges[slug] || 0; return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${active ? "bg-[#edf5f2] font-semibold text-[#24796d]" : "text-slate-500 hover:bg-slate-50"}`}><Icon size={21} variant="Bulk" /><span className="flex-1">{label}</span>{badge > 0 && <span aria-label={`${badge} unattended`} className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none ${active ? "bg-[#24796d] text-white" : "bg-[#f05a47] text-white"}`}>{badge > 99 ? "99+" : badge}</span>}</Link>; })}</nav>
   <Link href="/select-role" className="mt-5 flex items-center gap-3 px-3 py-3 text-sm text-slate-500 hover:text-slate-900 lg:mt-auto"><ArrowSwapHorizontal size={20} />Switch role</Link>
 </aside>;
}
