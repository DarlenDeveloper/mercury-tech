import Link from "next/link";
import { MapPin, Package, Store } from "lucide-react";
import CurrencySelector from "@/components/CurrencySelector";

/**
 * Top utility strip (thin bar above the main header): quick links on the left,
 * shipping note + currency + language on the right.
 */
export default function AnnouncementBar() {
  return (
    <div className="w-full border-b border-line bg-white">
      <div className="flex h-9 w-full items-center justify-between px-4 text-[12px] text-muted lg:px-6">
        {/* Left: utility links */}
        <div className="flex items-center gap-5">
          <a
            href="https://www.google.com/maps/search/Mercury+Computers+Limited+Kampala"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 transition hover:text-mercury sm:flex"
          >
            <MapPin size={13} /> Find a Store
          </a>
          <Link href="/cart" className="flex items-center gap-1.5 transition hover:text-mercury">
            <Package size={13} /> Order Tracking
          </Link>
          <Link href="/" className="hidden items-center gap-1.5 transition hover:text-mercury sm:flex">
            <Store size={13} /> Shop
          </Link>
        </div>

        {/* Right: shipping note, currency, language */}
        <div className="flex items-center gap-4">
          <span className="hidden md:inline">Free delivery within Kampala Central</span>
          <span className="hidden h-3 w-px bg-line md:inline-block" />
          <CurrencySelector />
          <span className="hidden h-3 w-px bg-line sm:inline-block" />
          <span className="hidden sm:inline">English</span>
        </div>
      </div>
    </div>
  );
}
