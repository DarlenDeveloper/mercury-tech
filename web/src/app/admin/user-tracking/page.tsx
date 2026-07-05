import Image from "next/image";
import {
  TrendingUp,
  TrendingDown,
  Heart,
  Eye,
  ShoppingCart,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { USER_TRACKING, type ActivityAction } from "@/lib/adminData";

const ACTION_META: Record<ActivityAction, { icon: LucideIcon; tint: string; color: string }> = {
  "Viewed product": { icon: Eye, tint: "bg-surface-soft", color: "#6b7280" },
  "Added to wishlist": { icon: Heart, tint: "bg-[#fde8ea]", color: "#e11d48" },
  "Added to cart": { icon: ShoppingCart, tint: "bg-[#e8eefc]", color: "#1f3e97" },
  "Checked out": { icon: CreditCard, tint: "bg-[#e7f6ee]", color: "#16a34a" },
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("");
}

export default function UserTrackingPage() {
  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="User Tracking"
        subtitle="Wishlist saves, browsing activity and abandoned checkouts"
      />

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-2 gap-5 xl:grid-cols-4">
        {USER_TRACKING.kpis.map((k) => {
          const up = k.trend === "up";
          const color = up ? "#16a34a" : "#e11d48";
          return (
            <div key={k.label} className="admin-card p-5">
              <p className="text-[13px] text-muted">{k.label}</p>
              <p className="mt-1 text-2xl font-extrabold tracking-tight text-ink">
                {k.value}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                {up ? (
                  <TrendingUp size={14} style={{ color }} />
                ) : (
                  <TrendingDown size={14} style={{ color }} />
                )}
                <span className="text-xs font-semibold" style={{ color }}>
                  {k.delta}
                </span>
                <span className="text-[11px] text-muted">vs last week</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
        {/* Live activity feed */}
        <section className="admin-card p-5">
          <h3 className="mb-4 text-lg font-bold text-ink">Recent Activity</h3>
          <ul className="flex flex-col">
            {USER_TRACKING.activity.map((a, i) => {
              const meta = ACTION_META[a.action];
              const Icon = meta.icon;
              return (
                <li
                  key={i}
                  className="flex items-center gap-3 border-b border-line/70 py-3 last:border-0"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mercury text-[11px] font-bold text-white">
                    {initials(a.user)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink">
                      <span className="font-semibold">{a.user}</span>{" "}
                      <span className="text-muted">
                        {a.action.toLowerCase()}
                      </span>{" "}
                      <span className="font-medium">{a.product}</span>
                    </p>
                    <p className="text-[11px] text-muted">{a.time}</p>
                  </div>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.tint}`}
                    style={{ color: meta.color }}
                  >
                    <Icon size={15} />
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Right column */}
        <aside className="flex flex-col gap-6">
          {/* Most wishlisted */}
          <section className="admin-card p-5">
            <h3 className="mb-4 text-[15px] font-bold text-ink">
              Most Wishlisted
            </h3>
            <ul className="flex flex-col gap-4">
              {USER_TRACKING.mostWishlisted.map((p) => (
                <li key={p.name} className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-surface-soft">
                    <Image
                      src={p.image}
                      alt={p.name}
                      width={40}
                      height={40}
                      className="h-8 w-8 object-contain"
                    />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                    {p.name}
                  </span>
                  <span className="flex items-center gap-1 text-sm font-semibold text-ink">
                    <Heart size={13} className="fill-[#e11d48] text-[#e11d48]" />
                    {p.count}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Abandoned checkouts */}
          <section className="admin-card p-5">
            <h3 className="mb-4 text-[15px] font-bold text-ink">
              Abandoned Checkouts
            </h3>
            <ul className="flex flex-col gap-4">
              {USER_TRACKING.abandonedCheckouts.map((c) => (
                <li key={c.user} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {c.user}
                    </p>
                    <p className="text-[11px] text-muted">
                      {c.items} items · left at {c.step}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-ink">
                    {c.value}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
