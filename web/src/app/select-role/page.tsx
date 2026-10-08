"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { Shop, Setting2, ArrowRight, Logout, ShieldTick, Lock } from "@/components/admin/WorkspaceIcons";
import { useAuth } from "@/components/AuthProvider";
import { signOut } from "@/lib/auth";
import { db } from "@/lib/firestore";
import { hasDashboardAccess, resolveAdminEntry, type AdminEntry, type DashboardAccess } from "@/lib/adminAccess";

const roles = [
  { id: "sales" as DashboardAccess, name: "Sales", number: "01", href: "/u", icon: Shop, color: "#3156a6", description: "Turn conversations into lasting relationships.", detail: "Your store, customers and sales. All in one place.", tags: "Orders · Products · Customers · Reports" },
  { id: "workshop" as DashboardAccess, name: "Workshop", number: "02", href: "/workshop", icon: Setting2, color: "#24796d", description: "Great service starts behind the scenes.", detail: "A dedicated space for the people who keep things working.", tags: "Repairs · Customer service · Quotations" },
];

export default function SelectRolePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [entry, setEntry] = useState<AdminEntry | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  useEffect(() => { if (!loading && !user) router.replace("/u/login"); }, [loading, user, router]);
  useEffect(() => {
    if (!user?.email) return;
    let active = true;
    const unsubscribe = onSnapshot(doc(db, "config", "admins"), snapshot => {
        if (!active) return;
        setEntry(resolveAdminEntry(snapshot.data() || {}, user.email || ""));
        setCheckingAccess(false);
      }, () => {
        if (active) {
          setError("We could not load your workspace access. Refresh and try again.");
          setCheckingAccess(false);
        }
      });
    return () => { active = false; unsubscribe(); };
  }, [user?.email]);
  if (loading || !user || checkingAccess) return <div className="flex min-h-screen items-center justify-center bg-[#f8f9fb]" role="status">Loading your workspace…</div>;
  const availableRoles = roles.filter(role => hasDashboardAccess(entry, role.id));
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#f8f9fb] text-[#18243d]">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-64 h-[650px] w-[650px] rounded-full bg-[#dbe5fa]/40 blur-[100px]" />
      <header className="relative flex items-center justify-between gap-4 px-6 py-7 sm:px-12 lg:px-20">
        <Image src="/mercury-logo.png" alt="Mercury" width={160} height={32} className="h-7 w-auto" />
        <button onClick={async () => { try { await signOut(); router.replace("/u/login"); } catch { setError("Could not sign out. Please try again."); } }} className="flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"><Logout size={19} variant="Linear" /> Sign out</button>
      </header>
      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:py-20">
        <div className="mb-12">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#637391]">Mercury workspace</p>
          <h1 className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Where are we working today?</h1>
          <p className="mt-5 text-sm leading-7 text-slate-500 sm:text-base">Welcome back{user.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}. Choose a dashboard to get started.</p>
        </div>
        {availableRoles.length ? <div className="grid gap-5 md:grid-cols-2">
          {availableRoles.map(({ name, number, href, icon: Icon, color, description, detail, tags }) => (
            <Link key={name} href={href} className="group relative flex min-h-[325px] flex-col rounded-[24px] border border-[#e0e5ed] bg-white/90 p-8 transition duration-300 hover:-translate-y-1 hover:border-[#aebdd7] hover:shadow-[0_18px_50px_-25px_rgba(30,50,90,0.25)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 motion-reduce:transform-none sm:p-9">
              <div className="mb-8 flex items-center justify-between"><Icon size={43} variant="Bulk" color={color} aria-hidden="true" /><span className="font-mono text-xs text-slate-400">{number}</span></div>
              <h2 className="text-2xl font-semibold tracking-tight">{name}</h2>
              <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{description}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">{detail}</p>
              <div className="mt-auto pt-8"><p className="text-[11px] text-slate-400">{tags}</p><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5 text-sm font-semibold" style={{ color }}>Enter {name.toLowerCase()}<ArrowRight size={21} className="transition-transform group-hover:translate-x-1 motion-reduce:transform-none" /></div></div>
            </Link>
          ))}
        </div> : (
          <section className="rounded-[24px] border border-[#e0e5ed] bg-white p-10 text-center">
            <Lock size={40} className="mx-auto text-slate-300" />
            <h2 className="mt-5 text-xl font-semibold">No dashboard assigned</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">A super admin has not granted this account access to Sales or Workshop.</p>
            <Link href="/" className="mt-6 inline-flex rounded-xl bg-[#18243d] px-5 py-3 text-sm font-semibold text-white">Back to website</Link>
          </section>
        )}
        <p className="mt-7 flex items-center gap-2 text-xs leading-5 text-slate-400"><ShieldTick size={17} variant="Linear" /> Only dashboards assigned to your account are shown. Page permissions still apply inside each workspace.</p>
        {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
      </main>
      <footer className="relative flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 px-6 py-5 text-[11px] text-slate-400 sm:px-12 lg:px-20"><span>Mercury Computers Limited</span><span>One team. Different expertise.</span></footer>
    </div>
  );
}
