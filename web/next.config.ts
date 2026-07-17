import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project (a stray lockfile in the home
  // directory otherwise confuses Turbopack's root inference).
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    // Allow the higher quality used on the hero carousel images.
    qualities: [75, 90, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "*.firebasestorage.app",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
    ],
    dangerouslyAllowSVG: true,
  },

  // ─── 301 redirects to preserve SEO from the old WooCommerce site ──────────
  // Product URLs (/product/{slug}) are unchanged, so they carry over natively.
  // These map the old category / shop / info URLs to the new structure.
  async redirects() {
    return [
      // Top-level category mappings
      { source: "/product-category/computers-laptops", destination: "/category/computers", permanent: true },
      { source: "/product-category/computers-laptops/:path*", destination: "/category/computers", permanent: true },
      { source: "/product-category/laptops", destination: "/category/computers", permanent: true },
      { source: "/product-category/laptops/:path*", destination: "/category/computers", permanent: true },
      { source: "/product-category/desktops", destination: "/category/computers", permanent: true },
      { source: "/product-category/desktops/:path*", destination: "/category/computers", permanent: true },
      { source: "/product-category/monitors", destination: "/category/computers", permanent: true },
      { source: "/product-category/monitors/:path*", destination: "/category/computers", permanent: true },
      { source: "/product-category/tablets", destination: "/category/computers", permanent: true },

      { source: "/product-category/printers", destination: "/category/printers-office", permanent: true },
      { source: "/product-category/printers/:path*", destination: "/category/printers-office", permanent: true },
      { source: "/product-category/toner-ink", destination: "/category/printers-office", permanent: true },
      { source: "/product-category/toner-ink/:path*", destination: "/category/printers-office", permanent: true },

      { source: "/product-category/computer-components", destination: "/category/components-power", permanent: true },
      { source: "/product-category/computer-components/:path*", destination: "/category/components-power", permanent: true },
      { source: "/product-category/ups", destination: "/category/components-power", permanent: true },

      { source: "/product-category/networking", destination: "/category/networking-security", permanent: true },
      { source: "/product-category/networking/:path*", destination: "/category/networking-security", permanent: true },

      { source: "/product-category/tv-video", destination: "/category/phones-tv-audio", permanent: true },
      { source: "/product-category/tv-video/:path*", destination: "/category/phones-tv-audio", permanent: true },
      { source: "/product-category/speakers", destination: "/category/phones-tv-audio", permanent: true },
      { source: "/product-category/microsoft-licensing", destination: "/category/accessories", permanent: true },

      { source: "/product-category/accessories", destination: "/category/accessories", permanent: true },
      { source: "/product-category/accessories/:path*", destination: "/category/accessories", permanent: true },

      // Any other old category → homepage (safe fallback)
      { source: "/product-category/:slug*", destination: "/", permanent: true },

      // Shop pages → homepage
      { source: "/shop", destination: "/", permanent: true },
      { source: "/shop/page/:n*", destination: "/", permanent: true },

      // Old WooCommerce auth/account routes → new equivalents
      { source: "/auth", destination: "/login", permanent: true },
      { source: "/my-account", destination: "/login", permanent: true },
      { source: "/my-account/:path*", destination: "/login", permanent: true },

      // Info pages → homepage (until dedicated pages exist)
      { source: "/page/:slug*", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
