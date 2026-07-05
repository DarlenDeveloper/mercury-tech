import Image from "next/image";
import { RECENT_ORDERS } from "@/lib/adminData";

export default function RecentOrders() {
  return (
    <section className="admin-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-ink">Recent Orders</h3>
        <button className="text-xs font-medium text-mercury transition hover:text-mercury-dark">
          See all
        </button>
      </div>

      <ul className="mt-4 flex flex-col gap-4">
        {RECENT_ORDERS.map((o) => (
          <li key={o.name} className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-surface-soft">
              <Image
                src={o.image}
                alt={o.name}
                width={40}
                height={40}
                className="h-8 w-8 object-contain"
              />
            </span>
            <div className="flex-1">
              <p className="truncate text-sm font-semibold text-ink">
                {o.name}
              </p>
              <p className="text-[11px] text-muted">{o.category}</p>
            </div>
            <span className="text-sm font-semibold text-ink">{o.amount}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
