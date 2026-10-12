import { cache } from "react";
import { fetchCategories as fetchFirestoreCategories } from "./firestore";

export type SubCategory = {
  name: string;
  slug: string;
};

export type Category = {
  name: string;
  slug: string;
  image: string;
  children: SubCategory[];
};

/**
 * Fetches categories from Firestore and maps to the frontend Category type.
 * Only returns active categories. Wrapped in React cache() so the Sidebar,
 * PopularCategories and TopCategories reuse one query per render.
 */
export const getCategoriesFromFirestore = cache(async (): Promise<Category[]> => {
  const firestoreCategories = await fetchFirestoreCategories();
  return firestoreCategories
    .filter((c) => c.active)
    .map((c) => {
      const slug = c.slug || c.id;
      const children = (c.children || []).map((child) => ({
        name: child.name,
        slug: child.slug,
      }));

      // Virtual storefront categories combine several narrower live taxonomy
      // buckets without rewriting product records.
      if (slug === "desktops" && !children.some((child) => child.slug === "all-in-one-pcs")) {
        children.unshift({ name: "All-in-One PCs", slug: "all-in-one-pcs" });
      }

      const preferredChildSlug = slug === "desktops"
        ? "desktops"
        : slug === "printers-office"
          ? "printers"
          : null;
      if (preferredChildSlug) {
        const preferredIndex = children.findIndex((child) => child.slug === preferredChildSlug);
        if (preferredIndex > 0) children.unshift(...children.splice(preferredIndex, 1));
      }
      if (slug === "printers-office" && !children.some((child) => child.slug === "laser-printers")) {
        children.splice(1, 0, { name: "Laser Printers", slug: "laser-printers" });
      }

      return {
        name: slug === "printers-office" ? "Printers & Supplies" : c.name,
        slug,
        image: c.image || "",
        children,
      };
    });
});

/**
 * Hardcoded fallback (used if Firestore is unavailable).
 */
export const CATEGORIES: Category[] = [
  {
    name: "Computers",
    slug: "computers",
    image: "/cat-computers.jpeg",
    children: [
      { name: "Lenovo Laptops", slug: "lenovo-laptops" },
      { name: "HP Laptops", slug: "hp-laptops" },
      { name: "Dell Laptops", slug: "dell-laptops" },
      { name: "Business Laptops", slug: "business-laptops" },
      { name: "Gaming Laptops", slug: "gaming-laptops" },
      { name: "Desktops", slug: "desktops" },
      { name: "Monitors", slug: "monitors" },
    ],
  },
  {
    name: "Printers & Supplies",
    slug: "printers-office",
    image: "/cat-office.jpeg",
    children: [
      { name: "Printers", slug: "printers" },
      { name: "All-in-One Printers", slug: "multifunction-all-in-one-printers" },
      { name: "Ink Tank Printers", slug: "ink-tank-printers" },
      { name: "Laser Printers", slug: "laser-printers" },
      { name: "HP Toner Cartridges", slug: "hp-toner-cartridges" },
      { name: "Scanners", slug: "hp-scanners" },
    ],
  },
  {
    name: "Components & Power",
    slug: "components-power",
    image: "/cat-components.jpeg",
    children: [
      { name: "APC UPS", slug: "apc-ups" },
      { name: "Laptop RAM", slug: "laptop-ram" },
      { name: "Storage", slug: "storage" },
    ],
  },
  {
    name: "Networking & Security",
    slug: "networking-security",
    image: "/cat-networking.jpeg",
    children: [
      { name: "Networking", slug: "networking" },
      { name: "Routers", slug: "routers" },
      { name: "Hikvision Cameras", slug: "hikvision-cameras" },
    ],
  },
  {
    name: "Phones, TV & Audio",
    slug: "phones-tv-audio",
    image: "/cat-phones.jpeg",
    children: [
      { name: "Apple iPhone", slug: "apple-iphone" },
      { name: "Smart TV", slug: "smart-tv" },
      { name: "Headphones", slug: "headphones" },
      { name: "Speakers", slug: "speakers" },
    ],
  },
  {
    name: "Accessories",
    slug: "accessories",
    image: "/cat-accessories.jpeg",
    children: [
      { name: "Accessories", slug: "accessories" },
      { name: "Webcams", slug: "webcams" },
      { name: "Gaming Consoles", slug: "gaming-consoles" },
    ],
  },
];
