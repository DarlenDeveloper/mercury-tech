import type { MetadataRoute } from "next";

const SITE_URL = "https://mercurycomputerslimited.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep the admin dashboard and account areas out of the index.
        disallow: ["/u", "/u/", "/cart", "/ai"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
