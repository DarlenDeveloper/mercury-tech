"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  LogOut,
  Package,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { signOut } from "@/lib/auth";
import { getCart, type CartItem } from "@/lib/cart";
import { getFavorites } from "@/lib/wishlist";

export default function Header() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  const rate = 3780;

  // Refresh cart and wishlist on mount and when panels open
  useEffect(() => {
    if (!user) return;
    getCart(user.uid).then(setCartItems).catch(() => {});
    getFavorites(user.uid).then(setWishlistIds).catch(() => {});
  }, [user]);

  const refreshCart = () => {
    if (!user) return;
    getCart(user.uid).then(setCartItems).catch(() => {});
  };

  const refreshWishlist = () => {
    if (!user) return;
    getFavorites(user.uid).then(setWishlistIds).catch(() => {});
  };

  const openCart = () => {
    refreshCart();
    setCartOpen(true);
  };

  const openWishlist = () => {
    refreshWishlist();
    setWishlistOpen(true);
  };

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const cartTotal = Math.round(
    cartItems.reduce((s, i) => s + i.priceUsd * i.qty, 0) * rate
  );

  const formatUgx = (n: number) => `USh ${n.toLocaleString("en-UG")}`;

  return (
    <>
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
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/mercury-logo.png"
              alt="Mercury Computers Limited"
              width={160}
              height={30}
              className="h-7 w-auto object-contain lg:h-8"
              priority
            />
          </Link>

          {/* Desktop search */}
          <div className="hidden flex-1 items-center gap-2 md:flex">
            <form className="relative flex-1" role="search">
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
            {/* AI Assistant button */}
            <button
              type="button"
              aria-label="AI Shopping Assistant"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-mercury transition hover:bg-mercury/10"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.03 18.97a.75.75 0 0 1 0-1.06l.72-.72a.75.75 0 1 1 1.06 1.06l-.72.72a.75.75 0 0 1-1.06 0Z" />
                <path d="M3.5 14.5a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75Z" />
                <path d="M7.75 9.5a.75.75 0 0 1 0 .75.75.75 0 0 1-.75.75.75.75 0 0 1-.75-.75v-1a.75.75 0 0 1 1.5 0Z" />
                <path d="M12.672 2.535a.75.75 0 0 0-1.344 0L9.06 7.67a.75.75 0 0 1-.39.39l-5.135 2.268a.75.75 0 0 0 0 1.344l5.135 2.268a.75.75 0 0 1 .39.39l2.268 5.135a.75.75 0 0 0 1.344 0l2.268-5.135a.75.75 0 0 1 .39-.39l5.135-2.268a.75.75 0 0 0 0-1.344l-5.135-2.268a.75.75 0 0 1-.39-.39L12.672 2.535Z" />
                <path d="M18.25 2a.75.75 0 0 1 .75.75v1.5h1.5a.75.75 0 0 1 0 1.5H19v1.5a.75.75 0 0 1-1.5 0v-1.5h-1.5a.75.75 0 0 1 0-1.5H17.5v-1.5a.75.75 0 0 1 .75-.75Z" />
              </svg>
            </button>
          </div>

          {/* Support + delivery (desktop only) */}
          <div className="hidden items-center gap-6 xl:flex">
            <InfoBlock
              icon={<Headphones size={24} className="text-mercury" />}
              title="Customer Care"
              highlight="0414 256 136"
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

            {/* Currency */}
            <button className="hidden items-center gap-1 px-2 py-2 text-sm font-medium text-ink transition hover:text-mercury sm:flex">
              USh
              <ChevronDown size={14} className="text-muted" />
            </button>

            <span className="mx-1 hidden h-5 w-px bg-line sm:block" />

            {/* Account */}
            <div className="relative">
              <button
                aria-label="Account"
                onClick={() => setProfileOpen(!profileOpen)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink transition hover:bg-surface-soft hover:text-mercury sm:h-10 sm:w-10"
              >
                <User size={20} />
                {user && (
                  <span className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
                )}
              </button>

              {/* Profile dropdown */}
              {profileOpen && (
                <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-line bg-white p-2 shadow-lg">
                  {user ? (
                    <>
                      <div className="px-3 py-2">
                        <p className="text-sm font-semibold text-ink truncate">
                          {user.displayName || "Customer"}
                        </p>
                        <p className="text-xs text-muted truncate">
                          {user.email?.endsWith("@mercury.phone")
                            ? `+${user.email.replace("@mercury.phone", "").replace(/^(\d{3})(\d{3})(\d+)/, "$1 $2 $3")}`
                            : user.email}
                        </p>
                      </div>
                      <hr className="my-1 border-line" />
                      <Link
                        href="/cart"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink transition hover:bg-surface-soft"
                      >
                        <Package size={16} className="text-muted" />
                        My Orders
                      </Link>
                      <Link
                        href="/cart"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink transition hover:bg-surface-soft"
                      >
                        <Heart size={16} className="text-muted" />
                        My Wishlist
                      </Link>
                      <hr className="my-1 border-line" />
                      <button
                        onClick={() => {
                          signOut();
                          setProfileOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-500 transition hover:bg-red-50"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-3 py-2">
                        <p className="text-sm text-muted">
                          Sign in for a better experience
                        </p>
                      </div>
                      <Link
                        href="/login"
                        onClick={() => setProfileOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm font-semibold text-ink transition hover:bg-surface-soft"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setProfileOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm font-semibold text-mercury transition hover:bg-surface-soft"
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={openWishlist}
              className="relative hidden h-9 w-9 items-center justify-center rounded-full text-ink transition hover:bg-surface-soft hover:text-mercury sm:flex sm:h-10 sm:w-10"
            >
              <Heart size={20} />
              {wishlistIds.size > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-mercury-accent px-1 text-[10px] font-bold leading-none text-white">
                  {wishlistIds.size}
                </span>
              )}
            </button>

            {/* Cart button */}
            <button
              onClick={openCart}
              className="ml-1 flex items-center gap-1.5 rounded-full bg-mercury py-1.5 pl-1.5 pr-3 text-white transition hover:bg-mercury-dark sm:gap-2 sm:pr-4"
            >
              <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/15 sm:h-9 sm:w-9">
                <ShoppingCart size={17} />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-mercury-accent px-1 text-[10px] font-bold leading-none text-white">
                  {cartCount}
                </span>
              </span>
              <span className="hidden text-sm font-semibold sm:block">
                {formatUgx(cartTotal)}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
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
              <MobileNavLink href="/cart">Cart</MobileNavLink>
              {user ? (
                <>
                  <MobileNavLink href="/cart">My Orders</MobileNavLink>
                  <li>
                    <button
                      onClick={() => { signOut(); setMobileMenuOpen(false); }}
                      className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-500 transition hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <MobileNavLink href="/login">Sign In</MobileNavLink>
                  <MobileNavLink href="/signup">Create Account</MobileNavLink>
                </>
              )}
            </ul>
          </nav>
        )}
      </header>

      {/* Cart slide-out panel */}
      {cartOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/40"
            onClick={() => setCartOpen(false)}
          />
          {/* Panel */}
          <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-lg font-bold text-ink">
                Cart ({cartCount})
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-surface-soft"
              >
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <ShoppingCart size={40} className="text-muted/30" />
                  <p className="mt-3 text-sm text-muted">Your cart is empty</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="flex gap-3">
                      <div className="h-16 w-16 shrink-0 rounded-xl bg-[#F0F1F4]">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="h-full w-full rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-muted">
                            No img
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <p className="text-sm font-medium text-ink truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted">Qty: {item.qty}</p>
                        <p className="mt-auto text-sm font-semibold text-ink">
                          {formatUgx(Math.round(item.priceUsd * rate * item.qty))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-line px-5 py-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-bold text-ink">{formatUgx(cartTotal)}</span>
                </div>
                <Link
                  href="/cart"
                  onClick={() => setCartOpen(false)}
                  className="mt-3 block w-full rounded-full bg-mercury py-3 text-center text-sm font-semibold text-white transition hover:bg-mercury-dark"
                >
                  View Cart & Checkout
                </Link>
              </div>
            )}
          </div>
        </>
      )}
      {/* Wishlist slide-out panel */}
      {wishlistOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40"
            onClick={() => setWishlistOpen(false)}
          />
          <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-lg font-bold text-ink">
                Wishlist ({wishlistIds.size})
              </h2>
              <button
                onClick={() => setWishlistOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-surface-soft"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {wishlistIds.size === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <Heart size={40} className="text-muted/30" />
                  <p className="mt-3 text-sm text-muted">No favorites yet</p>
                  <p className="mt-1 text-xs text-muted">
                    Items you love will appear here.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {Array.from(wishlistIds).map((id) => (
                    <div
                      key={id}
                      className="flex items-center gap-3 rounded-xl bg-surface-soft p-3"
                    >
                      <Heart size={16} className="shrink-0 fill-mercury text-mercury" />
                      <span className="text-sm font-medium text-ink truncate">
                        {id}
                      </span>
                      <Link
                        href={`/product/${id}`}
                        onClick={() => setWishlistOpen(false)}
                        className="ml-auto text-xs font-semibold text-mercury hover:text-mercury-dark"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-surface-soft"
      >
        {children}
      </Link>
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
