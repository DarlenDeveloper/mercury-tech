export type SpecRow = {
  spec: string;
  details: string;
  moreInfo: string;
  remarks: string;
};

export type ColorOption = {
  name: string;
  hex: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryId?: string;
  price: number; // Ugandan Shillings
  oldPrice?: number;
  rating: number;
  reviews: string;
  image: string;
  /** Optional extra gallery shots; falls back to [image] when empty. */
  gallery?: string[];
  /** Optional colour variants; the "Pick a Color" selector is hidden when empty. */
  colors?: ColorOption[];
  /** Units left in stock (drives the "Only N left" urgency note). */
  stock?: number;
  /** Longer marketing copy shown on the Description tab. */
  overview?: string;
  /** Four-column spec table shown on the Additional Information tab. */
  specs?: SpecRow[];
};

/// Catalog ported from the mobile app's sample_products.dart.
export const PRODUCTS: Product[] = [
  {
    id: "hp-250-g9",
    name: "HP 250 G9 Laptop",
    description: '15.6" Intel Celeron N4500, 4GB RAM, 256GB SSD',
    category: "Laptops",
    price: 1323000,
    oldPrice: 1400000,
    rating: 4.8,
    reviews: "120 Reviews",
    image: "/p-hp-250-g9.jpg",
    stock: 8,
    overview:
      "The HP 250 G9 is a dependable everyday laptop for work, study and browsing. " +
      "It pairs an efficient Intel Celeron processor with a crisp 15.6\" anti-glare " +
      "display, fast NVMe storage and Windows 11 — brand new, sealed and backed by warranty.",
    specs: [
      { spec: "Processor", details: "Intel Celeron N4500 (up to 2.8 GHz)", moreInfo: "Dual-core", remarks: "Efficient" },
      { spec: "Memory", details: "4GB DDR4", moreInfo: "Expandable", remarks: "Upgradeable" },
      { spec: "Storage", details: "256GB NVMe SSD", moreInfo: "PCIe", remarks: "Fast boot" },
      { spec: "Display", details: '15.6" HD (1366 x 768)', moreInfo: "Anti-glare", remarks: "Comfortable" },
      { spec: "Operating System", details: "Windows 11 Home", moreInfo: "Pre-installed", remarks: "Genuine" },
      { spec: "Warranty", details: "1 Year", moreInfo: "Manufacturer", remarks: "Official" },
    ],
  },
  {
    id: "lenovo-ideapad-1",
    name: "Lenovo IdeaPad 1",
    description: '14" Intel Celeron N4020, 8GB RAM, 256GB SSD',
    category: "Laptops",
    price: 1350000,
    oldPrice: 1500000,
    rating: 4.7,
    reviews: "86 Reviews",
    image: "/p-lenovo-ideapad-1.jpg",
    stock: 5,
    overview:
      "A slim, lightweight 14\" laptop built for portability. With 8GB of RAM and a " +
      "256GB SSD it handles everyday multitasking with ease, all wrapped in a compact " +
      "chassis that's easy to carry anywhere.",
    specs: [
      { spec: "Processor", details: "Intel Celeron N4020", moreInfo: "Dual-core", remarks: "Efficient" },
      { spec: "Memory", details: "8GB DDR4", moreInfo: "Onboard", remarks: "Smooth" },
      { spec: "Storage", details: "256GB NVMe SSD", moreInfo: "PCIe", remarks: "Fast" },
      { spec: "Display", details: '14" HD (1366 x 768)', moreInfo: "LED", remarks: "Portable" },
      { spec: "Operating System", details: "Windows 11 Home", moreInfo: "Pre-installed", remarks: "Genuine" },
      { spec: "Warranty", details: "1 Year", moreInfo: "Manufacturer", remarks: "Official" },
    ],
  },
  {
    id: "hp-deskjet-2320",
    name: "HP DeskJet 2320",
    description: "All-in-One Printer — Print, Scan, Copy",
    category: "Printers",
    price: 186000,
    oldPrice: 200000,
    rating: 4.5,
    reviews: "210 Reviews",
    image: "/p-hp-deskjet-2320.jpg",
    stock: 15,
    overview:
      "A compact all-in-one inkjet printer for the home and small office. Print, scan " +
      "and copy from one tidy unit, with simple USB setup and reliable HP print quality.",
    specs: [
      { spec: "Functions", details: "Print, Scan, Copy", moreInfo: "All-in-One", remarks: "Versatile" },
      { spec: "Type", details: "Inkjet", moreInfo: "Colour", remarks: "Vivid" },
      { spec: "Connectivity", details: "USB 2.0", moreInfo: "Plug & play", remarks: "Simple" },
      { spec: "Condition", details: "Brand New, Sealed", moreInfo: "Official", remarks: "Genuine" },
      { spec: "Warranty", details: "1 Year", moreInfo: "Manufacturer", remarks: "Official" },
    ],
  },
  {
    id: "dell-e2020h",
    name: "Dell E2020H Monitor",
    description: '20" HD+ 1600x900, TN Panel, 5ms',
    category: "Monitors",
    price: 437320,
    oldPrice: 481052,
    rating: 4.6,
    reviews: "64 Reviews",
    image: "/p-dell-e2020h.jpg",
    stock: 12,
    overview:
      "A 20\" HD+ monitor with a fast 5ms response and slim profile — a great, " +
      "affordable upgrade for productivity setups. Includes VGA and DisplayPort inputs.",
    specs: [
      { spec: "Screen Size", details: "20 inch", moreInfo: "Widescreen", remarks: "Compact" },
      { spec: "Resolution", details: "1600 x 900 (HD+)", moreInfo: "16:9", remarks: "Sharp" },
      { spec: "Panel", details: "TN, 5ms response", moreInfo: "Fast", remarks: "Responsive" },
      { spec: "Ports", details: "VGA, DisplayPort", moreInfo: "Dual input", remarks: "Flexible" },
      { spec: "Warranty", details: "3 Years", moreInfo: "Manufacturer", remarks: "Official" },
    ],
  },
  {
    id: "dell-optiplex-7020",
    name: "Dell OptiPlex 7020 MT",
    description: 'Core i5, 8GB RAM, 512GB SSD + 19.5" Monitor',
    category: "Desktops",
    price: 2621600,
    oldPrice: 2695000,
    rating: 4.9,
    reviews: "41 Reviews",
    image: "/p-dell-optiplex-7020.jpg",
    stock: 4,
    overview:
      "A complete desktop bundle for business and home offices. The OptiPlex 7020 " +
      "mini-tower pairs a Core i5 with 8GB RAM and a 512GB SSD, and ships with a " +
      "19.5\" monitor and Windows 11 Pro — ready to work out of the box.",
    specs: [
      { spec: "Processor", details: "Intel Core i5", moreInfo: "Quad-core", remarks: "Powerful" },
      { spec: "Memory", details: "8GB DDR4", moreInfo: "Expandable", remarks: "Upgradeable" },
      { spec: "Storage", details: "512GB SSD", moreInfo: "SATA/NVMe", remarks: "Spacious" },
      { spec: "Includes", details: '19.5" LED Monitor', moreInfo: "Bundle", remarks: "Complete" },
      { spec: "Operating System", details: "Windows 11 Pro", moreInfo: "Pre-installed", remarks: "Genuine" },
      { spec: "Warranty", details: "1 Year", moreInfo: "Manufacturer", remarks: "Official" },
    ],
  },
  {
    id: "hp-smart-tank-581",
    name: "HP Smart Tank 581",
    description: "All-in-One Wi-Fi Printer, High Yield Ink",
    category: "Printers",
    price: 560000,
    oldPrice: 620000,
    rating: 4.7,
    reviews: "98 Reviews",
    image: "/p-hp-smart-tank-581.jpg",
    stock: 9,
    overview:
      "A high-yield ink-tank all-in-one that slashes cost-per-page. Wireless printing, " +
      "scanning and copying with refillable tanks designed for high-volume home and " +
      "office use.",
    specs: [
      { spec: "Functions", details: "Print, Scan, Copy", moreInfo: "All-in-One", remarks: "Versatile" },
      { spec: "Type", details: "Ink Tank", moreInfo: "Refillable", remarks: "Low cost" },
      { spec: "Connectivity", details: "Wi-Fi, USB", moreInfo: "Wireless", remarks: "Convenient" },
      { spec: "Condition", details: "Brand New, Sealed", moreInfo: "Official", remarks: "Genuine" },
      { spec: "Warranty", details: "1 Year", moreInfo: "Manufacturer", remarks: "Official" },
    ],
  },
];

/// Formats an amount in Ugandan Shillings, e.g. 1323000 -> "USh 1,323,000".
export function formatUgx(amount: number): string {
  return `USh ${amount.toLocaleString("en-US")}`;
}

/// Finds a product by its id.
export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

/// Returns related products (same category first, then others), excluding [id].
export function getRelatedProducts(id: string, limit = 6): Product[] {
  const current = getProductById(id);
  const others = PRODUCTS.filter((p) => p.id !== id);
  const sorted = current
    ? [...others].sort((a, b) => {
        const aSame = a.category === current.category ? 0 : 1;
        const bSame = b.category === current.category ? 0 : 1;
        return aSame - bSame;
      })
    : others;
  return sorted.slice(0, limit);
}
