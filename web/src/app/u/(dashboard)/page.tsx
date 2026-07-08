import AdminHeader from "@/components/admin/AdminHeader";
import StatCard from "@/components/admin/StatCard";
import EarningsChart from "@/components/admin/EarningsChart";
import TopSellingProducts from "@/components/admin/TopSellingProducts";
import TopCountries from "@/components/admin/TopCountries";
import TopCustomers from "@/components/admin/TopCustomers";
import RecentOrders from "@/components/admin/RecentOrders";
import { STATS } from "@/lib/adminData";

export default function AdminDashboardPage() {
  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="Welcome Back!"
        subtitle="Here's what's happening with your store today"
      />

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        {/* Center column */}
        <div className="flex flex-col gap-6">
          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {STATS.map((s) => (
              <StatCard key={s.label} stat={s} />
            ))}
          </div>

          <EarningsChart />
          <TopSellingProducts />
        </div>

        {/* Right rail */}
        <aside className="flex flex-col gap-6">
          <TopCountries />
          <TopCustomers />
          <RecentOrders />
        </aside>
      </div>
    </div>
  );
}
