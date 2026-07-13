"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import {
  Plus,
  Bell,
  Mail,
  Smartphone,
  Send,
  Clock,
  FileText,
  Trash2,
  X,
  Users,
  User,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { db } from "@/lib/firestore";

type NotificationStatus = "sent" | "scheduled" | "draft";
type Channel = "push" | "email" | "in-app";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  audience: string;
  channel: Channel;
  status: NotificationStatus;
  scheduledAt: Date | null;
  createdAt: Date | null;
};

const STATUS_STYLES: Record<NotificationStatus, string> = {
  sent: "bg-[#e7f6ee] text-[#16a34a]",
  scheduled: "bg-[#eaf1fc] text-mercury",
  draft: "bg-surface-soft text-muted",
};

const CHANNEL_ICONS: Record<Channel, typeof Bell> = {
  push: Smartphone,
  email: Mail,
  "in-app": Bell,
};

const TABS = ["All", "Sent", "Scheduled", "Draft"] as const;

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("All");
  const [showCompose, setShowCompose] = useState(false);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setNotifications(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title ?? "",
            message: data.message ?? "",
            audience: data.audience ?? "All customers",
            channel: data.channel ?? "push",
            status: data.status ?? "draft",
            scheduledAt: data.scheduledAt?.toDate?.() ?? null,
            createdAt: data.createdAt?.toDate?.() ?? null,
          };
        })
      );
    } catch (e) {
      console.error("Notifications fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this notification?")) return;
    await deleteDoc(doc(db, "notifications", id));
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleSendNow = async (item: NotificationItem) => {
    await updateDoc(doc(db, "notifications", item.id), {
      status: "sent",
      sentAt: serverTimestamp(),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, status: "sent" as NotificationStatus } : n))
    );
  };

  const filtered = activeTab === "All"
    ? notifications
    : notifications.filter((n) => n.status === activeTab.toLowerCase());

  function formatTime(date: Date | null) {
    if (!date) return "—";
    const now = Date.now();
    const diff = now - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hrs ago`;
    return date.toLocaleDateString("en-UG", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="Notifications"
        subtitle="Send and schedule customer notifications"
        action={
          <button
            onClick={() => setShowCompose(true)}
            className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
          >
            <Plus size={16} />
            Compose
          </button>
        }
      />

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeTab === tab
                ? "bg-ink text-white"
                : "bg-white text-muted hover:text-ink"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <section className="admin-card mt-5 p-5">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-mercury" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted">
            No notifications yet. Click Compose to create one.
          </p>
        ) : (
          <ul className="flex flex-col">
            {filtered.map((n) => {
              const ChannelIcon = CHANNEL_ICONS[n.channel];
              return (
                <li key={n.id} className="flex items-start gap-4 border-b border-line/70 py-4 last:border-0">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-soft text-muted">
                    <ChannelIcon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-ink">{n.title}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_STYLES[n.status]}`}>
                        {n.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted">{n.message}</p>
                    <p className="mt-1 text-[11px] text-muted">
                      {n.channel} · {n.audience}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="text-xs text-muted">
                      {n.status === "scheduled" && n.scheduledAt
                        ? n.scheduledAt.toLocaleDateString("en-UG", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
                        : formatTime(n.createdAt)}
                    </span>
                    <div className="flex items-center gap-1">
                      {n.status === "draft" && (
                        <button
                          onClick={() => handleSendNow(n)}
                          className="rounded-lg p-1.5 text-muted transition hover:bg-[#e7f6ee] hover:text-[#16a34a]"
                          title="Send now"
                        >
                          <Send size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="rounded-lg p-1.5 text-muted transition hover:bg-red-50 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Compose Modal */}
      {showCompose && (
        <ComposeModal
          onClose={() => setShowCompose(false)}
          onSent={() => { setShowCompose(false); fetchNotifications(); }}
        />
      )}
    </div>
  );
}

// ─── Compose Modal ───────────────────────────────────────────────────────────

function ComposeModal({
  onClose,
  onSent,
}: {
  onClose: () => void;
  onSent: () => void;
}) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState<Channel>("push");
  const [audienceType, setAudienceType] = useState<"all" | "segment">("all");
  const [audience, setAudience] = useState("All customers");
  const [sendType, setSendType] = useState<"now" | "schedule" | "draft">("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) return;
    setBusy(true);

    let status: NotificationStatus = "sent";
    let scheduledAt = null;

    if (sendType === "draft") {
      status = "draft";
    } else if (sendType === "schedule" && scheduleDate && scheduleTime) {
      status = "scheduled";
      scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`);
    }

    const id = `notif-${Date.now()}`;
    const data: Record<string, unknown> = {
      title: title.trim(),
      message: message.trim(),
      channel,
      audience: audienceType === "all" ? "All customers" : audience.trim(),
      status,
      createdAt: serverTimestamp(),
    };
    if (scheduledAt) data.scheduledAt = scheduledAt;

    try {
      await setDoc(doc(db, "notifications", id), data);
      onSent();
    } catch (e) {
      console.error("Send notification error:", e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Compose Notification</h2>
          <button onClick={onClose} className="text-muted hover:text-ink"><X size={20} /></button>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekend Flash Sale is live"
              className="h-11 w-full rounded-full bg-[#F4F5F8] px-4 text-sm text-ink outline-none placeholder:text-muted"
            />
          </div>

          {/* Message */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the notification body..."
              rows={3}
              className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none placeholder:text-muted resize-none focus:border-mercury"
            />
          </div>

          {/* Channel */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">Channel</label>
            <div className="flex gap-2">
              {(["push", "email", "in-app"] as Channel[]).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setChannel(ch)}
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium capitalize transition ${
                    channel === ch
                      ? "border-mercury bg-[#eaf1fc] text-mercury"
                      : "border-line bg-white text-muted hover:border-ink"
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          {/* Audience */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">Audience</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setAudienceType("all"); setAudience("All customers"); }}
                className={`flex items-center gap-2 flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                  audienceType === "all"
                    ? "border-mercury bg-[#eaf1fc] text-mercury"
                    : "border-line bg-white text-muted hover:border-ink"
                }`}
              >
                <Users size={14} /> All customers
              </button>
              <button
                type="button"
                onClick={() => { setAudienceType("segment"); setAudience(""); }}
                className={`flex items-center gap-2 flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                  audienceType === "segment"
                    ? "border-mercury bg-[#eaf1fc] text-mercury"
                    : "border-line bg-white text-muted hover:border-ink"
                }`}
              >
                <User size={14} /> Specific segment
              </button>
            </div>
            {audienceType === "segment" && (
              <input
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. Wishlist: Laptops, Waitlist, user@email.com"
                className="mt-2 h-10 w-full rounded-full bg-[#F4F5F8] px-4 text-sm text-ink outline-none placeholder:text-muted"
              />
            )}
          </div>

          {/* Send type */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">When to send</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSendType("now")}
                className={`flex items-center gap-2 flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                  sendType === "now"
                    ? "border-[#16a34a] bg-[#e7f6ee] text-[#16a34a]"
                    : "border-line bg-white text-muted hover:border-ink"
                }`}
              >
                <Send size={14} /> Now
              </button>
              <button
                type="button"
                onClick={() => setSendType("schedule")}
                className={`flex items-center gap-2 flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                  sendType === "schedule"
                    ? "border-mercury bg-[#eaf1fc] text-mercury"
                    : "border-line bg-white text-muted hover:border-ink"
                }`}
              >
                <Clock size={14} /> Schedule
              </button>
              <button
                type="button"
                onClick={() => setSendType("draft")}
                className={`flex items-center gap-2 flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                  sendType === "draft"
                    ? "border-ink bg-surface-soft text-ink"
                    : "border-line bg-white text-muted hover:border-ink"
                }`}
              >
                <FileText size={14} /> Draft
              </button>
            </div>
            {sendType === "schedule" && (
              <div className="mt-2 flex gap-2">
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="h-10 flex-1 rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-mercury"
                />
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="h-10 w-32 rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-mercury"
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition hover:border-ink"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={busy || !title.trim() || !message.trim()}
            className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-40"
          >
            {busy ? "Sending..." : sendType === "draft" ? "Save Draft" : sendType === "schedule" ? "Schedule" : "Send Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
