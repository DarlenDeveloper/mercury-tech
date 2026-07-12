"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { Search, Plus, ShieldCheck, X, Trash2, Lock } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { db } from "@/lib/firestore";
import { useAdminAccess } from "@/components/admin/AdminGuard";
import {
  isSuperAdmin,
  ALL_PAGES,
  type AdminEntry,
  type AccessLevel,
} from "@/lib/adminAccess";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  createdAt: Date | null;
};

const ROLE_COLORS: Record<string, string> = {
  Admin: "bg-[#eaf1fc] text-mercury",
  Manager: "bg-[#f3e8ff] text-[#7c3aed]",
  Support: "bg-[#eef7ee] text-[#16a34a]",
  Developer: "bg-[#fef3e2] text-[#b45309]",
  Finance: "bg-[#fde8ea] text-[#e11d48]",
};

const ACCESS_COLORS: Record<string, string> = {
  super_admin: "bg-[#fef3e2] text-[#b45309]",
  admin: "bg-[#eaf1fc] text-mercury",
};

const PAGE_LABELS: Record<string, string> = {
  analytics: "Analytics",
  orders: "Orders",
  products: "Products",
  categories: "Categories",
  customers: "Customers",
  repairs: "Repairs & Services",
  "user-tracking": "User Tracking",
  finance: "Financial Reports",
  website: "Website",
  users: "Users & Roles",
  notifications: "Notifications",
  "audit-logs": "Audit Logs",
  settings: "Settings",
  help: "Help",
};

export default function UsersRolesPage() {
  const { adminEntry } = useAdminAccess();
  const isSuper = isSuperAdmin(adminEntry);

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminEntries, setAdminEntries] = useState<AdminEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccess, setEditingAccess] = useState<AdminEntry | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const adminDoc = await getDoc(doc(db, "config", "admins"));
      const data = adminDoc.exists() ? adminDoc.data() : {};
      const entries: AdminEntry[] = data?.admins ?? [];
      const legacyEmails: string[] = data?.emails ?? [];

      // Merge legacy emails that aren't in the new system
      legacyEmails.forEach((email) => {
        if (!entries.find((e) => e.email === email)) {
          entries.push({ email, access: "super_admin", pages: ["*"] });
        }
      });

      setAdminEntries(entries);

      // Get user profiles for these admins
      const usersSnap = await getDocs(collection(db, "users"));
      const allEmails = entries.map((e) => e.email.toLowerCase());
      const adminUsers = usersSnap.docs
        .filter((d) => allEmails.includes((d.data().email ?? "").toLowerCase()))
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name || "Unknown",
            email: data.email || "",
            phone: data.phone || "",
            location: data.location || "",
            role: data.role || "Admin",
            createdAt: data.createdAt?.toDate?.() ?? null,
          };
        });
      setAdmins(adminUsers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const removeAdmin = async (email: string) => {
    if (!confirm(`Remove ${email} from admin access?`)) return;
    const updated = adminEntries.filter(
      (e) => e.email.toLowerCase() !== email.toLowerCase()
    );
    await updateDoc(doc(db, "config", "admins"), {
      admins: updated,
      emails: updated.map((e) => e.email),
    });
    setAdminEntries(updated);
    setAdmins((prev) => prev.filter((a) => a.email.toLowerCase() !== email.toLowerCase()));
  };

  const getEntryForEmail = (email: string) =>
    adminEntries.find((e) => e.email.toLowerCase() === email.toLowerCase());

  const filtered = admins.filter(
    (a) =>
      search === "" ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="Users & Roles"
        subtitle="Manage admin access and permissions"
        action={
          isSuper ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
            >
              <Plus size={16} />
              Add Admin
            </button>
          ) : undefined
        }
      />

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#eaf1fc" }}>
          <p className="text-[12px] text-muted">Total Admins</p>
          <p className="text-xl font-extrabold text-ink">{adminEntries.length}</p>
        </div>
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#eef7ee" }}>
          <p className="text-[12px] text-muted">Super Admins</p>
          <p className="text-xl font-extrabold text-ink">
            {adminEntries.filter((e) => e.access === "super_admin").length}
          </p>
        </div>
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#f3e8ff" }}>
          <p className="text-[12px] text-muted">With Profiles</p>
          <p className="text-xl font-extrabold text-ink">{admins.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mt-5 flex h-10 flex-1 items-center gap-2 rounded-full bg-white px-4">
        <Search size={16} className="text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search admins"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
        />
      </div>

      {/* Admin table */}
      <section className="mt-5 rounded-2xl bg-white p-5">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-mercury" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted">
            No admin users found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-[12px] font-medium text-muted">
                  <th className="pb-3 pl-1 font-medium">User</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Access</th>
                  <th className="pb-3 font-medium">Pages</th>
                  <th className="pb-3 font-medium">Joined</th>
                  {isSuper && <th className="pb-3 font-medium"></th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((admin, i) => {
                  const entry = getEntryForEmail(admin.email);
                  return (
                    <tr
                      key={admin.id}
                      className="border-b border-line/70 text-sm last:border-0"
                    >
                      <td className="py-3 pl-1">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                            style={{
                              backgroundColor:
                                ["#1f3e97", "#0e7490", "#9f1239", "#b45309", "#7c3aed"][i % 5],
                            }}
                          >
                            {admin.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-ink">{admin.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-muted">{admin.email}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${ROLE_COLORS[admin.role] ?? ROLE_COLORS.Admin}`}>
                          {admin.role}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${ACCESS_COLORS[entry?.access ?? "admin"]}`}>
                          {entry?.access === "super_admin" ? "Super Admin" : "Admin"}
                        </span>
                      </td>
                      <td className="py-3 text-xs text-muted">
                        {entry?.pages.includes("*")
                          ? "All pages"
                          : `${entry?.pages.length ?? 0} pages`}
                      </td>
                      <td className="py-3 text-muted text-xs">
                        {admin.createdAt
                          ? admin.createdAt.toLocaleDateString("en-UG", { month: "short", year: "numeric" })
                          : "—"}
                      </td>
                      {isSuper && (
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => entry && setEditingAccess(entry)}
                              className="rounded-lg p-1.5 text-muted transition hover:bg-surface-soft hover:text-ink"
                              title="Edit access"
                            >
                              <Lock size={14} />
                            </button>
                            <button
                              onClick={() => removeAdmin(admin.email)}
                              className="rounded-lg p-1.5 text-muted transition hover:bg-red-50 hover:text-red-500"
                              title="Remove admin"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pending admins (no profile yet) */}
        {adminEntries.filter(
          (e) => !admins.some((a) => a.email.toLowerCase() === e.email.toLowerCase())
        ).length > 0 && (
          <div className="mt-4 border-t border-line pt-4">
            <p className="mb-2 text-xs font-semibold text-muted">
              Pending (no profile yet)
            </p>
            {adminEntries
              .filter((e) => !admins.some((a) => a.email.toLowerCase() === e.email.toLowerCase()))
              .map((entry) => (
                <div key={entry.email} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted">{entry.email}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ACCESS_COLORS[entry.access]}`}>
                      {entry.access === "super_admin" ? "Super Admin" : "Admin"}
                    </span>
                  </div>
                  {isSuper && (
                    <button
                      onClick={() => removeAdmin(entry.email)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
          </div>
        )}
      </section>

      {/* Add Admin Modal (Super Admin only) */}
      {showAddModal && isSuper && (
        <AddAdminModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => { setShowAddModal(false); fetchData(); }}
          existingEntries={adminEntries}
        />
      )}

      {/* Edit Access Modal (Super Admin only) */}
      {editingAccess && isSuper && (
        <EditAccessModal
          entry={editingAccess}
          onClose={() => setEditingAccess(null)}
          onSaved={() => { setEditingAccess(null); fetchData(); }}
          allEntries={adminEntries}
        />
      )}
    </div>
  );
}

// ─── Add Admin Modal ─────────────────────────────────────────────────────────

function AddAdminModal({
  onClose,
  onAdded,
  existingEntries,
}: {
  onClose: () => void;
  onAdded: () => void;
  existingEntries: AdminEntry[];
}) {
  const [email, setEmail] = useState("");
  const [access, setAccess] = useState<AccessLevel>("admin");
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const togglePage = (slug: string) => {
    setSelectedPages((prev) =>
      prev.includes(slug) ? prev.filter((p) => p !== slug) : [...prev, slug]
    );
  };

  const handleAdd = async () => {
    if (!email.trim()) return;
    setBusy(true);
    try {
      const newEntry: AdminEntry = {
        email: email.trim().toLowerCase(),
        access,
        pages: access === "super_admin" ? ["*"] : selectedPages,
      };
      const updated = [...existingEntries, newEntry];
      await updateDoc(doc(db, "config", "admins"), {
        admins: updated,
        emails: updated.map((e) => e.email),
      });
      onAdded();
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Add Admin</h2>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>
        <p className="mt-1 text-sm text-muted">
          Add a new admin. They&apos;ll need to sign up and log in at /u/login.
        </p>

        {/* Email */}
        <div className="mt-5">
          <label className="mb-1.5 block text-xs font-semibold text-ink">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            className="h-11 w-full rounded-full bg-[#F4F5F8] px-4 text-sm text-ink outline-none placeholder:text-muted"
          />
        </div>

        {/* Access level */}
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-semibold text-ink">Access Level</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAccess("super_admin")}
              className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                access === "super_admin"
                  ? "border-[#b45309] bg-[#fef3e2] text-[#b45309]"
                  : "border-line bg-white text-muted hover:border-ink hover:text-ink"
              }`}
            >
              Super Admin
              <span className="mt-0.5 block text-[11px] font-normal opacity-70">Full access to all pages</span>
            </button>
            <button
              type="button"
              onClick={() => setAccess("admin")}
              className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                access === "admin"
                  ? "border-mercury bg-[#eaf1fc] text-mercury"
                  : "border-line bg-white text-muted hover:border-ink hover:text-ink"
              }`}
            >
              Admin
              <span className="mt-0.5 block text-[11px] font-normal opacity-70">Access to selected pages only</span>
            </button>
          </div>
        </div>

        {/* Page access (only for non-super admins) */}
        {access === "admin" && (
          <div className="mt-4">
            <label className="mb-2 block text-xs font-semibold text-ink">
              Page Access ({selectedPages.length} selected)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_PAGES.map((slug) => (
                <label
                  key={slug}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                    selectedPages.includes(slug)
                      ? "border-mercury bg-[#eaf1fc] text-ink"
                      : "border-line bg-white text-muted hover:border-ink"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPages.includes(slug)}
                    onChange={() => togglePage(slug)}
                    className="rounded"
                  />
                  {PAGE_LABELS[slug] ?? slug}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition hover:border-ink"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!email.trim() || busy || (access === "admin" && selectedPages.length === 0)}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-40"
          >
            {busy ? "Adding..." : "Add Admin"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Access Modal ───────────────────────────────────────────────────────

function EditAccessModal({
  entry,
  onClose,
  onSaved,
  allEntries,
}: {
  entry: AdminEntry;
  onClose: () => void;
  onSaved: () => void;
  allEntries: AdminEntry[];
}) {
  const [access, setAccess] = useState<AccessLevel>(entry.access);
  const [selectedPages, setSelectedPages] = useState<string[]>(
    entry.pages.includes("*") ? [...ALL_PAGES] : entry.pages
  );
  const [busy, setBusy] = useState(false);

  const togglePage = (slug: string) => {
    setSelectedPages((prev) =>
      prev.includes(slug) ? prev.filter((p) => p !== slug) : [...prev, slug]
    );
  };

  const handleSave = async () => {
    setBusy(true);
    try {
      const updatedEntry: AdminEntry = {
        email: entry.email,
        access,
        pages: access === "super_admin" ? ["*"] : selectedPages,
      };
      const updated = allEntries.map((e) =>
        e.email.toLowerCase() === entry.email.toLowerCase() ? updatedEntry : e
      );
      await updateDoc(doc(db, "config", "admins"), {
        admins: updated,
        emails: updated.map((e) => e.email),
      });
      onSaved();
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Edit Access</h2>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>
        <p className="mt-1 text-sm text-muted">
          Update access for <strong>{entry.email}</strong>
        </p>

        {/* Access level */}
        <div className="mt-5">
          <label className="mb-1.5 block text-xs font-semibold text-ink">Access Level</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAccess("super_admin")}
              className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                access === "super_admin"
                  ? "border-[#b45309] bg-[#fef3e2] text-[#b45309]"
                  : "border-line bg-white text-muted hover:border-ink hover:text-ink"
              }`}
            >
              Super Admin
              <span className="mt-0.5 block text-[11px] font-normal opacity-70">Full access</span>
            </button>
            <button
              type="button"
              onClick={() => setAccess("admin")}
              className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                access === "admin"
                  ? "border-mercury bg-[#eaf1fc] text-mercury"
                  : "border-line bg-white text-muted hover:border-ink hover:text-ink"
              }`}
            >
              Admin
              <span className="mt-0.5 block text-[11px] font-normal opacity-70">Selected pages</span>
            </button>
          </div>
        </div>

        {/* Page checkboxes */}
        {access === "admin" && (
          <div className="mt-4">
            <label className="mb-2 block text-xs font-semibold text-ink">
              Page Access ({selectedPages.length} selected)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_PAGES.map((slug) => (
                <label
                  key={slug}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                    selectedPages.includes(slug)
                      ? "border-mercury bg-[#eaf1fc] text-ink"
                      : "border-line bg-white text-muted hover:border-ink"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPages.includes(slug)}
                    onChange={() => togglePage(slug)}
                    className="rounded"
                  />
                  {PAGE_LABELS[slug] ?? slug}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition hover:border-ink"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={busy || (access === "admin" && selectedPages.length === 0)}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-40"
          >
            {busy ? "Saving..." : "Save Access"}
          </button>
        </div>
      </div>
    </div>
  );
}
