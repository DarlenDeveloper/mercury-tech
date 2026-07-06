import {
  Store,
  CreditCard,
  Truck,
  Bell,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";

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
        subtitle="Configure your store and preferences"
        action={
          <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black">
            Save changes
          </button>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card icon={Store} title="Store Details">
          <div className="flex flex-col gap-4">
            <Field label="Store name" value="Mercury Computers Limited" />
            <Field label="Support email" value="customercare@mercurycomputerslimited.com" />
            <Field label="Phone" value="+256 704 823 800" />
            <Field label="Address" value="Plot 91, Kira Road, Kampala" />
          </div>
        </Card>

        <Card icon={CreditCard} title="Payments">
          <Row title="Mobile Money" desc="MTN & Airtel collections" on={true} />
          <Row title="Card payments" desc="Visa & Mastercard" on={true} />
          <Row title="Bank transfer" desc="Manual confirmation" on={true} />
          <Row title="Cash on delivery" desc="Kampala only" on={false} />
        </Card>

        <Card icon={Truck} title="Shipping">
          <div className="mb-2 flex flex-col gap-4">
            <Field label="Free delivery threshold (USh)" value="500,000" />
            <Field label="Standard delivery fee (USh)" value="15,000" />
          </div>
          <Row title="Free delivery within Kampala" desc="Waive fees inside the city" on={true} />
        </Card>

        <Card icon={Bell} title="Notifications">
          <Row title="New order alerts" desc="Notify admins on every order" on={true} />
          <Row title="Low stock warnings" desc="Alert when stock < 5" on={true} />
          <Row title="Weekly summary email" desc="Every Monday morning" on={false} />
        </Card>

        <Card icon={ShieldCheck} title="Security">
          <Row title="Two-factor authentication" desc="Require 2FA for admins" on={true} />
          <Row title="Session timeout" desc="Auto sign-out after 30 min idle" on={true} />
          <Row title="IP allowlist" desc="Restrict admin access by IP" on={false} />
        </Card>
      </div>
    </div>
  );
}
