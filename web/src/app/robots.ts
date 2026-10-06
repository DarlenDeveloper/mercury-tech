import type { MetadataRoute } from "next";

const SITE_URL = "https://mercurycomputerslimited.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Block crawling of both protected admin workspaces and account areas.
        disallow: ["/u", "/u/", "/cart", "/ai", "/select-role", "/workshop"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
