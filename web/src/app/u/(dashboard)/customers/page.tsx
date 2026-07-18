"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Search, ListFilter, Download, ChevronRight } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { db } from "@/lib/firestore";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  role?: string;
  createdAt: Date | null;
};

const COLORS = [
  "#1f3e97", "#0e7490", "#9f1239", "#b45309", "#16a34a",
  "#7c3aed", "#dc2626", "#0d9488", "#6366f1", "#ea580c",
];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function getColor(index: number) {
  return COLORS[index % COLORS.length];
}

function formatDate(date: Date | null) {
  if (!date) return "—";
  return date.toLocaleDateString("en-UG", { month: "short", year: "numeric" });
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        const data = snap.docs.map((d) => {
          const raw = d.data();
          return {
            id: d.id,
            name: raw.name || "Unknown",
            email: raw.email || "",
            phone: raw.phone || "",
            location: raw.location || "",
            role: raw.role || "",
            createdAt: raw.createdAt?.toDate?.() ?? null,
          } as Customer;
        });
        setCustomers(data);
      } catch (e) {
        console.error("Fetch customers error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    const matchesSearch =
      searchQuery === "" ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);

    if (activeTab === "All") return matchesSearch;
    // Simple status logic based on role or recency
    if (activeTab === "Admin") return matchesSearch && c.role === "Admin";
    return matchesSearch;
  });

  const TABS = ["All", ...new Set(customers.map((c) => c.role).filter(Boolean))];

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="Customers"
        subtitle="View registered users and their profiles"
        action={undefined}
      />

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <div className="admin-card p-5" style={{ backgroundColor: "#eaf1fc" }}>
          <p className="text-[13px] text-muted">Total Users</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-ink">
            {customers.length}
          </p>
        </div>
        <div className="admin-card p-5" style={{ backgroundColor: "#eef7ee" }}>
          <p className="text-[13px] text-muted">With Location</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-ink">
            {customers.filter((c) => c.location).length}
          </p>
        </div>
        <div className="admin-card p-5" style={{ backgroundColor: "#fef3e2" }}>
          <p className="text-[13px] text-muted">With Phone</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-ink">
            {customers.filter((c) => c.phone).length}
          </p>
        </div>
        <div className="admin-card p-5" style={{ backgroundColor: "#f3e8ff" }}>
          <p className="text-[13px] text-muted">Admins</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-ink">
            {customers.filter((c) => c.role === "Admin").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t as string)}
              className={`whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition ${
                activeTab === t
                  ? "bg-ink text-white"
                  : "bg-white text-muted hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex h-10 flex-1 items-center gap-2 rounded-full bg-white px-4">
          <Search size={16} className="text-muted" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email or phone"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          />
        </div>
      </div>

      {/* Table */}
      <section className="admin-card mt-5 p-5">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-mercury" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted">
            No customers found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-[12px] font-medium text-muted">
                  <th className="pb-3 pl-1 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Phone</th>
                  <th className="pb-3 font-medium">Location</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    className="border-b border-line/70 text-sm last:border-0"
                  >
                    <td className="py-3 pl-1">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                          style={{ backgroundColor: getColor(i) }}
                        >
                          {initials(c.name)}
                        </span>
                        <div>
                          <p className="font-medium text-ink">{c.name}</p>
                          <p className="text-[11px] text-muted">
                            {c.email.endsWith("@mercury.phone")
                              ? `+${c.email.replace("@mercury.phone", "")}`
                              : c.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-muted">{c.phone || "—"}</td>
                    <td className="py-3 text-muted">{c.location || "—"}</td>
                    <td className="py-3">
                      {c.role ? (
                        <span className="rounded-full bg-[#e8eefc] px-2.5 py-1 text-[11px] font-semibold text-mercury">
                          {c.role}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted">Customer</span>
                      )}
                    </td>
                    <td className="py-3 text-muted">{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
