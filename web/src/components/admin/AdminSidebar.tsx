"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { ADMIN_AUTH_KEY, useAdminAccess } from "@/components/admin/AdminGuard";
import { hasPageAccess } from "@/lib/adminAccess";
import { logAudit } from "@/lib/auditLog";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firestore";
import {
  House,
  ChartNoAxesColumn,
  ClipboardList,
  Package,
  LayoutGrid,
  Users,
  Wrench,
  Activity,
  Wallet,
  ShieldCheck,
  Bell,
  ScrollText,
  Settings,
  CircleHelp,
  LogOut,
  HeadphonesIcon,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

type Item = { label: string; icon: LucideIcon; href: string; slug: string };
type Group = { title?: string; items: Item[] };

const GROUPS: Group[] = [
  {
    items: [
      { label: "Dashboard", icon: House, href: "/u", slug: "" },
      { label: "Analytics", icon: ChartNoAxesColumn, href: "/u/analytics", slug: "analytics" },
    ],
  },
  {
    title: "Store",
    items: [
      { label: "Orders", icon: ClipboardList, href: "/u/orders", slug: "orders" },
      { label: "Products", icon: Package, href: "/u/products", slug: "products" },
      { label: "Categories", icon: LayoutGrid, href: "/u/categories", slug: "categories" },
      { label: "Customers", icon: Users, href: "/u/customers", slug: "customers" },
      { label: "Repairs & Services", icon: Wrench, href: "/u/repairs", slug: "repairs" },
    ],
  },
  {
    title: "Growth",
    items: [
      { label: "User Tracking", icon: Activity, href: "/u/user-tracking", slug: "user-tracking" },
      { label: "Financial Reports", icon: Wallet, href: "/u/finance", slug: "finance" },
      { label: "Quotations", icon: ScrollText, href: "/u/quotations", slug: "quotations" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Customer Care", icon: HeadphonesIcon, href: "/u/customer-care", slug: "customer-care" },
      { label: "AI", icon: Sparkles, href: "/u/ai", slug: "ai" },
      { label: "Users & Roles", icon: ShieldCheck, href: "/u/users", slug: "users" },
      { label: "Notifications", icon: Bell, href: "/u/notifications", slug: "notifications" },
      { label: "Audit Logs", icon: ScrollText, href: "/u/audit-logs", slug: "audit-logs" },
      { label: "Settings", icon: Settings, href: "/u/settings", slug: "settings" },
      { label: "Help", icon: CircleHelp, href: "/u/help", slug: "help" },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { adminEntry } = useAdminAccess();
  const { user } = useAuth();
  const [badges, setBadges] = useState<Record<string, number>>({});

  // Real-time badge counts
  useEffect(() => {
    const unsubs: (() => void)[] = [];

    // Pending orders
    const ordersQ = query(collection(db, "orders"), where("status", "==", "pending"));
    unsubs.push(onSnapshot(ordersQ, (snap) => {
      setBadges((prev) => ({ ...prev, orders: snap.size }));
    }, () => {}));

    // Pending quotations
    const quotesQ = query(collection(db, "quotations"), where("status", "==", "pending"));
    unsubs.push(onSnapshot(quotesQ, (snap) => {
      setBadges((prev) => ({ ...prev, quotations: snap.size }));
    }, () => {}));

    // Open support conversations
    const supportQ = query(collection(db, "support_conversations"), where("status", "==", "open"));
    unsubs.push(onSnapshot(supportQ, (snap) => {
      setBadges((prev) => ({ ...prev, "customer-care": snap.size }));
    }, () => {}));

    return () => unsubs.forEach((u) => u());
  }, []);

  const logout = async () => {
    logAudit({
      actor: user?.displayName || user?.email || "Unknown",
      actorId: user?.uid || "",
      action: "logout",
      target: "Admin Dashboard",
    });
    const { signOut } = await import("@/lib/auth");
    await signOut();
    window.localStorage.removeItem(ADMIN_AUTH_KEY);
    router.push("/u/login");
  };

  // Filter nav items based on access
  const canAccess = (item: Item) => {
    // Dashboard is always visible
    if (item.slug === "") return true;
    return hasPageAccess(adminEntry, item.slug);
  };

  const renderItem = ({ label, icon: Icon, href, slug }: Item) => {
    const isActive =
      href === "/u" ? pathname === "/u" : pathname.startsWith(href);
    const badge = badges[slug] || 0;
    return (
      <Link
        key={label}
        href={href}
        className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
          isActive
            ? "bg-ink text-white shadow-sm"
            : "text-muted hover:bg-surface-soft hover:text-ink"
        }`}
      >
        <Icon size={18} className="shrink-0" />
        <span className="flex-1">{label}</span>
        {badge > 0 && (
          <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none ${
            isActive ? "bg-white/20 text-white" : "bg-mercury-accent text-white"
          }`}>
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-white px-4 py-6">
      {/* Brand */}
      <Link href="/u" className="flex items-center px-2">
        <Image
          src="/mercury-logo.png"
          alt="Mercury"
          width={140}
          height={26}
          className="h-6 w-auto object-contain"
        />
      </Link>

      {/* Scrollable nav */}
      <div className="no-scrollbar mt-6 flex-1 overflow-y-auto">
        {GROUPS.map((group, i) => {
          const visibleItems = group.items.filter(canAccess);
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.title ?? `group-${i}`} className={i === 0 ? "" : "mt-6"}>
              {group.title && (
                <p className="mb-2 px-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted/70">
                  {group.title}
                </p>
              )}
              <nav className="flex flex-col gap-1">
                {visibleItems.map(renderItem)}
              </nav>
            </div>
          );
        })}
      </div>

      {/* Log out */}
      <button
        type="button"
        onClick={logout}
        className="mt-4 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted transition hover:bg-surface-soft hover:text-ink"
      >
        <LogOut size={18} />
        Log out
      </button>
    </aside>
  );
}
