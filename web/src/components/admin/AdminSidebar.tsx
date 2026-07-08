"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ADMIN_AUTH_KEY } from "@/components/admin/AdminGuard";
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
  Globe,
  ShieldCheck,
  Bell,
  ScrollText,
  Settings,
  CircleHelp,
  LogOut,
  type LucideIcon,
} from "lucide-react";

type Item = { label: string; icon: LucideIcon; href: string; badge?: string };
type Group = { title?: string; items: Item[] };

const GROUPS: Group[] = [
  {
    items: [
      { label: "Dashboard", icon: House, href: "/u" },
      { label: "Analytics", icon: ChartNoAxesColumn, href: "/u/analytics" },
    ],
  },
  {
    title: "Store",
    items: [
      { label: "Orders", icon: ClipboardList, href: "/u/orders", badge: "24" },
      { label: "Products", icon: Package, href: "/u/products" },
      { label: "Categories", icon: LayoutGrid, href: "/u/categories" },
      { label: "Customers", icon: Users, href: "/u/customers" },
      { label: "Repairs & Services", icon: Wrench, href: "/u/repairs" },
    ],
  },
  {
    title: "Growth",
    items: [
      { label: "User Tracking", icon: Activity, href: "/u/user-tracking" },
      { label: "Financial Reports", icon: Wallet, href: "/u/finance" },
      { label: "Website", icon: Globe, href: "/u/website" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Users & Roles", icon: ShieldCheck, href: "/u/users" },
      { label: "Notifications", icon: Bell, href: "/u/notifications", badge: "9" },
      { label: "Audit Logs", icon: ScrollText, href: "/u/audit-logs" },
      { label: "Settings", icon: Settings, href: "/u/settings" },
      { label: "Help", icon: CircleHelp, href: "/u/help" },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    const { signOut } = await import("@/lib/auth");
    await signOut();
    window.localStorage.removeItem(ADMIN_AUTH_KEY);
    router.push("/u/login");
  };

  const renderItem = ({ label, icon: Icon, href, badge }: Item) => {
    const isActive =
      href === "/u" ? pathname === "/u" : pathname.startsWith(href);
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
        {badge && (
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
              isActive
                ? "bg-white/20 text-white"
                : "bg-mercury-accent/15 text-mercury-accent"
            }`}
          >
            {badge}
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
        {GROUPS.map((group, i) => (
          <div key={group.title ?? `group-${i}`} className={i === 0 ? "" : "mt-6"}>
            {group.title && (
              <p className="mb-2 px-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted/70">
                {group.title}
              </p>
            )}
            <nav className="flex flex-col gap-1">
              {group.items.map(renderItem)}
            </nav>
          </div>
        ))}
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
