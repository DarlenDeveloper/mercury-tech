// Dummy data for the Mercury admin dashboard (mirrors the storefront catalog).

export type Trend = "up" | "down";

export type Stat = {
  label: string;
  value: string;
  delta: string;
  period: string;
  trend: Trend;
  tint: string; // card background tint
  spark: number[];
};

export const STATS: Stat[] = [
  {
    label: "Total Customers",
    value: "307.48K",
    delta: "+30%",
    period: "This month",
    trend: "up",
    tint: "#eaf1fc",
    spark: [8, 10, 7, 12, 9, 14, 11, 16, 13, 18],
  },
  {
    label: "Total Revenue",
    value: "USh 30.58M",
    delta: "-15%",
    period: "This month",
    trend: "down",
    tint: "#eef7ee",
    spark: [16, 13, 15, 10, 12, 8, 11, 7, 9, 6],
  },
  {
    label: "Total Deals",
    value: "2.48K",
    delta: "+23%",
    period: "This month",
    trend: "up",
    tint: "#eaf1fc",
    spark: [7, 9, 8, 11, 10, 13, 12, 15, 14, 17],
  },
];

export const EARNINGS = {
  months: [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
  ],
  yTicks: [0, 50, 100, 150, 200],
  firstHalf: [58, 96, 150, 178, 150, 120, 72, 52, 60, 55, 82, 120],
  topGross: [88, 92, 98, 104, 96, 128, 84, 78, 84, 70, 62, 96],
  amounts: [
    "USh 120.4K", "USh 168.2K", "USh 240.9K", "USh 288.6K",
    "USh 252.1K", "USh 307.48K", "USh 158.0K", "USh 132.5K",
    "USh 164.3K", "USh 149.8K", "USh 196.7K", "USh 254.2K",
  ],
  defaultIndex: 5,
};

export type Country = {
  name: string;
  flag: string; // emoji flag
  value: string;
  trend: Trend;
};

export const TOP_COUNTRIES = {
  total: "34.48K",
  note: "Since last week",
  items: [
    { name: "Uganda", flag: "🇺🇬", value: "12.4K", trend: "up" },
    { name: "Kenya", flag: "🇰🇪", value: "8.15K", trend: "up" },
    { name: "Tanzania", flag: "🇹🇿", value: "6.45K", trend: "down" },
    { name: "Rwanda", flag: "🇷🇼", value: "4.85K", trend: "up" },
    { name: "South Sudan", flag: "🇸🇸", value: "2.63K", trend: "down" },
  ] as Country[],
};

export type Customer = {
  name: string;
  purchases: number;
  amount: string;
  color: string;
};

export const TOP_CUSTOMERS: Customer[] = [
  { name: "Aisha Nakato", purchases: 26, amount: "USh 4.19M", color: "#1f3e97" },
  { name: "Daniel Okello", purchases: 21, amount: "USh 3.56M", color: "#0e7490" },
  { name: "Grace Auma", purchases: 17, amount: "USh 3.12M", color: "#9f1239" },
  { name: "Samuel Mugisha", purchases: 15, amount: "USh 2.14M", color: "#b45309" },
];

export type Order = {
  name: string;
  category: string;
  amount: string;
  image: string;
};

export const RECENT_ORDERS: Order[] = [
  { name: "HP 250 G9 Laptop", category: "Laptops", amount: "USh 1.32M", image: "/p-hp-250-g9.jpg" },
  { name: "Dell E2020H Monitor", category: "Monitors", amount: "USh 437K", image: "/p-dell-e2020h.jpg" },
  { name: "HP Smart Tank 581", category: "Printers", amount: "USh 560K", image: "/p-hp-smart-tank-581.jpg" },
  { name: "Lenovo IdeaPad 1", category: "Laptops", amount: "USh 1.35M", image: "/p-lenovo-ideapad-1.jpg" },
];

export type SellingProduct = {
  no: string;
  name: string;
  category: string;
  inStock: boolean;
  sales: string;
  image: string;
};

export const TOP_SELLING: SellingProduct[] = [
  { no: "01", name: "HP 250 G9 Laptop", category: "Laptops", inStock: true, sales: "1.43K", image: "/p-hp-250-g9.jpg" },
  { no: "02", name: "Dell OptiPlex 7020 MT", category: "Desktops", inStock: false, sales: "2.68K", image: "/p-dell-optiplex-7020.jpg" },
  { no: "03", name: "HP DeskJet 2320", category: "Printers", inStock: true, sales: "1.43K", image: "/p-hp-deskjet-2320.jpg" },
  { no: "04", name: "Dell E2020H Monitor", category: "Monitors", inStock: true, sales: "984", image: "/p-dell-e2020h.jpg" },
  { no: "05", name: "Lenovo IdeaPad 1", category: "Laptops", inStock: false, sales: "1.21K", image: "/p-lenovo-ideapad-1.jpg" },
];

// ---------------------------------------------------------------------------
// Analytics page
// ---------------------------------------------------------------------------

export type Segment = { name: string; value: number; color: string };

export const ANALYTICS = {
  kpis: [
    {
      label: "Revenue",
      value: "USh 84.6M",
      delta: "+12.4%",
      trend: "up" as Trend,
      spark: [6, 7, 6.5, 8, 7.4, 9, 8.6, 10.2, 9.6, 11.2],
    },
    {
      label: "Orders",
      value: "3,248",
      delta: "+8.1%",
      trend: "up" as Trend,
      spark: [180, 220, 210, 280, 260, 320, 300, 360, 340, 420],
    },
    {
      label: "Avg. Order Value",
      value: "USh 260K",
      delta: "-3.2%",
      trend: "down" as Trend,
      spark: [280, 275, 278, 270, 268, 262, 265, 258, 261, 260],
    },
    {
      label: "Conversion Rate",
      value: "3.9%",
      delta: "+0.6%",
      trend: "up" as Trend,
      spark: [3.1, 3.2, 3.0, 3.4, 3.3, 3.6, 3.5, 3.7, 3.8, 3.9],
    },
  ],
  revenueTrend: {
    months: [
      "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
      "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
    ],
    // Millions of USh.
    values: [4.2, 5.1, 6.8, 6.0, 7.2, 8.4, 7.1, 6.5, 7.8, 8.9, 9.6, 11.2],
  },
  ordersByMonth: {
    months: [
      "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
      "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
    ],
    values: [180, 220, 310, 280, 340, 420, 360, 300, 380, 440, 480, 560],
  },
  salesByCategory: [
    { name: "Computers", value: 38, color: "#1f3e97" },
    { name: "Phones, TV & Audio", value: 22, color: "#0e7490" },
    { name: "Printers & Office", value: 16, color: "#ff7a00" },
    { name: "Components & Power", value: 12, color: "#9f1239" },
    { name: "Networking", value: 7, color: "#7c3aed" },
    { name: "Accessories", value: 5, color: "#16a34a" },
  ] as Segment[],
  trafficSources: [
    { name: "Direct", value: 40, color: "#1f3e97" },
    { name: "Organic Search", value: 28, color: "#16a34a" },
    { name: "Social", value: 18, color: "#ff7a00" },
    { name: "Referral", value: 9, color: "#0e7490" },
    { name: "Email", value: 5, color: "#9f1239" },
  ] as Segment[],
};

// ---------------------------------------------------------------------------
// Products (priced in USD) + USD exchange rate
// ---------------------------------------------------------------------------

export const USD_RATE = {
  pair: "USD → UGX",
  value: 3780, // 1 USD in UGX
  prev: 3765,
  updated: "Today, 09:24",
};

export type ProductStatus = "Published" | "Draft" | "Out of stock";

export type AdminProduct = {
  id: string;
  name: string;
  sku: string;
  category: string;
  priceUsd: number;
  stock: number;
  status: ProductStatus;
  image: string;
};

export const ADMIN_PRODUCTS: AdminProduct[] = [
  { id: "hp-250-g9", name: "HP 250 G9 Laptop", sku: "MC-LAP-0091", category: "Laptops", priceUsd: 350, stock: 42, status: "Published", image: "/p-hp-250-g9.jpg" },
  { id: "lenovo-ideapad-1", name: "Lenovo IdeaPad 1", sku: "MC-LAP-0114", category: "Laptops", priceUsd: 357, stock: 18, status: "Published", image: "/p-lenovo-ideapad-1.jpg" },
  { id: "hp-deskjet-2320", name: "HP DeskJet 2320", sku: "MC-PRN-0032", category: "Printers", priceUsd: 49, stock: 76, status: "Published", image: "/p-hp-deskjet-2320.jpg" },
  { id: "dell-e2020h", name: "Dell E2020H Monitor", sku: "MC-MON-0025", category: "Monitors", priceUsd: 116, stock: 0, status: "Out of stock", image: "/p-dell-e2020h.jpg" },
  { id: "dell-optiplex-7020", name: "Dell OptiPlex 7020 MT", sku: "MC-DSK-0007", category: "Desktops", priceUsd: 694, stock: 9, status: "Published", image: "/p-dell-optiplex-7020.jpg" },
  { id: "hp-smart-tank-581", name: "HP Smart Tank 581", sku: "MC-PRN-0058", category: "Printers", priceUsd: 148, stock: 5, status: "Draft", image: "/p-hp-smart-tank-581.jpg" },
];

export const PRODUCT_CATEGORIES = [
  "All",
  "Laptops",
  "Desktops",
  "Monitors",
  "Printers",
  "Components",
  "Accessories",
];

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Completed"
  | "Cancelled";

export type AdminOrder = {
  id: string;
  customer: string;
  email: string;
  date: string;
  items: number;
  total: string;
  status: OrderStatus;
};

export const ORDER_SUMMARY = [
  { label: "Total Orders", value: "3,248" },
  { label: "Pending", value: "86" },
  { label: "Completed", value: "2,904" },
  { label: "Cancelled", value: "112" },
];

export const ADMIN_ORDERS: AdminOrder[] = [
  { id: "#MC-10428", customer: "Aisha Nakato", email: "aisha.n@example.com", date: "05 Jul 2026", items: 3, total: "USh 1.86M", status: "Completed" },
  { id: "#MC-10427", customer: "Daniel Okello", email: "daniel.o@example.com", date: "05 Jul 2026", items: 1, total: "USh 1.32M", status: "Processing" },
  { id: "#MC-10426", customer: "Grace Auma", email: "grace.a@example.com", date: "04 Jul 2026", items: 2, total: "USh 746K", status: "Pending" },
  { id: "#MC-10425", customer: "Samuel Mugisha", email: "samuel.m@example.com", date: "04 Jul 2026", items: 5, total: "USh 3.12M", status: "Completed" },
  { id: "#MC-10424", customer: "Brenda Achieng", email: "brenda.a@example.com", date: "03 Jul 2026", items: 1, total: "USh 437K", status: "Cancelled" },
  { id: "#MC-10423", customer: "Ivan Ssemwanga", email: "ivan.s@example.com", date: "03 Jul 2026", items: 2, total: "USh 1.12M", status: "Completed" },
  { id: "#MC-10422", customer: "Patricia Nabirye", email: "patricia.n@example.com", date: "02 Jul 2026", items: 4, total: "USh 2.24M", status: "Processing" },
  { id: "#MC-10421", customer: "Joseph Kato", email: "joseph.k@example.com", date: "02 Jul 2026", items: 1, total: "USh 560K", status: "Pending" },
];

// ---------------------------------------------------------------------------
// Website management (carousels, flash sales, site numbers)
// ---------------------------------------------------------------------------

export type CarouselSlide = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  active: boolean;
};

export type FlashSale = {
  id: string;
  product: string;
  image: string;
  discount: string;
  starts: string;
  ends: string;
  status: "Live" | "Scheduled" | "Ended";
};

export const WEBSITE = {
  carousel: [
    { id: "s1", title: "The new Mercury app is here", subtitle: "Shop tech on the go", image: "/hero-mercury-app.png", active: true },
    { id: "s2", title: "The smarter way to own premium tech", subtitle: "Laptops, desktops & more", image: "/hero-tech.png", active: true },
    { id: "s3", title: "Your next phone starts here", subtitle: "Premium phones, honest prices", image: "/hero-phones.png", active: false },
  ] as CarouselSlide[],
  flashSales: [
    { id: "f1", product: "HP 250 G9 Laptop", image: "/p-hp-250-g9.jpg", discount: "-15%", starts: "05 Jul", ends: "07 Jul", status: "Live" },
    { id: "f2", product: "HP Smart Tank 581", image: "/p-hp-smart-tank-581.jpg", discount: "-20%", starts: "08 Jul", ends: "10 Jul", status: "Scheduled" },
    { id: "f3", product: "Dell E2020H Monitor", image: "/p-dell-e2020h.jpg", discount: "-10%", starts: "28 Jun", ends: "30 Jun", status: "Ended" },
  ] as FlashSale[],
  siteStats: [
    { label: "Years Experience", value: "20+" },
    { label: "Happy Clients", value: "1000+" },
    { label: "Brand Partners", value: "50+" },
    { label: "Support", value: "24/7" },
  ],
};

// ---------------------------------------------------------------------------
// User tracking (wishlist, browsing, abandoned checkouts)
// ---------------------------------------------------------------------------

export type ActivityAction =
  | "Viewed product"
  | "Added to wishlist"
  | "Added to cart"
  | "Checked out";

export type UserActivity = {
  user: string;
  action: ActivityAction;
  product: string;
  time: string;
};

export const USER_TRACKING = {
  kpis: [
    { label: "Wishlist Saves", value: "1,284", delta: "+14%", trend: "up" as Trend },
    { label: "Abandoned Carts", value: "312", delta: "+6%", trend: "down" as Trend },
    { label: "Active Sessions", value: "486", delta: "+9%", trend: "up" as Trend },
    { label: "Avg. Items Viewed", value: "7.2", delta: "+2%", trend: "up" as Trend },
  ],
  activity: [
    { user: "Aisha Nakato", action: "Added to wishlist", product: "HP 250 G9 Laptop", time: "2 min ago" },
    { user: "Daniel Okello", action: "Checked out", product: "Dell OptiPlex 7020 MT", time: "8 min ago" },
    { user: "Grace Auma", action: "Added to cart", product: "HP Smart Tank 581", time: "15 min ago" },
    { user: "Samuel Mugisha", action: "Viewed product", product: "Lenovo IdeaPad 1", time: "23 min ago" },
    { user: "Brenda Achieng", action: "Added to wishlist", product: "Dell E2020H Monitor", time: "31 min ago" },
    { user: "Ivan Ssemwanga", action: "Viewed product", product: "HP DeskJet 2320", time: "47 min ago" },
  ] as UserActivity[],
  mostWishlisted: [
    { name: "HP 250 G9 Laptop", image: "/p-hp-250-g9.jpg", count: 342 },
    { name: "Lenovo IdeaPad 1", image: "/p-lenovo-ideapad-1.jpg", count: 289 },
    { name: "Dell OptiPlex 7020 MT", image: "/p-dell-optiplex-7020.jpg", count: 176 },
    { name: "HP Smart Tank 581", image: "/p-hp-smart-tank-581.jpg", count: 148 },
  ],
  abandonedCheckouts: [
    { user: "Patricia Nabirye", items: 3, value: "USh 1.86M", step: "Payment" },
    { user: "Joseph Kato", items: 1, value: "USh 560K", step: "Shipping" },
    { user: "Mercy Atim", items: 2, value: "USh 874K", step: "Cart review" },
  ],
};
