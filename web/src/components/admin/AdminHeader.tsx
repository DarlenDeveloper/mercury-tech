"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Bell, ChevronDown, X, Package, LayoutGrid, ClipboardList, Users, Settings, Sparkles, Store, LogOut } from "lucide-react";
import { collection, getDocs, query, orderBy, limit, Timestamp } from "firebase/firestore";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firestore";
import { signOut } from "@/lib/auth";

// ─── Search items (pages & quick links) ─────────────────────────────────────

type SearchItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  category: string;
};

const SEARCH_ITEMS: SearchItem[] = [
  { label: "Dashboard", href: "/u", icon: <Sparkles size={16} />, category: "Pages" },
  { label: "Products", href: "/u/products", icon: <Package size={16} />, category: "Pages" },
  { label: "Categories", href: "/u/categories", icon: <LayoutGrid size={16} />, category: "Pages" },
  { label: "Orders", href: "/u/orders", icon: <ClipboardList size={16} />, category: "Pages" },
  { label: "Customers", href: "/u/customers", icon: <Users size={16} />, category: "Pages" },
  { label: "Analytics", href: "/u/analytics", icon: <Sparkles size={16} />, category: "Pages" },
  { label: "Financial Reports", href: "/u/finance", icon: <Sparkles size={16} />, category: "Pages" },
  { label: "User Tracking", href: "/u/user-tracking", icon: <Sparkles size={16} />, category: "Pages" },
  { label: "Users & Roles", href: "/u/users", icon: <Users size={16} />, category: "Pages" },
  { label: "Notifications", href: "/u/notifications", icon: <Bell size={16} />, category: "Pages" },
  { label: "Settings", href: "/u/settings", icon: <Settings size={16} />, category: "Pages" },
  { label: "Audit Logs", href: "/u/audit-logs", icon: <ClipboardList size={16} />, category: "Pages" },
  { label: "API Keys", href: "/u/api-keys", icon: <Sparkles size={16} />, category: "Pages" },
  { label: "Repairs & Services", href: "/u/repairs", icon: <Sparkles size={16} />, category: "Pages" },
  { label: "Website", href: "/u/website", icon: <Sparkles size={16} />, category: "Pages" },
  { label: "Customer Care", href: "/u/customer-care", icon: <Sparkles size={16} />, category: "Pages" },
  { label: "AI", href: "/u/ai", icon: <Sparkles size={16} />, category: "Pages" },
];

// ─── Notification type ───────────────────────────────────────────────────────

type Notification = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  timestamp: Date;
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const displayName = user?.displayName || "Admin";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const [showSearch, setShowSearch] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load notifications
  useEffect(() => {
    const loadNotifs = async () => {
      try {
        const q = query(collection(db, "notifications"), orderBy("timestamp", "desc"), limit(10));
        const snap = await getDocs(q);
        setNotifications(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              title: data.title || "",
              body: data.body || "",
              read: data.read ?? false,
              timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(),
            };
          })
        );
      } catch {
        // silent fail
      }
    };
    loadNotifs();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Search filtering
  const filtered = searchQuery.trim()
    ? SEARCH_ITEMS.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : SEARCH_ITEMS;

  const handleSearchSelect = (href: string) => {
    setShowSearch(false);
    setSearchQuery("");
    router.push(href);
  };

  // Keyboard shortcut (Cmd+K)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === "Escape") {
        setShowSearch(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">
            {title}
          </h1>
          <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          {action}

          {/* Search button */}
          <button
            type="button"
            aria-label="Search"
            onClick={() => setShowSearch(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-muted shadow-sm transition hover:text-ink"
          >
            <Search size={18} />
          </button>

          {/* Notifications button */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-muted shadow-sm transition hover:text-ink"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-mercury-accent ring-2 ring-white" />
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifs && (
              <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-line bg-white p-0 shadow-xl">
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <h3 className="text-sm font-bold text-ink">Notifications</h3>
                  <span className="text-[11px] text-muted">{unreadCount} unread</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-muted">
                      No notifications yet
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`border-b border-line/50 px-4 py-3 last:border-0 ${
                          !n.read ? "bg-blue-50/40" : ""
                        }`}
                      >
                        <p className="text-[13px] font-medium text-ink">{n.title}</p>
                        <p className="mt-0.5 text-[12px] text-muted line-clamp-2">{n.body}</p>
                        <p className="mt-1 text-[11px] text-muted">
                          {formatNotifTime(n.timestamp)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t border-line px-4 py-2.5">
                  <button
                    onClick={() => { setShowNotifs(false); router.push("/u/notifications"); }}
                    className="w-full text-center text-[12px] font-semibold text-mercury hover:text-mercury-dark"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <span className="mx-1 hidden h-6 w-px bg-line sm:block" />

          {/* Profile menu */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setShowProfile((s) => !s)}
              className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition hover:bg-surface-soft"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mercury text-sm font-bold text-white">
                {initials}
              </span>
              <span className="hidden text-sm font-semibold text-ink sm:block">
                {displayName}
              </span>
              <ChevronDown
                size={16}
                className={`text-muted transition-transform ${showProfile ? "rotate-180" : ""}`}
              />
            </button>

            {showProfile && (
              <div className="absolute right-0 top-14 z-50 w-56 rounded-2xl border border-line bg-white p-2 shadow-xl">
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-semibold text-ink">{displayName}</p>
                  {user?.email && (
                    <p className="truncate text-[12px] text-muted">{user.email}</p>
                  )}
                </div>
                <hr className="my-1 border-line" />
                <Link
                  href="/"
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink transition hover:bg-surface-soft"
                >
                  <Store size={16} className="text-muted" />
                  Back to Main Website
                </Link>
                <hr className="my-1 border-line" />
                <button
                  onClick={() => {
                    setShowProfile(false);
                    signOut();
                    router.push("/u/login");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-500 transition hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/40 backdrop-blur-sm pt-[15vh]">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-line px-5 py-4">
              <Search size={18} className="text-muted" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pages, actions..."
                className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
              />
              <kbd className="hidden rounded-md border border-line bg-surface-soft px-1.5 py-0.5 text-[10px] font-medium text-muted sm:inline">
                ESC
              </kbd>
              <button onClick={() => setShowSearch(false)} className="text-muted hover:text-ink">
                <X size={18} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-72 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted">
                  No results found
                </p>
              ) : (
                filtered.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleSearchSelect(item.href)}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm transition hover:bg-surface-soft"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-soft text-muted">
                      {item.icon}
                    </span>
                    <div>
                      <p className="font-medium text-ink">{item.label}</p>
                      <p className="text-[11px] text-muted">{item.category}</p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="border-t border-line px-5 py-2.5 text-[11px] text-muted">
              <span className="font-medium">Tip:</span> Use <kbd className="rounded border border-line bg-surface-soft px-1 text-[10px]">⌘K</kbd> to open search anytime
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function formatNotifTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString("en-UG", { month: "short", day: "numeric" });
}
