import { BadgeCheck } from "lucide-react";
import { TOP_CUSTOMERS } from "@/lib/adminData";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

export default function TopCustomers() {
  return (
    <section className="admin-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-ink">Top Customers</h3>
        <button className="text-xs font-medium text-mercury transition hover:text-mercury-dark">
          See all
        </button>
      </div>

      <ul className="mt-4 flex flex-col gap-4">
        {TOP_CUSTOMERS.map((c) => (
          <li key={c.name} className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: c.color }}
            >
              {initials(c.name)}
            </span>
            <div className="flex-1">
              <p className="flex items-center gap-1 text-sm font-semibold text-ink">
                {c.name}
                <BadgeCheck size={14} className="text-mercury" />
              </p>
              <p className="text-[11px] text-muted">{c.purchases} Purchases</p>
            </div>
            <span className="text-sm font-semibold text-ink">{c.amount}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
