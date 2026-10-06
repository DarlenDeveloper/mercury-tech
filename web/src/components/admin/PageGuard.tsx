"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAdminAccess } from "@/components/admin/AdminGuard";
import { hasPageAccess } from "@/lib/adminAccess";
import { SALES_PAGES, WORKSHOP_PAGES } from "@/lib/workspaces";
export default function PageGuard({ children }: { children: React.ReactNode }) {
 const pathname = usePathname();
 const router = useRouter();
 const { adminEntry } = useAdminAccess();
 const workshop = pathname === "/workshop" || pathname.startsWith("/workshop/");
 const base = workshop ? "/workshop" : "/u";
 const slug = pathname.slice(base.length).split("/").filter(Boolean)[0] || "";
 const workspacePages = workshop ? WORKSHOP_PAGES : SALES_PAGES;
 const allowed = !!adminEntry && (!slug || (workspacePages.includes(slug) && hasPageAccess(adminEntry, slug)));
 useEffect(() => { if (adminEntry && !allowed) router.replace(base); }, [adminEntry, allowed, base, router]);
 if (!allowed) return <div role="status" className="flex h-[60vh] items-center justify-center text-sm text-muted">Checking access…</div>;
 return <>{children}</>;
}
