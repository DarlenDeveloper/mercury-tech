import { Plus, Bell, Mail, Smartphone, type LucideIcon } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { NOTIFICATIONS, type NotificationItem } from "@/lib/adminData";

const STATUS_STYLES: Record<NotificationItem["status"], string> = {
  Sent: "bg-[#e7f6ee] text-[#16a34a]",
  Scheduled: "bg-[#e8eefc] text-mercury",
  Draft: "bg-surface-soft text-muted",
};

const CHANNEL_ICON: Record<NotificationItem["channel"], LucideIcon> = {
  Push: Smartphone,
  Email: Mail,
  "In-app": Bell,
};

const TABS = ["All", "Sent", "Scheduled", "Draft"];

export default function NotificationsPage() {
  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="Notifications"
        subtitle="Send and schedule customer notifications"
        action={
          <button className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black">
            <Plus size={16} />
            Compose
          </button>
        }
      />

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-2">
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
              i === 0
                ? "bg-ink text-white"
                : "bg-white text-muted shadow-sm hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      <section className="admin-card mt-5 p-2">
        <ul className="flex flex-col">
          {NOTIFICATIONS.map((n) => {
            const Icon = CHANNEL_ICON[n.channel];
            return (
              <li
                key={n.id}
                className="flex items-start gap-3 border-b border-line/70 p-4 last:border-0"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-soft text-mercury">
                  <Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink">{n.title}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[n.status]}`}
                    >
                      {n.status}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[13px] text-muted">
                    {n.message}
                  </p>
                  <p className="mt-1 text-[11px] text-muted">
                    {n.channel} · {n.audience}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-muted">{n.time}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
