import { TrendingUp, TrendingDown, Download, ChevronDown } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import Sparkline from "@/components/admin/Sparkline";
import AreaChart from "@/components/admin/charts/AreaChart";
import BarChart from "@/components/admin/charts/BarChart";
import DonutChart from "@/components/admin/charts/DonutChart";
import { ANALYTICS } from "@/lib/adminData";

function KpiCard({
  label,
  value,
  delta,
  trend,
  spark,
}: {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  spark: number[];
}) {
  const up = trend === "up";
  const color = up ? "#16a34a" : "#e11d48";
  return (
    <div className="admin-card p-5">
      <p className="text-[13px] text-muted">{label}</p>
      <div className="mt-2 flex items-end justify-between">
        <div>
          <p className="text-2xl font-extrabold tracking-tight text-ink">
            {value}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            {up ? (
              <TrendingUp size={14} style={{ color }} />
            ) : (
              <TrendingDown size={14} style={{ color }} />
            )}
            <span className="text-xs font-semibold" style={{ color }}>
              {delta}
            </span>
            <span className="text-[11px] text-muted">vs last period</span>
          </div>
        </div>
        <Sparkline data={spark} color={color} width={80} height={36} />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="Analytics"
        subtitle="Track store performance and customer trends"
        action={
          <>
            <button className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm transition hover:text-mercury md:flex">
              Last 12 months
              <ChevronDown size={15} className="text-muted" />
            </button>
            <button className="hidden items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black md:flex">
              <Download size={15} />
              Export
            </button>
          </>
        }
      />

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {ANALYTICS.kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {/* Revenue trend */}
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
        <AreaChart
          months={ANALYTICS.revenueTrend.months}
          values={ANALYTICS.revenueTrend.values}
          color="#1f3e97"
          unit="M"
        />
      </section>

      {/* Donuts */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="admin-card p-5">
          <h3 className="mb-4 text-lg font-bold text-ink">Sales by Category</h3>
          <DonutChart
            data={ANALYTICS.salesByCategory}
            centerValue="38%"
            centerLabel="Computers"
          />
        </section>

        <section className="admin-card p-5">
          <h3 className="mb-4 text-lg font-bold text-ink">Traffic Sources</h3>
          <DonutChart
            data={ANALYTICS.trafficSources}
            centerValue="40%"
            centerLabel="Direct"
          />
        </section>
      </div>

      {/* Orders by month */}
      <section className="admin-card mt-6 p-5">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink">Orders by Month</h3>
            <p className="text-xs text-muted">Total orders placed per month</p>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-ink">
            3,248
          </span>
        </div>
        <BarChart
          labels={ANALYTICS.ordersByMonth.months}
          values={ANALYTICS.ordersByMonth.values}
          color="#1f3e97"
        />
      </section>
    </div>
  );
}
