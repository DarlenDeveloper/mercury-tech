import { Award, Truck, ShieldCheck, Headphones } from "lucide-react";

const ITEMS = [
  { icon: Award, title: "20 Years Experience", subtitle: "Trusted since 2007" },
  { icon: ShieldCheck, title: "Genuine & Brand New", subtitle: "Manufacturer warranty" },
  { icon: Truck, title: "Free Delivery", subtitle: "Within Kampala Central" },
  { icon: Headphones, title: "Expert Support", subtitle: "Real people, real help" },
];

/**
 * Trust/experience strip that sits directly above the hero.
 */
export default function TrustBar() {
  return (
    <div className="rounded-3xl border border-line bg-white px-4 py-4 shadow-[0_2px_12px_rgba(31,62,151,0.05)] sm:px-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {ITEMS.map(({ icon: Icon, title, subtitle }) => (
          <div key={title} className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mercury/10 text-mercury">
              <Icon size={20} />
            </span>
            <div className="leading-tight">
              <p className="text-[13px] font-bold text-ink">{title}</p>
              <p className="text-[11px] text-muted">{subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
