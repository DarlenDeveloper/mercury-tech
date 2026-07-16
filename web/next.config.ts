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
};

export default nextConfig;
