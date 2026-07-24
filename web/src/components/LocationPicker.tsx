import { MapPin, ChevronDown } from "lucide-react";

/**
 * Static delivery-location label. Presentational only.
 * `light` renders white text for use on a dark/blue bar.
 */
export default function LocationPicker({ light = false }: { light?: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 text-[12px] ${light ? "text-white/90" : "text-muted"}`}>
      <MapPin size={15} className={`shrink-0 ${light ? "text-white" : "text-mercury"}`} />
      <span className="leading-tight">
        <span className={`block text-[10px] ${light ? "text-white/70" : "text-muted"}`}>Deliver to</span>
        <span className={`block font-semibold ${light ? "text-white" : "text-ink"}`}>Kampala, UG</span>
      </span>
      <ChevronDown size={13} className={light ? "text-white/70" : "text-muted"} />
    </div>
  );
}
