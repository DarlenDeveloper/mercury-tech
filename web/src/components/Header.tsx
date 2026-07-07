"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Search,
  Headphones,
  Truck,
  ChevronDown,
  User,
  Heart,
  ShoppingCart,
  Menu,
  X,
} from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-[0_2px_12px_rgba(31,62,151,0.06)]">
      {/* Main bar */}
      <div className="flex w-full items-center gap-3 px-4 py-3 lg:gap-6 lg:px-6 lg:py-4">
        {/* Mobile menu toggle */}
        <button
          aria-label="Toggle menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition hover:bg-surface-soft lg:hidden"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Logo */}
        <a href="/" className="flex shrink-0 items-center">
          <Image
            src="/mercury-logo.png"
            alt="Mercury Computers Limited"
            width={160}
            height={30}
            className="h-7 w-auto object-contain lg:h-8"
            priority
          />
        </a>

        {/* Desktop search */}
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

        {/* Support + delivery (desktop only) */}
        <div className="hidden items-center gap-6 xl:flex">
          <InfoBlock
            icon={<Headphones size={24} className="text-mercury" />}
            title="24/7 Support"
            highlight="+256 704 823 800"
          />
          <InfoBlock
            icon={<Truck size={24} className="text-mercury" />}
            title="Uganda-wide"
            highlight="Free Delivery"
          />
        </div>

        {/* Right cluster */}
        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
          {/* Mobile search toggle */}
          <button
            aria-label="Search"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition hover:bg-surface-soft md:hidden"
          >
            <Search size={20} />
          </button>

          {/* Currency (hidden on very small screens) */}
          <button className="hidden items-center gap-1 px-2 py-2 text-sm font-medium text-ink transition hover:text-mercury sm:flex">
            USh
            <ChevronDown size={14} className="text-muted" />
          </button>

          <span className="mx-1 hidden h-5 w-px bg-line sm:block" />

          <IconButton label="Account">
            <User size={20} />
          </IconButton>
          <IconButton label="Wishlist" badge={0} className="hidden sm:flex">
            <Heart size={20} />
          </IconButton>

          {/* Cart */}
          <a
            href="#"
            className="ml-1 flex items-center gap-1.5 rounded-full bg-mercury py-1.5 pl-1.5 pr-3 text-white transition hover:bg-mercury-dark sm:gap-2 sm:pr-4"
          >
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/15 sm:h-9 sm:w-9">
              <ShoppingCart size={17} />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-mercury-accent px-1 text-[10px] font-bold leading-none text-white">
                0
              </span>
            </span>
            <span className="hidden text-sm font-semibold sm:block">USh 0</span>
          </a>
        </div>
      </div>

      {/* Mobile search bar (slides down) */}
      {mobileSearchOpen && (
        <div className="border-t border-line px-4 py-3 md:hidden">
          <form className="relative" role="search">
            <input
              type="text"
              placeholder="Search products, brands..."
              autoFocus
              className="h-10 w-full rounded-full border border-line bg-surface-soft pl-4 pr-12 text-sm text-ink outline-none placeholder:text-muted focus:border-mercury"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-mercury text-white"
            >
              <Search size={14} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <nav className="border-t border-line px-4 py-4 md:hidden">
          <ul className="flex flex-col gap-1">
            <MobileNavLink href="/">Home</MobileNavLink>
            <MobileNavLink href="/products">Products</MobileNavLink>
            <MobileNavLink href="/about">About Us</MobileNavLink>
            <MobileNavLink href="/contact">Contact</MobileNavLink>
          </ul>
          <div className="mt-4 flex items-center gap-4 border-t border-line pt-4">
            <InfoBlock
              icon={<Headphones size={20} className="text-mercury" />}
              title="24/7 Support"
              highlight="+256 704 823 800"
            />
          </div>
        </nav>
      )}
    </header>
  );
}

function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a
        href={href}
        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-surface-soft"
      >
        {children}
      </a>
    </li>
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
  className = "",
}: {
  children: React.ReactNode;
  label: string;
  badge?: number;
  className?: string;
}) {
  return (
    <button
      aria-label={label}
      className={`relative flex h-9 w-9 items-center justify-center rounded-full text-ink transition hover:bg-surface-soft hover:text-mercury sm:h-10 sm:w-10 ${className}`}
    >
      {children}
      {badge !== undefined && (
        <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-mercury-accent px-1 text-[10px] font-bold leading-none text-white">
          {badge}
        </span>
      )}
    </button>
  );
}
