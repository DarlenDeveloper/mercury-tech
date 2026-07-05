import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Zap,
  Upload,
  type LucideIcon,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { WEBSITE, type FlashSale } from "@/lib/adminData";

const FLASH_STATUS: Record<FlashSale["status"], string> = {
  Live: "bg-[#e7f6ee] text-[#16a34a]",
  Scheduled: "bg-[#e8eefc] text-mercury",
  Ended: "bg-surface-soft text-muted",
};

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

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-soft text-mercury">
          <Icon size={18} />
        </span>
        <div>
          <h3 className="text-[15px] font-bold text-ink">{title}</h3>
          <p className="text-xs text-muted">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

export default function WebsitePage() {
  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="Website"
        subtitle="Manage homepage content, graphics and promotions"
        action={
          <button className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black">
            Publish changes
          </button>
        }
      />

      {/* Site numbers */}
      <section className="admin-card mt-6 p-5">
        <SectionTitle
          icon={Pencil}
          title="Site Numbers"
          subtitle="Trust badges shown across the storefront"
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {WEBSITE.siteStats.map((s) => (
            <div key={s.label} className="rounded-xl bg-surface-soft p-4">
              <p className="text-2xl font-extrabold tracking-tight text-ink">
                {s.value}
              </p>
              <p className="mt-0.5 text-xs text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Homepage carousel */}
      <section className="admin-card mt-6 p-5">
        <SectionTitle
          icon={Upload}
          title="Homepage Carousel"
          subtitle="Hero slides shown on the storefront"
          action={
            <button className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-medium text-ink shadow-sm transition hover:text-mercury">
              <Plus size={15} />
              Add slide
            </button>
          }
        />
        <div className="flex flex-col gap-3">
          {WEBSITE.carousel.map((slide) => (
            <div
              key={slide.id}
              className="flex items-center gap-3 rounded-xl border border-line p-3"
            >
              <GripVertical size={18} className="shrink-0 text-muted" />
              <span className="flex h-14 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-soft">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  width={96}
                  height={56}
                  className="h-12 object-contain"
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">
                  {slide.title}
                </p>
                <p className="truncate text-xs text-muted">{slide.subtitle}</p>
              </div>
              <Toggle on={slide.active} />
              <button className="rounded-lg p-1.5 text-muted transition hover:bg-surface-soft hover:text-ink">
                <Pencil size={16} />
              </button>
              <button className="rounded-lg p-1.5 text-muted transition hover:bg-surface-soft hover:text-[#e11d48]">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Flash sales */}
      <section className="admin-card mt-6 p-5">
        <SectionTitle
          icon={Zap}
          title="Flash Sales"
          subtitle="Time-limited promotions on selected products"
          action={
            <button className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-medium text-ink shadow-sm transition hover:text-mercury">
              <Plus size={15} />
              New sale
            </button>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-[12px] font-medium text-muted">
                <th className="pb-3 pl-1 font-medium">Product</th>
                <th className="pb-3 font-medium">Discount</th>
                <th className="pb-3 font-medium">Starts</th>
                <th className="pb-3 font-medium">Ends</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {WEBSITE.flashSales.map((f) => (
                <tr
                  key={f.id}
                  className="border-b border-line/70 text-sm last:border-0"
                >
                  <td className="py-3 pl-1">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-surface-soft">
                        <Image
                          src={f.image}
                          alt={f.product}
                          width={36}
                          height={36}
                          className="h-7 w-7 object-contain"
                        />
                      </span>
                      <span className="font-medium text-ink">{f.product}</span>
                    </div>
                  </td>
                  <td className="py-3 font-semibold text-mercury-accent">
                    {f.discount}
                  </td>
                  <td className="py-3 text-muted">{f.starts}</td>
                  <td className="py-3 text-muted">{f.ends}</td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${FLASH_STATUS[f.status]}`}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button className="rounded-lg p-1.5 text-muted transition hover:bg-surface-soft hover:text-ink">
                      <Pencil size={16} />
                    </button>
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
