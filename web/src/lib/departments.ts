export type Department = {
  label: string;
  href: string;
  children: { name: string; href: string }[];
};

/**
 * The client's focused 6 departments. Hrefs point at the re-tagged taxonomy:
 * each product now carries categoryId ∈ {laptops, desktops, printers-office,
 * networking-security, ups-power, software, other}. Subcategory hrefs use the
 * slugified product `category` value so /category/<dept>/<sub> resolves.
 */
export const DEPARTMENTS: Department[] = [
  {
    label: "Laptops",
    href: "/category/laptops",
    children: [
      { name: "Lenovo Laptops", href: "/category/laptops/lenovo-laptops" },
      { name: "HP Laptops", href: "/category/laptops/hp-laptops" },
      { name: "Dell Laptops", href: "/category/laptops/dell-laptops" },
      { name: "Business Laptops", href: "/category/laptops/business-laptops" },
      { name: "Gaming Laptops", href: "/category/laptops/gaming-laptops" },
    ],
  },
  {
    label: "Desktops",
    href: "/category/desktops",
    children: [
      { name: "Desktops", href: "/category/desktops/desktops" },
      { name: "Dell Desktops", href: "/category/desktops/dell-desktops" },
      { name: "HP Desktops", href: "/category/desktops/hp-desktops" },
      { name: "Monitors", href: "/category/desktops/monitors" },
    ],
  },
  {
    label: "Printers & Office",
    href: "/category/printers-office",
    children: [
      { name: "Ink Tank Printers", href: "/category/printers-office/ink-tank-printers" },
      { name: "Laser Printers", href: "/category/printers-office/a4-black-white-laser-printers" },
      { name: "HP Toner Cartridges", href: "/category/printers-office/hp-toner-cartridges" },
      { name: "Scanners", href: "/category/printers-office/scanners" },
    ],
  },
  {
    label: "Networking & Security",
    href: "/category/networking-security",
    children: [
      { name: "Routers", href: "/category/networking-security/routers" },
      { name: "Switches", href: "/category/networking-security/switches" },
      { name: "Hikvision Cameras", href: "/category/networking-security/hikvision-cameras" },
      { name: "Wi-Fi Adapters", href: "/category/networking-security/wi-fi-adapters" },
    ],
  },
  {
    label: "UPS & Power",
    href: "/category/ups-power",
    children: [
      { name: "APC UPS", href: "/category/ups-power/apc-ups" },
      { name: "APC Smart UPS", href: "/category/ups-power/apc-smart-ups" },
      { name: "Giganet UPS", href: "/category/ups-power/giganet-ups" },
      { name: "UPS Battery", href: "/category/ups-power/ups-battery" },
    ],
  },
  {
    label: "Software",
    href: "/category/software",
    children: [
      { name: "Microsoft 365 Family", href: "/category/software/microsoft-365-family" },
      { name: "Computer Software", href: "/category/software/computer-software" },
      { name: "Software", href: "/category/software/software" },
    ],
  },
];
