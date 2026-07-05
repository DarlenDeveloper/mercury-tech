"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  ChartNoAxesColumn,
  ClipboardList,
  Package,
  LayoutGrid,
  Users,
  Wrench,
  Megaphone,
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
      { label: "Dashboard", icon: House, href: "/admin" },
      { label: "Analytics", icon: ChartNoAxesColumn, href: "/admin/analytics" },
    ],
  },
  {
    title: "Store",
    items: [
      { label: "Orders", icon: ClipboardList, href: "/admin/orders", badge: "24" },
      { label: "Products", icon: Package, href: "/admin/products" },
      { label: "Categories", icon: LayoutGrid, href: "/admin/categories" },
      { label: "Customers", icon: Users, href: "/admin/customers" },
      { label: "Repairs & Services", icon: Wrench, href: "/admin/repairs" },
    ],
  },
  {
    title: "Growth",
    items: [
      { label: "Marketing", icon: Megaphone, href: "/admin/marketing" },
      { label: "Financial Reports", icon: Wallet, href: "/admin/finance" },
      { label: "Website", icon: Globe, href: "/admin/website" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Users & Roles", icon: ShieldCheck, href: "/admin/users" },
      { label: "Notifications", icon: Bell, href: "/admin/notifications", badge: "9" },
      { label: "Audit Logs", icon: ScrollText, href: "/admin/audit-logs" },
      { label: "Settings", icon: Settings, href: "/admin/settings" },
      { label: "Help", icon: CircleHelp, href: "/admin/help" },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const renderItem = ({ label, icon: Icon, href, badge }: Item) => {
    const isActive =
      href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
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
      <Link href="/admin" className="flex items-center gap-2.5 px-2">
        <Image
          src="/mercury-logo.png"
          alt="Mercury"
          width={34}
          height={34}
          className="h-8 w-8 object-contain"
        />
        <span className="text-lg font-extrabold tracking-tight text-ink">
          Mercury
        </span>
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
        className="mt-4 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted transition hover:bg-surface-soft hover:text-ink"
      >
        <LogOut size={18} />
        Log out
      </button>
    </aside>
  );
}
