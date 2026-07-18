"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import {
  Search,
  Download,
  Eye,
  X,
  MapPin,
  Phone,
  Mail,
  User,
  Package,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { db } from "@/lib/firestore";

type OrderItem = {
  productId: string;
  name: string;
  category: string;
  priceUsd: number;
  qty: number;
};

type Order = {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  items: OrderItem[];
  totalUsd: number;
  paymentMethod: string;
  status: string;
  createdAt: Date | null;
};

type CustomerProfile = {
  name: string;
  email: string;
  phone: string;
  location: string;
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-[#fef3e2] text-[#b45309]",
  processing: "bg-[#eaf1fc] text-mercury",
  completed: "bg-[#e7f6ee] text-[#16a34a]",
  cancelled: "bg-[#fde8ea] text-[#e11d48]",
};

const STATUSES = ["pending", "processing", "completed", "cancelled"];

function formatDate(date: Date | null) {
  if (!date) return "\u2014";
  return date.toLocaleDateString("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const rate = 3780;
  const formatUgx = (usd: number) =>
    "USh " + Math.round(usd * rate).toLocaleString();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setOrders(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            userId: data.userId ?? "",
            items: data.items ?? [],
            totalUsd: data.totalUsd ?? 0,
            paymentMethod: data.paymentMethod ?? "",
            status: data.status ?? "pending",
            createdAt: data.createdAt?.toDate?.() ?? null,
          };
        })
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    await updateDoc(doc(db, "orders", orderId), { status: newStatus });
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const tabs = [
    "All",
    ...STATUSES.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
  ];

  const filtered = orders.filter((o) => {
    const matchesTab =
      activeTab === "All" || o.status === activeTab.toLowerCase();
    const matchesSearch =
      search === "" ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.items.some((i) =>
        i.name.toLowerCase().includes(search.toLowerCase())
      );
    return matchesTab && matchesSearch;
  });

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="Orders"
        subtitle="View and manage customer orders"
        action={
          <button
            onClick={() => {
              import("@/lib/exportCsv").then(({ exportToCsv }) => {
                exportToCsv("mercury-orders", orders.map((o) => ({
                  id: o.id,
                  customer: o.userName || o.userEmail || '',
                  email: o.userEmail || '',
                  total_usd: o.totalUsd,
                  status: o.status,
                  payment: o.paymentMethod,
                  date: o.createdAt?.toISOString() ?? '',
                })));
              });
            }}
            className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
          >
            <Download size={16} />
            Export
          </button>
        }
      />

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#eaf1fc" }}>
          <p className="text-[12px] text-muted">Total Orders</p>
          <p className="text-xl font-extrabold text-ink">{orders.length}</p>
        </div>
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#fef3e2" }}>
          <p className="text-[12px] text-muted">Pending</p>
          <p className="text-xl font-extrabold text-ink">
            {orders.filter((o) => o.status === "pending").length}
          </p>
        </div>
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#eaf1fc" }}>
          <p className="text-[12px] text-muted">Processing</p>
          <p className="text-xl font-extrabold text-ink">
            {orders.filter((o) => o.status === "processing").length}
          </p>
        </div>
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#eef7ee" }}>
          <p className="text-[12px] text-muted">Completed</p>
          <p className="text-xl font-extrabold text-ink">
            {orders.filter((o) => o.status === "completed").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          />
        </div>
      </div>

      {/* Table */}
      <section className="mt-5 rounded-2xl bg-white p-5">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-mercury" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted">
            No orders found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-[12px] font-medium text-muted">
                  <th className="pb-3 pl-1 font-medium">Order</th>
                  <th className="pb-3 font-medium">Items</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Payment</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-line/70 text-sm last:border-0"
                  >
                    <td className="py-3 pl-1 font-medium text-ink">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="py-3 text-muted">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""}
                    </td>
                    <td className="py-3 font-semibold text-ink">
                      {formatUgx(order.totalUsd)}
                    </td>
                    <td className="py-3 text-muted">{order.paymentMethod}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
                          STATUS_STYLES[order.status] ?? STATUS_STYLES.pending
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-muted text-xs">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-surface-soft hover:text-mercury"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Order Detail Popup */}
      {selectedOrder && (
        <OrderDetailPopup
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={updateStatus}
          formatUgx={formatUgx}
        />
      )}
    </div>
  );
}

function OrderDetailPopup({
  order,
  onClose,
  onStatusChange,
  formatUgx,
}: {
  order: Order;
  onClose: () => void;
  onStatusChange: (id: string, s: string) => void;
  formatUgx: (n: number) => string;
}) {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(true);

  useEffect(() => {
    getDoc(doc(db, "users", order.userId))
      .then((snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setCustomer({
            name: d.name || "Unknown",
            email: d.email || "",
            phone: d.phone || "",
            location: d.location || "",
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoadingCustomer(false));
  }, [order.userId]);

  const mapQuery = encodeURIComponent(
    customer?.location || "Kampala, Uganda"
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-ink">
              Order #{order.id.slice(0, 8)}
            </h2>
            <p className="text-xs text-muted">{formatDate(order.createdAt)}</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Status + Payment + Total */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Status:</span>
              <select
                value={order.status}
                onChange={(e) => onStatusChange(order.id, e.target.value)}
                className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink outline-none"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Payment:</span>
              <span className="text-sm font-medium text-ink">
                {order.paymentMethod}
              </span>
            </div>
            <div className="ml-auto">
              <span className="text-lg font-bold text-ink">
                {formatUgx(order.totalUsd)}
              </span>
            </div>
          </div>

          {/* Customer */}
          <div className="mt-6">
            <h3 className="text-sm font-bold text-ink mb-3">Customer</h3>
            {loadingCustomer ? (
              <div className="flex items-center gap-2 text-xs text-muted">
                <div className="h-3 w-3 animate-spin rounded-full border border-line border-t-mercury" />
                Loading...
              </div>
            ) : customer ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-xl bg-[#f8fafb] px-4 py-3">
                  <User size={15} className="text-muted" />
                  <span className="text-sm text-ink">{customer.name}</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-[#f8fafb] px-4 py-3">
                  <Phone size={15} className="text-muted" />
                  <span className="text-sm text-ink">
                    {customer.phone || "\u2014"}
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-[#f8fafb] px-4 py-3">
                  <Mail size={15} className="text-muted" />
                  <span className="text-sm text-ink truncate">
                    {customer.email.endsWith("@mercury.phone")
                      ? "+" +
                        customer.email.replace("@mercury.phone", "")
                      : customer.email || "\u2014"}
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-[#f8fafb] px-4 py-3">
                  <MapPin size={15} className="text-muted" />
                  <span className="text-sm text-ink">
                    {customer.location || "\u2014"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted">Customer not found</p>
            )}
          </div>

          {/* Map */}
          {customer?.location && (
            <div className="mt-4 overflow-hidden rounded-xl border border-line">
              <iframe
                src={
                  "https://www.google.com/maps?q=" + mapQuery + "&output=embed"
                }
                width="100%"
                height="180"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Delivery location"
              />
            </div>
          )}

          {/* Items */}
          <div className="mt-6">
            <h3 className="text-sm font-bold text-ink mb-3">
              Items ({order.items.length})
            </h3>
            <div className="flex flex-col gap-2">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-[#f8fafb] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                      <Package size={16} className="text-muted" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-muted">
                        {item.category} &middot; Qty: {item.qty}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-ink">
                    {formatUgx(item.priceUsd * item.qty)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
