import { Store, Bell, Lock, type LucideIcon } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import PasswordChangeCard from "@/components/admin/PasswordChangeCard";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted">{label}</span>
      <input
        defaultValue={value}
        className="mt-1.5 w-full rounded-xl border border-line bg-surface-soft px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-mercury focus:bg-white"
      />
    </label>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={`flex h-5 w-9 items-center rounded-full p-0.5 transition ${
        on ? "bg-[#16a34a]" : "bg-line"
      }`}
    >
      <span
        className={`h-4 w-4 rounded-full bg-white shadow transition ${
          on ? "translate-x-4" : ""
        }`}
      />
    </span>
  );
}

function Row({ title, desc, on }: { title: string; desc: string; on: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line/70 py-3.5 last:border-0">
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="text-xs text-muted">{desc}</p>
      </div>
      <Toggle on={on} />
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="admin-card p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-soft text-mercury">
          <Icon size={18} />
        </span>
        <h3 className="text-[15px] font-bold text-ink">{title}</h3>
      </div>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="Settings"
        subtitle="Configure your store details and preferences"
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card icon={Store} title="Store Details">
          <div className="flex flex-col gap-4">
            <Field label="Store name" value="Mercury Computers Limited" />
            <Field label="Support email" value="customercare@mercurycomputerslimited.com" />
            <Field label="Phone" value="0707 749 501" />
            <Field label="WhatsApp" value="0704 823 800" />
            <Field label="Address" value="Plot 91, Kamwokya, Kira Road, Kampala" />
          </div>
        </Card>

        <Card icon={Bell} title="Notifications">
          <Row title="New order alerts" desc="Notify admins on every order" on={true} />
          <Row title="Low stock warnings" desc="Alert when stock < 5" on={true} />
          <Row title="New repair requests" desc="Alert when a repair ticket is submitted" on={true} />
        </Card>

        <PasswordChangeCard />
      </div>
    </div>
  );
}
