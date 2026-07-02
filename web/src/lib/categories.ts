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

const sub = (name: string, slug: string): SubCategory => ({ name, slug });

/// Full category taxonomy, ported from the site navigation (NAVIGATION.md)
/// and the mobile app's shop screen. `children` are the meaningful leaf
/// subcategories shown under each top-level category.
export const CATEGORIES: Category[] = [
  {
    name: "Computers",
    slug: "computers",
    image: "/cat-computers.jpeg",
    children: [
      sub("Business Laptops", "business-laptops"),
      sub("Gaming Laptops", "gaming-laptops"),
      sub("2-in-1 Laptops", "2-in-1-laptops"),
      sub("Desktop PCs", "desktop-pcs"),
      sub("All-in-One PCs", "all-in-one-pcs"),
      sub("Monitors", "monitors"),
      sub("Servers", "servers"),
      sub("Computer Software", "computer-software"),
    ],
  },
  {
    name: "Printers & Office",
    slug: "printers-office",
    image: "/cat-office.jpeg",
    children: [
      sub("All-in-One Printers", "all-in-one-printers"),
      sub("Laser Printers", "laser-printers"),
      sub("Inkjet Printers", "inkjet-printers"),
      sub("Toner Cartridges", "toner-cartridges"),
      sub("Ink Cartridges", "ink-cartridges"),
      sub("Scanners", "scanners"),
      sub("Projectors", "projectors"),
      sub("Paper Shredders", "paper-shredders"),
    ],
  },
  {
    name: "Components & Power",
    slug: "components-power",
    image: "/cat-components.jpeg",
    children: [
      sub("Graphics Cards", "graphics-cards"),
      sub("Laptop RAM", "laptop-ram"),
      sub("Desktop RAM", "desktop-ram"),
      sub("Internal Hard Drives", "internal-hard-drives"),
      sub("External SSDs", "external-ssds"),
      sub("Flash Disks", "flash-disks"),
      sub("UPS", "ups"),
      sub("Power Banks", "power-banks"),
    ],
  },
  {
    name: "Networking & Security",
    slug: "networking-security",
    image: "/cat-networking.jpeg",
    children: [
      sub("Wi-Fi Routers", "wifi-routers"),
      sub("4G Routers", "4g-routers"),
      sub("MiFi & Mobile WiFi", "mifi"),
      sub("Network Switches", "network-switches"),
      sub("Wi-Fi Access Points", "access-points"),
      sub("CCTV & Cameras", "cctv-cameras"),
      sub("DVRs", "dvrs"),
    ],
  },
  {
    name: "Phones, TV & Audio",
    slug: "phones-tv-audio",
    image: "/cat-phones.jpeg",
    children: [
      sub("Mobile Phones", "mobile-phones"),
      sub("Tablets", "tablets"),
      sub("Smart TVs", "smart-tvs"),
      sub("Headphones", "headphones"),
      sub("Speakers", "speakers"),
    ],
  },
  {
    name: "Accessories",
    slug: "accessories",
    image: "/cat-accessories.jpeg",
    children: [
      sub("Mice", "mice"),
      sub("Wireless Keyboards", "wireless-keyboards"),
      sub("Webcams", "webcams"),
      sub("Headsets", "headsets"),
      sub("Gaming Consoles", "gaming-consoles"),
      sub("Portable Speakers", "portable-speakers"),
    ],
  },
];
