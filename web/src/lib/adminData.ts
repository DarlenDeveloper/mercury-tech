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
