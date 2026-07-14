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

/// Full category taxonomy mapped to actual product data from the old site.
/// `children` are the subcategories that match the `category` field in Firestore.
export const CATEGORIES: Category[] = [
  {
    name: "Computers",
    slug: "computers",
    image: "/cat-computers.jpeg",
    children: [
      sub("Lenovo Laptops", "lenovo-laptops"),
      sub("HP Laptops", "hp-laptops"),
      sub("Dell Laptops", "dell-laptops"),
      sub("Business Laptops", "business-laptops"),
      sub("Gaming Laptops", "gaming-laptops"),
      sub("2-in-1 Laptops", "2-in-1-laptops"),
      sub("Desktops", "desktops"),
      sub("Dell Desktops", "dell-desktops"),
      sub("HP Desktops", "hp-desktops"),
      sub("Monitors", "monitors"),
      sub("Samsung Tablets", "samsung-tablets"),
      sub("Servers", "servers"),
    ],
  },
  {
    name: "Printers & Office",
    slug: "printers-office",
    image: "/cat-office.jpeg",
    children: [
      sub("All-in-One Printers", "multifunction-all-in-one-printers"),
      sub("Ink Tank Printers", "ink-tank-printers"),
      sub("Laser Printers", "a4-black-white-laser-printers"),
      sub("Color Laser Printers", "color-laser-multifunction-printers"),
      sub("Photo Printers", "photo-printers"),
      sub("HP Toner Cartridges", "hp-toner-cartridges"),
      sub("Compatible Toner", "compatible-toner-cartridge"),
      sub("HP Ink Cartridges", "hp-ink-cartridges"),
      sub("Scanners", "hp-scanners"),
      sub("Paper Shredders", "rexel-paper-shredders"),
      sub("Money Counting Machines", "money-counting-machines"),
    ],
  },
  {
    name: "Components & Power",
    slug: "components-power",
    image: "/cat-components.jpeg",
    children: [
      sub("APC UPS", "apc-ups"),
      sub("APC Smart UPS", "apc-smart-ups"),
      sub("APC Easy UPS", "apc-easy-ups"),
      sub("Giganet UPS", "giganet-ups"),
      sub("Laptop RAM", "laptop-ram"),
      sub("Portable SSD", "portable-ssd"),
      sub("Storage", "storage"),
    ],
  },
  {
    name: "Networking & Security",
    slug: "networking-security",
    image: "/cat-networking.jpeg",
    children: [
      sub("Networking", "networking"),
      sub("Routers", "routers"),
      sub("4G Routers", "4g-routers"),
      sub("Switches", "switches"),
      sub("Hikvision Cameras", "hikvision-cameras"),
      sub("Bullet Cameras", "bullet-cameras"),
      sub("Security Systems", "security-systems"),
      sub("Wi-Fi Adapters", "wi-fi-adapters"),
    ],
  },
  {
    name: "Phones, TV & Audio",
    slug: "phones-tv-audio",
    image: "/cat-phones.jpeg",
    children: [
      sub("Apple iPhone", "apple-iphone"),
      sub("Nokia Phones", "nokia-phones"),
      sub("Smart TV", "smart-tv"),
      sub("Headphones", "headphones"),
      sub("Headsets", "headsets"),
      sub("Jabra Headsets", "jabra-headsets"),
      sub("Speakers", "speakers"),
      sub("Conference Cameras", "conference-camera"),
      sub("Projectors", "epson-projector"),
    ],
  },
  {
    name: "Accessories",
    slug: "accessories",
    image: "/cat-accessories.jpeg",
    children: [
      sub("Accessories", "accessories"),
      sub("Webcams", "webcams"),
      sub("Wireless Mouse", "wireless-mouse"),
      sub("Laptop Chargers", "laptop-chargers"),
      sub("Gaming Consoles", "gaming-consoles"),
      sub("Computer Software", "computer-software"),
      sub("Microsoft Licensing", "microsoft-365-family"),
    ],
  },
];
