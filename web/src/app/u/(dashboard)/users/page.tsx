"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { Search, Plus, ShieldCheck, X, Trash2 } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { db } from "@/lib/firestore";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  role: string;
};

const ROLE_COLORS: Record<string, string> = {
  Admin: "bg-[#eaf1fc] text-mercury",
  Manager: "bg-[#f3e8ff] text-[#7c3aed]",
  Support: "bg-[#eef7ee] text-[#16a34a]",
  Developer: "bg-[#fef3e2] text-[#b45309]",
  Finance: "bg-[#fde8ea] text-[#e11d48]",
};

export default function UsersRolesPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get admin email whitelist
      const adminDoc = await getDoc(doc(db, "config", "admins"));
      const emails: string[] = adminDoc.exists()
        ? adminDoc.data()?.emails ?? []
        : [];
      setAdminEmails(emails);

      // Get all users who are admins
      const usersSnap = await getDocs(collection(db, "users"));
      const adminUsers = usersSnap.docs
        .filter((d) => {
          const data = d.data();
          return emails.includes(data.email ?? "");
        })
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name || "Unknown",
            email: data.email || "",
            phone: data.phone || "",
            location: data.location || "",
            role: data.role || "Admin",
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
    await updateDoc(doc(db, "config", "admins"), {
      emails: arrayRemove(email),
    });
    setAdminEmails((prev) => prev.filter((e) => e !== email));
    setAdmins((prev) => prev.filter((a) => a.email !== email));
  };

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
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
          >
            <Plus size={16} />
            Add Admin
          </button>
        }
      />

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#eaf1fc" }}>
          <p className="text-[12px] text-muted">Total Admins</p>
          <p className="text-xl font-extrabold text-ink">
            {adminEmails.length}
          </p>
        </div>
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#eef7ee" }}>
          <p className="text-[12px] text-muted">With Profiles</p>
          <p className="text-xl font-extrabold text-ink">{admins.length}</p>
        </div>
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#f3e8ff" }}>
          <p className="text-[12px] text-muted">Whitelisted Emails</p>
          <p className="text-xl font-extrabold text-ink">
            {adminEmails.length}
          </p>
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
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-[12px] font-medium text-muted">
                  <th className="pb-3 pl-1 font-medium">User</th>
                  <th className="pb-3 font-medium">Email / Phone</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Location</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((admin, i) => (
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
                              ["#1f3e97", "#0e7490", "#9f1239", "#b45309", "#7c3aed"][
                                i % 5
                              ],
                          }}
                        >
                          {admin.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <span className="font-medium text-ink">
                          {admin.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-muted">
                      {admin.email.endsWith("@mercury.phone")
                        ? "+" + admin.email.replace("@mercury.phone", "")
                        : admin.email}
                    </td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          ROLE_COLORS[admin.role] ?? ROLE_COLORS.Admin
                        }`}
                      >
                        {admin.role}
                      </span>
                    </td>
                    <td className="py-3 text-muted">{admin.location || "\u2014"}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => removeAdmin(admin.email)}
                        className="text-muted transition hover:text-red-500"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Show whitelisted emails that don't have profiles yet */}
        {adminEmails.filter(
          (e) => !admins.some((a) => a.email === e)
        ).length > 0 && (
          <div className="mt-4 border-t border-line pt-4">
            <p className="mb-2 text-xs font-semibold text-muted">
              Pending (no profile yet)
            </p>
            {adminEmails
              .filter((e) => !admins.some((a) => a.email === e))
              .map((email) => (
                <div
                  key={email}
                  className="flex items-center justify-between py-2"
                >
                  <span className="text-sm text-muted">{email}</span>
                  <button
                    onClick={() => removeAdmin(email)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* Add Admin Modal */}
      {showAddModal && (
        <AddAdminModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => {
            setShowAddModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function AddAdminModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: () => void;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const handleAdd = async () => {
    if (!email.trim()) return;
    setBusy(true);
    try {
      await updateDoc(doc(db, "config", "admins"), {
        emails: arrayUnion(email.trim()),
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
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Add Admin</h2>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>
        <p className="mt-1 text-sm text-muted">
          Add an email to the admin whitelist. They'll need to sign up
          and log in at /u/login to access the dashboard.
        </p>
        <div className="mt-5">
          <label className="mb-1.5 block text-xs font-semibold text-ink">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            className="h-11 w-full rounded-full bg-[#F4F5F8] px-4 text-sm text-ink outline-none placeholder:text-muted"
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition hover:border-ink"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!email.trim() || busy}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-40"
          >
            {busy ? "Adding..." : "Add Admin"}
          </button>
        </div>
      </div>
    </div>
  );
}
