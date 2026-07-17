import type { MetadataRoute } from "next";
import { fetchProducts } from "@/lib/firestore";
import { getCategoriesFromFirestore } from "@/lib/categories";

const SITE_URL = "https://mercurycomputerslimited.com";

export const revalidate = 3600; // rebuild sitemap hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  // Category + subcategory pages
  const categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await getCategoriesFromFirestore();
    for (const c of categories) {
      categoryPages.push({
        url: `${SITE_URL}/category/${c.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
      for (const child of c.children) {
        categoryPages.push({
          url: `${SITE_URL}/category/${c.slug}/${child.slug}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
  } catch {
    /* ignore */
  }

  // Product pages
  const productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await fetchProducts();
    for (const p of products) {
      productPages.push({
        url: `${SITE_URL}/product/${p.id}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }
  } catch {
    /* ignore */
  }

  return [...staticPages, ...categoryPages, ...productPages];
}
