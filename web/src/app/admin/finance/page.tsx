import { TrendingUp, TrendingDown, Download } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import AreaChart from "@/components/admin/charts/AreaChart";
import BarChart from "@/components/admin/charts/BarChart";
import DonutChart from "@/components/admin/charts/DonutChart";
import { FINANCE } from "@/lib/adminData";

const TXN_STATUS: Record<"Paid" | "Pending" | "Refunded", string> = {
  Paid: "bg-[#e7f6ee] text-[#16a34a]",
  Pending: "bg-[#fff3dc] text-[#b45309]",
  Refunded: "bg-[#fde8ea] text-[#e11d48]",
};

export default function FinancePage() {
  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="Financial Reports"
        subtitle="Revenue, expenses and transactions"
        action={
          <button className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black">
            <Download size={16} />
            Export
          </button>
        }
      />

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-2 gap-5 xl:grid-cols-4">
        {FINANCE.kpis.map((k) => {
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
                <span className="text-[11px] text-muted">vs last period</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue */}
      <section className="admin-card mt-6 p-5">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink">Revenue Overview</h3>
            <p className="text-xs text-muted">Monthly revenue (USh, millions)</p>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-ink">
            USh 84.6M
          </span>
        </div>
        <AreaChart months={FINANCE.months} values={FINANCE.revenue} color="#1f3e97" unit="M" />
      </section>

      {/* Expenses + payment methods */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="admin-card p-5">
          <div className="mb-2">
            <h3 className="text-lg font-bold text-ink">Expenses</h3>
            <p className="text-xs text-muted">Monthly operating costs (USh, millions)</p>
          </div>
          <BarChart labels={FINANCE.months} values={FINANCE.expenses} color="#e11d48" unit="M" />
        </section>

        <section className="admin-card p-5">
          <h3 className="mb-4 text-lg font-bold text-ink">Payment Methods</h3>
          <DonutChart
            data={FINANCE.paymentMethods}
            centerValue="54%"
            centerLabel="Mobile Money"
          />
        </section>
      </div>

      {/* Transactions */}
      <section className="admin-card mt-6 p-5">
        <h3 className="mb-4 text-lg font-bold text-ink">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-[12px] font-medium text-muted">
                <th className="pb-3 pl-1 font-medium">Transaction</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Method</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {FINANCE.transactions.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-line/70 text-sm last:border-0"
                >
                  <td className="py-3 pl-1 font-semibold text-ink">{t.id}</td>
                  <td className="py-3 text-ink">{t.customer}</td>
                  <td className="py-3 text-muted">{t.method}</td>
                  <td className="py-3 text-muted">{t.date}</td>
                  <td className="py-3 font-semibold text-ink">{t.amount}</td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${TXN_STATUS[t.status]}`}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
