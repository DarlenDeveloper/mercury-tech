import Image from "next/image";
import {
  Search,
  Headphones,
  Truck,
  ChevronDown,
  User,
  Repeat,
  Heart,
  ShoppingCart,
} from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-[0_2px_12px_rgba(31,62,151,0.06)]">
      <div className="flex w-full items-center gap-6 px-4 py-4 lg:px-6">
        <a href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/mercury-logo.png"
            alt="Mercury Computers Limited"
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
            priority
          />
          <span className="hidden text-xl font-extrabold leading-none tracking-tight text-ink sm:block">
            Mercury
            <span className="font-semibold text-mercury"> Computers</span>
          </span>
        </a>

        {/* Search */}
        <div className="hidden flex-1 md:block">
          <form className="relative" role="search">
            <input
              type="text"
              placeholder="Search for products, brands and more"
              className="h-11 w-full rounded-full border border-line bg-white pl-5 pr-14 text-sm text-ink outline-none transition placeholder:text-muted focus:border-mercury"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-mercury text-white transition hover:bg-mercury-dark"
            >
              <Search size={16} />
            </button>
          </form>
        </div>

        {/* Support + delivery */}
        <div className="hidden items-center gap-6 lg:flex">
          <InfoBlock
            icon={<Headphones size={26} className="text-mercury" />}
            title="24/7 Support"
            highlight="+256 704 823 800"
          />
          <InfoBlock
            icon={<Truck size={26} className="text-mercury" />}
            title="Uganda-wide"
            highlight="Free Delivery"
          />
        </div>

        {/* Right cluster: currency, account, compare, wishlist, cart */}
        <div className="flex shrink-0 items-center gap-1">
          <button className="flex items-center gap-1 px-2 py-2 text-sm font-medium text-ink transition hover:text-mercury">
            USh
            <ChevronDown size={14} className="text-muted" />
          </button>

          <span className="mx-1 hidden h-5 w-px bg-line sm:block" />

          <IconButton label="Account">
            <User size={20} />
          </IconButton>
          <IconButton label="Compare" badge={0}>
            <Repeat size={20} />
          </IconButton>
          <IconButton label="Wishlist" badge={0}>
            <Heart size={20} />
          </IconButton>

          {/* Cart */}
          <a
            href="#"
            className="ml-1 flex items-center gap-2 rounded-full bg-mercury py-1.5 pl-1.5 pr-4 text-white transition hover:bg-mercury-dark"
          >
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
              <ShoppingCart size={18} />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-mercury-accent px-1 text-[10px] font-bold leading-none text-white">
                0
              </span>
            </span>
            <span className="hidden text-sm font-semibold sm:block">USh 0</span>
          </a>
        </div>
      </div>
    </header>
  );
}

function InfoBlock({
  icon,
  title,
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  highlight: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {icon}
      <div className="leading-tight">
        <p className="text-xs text-muted">{title}</p>
        <p className="text-sm font-semibold text-mercury-accent">{highlight}</p>
      </div>
    </div>
  );
}

function IconButton({
  children,
  label,
  badge,
}: {
  children: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <button
      aria-label={label}
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-surface-soft hover:text-mercury"
    >
      {children}
      {badge !== undefined && (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-mercury-accent px-1 text-[10px] font-bold leading-none text-white">
          {badge}
        </span>
      )}
    </button>
  );
}
