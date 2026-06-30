export type Category = {
  name: string;
  image: string;
  count: number;
};

/// Top categories ported from the mobile app's shop screen
/// (mercury mobile/lib/data/categories.dart). Images are the same
/// category photos used in the app, copied into /public.
/// `count` is the number of real subcategories (excluding the "All" tab).
export const CATEGORIES: Category[] = [
  { name: "Computers", image: "/cat-computers.jpeg", count: 5 },
  { name: "Printers & Office", image: "/cat-office.jpeg", count: 4 },
  { name: "Components & Power", image: "/cat-components.jpeg", count: 5 },
  { name: "Networking & Security", image: "/cat-networking.jpeg", count: 4 },
  { name: "Phones, TV & Audio", image: "/cat-phones.jpeg", count: 4 },
  { name: "Accessories", image: "/cat-accessories.jpeg", count: 4 },
];
