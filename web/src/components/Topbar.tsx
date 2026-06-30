import Image from "next/image";
import { Search, SlidersHorizontal, ShoppingBag, Heart } from "lucide-react";

export default function Topbar() {
  return (
    <header className="flex items-center gap-4 lg:gap-6">
      {/* Logo */}
      <a href="/" className="flex shrink-0 items-center gap-2">
        <Image
          src="/mercury-logo.png"
          alt="Mercury Computers"
          width={40}
          height={40}
          className="h-10 w-10 object-contain"
          priority
        />
      </a>

      {/* Search */}
      <div className="flex flex-1 items-center gap-3">
        <form className="relative w-full" role="search">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search"
            className="h-12 w-full rounded-full border border-transparent bg-surface-soft pl-11 pr-4 text-sm text-ink outline-none transition placeholder:text-muted focus:border-mercury focus:bg-white"
          />
        </form>
        <button
          aria-label="Filters"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-soft text-ink transition hover:bg-line"
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* Right cluster */}
      <div className="flex shrink-0 items-center gap-3">
        <button
          aria-label="Orders"
          className="relative flex h-12 w-12 items-center justify-center rounded-full bg-surface-soft text-ink transition hover:bg-line"
        >
          <ShoppingBag size={18} />
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-mercury-accent px-1 text-[10px] font-bold leading-none text-white">
            4
          </span>
        </button>
        <button
          aria-label="Wishlist"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-soft text-ink transition hover:bg-line"
        >
          <Heart size={18} />
        </button>
        <button
          aria-label="Account"
          className="h-12 w-12 overflow-hidden rounded-full bg-mercury ring-2 ring-white"
        >
          <span className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
            M
          </span>
        </button>
      </div>
    </header>
  );
}
