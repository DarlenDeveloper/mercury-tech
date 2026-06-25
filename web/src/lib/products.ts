export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number; // Ugandan Shillings
  oldPrice?: number;
  rating: number;
  reviews: string;
  image: string;
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
  },
];

/// Formats an amount in Ugandan Shillings, e.g. 1323000 -> "USh 1,323,000".
export function formatUgx(amount: number): string {
  return `USh ${amount.toLocaleString("en-US")}`;
}
